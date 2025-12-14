export interface Task {
    id: number;
    time: number; // duration
    predecessors: number[];
    successors: number[];
}

export interface ProblemData {
    tasks: Task[];
    cycleTime?: number; // C
    stationCount?: number; // N
}

export interface Station {
    id: number;
    tasks: number[]; // Task IDs
    totalTime: number;
    idleTime: number;
}

export interface Solution {
    stations: Station[];
    cycleTime: number;
    efficiency: number;
    smoothnessIndex: number;
    cost: number; // For optimization visualization
}

export type ProblemType = 'SALBP-1' | 'SALBP-2';

export interface AlgorithmParams {
    initialTemp: number;
    coolingRate: number;
    maxIterations: number;
}

export interface OptimizationStep {
    iteration: number;
    cost: number;
    bestCost: number;
    solution: Solution;
    currentTemp: number;
    acceptanceProbability: number;
    status: 'improved' | 'accepted_worse' | 'rejected';
    candidateCost?: number;
}
