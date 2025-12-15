# SALBP Solver & Visualizer

A sophisticated React application to solve and verify Simple Assembly Line Balancing Problems (SALBP) using Simulated Annealing. This tool allows users to visualize task dependencies, simulate assembly lines, and optimize station configurations.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18-green.svg)

## 🚀 Features

- **Advanced Solver**: Implements SALBP-1 (Minimize Number of Stations) and SALBP-2 (Minimize Cycle Time) using a Simulated Annealing algorithm.
- **Interactive Visualization**:
  - **Precedence Graph**: Visual Directed Acyclic Graph (DAG) of task dependencies.
  - **Live Assembly Line**: Real-time visualization of stations and task assignments.
  - **Convergence History**: Chart showing the algorithm's progress over iterations.
- **Data Management**: Easy-to-use JSON editor for defining task times and precedence constraints.
- **Responsive Design**: Modern UI built with Tailwind CSS for a seamless experience.
- **Localization**: Supports multiple languages (e.g., Turkish, English).

## 🛠️ Technology Stack

- **Frontend**: [React](https://reactjs.org/) (TypeScript), [Vite](https://vitejs.dev/)
- **State Management**: React Context API
- **Visualization**: [React Flow](https://reactflow.dev/) (Graphs), [Recharts](https://recharts.org/) (Charts)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 📂 Project Structure

```
src/
├── components/       # Reusable UI components (AlgorithmMonitor, StationView, etc.)
├── context/          # Global state management (GlobalContext, LanguageContext)
├── lib/             # Core logic and helper functions
│   ├── algorithms/   # Simulated Annealing implementation
│   └── validation/   # Input validation logic
├── types/            # TypeScript type definitions
└── App.tsx           # Main application entry
```

## 🏁 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/SALBP-Solver.git
    cd SALBP-Solver
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

### Running Locally

To start the development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
