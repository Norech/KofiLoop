/// <reference types="node" />
import { EventEmitter } from 'events';
/**
 * Loop status properties.
 */
export interface LoopStatus {
    isStopped: boolean;
    isPending: boolean;
    lastReturnedValue: any;
    lastThrownError: any;
    loopStep: number;
    deltaTimeStart?: [number, number];
    deltaTime: number;
}
/**
 * The loop handlerr.
 */
export default class Loop extends EventEmitter {
    status: LoopStatus;
    loopReturn: LoopReturn;
    loopSelf: LoopSelf;
    interval: number;
    args: any[];
    finishEventCalled: boolean;
    protected loopHandler?: Promise<any> | ((this: LoopSelf, ...args: any[]) => any);
    /**
     * Constructor of the Loop class.
     */
    constructor(handler: Promise<any> | ((this: LoopSelf, ...args: any[]) => any), interval: number, ...args: any[]);
    measureTime(start?: [number, number]): number | [number, number];
    /**
     * Runs the loop.
     */
    run(): void;
    /**
     * Returns if loop is stopped.
     */
    isStopped(): boolean;
    /**
     * Gets the loop return value.
     */
    getReturnValue(): LoopReturn;
    /**
     * Executes a step.
     */
    executeStep(): this | undefined;
    /**
     * Finishs the current step and starts a new step.
     */
    finishStep(): void;
    /**
     * Registers events.
     */
    listenEvents(): void;
}
/**
 * Class used to interact inside of loop.
 */
export declare class LoopSelf {
    protected loop: Loop;
    /**
     * Current loop interval.
     */
    readonly interval: number;
    /**
     * Time difference between last step initialization and last step end.
     */
    readonly deltaTime: number;
    /**
     * Current loop step.
     */
    readonly step: number;
    /**
     * Value of the loop step.
     */
    value: any;
    /**
     * Constructor of the LoopSelf class.
     */
    constructor(loop: Loop);
    /**
     * Stop current loop.
     */
    stop(value?: any): void;
    /**
     * Start a subloop and pause current loop until the end of the subloop.
     * @param handler The function to loop
     * @param interval The interval in ms
     * @param args Some arguments to pass to function
     */
    startLoop(handler: Promise<any> | ((this: LoopSelf, ...args: any[]) => any), interval: number, ...args: any[]): LoopReturn;
    /**
     * Listen to events
     * @ignore
     */
    protected listenEvents(): void;
}
/**
 * Class returned by loops.
 */
export declare class LoopReturn extends EventEmitter implements PromiseLike<any> {
    protected loop: Loop;
    protected parentLoop?: Loop;
    /**
     * Constructor of the Loop class.
     */
    constructor(loop: Loop);
    /**
     * Starts or restarts the loop.
     */
    run(): this;
    /**
     * Called when a loop step is finished.
     */
    step(callback: (loop: LoopSelf, value: any) => void, step?: number): this;
    /**
     * Sets a loop as parent loop.
     * @param loop The parent loop
     */
    parent(loop: Loop): this;
    /**
     * Starts a loop after the end of the currentLoop.
     * @param handler The function to loop
     * @param interval The interval in ms
     * @param args Some arguments to pass to function
     */
    startLoop(handler: Promise<any> | ((this: LoopSelf, ...args: any[]) => any), interval: number, ...args: any[]): LoopReturn;
    /**
     * Called when loop is stopped.
     */
    end(callback: (value: any) => any, errorCallback?: (err: any) => any): this;
    /**
     * Alias for end(…): Called when loop is stopped.
     */
    then(callback: (value: any) => any, errorCallback: (err: any) => any): this;
    /**
     * Called when an uncaught error is thrown.
     */
    error(callback: (err: any) => any): this;
    /**
     * Alias for error(…): Called when an uncaught error is thrown.
     */
    catch(callback: () => any): this;
    /**
     * Listen to events
     * @ignore
     */
    protected listenEvents(): void;
}
