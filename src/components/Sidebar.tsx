import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Textarea, Input } from './ui/input';
import { Label } from './ui/label';
import { Select } from './ui/select';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { AlgorithmParams, ProblemType } from '../types';
import { Play, RotateCcw } from 'lucide-react';

interface SidebarProps {
    jsonInput: string;
    setJsonInput: (val: string) => void;
    onSolve: (type: ProblemType, constraint: number, params: AlgorithmParams) => void;
    isSolving: boolean;
    onReset: () => void;
}

const DEFAULT_PARAMS: AlgorithmParams = {
    initialTemp: 1000,
    coolingRate: 0.003,
    maxIterations: 1000
};

export const Sidebar: React.FC<SidebarProps> = ({
    jsonInput,
    setJsonInput,
    onSolve,
    isSolving,
    onReset
}) => {
    const [problemType, setProblemType] = useState<ProblemType>('SALBP-1');
    const [constraint, setConstraint] = useState<string>(''); // C or N
    const [params, setParams] = useState<AlgorithmParams>(DEFAULT_PARAMS);

    const handleSolve = () => {
        const val = parseFloat(constraint);
        if (isNaN(val) || val <= 0) {
            alert("Please enter a valid constraint value (C or N)");
            return;
        }
        onSolve(problemType, val, params);
    };

    return (
        <div className="w-80 h-full border-r border-slate-800 bg-slate-950 flex flex-col overflow-y-auto">
            <div className="p-4 border-b border-slate-800">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                    SALBP Solver
                </h1>
                <p className="text-xs text-slate-500">Antigravity & User Pair Programming</p>
            </div>

            <div className="flex-1 p-4 space-y-6">

                {/* Input Section */}
                <div className="space-y-2">
                    <Label>Input Data (JSON)</Label>
                    <Textarea
                        className="font-mono text-xs h-40"
                        value={jsonInput}
                        onChange={(e) => setJsonInput(e.target.value)}
                        placeholder='[{"id": 1, "time": 5, "predecessors": []}, ...]'
                    />
                </div>

                {/* Problem Config */}
                <Card className="bg-slate-900/50 border-slate-800">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm">Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-2 space-y-4">
                        <div className="space-y-1">
                            <Label>Problem Type</Label>
                            <Select
                                value={problemType}
                                onChange={(e) => setProblemType(e.target.value as ProblemType)}
                            >
                                <option value="SALBP-1">SALBP-1 (Min N given C)</option>
                                <option value="SALBP-2">SALBP-2 (Min C given N)</option>
                            </Select>
                        </div>

                        <div className="space-y-1">
                            <Label>
                                {problemType === 'SALBP-1' ? "Cycle Time (C)" : "Number of Stations (N)"}
                            </Label>
                            <Input
                                type="number"
                                value={constraint}
                                onChange={(e) => setConstraint(e.target.value)}
                                placeholder={problemType === 'SALBP-1' ? "e.g. 10" : "e.g. 4"}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Algorithm Params */}
                <Card className="bg-slate-900/50 border-slate-800">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm">Simulated Annealing</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-2 space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <Label className="text-xs">Init Temp</Label>
                                <Input
                                    type="number"
                                    className="h-8 text-xs"
                                    value={params.initialTemp}
                                    onChange={(e) => setParams({ ...params, initialTemp: parseFloat(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Cooling</Label>
                                <Input
                                    type="number" step="0.001"
                                    className="h-8 text-xs"
                                    value={params.coolingRate}
                                    onChange={(e) => setParams({ ...params, coolingRate: parseFloat(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Max Iterations</Label>
                            <Input
                                type="number"
                                className="h-8 text-xs"
                                value={params.maxIterations}
                                onChange={(e) => setParams({ ...params, maxIterations: parseInt(e.target.value) })}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="p-4 border-t border-slate-800 space-y-2">
                <Button
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                    onClick={handleSolve}
                    disabled={isSolving}
                >
                    {isSolving ? (
                        <>Solving...</>
                    ) : (
                        <>
                            <Play className="w-4 h-4 mr-2" /> Start Optimization
                        </>
                    )}
                </Button>
                <Button variant="outline" className="w-full bg-slate-800 hover:bg-slate-700 border-slate-700" onClick={onReset}>
                    <RotateCcw className="w-4 h-4 mr-2" /> Reset
                </Button>
            </div>
        </div>
    );
};
