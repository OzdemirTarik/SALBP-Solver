import React from 'react';
import { OptimizationStep } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card } from './ui/card';

interface AlgorithmMonitorProps {
    history: OptimizationStep[];
}

export const AlgorithmMonitor: React.FC<AlgorithmMonitorProps> = ({ history }) => {
    // Downsample history if too large for performance
    const data = history.length > 200
        ? history.filter((_, i) => i % Math.ceil(history.length / 200) === 0)
        : history;

    return (
        <Card className="p-4 bg-slate-900 border-slate-800 h-full flex flex-col">
            <h3 className="text-sm font-semibold text-slate-400 mb-4">Optimization Convergence</h3>
            <div className="flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis
                            dataKey="iteration"
                            stroke="#94a3b8"
                            fontSize={12}
                            tickLine={false}
                        />
                        <YAxis
                            stroke="#94a3b8"
                            fontSize={12}
                            tickLine={false}
                            domain={['auto', 'auto']}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', color: '#f8fafc' }}
                            itemStyle={{ fontSize: '12px' }}
                        />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="cost"
                            stroke="#6366f1"
                            strokeWidth={1}
                            dot={false}
                            name="Current Cost"
                            isAnimationActive={false}
                        />
                        <Line
                            type="stepAfter"
                            dataKey="bestCost"
                            stroke="#10b981"
                            strokeWidth={2}
                            dot={false}
                            name="Best Found"
                            isAnimationActive={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};
