'use client';

import { useState, useRef } from 'react';

export default function EvaluatorPage() {
    const [isRunning, setIsRunning] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [stats, setStats] = useState({ totalProcessed: 0, lastBatch: 0 });
    const stopRef = useRef(false);

    const addLog = (msg: string) => {
        setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 50));
    };

    const processBatch = async () => {
        if (stopRef.current) {
            setIsRunning(false);
            addLog('Process stopped by user.');
            return;
        }

        try {
            const res = await fetch('/api/admin/evaluate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ batchSize: 20 })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'API Error');
            }

            if (data.count === 0) {
                addLog('No more prompts to process. Finished!');
                setIsRunning(false);
                return;
            }

            setStats(prev => ({
                totalProcessed: prev.totalProcessed + (data.updated || 0),
                lastBatch: data.updated
            }));

            addLog(`Batch complete. Processed: ${data.processed}, Updated: ${data.updated}`);

            // Continue if running
            if (!stopRef.current) {
                setTimeout(processBatch, 1000); // 1s delay between batches
            } else {
                setIsRunning(false);
                addLog('Process stopped by user.');
            }
        } catch (err: any) {
            addLog(`Error: ${err.message}`);
            setIsRunning(false);
        }
    };

    const handleStart = () => {
        stopRef.current = false;
        setIsRunning(true);
        addLog('Starting evaluation loop...');
        processBatch();
    };

    const handleStop = () => {
        stopRef.current = true;
        addLog('Stopping...');
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-yellow-400">🍌 Banana Prompts Evaluator</h1>

                <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                        <h2 className="text-xl font-semibold mb-4">Control Panel</h2>
                        <div className="flex gap-4">
                            <button
                                onClick={handleStart}
                                disabled={isRunning}
                                className={`px-6 py-3 rounded-lg font-bold transition-all ${isRunning
                                    ? 'bg-gray-600 cursor-not-allowed opacity-50'
                                    : 'bg-green-600 hover:bg-green-500 shadow-lg shadow-green-900/50'
                                    }`}
                            >
                                {isRunning ? 'Running...' : 'Start Evaluation'}
                            </button>

                            <button
                                onClick={handleStop}
                                disabled={!isRunning}
                                className={`px-6 py-3 rounded-lg font-bold transition-all ${!isRunning
                                    ? 'bg-gray-600 cursor-not-allowed opacity-50'
                                    : 'bg-red-600 hover:bg-red-500 shadow-lg shadow-red-900/50'
                                    }`}
                            >
                                Stop
                            </button>

                            <a
                                href="/api/admin/export-csv"
                                target="_blank"
                                className="px-6 py-3 rounded-lg font-bold bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/50 flex items-center justify-center gap-2"
                            >
                                <span>📥</span> Export
                            </a>
                        </div>
                    </div>

                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                        <h2 className="text-xl font-semibold mb-4">Statistics</h2>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Session Processed:</span>
                                <span className="text-2xl font-mono text-blue-400">{stats.totalProcessed}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Last Batch:</span>
                                <span className="font-mono text-green-400">{stats.lastBatch}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-950 p-6 rounded-xl border border-gray-800 h-96 overflow-hidden flex flex-col">
                    <h3 className="text-lg font-semibold mb-2 text-gray-500">Activity Log</h3>
                    <div className="flex-1 overflow-y-auto font-mono text-sm space-y-1">
                        {logs.map((log, i) => (
                            <div key={i} className="text-gray-300 border-b border-gray-900 pb-1">
                                {log}
                            </div>
                        ))}
                        {logs.length === 0 && <span className="text-gray-600 italic">Ready to start...</span>}
                    </div>
                </div>
            </div>
        </div>
    );
}
