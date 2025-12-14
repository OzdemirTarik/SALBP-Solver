

import React from 'react';
import { OptimizationStep } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { cn } from '@/lib/utils';
import { Activity, CheckCircle, XCircle, ArrowRight } from 'lucide-react';

interface AlgorithmMonitorProps {
    history: OptimizationStep[];
}

export const AlgorithmMonitor: React.FC<AlgorithmMonitorProps> = ({ history }) => {
    // Current State
    const currentStep = history[history.length - 1];

    // Downsample chart data
    const chartData = history.length > 300
        ? history.filter((_, i) => i % Math.ceil(history.length / 300) === 0)
        : history;

    if (!currentStep) return <div className="p-8 text-center text-slate-500">Waiting for simulation to start...</div>;

    const { currentTemp, acceptanceProbability, status, solution, candidateCost, cost } = currentStep;

    const isImproved = status === 'improved';
    const isWorse = status === 'accepted_worse';
    const isRejected = status === 'rejected';

    return (
        <div className="h-full flex flex-col space-y-4">

            {/* Top Row: Mechanics & Chart */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">

                {/* Left: Mechanics Dashboard */}
                <Card className="bg-slate-900 border-slate-800 flex flex-col overflow-hidden">
                    <CardHeader className="bg-slate-950/50 border-b border-slate-800 py-3">
                        <CardTitle className="text-xs uppercase tracking-wider text-slate-400 font-bold flex items-center">
                            <Activity className="w-4 h-4 mr-2 text-indigo-400" />
                            SA Mechanics
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 p-6 space-y-8 overflow-y-auto">

                        {/* Status Indicator */}
                        <div className="text-center space-y-2">
                            <div className={cn(
                                "inline-flex items-center px-4 py-2 rounded-full border text-sm font-bold shadow-lg transition-all duration-300",
                                isImproved && "bg-emerald-500/10 border-emerald-500/50 text-emerald-400",
                                isWorse && "bg-amber-500/10 border-amber-500/50 text-amber-400",
                                isRejected && "bg-rose-500/10 border-rose-500/50 text-rose-400"
                            )}>
                                {isImproved && <CheckCircle className="w-4 h-4 mr-2" />}
                                {isWorse && <ArrowRight className="w-4 h-4 mr-2" />}
                                {isRejected && <XCircle className="w-4 h-4 mr-2" />}

                                {isImproved && "FOUND BETTER SOLUTION"}
                                {isWorse && "ACCEPTED WORSE SOLUTION"}
                                {isRejected && "REJECTED MOVE"}
                            </div>
                            <div className="text-xs text-slate-500 h-4">
                                {isImproved && `Cost decreased from ${candidateCost ? (candidateCost + (candidateCost - cost)) : '?'} to ${cost}`}
                                {isWorse && `Cost increased, but accepted by probability`}
                                {isRejected && `Cost too high & probability check failed`}
                            </div>
                        </div>

                        {/* Temperature Gauge */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-mono text-slate-400">
                                <span>TEMP</span>
                                <span>{currentTemp?.toFixed(2)}</span>
                            </div>
                            <div className="h-4 bg-slate-800 rounded-full overflow-hidden relative border border-slate-700">
                                <div
                                    className="h-full bg-gradient-to-r from-orange-400 to-rose-500 transition-all duration-300"
                                    style={{ width: `${Math.min(100, (currentTemp / 1000) * 100)}%` }} // Assuming initial 1000
                                />
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-600">
                                <span>Cool</span>
                                <span>Hot</span>
                            </div>
                        </div>

                        {/* Probability Meter (Only relevant if not improved) */}
                        <div className={cn("space-y-2 transition-opacity duration-300", isImproved ? "opacity-30 grayscale" : "opacity-100")}>
                            <div className="flex justify-between text-xs font-mono text-slate-400">
                                <span>P(Accept)</span>
                                <span>{(acceptanceProbability * 100).toFixed(1)}%</span>
                            </div>
                            <div className="h-4 bg-slate-800 rounded-full overflow-hidden relative border border-slate-700">
                                {/* Random Roll Marker */}
                                {!isImproved && (
                                    <div
                                        className="absolute top-0 bottom-0 w-1 bg-white z-10 shadow-[0_0_10px_white]"
                                        style={{ left: `${Math.random() * 100}%` }} // Simulation of the random roll visually? strictly we don't know the exact random roll that happened, but we can animate strictly P
                                    />
                                )}
                                <div
                                    className="h-full bg-blue-500 transition-all duration-300"
                                    style={{ width: `${acceptanceProbability * 100}%` }}
                                />
                            </div>
                            <div className="text-[10px] text-slate-600 text-center">
                                If random roll (white line) lands in blue area, accept.
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Right: Convergence Graph */}
                <Card className="lg:col-span-2 bg-slate-900 border-slate-800 flex flex-col">
                    <CardHeader className="bg-slate-950/50 border-b border-slate-800 py-3">
                        <CardTitle className="text-xs uppercase tracking-wider text-slate-400 font-bold">Convergence History</CardTitle>
                    </CardHeader>
                    <div className="flex-1 min-h-[250px] p-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="iteration" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', color: '#f8fafc', fontSize: '12px' }}
                                    labelStyle={{ color: '#94a3b8' }}
                                />
                                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                                <Line type="monotone" dataKey="cost" stroke="#6366f1" strokeWidth={1} dot={false} name="Current Cost" isAnimationActive={false} />
                                <Line type="stepAfter" dataKey="bestCost" stroke="#10b981" strokeWidth={2} dot={false} name="Best Found" isAnimationActive={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* Bottom Row: Live Layout Preview */}
            <Card className="h-48 bg-slate-900 border-slate-800 flex flex-col shrink-0">
                <CardHeader className="bg-slate-950/50 border-b border-slate-800 py-3 flex flex-row justify-between items-center">
                    <CardTitle className="text-xs uppercase tracking-wider text-slate-400 font-bold">Live Assembly Configuration (Testing)</CardTitle>
                    <div className="text-xs font-mono text-slate-500">
                        Stations: {solution.stations.length} | Cycle Time: {solution.cycleTime}
                    </div>
                </CardHeader>
                <div className="flex-1 p-4 overflow-x-auto overflow-y-hidden whitespace-nowrap scrollbar-thin scrollbar-thumb-slate-700">
                    <div className="flex h-full space-x-2 items-end pb-2">
                        {solution.stations.map((st, idx) => {
                            const usage = (st.totalTime / solution.cycleTime) * 100;
                            return (
                                <div key={idx} className="w-12 h-full bg-slate-800/50 rounded-t-sm relative group">
                                    {/* Fill Bar */}
                                    <div
                                        className={cn(
                                            "absolute bottom-0 left-0 right-0 transition-all duration-300 rounded-t-sm",
                                            usage > 100 ? "bg-rose-500" : (usage > 80 ? "bg-amber-500" : "bg-emerald-500")
                                        )}
                                        style={{ height: `${Math.min(100, usage)}%` }}
                                    />
                                    {/* Tooltip on hover */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-950 text-white text-[10px] p-1 rounded border border-slate-700 z-10 whitespace-nowrap">
                                        St {idx + 1}: {st.totalTime}
                                    </div>
                                    <div className="absolute w-full bottom-1 text-[9px] text-center text-white/50 font-mono z-10">{idx + 1}</div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </Card>
        </div>
    );
};
