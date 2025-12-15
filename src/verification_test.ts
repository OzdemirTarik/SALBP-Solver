
import { solveSA } from './lib/salbp';
import { Task, AlgorithmParams } from './types';

// Define a simple problem: 1 -> 2 -> 3 -> 4
const tasks: Task[] = [
    { id: 1, time: 10, predecessors: [], successors: [2] },
    { id: 2, time: 10, predecessors: [1], successors: [3] },
    { id: 3, time: 10, predecessors: [2], successors: [4] },
    { id: 4, time: 10, predecessors: [3], successors: [] },
];

const params: AlgorithmParams = {
    initialTemp: 100,
    coolingRate: 0.95,
    maxIterations: 100
};

async function runTest() {
    console.log("Starting Verification Test...");

    // Test Type 1: Given C=20, Minimize Stations
    // Optimal: [1,2], [3,4] -> 2 Stations.
    console.log("\n--- Testing SALBP-1 (Given C=20) ---");
    const constraint1 = 20;
    const generator1 = solveSA(tasks, 'SALBP-1', constraint1, params);
    
    let lastStep1;
    for await (const step of generator1) {
        lastStep1 = step;
    }
    
    if (lastStep1) {
        console.log("Final Solution Stations:", lastStep1.solution.stations.length);
        console.log("Stations:", JSON.stringify(lastStep1.solution.stations, null, 2));
        if (lastStep1.solution.stations.length === 2) {
             console.log("✅ SALBP-1 Test Passed");
        } else {
             console.error("❌ SALBP-1 Test Failed. Expected 2 stations.");
        }
    }

    // Test Type 2: Given N=2, Minimize Cycle Time
    // Optimal: C=20.
    console.log("\n--- Testing SALBP-2 (Given N=2) ---");
    const constraint2 = 2;
    const generator2 = solveSA(tasks, 'SALBP-2', constraint2, params);

    let lastStep2;
    for await (const step of generator2) {
        lastStep2 = step;
    }

    if (lastStep2) {
        console.log("Final Solution Cycle Time:", lastStep2.solution.cycleTime);
        if (lastStep2.solution.cycleTime === 20) {
             console.log("✅ SALBP-2 Test Passed");
        } else {
             console.error(`❌ SALBP-2 Test Failed. Expected 20, got ${lastStep2.solution.cycleTime}`);
        }
    }
}

runTest().catch(console.error);
