/// <reference types="node" />
import { EventEmitter } from 'events';
/**
 * Loop status properties.
 * @internal
 * @private
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
 * The loop handler.
 * @internal
 * @private
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
     * @internal
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
 * Primary used as scope ('this' reference) in loop handlers.
 *
 * @protected
 * @use_reference Never create the object yourself and always use reference.
 */
export declare class LoopSelf {
    protected loop: Loop;
    /**
     * Current loop interval.
     * @readonly
     * @returns {number}
     */
    readonly interval: number;
    /**
     * Time difference between last step initialization and last step end.
     * @readonly
     * @returns {number}
     */
    readonly deltaTime: number;
    /**
     * Current loop step.
     * @readonly
     * @returns {number}
     */
    readonly step: number;
    /**
     * Boolean indicating if the loop is stopped.
     * @readonly
     */
    readonly isStopped: boolean;
    /**
     * Boolean indicating if the loop is pending.
     * @readonly
     */
    readonly isPending: boolean;
    /**
     * Value of the loop step.
     */
    value: any;
    /**
     * Constructor of the LoopSelf class.
     * @hidden
     */
    constructor(loop: Loop);
    /**
     * Stop current loop.
     */
    stop(value?: any): void;
    /**
     * Start a subloop and pause current loop until the end of the subloop.
     * @param handler The function to loop
     * @param interval The interval in milliseconds
     * @param args Some arguments to pass to function
     *
     * @see {@link LoopSelf} for handler scope ('this' reference).
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
 *
 * @protected
 * @use_reference Never create the object yourself and always use reference.
 */
export declare class LoopReturn extends EventEmitter implements PromiseLike<any> {
    protected loop: Loop;
    protected parentLoop?: Loop;
    /**
     * Constructor of the Loop class.
     * @hidden
     */
    constructor(loop: Loop);
    /**
     * Boolean indicating if the loop is stopped.
     * @readonly
     */
    readonly isStopped: boolean;
    /**
     * Boolean indicating if the loop is pending.
     * @readonly
     */
    readonly isPending: boolean;
    /**
     * Starts or restarts the loop.
     */
    run(): this;
    /**
     * Stops the loop.
     */
    stop(): void;
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
     * Starts a loop after the end of the current loop.
     * @param handler The function to loop
     * @param interval The interval in milliseconds
     * @param args Some arguments to pass to function
     *
     * @see {@link LoopSelf} for handler scope ('this' reference).
     */
    startLoop(handler: Promise<any> | ((this: LoopSelf, ...args: any[]) => any), interval: number, ...args: any[]): LoopReturn;
    /**
     * Called when loop is stopped.
     */
    end(callback: (value: any) => any, errorCallback?: (err: any) => any): this;
    /**
     * Alias for {@link end}: Called when loop is stopped.
     */
    then(callback: (value: any) => any, errorCallback: (err: any) => any): this;
    /**
     * Called when an uncaught error is thrown.
     */
    error(callback: (err: any) => any): this;
    /**
     * Alias for {@link error}: Called when an uncaught error is thrown.
     */
    catch(callback: () => any): this;
    /**
     * Listen to events
     * @ignore
     */
    protected listenEvents(): void;
}
