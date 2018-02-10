import * as Loop from "./Loop";
/**
 * Starts a new loop.
 * @param handle The function to loop
 * @param interval The interval in milliseconds
 * @param args Some arguments to pass to function
 *
 * @see {@link LoopSelf} for handler scope ('this' reference).
 */
export declare function startLoop(handler: Promise<any> | ((this: Loop.LoopSelf, ...args: any[]) => any), interval: number, ...args: any[]): Loop.LoopReturn;
/**
 * Registers a new loop but don't start it.
 * @param handle The function to loop
 * @param interval The interval in milliseconds
 * @param args Some arguments to pass to function
 *
 * @see {@link LoopSelf} for handler scope ('this' reference).
 */
export declare function registerLoop(handler: Promise<any> | ((this: Loop.LoopSelf, ...args: any[]) => any), interval: number, ...args: any[]): Loop.LoopReturn;
