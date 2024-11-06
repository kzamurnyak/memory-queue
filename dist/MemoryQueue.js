"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryQueue = void 0;
const types_1 = require("./types");
const events_1 = require("events");
class MemoryQueue {
    constructor(worker, maxConcurrentTasks) {
        this.worker = worker;
        this.maxConcurrentTasks = maxConcurrentTasks;
        this.queue = [];
        this.activeTasks = 0;
        this.paused = false;
        this.resolveWaitForAll = null;
        this.eventEmitter = new events_1.EventEmitter();
    }
    push(value, callback) {
        this.queue.push({ value, callback });
        this.processQueue();
    }
    waitForAll() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.activeTasks === 0 && this.queue.length === 0) {
                return;
            }
            return new Promise((resolve) => {
                this.resolveWaitForAll = resolve;
            });
        });
    }
    pause() {
        this.paused = true;
    }
    resume() {
        this.paused = false;
        this.processQueue();
    }
    onError(listener) {
        this.eventEmitter.on('taskError', listener);
    }
    processQueue() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.paused || this.activeTasks >= this.maxConcurrentTasks || this.queue.length === 0) {
                return;
            }
            const { value, callback } = this.queue.shift();
            this.activeTasks++;
            try {
                yield this.worker(value);
                if (callback) {
                    callback();
                }
            }
            catch (error) {
                console.error('Error processing task:', error);
                this.emitTaskError(new types_1.FailedQueueTask(error, value));
            }
            finally {
                this.activeTasks--;
                yield this.processQueue();
                if (this.activeTasks === 0 && this.queue.length === 0 && this.resolveWaitForAll) {
                    this.resolveWaitForAll();
                    this.resolveWaitForAll = null;
                }
            }
        });
    }
    emitTaskError(error) {
        this.eventEmitter.emit('taskError', error);
    }
}
exports.MemoryQueue = MemoryQueue;
