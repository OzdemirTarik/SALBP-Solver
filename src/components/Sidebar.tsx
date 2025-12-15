import React, { useState } from 'react';
import { Button } from './ui/button';
import { Textarea, Input } from './ui/input';
import { Label } from './ui/label';
import { Select } from './ui/select';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { AlgorithmParams, ProblemType } from '../types';
import { Play, RotateCcw, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface SidebarProps {
    jsonInput: string;
    setJsonInput: (val: string) => void;
    onSolve: (type: ProblemType, constraint: number, params: AlgorithmParams) => void;
    isSolving: boolean;
    onReset: () => void;
    onStop: () => void;
    isPaused: boolean;
    onTogglePause: () => void;
    simulationSpeed: number;
    setSimulationSpeed: (val: number) => void;
}

import { useLanguage } from '../context/LanguageContext';

const DEFAULT_PARAMS: AlgorithmParams = {
    initialTemp: 1000,
    coolingRate: 0.95,
    maxIterations: 400
};

export const Sidebar: React.FC<SidebarProps> = ({
    jsonInput,
    setJsonInput,
    onSolve,
    isSolving,
    onReset,
    onStop,
    isPaused,
    onTogglePause,
    simulationSpeed,
    setSimulationSpeed
}) => {
    const { t, language, setLanguage } = useLanguage();
    const { theme, toggleTheme } = useTheme();
    const [problemType, setProblemType] = useState<ProblemType>('SALBP-1');
    const [constraint, setConstraint] = useState<string>(''); // C or N
    const [params, setParams] = useState<AlgorithmParams>(DEFAULT_PARAMS);

    const handleSolve = () => {
        const val = parseFloat(constraint);
        if (isNaN(val) || val <= 0) {
            alert(t('errorConstraint'));
            return;
        }
        onSolve(problemType, val, params);
    };

    return (
        <div className="w-80 h-full border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col overflow-y-auto transition-colors duration-200">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-start mb-1">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                        {t('appTitle')}
                    </h1>
                    <div className="flex space-x-1">
                        <button
                            onClick={() => setLanguage('en')}
                            className={`text-xs px-1.5 py-0.5 rounded ${language === 'en' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                        >
                            EN
                        </button>
                        <button
                            onClick={() => setLanguage('tr')}
                            className={`text-xs px-1.5 py-0.5 rounded ${language === 'tr' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                        >
                            TR
                        </button>
                        <button
                            onClick={toggleTheme}
                            className="ml-2 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400"
                        >
                            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
                        </button>
                    </div>
                </div>
                <p className="text-xs text-slate-500">{t('sidebarSubtitle')}</p>
            </div>

            <div className="flex-1 p-4 space-y-6">

                {/* Input Section */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <Label>{t('inputData')}</Label>
                        <div className="relative">
                            <input
                                type="file"
                                accept=".json"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onload = (ev) => {
                                            const content = ev.target?.result as string;
                                            setJsonInput(content);
                                        };
                                        reader.readAsText(file);
                                    }
                                }}
                            />
                            <Button className="h-6 text-xs px-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700">
                                {t('uploadJson')}
                            </Button>
                        </div>
                    </div>
                    <Textarea
                        className="font-mono text-xs h-40"
                        value={jsonInput}
                        onChange={(e) => setJsonInput(e.target.value)}
                        placeholder='[{"id": 1, "time": 5, "predecessors": []}, ...]'
                    />
                </div>

                {/* Problem Config */}
                <Card className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm">{t('configuration')}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-2 space-y-4">
                        <div className="space-y-1">
                            <Label>{t('problemType')}</Label>
                            <Select
                                value={problemType}
                                onChange={(e) => setProblemType(e.target.value as ProblemType)}
                            >
                                <option value="SALBP-1">{t('minN')}</option>
                                <option value="SALBP-2">{t('minC')}</option>
                            </Select>
                        </div>

                        <div className="space-y-1">
                            <Label>
                                {problemType === 'SALBP-1' ? t('cycleTime') : t('stationCount')}
                            </Label>
                            <Input
                                type="number"
                                value={constraint}
                                onChange={(e) => setConstraint(e.target.value)}
                                placeholder={problemType === 'SALBP-1' ? t('enterConstraint') : "e.g. 4"}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Algorithm Params */}
                <Card className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm">{t('simulatedAnnealing')}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-2 space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <Label className="text-xs">{t('initTemp')}</Label>
                                <Input
                                    type="number"
                                    className="h-8 text-xs"
                                    value={params.initialTemp}
                                    onChange={(e) => setParams({ ...params, initialTemp: parseFloat(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">{t('cooling')}</Label>
                                <Input
                                    type="number" step="0.001"
                                    className="h-8 text-xs"
                                    value={params.coolingRate}
                                    onChange={(e) => setParams({ ...params, coolingRate: parseFloat(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">{t('maxIterations')}</Label>
                            <Input
                                type="number"
                                className="h-8 text-xs"
                                value={params.maxIterations}
                                onChange={(e) => setParams({ ...params, maxIterations: parseInt(e.target.value) })}
                            />
                        </div>

                        {/* Speed Control (New) */}
                        <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-slate-800">
                            <div className="flex justify-between items-center">
                                <Label className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">{t('simulationSpeed')}</Label>
                                <span className="text-[10px] font-mono text-slate-400">{simulationSpeed}{t('ms')}</span>
                            </div>
                            <input
                                type="range"
                                min="0" max="500" step="10"
                                value={simulationSpeed}
                                onChange={(e) => setSimulationSpeed && setSimulationSpeed(Number(e.target.value))}
                                className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
                {isSolving ? (
                    <div className="flex space-x-2">
                        <Button
                            variant="outline"
                            className="flex-1 bg-amber-500/10 text-amber-500 border-amber-500/50 hover:bg-amber-500/20"
                            onClick={onTogglePause}
                        >
                            {isPaused ? <Play className="w-4 h-4 mr-2" /> : <div className="w-2 h-4 border-r-2 border-l-2 border-current mr-2" />}
                            {isPaused ? t('resume') : t('pause')}
                        </Button>
                        <Button
                            className="flex-1 bg-rose-600 hover:bg-rose-700 text-white"
                            onClick={onStop}
                        >
                            <div className="w-2 h-2 bg-white rounded-sm mr-2 animate-pulse" /> {t('stop')}
                        </Button>
                    </div>
                ) : (
                    <Button
                        className="w-full bg-indigo-600 hover:bg-indigo-700"
                        onClick={handleSolve}
                    >
                        <Play className="w-4 h-4 mr-2" /> {t('startOptimization')}
                    </Button>
                )}
                <Button variant="outline" className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100" onClick={onReset}>
                    <RotateCcw className="w-4 h-4 mr-2" /> {t('reset')}
                </Button>
            </div>
        </div>
    );
};
