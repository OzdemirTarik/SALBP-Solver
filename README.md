# SALBP Solver & Visualizer

A sophisticated React application to solve and visualize Simple Assembly Line Balancing Problems (SALBP) using Simulated Annealing.

## Prerequisites
- Node.js (v18+)
- npm

## Setup & Run

I have set up a portable version of Node.js for you in the `tools` folder, so you don't need to install anything globally.

1.  **Start the App**:
    Double-click `run_app.bat` in the root `SALBP` folder.
    
    *Alternatively, via terminal:*
    ```powershell
    .\run_app.bat
    ```

2.  Open the link shown in the terminal (usually http://localhost:5173).

## Features
- **Data Input**: Edit inputs in JSON format.
- **Precedence Graph**: Visual DAG of tasks.
- **Solver**: SALBP-1 (Min N) and SALBP-2 (Min C) using Simulated Annealing.
- **Visualization**: 
  - Real-time convergence chart.
  - Detailed Station views with utilization highlighting.

## Troubleshooting
If you see type errors in your IDE, ensure `npm install` has been run to fetch TypeScript definitions.
