# Node.js Missing

It looks like **Node.js** is not installed on your computer, or it's not in your system PATH. This application requires Node.js to run the React development server.

## How to Install Node.js

1.  **Download**: Go to [nodejs.org](https://nodejs.org/) and download the **LTS (Long Term Support)** version for Windows.
2.  **Install**: Run the installer.
    *   **Important**: During installation, make sure the option **"Add to PATH"** is selected (it usually is by default).
3.  **Restart Terminal**: After installation is complete, close your current PowerShell/Command Prompt window and open a new one.

## Verifying Installation

In the new terminal, type:
```powershell
node -v
npm -v
```
If these commands print version numbers (e.g., `v18.x.x`), you are ready to go!

## Running the App

Once Node is installed:
1.  Navigate to the project: `cd c:\Users\TarikPc\Desktop\SALBP\kod`
2.  Install libraries: `npm install`
3.  Start the app: `npm run dev`
