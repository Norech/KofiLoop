"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Loop_1 = require("./Loop");
/**
 * Starts a new loop.
 * @param handle The function to loop
 * @param interval The interval in milliseconds
 * @param args Some arguments to pass to function
 *
 * @see {@link LoopSelf} for handler scope ('this' reference).
 */
function startLoop(handler, interval) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    var loop = new (Loop_1.default.bind.apply(Loop_1.default, [void 0, handler, interval].concat(args)))();
    loop.run();
    return loop.getReturnValue();
}
exports.startLoop = startLoop;
/**
 * Registers a new loop but don't start it.
 * @param handle The function to loop
 * @param interval The interval in milliseconds
 * @param args Some arguments to pass to function
 *
 * @see {@link LoopSelf} for handler scope ('this' reference).
 */
function registerLoop(handler, interval) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    return new (Loop_1.default.bind.apply(Loop_1.default, [void 0, handler, interval].concat(args)))().getReturnValue();
}
exports.registerLoop = registerLoop;
