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

interface PrecedenceGraphProps {
    tasks: Task[];
}

// Simple layering layout algorithm
const getLayoutedElements = (tasks: Task[]) => {
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
                    background: '#1e293b',
                    color: '#fff',
                    border: '1px solid #475569',
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
                    color: '#64748b',
                },
                style: { stroke: '#64748b' }
            });
        });
    });

    return { nodes, edges };
};

export const PrecedenceGraph: React.FC<PrecedenceGraphProps> = ({ tasks }) => {
    const { nodes: initialNodes, edges: initialEdges } = useMemo(() => getLayoutedElements(tasks), [tasks]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    React.useEffect(() => {
        const layout = getLayoutedElements(tasks);
        setNodes(layout.nodes);
        setEdges(layout.edges);
    }, [tasks, setNodes, setEdges]);

    return (
        <div className="w-full h-full min-h-[500px] bg-slate-900/30 rounded-lg border border-slate-800 overflow-hidden">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
                attributionPosition="bottom-right"
            >
                <Background color="#334155" gap={16} />
                <Controls />
            </ReactFlow>
        </div>
    );
};
