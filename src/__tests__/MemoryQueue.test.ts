import {MemoryQueue} from '../MemoryQueue';
import {FailedQueueTask} from "../types";

describe('MemoryQueue', () => {
    let queue: MemoryQueue<number>;
    let worker: jest.Mock<Promise<void>, [number]>;

    describe('should works correctly with basic tests', () => {
        beforeEach(() => {
            worker = jest.fn(async (_: number) => {
                return new Promise((resolve) => setTimeout(resolve, 1));
            });
            queue = new MemoryQueue(worker, 3);
        });

        test('should process all pushed tasks correctly', async () => {
            queue.push(1);
            queue.push(2);
            queue.push(3);
            expect(worker).toHaveBeenCalledTimes(3);

            queue.push(1);
            queue.push(2);
            queue.push(3);
            expect(worker).toHaveBeenCalledTimes(3);

            await queue.waitForAll();

            expect(worker).toHaveBeenCalledTimes(6);
        });

        test('should call the callback after task completion', async () => {
            const callback = jest.fn();
            queue.push(1, callback);

            await queue.waitForAll();

            expect(callback).toHaveBeenCalled();
        });

        test('should pause and resume processing tasks', async () => {
            queue.push(1);
            queue.push(2);
            queue.pause();
            queue.push(3);

            expect(worker).toHaveBeenCalledTimes(2);

            queue.resume();
            await queue.waitForAll();

            expect(worker).toHaveBeenCalledTimes(3);
        });

        test('should handle errors in worker function', async () => {
            jest.spyOn(console, 'error').mockImplementation();
            worker.mockImplementationOnce(async () => {
                throw new Error('Test error');
            });

            queue.push(1);
            queue.push(2);

            await queue.waitForAll();

            expect(worker).toHaveBeenCalledTimes(2);
            expect(console.error).toHaveBeenCalled();
        });

        it('should call onError listener when task fails', async () => {
            jest.spyOn(console, 'error').mockImplementation();
            const onError = jest.fn();
            queue.onError(onError);
            worker.mockImplementationOnce(async () => {
                throw new Error('Test error');
            });

            queue.push(1);
            queue.push(2);

            await queue.waitForAll();

            expect(worker).toHaveBeenCalledTimes(2);
            expect(onError).toHaveBeenCalledTimes(1);
            expect(onError).toHaveBeenCalledWith(new FailedQueueTask(new Error('Test error'), 1));
            expect(onError.mock.calls[0][0].getTask()).toBe(1);
        });
    });

    describe('should work with provided sample', () => {
        beforeEach(() => {
            worker = jest.fn(async (_: number) => {
                const duration = Math.random() * 2;
                await new Promise(r => setTimeout(r, duration));
            });
        })

        it('should process tasks concurrently with 1 worker', async () => {
            const queue = new MemoryQueue(worker, 1);

            queue.push(10);
            queue.push(9);
            queue.push(8);
            queue.push(7);

            await queue.waitForAll();


            expect(worker).toHaveBeenCalledTimes(4);
        });

        it('should process tasks concurrently with multiple workers', async () => {
            const queue = new MemoryQueue(worker, 3);

            queue.push(10);
            queue.push(9);
            queue.push(8);
            queue.push(7);
            queue.push(6);
            queue.push(5);
            queue.push(4);
            queue.push(3);
            queue.push(2);
            queue.push(1);

            await queue.waitForAll();

            expect(worker).toHaveBeenCalledTimes(10);
        });
    });
});