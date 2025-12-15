import React, { useMemo } from 'react';
import ReactFlow, {
    Node,
    Edge,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    ConnectionLineType,
    MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Task } from '../types';
import { useTheme } from '../context/ThemeContext';

interface PrecedenceGraphProps {
    tasks: Task[];
}

// Simple layering layout algorithm
const getLayoutedElements = (tasks: Task[], isDark: boolean) => {
    // 1. Calculate levels
    const levels = new Map<number, number>();
    const inDegree = new Map<number, number>();
    const adj = new Map<number, number[]>();

    tasks.forEach(t => {
        inDegree.set(t.id, t.predecessors.length);
        adj.set(t.id, t.successors);
        if (t.predecessors.length === 0) levels.set(t.id, 0);
    });

    // Topological traversal to set levels
    const queue = tasks.filter(t => t.predecessors.length === 0).map(t => t.id);
    const sorted: number[] = [];

    while (queue.length > 0) {
        const u = queue.shift()!;
        sorted.push(u);
        const uLevel = levels.get(u) || 0;

        const successors = adj.get(u) || [];
        successors.forEach(v => {
            const currentLevel = levels.get(v) || 0;
            levels.set(v, Math.max(currentLevel, uLevel + 1));

            inDegree.set(v, (inDegree.get(v) || 0) - 1);
            if (inDegree.get(v) === 0) {
                queue.push(v);
            }
        });
    }

    // 2. Assign positions
    // Group by level
    const levelGroups = new Map<number, number[]>();
    levels.forEach((lvl, id) => {
        if (!levelGroups.has(lvl)) levelGroups.set(lvl, []);
        levelGroups.get(lvl)?.push(id);
    });

    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const NODE_WIDTH = 150;
    const NODE_HEIGHT = 50;
    const X_GAP = 50;
    const Y_GAP = 100;

    levelGroups.forEach((ids, lvl) => {
        const totalWidth = ids.length * NODE_WIDTH + (ids.length - 1) * X_GAP;
        const startX = -totalWidth / 2;

        ids.forEach((id, index) => {
            const task = tasks.find(t => t.id === id)!;
            nodes.push({
                id: id.toString(),
                data: { label: `T${id} (${task.time})` },
                position: {
                    x: startX + index * (NODE_WIDTH + X_GAP),
                    y: lvl * (NODE_HEIGHT + Y_GAP) + 50
                },
                style: {
                    background: isDark ? '#1e293b' : '#ffffff',
                    color: isDark ? '#fff' : '#0f172a',
                    border: isDark ? '1px solid #475569' : '1px solid #e2e8f0',
                    borderRadius: '8px',
                    width: 100,
                    padding: '10px',
                    fontSize: '12px',
                    textAlign: 'center'
                }
            });
        });
    });

    tasks.forEach(task => {
        task.successors.forEach(succId => {
            edges.push({
                id: `e${task.id}-${succId}`,
                source: task.id.toString(),
                target: succId.toString(),
                type: ConnectionLineType.SmoothStep,
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                    color: isDark ? '#64748b' : '#94a3b8',
                },
                style: { stroke: isDark ? '#64748b' : '#94a3b8' }
            });
        });
    });

    return { nodes, edges };
};

export const PrecedenceGraph: React.FC<PrecedenceGraphProps> = ({ tasks }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const { nodes: initialNodes, edges: initialEdges } = useMemo(() => getLayoutedElements(tasks, isDark), [tasks, isDark]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    React.useEffect(() => {
        const layout = getLayoutedElements(tasks, isDark);
        setNodes(layout.nodes);
        setEdges(layout.edges);
    }, [tasks, isDark, setNodes, setEdges]);

    return (
        <div className="w-full h-full min-h-[500px] bg-slate-100 dark:bg-slate-900/30 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
                attributionPosition="bottom-right"
            >
                <Background color={isDark ? "#334155" : "#cbd5e1"} gap={16} />
                <Controls className="fill-slate-500" />
            </ReactFlow>
        </div>
    );
};
