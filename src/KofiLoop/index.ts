import Loop, { LoopReturn, LoopSelf } from './Loop';

/**
 * Starts a new loop.
 * @param handle The function to loop
 * @param interval The interval in milliseconds
 * @param args Some arguments to pass to function
 * 
 * @see {@link LoopSelf} for handler scope ('this' reference).
 */
export function startLoop(handler: Promise<any> | ((this: LoopSelf, ...args: any[])=>any), interval: number, ...args: any[])
{
    var loop = new Loop(handler, interval, ...args);
    loop.run();
    return loop.getReturnValue();
}

/**
 * Registers a new loop but don't start it.
 * @param handle The function to loop
 * @param interval The interval in milliseconds
 * @param args Some arguments to pass to function
 * 
 * @see {@link LoopSelf} for handler scope ('this' reference).
 */
export function registerLoop(handler: Promise<any> | ((this: LoopSelf, ...args: any[])=>any), interval: number, ...args: any[])
{
    return new Loop(handler, interval, ...args).getReturnValue();
}