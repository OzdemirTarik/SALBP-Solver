import { Task, Station, Solution, OptimizationStep, AlgorithmParams, ProblemType } from '../types';

// Helper to parse JSON input
export const parseInput = (jsonInput: string): Task[] => {
    try {
        const parsed = JSON.parse(jsonInput);
        let rawTasks: any[] = [];

        // Handle array input or object with tasks property
        if (Array.isArray(parsed)) {
            rawTasks = parsed;
        } else if (parsed.tasks && Array.isArray(parsed.tasks)) {
            rawTasks = parsed.tasks;
        } else {
            throw new Error("Invalid format: Expected array of tasks or object with 'tasks' array.");
        }

        // Normalize tasks
        // We need to ensure we have predecessors. If input has successors, we calculate predecessors.
        const map = new Map<number, Task>();

        // First pass: Init tasks
        rawTasks.forEach((t) => {
            map.set(t.id, {
                id: t.id,
                time: t.time || t.duration || 0,
                predecessors: t.predecessors || [],
                successors: t.successors || [],
            });
        });

        // Second pass: cross-reference relations
        // If we have successors but no predecessors, derive them.
        // If we have predecessors but no successors, derive them.
        map.forEach((task) => {
            task.successors.forEach(succId => {
                const succ = map.get(succId);
                if (succ && !succ.predecessors.includes(task.id)) {
                    succ.predecessors.push(task.id);
                }
            });

            task.predecessors.forEach(predId => {
                const pred = map.get(predId);
                if (pred && !pred.successors.includes(task.id)) {
                    pred.successors.push(task.id);
                }
            });
        });

        return Array.from(map.values()).sort((a, b) => a.id - b.id);
    } catch (e: any) {
        throw new Error("Failed to parse input: " + e.message);
    }
};

// Check for cycles
export const hasCycle = (tasks: Task[]): boolean => {
    const visited = new Set<number>();
    const recStack = new Set<number>();
    const map = new Map(tasks.map(t => [t.id, t]));

    const dfs = (id: number): boolean => {
        if (recStack.has(id)) return true;
        if (visited.has(id)) return false;

        visited.add(id);
        recStack.add(id);

        const task = map.get(id);
        if (task) {
            for (const succ of task.successors) {
                if (dfs(succ)) return true;
            }
        }

        recStack.delete(id);
        return false;
    };

    for (const task of tasks) {
        if (dfs(task.id)) return true;
    }
    return false;
};

// --- SIMULATED ANNEALING LOGIC ---

// Heuristic: Pack tasks into stations given a sequence (Permutation)
// Respects precedence: A task can only be assigned if all its predecessors are already assigned (in previous stations or same station before it).
// But standard permutation-based decoding usually works by taking tasks one by one from the sequence.
// If a task in schema is not ready (predecessors not finished), we cannot validly decode it strictly in that order if we just act sequentially.
// STANDARD APPROACH: "Topological Sort" based decoding.
// Actually for SA in SALBP, we usually manipulate a PRIORITY LIST (sequence). 
// When packing, we pick the first "Available" task from the priority list.
// Available = all predecessors assigned.
// If we strictly follow the sequence, the sequence MUST be a topological sort.
// So, the Neighbor Generation involves "Swapping tasks" but ensuring we stay Topological? 
// OR we allow invalid sequences and penalize?
// Better: Neighbor = Swap any two, then "Repair" to make it topological? 
// OR: Only swap two tasks if they are not dependent?
// SIMPLEST ROBUST METHOD: Use sequence as priority values. At each step of packing, available tasks are candidates. Pick the one with highest priority (earliest in sequence).
// This guarantees validity. The SA optimizes the SEQUENCE.

const evaluateSequence = (
    tasks: Task[],
    sequence: number[], // Order of Task IDs
    problemType: ProblemType,
    constraint: number // C for Type 1, N for Type 2
): Solution => {
    const taskMap = new Map(tasks.map(t => [t.id, t]));
    // Re-order tasks based on sequence (which acts as priority)
    // Actually, let's use the standard station-oriented decoding with priority list.

    // Logic: 
    // 1. Identify all tasks whose predecessors are finished (Initially those with 0 predecessors).
    // 2. Select the one that appears earliest in the `sequence` array.
    // 3. Assign to current station if fits; else open new station.

    // Wait, Type 2 (Given N, min C).
    // This usually requires Binary Search on C if we use the above Greedy packing.
    // Or we use a specific Type 2 decoding?
    // Let's stick to: "Given C, pack into Min Stations". 
    // For Type 2, we can try different C values (Binary Search) to find min C that fits in N stations.
    // OR use a "Fix N" decoding. 
    // Let's implement Type 1 core decoder (Given C -> get Stations).

    // Decoding specific for "Given C":
    // We need to iterate and build stations.

    // We use a topological sort approach, so we don't need dynamic available task tracking here.

    // Helper to get Cycle Time for Type 2 if we are doing flexible packing?
    // If Type 2, checking constraints is harder directly. 
    // Common approach for Type 2: Set C = Sum(Times) / N (Theoretical Lower Bound) to Sum(Times). 
    // But SA explores.
    // Let's interpret the Requirement: "Use a heuristic to pack tasks into the fixed N stations based on the sequence... Objective: Minimize C".
    // This sounds like we are partitioning the sequence into N segments? But Precedence matters.
    // Let's use the provided hint: "Minimize the maximum station time (Cycle Time)"

    // UNIFIED DECODER for SA:
    // The chromosome is a Topological Sort of all tasks. 
    // Decoder: 
    // For Type 1 (Given C): Pack greedy along topological sort. Result = number of stations. Cost = N.
    // For Type 2 (Given N): Cut the topological sort into N pieces to minimize Max(Sum). 
    // But simple cutting ignores precedence? No, because it is a topological sort, cutting it anywhere respects precedence (left part done before right part).
    // So for Type 2: We have a sequence T1..Tn. We need to place N-1 separators to minimize max segment sum.
    // This is a classic "Book Shelving" / "Linear Partitioning" problem.
    // Check validation: Cutting a topological sort is valid? 
    // Yes, because if we do tasks in order T1..Tn, all predecessors of Tk are in T1..Tk-1. 
    // So assigning T1..Ti to Station 1, Ti+1..Tj to Station 2 etc. is ALWAYS valid regarding precedence.
    // GREAT!

    // So:
    // 1. Chromosome = Topological Permutation.
    // 2. Neighbor = Swap 2 tasks. If result is not topological, repair or reject.
    //    Repairing is easy: Move tasks to strict precedence order? Or just swap and check `isTopological`.
    //    Validation: For (i < j), if Swap(i, j) violates (i must be before j), we revert.

    // decoding...

    // Is the sequence passed guaranteed topological?
    // We should enforce it.

    let decodedStations: Station[] = [];
    let computedC = 0;

    if (problemType === 'SALBP-1') {
        // Input constraint is C.
        const C = constraint;
        let sTasks: number[] = [];
        let sTime = 0;

        for (const taskId of sequence) {
            const t = taskMap.get(taskId)!;
            if (sTime + t.time <= C) {
                sTasks.push(taskId);
                sTime += t.time;
            } else {
                decodedStations.push({ id: decodedStations.length + 1, tasks: sTasks, totalTime: sTime, idleTime: C - sTime });
                sTasks = [taskId];
                sTime = t.time;
            }
        }
        if (sTasks.length > 0) {
            decodedStations.push({ id: decodedStations.length + 1, tasks: sTasks, totalTime: sTime, idleTime: C - sTime });
        }
        computedC = C;
    } else {
        // SALBP-2: Given N, minimize C.
        // We have a fixed order (sequence). We need to partition into <= N stations minimizing MaxTime.
        // This can be solved optimally for the *fixed sequence* using Binary Search on Answer or DP.
        // Binary Search is fast enough.
        const N = constraint;

        let low = Math.max(...tasks.map(t => t.time));
        let high = tasks.reduce((acc, t) => acc + t.time, 0);
        let bestCycleForSeq = high;

        // Helper: can we fit in N stations with max capacity cap?
        const canFit = (cap: number): boolean => {
            let stCount = 1;
            let currentLoad = 0;
            for (const taskId of sequence) {
                const t = taskMap.get(taskId)!;
                if (currentLoad + t.time <= cap) {
                    currentLoad += t.time;
                } else {
                    stCount++;
                    currentLoad = t.time;
                }
            }
            return stCount <= N;
        };

        while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            if (canFit(mid)) {
                bestCycleForSeq = mid;
                high = mid - 1;
            } else {
                low = mid + 1;
            }
        }

        // Reconstruction for bestCycleForSeq
        const C = bestCycleForSeq;
        let sTasks: number[] = [];
        let sTime = 0;
        for (const taskId of sequence) {
            const t = taskMap.get(taskId)!;
            if (sTime + t.time <= C) {
                sTasks.push(taskId);
                sTime += t.time;
            } else {
                decodedStations.push({ id: decodedStations.length + 1, tasks: sTasks, totalTime: sTime, idleTime: C - sTime });
                sTasks = [taskId];
                sTime = t.time;
            }
        }
        if (sTasks.length > 0) {
            decodedStations.push({ id: decodedStations.length + 1, tasks: sTasks, totalTime: sTime, idleTime: C - sTime });
        }
        computedC = C;
    }

    // Calculate Metrics
    const stationCount = decodedStations.length;
    // Recalculate global C if Type 1 (it is fixed)?? Actually if Type 1, cycle is Fixed.
    // But strict cycle time is valid.

    const efficiency = (tasks.reduce((a, b) => a + b.time, 0)) / (stationCount * computedC);
    const smoothness = Math.sqrt(decodedStations.reduce((acc, s) => acc + Math.pow(computedC - s.totalTime, 2), 0));

    // Cost: 
    // Type 1: Minimize Stations (Primary), then smothness (Secondary)
    // Type 2: Minimize CycleTime (Primary), then smothness
    let cost = 0;
    if (problemType === 'SALBP-1') {
        cost = stationCount * 10000 + smoothness;
    } else {
        cost = computedC * 10000 + smoothness;
    }

    return {
        stations: decodedStations,
        cycleTime: computedC,
        efficiency,
        smoothnessIndex: smoothness,
        cost
    };
};


// Initial Solution Generation
export const getInitialSolution = (tasks: Task[]): number[] => {
    // Generate valid topological sort using Kahn's algorithm or DFS
    // Kahn's is deterministic if we pick by ID, let's randomize for SA
    const inDegree = new Map<number, number>();
    const adj = new Map<number, number[]>();
    tasks.forEach(t => {
        inDegree.set(t.id, t.predecessors.length);
        adj.set(t.id, t.successors);
    });

    let queue = tasks.filter(t => t.predecessors.length === 0).map(t => t.id);
    const result: number[] = [];

    while (queue.length > 0) {
        // Random pick
        const idx = Math.floor(Math.random() * queue.length);
        const u = queue[idx];
        queue.splice(idx, 1);
        result.push(u);

        const successors = adj.get(u) || [];
        for (const v of successors) {
            inDegree.set(v, (inDegree.get(v) || 0) - 1);
            if (inDegree.get(v) === 0) {
                queue.push(v);
            }
        }
    }
    return result;
};

// Check if sequence is topological
const isTopological = (tasks: Task[], sequence: number[]): boolean => {
    const pos = new Map<number, number>();
    sequence.forEach((id, idx) => pos.set(id, idx));

    for (const t of tasks) {
        const p1 = pos.get(t.id);
        if (p1 === undefined) return false;
        for (const succId of t.successors) {
            const p2 = pos.get(succId);
            if (p2 === undefined || p1 > p2) return false;
        }
    }
    return true;
};

export async function* solveSA(
    tasks: Task[],
    problemType: ProblemType,
    constraint: number, // C or N
    params: AlgorithmParams
): AsyncGenerator<OptimizationStep> {

    let currentSeq = getInitialSolution(tasks);
    let currentSol = evaluateSequence(tasks, currentSeq, problemType, constraint);

    let bestSeq = [...currentSeq];
    let bestSol = currentSol;

    let temp = params.initialTemp;

    // Yield first state
    yield {
        iteration: 0,
        cost: currentSol.cost,
        bestCost: bestSol.cost,
        solution: currentSol,
        currentTemp: temp,
        acceptanceProbability: 1,
        status: 'improved'
    };

    for (let i = 1; i <= params.maxIterations; i++) {
        // Neighbor: Swap arbitrary two
        let isValid = false;
        let candidateSeq = [...currentSeq];

        let attempts = 0;
        // Try to find valid neighbor
        while (!isValid && attempts < 20) {
            const idx1 = Math.floor(Math.random() * candidateSeq.length);
            const idx2 = Math.floor(Math.random() * candidateSeq.length);
            if (idx1 === idx2) continue;

            // Swap
            [candidateSeq[idx1], candidateSeq[idx2]] = [candidateSeq[idx2], candidateSeq[idx1]];

            if (isTopological(tasks, candidateSeq)) {
                isValid = true;
            } else {
                // Revert
                [candidateSeq[idx1], candidateSeq[idx2]] = [candidateSeq[idx2], candidateSeq[idx1]];
            }
            attempts++;
        }

        if (!isValid) {
            // Step without move
            temp *= (1 - params.coolingRate);
            if (i % 10 === 0) { // Throttle updates
                yield {
                    iteration: i, cost: currentSol.cost, bestCost: bestSol.cost, solution: bestSol,
                    currentTemp: temp, acceptanceProbability: 0, status: 'rejected'
                };
            }
            continue;
        }

        const candidateSol = evaluateSequence(tasks, candidateSeq, problemType, constraint);

        // Acceptance
        const delta = candidateSol.cost - currentSol.cost;
        let p = 0;
        let status: 'improved' | 'accepted_worse' | 'rejected' = 'rejected';

        if (delta < 0) {
            p = 1.0;
            status = 'improved';
            currentSeq = candidateSeq;
            currentSol = candidateSol;

            if (currentSol.cost < bestSol.cost) {
                bestSol = currentSol;
                bestSeq = [...currentSeq];
            }
        } else {
            p = Math.exp(-delta / temp);
            if (Math.random() < p) {
                status = 'accepted_worse';
                currentSeq = candidateSeq;
                currentSol = candidateSol;
            }
        }

        temp *= (1 - params.coolingRate);

        // Always yield detailed steps for smooth visualization if speed > 0
        // Or throttle slightly if very fast.
        // For interactivity, let's yield if something interesting happened or periodically
        // Yielding every step might be too much for React state if 0ms delay, but fine for animation.
        // We rely on the App loop delay.

        yield {
            iteration: i,
            cost: currentSol.cost,
            bestCost: bestSol.cost,
            solution: status === 'rejected' ? currentSol : candidateSol, // Show what we considered
            currentTemp: temp,
            acceptanceProbability: p,
            status: status,
            candidateCost: candidateSol.cost
        };
    }
}
