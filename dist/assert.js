"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function createError(actual, expected, msg) {
    return new Error(msg + ', expected: <' + JSON.stringify(expected) + '>, actual: <' + JSON.stringify(actual) + '>');
}
function equals(actual, test, msg) {
    if (typeof (test) === 'object') {
        if (actual === test) {
            return;
        }
        var keys = {};
        for (var i in actual) {
            keys[i] = true;
        }
        for (var i in test) {
            keys[i] = true;
        }
        for (var i in keys) {
            equals(actual[i], test[i], msg);
        }
    }
    else {
        if (actual !== test) {
            throw createError(actual, test, msg || 'Objects are not equal');
        }
    }
}
function unequals(actual, test, msg) {
    try {
        equals(actual, test);
    }
    catch (e) {
        return;
    }
    throw new Error(msg || 'Objects are equal');
}
function notIdentical(actual, expected, msg) {
    if (actual === expected) {
        throw new Error(msg || 'objects are identical');
    }
}
function identical(actual, expected, msg) {
    if (actual !== expected) {
        throw createError(actual, expected, msg || 'Objects are not identical');
    }
}
function isTrue(check, msg) {
    if (check !== true) {
        throw createError(check, true, msg || 'Expected boolean true');
    }
}
function isFalse(check, msg) {
    if (check !== false) {
        throw createError(check, true, msg || 'Expected boolean false');
    }
}
function throws(fun, msg) {
    try {
        fun();
    }
    catch (e) {
        return;
    }
    throw new Error(msg || 'Function was expected to throw an error.');
}
function throwsNot(fun, msg) {
    try {
        fun();
    }
    catch (e) {
        throw new Error((msg || 'Function was not expected to throw an error, caught: ') + e);
    }
}
function notNull(thing, msg) {
    if (thing == null) { // this should also detect undefined
        throw new Error(msg || 'Object is null');
    }
}
var testMarker = 'test';
function run(tests) {
    if ('setup' in tests) {
        tests.setup();
    }
    var runTests = 0;
    var failedTests = 0;
    var testName;
    for (var i in tests) {
        if (i.substring(0, testMarker.length) === testMarker) {
            testName = i.substring(testMarker.length);
            ++runTests;
            console.log('Running test ' + testName);
            try {
                tests[i]();
                console.log('\tSUCCESS');
            }
            catch (e) {
                ++failedTests;
                console.error('\tFAILED: ' + i + ':\n' + e);
            }
        }
    }
    console.log('Ran ' + runTests + ' Tests, ' + (runTests - failedTests) + ' succeeded, ' + failedTests + ' failed.');
    if (failedTests !== 0) {
        throw new Error('There have been test errors.');
    }
}
exports.default = {
    equals: equals,
    unequals: unequals,
    identical: identical,
    notIdentical: notIdentical,
    isTrue: isTrue,
    isFalse: isFalse,
    throws: throws,
    throwsNot: throwsNot,
    notNull: notNull,
    run: run
};
