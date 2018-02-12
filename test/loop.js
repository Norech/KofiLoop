//@ts-check
var assert = require('assert');
var kofiloop = require('../dist/KofiLoop');
var kofiloop_loop = require('../dist/KofiLoop/Loop');

function isInt(n) {
    return Number(n) === n && n % 1 === 0;
}

function isFloat(n) {
    return Number(n) === n && n % 1 !== 0;
}

describe('Module', function() {

    describe('#startLoop()', function() {

        it('should return an active loop when handler is a function', function() {

            var loop = kofiloop.startLoop(function() {}, 1000);

            assert.equal(loop.isStopped, false);

        });

        it('should return a self loop instance when in "this" context', function() {

            kofiloop.startLoop(function() {
                assert.ok(this instanceof kofiloop_loop.LoopSelf);
            }, 1000);

        });

    });

    describe('#registerLoop()', function() {

        it('should return an inactive loop when handler is a function', function() {

            var loop = kofiloop.registerLoop(function() {}, 1000);

            assert.ok(loop.isStopped);

        });

    });

});

describe('LoopReturn', function() {
    var loopReturn;

    before(function(done) {
        loopReturn = kofiloop.startLoop(function() {}, 10)
            .on('step-1', function() {
                done();
            });
    })

    describe('#isStopped', function() {
        it('should return false when loop is running', function() {
            assert.equal(loopReturn.isStopped, false);
        });
        it('should return true when loop is stopped', function() {
            var inactiveLoop = kofiloop.registerLoop(function() {}, 10);
            assert.equal(inactiveLoop.isStopped, true);
        });
    });

    describe('#isPending', function() {
        it('should return false when loop is running', function() {
            assert.equal(loopReturn.isPending, false);
        });
        it('should return true when loop is pending', function() {
            var pendingLoop = kofiloop.startLoop(function() {
                this.startLoop(function() {}, 100);
            }, 10)

            setTimeout(function() {
                assert.equal(pendingLoop.isPending, true);
            }, 15);
        });
    });

    describe('#end()', function(done) {
        it('should be called when loop is stopped', function(done) {
            kofiloop.startLoop(function() {
                this.stop();
            }, 1)

            .end(function() {
                done();
            });
        });
        it('should give the value in first argument', function(done) {
            kofiloop.startLoop(function() {
                this.stop("Hello !");
            }, 1)

            .end(function(value) {

                done();
            });
        });
    });

    describe('#error()', function(done) {
        it('should be called when an error occurs in loop', function(done) {
            kofiloop.startLoop(function() {
                throw "test";
            }, 1)

            .error(function(error) {
                done();
            });
        });
        it('should give the error in first callback argument', function(done) {
            kofiloop.startLoop(function() {
                throw "test";
            }, 1)

            .error(function(error) {
                assert.equal(error, "test");
                done();
            });
        });
    });

    describe('#stepStart()', function() {
        it('should be called at any step', function(done) {
            var calls = 0;
            kofiloop.startLoop(function() {
                if (this.step == 10)
                    this.stop();
            }, 1)

            .stepStart(function() {
                calls++;
            })

            .end(function() {
                assert.equal(calls, 10);
                done();
            });
        });
        it('should give the loop in first callback argument', function() {
            var loopSelf;
            kofiloop.startLoop(function() {
                loopSelf = this;
            }, 1)

            .stepStart(function(loop) {
                assert.deepEqual(loop, loopSelf);
                loop.stop();
            });
        });
        it('should register the callback for specific step when second argument is set', function(done) {
            kofiloop.startLoop(function() {}, 1)

            .stepStart(function(loop) {
                done();
            }, 1);
        });
    });

    describe('#step()', function() {
        it('should be called at any step', function(done) {
            var calls = 0;
            kofiloop.startLoop(function() {
                if (this.step == 10)
                    this.stop();
            }, 1)

            .step(function() {
                calls++;
            })

            .end(function() {
                assert.equal(calls, 10);
                done();
            });
        });
        it('should give the loop in first callback argument', function() {
            var loopSelf;
            kofiloop.startLoop(function() {
                loopSelf = this;
            }, 1)

            .step(function(loop) {
                assert.deepEqual(loop, loopSelf);
                loop.stop();
            });
        });
        it('should register the callback for specific step when second argument is set', function(done) {
            kofiloop.startLoop(function() {}, 1)

            .step(function(loop) {
                done();
            }, 1);
        });
    });

    describe('#on()', function() {
        specify('event "step-X" that should give the loop in first callback argument', function(done) {
            kofiloop.startLoop(function() {}, 1)

            .on('step-1', function(loop) {
                done();
            });
        });
        specify('event "step-X" that should register the callback for specific step', function(done) {
            var loopSelf;
            kofiloop.startLoop(function() {
                loopSelf = this;
            }, 1)

            .on('step-1', function(loop) {
                assert.deepEqual(loop, loopSelf);
                loop.stop();
                done();
            });
        });
    });

    describe('#stop()', function() {
        it('should stop the loop when called', function(done) {
            var loop = kofiloop.startLoop(function() {}, 1)

            .end(function() {
                done();
            });

            setTimeout(function() {
                loop.stop();
            }, 15);
        });
    });

    describe('#run()', function() {
        it('should stop the loop when called', function(done) {
            kofiloop.registerLoop(function() {}, 1)

            .on('step-1', function() {
                done();
            })

            .run();
        });
    });

});

describe('LoopSelf', function() {
    var loopSelf;

    before(function(done) {
        kofiloop.startLoop(function() {}, 100)
            .on('step-1', function(loop) {
                loopSelf = loop;
                done();
            });
    });

    describe('#deltaTime', function() {
        it('should return a positive number', function() {
            assert.ok(loopSelf.deltaTime > 0);
        });
        it('should return a number superior or equal to the interval', function() {
            assert.ok(loopSelf.deltaTime >= 100);
        });
    });

    describe('#step', function() {
        it('should return an integer', function() {
            assert.ok(isInt(loopSelf.step));
        });
        it('should return a positive number', function() {
            assert.ok(loopSelf.step > 0);
        });
        it('should increment on each loop step', function() {
            var lastStep;
            kofiloop.registerLoop(function() {
                if (typeof lastStep === "undefined")
                    lastStep = this.step;
                else
                    assert.equal(this.step, lastStep + 1);
            }, 1000);
        });
    });

    describe('#interval', function() {
        it('should return loop interval', function() {
            assert.equal(loopSelf.interval, 100);
        });
    });

    describe('#value', function() {
        it('should be gettable and settable', function() {
            loopSelf.value = "Hello";
            assert.equal(loopSelf.value, "Hello");
        });
    });

    describe('#isStopped', function() {
        it('should return false when loop is running', function() {
            assert.equal(loopSelf.isStopped, false);
        });
        it('should return true when loop is stopped', function() {
            kofiloop.registerLoop(function() {
                assert.equal(this.isStopped, true);
            }, 1);
        });
    });

    describe('#isPending', function() {
        it('should return false when loop is running', function() {
            assert.equal(loopSelf.isPending, false);
        });
        it('should return true when loop is pending', function() {
            kofiloop.startLoop(function() {
                this.startLoop(function() {}, 100);
                assert.equal(this.isPending, true);
            }, 1);
        });
    });

    describe('#stop()', function() {
        it('should stop the loop when called', function(done) {
            kofiloop.startLoop(function() {
                this.stop();
            }, 1)

            .end(function() {
                done();
            });
        });
        it('should change the returned value when first argument is defined', function(done) {
            kofiloop.startLoop(function() {
                this.stop("hello");
            }, 1)

            .end(function(value) {
                assert.equal(value, "hello");
                done();
            });
        });
    });

});