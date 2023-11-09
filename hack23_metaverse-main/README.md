<div align="center">
<h1 align="center">
<img src="https://raw.githubusercontent.com/PKief/vscode-material-icon-theme/ec559a9f6bfd399b82bb44393651661b08aaf7ba/icons/folder-markdown-open.svg" width="100" />
<br>Virtual Event Management - Teams Live SDK Sample
</h1>
<h3>◦ Unlocking the limitless digital realm</h3>
<h3>◦ Developed with the software and tools below.</h3>

<p align="center">
<img src="https://img.shields.io/badge/React-20232A.svg?style=logo&logo=react&logoColor=61DAFB" alt="React" />
<img src="https://img.shields.io/badge/Microsoft_Teams-6264A7.svg?style=logo&logo=microsoft-teams&logoColor=white" alt="Teams" />
<img src="https://img.shields.io/badge/TypeScript-007ACC?style&logo=TypeScript&logoColor=white" alt="TypeScript" />
<img src="https://img.shields.io/badge/JSON-000000.svg?style&logo=JSON&logoColor=white" alt="JSON" />
<img src="https://img.shields.io/badge/Markdown-000000.svg?style&logo=Markdown&logoColor=white" alt="Markdown" />

</p>
<img src="https://img.shields.io/github/languages/top/kenakamu/hack23_metaverse_pub?style&color=5D6D7E" alt="GitHub top language" />
<img src="https://img.shields.io/github/languages/code-size/kenakamu/hack23_metaverse_pub?style&color=5D6D7E" alt="GitHub code size in bytes" />
<img src="https://img.shields.io/github/commit-activity/m/kenakamu/hack23_metaverse_pub?style&color=5D6D7E" alt="GitHub commit activity" />
<img src="https://img.shields.io/github/license/kenakamu/hack23_metaverse_pub?style&color=5D6D7E" alt="GitHub license" />
</div>

---

## 📖 Table of Contents
- [📖 Table of Contents](#-table-of-contents)
- [📍 Overview](#-overview)
- [📦 Features](#-features)
- [📂 Repository Structure](#-repository-structure)
- [⚙️ Modules](#modules)
- [🚀 Getting Started](#-getting-started)
    - [🔧 Installation](#-installation)
    - [🤖 Testing the app in Teams](#-testing-the-app-in-teams)
- [🛣 Roadmap](#-roadmap)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [👏 Acknowledgments and References](#-acknowledgments-and-references)

---


## 📍 Overview

The virtual event management project is a Microsoft Teams meeting application built using React, Microsoft Teams Live SDK and Babylon.js that allows users to create and manipulate 3D models (tables and chairs) in a collaborative environment. The project provides features like drag, rotate, and sync actions for tables and chairs, camera control, and real-time collaboration using the Microsoft Teams Live SDK and Fluid Framework. Its value proposition lies in enabling users to easily create and work with 3D models, facilitating collaboration between multiple users, and providing a seamless and interactive user experience.

![image](./assets/image.png)

---

## 📦 Features

| | Feature | Description |
|---|---|---|
| ⚙️ | **Architecture** | The codebase follows a modular architecture, organizing the different functionalities into separate components. The codebase utilizes React for the front-end and Babylon.js for 3D rendering and manipulation. It also integrates with Microsoft Teams SDK for Teams Meeting-specific functionality. The architecture allows for flexibility and maintainability. |
| 📄 | **Documentation** | The project contains documentation for individual files, providing a basic understanding of their purpose and functionality. However, the overall documentation could be improved to provide more comprehensive explanations and guide the developers through the codebase more effectively. |
| 🔗 | **Dependencies** | The project relies on external libraries such as React, Babylon.js, and Microsoft Teams SDK. These libraries provide the necessary functionalities for rendering, interaction, and integration with Teams. Managing and updating these dependencies is crucial for maintaining the project's compatibility and effectiveness with future updates. |
| 🧩 | **Modularity** | The codebase uses a modular approach, dividing different views, services, models, and components into separate files or directories. This organization contributes to better maintainability, reusability, and testability of the code. The clear separation of concerns allows for easier development and enhancement of specific functionalities. |
| 🧪 | **Testing** | The project does not include any tests for now |
| 🔐 | **Security** | The codebase does not directly address security measures. However, by using Microsoft Teams and its SDK, we secure the infrastructure, network and user privileges. It is still important to ensure best practices for validating user inputs, and implementing proper access controls for APIs and database interactions. Implementing such security measures is essential to protect users' data and prevent unauthorized access or attacks. |
| 🔀 | **Version Control** | The codebase utilizes Git for version control, providing version history, branching, and collaborative features. Although a public GitHub repository is used, a dedicated branching strategy and pull request workflow can ensure a standardized and safe approach to managing changes. Additionally, leveraging best practices like Git hooks and automated CI/CD pipelines can further streamline the development process and ensure code quality. |
| 🔌 | **Integrations** | The codebase integrates with Microsoft Teams by utilizing the Teams Live SDK. This integration allows the application to interact with Teams Meeting specific functionality, such as sharing content to a stage and initializing and configuring the Teams app. Integrations like this can enhance the collaboration and communication capabilities of the application, making it more suitable

---


## 📂 Repository Structure

```sh
└── root/
    ├── manifest/
    │   ├── color.png
    │   ├── manifest.json
    │   └── outline.png
    ├── public/
    │   ├── favicon.ico
    │   ├── index.html
    │   ├── logo192.png
    │   ├── logo512.png
    │   ├── manifest.json
    │   └── robots.txt
    ├── src/
    │   ├── data/
    │   │   ├── chair.glb
    │   │   ├── concrete_material.jpg
    │   │   ├── table.glb
    │   │   └── wood_material.jpg
    │   ├── models/
    │   │   ├── MeshData.ts
    │   │   └── SyncInfo.ts
    │   ├── services/
    │   │   ├── BabylonHelper.ts
    │   │   └── RepositoryService.ts
    │   ├── views/
    │   │   ├── ConfigView.tsx
    │   │   ├── SidebarView.tsx
    │   │   └── StageView.tsx
    │   ├── App.tsx
    │   ├── App.css
    │   ├── index.css
    │   ├── index.tsx
    │   ├── react-app-env.d.ts
    │   └── reportWebVitals.ts
    ├── .gitignore
    ├── package.json
    ├── README.md
    └── tsconfig.json
```

---

## ⚙️ Modules

<details closed><summary>public</summary>

This folder contains out of box react template files.

| File | Summary |
|---|---|
| [index.html](https://github.com/kenakamu/hack23_metaverse/blob/main/public/index.html) | This is a boilerplate HTML file for a React web application. It configures the metadata, icons, and scripts used in the app. The content of the app is rendered inside the `<div id="root"></div>`. It also provides instructions on how to develop or build the app using npm or yarn. |

</details>

<details closed><summary>src</summary>

This folder contains all the source code of the project.

| File | Summary |
|---|---|
| [App.css](https://github.com/kenakamu/hack23_metaverse/blob/main/src/App.css) | This code defines the core functionalities of a web application. It centers the content, animates a logo, sets the background color, and adjusts font size and color. It also defines the dimensions of a canvas element and sets a link color. The code uses CSS animations and media queries for a responsive design. |
| [index.css](https://github.com/kenakamu/hack23_metaverse/blob/main/src/index.css) | This code defines the styling for the body element and code snippets on a web page, ensuring a consistent font-family and smoothing for optimal readability. |
| [index.tsx](https://github.com/kenakamu/hack23_metaverse/blob/main/src/index.tsx) | This code is responsible for rendering the React app on the browser. It imports the necessary dependencies, sets up the root element, and renders the main component (App). It also includes a function for measuring performance (reportWebVitals) and calls it to track app metrics.|
| [App.tsx](https://github.com/kenakamu/hack23_metaverse/blob/main/src/App.tsx) | This code is responsible for rendering different views based on the URL parameters. It also initializes and interacts with the Teams client SDK if running in a Teams environment. |
| [react-app-env.d.ts](https://github.com/kenakamu/hack23_metaverse/blob/main/src/react-app-env.d.ts) | This code is a reference to the React scripts library, indicating that it is designed for a React project. It allows for the use of various React functionalities and components in the code. |
| [reportWebVitals.ts](https://github.com/kenakamu/hack23_metaverse/blob/main/src/reportWebVitals.ts) | This code exports a function called "reportWebVitals" that can be used to track and report performance metrics of a web page. It uses the "web-vitals" library to measure metrics like Cumulative Layout Shift (CLS), First Input Delay (FID), and more. The metrics are then passed to a callback function provided by the user. |

</details>

<details closed><summary>src/models</summary>

| File | Summary |
|---|---|
| [SyncInfo.ts](https://github.com/kenakamu/hack23_metaverse/blob/main/src/models/SyncInfo.ts) | The code defines classes and enums for mesh operation information, such as managing drag, rotate, and sync actions, along with camera control information. |
| [MeshData.ts](https://github.com/kenakamu/hack23_metaverse/blob/main/src/models/MeshData.ts) | The code defines a MeshData class with properties for name, type, position, scale, rotation, and memo. This class provides a convenient way to store and access information about a mesh in a 3D environment. |

</details>

<details closed><summary>src/views</summary>

This folder contains main views for Microsoft Teams Meeting.

| File | Summary |
|---|---|
| [StageView.tsx](https://github.com/kenakamu/hack23_metaverse/blob/main/src/views/StageView.tsx)| This is the main view for the meeting. If you run the application outside of Microsoft Team, this is the only view you see. This renders mesh objects in the virtual space. It also provides camera and inking controls. |
| [SidebarView.tsx](https://github.com/kenakamu/hack23_metaverse/blob/main/src/views/SidebarView.tsx) | This view will be displayed in the sidebar section of the meeting. The code initializes the Microsoft Teams app and adds a button that, when clicked, shares the app's content (StageView.tsx) to a stage. It also displays a welcome message in a div element. |
| [ConfigView.tsx](https://github.com/kenakamu/hack23_metaverse/blob/main/src/views/ConfigView.tsx) | This view will be displayed when you add the app into Microsoft Teams meeting. It sets up event handlers for saving config settings and updates the content and website URLs. The component renders a simple "config page" message. |

</details>

<details closed><summary>src/services</summary>

| File | Summary |
|---|---|
| [BabylonHelper.ts](https://github.com/kenakamu/hack23_metaverse/blob/main/src/services/BabylonHelper.ts) | This code provides functions to create a scene in Babylon.js, import glb files, create buttons and input areas using the GUI module. It also defines a camera and sets its properties for user interaction in the scene. |
| [RepositoryService.ts](https://github.com/kenakamu/hack23_metaverse/blob/main/src/services/RepositoryService.ts) | This code defines an interface IRepositoryService that provides methods for setting and getting MeshData. The LocalStorageRepositoryService implements this interface, using local storage to store and retrieve mesh data. The setData method stores mesh data as a JSON string, and the getData method retrieves and converts the JSON string back into MeshData objects. |

</details>

<details closed><summary>src/data</summary>

This folder contains Babylon JS element such as glb files and materials. All of these files are available at https://polyhaven.com/.

| File | Summary |
|---|---|
| [chair.glb](https://github.com/kenakamu/hack23_metaverse/blob/main/src/data/chair.glb) | This is a chair model glb fie. |
| [table.glb](https://github.com/kenakamu/hack23_metaverse/blob/main/src/data/table.glb) | This is a table model glb fie. |
| [concrete_material.jpg](https://github.com/kenakamu/hack23_metaverse/blob/main/src/data/concrete_material.jpg) | This is a material for the ground mesh. |
| [wood_material.jpg](https://github.com/kenakamu/hack23_metaverse/blob/main/src/data/wood_material.jpg) | This is a material for the ground mesh. |

</details>

<details closed><summary>manifest</summary>

This folder contains manifest file for Microsoft Teams App. See [App manifest schema](https://learn.microsoft.com/microsoftteams/platform/resources/schema/manifest-schema) for more detail.

</details>

---

## 🚀 Getting Started

***Dependencies***

Please ensure you have the following dependencies installed on your system:

`- ℹ️ node`
`- ℹ️ Microsoft Teams`
`- ℹ️ ngrok (if test locally with Microsoft Teams)`
`- ℹ️ IDE such as Visual Studio Code (optional)`

### 🔧 Installation

1. Clone the hack23_metaverse repository:
    ```sh
    git clone https://github.com/kenakamu/hack23_metaverse
    ```

1. Change to the project directory:
    ```sh
    cd hack23_metaverse
    ```

1. Install the dependencies:
    ```sh
    npm install
    ```

### 🤖 Testing the app in Teams

#### Create a ngrok tunnel to allow Teams to reach your tab app

1. [Download ngrok](https://ngrok.com/download).
1. Launch ngrok with port 3000.
   `ngrok http 3000 --host-header=localhost`

#### Create the app package to sideload into Teams

1. Open `.\manifest\manifest.json` and update values in it, including your [Application ID](https://learn.microsoft.com/microsoftteams/platform/resources/schema/manifest-schema#id).
1. You must replace `https://<<BASE_URI_DOMAIN>>` with the https path to your ngrok tunnel.
1. It is recommended that you also update the following fields.
    - Set `developer.name` to your name.
    - Update `developer.websiteUrl` with your website.
    - Update `developer.privacyUrl` with your privacy policy.
    - Update `developer.termsOfUseUrl` with your terms of use.
1. Create a zip file with the contents of `.\manifest` directory so that manifest.json, color.png, and outline.png are in the root directory of the zip file.
    - On Windows or Mac, select all files in `.\manifest` directory and compress them.
    - Give your zip file a descriptive name, e.g. `VirtualEventManagement`.

#### Test it out

1. Enable the [Developer Preview](https://learn.microsoft.com/en-us/microsoftteams/platform/resources/dev-preview/developer-preview-intro) mode of Microsoft Teams.
1. Schedule a meeting for testing from calendar in Teams.
1. Join the meeting.
1. In the meeting window, tap on **+ Apps** and tap on **Manage apps** in the flyout that opens.
1. In the **Manage apps** pane, tap on **Upload a custom app**.
    - _Don't see the option to **Upload a custom app?!** Follow [instructions here](https://docs.microsoft.com/microsoftteams/teams-custom-app-policies-and-settings) to enable custom-apps in your tenant._
1. Select the zip file you created earlier and upload it.
1. In the dialog that shows up, tap **Add** to add your sample app into the meeting.
1. Now, back in the meeting window, tap **+ Apps** again and type the name of your app in the _Find an app_ textbox.
1. Select the app to activate it in the meeting.
1. In the configuration dialog, just tap **Save** to add your app into the meeting.
1. In the side panel, tap the share icon to put your app on the main stage in the meeting.
1. That's it! You should now see virtual-event-management on the meeting stage.
1. Your friends/colleagues invited to the meeting should be able to see your app on stage when they join the meeting.

---


## 🤝 Contributing

Contributions are always welcome! Please follow these steps:
1. Fork the project repository. This creates a copy of the project on your account that you can modify without affecting the original project.
2. Clone the forked repository to your local machine using a Git client like Git or GitHub Desktop.
3. Create a new branch with a descriptive name (e.g., `new-feature-branch` or `bugfix-issue-123`).
```sh
git checkout -b new-feature-branch
```
4. Make changes to the project's codebase.
5. Commit your changes to your local branch with a clear commit message that explains the changes you've made.
```sh
git commit -m 'Implemented new feature.'
```
6. Push your changes to your forked repository on GitHub using the following command
```sh
git push origin new-feature-branch
```
7. Create a new pull request to the original project repository. In the pull request, describe the changes you've made and why they're necessary.
The project maintainers will review your changes and provide feedback or merge them into the main branch.

---

## 📄 License

This project is licensed under the `ℹ️  LICENSE-TYPE` License. See the [LICENSE-Type](LICENSE) file for additional info.

---

## 👏 Acknowledgments and References

Big thanks to our hack team!

### References

- [metaverseliveshare](https://github.com/davrous/metaverseliveshare)
- [live-share-sdk](https://github.com/microsoft/live-share-sdk)
- [babylon.js](https://www.babylonjs.com/)

---