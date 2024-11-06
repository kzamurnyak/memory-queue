# MemoryQueue

MemoryQueue is a local in-memory queue that allows you to manage tasks with a maximum number of concurrent executions.
It supports pausing and resuming the queue, and provides a way to handle task errors.

## Installation

To install the necessary dependencies, run:

```sh
npm install
```

To install the `MemoryQueue` package from the GitHub repository, run:

```sh
npm install git+https://github.com/kzamurnyak/memory-queue.git
```

## Usage

### Importing MemoryQueue

First, import the `MemoryQueue` class:

```typescript
import {MemoryQueue} from './MemoryQueue';
```

Importing MemoryQueue as npm module:

```typescript
import {MemoryQueue} from 'memory-queue';
```

### Creating a MemoryQueue

Create a new instance of `MemoryQueue` with a worker function and a maximum number of concurrent tasks:

```typescript
const worker = async (value) => {
    // Your async task logic here
};

const queue = new MemoryQueue(worker, 2);
```

### Adding Tasks to the Queue

Use the `push` method to add tasks to the queue. You can also provide an optional callback that will be called after the
task is completed:

```typescript
queue.push(1, () => {
    console.log('Task 1 completed');
});

queue.push(2);
queue.push(3);
```

### Waiting for All Tasks to Complete

Use the `waitForAll` method to wait until all tasks in the queue are processed:

```typescript
await queue.waitForAll();
console.log('All tasks completed');
```

### Pausing and Resuming the Queue

You can pause the queue to stop processing new tasks and resume it later:

```typescript
queue.pause();
queue.push(4); // This task will not start until the queue is resumed

queue.resume();
```

### Handling Task Errors

You can subscribe to task errors using the `onTaskError` method:

```typescript
queue.onTaskError((error) => {
    console.error('Task error:', error);
});
```

## Running Tests

To run the tests, use the following command:

```sh
npx jest
```

## License

This project is licensed under the MIT License.
