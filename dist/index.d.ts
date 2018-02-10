import * as Loop from "./Loop";
/**
 * Starts a new loop.
 * @param handle The function to loop
 * @param interval The interval in ms
 * @param args Some arguments to pass to function
 */
export declare function startLoop(handle: Promise<any> | ((this: Loop.LoopSelf, ...args: any[]) => any), interval: number, ...args: any[]): Loop.LoopReturn;
/**
 * Registers a new loop but don't start it.
 * @param handle The function to loop
 * @param interval The interval in ms
 * @param args Some arguments to pass to function
 */
export declare function registerLoop(handle: Promise<any> | ((this: Loop.LoopSelf, ...args: any[]) => any), interval: number, ...args: any[]): Loop.LoopReturn;
