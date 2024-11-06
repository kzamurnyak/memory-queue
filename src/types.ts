export type WorkerFunction<T> = (value: T) => Promise<void>;
export type CallbackFunction = () => void;

export class FailedQueueTask<T> extends Error {
    constructor(error: Error, private task: T) {
        super(`Task failed: ${error.message}`);
        this.task = task;
    }

    getTask(): T {
        return this.task;
    }

}