
import { startLoop, registerLoop } from './index';
import {EventEmitter} from 'events';

    
/**
 * Loop status properties.
 * @internal
 * @private
 */
export interface LoopStatus
{
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
export default class Loop extends EventEmitter
{
    status: LoopStatus;

    loopReturn: LoopReturn;
    loopSelf: LoopSelf;

    interval: number;
    args: any[];

    finishEventCalled: boolean = false;

    protected loopHandler?: Promise<any> | ((this: LoopSelf, ...args: any[])=>any);

    /**
     * Constructor of the Loop class.
     * @internal
     */
    constructor(handler: Promise<any> | ((this: LoopSelf, ...args: any[])=>any), interval: number, ...args: any[])
    {
        super();
        this.setMaxListeners(50);

        if(typeof interval !== "number")
            throw new TypeError("Interval argument is not a number.");

        this.status = {
            isStopped: true,
            isPending: false,
            lastThrownError: null,
            lastReturnedValue: undefined,
            loopStep: 1,
            deltaTime: 0
        };
        
        this.interval = interval;
        this.args = args;

        this.loopReturn = new LoopReturn(this);
        this.loopSelf = new LoopSelf(this);

        this.loopHandler = handler;

        this.listenEvents();
    }

    measureTime(start?: [number, number]) {
        if ( !start ) return process.hrtime();
        var end = process.hrtime(start);
        return Math.round((end[0]*1000) + (end[1]/1000000));
    }

    /**
     * Runs the loop.
     * @throws {\Error} if loop is not stopped.
     */
    run()
    {
        if(this.status.isStopped){
            this.emit('start');
            this.status.isStopped = false;
            this.executeStep();
        } else {
            throw new Error('Loop not stopped.');
        }
    }

    /**
     * Returns if loop is stopped.
     */
    isStopped()
    {
        if((this.status.isStopped || this.status.lastThrownError != null) && !this.finishEventCalled){
            this.emit('beforeFinish');
            this.emit('finish');
            this.emit('afterFinish');
            this.finishEventCalled = true;
        }
        return this.status.isStopped || this.status.lastThrownError != null;
    }

    /**
     * Gets the loop return value.
     */
    getReturnValue()
    {
        return this.loopReturn;
    }

    /**
     * Executes a step.
     */
    executeStep()
    {
        if(this.isStopped()) return;

        this.emit('stepStart');
        this.status.lastReturnedValue = undefined;

        setTimeout(() => {
            if(this.isStopped()) return;
                
            this.emit('beforeStepExecute');
            this.emit('stepExecute');
            this.emit('afterStepExecute');

            var handler = this.loopHandler;
            
            if(typeof handler === "function")
            {
                try
                {
                    var value = handler.apply(this.loopSelf, ...this.args);
                    if(this.status.lastReturnedValue === undefined){
                        this.status.lastReturnedValue = value;
                    }
                    this.finishStep();
                }
                catch (error)
                {
                    this.status.lastThrownError = error;
                    this.finishStep();
                }
            }

            // TODO: Add a full support for Promises - this one is too restricted.
            else if(typeof handler !== "undefined" && typeof handler.then === "function")
            {
                try
                {
                    var loop: any = handler.then((value: any) => {
                        this.status.lastReturnedValue = value;
                        this.finishStep();
                    })
                    if(typeof loop.catch === "function")
                    {
                        loop.catch((error: any) => {
                            this.status.lastThrownError = error;
                            this.finishStep();
                        })
                    }
                }
                catch (error)
                {
                    this.status.lastThrownError = error;
                    this.finishStep();
                }
            }
            else
            {
                throw new TypeError('Handler argument is not a function or a promise.');
            }

        }, this.interval);

        return this;
    }

    /**
     * Finishs the current step and starts a new step.
     */
    finishStep()
    {  
        if(!this.status.isPending)
        {
            this.emit('beforeStepFinish');
            this.emit('stepFinish')
            this.emit('afterStepFinish');
        }

        if(!this.isStopped() && !this.status.isPending)
            this.executeStep();
    }

    /**
     * Registers events.
     */
    listenEvents()
    {
        var status = this.status;
        
        this.on('stepStart', () => 
        {
            this.status.deltaTimeStart = <[number, number]>this.measureTime();
        })

        this.on('stepFinish', () =>
        {
            this.status.deltaTime = <number>this.measureTime(this.status.deltaTimeStart);
        });

        this.on('afterStepFinish', () => 
        {
            status.loopStep++;
        })
    }
    
}



/**
 * Class used to interact inside of loop.
 * Primary used as scope ('this' reference) in loop handlers.
 * 
 * @protected
 * @use_reference Never create the object yourself and always use reference.
 */
export class LoopSelf
{

    protected loop: Loop;

    /**
     * Current loop interval.
     * @readonly
     * @returns {number}
     */
    get interval(): number
    {
        return this.loop.interval;
    }

    /**
     * Time difference between last step initialization and last step end.
     * @readonly
     * @returns {number}
     */
    get deltaTime(): number
    {
        return this.loop.status.deltaTime;
    }

    /**
     * Current loop step.
     * @readonly
     * @returns {number}
     */
    get step(): number
    {
        return this.loop.status.loopStep;
    }

    /**
     * Boolean indicating if the loop is stopped.
     * @readonly
     */
    get isStopped()
    {
        return this.loop.isStopped();
    }

    /**
     * Boolean indicating if the loop is pending.
     * @readonly
     */
    get isPending()
    {
        return this.loop.status.isPending;
    }

    /**
     * Value of the loop step.
     */
    set value(value: any)
    {
        this.loop.status.lastReturnedValue = value;
    }
    get value(): any
    {
        return this.loop.status.lastReturnedValue;
    }

    /**
     * Constructor of the LoopSelf class.
     * @hidden
     */
    constructor(loop: Loop)
    {
        this.loop = loop;

        this.listenEvents();
    }

    /**
     * Stop current loop.
     */
    stop(value?: any)
    {
        if(typeof value !== "undefined")
            this.value = value;

        this.loop.status.isStopped = true;
    }

    /**
     * Start a subloop and pause current loop until the end of the subloop.
     * @param handler The function to loop
     * @param interval The interval in milliseconds
     * @param args Some arguments to pass to function
     * 
     * @see {@link LoopSelf} for handler scope ('this' reference).
     */
    startLoop(handler: Promise<any> | ((this: LoopSelf, ...args: any[])=>any), interval: number, ...args: any[])
    {
        return startLoop(handler, interval, ...args).parent(this.loop);
    }

    // EVENTS

    /**
     * Listen to events
     * @ignore
     */
    protected listenEvents(){
        //...
    }
    
}



/**
 * Class returned by loops.
 * 
 * @protected
 * @use_reference Never create the object yourself and always use reference.
 */
export class LoopReturn extends EventEmitter implements PromiseLike<any>
{
    protected loop: Loop;
    protected parentLoop?: Loop;

    /**
     * Constructor of the Loop class.
     * @hidden
     */
    constructor(loop: Loop)
    {
        super();
        this.setMaxListeners(Infinity);

        this.loop = loop;
        this.listenEvents();
    }

    /**
     * Boolean indicating if the loop is stopped.
     * @readonly
     */
    get isStopped()
    {
        return this.loop.isStopped();
    }

    /**
     * Boolean indicating if the loop is pending.
     * @readonly
     */
    get isPending()
    {
        return this.loop.status.isPending;
    }

    /**
     * Starts or restarts the loop.
     */
    run()
    {
        this.loop.run();
        return this;
    }

    /**
     * Stops the loop.
     */
    stop()
    {
        this.loop.status.isStopped = true;
    }

    /**
     * Sets a loop as parent, and set pending for the parent loop until the end of the loop.
     * @param loop The parent loop
     * @throws {\Error} if parent is already defined.
     */
    parent(loop: Loop)
    {
        if(typeof this.parentLoop !== "undefined")
            throw new Error("Parent is already set");

        this.parentLoop = loop;
        this.parentLoop.status.isPending = true;
        return this;
    }

    /**
     * Starts a loop after the end of the current loop.
     * @param handler The function to loop
     * @param interval The interval in milliseconds
     * @param args Some arguments to pass to function
     * 
     * @see {@link LoopSelf} for handler scope ('this' reference).
     */
    startLoop(handler: Promise<any> | ((this: LoopSelf, ...args: any[])=>any), interval: number, ...args: any[])
    {
        var loop = registerLoop(handler, interval, ...args)

        this.loop.once('finish', () => loop.run());

        return loop;
    }

    /**
     * Called when a loop is started.
     */
    start(callback: (loop: LoopSelf)=>void)
    {
        this.on('start', callback);

        return this;
    }

    /**
     * Called when a loop step is started.
     */
    stepStart(callback: (loop: LoopSelf)=>void, step?: number)
    {
        if(typeof step !== "undefined"){
            var stepInt = parseInt(step.toString());
            this.on('stepstart-' + stepInt, callback);
        }else{
            this.on('stepstart', callback);
        }

        return this;
    }

    /**
     * Called when a loop step is finished.
     */
    step(callback: (loop: LoopSelf, value: any)=>void, step?: number)
    {
        if(typeof step !== "undefined"){
            var stepInt = parseInt(step.toString());
            this.on('step-' + stepInt, callback);
        }else{
            this.on('step', callback);
        }

        return this;
    }

    /**
     * Called when the loop is terminated, even if there is an error.
     */
    terminated(callback: (value: any)=>any)
    {
        this.once('terminated', callback);

        return this;
    }

    /**
     * Called when the loop is stopped.
     */
    end(callback: (value: any)=>any, errorCallback?: (err: any)=>any)
    {
        this.once('end', callback);
        if(typeof errorCallback !== "undefined")
            this.error(errorCallback);

        return this;
    }

    /**
     * Alias for {@link end}: Called when the loop is stopped.
     */
    then(callback: (value: any)=>any, errorCallback: (err: any)=>any)
    {
        return this.end(callback, errorCallback);
    }

    /**
     * Called when an uncaught error is thrown.
     */
    error(callback: (err: any)=>any)
    {
        this.once('error', callback);
        return this;
    }

    /**
     * Alias for {@link error}: Called when an uncaught error is thrown.
     */
    catch(callback: ()=>any)
    {
        return this.error(callback);
    }

    // EVENTS

    /**
     * Listen to events
     * @ignore
     */
    protected listenEvents(){
        var loop = this.loop;
        var status = this.loop.status;

        loop.on('start', () => 
        {
            this.emit('start', loop.loopSelf);
        });
        loop.on('stepExecute', () =>
        {
            this.emit('stepstart', loop.loopSelf, status.lastReturnedValue);
            this.emit('stepstart-' + status.loopStep, loop.loopSelf, status.lastReturnedValue);
        });
        loop.on('stepFinish', () =>
        {
            this.emit('step', loop.loopSelf, status.lastReturnedValue);
            this.emit('step-' + status.loopStep, loop.loopSelf, status.lastReturnedValue);
        });

        loop.once('finish', () =>
        {
            if(status.lastThrownError != null)
            {
                this.emit('error', status.lastThrownError);
            }
            else
            {
                this.emit('end', status.lastReturnedValue);
            }

            this.emit('terminated', loop);

            if(this.parentLoop != null){
                this.parentLoop.status.isPending = false;
                this.parentLoop.finishStep();
            }
        });
    }
    
}
