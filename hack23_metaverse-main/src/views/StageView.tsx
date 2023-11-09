import "../App.css";
import { useEffect, useState, useRef } from "react";
import { v4 as uuid } from "uuid";
import * as GUI from "@babylonjs/gui/2D";
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders/glTF/2.0/glTFLoader";
import SceneComponent from "babylonjs-hook";
import { LiveShareHost, app } from "@microsoft/teams-js";
import { LiveState, ILiveShareJoinResults, LiveShareClient, TestLiveShareHost } from "@microsoft/live-share";
import { InkingManager, LiveCanvas, InkingTool, fromCssColor } from "@microsoft/live-share-canvas";
import { ContainerSchema, IFluidContainer, IValueChanged, SharedMap, } from "fluid-framework";
import { IRepositoryService, LocalStorageRepositoryService, } from "../services/RepositoryService";
import { CreateStage, CreateButton, CreateInput, ImportGlbAsync } from "../services/BabylonHelper";
import { MeshData } from "../models/MeshData";
import { CameraControlInfo, DragInfo, RotateInfo, SyncActionType } from "../models/SyncInfo";
import { Inspector } from "@babylonjs/inspector";

const inTeams = new URL(window.location.href).searchParams.get("inTeams") === "1";

export const StageView = (): JSX.Element => {
  const [container, setContainer] = useState<IFluidContainer>();
  const [scene, setScene] = useState<BABYLON.Scene>();

  const containerSchema: ContainerSchema = {
    initialObjects: {
      meshSharedMap: SharedMap,
      cameraSharedMap: SharedMap,
      takeControl: LiveState,
      liveCanvas: LiveCanvas,
      toggleInking: LiveState,
    },
  };

  const initializeStartedRef = useRef(false);
  const repository: IRepositoryService = new LocalStorageRepositoryService();
  let meshDataList: MeshData[] = []; // Store mesh data for the repository
  let camera: BABYLON.ArcRotateCamera;
  let highlight: BABYLON.HighlightLayer;
  let ground: BABYLON.GroundMesh;
  let canvas: BABYLON.Nullable<HTMLCanvasElement>;
  let currentMesh: BABYLON.Nullable<BABYLON.AbstractMesh> = null;
  let removeButton: GUI.Button;
  let memoButton: GUI.Button;
  let closeMemoButton: GUI.Button;
  let memoInput: GUI.InputText;
  let meshSharedMap: SharedMap;
  const updateFrequencies: number = 100;
  const framesToCompensate: number = 1 + updateFrequencies / (1000 / 60);
  let cameraSharedMap: SharedMap;
  let takeControl: LiveState;
  let takeCamControlButton: HTMLButtonElement;
  let remoteControlled: boolean;
  let currentCameraPosition: BABYLON.Vector3;
  let currentCameraRotation: BABYLON.Vector3;
  let takingControl: boolean;
  let lastTime: number;
  let liveCanvas: LiveCanvas;
  let color: HTMLInputElement;
  let inkingButton: HTMLButtonElement;
  let inkingHostElement: HTMLDivElement;
  let inkingManager: InkingManager;
  let inkingEnabled: boolean;
  let toggleInking: LiveState;

  useEffect(() => {
    if (initializeStartedRef.current) return;
    initializeStartedRef.current = true;
    const initialize = async () => {
      try {
        await app.initialize();
        app.notifyAppLoaded();
        app.notifySuccess();
        console.log("StageView.tsx: initializing client SDK initialized");
      } catch (error) {
        console.error(error);
      }
    };

    const joinContainer = async () => {
      const host = inTeams ? LiveShareHost.create() : TestLiveShareHost.create();
      const client = new LiveShareClient(host);
      let item: ILiveShareJoinResults = await client.joinContainer(containerSchema);
      setContainer(item.container);
    }

    console.log("StageView.tsx: initializing client SDK");
    if (inTeams) initialize().then(() => joinContainer());
    else joinContainer();
  });

  const onSceneReady = (scene: BABYLON.Scene) => {
    setScene(scene);
    // Uncomment the following to show the BabylonJS Inspector.
    //Inspector.Show(scene, {});

    const stage = CreateStage(scene);
    highlight = stage.highlight;
    camera = stage.camera;
    ground = stage.ground;
    canvas = stage.canvas;

    if (meshDataList.length === 0) meshDataList = repository.getData("meshes");
    console.log("StageView.tsx: initializing mesh data");
    meshDataList?.map((meshData: MeshData) => CreateMeshAsync(scene, meshData));

    AddUIControl(scene);
    SetupPointerBehavior(scene);
    SetupMouseWheelBehavior();

    // setup to synchronize between clients
    meshSharedMap = container!.initialObjects.meshSharedMap as SharedMap;
    meshSharedMap.on("valueChanged", (changed: IValueChanged, local: boolean) => {
      if (!local) {
        SyncMesh(scene, changed, meshSharedMap);
      }
    });

    InitializeControls(scene).then(() => {
      initializePresenceLogic(scene).then(() => { });
    });
  }

  const onRender = (scene: BABYLON.Scene) => {
  };

  // Create a mesh and update list and repository data.
  async function CreateMeshAndUpateRepoAsync(scene: BABYLON.Scene, meshData: MeshData) {
    await CreateMeshAsync(scene, meshData)
    meshDataList.push(meshData);
    repository.setData("meshes", meshDataList);
  }

  // Create a pointer drag behavior for the mesh.
  function GetPointerBehavior(): BABYLON.PointerDragBehavior {
    let pointerDragBehavior = new BABYLON.PointerDragBehavior({
      dragPlaneNormal: new BABYLON.Vector3(0, 1, 0), // meshes should be draggable for X and Z axies only.
    });

    pointerDragBehavior.onDragObservable.add((event) => {
      // propagete the position change to other clients
      meshSharedMap.set(
        `${SyncActionType.Drag}_${currentMesh!.name}`,
        new DragInfo(currentMesh!.name, currentMesh!.position.x, currentMesh!.position.z)
      );
    });

    pointerDragBehavior.onDragEndObservable.add((event) => {
      // When the drag ends, we save it's location.
      meshDataList.some((mesh: MeshData) => {
        if (mesh.name === currentMesh!.name) {
          mesh.position.x = currentMesh!.position.x;
          mesh.position.y = currentMesh!.position.y;
          mesh.position.z = currentMesh!.position.z;
          repository.setData("meshes", meshDataList);
          return true;
        }
        return false;
      });
      // propagete the position change to other clients
      meshSharedMap.set(
        `${SyncActionType.DragEnd}_${currentMesh!.name}`,
        new DragInfo(currentMesh!.name, currentMesh!.position.x, currentMesh!.position.z),
      );
    });
    return pointerDragBehavior;
  }

  // Create a mesh from the glb file and the initial values
  async function CreateMeshAsync(scene: BABYLON.Scene, meshData: MeshData) {
    let mesh = await ImportGlbAsync(`${meshData.type}.glb`, scene);
    mesh.name = meshData.name;
    mesh.parent = null;
    mesh.scaling = new BABYLON.Vector3(meshData.scale.x, meshData.scale.y, meshData.scale.z);
    mesh.position = new BABYLON.Vector3(meshData.position.x, meshData.position.y, meshData.position.z);
    mesh.reIntegrateRotationIntoRotationQuaternion = true;  // rotationQuaternion is by default for glb
    mesh.rotate(BABYLON.Axis.Y, meshData.rotation.y, BABYLON.Space.WORLD);
    mesh.rotation = mesh.rotationQuaternion!.toEulerAngles(); // Assign current rotation.
    mesh.addBehavior(GetPointerBehavior());

    return mesh;
  }

  // Sync mesh data between clients if in Teams.
  function SyncMesh(
    scene: BABYLON.Scene,
    changed: IValueChanged,
    meshSharedMap: SharedMap
  ) {
    // Sync mesh action between clients.
    if (changed.key.startsWith(SyncActionType.Add.toString())) {
      let changedMeshData = meshSharedMap.get(changed.key) as MeshData;
      let meshData = meshDataList.find((meshData: MeshData) => changedMeshData.name === meshData.name);
      if (meshData !== undefined) return;
      CreateMeshAndUpateRepoAsync(scene, meshSharedMap.get(changed.key) as MeshData);
    } else if (changed.key.startsWith(SyncActionType.Remove.toString())) {
      meshDataList.some((mesh: any, index: number) => {
        if (mesh.name === (meshSharedMap.get(changed.key) as string)) {
          meshDataList.splice(index, 1);
          repository.setData("meshes", meshDataList);
          let removedMesh = scene.getMeshByName(meshSharedMap.get(changed.key) as string);
          if (removedMesh !== null) {
            removedMesh.dispose();
            if (currentMesh && removedMesh.name === currentMesh.name) {
              removeButton.isVisible = memoButton.isVisible = closeMemoButton.isVisible = memoInput.isVisible = false;
            }
          }
          return true;
        }
        return false;
      });
    } else if (changed.key.startsWith(SyncActionType.UpdateMemo.toString())) {
      let meshData = meshDataList.find((meshData: MeshData) => meshSharedMap.get(changed.key).name === meshData.name);
      if (meshData !== undefined) meshData!.memo = meshSharedMap.get(changed.key).memo;
    } else if (changed.key.startsWith(SyncActionType.Drag.toString())) {
      let dragLocation: DragInfo = meshSharedMap.get(changed.key) as DragInfo;
      let meshData = meshDataList.find((meshData: MeshData) => meshSharedMap.get(changed.key).name === meshData.name);
      if (meshData !== undefined) {
        meshData!.position.x = dragLocation.x;
        meshData!.position.z = dragLocation.z;
      }
      let mesh = scene.getMeshByName(meshSharedMap.get(changed.key).name);
      if (mesh !== null) {
        mesh!.position.x = dragLocation.x;
        mesh!.position.z = dragLocation.z;
      }
      if (changed.key.startsWith(SyncActionType.DragEnd.toString())) {
        repository.setData("meshes", meshDataList);
      }
    } else if (changed.key.startsWith(SyncActionType.Rotate.toString())) {
      let rotateInfo: RotateInfo = meshSharedMap.get(changed.key) as RotateInfo;
      let meshData = meshDataList.find((meshData: MeshData) => meshSharedMap.get(changed.key).name === meshData.name);
      if (meshData !== undefined) meshData!.rotation.y = rotateInfo.y;
      repository.setData("meshes", meshDataList);
      let mesh = scene.getMeshByName(meshSharedMap.get(changed.key).name);
      if (mesh !== null) mesh!.rotation.y = rotateInfo.y;
    }
  }

  // Add Babylon GUI controls.
  function AddUIControl(scene: BABYLON.Scene) {
    const advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    // Add table button
    const addTableButton = CreateButton("addTableButton", "Add Table", "100px", "20px", true, { top: "10px", left: "10px" });
    addTableButton.onPointerClickObservable.add(async () => {
      let name = uuid();
      let newMesh = new MeshData(
        name,
        "table",
        { x: 0, y: 0, z: 0 }, // position
        { x: 2, y: 2, z: 2 }, // scale
        { x: 0, y: 0, z: 0 }, // rotation
        "This is table-" + name
      );

      await CreateMeshAndUpateRepoAsync(scene, newMesh);
      meshSharedMap.set(`${SyncActionType.Add}_${newMesh.name}`, newMesh);
    });

    // Add chair button
    const addChairButton = CreateButton("addChairButton", "Add Chair", "100px", "20px", true, { top: "30px", left: "10px" });
    addChairButton.onPointerClickObservable.add(async () => {
      let name = uuid();
      let newMesh = new MeshData(
        name,
        "chair",
        { x: 0, y: 0, z: 0 }, // position
        { x: 2, y: 2, z: 2 }, // scale
        { x: 0, y: 0, z: 0 }, // rotation
        "This is chair-" + name
      );
      await CreateMeshAndUpateRepoAsync(scene, newMesh);
      meshSharedMap.set(`${SyncActionType.Add}_${newMesh.name}`, newMesh);
    });

    // Remove All Button
    const removeAllButton = CreateButton("removeAllButton", "Remove All", "100px", "20px", true, { top: "50px", left: "10px" });
    removeAllButton.onPointerClickObservable.add(async () => {
      removeButton.isVisible = memoButton.isVisible = closeMemoButton.isVisible = memoInput.isVisible = false;
      meshDataList.forEach((meshData: MeshData) => {
        scene.getMeshByName(meshData.name)?.dispose();
        meshSharedMap.set(`${SyncActionType.Remove}_${meshData.name}`, meshData.name);
      });
      meshDataList = [];
      repository.setData("meshes", meshDataList);
    });

    // Remove Button
    removeButton = CreateButton("removeButton", "Remove", "50px", "20px", false, null, { x: 50, y: -20 });
    removeButton.onPointerClickObservable.add(() => {
      currentMesh?.dispose();
      removeButton.isVisible = memoButton.isVisible = closeMemoButton.isVisible = memoInput.isVisible = false;
      meshDataList.some((mesh: any, index: number) => {
        if (mesh.name === currentMesh!.name) {
          meshDataList.splice(index, 1);
          repository.setData("meshes", meshDataList);
          meshSharedMap.set(`${SyncActionType.Remove}_${mesh.name}`, mesh.name);
          return true;
        }
        return false;
      });
    });

    // Create Memo Buttom
    memoButton = CreateButton("memoButton", "Memo", "50px", "20px", false, null, { x: 50, y: 0 });
    memoButton.onPointerClickObservable.add(() => memoInput.isVisible = closeMemoButton.isVisible = true);

    // Create Memo Buttom
    closeMemoButton = CreateButton("closeMemoButton", "Close", "50px", "20px", false, null, { x: 50, y: 0 });
    closeMemoButton.onPointerClickObservable.add(() => memoInput.isVisible = closeMemoButton.isVisible = false);

    // Memo Input Text Field
    memoInput = CreateInput();
    memoInput.onBlurObservable.add((value) => {
      let meshData = meshDataList.find((meshData: MeshData) => meshData.name === currentMesh!.name);
      if (meshData !== undefined && meshData.name === currentMesh!.name) {
        meshData.memo = value.text;
        repository.setData("meshes", meshDataList);
        meshSharedMap.set(`${SyncActionType.UpdateMemo}_${meshData.name}`, {
          name: meshData.name,
          memo: value.text,
        });
      }
    });

    advancedTexture.addControl(addTableButton);
    advancedTexture.addControl(addChairButton);
    advancedTexture.addControl(removeAllButton);
    advancedTexture.addControl(removeButton);
    advancedTexture.addControl(memoButton);
    advancedTexture.addControl(closeMemoButton);
    advancedTexture.addControl(memoInput);
  }

  // Setup mouse control behaviors when selecting a mesh or ground.
  function SetupPointerBehavior(scene: BABYLON.Scene) {
    let startingPoint: BABYLON.Nullable<BABYLON.Vector3>;

    let getGroundPosition = () => {
      let pickinfo = scene.pick(scene.pointerX, scene.pointerY, (mesh) => mesh === ground);
      if (pickinfo.hit) return pickinfo.pickedPoint;
      return null;
    };

    let pointerDownOnMesh = (mesh: BABYLON.Nullable<BABYLON.AbstractMesh>) => {
      // When selecting a mesh, remove the mouse wheel behavior from the camera.
      camera.inputs.removeByType("ArcRotateCameraMouseWheelInput");
      highlight.removeAllMeshes();
      highlight.addMesh(mesh as BABYLON.Mesh, BABYLON.Color3.Green());
      currentMesh = mesh;
      removeButton.linkWithMesh(currentMesh as BABYLON.Mesh);
      memoButton.linkWithMesh(currentMesh as BABYLON.Mesh);
      closeMemoButton.linkWithMesh(currentMesh as BABYLON.Mesh);
      memoInput.linkWithMesh(currentMesh as BABYLON.Mesh);
      removeButton.isVisible = memoButton.isVisible = true;
      memoInput.isVisible = closeMemoButton.isVisible = false;
      let meshData = meshDataList.find((meshData: MeshData) => meshData.name === currentMesh!.name);
      if (meshData !== undefined) memoInput.text = meshData.memo;

      startingPoint = getGroundPosition();
      if (startingPoint) {
        setTimeout(() => {
          camera.detachControl();
        }, 0);
      }
    };

    // When selecting the ground.
    let pointerDownOnGround = () => {
      highlight.removeAllMeshes();
      currentMesh = null;
      camera.inputs.addMouseWheel();
      removeButton.isVisible = memoButton.isVisible = closeMemoButton.isVisible = memoInput.isVisible = false;
    };

    let pointerUp = () => {
      if (startingPoint) {
        camera.attachControl(canvas, true);
        startingPoint = null;
        return;
      }
    };

    let pointerMove = () => {
      if (!startingPoint) return;
      let current = getGroundPosition();
      if (!current) return;
      let diff = current.subtract(startingPoint);
      currentMesh!.position.addInPlace(diff);
      startingPoint = current;
    };

    scene.onPointerObservable.add((pointerInfo: BABYLON.PointerInfo) => {
      switch (pointerInfo.type) {
        case BABYLON.PointerEventTypes.POINTERDOWN:
          if (pointerInfo.pickInfo!.hit && pointerInfo.pickInfo!.pickedMesh !== ground) {
            pointerDownOnMesh(pointerInfo.pickInfo!.pickedMesh);
          } else {
            pointerDownOnGround();
          }
          break;
        case BABYLON.PointerEventTypes.POINTERUP:
          pointerUp();
          break;
        case BABYLON.PointerEventTypes.POINTERMOVE:
          pointerMove();
          break;
      }
    });
  }

  // Setup mouse wheel behavior for camera and the selected mesh.
  function SetupMouseWheelBehavior() {
    window.addEventListener("wheel", (event) => {
      if (currentMesh !== null) {
        let delta = Math.sign(event.deltaY);
        (currentMesh as BABYLON.Mesh).rotate(BABYLON.Axis.Y, delta * 0.1, BABYLON.Space.WORLD);
        currentMesh.rotation = currentMesh.rotationQuaternion!.toEulerAngles();
        let meshData = meshDataList.find((meshData: MeshData) => meshData.name === currentMesh!.name);
        if (meshData !== undefined && meshData.name === currentMesh!.name) {
          meshData.rotation.y = currentMesh!.rotation.y;
          repository.setData("meshes", meshDataList);
        }
        meshSharedMap.set(
          `${SyncActionType.Rotate}_${currentMesh!.name}`,
          new RotateInfo(currentMesh!.name, currentMesh!.rotation.y,)
        );
      }
    });
  }

  // Use presence to share camera location info
  async function initializePresenceLogic(scene: BABYLON.Scene) {
    cameraSharedMap = container!.initialObjects.cameraSharedMap as SharedMap;
    liveCanvas = container!.initialObjects.liveCanvas as LiveCanvas;
    cameraSharedMap.on("valueChanged", (changed: IValueChanged, local: boolean) => {
      if (!local) {
        let cameraConrolInfo: CameraControlInfo = cameraSharedMap.get(changed.key) as CameraControlInfo;
        if (remoteControlled) {
          let localCamera = scene.activeCamera as BABYLON.ArcRotateCamera;
          BABYLON.Animation.CreateAndStartAnimation("camerapos",
            scene.activeCamera,
            "position", 60, framesToCompensate,
            localCamera.position,
            new BABYLON.Vector3(cameraConrolInfo.cameraPosition._x, cameraConrolInfo.cameraPosition._y - 0.7, cameraConrolInfo.cameraPosition._z), 0);

          BABYLON.Animation.CreateAndStartAnimation("camerarot",
            scene.activeCamera,
            "rotation", 60, framesToCompensate,
            localCamera.rotation,
            new BABYLON.Vector3(cameraConrolInfo.cameraPosition._x, cameraConrolInfo.cameraPosition._y, cameraConrolInfo.cameraPosition._z), 0);
        }
      }
    });

    takeControl = container!.initialObjects.takeControl as LiveState;
    takeControl.on("stateChanged", (status, local) => {
      if (!local) {
        takeCamControlButton.disabled = status;
        remoteControlled = status;

        let localCamera = scene.activeCamera as BABYLON.ArcRotateCamera;
        if (remoteControlled) {
          currentCameraPosition = localCamera.position.clone();
          currentCameraRotation = localCamera.rotation.clone();
          localCamera.detachControl();
        }
        else {
          localCamera.position = currentCameraPosition;
          localCamera.rotation = currentCameraRotation;
          localCamera.attachControl();
        }
      }
    });
    (async () => { await takeControl.initialize(false) })();
    toggleInking = container!.initialObjects.toggleInking as LiveState;
    toggleInking.on("stateChanged", (status, local) => {
      if (status !== inkingEnabled) {
        displayCanvasHostElement();
        inkingEnabled = status;
      }
    });
    (async () => { await toggleInking.initialize(false) })();
    lastTime = new Date().getTime();
    let localCamera = scene.activeCamera as BABYLON.ArcRotateCamera;
    localCamera.onViewMatrixChangedObservable.add(async () => {
      if (!remoteControlled && new Date().getTime() - lastTime >= updateFrequencies) {
        let data = new CameraControlInfo(localCamera.position, localCamera.rotation);
        await cameraSharedMap.set(SyncActionType.CameraMove.toString(), data);
        lastTime = new Date().getTime();
      }
    });

    liveCanvas.isCursorShared = true;
  }

  async function InitializeControls(scene: BABYLON.Scene) {
    liveCanvas = container!.initialObjects.liveCanvas as LiveCanvas;
    inkingHostElement = document.getElementById("inkingHost") as HTMLDivElement;
    inkingManager = new InkingManager(inkingHostElement);
    (async () => { await liveCanvas.initialize(inkingManager) })();
    inkingManager.activate();
    inkingHostElement.style.display = "none";

    takeCamControlButton = document.getElementById("takeCamControl") as HTMLButtonElement;
    takeCamControlButton.onclick = () => {
      takingControl = !takingControl;
      takeControl.set(takingControl);
      takeCamControlButton.innerHTML = takingControl ? "Release Camera Control" : "Take Camera Control";
      inkingButton.disabled = !takingControl;
      if (!takingControl && inkingEnabled) {
        inkingButton.click();
      }
    };

    inkingButton = document.getElementById("toggleInking") as HTMLButtonElement;
    inkingButton.disabled = true;
    inkingButton.onclick = () => {
      let localCamera = scene.activeCamera as BABYLON.ArcRotateCamera;

      inkingEnabled = !inkingEnabled;
      toggleInking!.set(inkingEnabled);
      if (inkingEnabled) {
        localCamera.detachControl();
      }
      else {
        localCamera.attachControl();
      }
      inkingButton.innerHTML = inkingEnabled ? "Stop Inking" : "Start Inking";
      displayCanvasHostElement();
    };

    // Change the selected color for pen
    color = document.getElementById("color") as HTMLInputElement;
    color.onchange = () => {
      inkingManager.penBrush.color = fromCssColor(color!.value);
    };
  }

  function displayCanvasHostElement() {
    inkingManager.clear();
    inkingHostElement.style.display = inkingHostElement.style.display === "none" ? "block" : "none";
  }

  return (
    <div className="App">
      {container ? (
        <div id="appRoot">
          <div id="inkingHost"></div>
          <SceneComponent
            antialias
            onSceneReady={onSceneReady}
            onRender={onRender}
            id="renderCanvas"
          />
          <div id="controlButtons">
            <button id="takeCamControl">Take Camera Control</button>
            <button id="toggleInking">Start Inking</button>
            <label htmlFor="pen-color">Select a color:</label>
            <input type="color" id="color" name="color" defaultValue="#000000" />
          </div>
        </div>
      ) : (<div></div>)}
    </div>
  );
};
