import { useState, useEffect, useRef } from 'react'
import { Sidebar } from './components/Sidebar'
import { PrecedenceGraph } from './components/PrecedenceGraph'
import { SolutionView } from './components/SolutionView'
import { AlgorithmMonitor } from './components/AlgorithmMonitor'
import { parseInput, solveSA, hasCycle } from './lib/salbp'
import { OptimizationStep, ProblemType, AlgorithmParams, Task } from './types'
import { cn } from './lib/utils'
import { LayoutDashboard, Network, LineChart as IconLineChart } from 'lucide-react'
import { useLanguage } from './context/LanguageContext'

// Default Jackson's 11-task problem
const DEFAULT_JSON = `{
    "tasks": [
        {"id": 1, "duration": 6, "successors": [2, 3, 4, 5]},
        {"id": 2, "duration": 2, "successors": [6]},
        {"id": 3, "duration": 5, "successors": [7]},
        {"id": 4, "duration": 7, "successors": [7]},
        {"id": 5, "duration": 1, "successors": [7]},
        {"id": 6, "duration": 2, "successors": [8]},
        {"id": 7, "duration": 3, "successors": [9]},
        {"id": 8, "duration": 6, "successors": [10]},
        {"id": 9, "duration": 5, "successors": [11]},
        {"id": 10, "duration": 5, "successors": [11]},
        {"id": 11, "duration": 4, "successors": []}
    ]
}`;

function App() {
    const { t } = useLanguage();
    const [jsonInput, setJsonInput] = useState(DEFAULT_JSON);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [history, setHistory] = useState<OptimizationStep[]>([]);
    const [isSolving, setIsSolving] = useState(false);
    const [activeTab, setActiveTab] = useState<'graph' | 'solution' | 'monitor'>('graph');
    const [error, setError] = useState<string | null>(null);

    const [currentConfig, setCurrentConfig] = useState<{ type: ProblemType, constraint: number } | null>(null);
    const [speed, setSpeed] = useState<number>(50); // ms delay
    const speedRef = useRef(speed);
    const cancelRef = useRef(false);
    const [isPaused, setIsPaused] = useState(false);
    const pauseRef = useRef(false);

    // Sync ref
    useEffect(() => {
        speedRef.current = speed;
    }, [speed]);

    // Parse on input change (real-time graph updates)
    useEffect(() => {
        try {
            const parsed = parseInput(jsonInput);
            setTasks(parsed);
        } catch (e) {
            // quiet fail
        }
    }, [jsonInput]);

    const handleStop = () => {
        if (isSolving) {
            cancelRef.current = true;
            setIsSolving(false);
            setIsPaused(false);
            pauseRef.current = false;
        }
    };

    const handleTogglePause = () => {
        const next = !isPaused;
        setIsPaused(next);
        pauseRef.current = next;
    };

    const handleSolve = async (type: ProblemType, constraint: number, params: AlgorithmParams) => {
        try {
            // Reset flags
            cancelRef.current = false;
            pauseRef.current = false;
            setIsPaused(false);

            setIsSolving(true);
            setHistory([]);
            setError(null);
            setCurrentConfig({ type, constraint });

            const parsedTasks = parseInput(jsonInput);

            if (hasCycle(parsedTasks)) {
                throw new Error(t('errorCycle'));
            }

            setTasks(parsedTasks);

            // Switch to monitor to see progress
            setActiveTab('monitor');

            // Run Generator
            const generator = solveSA(parsedTasks, type, constraint, params);

            for await (const step of generator) {
                // Check cancellation
                if (cancelRef.current) break;

                // Handle Pause
                while (pauseRef.current) {
                    if (cancelRef.current) break;
                    await new Promise(r => setTimeout(r, 100));
                }
                if (cancelRef.current) break;

                const currentSpeed = speedRef.current;

                setHistory(prev => {
                    // Update only every few frames if very fast, but always if slow
                    if (currentSpeed < 10 && step.iteration % 10 !== 0) return prev;
                    return [...prev, step];
                });

                // Controlled delay using Ref
                await new Promise(r => setTimeout(r, currentSpeed));
            }

            setActiveTab('solution');
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsSolving(false);
            setIsPaused(false);
            pauseRef.current = false;
        }
    };

    const handleReset = () => {
        handleStop(); // Stop any running simulation
        setHistory([]);
        setCurrentConfig(null);
        setActiveTab('graph');
    };

    // derived best solution
    const bestStep = history.length > 0 ? history.reduce((prev, curr) => (curr.cost < prev.cost ? curr : prev), history[0]) : null;
    const bestSolution = bestStep ? bestStep.solution : null;

    return (
        <div className="flex h-screen bg-slate-950 text-slate-50 font-sans overflow-hidden">
            {/* Sidebar */}
            <Sidebar
                jsonInput={jsonInput}
                setJsonInput={setJsonInput}
                onSolve={handleSolve}
                isSolving={isSolving}
                isPaused={isPaused}
                onTogglePause={handleTogglePause}
                onStop={handleStop}
                onReset={handleReset}
                simulationSpeed={speed}
                setSimulationSpeed={setSpeed}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* Top Bar / Tabs */}
                <div className="h-14 border-b border-slate-800 bg-slate-950 flex items-center px-4 justify-between">
                    <div className="flex space-x-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                        <TabButton isActive={activeTab === 'graph'} onClick={() => setActiveTab('graph')} icon={<Network size={16} />} label={t('graphTab')} />
                        <TabButton isActive={activeTab === 'solution'} onClick={() => setActiveTab('solution')} icon={<LayoutDashboard size={16} />} label={t('solutionTab')} />
                        <TabButton isActive={activeTab === 'monitor'} onClick={() => setActiveTab('monitor')} icon={<IconLineChart size={16} />} label={t('monitorTab')} />
                    </div>

                    <div className="flex items-center space-x-6">
                        {/* Simulation Speed Control moved to Sidebar */}

                        {bestSolution && (
                            <div className="flex items-center space-x-4 text-sm">
                                <div className="flex items-center space-x-2">
                                    <span className="text-slate-500">{t('bestCost')}:</span>
                                    <span className="font-mono text-emerald-400">{bestSolution.cost.toFixed(2)}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="bg-red-500/10 border-b border-red-500/20 text-red-500 px-4 py-2 text-sm flex justify-between">
                        <span>{error}</span>
                        <button onClick={() => setError(null)} className="hover:text-red-400">✕</button>
                    </div>
                )}

                {/* View Area */}
                <div className="flex-1 overflow-auto p-4 bg-[#0B1120]">
                    {activeTab === 'graph' && (
                        <PrecedenceGraph tasks={tasks} />
                    )}
                    {activeTab === 'solution' && (
                        <SolutionView
                            solution={bestSolution}
                            problemType={currentConfig?.type || 'SALBP-1'}
                            constraint={currentConfig?.constraint || 0}
                        />
                    )}
                    {activeTab === 'monitor' && (
                        <AlgorithmMonitor history={history} />
                    )}
                </div>
            </div>
        </div>
    )
}

function TabButton({ isActive, onClick, icon, label }: { isActive: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            )}
        >
            {icon}
            <span>{label}</span>
        </button>
    )
}

export default App;
