export type WorkerFunction<T> = (value: T) => Promise<void>;
export type CallbackFunction = () => void;
export declare class FailedQueueTask<T> extends Error {
    private task;
    constructor(error: Error, task: T);
    getTask(): T;
}
