

import React from 'react';
import { OptimizationStep } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { cn } from '@/lib/utils';
import { Activity, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

interface AlgorithmMonitorProps {
    history: OptimizationStep[];
}

export const AlgorithmMonitor: React.FC<AlgorithmMonitorProps> = ({ history }) => {
    const { t } = useLanguage();
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    // Current State
    const currentStep = history[history.length - 1];

    // Downsample chart data
    const chartData = history.length > 300
        ? history.filter((_, i) => i % Math.ceil(history.length / 300) === 0)
        : history;

    if (!currentStep) return <div className="p-8 text-center text-slate-500">{t('waitingForSimulation')}</div>;

    const { currentTemp, acceptanceProbability, status, solution, candidateCost, cost } = currentStep;

    const isImproved = status === 'improved';
    const isWorse = status === 'accepted_worse';
    const isRejected = status === 'rejected';

    return (
        <div className="h-full flex flex-col space-y-4">


            {/* Top Row: Mechanics & Chart */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">

                {/* Left: Mechanics Dashboard */}
                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
                    <CardHeader className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 py-3">
                        <CardTitle className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold flex items-center">
                            <Activity className="w-4 h-4 mr-2 text-indigo-600 dark:text-indigo-400" />
                            {t('saMechanics')}
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

                                {isImproved && t('foundBetterSolution')}
                                {isWorse && t('acceptedWorseSolution')}
                                {isRejected && t('rejectedMove')}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-500 h-4">
                                {isImproved && `${t('costDecreased')} ${candidateCost ? (candidateCost + (candidateCost - cost)) : '?'} ${t('to')} ${cost}`}
                                {isWorse && t('costIncreasedAccepted')}
                                {isRejected && t('costTooHigh')}
                            </div>
                        </div>

                        {/* Temperature Gauge */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
                                <span>{t('temp')}</span>
                                <span>{currentTemp?.toFixed(2)}</span>
                            </div>
                            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative border border-slate-200 dark:border-slate-700">
                                <div
                                    className="h-full bg-gradient-to-r from-orange-400 to-rose-500 transition-all duration-300"
                                    style={{ width: `${Math.min(100, (currentTemp / 1000) * 100)}%` }} // Assuming initial 1000
                                />
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-600">
                                <span>{t('cool')}</span>
                                <span>{t('hot')}</span>
                            </div>
                        </div>

                        {/* Probability Meter (Only relevant if not improved) */}
                        <div className={cn("space-y-2 transition-opacity duration-300", isImproved ? "opacity-30 grayscale" : "opacity-100")}>
                            <div className="flex justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
                                <span>{t('pAccept')}</span>
                                <span>{(acceptanceProbability * 100).toFixed(1)}%</span>
                            </div>
                            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative border border-slate-200 dark:border-slate-700">
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
                                {t('pAcceptExplanation')}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Right: Convergence Graph */}
                <Card className="lg:col-span-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex flex-col">
                    <CardHeader className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 py-3 flex flex-row justify-between items-center">
                        <div>
                            <CardTitle className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">{t('convergenceHistory')}</CardTitle>
                            <div className="text-[10px] text-slate-500 mt-1">{t('convergenceDesc')}</div>
                        </div>
                        <div className="flex space-x-4 text-xs font-mono">
                            <div className="text-slate-500 dark:text-slate-400">
                                <span className="text-slate-500 dark:text-slate-600 mr-2">START:</span>
                                {history[0]?.cost}
                            </div>
                            <div className="text-indigo-600 dark:text-indigo-400">
                                <span className="text-slate-500 dark:text-slate-600 mr-2">CURRENT:</span>
                                {cost}
                            </div>
                        </div>
                    </CardHeader>
                    <div className="flex-1 min-h-[250px] p-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#1e293b" : "#e2e8f0"} vertical={false} />
                                <XAxis
                                    dataKey="iteration"
                                    stroke={isDark ? "#475569" : "#94a3b8"}
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    label={{ value: t('convergenceX'), position: 'bottom', offset: 0, fill: isDark ? '#475569' : '#94a3b8', fontSize: 10 }}
                                />
                                <YAxis
                                    stroke={isDark ? "#475569" : "#94a3b8"}
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    domain={['auto', 'auto']}
                                    label={{ value: t('convergenceY'), angle: -90, position: 'insideLeft', fill: isDark ? '#475569' : '#94a3b8', fontSize: 10 }}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: isDark ? '#0f172a' : '#ffffff', borderColor: isDark ? '#1e293b' : '#e2e8f0', fontSize: '12px' }}
                                    itemStyle={{ color: isDark ? '#e2e8f0' : '#0f172a' }}
                                    labelStyle={{ color: isDark ? '#94a3b8' : '#64748b', marginBottom: '4px' }}
                                    formatter={(value: number) => [value, t('convergenceY')]}
                                    labelFormatter={(label) => `${t('convergenceX')}: ${label}`}
                                />
                                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                                <Line type="monotone" dataKey="cost" stroke="#6366f1" strokeWidth={1} dot={false} name={t('currentCost')} isAnimationActive={false} />
                                <Line type="stepAfter" dataKey="bestCost" stroke="#10b981" strokeWidth={2} dot={false} name={t('bestFound')} isAnimationActive={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* Bottom Row: Live Layout Preview */}
            <Card className="h-48 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
                <CardHeader className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 py-3 flex flex-row justify-between items-center">
                    <CardTitle className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">{t('liveAssembly')}</CardTitle>
                    <div className="flex items-center space-x-6">
                        {/* Legend */}
                        <div className="flex space-x-3 text-[10px]">
                            <div className="flex items-center text-slate-400">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 mr-1"></div>
                                {t('legendEfficient')}
                            </div>
                            <div className="flex items-center text-slate-400">
                                <div className="w-2 h-2 rounded-full bg-amber-500 mr-1"></div>
                                {t('legendModerate')}
                            </div>
                            <div className="flex items-center text-slate-400">
                                <div className="w-2 h-2 rounded-full bg-rose-500 mr-1"></div>
                                {t('legendOverload')}
                            </div>
                        </div>
                        <div className="w-px h-4 bg-slate-800"></div>
                        <div className="text-xs font-mono text-slate-500">
                            {t('stations')}: {solution.stations.length} | {t('cycleTime')}: {solution.cycleTime}
                        </div>
                    </div>
                </CardHeader>
                <div className="flex-1 p-4 overflow-x-auto overflow-y-hidden whitespace-nowrap scrollbar-thin scrollbar-thumb-slate-700">
                    <div className="flex h-full space-x-2 items-end pb-2 relative">
                        {/* Cycle Time Line - Visual Guide */}
                        <div className="absolute left-0 right-0 top-0 border-t border-dashed border-slate-300 dark:border-slate-700 w-full z-0 h-full pointer-events-none">
                            <div className="absolute right-0 -top-2 text-[9px] text-slate-500 dark:text-slate-600 bg-white dark:bg-slate-900 px-1">100% ({solution.cycleTime})</div>
                        </div>

                        {solution.stations.map((st, idx) => {
                            const usage = (st.totalTime / solution.cycleTime) * 100;
                            return (
                                <div key={idx} className="w-12 h-full bg-slate-100 dark:bg-slate-800/20 rounded-t-sm relative group z-10">
                                    {/* Fill Bar */}
                                    <div
                                        className={cn(
                                            "absolute bottom-0 left-0 right-0 transition-all duration-300 rounded-t-sm",
                                            usage > 100 ? "bg-rose-500" : (usage > 80 ? "bg-amber-500" : "bg-emerald-500")
                                        )}
                                        style={{ height: `${Math.min(100, usage)}%` }}
                                    />
                                    {/* Tooltip on hover */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-[10px] p-2 rounded border border-slate-200 dark:border-slate-700 z-20 whitespace-nowrap shadow-xl">
                                        <div className="font-bold mb-1 text-slate-700 dark:text-slate-300">Station {idx + 1}</div>
                                        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                                            <span className="text-slate-500">{t('load')}:</span>
                                            <span>{st.totalTime}</span>
                                            <span className="text-slate-500">{t('utilization')}:</span>
                                            <span className={usage > 100 ? "text-rose-400" : "text-emerald-400"}>{usage.toFixed(1)}%</span>
                                        </div>
                                    </div>
                                    <div className="absolute w-full bottom-1 text-[9px] text-center text-slate-500 dark:text-white/50 font-mono z-10">{idx + 1}</div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </Card>
        </div>
    );
};
