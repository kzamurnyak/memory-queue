import {CallbackFunction, FailedQueueTask, WorkerFunction} from "./types";
import {EventEmitter} from "events";

export class MemoryQueue<T> {
    private queue: { value: T; callback?: CallbackFunction }[] = [];
    private activeTasks = 0;
    private paused = false;
    private resolveWaitForAll: (() => void) | null = null;
    private eventEmitter = new EventEmitter();

    constructor(private worker: WorkerFunction<T>, private maxConcurrentTasks: number) {
    }

    push(value: T, callback?: CallbackFunction): void {
        this.queue.push({value, callback});
        this.processQueue();
    }

    async waitForAll(): Promise<void> {
        if (this.activeTasks === 0 && this.queue.length === 0) {
            return;
        }
        return new Promise((resolve) => {
            this.resolveWaitForAll = resolve;
        });
    }

    pause(): void {
        this.paused = true;
    }

    resume(): void {
        this.paused = false;
        this.processQueue();
    }

    onError(listener: (error: FailedQueueTask<T>) => void): void {
        this.eventEmitter.on('taskError', listener);
    }

    private async processQueue(): Promise<void> {
        if (this.paused || this.activeTasks >= this.maxConcurrentTasks || this.queue.length === 0) {
            return;
        }

        const {value, callback} = this.queue.shift()!;
        this.activeTasks++;

        try {
            await this.worker(value);
            if (callback) {
                callback();
            }
        } catch (error) {
            console.error('Error processing task:', error);
            this.emitTaskError(new FailedQueueTask(error as Error, value));
        } finally {
            this.activeTasks--;
            await this.processQueue();

            if (this.activeTasks === 0 && this.queue.length === 0 && this.resolveWaitForAll) {
                this.resolveWaitForAll();
                this.resolveWaitForAll = null;
            }
        }
    }

    private emitTaskError(error: Error): void {
        this.eventEmitter.emit('taskError', error);
    }
}