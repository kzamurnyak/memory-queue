"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FailedQueueTask = void 0;
class FailedQueueTask extends Error {
    constructor(error, task) {
        super(`Task failed: ${error.message}`);
        this.task = task;
        this.task = task;
    }
    getTask() {
        return this.task;
    }
}
exports.FailedQueueTask = FailedQueueTask;
