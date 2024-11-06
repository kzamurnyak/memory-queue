import { CallbackFunction, FailedQueueTask, WorkerFunction } from "./types";
export declare class MemoryQueue<T> {
    private worker;
    private maxConcurrentTasks;
    private queue;
    private activeTasks;
    private paused;
    private resolveWaitForAll;
    private eventEmitter;
    constructor(worker: WorkerFunction<T>, maxConcurrentTasks: number);
    push(value: T, callback?: CallbackFunction): void;
    waitForAll(): Promise<void>;
    pause(): void;
    resume(): void;
    onError(listener: (error: FailedQueueTask<T>) => void): void;
    private processQueue;
    private emitTaskError;
}
