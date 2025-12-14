import React from 'react';
import { Solution, Station, ProblemType } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { cn } from '@/lib/utils';
import { Clock, Battery, BatteryWarning } from 'lucide-react';

interface SolutionViewProps {
    solution: Solution | null;
    problemType: ProblemType;
    constraint: number;
}

export const SolutionView: React.FC<SolutionViewProps> = ({ solution, problemType, constraint }) => {
    if (!solution) return (
        <div className="flex items-center justify-center h-full text-slate-500">
            No solution found yet. Run the solver.
        </div>
    );

    // If Type 2 (Given N, min C), the constraint passed is N.
    // If Type 1 (Given C, min N), the constraint passed is C.
    // But actual Cycle Time is solution.cycleTime
    const cycleTime = solution.cycleTime;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-indigo-950/30 border-indigo-900">
                    <CardHeader className="p-4 py-2"><CardTitle className="text-sm text-indigo-300">Stations</CardTitle></CardHeader>
                    <CardContent className="p-4 py-2">
                        <div className="text-2xl font-bold">{solution.stations.length}</div>
                        {problemType === 'SALBP-2' && <div className="text-xs text-indigo-400">Target: {constraint}</div>}
                    </CardContent>
                </Card>
                <Card className="bg-emerald-950/30 border-emerald-900">
                    <CardHeader className="p-4 py-2"><CardTitle className="text-sm text-emerald-300">Cycle Time</CardTitle></CardHeader>
                    <CardContent className="p-4 py-2">
                        <div className="text-2xl font-bold">{cycleTime}</div>
                        {problemType === 'SALBP-1' && <div className="text-xs text-emerald-400">Limit: {constraint}</div>}
                    </CardContent>
                </Card>
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader className="p-4 py-2"><CardTitle className="text-sm text-slate-400">Efficiency</CardTitle></CardHeader>
                    <CardContent className="p-4 py-2">
                        <div className="text-2xl font-bold">{(solution.efficiency * 100).toFixed(1)}%</div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader className="p-4 py-2"><CardTitle className="text-sm text-slate-400">Smoothness</CardTitle></CardHeader>
                    <CardContent className="p-4 py-2">
                        <div className="text-2xl font-bold">{solution.smoothnessIndex.toFixed(2)}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {solution.stations.map((station, idx) => (
                    <StationCard key={station.id} station={station} cycleTime={cycleTime} index={idx} />
                ))}
            </div>
        </div>
    );
};

const StationCard = ({ station, cycleTime, index }: { station: Station, cycleTime: number, index: number }) => {
    const usage = (station.totalTime / cycleTime) * 100;
    const isBottleneck = usage > 99;
    const isLow = usage < 50;

    let barColor = "bg-emerald-500";
    if (isBottleneck) barColor = "bg-rose-500";
    else if (usage > 80) barColor = "bg-amber-500";
    else if (isLow) barColor = "bg-blue-500";

    return (
        <Card className="border-slate-800 bg-slate-900 hover:border-slate-600 transition-colors">
            <CardHeader className="p-3 bg-slate-950/50 border-b border-slate-800 flex flex-row items-center justify-between">
                <span className="font-bold text-sm">Station {index + 1}</span>
                <span className={cn("text-xs px-2 py-0.5 rounded-full font-mono", isBottleneck ? "bg-rose-900 text-rose-200" : "bg-emerald-900 text-emerald-200")}>
                    {station.totalTime}/{cycleTime}
                </span>
            </CardHeader>
            <CardContent className="p-3 space-y-3">
                {/* Usage Bar */}
                <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400 uppercase tracking-wider">
                        <span>Load</span>
                        <span>{usage.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className={cn("h-full transition-all duration-500", barColor)} style={{ width: `${usage}%` }} />
                    </div>
                </div>

                {/* Tasks */}
                <div>
                    <div className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider">Assigned Tasks</div>
                    <div className="flex flex-wrap gap-1">
                        {station.tasks.map(tid => (
                            <span key={tid} className="inline-flex items-center justify-center w-8 h-8 rounded bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300">
                                {tid}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="text-[10px] text-slate-500 flex justify-between pt-1 border-t border-slate-800/50">
                    <span>Idle: {station.idleTime}</span>
                </div>
            </CardContent>
        </Card>
    );
};
