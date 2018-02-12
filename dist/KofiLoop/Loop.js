"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("./index");
var events_1 = require("events");
/**
 * The loop handler.
 * @internal
 * @private
 */
var Loop = /** @class */ (function (_super) {
    __extends(Loop, _super);
    /**
     * Constructor of the Loop class.
     * @internal
     */
    function Loop(handler, interval) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        var _this = _super.call(this) || this;
        _this.finishEventCalled = false;
        _this.setMaxListeners(50);
        if (typeof interval !== "number")
            throw new TypeError("Interval argument is not a number.");
        _this.status = {
            isStopped: true,
            isPending: false,
            lastThrownError: null,
            lastReturnedValue: undefined,
            loopStep: 1,
            deltaTime: 0
        };
        _this.interval = interval;
        _this.args = args;
        _this.loopReturn = new LoopReturn(_this);
        _this.loopSelf = new LoopSelf(_this);
        _this.loopHandler = handler;
        _this.listenEvents();
        return _this;
    }
    Loop.prototype.measureTime = function (start) {
        if (!start)
            return process.hrtime();
        var end = process.hrtime(start);
        return Math.round((end[0] * 1000) + (end[1] / 1000000));
    };
    /**
     * Runs the loop.
     */
    Loop.prototype.run = function () {
        if (this.status.isStopped) {
            this.emit('start');
            this.status.isStopped = false;
            this.executeStep();
        }
        else {
            throw new Error('Loop not stopped.');
        }
    };
    /**
     * Returns if loop is stopped.
     */
    Loop.prototype.isStopped = function () {
        if ((this.status.isStopped || this.status.lastThrownError != null) && !this.finishEventCalled) {
            this.emit('beforeFinish');
            this.emit('finish');
            this.emit('afterFinish');
            this.finishEventCalled = true;
        }
        return this.status.isStopped || this.status.lastThrownError != null;
    };
    /**
     * Gets the loop return value.
     */
    Loop.prototype.getReturnValue = function () {
        return this.loopReturn;
    };
    /**
     * Executes a step.
     */
    Loop.prototype.executeStep = function () {
        var _this = this;
        if (this.isStopped())
            return;
        this.emit('stepStart');
        this.status.lastReturnedValue = undefined;
        setTimeout(function () {
            if (_this.isStopped())
                return;
            _this.emit('beforeStepExecute');
            _this.emit('stepExecute');
            _this.emit('afterStepExecute');
            var handler = _this.loopHandler;
            if (typeof handler === "function") {
                try {
                    var value = handler.apply.apply(handler, [_this.loopSelf].concat(_this.args));
                    if (_this.status.lastReturnedValue === undefined) {
                        _this.status.lastReturnedValue = value;
                    }
                    _this.finishStep();
                }
                catch (error) {
                    _this.status.lastThrownError = error;
                    _this.finishStep();
                }
            }
            else if (typeof handler !== "undefined" && typeof handler.then === "function") {
                try {
                    var loop = handler.then(function (value) {
                        _this.status.lastReturnedValue = value;
                        _this.finishStep();
                    });
                    if (typeof loop.catch === "function") {
                        loop.catch(function (error) {
                            _this.status.lastThrownError = error;
                            _this.finishStep();
                        });
                    }
                }
                catch (error) {
                    _this.status.lastThrownError = error;
                    _this.finishStep();
                }
            }
            else {
                throw new TypeError('Handler argument is not a function or a promise.');
            }
        }, this.interval);
        return this;
    };
    /**
     * Finishs the current step and starts a new step.
     */
    Loop.prototype.finishStep = function () {
        if (!this.status.isPending) {
            this.emit('beforeStepFinish');
            this.emit('stepFinish');
            this.emit('afterStepFinish');
        }
        if (!this.isStopped() && !this.status.isPending)
            this.executeStep();
    };
    /**
     * Registers events.
     */
    Loop.prototype.listenEvents = function () {
        var _this = this;
        var status = this.status;
        this.on('stepStart', function () {
            _this.status.deltaTimeStart = _this.measureTime();
        });
        this.on('stepFinish', function () {
            _this.status.deltaTime = _this.measureTime(_this.status.deltaTimeStart);
        });
        this.on('afterStepFinish', function () {
            status.loopStep++;
        });
    };
    return Loop;
}(events_1.EventEmitter));
exports.default = Loop;
/**
 * Class used to interact inside of loop.
 * Primary used as scope ('this' reference) in loop handlers.
 *
 * @protected
 * @use_reference Never create the object yourself and always use reference.
 */
var LoopSelf = /** @class */ (function () {
    /**
     * Constructor of the LoopSelf class.
     * @hidden
     */
    function LoopSelf(loop) {
        this.loop = loop;
        this.listenEvents();
    }
    Object.defineProperty(LoopSelf.prototype, "interval", {
        /**
         * Current loop interval.
         * @readonly
         * @returns {number}
         */
        get: function () {
            return this.loop.interval;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LoopSelf.prototype, "deltaTime", {
        /**
         * Time difference between last step initialization and last step end.
         * @readonly
         * @returns {number}
         */
        get: function () {
            return this.loop.status.deltaTime;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LoopSelf.prototype, "step", {
        /**
         * Current loop step.
         * @readonly
         * @returns {number}
         */
        get: function () {
            return this.loop.status.loopStep;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LoopSelf.prototype, "isStopped", {
        /**
         * Boolean indicating if the loop is stopped.
         * @readonly
         */
        get: function () {
            return this.loop.isStopped();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LoopSelf.prototype, "isPending", {
        /**
         * Boolean indicating if the loop is pending.
         * @readonly
         */
        get: function () {
            return this.loop.status.isPending;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LoopSelf.prototype, "value", {
        get: function () {
            return this.loop.status.lastReturnedValue;
        },
        /**
         * Value of the loop step.
         */
        set: function (value) {
            this.loop.status.lastReturnedValue = value;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Stop current loop.
     */
    LoopSelf.prototype.stop = function (value) {
        if (typeof value !== "undefined")
            this.value = value;
        this.loop.status.isStopped = true;
    };
    /**
     * Start a subloop and pause current loop until the end of the subloop.
     * @param handler The function to loop
     * @param interval The interval in milliseconds
     * @param args Some arguments to pass to function
     *
     * @see {@link LoopSelf} for handler scope ('this' reference).
     */
    LoopSelf.prototype.startLoop = function (handler, interval) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        this.loop.status.isPending = true;
        return index_1.startLoop.apply(void 0, [handler, interval].concat(args)).parent(this.loop);
    };
    // EVENTS
    /**
     * Listen to events
     * @ignore
     */
    LoopSelf.prototype.listenEvents = function () {
        //...
    };
    return LoopSelf;
}());
exports.LoopSelf = LoopSelf;
/**
 * Class returned by loops.
 *
 * @protected
 * @use_reference Never create the object yourself and always use reference.
 */
var LoopReturn = /** @class */ (function (_super) {
    __extends(LoopReturn, _super);
    /**
     * Constructor of the Loop class.
     * @hidden
     */
    function LoopReturn(loop) {
        var _this = _super.call(this) || this;
        _this.setMaxListeners(Infinity);
        _this.loop = loop;
        _this.listenEvents();
        return _this;
    }
    Object.defineProperty(LoopReturn.prototype, "isStopped", {
        /**
         * Boolean indicating if the loop is stopped.
         * @readonly
         */
        get: function () {
            return this.loop.isStopped();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LoopReturn.prototype, "isPending", {
        /**
         * Boolean indicating if the loop is pending.
         * @readonly
         */
        get: function () {
            return this.loop.status.isPending;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Starts or restarts the loop.
     */
    LoopReturn.prototype.run = function () {
        this.loop.run();
        return this;
    };
    /**
     * Stops the loop.
     */
    LoopReturn.prototype.stop = function () {
        this.loop.status.isStopped = true;
    };
    /**
     * Called when a loop step is started.
     */
    LoopReturn.prototype.stepStart = function (callback, step) {
        if (typeof step !== "undefined") {
            var stepInt = parseInt(step.toString());
            this.on('stepstart-' + stepInt, callback);
        }
        else {
            this.on('stepstart', callback);
        }
        return this;
    };
    /**
     * Called when a loop step is finished.
     */
    LoopReturn.prototype.step = function (callback, step) {
        if (typeof step !== "undefined") {
            var stepInt = parseInt(step.toString());
            this.on('step-' + stepInt, callback);
        }
        else {
            this.on('step', callback);
        }
        return this;
    };
    /**
     * Sets a loop as parent loop.
     * @param loop The parent loop
     */
    LoopReturn.prototype.parent = function (loop) {
        if (typeof this.parentLoop !== "undefined")
            throw new Error("Parent is already set");
        this.parentLoop = loop;
        this.parentLoop.status.isPending = true;
        return this;
    };
    /**
     * Starts a loop after the end of the current loop.
     * @param handler The function to loop
     * @param interval The interval in milliseconds
     * @param args Some arguments to pass to function
     *
     * @see {@link LoopSelf} for handler scope ('this' reference).
     */
    LoopReturn.prototype.startLoop = function (handler, interval) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        var loop = index_1.registerLoop.apply(void 0, [handler, interval].concat(args));
        this.loop.once('finish', function () { return loop.run(); });
        return loop;
    };
    /**
     * Called when loop is stopped.
     */
    LoopReturn.prototype.end = function (callback, errorCallback) {
        this.once('end', callback);
        if (typeof errorCallback !== "undefined")
            this.error(errorCallback);
        return this;
    };
    /**
     * Alias for {@link end}: Called when loop is stopped.
     */
    LoopReturn.prototype.then = function (callback, errorCallback) {
        return this.end(callback, errorCallback);
    };
    /**
     * Called when an uncaught error is thrown.
     */
    LoopReturn.prototype.error = function (callback) {
        this.once('error', callback);
        return this;
    };
    /**
     * Alias for {@link error}: Called when an uncaught error is thrown.
     */
    LoopReturn.prototype.catch = function (callback) {
        return this.error(callback);
    };
    // EVENTS
    /**
     * Listen to events
     * @ignore
     */
    LoopReturn.prototype.listenEvents = function () {
        var _this = this;
        var loop = this.loop;
        var status = this.loop.status;
        loop.on('stepExecute', function () {
            _this.emit('stepstart', _this.loop.loopSelf, status.lastReturnedValue);
            _this.emit('stepstart-' + status.loopStep, _this.loop.loopSelf, status.lastReturnedValue);
            return;
        });
        loop.on('stepFinish', function () {
            _this.emit('step', _this.loop.loopSelf, status.lastReturnedValue);
            _this.emit('step-' + status.loopStep, _this.loop.loopSelf, status.lastReturnedValue);
            return;
        });
        loop.once('finish', function () {
            if (status.lastThrownError != null) {
                _this.emit('error', status.lastThrownError);
            }
            else {
                _this.emit('end', status.lastReturnedValue);
            }
            _this.emit('terminated', _this.loop);
            if (_this.parentLoop != null) {
                _this.parentLoop.status.isPending = false;
                _this.parentLoop.finishStep();
            }
        });
    };
    return LoopReturn;
}(events_1.EventEmitter));
exports.LoopReturn = LoopReturn;

//# sourceMappingURL=Loop.js.map
