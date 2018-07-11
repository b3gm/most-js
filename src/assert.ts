function createError(actual:any, expected:any, msg:string) {

	return new Error(msg + ', expected: <' + JSON.stringify(expected) + '>, actual: <' + JSON.stringify(actual) + '>');
}

function equals(actual:any, test:any, msg?:string) {
	if(typeof(test) === 'object') {
		if(actual === test) {
			return;
		}
		let keys:{[key:string]:boolean} = {};
		for(let i in actual) {
			keys[i] = true;
		}
		for(let i in test) {
			keys[i] = true;
		}
		for(let i in keys) {
			equals(actual[i], test[i], msg);
		}
	} else {
		if(actual !== test) {
			throw createError(actual, test, msg || 'Objects are not equal');
		}
	}
}

function unequals(actual:any, test:any, msg?:string) {
	try {
		equals(actual, test);
	} catch(e) {
		return;
	}
	throw new Error(msg || 'Objects are equal');
}

function notIdentical(actual:any, expected:any, msg?:string) {
	if(actual === expected) {
		throw new Error(msg || 'objects are identical');
	}
}

function identical(actual:any, expected:any, msg?:string) {
	if(actual !== expected) {
		throw createError(actual, expected, msg || 'Objects are not identical');
	}
}

function isTrue(check:boolean, msg?:string) {
	if(check !== true) {
		throw createError(check, true, msg || 'Expected boolean true');
	}
}

function isFalse(check:boolean, msg?:string) {
	if(check !== false) {
		throw createError(check, true, msg || 'Expected boolean false');
	}
}

function throws(fun:() => void, msg?:string) {
	try {
		fun();
	} catch(e) {
		return;
	}
	throw new Error(msg || 'Function was expected to throw an error.');
}

function throwsNot(fun:() => void, msg?:string) {
	try {
		fun();
	} catch(e) {
		throw new Error((msg || 'Function was not expected to throw an error, caught: ') + e);
	}
}

function notNull(thing:any, msg?:string) {
	if(thing == null) {// this should also detect undefined
		throw new Error(msg || 'Object is null');
	}
}

const testMarker:string = 'test';

function run(tests:any) {
	if('setup' in tests) {
		tests.setup();
	}
	let runTests:number = 0;
	let failedTests:number = 0;
	let testName:string;
	for(let i in tests) {
		if(i.substring(0, testMarker.length) === testMarker) {
			testName = i.substring(testMarker.length);
			++runTests;
			console.log('Running test ' + testName);
			try {
				tests[i]();
				console.log('\tSUCCESS');
			} catch(e) {
				++failedTests;
				console.error('\tFAILED: ' + i + ':\n' + e);
			}
		}
	}
	console.log('Ran ' + runTests + ' Tests, ' + (runTests - failedTests) + ' succeeded, ' + failedTests + ' failed.');
	if(failedTests !== 0) {
		throw new Error('There have been test errors.');
	}
}

export default {
	equals,
	unequals,
	identical,
	notIdentical,
	isTrue,
	isFalse,
	throws,
	throwsNot,
	notNull,
	run
};