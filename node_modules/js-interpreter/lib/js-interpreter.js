(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["JSInterpreter"] = factory();
	else
		root["JSInterpreter"] = factory();
})(this, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./original-repo/interpreter.js":
/*!**************************************!*\
  !*** ./original-repo/interpreter.js ***!
  \**************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";
/**
 * @license
 * Copyright 2013 Neil Fraser
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Interpreting JavaScript in JavaScript.
 * @author interpreter@neil.fraser.name (Neil Fraser)
 */


/**
 * Create a new interpreter.
 * @param {string|!Object} code Raw JavaScript text or AST.
 * @param {Function=} opt_initFunc Optional initialization function.  Used to
 *     define APIs.  When called it is passed the interpreter object and the
 *     global scope object.
 * @constructor
 */
var Interpreter = function(code, opt_initFunc) {
  if (typeof code === 'string') {
    code = this.parse_(code, 'code');
  }
  // Get a handle on Acorn's node_t object.
  var nodeConstructor = code.constructor;
  this.newNode = function() {
    return new nodeConstructor({'options': {}});
  };
  // Clone the root 'Program' node so that the AST may be modified.
  var ast = this.newNode();
  for (var prop in code) {
    ast[prop] = (prop === 'body') ? code[prop].slice() : code[prop];
  }
  this.ast = ast;
  /**
   * Sorted array of setTimeout/setInterval tasks waiting to execute.
   * @type {!Array<!Interpreter.Task>}
   */
  this.tasks = [];
  this.initFunc_ = opt_initFunc;
  /**
   * True if the interpreter is paused while waiting for an async function.
   */
  this.paused_ = false;
  /**
   * Lines of code to execute during startup of Interpreter.
   * @type {!Array<string>|undefined}
   */
  this.polyfills_ = [];
  // Unique identifier for native functions.  Used in serialization.
  this.functionCounter_ = 0;
  // Map node types to our step function names; a property lookup is faster
  // than string concatenation with "step" prefix.
  this.stepFunctions_ = Object.create(null);
  var stepMatch = /^step([A-Z]\w*)$/;
  var m;
  for (var methodName in this) {
    if ((typeof this[methodName] === 'function') &&
        (m = methodName.match(stepMatch))) {
      this.stepFunctions_[m[1]] = this[methodName].bind(this);
    }
  }
  // Create and initialize the global scope.
  this.globalScope = this.createScope(this.ast, null);
  this.globalObject = this.globalScope.object;
  // Run the polyfills.
  this.ast = this.parse_(this.polyfills_.join('\n'), 'polyfills');
  this.polyfills_ = undefined;  // Allow polyfill strings to garbage collect.
  Interpreter.stripLocations_(this.ast, undefined, undefined);
  var state = new Interpreter.State(this.ast, this.globalScope);
  state.done = false;
  this.stateStack = [state];
  this.run();
  this.value = undefined;
  // Point at the main program.
  this.ast = ast;
  state = new Interpreter.State(this.ast, this.globalScope);
  state.done = false;
  this.stateStack.length = 0;
  this.stateStack[0] = state;
};

/**
 * Completion Value Types.
 * @enum {number}
 */
Interpreter.Completion = {
  NORMAL: 0,
  BREAK: 1,
  CONTINUE: 2,
  RETURN: 3,
  THROW: 4,
};

/**
 * Interpreter status values.
 * @enum {number}
 */
Interpreter.Status = {
  'DONE': 0,
  'STEP': 1,
  'TASK': 2,
  'ASYNC': 3,
};

/**
 * @const {!Object} Configuration used for all Acorn parsing.
 */
Interpreter.PARSE_OPTIONS = {
  locations: true,
  ecmaVersion: 5,  // Needed in the event a version > 0.5.0 of Acorn is used.
};

/**
 * Property descriptor of readonly properties.
 */
Interpreter.READONLY_DESCRIPTOR = {
  'configurable': true,
  'enumerable': true,
  'writable': false,
};

/**
 * Property descriptor of non-enumerable properties.
 */
Interpreter.NONENUMERABLE_DESCRIPTOR = {
  'configurable': true,
  'enumerable': false,
  'writable': true,
};

/**
 * Property descriptor of readonly, non-enumerable properties.
 */
Interpreter.READONLY_NONENUMERABLE_DESCRIPTOR = {
  'configurable': true,
  'enumerable': false,
  'writable': false,
};

/**
 * Property descriptor of non-configurable, readonly, non-enumerable properties.
 * E.g. NaN, Infinity.
 */
Interpreter.NONCONFIGURABLE_READONLY_NONENUMERABLE_DESCRIPTOR = {
  'configurable': false,
  'enumerable': false,
  'writable': false,
};

/**
 * Property descriptor of variables.
 */
Interpreter.VARIABLE_DESCRIPTOR = {
  'configurable': false,
  'enumerable': true,
  'writable': true,
};

/**
 * Unique symbol for indicating that a step has encountered an error, has
 * added it to the stack, and will be thrown within the user's program.
 * When STEP_ERROR is thrown in the JS-Interpreter, the error can be ignored.
 */
Interpreter.STEP_ERROR = {'STEP_ERROR': true};

/**
 * Unique symbol for indicating that a reference is a variable on the scope,
 * not an object property.
 */
Interpreter.SCOPE_REFERENCE = {'SCOPE_REFERENCE': true};

/**
 * Unique symbol for indicating, when used as the value of the value
 * parameter in calls to setProperty and friends, that the value
 * should be taken from the property descriptor instead.
 */
Interpreter.VALUE_IN_DESCRIPTOR = /** @type {!Interpreter.Value} */({
  'VALUE_IN_DESCRIPTOR': true
});

/**
 * Unique symbol for indicating that a RegExp timeout has occurred in a VM.
 */
Interpreter.REGEXP_TIMEOUT = {'REGEXP_TIMEOUT': true};

/**
 * For cycle detection in array to string and error conversion;
 * see spec bug github.com/tc39/ecma262/issues/289
 * Since this is for atomic actions only, it can be a class property.
 */
Interpreter.toStringCycles_ = [];

/**
 * Node's vm module, if loaded and required.
 * @type {Object}
 */
Interpreter.vm = null;

/**
 * Currently executing interpreter.  Needed so Interpreter.Object instances
 * can know their environment.
 * @type {Interpreter}
 */
Interpreter.currentInterpreter_ = null;

/**
 * The global object.  Ideally use `globalThis`.  Failing that try `this` or
 * `window`.  Other options to consider are `self` and `global`.
 * Same logic as in Acorn.
 */
Interpreter.nativeGlobal =
    (typeof globalThis === 'undefined') ? this || window : globalThis;

/**
 * Code for executing regular expressions in a thread.
 */
Interpreter.WORKER_CODE = [
  "onmessage = function(e) {",
    "var result;",
    "var data = e.data;",
    "switch (data[0]) {",
      "case 'split':",
        // ['split', string, separator, limit]
        "result = data[1].split(data[2], data[3]);",
        "break;",
      "case 'match':",
        // ['match', string, regexp]
        "result = data[1].match(data[2]);",
        "break;",
      "case 'search':",
        // ['search', string, regexp]
        "result = data[1].search(data[2]);",
        "break;",
      "case 'replace':",
        // ['replace', string, regexp, newSubstr]
        "result = data[1].replace(data[2], data[3]);",
        "break;",
      "case 'exec':",
        // ['exec', regexp, lastIndex, string]
        "var regexp = data[1];",
        "regexp.lastIndex = data[2];",
        "result = [regexp.exec(data[3]), data[1].lastIndex];",
        "break;",
      "default:",
        "throw Error('Unknown RegExp operation: ' + data[0]);",
    "}",
    "postMessage(result);",
    "close();",
  "};"];

/**
 * Is a value a legal integer for an array length?
 * @param {Interpreter.Value} x Value to check.
 * @returns {number} Zero, or a positive integer if the value can be
 *     converted to such.  NaN otherwise.
 */
Interpreter.legalArrayLength = function(x) {
  var n = x >>> 0;
  // Array length must be between 0 and 2^32-1 (inclusive).
  return (n === Number(x)) ? n : NaN;
};

/**
 * Is a value a legal integer for an array index?
 * @param {Interpreter.Value} x Value to check.
 * @returns {number} Zero, or a positive integer if the value can be
 *     converted to such.  NaN otherwise.
 */
Interpreter.legalArrayIndex = function(x) {
  var n = x >>> 0;
  // Array index cannot be 2^32-1, otherwise length would be 2^32.
  // 0xffffffff is 2^32-1.
  return (String(n) === String(x) && n !== 0xffffffff) ? n : NaN;
};

/**
 * Remove start and end values from AST, or set start and end values to a
 * constant value.  Used to remove highlighting from polyfills and to set
 * highlighting in an eval to cover the entire eval expression.
 * @param {!Object} node AST node.
 * @param {number|undefined} start Starting character of all nodes, or undefined.
 * @param {number|undefined} end Ending character of all nodes, or undefined.
 * @private
 */
Interpreter.stripLocations_ = function(node, start, end) {
  if (start) {
    node.start = start;
  } else {
    delete node.start;
  }
  if (end) {
    node.end = end;
  } else {
    delete node.end;
  }
  for (var name in node) {
    if (node[name] !== node.loc && node.hasOwnProperty(name)) {
      var prop = node[name];
      if (prop && typeof prop === 'object') {
        Interpreter.stripLocations_(/** @type {!Object} */(prop), start, end);
      }
    }
  }
};

/**
 * Some pathological regular expressions can take geometric time.
 * Regular expressions are handled in one of three ways:
 * 0 - throw as invalid.
 * 1 - execute natively (risk of unresponsive program).
 * 2 - execute in separate thread (not supported by IE 9).
 */
Interpreter.prototype['REGEXP_MODE'] = 2;

/**
 * If REGEXP_MODE = 2, the length of time (in ms) to allow a RegExp
 * thread to execute before terminating it.
 */
Interpreter.prototype['REGEXP_THREAD_TIMEOUT'] = 1000;

/**
 * Length of time (in ms) to allow a polyfill to run before ending step.
 * If set to 0, polyfills will execute step by step.
 * If set to 1000, polyfills will run for up to a second per step
 * (execution will resume in the polyfill in the next step).
 * If set to Infinity, polyfills will run to completion in a single step.
 */
Interpreter.prototype['POLYFILL_TIMEOUT'] = 1000;

/**
 * Flag indicating that a getter function needs to be called immediately.
 * @private
 */
Interpreter.prototype.getterStep_ = false;

/**
 * Flag indicating that a setter function needs to be called immediately.
 * @private
 */
Interpreter.prototype.setterStep_ = false;

/**
 * Number of code chunks appended to the interpreter.
 * @private
 */
Interpreter.prototype.appendCodeNumber_ = 0;

/**
 * Number of parsed tasks.
 * @private
 */
Interpreter.prototype.taskCodeNumber_ = 0;

/**
 * Parse JavaScript code into an AST using Acorn.
 * @param {string} code Raw JavaScript text.
 * @param {string} sourceFile Name of filename (for stack trace).
 * @returns {!Object} AST.
 * @private
 */
Interpreter.prototype.parse_ = function(code, sourceFile) {
   // Create a new options object, since Acorn will modify this object.
   // Inheritance can't be used since Acorn uses hasOwnProperty.
   // Object.assign can't be used since that's ES6.
   var options = {};
   for (var name in Interpreter.PARSE_OPTIONS) {
     options[name] = Interpreter.PARSE_OPTIONS[name];
   }
   options.sourceFile = sourceFile;
   return Interpreter.nativeGlobal.acorn.parse(code, options);
};

/**
 * Add more code to the interpreter.
 * @param {string|!Object} code Raw JavaScript text or AST.
 */
Interpreter.prototype.appendCode = function(code) {
  var state = this.stateStack[0];
  if (!state || state.node.type !== 'Program') {
    throw Error('Expecting original AST to start with a Program node');
  }
  if (typeof code === 'string') {
    code = this.parse_(code, 'appendCode' + (this.appendCodeNumber_++));
  }
  if (!code || code.type !== 'Program') {
    throw Error('Expecting new AST to start with a Program node');
  }
  this.populateScope_(code, state.scope);
  // Append the new program to the old one.
  Array.prototype.push.apply(state.node.body, code.body);
  state.node.body.variableCache_ = null;
  state.done = false;
};

/**
 * Execute one step of the interpreter.
 * @returns {boolean} True if a step was executed, false if no more instructions.
 */
Interpreter.prototype.step = function() {
  var stack = this.stateStack;
  var endTime;
  do {
    var state = stack[stack.length - 1];
    if (this.paused_) {
      // Blocked by an asynchronous function.
      return true;
    } else if (!state || (state.node.type === 'Program' && state.done)) {
      if (!this.tasks.length) {
        // Main program complete and no queued tasks.  We're done!
        return false;
      }
      state = this.nextTask_();
      if (!state) {
        // Main program complete, queued tasks, but nothing to run right now.
        return true;
      }
      // Found a queued task, execute it.
    }
    var node = state.node;
    // Record the interpreter in a global property so calls to toString/valueOf
    // can execute in the proper context.
    var oldInterpreterValue = Interpreter.currentInterpreter_;
    Interpreter.currentInterpreter_ = this;
    try {
      var nextState = this.stepFunctions_[node.type](stack, state, node);
    } catch (e) {
      // Eat any step errors.  They have been thrown on the stack.
      if (e !== Interpreter.STEP_ERROR) {
        // This is a real error, either in the JS-Interpreter, or an uncaught
        // error in the interpreted code.  Rethrow.
        if (this.value !== e) {
          // Uh oh.  Internal error in the JS-Interpreter.
          this.value = undefined;
        }
        throw e;
      }
    } finally {
      // Restore to previous value (probably null, maybe nested toString calls).
      Interpreter.currentInterpreter_ = oldInterpreterValue;
    }
    if (nextState) {
      stack.push(nextState);
    }
    if (this.getterStep_) {
      // Getter from this step was not handled.
      this.value = undefined;
      throw Error('Getter not supported in this context');
    }
    if (this.setterStep_) {
      // Setter from this step was not handled.
      this.value = undefined;
      throw Error('Setter not supported in this context');
    }
    // This may be polyfill code.  Keep executing until we arrive at user code.
    if (!endTime && !node.end) {
      // Ideally this would be defined at the top of the function, but that
      // wastes time if the step isn't a polyfill.
      endTime = Date.now() + this['POLYFILL_TIMEOUT'];
    }
  } while (!node.end && endTime > Date.now());
  return true;
};

/**
 * Execute the interpreter to program completion.  Vulnerable to infinite loops.
 * @returns {boolean} True if a execution is asynchronously blocked,
 *     false if no more instructions.
 */
Interpreter.prototype.run = function() {
  while (!this.paused_ && this.step()) {}
  return this.paused_;
};

/**
 * Current status of the interpreter.
 * @returns {Interpreter.Status} One of DONE, STEP, TASK, or ASYNC.
 */
Interpreter.prototype.getStatus = function() {
  if (this.paused_) {
    return Interpreter.Status['ASYNC'];
  }
  var stack = this.stateStack;
  var state = stack[stack.length - 1];
  if (state && (state.node.type !== 'Program' || !state.done)) {
    // There's a step ready to execute.
    return Interpreter.Status['STEP'];
  }
  var task = this.tasks[0];
  if (task) {
    if (task.time > Date.now()) {
      // There's a pending task, but it's not ready.
      return Interpreter.Status['TASK'];
    }
    // There's a task ready to execute.
    return Interpreter.Status['STEP'];
  }
  return Interpreter.Status['DONE'];
};

/**
 * Initialize the global object with built-in properties and functions.
 * @param {!Interpreter.Object} globalObject Global object.
 */
Interpreter.prototype.initGlobal = function(globalObject) {
  // Initialize uneditable global properties.
  this.setProperty(globalObject, 'NaN', NaN,
      Interpreter.NONCONFIGURABLE_READONLY_NONENUMERABLE_DESCRIPTOR);
  this.setProperty(globalObject, 'Infinity', Infinity,
      Interpreter.NONCONFIGURABLE_READONLY_NONENUMERABLE_DESCRIPTOR);
  this.setProperty(globalObject, 'undefined', undefined,
      Interpreter.NONCONFIGURABLE_READONLY_NONENUMERABLE_DESCRIPTOR);
  this.setProperty(globalObject, 'window', globalObject,
      Interpreter.READONLY_DESCRIPTOR);
  this.setProperty(globalObject, 'this', globalObject,
      Interpreter.NONCONFIGURABLE_READONLY_NONENUMERABLE_DESCRIPTOR);
  this.setProperty(globalObject, 'self', globalObject);  // Editable.

  // Create the objects which will become Object.prototype and
  // Function.prototype, which are needed to bootstrap everything else.
  this.OBJECT_PROTO = new Interpreter.Object(null);
  this.FUNCTION_PROTO = new Interpreter.Object(this.OBJECT_PROTO);
  // Initialize global objects.
  this.initFunction(globalObject);
  this.initObject(globalObject);
  // Unable to set globalObject's parent prior (OBJECT did not exist).
  // Note that in a browser this would be `Window`, whereas in Node.js it would
  // be `Object`.  This interpreter is closer to Node in that it has no DOM.
  globalObject.proto = this.OBJECT_PROTO;
  this.setProperty(globalObject, 'constructor', this.OBJECT,
      Interpreter.NONENUMERABLE_DESCRIPTOR);
  this.initArray(globalObject);
  this.initString(globalObject);
  this.initBoolean(globalObject);
  this.initNumber(globalObject);
  this.initDate(globalObject);
  this.initRegExp(globalObject);
  this.initError(globalObject);
  this.initMath(globalObject);
  this.initJSON(globalObject);

  // Initialize global functions.
  var thisInterpreter = this;
  var wrapper;
  var func = this.createNativeFunction(
      function(_x) {throw EvalError("Can't happen");}, false);
  func.eval = true;
  this.setProperty(globalObject, 'eval', func,
      Interpreter.NONENUMERABLE_DESCRIPTOR);

  this.setProperty(globalObject, 'parseInt',
      this.createNativeFunction(parseInt, false),
      Interpreter.NONENUMERABLE_DESCRIPTOR);
  this.setProperty(globalObject, 'parseFloat',
      this.createNativeFunction(parseFloat, false),
      Interpreter.NONENUMERABLE_DESCRIPTOR);

  this.setProperty(globalObject, 'isNaN',
      this.createNativeFunction(isNaN, false),
      Interpreter.NONENUMERABLE_DESCRIPTOR);

  this.setProperty(globalObject, 'isFinite',
      this.createNativeFunction(isFinite, false),
      Interpreter.NONENUMERABLE_DESCRIPTOR);

  var strFunctions = [
    [escape, 'escape'], [unescape, 'unescape'],
    [decodeURI, 'decodeURI'], [decodeURIComponent, 'decodeURIComponent'],
    [encodeURI, 'encodeURI'], [encodeURIComponent, 'encodeURIComponent']
  ];
  for (var i = 0; i < strFunctions.length; i++) {
    wrapper = (function(nativeFunc) {
      return function(str) {
        try {
          return nativeFunc(str);
        } catch (e) {
          // decodeURI('%xy') will throw an error.  Catch and rethrow.
          thisInterpreter.throwException(thisInterpreter.URI_ERROR, e.message);
        }
      };
    })(strFunctions[i][0]);
    this.setProperty(globalObject, strFunctions[i][1],
        this.createNativeFunction(wrapper, false),
        Interpreter.NONENUMERABLE_DESCRIPTOR);
  }

  wrapper = function setTimeout(var_args) {
    return thisInterpreter.createTask_(false, arguments);
  };
  this.setProperty(globalObject, 'setTimeout',
      this.createNativeFunction(wrapper, false),
      Interpreter.NONENUMERABLE_DESCRIPTOR);

  wrapper = function setInterval(var_args) {
    return thisInterpreter.createTask_(true, arguments);
  };
  this.setProperty(globalObject, 'setInterval',
      this.createNativeFunction(wrapper, false),
      Interpreter.NONENUMERABLE_DESCRIPTOR);

  wrapper = function clearTimeout(pid) {
    thisInterpreter.deleteTask_(pid);
  };
  this.setProperty(globalObject, 'clearTimeout',
      this.createNativeFunction(wrapper, false),
      Interpreter.NONENUMERABLE_DESCRIPTOR);

  wrapper = function clearInterval(pid) {
    thisInterpreter.deleteTask_(pid);
  };
  this.setProperty(globalObject, 'clearInterval',
      this.createNativeFunction(wrapper, false),
      Interpreter.NONENUMERABLE_DESCRIPTOR);

  // Preserve public properties from being pruned/renamed by JS compilers.
  // Add others as needed.
  this['OBJECT'] = this.OBJECT;     this['OBJECT_PROTO'] = this.OBJECT_PROTO;
  this['FUNCTION'] = this.FUNCTION; this['FUNCTION_PROTO'] = this.FUNCTION_PROTO;
  this['ARRAY'] = this.ARRAY;       this['ARRAY_PROTO'] = this.ARRAY_PROTO;
  this['REGEXP'] = this.REGEXP;     this['REGEXP_PROTO'] = this.REGEXP_PROTO;
  this['DATE'] = this.DATE;         this['DATE_PROTO'] = this.DATE_PROTO;

  // Run any user-provided initialization.
  if (this.initFunc_) {
    this.initFunc_(this, globalObject);
  }
};

/**
 * Number of functions created by the interpreter.
 * @private
 */
Interpreter.prototype.functionCodeNumber_ = 0;

/**
 * Initialize the Function class.
 * @param {!Interpreter.Object} globalObject Global object.
 */
Interpreter.prototype.initFunction = function(globalObject) {
  var thisInterpreter = this;
  var wrapper;
  var identifierRegexp = /^[A-Za-z_$][\w$]*$/;
  // Function constructor.
  wrapper = function Function(var_args) {
    if (arguments.length) {
      var code = String(arguments[arguments.length - 1]);
    } else {
      var code = '';
    }
    var argsStr = Array.prototype.slice.call(arguments, 0, -1).join(',').trim();
    if (argsStr) {
      var args = argsStr.split(/\s*,\s*/);
      for (var i = 0; i < args.length; i++) {
        var name = args[i];
        if (!identifierRegexp.test(name)) {
          thisInterpreter.throwException(thisInterpreter.SYNTAX_ERROR,
              'Invalid function argument: ' + name);
        }
      }
      argsStr = args.join(', ');
    }
    // Acorn needs to parse code in the context of a function or else `return`
    // statements will be syntax errors.
    try {
      var ast = thisInterpreter.parse_('(function(' + argsStr + ') {' + code + '})',
          'function' + (thisInterpreter.functionCodeNumber_++));
    } catch (e) {
      // Acorn threw a SyntaxError.  Rethrow as a trappable error.
      thisInterpreter.throwException(thisInterpreter.SYNTAX_ERROR,
          'Invalid code: ' + e.message);
    }
    if (ast.body.length !== 1) {
      // Function('a', 'return a + 6;}; {alert(1);');
      thisInterpreter.throwException(thisInterpreter.SYNTAX_ERROR,
          'Invalid code in function body');
    }
    var node = ast.body[0].expression;
    // Note that if this constructor is called as `new Function()` the function
    // object created by stepCallExpression and assigned to `this` is discarded.
    // Interestingly, the scope for constructed functions is the global scope,
    // even if they were constructed in some other scope.
    return thisInterpreter.createFunction(node, thisInterpreter.globalScope,
       'anonymous');
  };
  this.FUNCTION = this.createNativeFunction(wrapper, true);

  this.setProperty(globalObject, 'Function', this.FUNCTION,
      Interpreter.NONENUMERABLE_DESCRIPTOR);
  // Throw away the created prototype and use the root prototype.
  this.setProperty(this.FUNCTION, 'prototype', this.FUNCTION_PROTO,
      Interpreter.NONENUMERABLE_DESCRIPTOR);

  // Configure Function.prototype.
  this.setProperty(this.FUNCTION_PROTO, 'constructor', this.FUNCTION,
      Interpreter.NONENUMERABLE_DESCRIPTOR);
  this.FUNCTION_PROTO.nativeFunc = function() {};
  this.FUNCTION_PROTO.nativeFunc.id = this.functionCounter_++;
  this.FUNCTION_PROTO.illegalConstructor = true;
  this.setProperty(this.FUNCTION_PROTO, 'length', 0,
      Interpreter.READONLY_NONENUMERABLE_DESCRIPTOR);
  this.FUNCTION_PROTO.class = 'Function';

  wrapper = function apply_(func, thisArg, args) {
    var state =
        thisInterpreter.stateStack[thisInterpreter.stateStack.length - 1];
    // Rewrite the current CallExpression state to apply a different function.
    // Note: 'func' is provided by the polyfill as a non-standard argument.
    state.func_ = func;
    // Assign the `this` object.
    state.funcThis_ = thisArg;
    // Bind any provided arguments.
    state.arguments_ = [];
    if (args !== null && args !== undefined) {
      if (args instanceof Interpreter.Object) {
        // Convert the pseudo array of args into a native array.
        // The pseudo array's properties object happens to be array-like.
        state.arguments_ = Array.from(args.properties);
      } else {
        thisInterpreter.throwException(thisInterpreter.TYPE_ERROR,
            'CreateListFromArrayLike called on non-object');
      }
    }
    state.doneExec_ = false;
  };
  this.setNativeFunctionPrototype(this.FUNCTION, 'apply', wrapper);

  this.polyfills_.push(
/* POLYFILL START */
// Flatten the apply args list to remove any inheritance or getter functions.
"(function() {",
  "var apply_ = Function.prototype.apply;",
  "Function.prototype.apply = function apply(thisArg, args) {",
    "var a2 = [];",
    "for (var i = 0; i < args.length; i++) {",
      "a2[i] = args[i];",
    "}",
    "return apply_(this, thisArg, a2);",  // Note: Non-standard 'this' arg.
  "};",
"})();"
/* POLYFILL END */
);

  wrapper = function call(thisArg /*, var_args */) {
    var state =
        thisInterpreter.stateStack[thisInterpreter.stateStack.length - 1];
    // Rewrite the current CallExpression state to call a different function.
    state.func_ = this;
    // Assign the `this` object.
    state.funcThis_ = thisArg;
    // Bind any provided arguments.
    state.arguments_ = [];
    for (var i = 1; i < arguments.length; i++) {
      state.arguments_.push(arguments[i]);
    }
    state.doneExec_ = false;
  };
  this.setNativeFunctionPrototype(this.FUNCTION, 'call', wrapper);

  this.polyfills_.push(
/* POLYFILL START */
// Polyfill copied from:
// developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_objects/Function/bind
"Object.defineProperty(Function.prototype, 'bind',",
    "{configurable: true, writable: true, value:",
  "function bind(oThis) {",
    "if (typeof this !== 'function') {",
      "throw TypeError('What is trying to be bound is not callable');",
    "}",
    "var aArgs   = Array.prototype.slice.call(arguments, 1),",
        "fToBind = this,",
        "fNOP    = function() {},",
        "fBound  = function() {",
          "return fToBind.apply(this instanceof fNOP",
                 "? this",
                 ": oThis,",
                 "aArgs.concat(Array.prototype.slice.call(arguments)));",
        "};",
    "if (this.prototype) {",
      "fNOP.prototype = this.prototype;",
    "}",
    "fBound.prototype = new fNOP();",
    "return fBound;",
  "}",
"});",
""
/* POLYFILL END */
);

  // Function has no parent to inherit from, so it needs its own mandatory
  // toString and valueOf functions.
  wrapper = function toString() {
    return String(this);
  };
  this.setNativeFunctionPrototype(this.FUNCTION, 'toString', wrapper);
  this.setProperty(this.FUNCTION, 'toString',
      this.createNativeFunction(wrapper, false),
      Interpreter.NONENUMERABLE_DESCRIPTOR);
  wrapper = function valueOf() {
    return this.valueOf();
  };
  this.setNativeFunctionPrototype(this.FUNCTION, 'valueOf', wrapper);
  this.setProperty(this.FUNCTION, 'valueOf',
      this.createNativeFunction(wrapper, false),
      Interpreter.NONENUMERABLE_DESCRIPTOR);
};

/**
 * Initialize the Object class.
 * @param {!Interpreter.Object} globalObject Global object.
 */
Interpreter.prototype.initObject = function(globalObject) {
  var thisInterpreter = this;
  var wrapper;
  // Object constructor.
  wrapper = function Object(value) {
    if (value === undefined || value === null) {
      // Create a new object.
      if (thisInterpreter.calledWithNew()) {
        // Called as `new Object()`.
        return this;
      } else {
        // Called as `Object()`.
        return thisInterpreter.createObjectProto(thisInterpreter.OBJECT_PROTO);
      }
    }
    if (!(value instanceof Interpreter.Object)) {
      // Wrap the value as an object.
      var box = thisInterpreter.createObjectProto(
          thisInterpreter.getPrototype(value));
      box.data = value;
      return box;
    }
    // Return the provided object.
    return value;
  };
  this.OBJECT = this.createNativeFunction(wrapper, true);
  // Throw away the created prototype and use the root prototype.
  this.setProperty(this.OBJECT, 'prototype', this.OBJECT_PROTO,
                   Interpreter.NONENUMERABLE_DESCRIPTOR);
  this.setProperty(this.OBJECT_PROTO, 'constructor', this.OBJECT,
                   Interpreter.NONENUMERABLE_DESCRIPTOR);
  this.setProperty(globalObject, 'Object', this.OBJECT,
      Interpreter.NONENUMERABLE_DESCRIPTOR);

  /**
   * Checks if the provided value is null or undefined.
   * If so, then throw an error in the call stack.
   * @param {Interpreter.Value} value Value to check.
   */
  var throwIfNullUndefined = function(value) {
    if (value === undefined || value === null) {
      thisInterpreter.throwException(thisInterpreter.TYPE_ERROR,
          "Cannot convert '" + value + "' to object");
    }
  };

  // Static methods on Object.
  wrapper = function getOwnPropertyNames(obj) {
    throwIfNullUndefined(obj);
    var props = (obj instanceof Interpreter.Object) ? obj.properties : obj;
    return thisInterpreter.nativeToPseudo(Object.getOwnPropertyNames(props));
  };
  this.setProperty(this.OBJECT, 'getOwnPropertyNames',
      this.createNativeFunction(wrapper, false),
      Interpreter.NONENUMERABLE_DESCRIPTOR);

  wrapper = function keys(obj) {
    throwIfNullUndefined(obj);
    if (obj instanceof Interpreter.Object) {
      obj = obj.properties;
    }
    return thisInterpreter.nativeToPseudo(Object.keys(obj));
  };
  this.setProperty(this.OBJECT, 'keys',
      this.createNativeFunction(wrapper, false),
      Interpreter.NONENUMERABLE_DESCRIPTOR);

  wrapper = function create_(proto) {
    // Support for the second argument is the responsibility of a polyfill.
    if (proto === null) {
      return thisInterpreter.createObjectProto(null);
    }
    if (!(proto instanceof Interpreter.Object)) {
      thisInterpreter.throwException(thisInterpreter.TYPE_ERROR,
          'Object prototype may only be an Object or null, not ' + proto);
    }
    return thisInterpreter.createObjectProto(proto);
  };
  this.setProperty(this.OBJECT, 'create',
      this.createNativeFunction(wrapper, false),
      Interpreter.NONENUMERABLE_DESCRIPTOR);

  // Add a polyfill to handle create's second argument.
  this.polyfills_.push(
/* POLYFILL START */
"(function() {",
  "var create_ = Object.create;",
  "Object.create = function create(proto, props) {",
    "var obj = create_(proto);",
    "props && Object.defineProperties(obj, props);",
    "return obj;",
  "};",
"})();",
""
/* POLYFILL END */
);

  wrapper = function defineProperty(obj, prop, descriptor) {
    prop = String(prop);
    if (!(obj instanceof Interpreter.Object)) {
      thisInterpreter.throwException(thisInterpreter.TYPE_ERROR,
          'Object.defineProperty called on non-object: ' + obj);
    }
    if (!(descriptor instanceof Interpreter.Object)) {
      thisInterpreter.throwException(thisInterpreter.TYPE_ERROR,
          'Property description must be an object');
    }
    if (obj.preventExtensions && !(prop in obj.properties)) {
      thisInterpreter.throwException(thisInterpreter.TYPE_ERROR,
          "Can't define property '" + prop + "', object is not extensible");
    }
    // The polyfill guarantees no inheritance and no getter functions.
    // Therefore the descriptor properties map is the native object needed.
    thisInterpreter.setProperty(obj, prop, Interpreter.VALUE_IN_DESCRIPTOR,
                                descriptor.properties);
    return obj;
  };
  this.setProperty(this.OBJECT, 'defineProperty',
      this.createNativeFunction(wrapper, false),
      Interpreter.NONENUMERABLE_DESCRIPTOR);

  this.polyfills_.push(
// Flatten the descriptor to remove any inheritance or getter functions.
/* POLYFILL START */
"(function() {",
  "var defineProperty_ = Object.defineProperty;",
  "Object.defineProperty = function defineProperty(obj, prop, d1) {",
    "var d2 = {};",
    "if ('configurable' in d1) d2.configurable = d1.configurable;",
    "if ('enumerable' in d1) d2.enumerable = d1.enumerable;",
    "if ('writable' in d1) d2.writable = d1.writable;",
    "if ('value' in d1) d2.value = d1.value;",
    "if ('get' in d1) d2.get = d1.get;",
    "if ('set' in d1) d2.set = d1.set;",
    "return defineProperty_(obj, prop, d2);",
  "};",
"})();",

"Object.defineProperty(Object, 'defineProperties',",
    "{configurable: true, writable: true, value:",
  "function defineProperties(obj, props) {",
    "var keys = Object.keys(props);",
    "for (var i = 0; i < keys.length; i++) {",
      "Object.defineProperty(obj, keys[i], props[keys[i]]);",
    "}",
    "return obj;",
  "}",
"});",
""
/* POLYFILL END */
);

  wrapper = function getOwnPropertyDescriptor(obj, prop) {
    if (!(obj instanceof Interpreter.Object)) {
      thisInterpreter.throwException(thisInterpreter.TYPE_ERROR,
          'Object.getOwnPropertyDescriptor called on non-object: ' + obj);
    }
    prop = String(prop);
    if (!(prop in obj.properties)) {
      return undefined;
    }
    var descriptor = Object.getOwnPropertyDescriptor(obj.properties, prop);
    var getter = obj.getter[prop];
    var setter = obj.setter[prop];

    var pseudoDescriptor =
        thisInterpreter.createObjectProto(thisInterpreter.OBJECT_PROTO);
    if (getter || setter) {
      thisInterpreter.setProperty(pseudoDescriptor, 'get', getter);
      thisInterpreter.setProperty(pseudoDescriptor, 'set', setter);
    } else {
      thisInterpreter.setProperty(pseudoDescriptor, 'value',
          /** @type {!Interpreter.Value} */(descriptor['value']));
      thisInterpreter.setProperty(pseudoDescriptor, 'writable',
          descriptor['writable']);
    }
    thisInterpreter.setProperty(pseudoDescriptor, 'configurable',
        descriptor['configurable']);
    thisInterpreter.setProperty(pseudoDescriptor, 'enumerable',
        descriptor['enumerable']);
    return pseudoDescriptor;
  };
  this.setProperty(this.OBJECT, 'getOwnPropertyDescriptor',
      this.createNativeFunction(wrapper, false),
      Interpreter.NONENUMERABLE_DESCRIPTOR);

  wrapper = function getPrototypeOf(obj) {
    throwIfNullUndefined(obj);
    return thisInterpreter.getPrototype(obj);
  };
  this.setProperty(this.OBJECT, 'getPrototypeOf',
      this.createNativeFunction(wrapper, false),
      Interpreter.NONENUMERABLE_DESCRIPTOR);

  wrapper = function isExtensible(obj) {
    return Boolean(obj) && !obj.preventExtensions;
  };
  this.setProperty(this.OBJECT, 'isExtensible',
      this.createNativeFunction(wrapper, false),
      Interpreter.NONENUMERABLE_DESCRIPTOR);

  wrapper = function preventExtensions(obj) {
    if (obj instanceof Interpreter.Object) {
      obj.preventExtensions = true;
    }
    return obj;
  };
  this.setProperty(this.OBJECT, 'preventExtensions',
      this.createNativeFunction(wrapper, false),
      Interpreter.NONENUMERABLE_DESCRIPTOR);

  // Instance methods on Object.
  this.setNativeFunctionPrototype(this.OBJECT, 'toString',
      Interpreter.Object.prototype.toString);
  this.setNativeFunctionPrototype(this.OBJECT, 'toLocaleString',
      Interpreter.Object.prototype.toString);
  this.setNativeFunctionPrototype(this.OBJECT, 'valueOf',
      Interpreter.Object.prototype.valueOf);

  wrapper = function hasOwnProperty(prop) {
    throwIfNullUndefined(this);
    if (this instanceof Interpreter.Object) {
      return String(prop) in this.properties;
    }
    // Primitive.
    return this.hasOwnProperty(prop);
  };
  this.setNativeFunctionPrototype(this.OBJECT, 'hasOwnProperty', wrapper);

  wrapper = function propertyIsEnumerable(prop) {
    throwIfNullUndefined(this);
    if (this instanceof Interpreter.Object) {
      return Object.prototype.propertyIsEnumerable.call(this.properties, prop);
    }
    // Primitive.
    return this.propertyIsEnumerable(prop);
  };
  this.setNativeFunctionPrototype(this.OBJECT, 'propertyIsEnumerable', wrapper);

  wrapper = function isPrototypeOf(obj) {
    while (true) {
      // Note, circular loops shouldn't be possible.
      obj = thisInterpreter.getPrototype(obj);
      if (!obj) {
        // No parent; reached the top.
        return false;
      }
      if (obj === this) {
        return true;
      }
    }
  };
  this.setNativeFunctionPrototype(this.OBJECT, 'isPrototypeOf',  wrapper);
};

/**
 * Initialize the Array class.
 * @param {!Interpreter.Object} globalObject Global object.
 */
Interpreter.prototype.initArray = function(globalObject) {
  var thisInterpreter = this;
  var wrapper;
  // Array constructor.
  wrapper = function Array(var_args) {
    if (thisInterpreter.calledWithNew()) {
      // Called as `new Array()`.
      var newArray = this;
    } else {
      // Called as `Array()`.
      var newArray = thisInterpreter.createArray();
    }
    var first = arguments[0];
    if (arguments.length === 1 && typeof first === 'number') {
      if (isNaN(Interpreter.legalArrayLength(first))) {
        thisInterpreter.throwException(thisInterpreter.RANGE_ERROR,
                                       'Invalid array length: ' + first);
      }
      newArray.properties.length = first;
    } else {
      for (var i = 0; i < arguments.length; i++) {
        newArray.properties[i] = arguments[i];
      }
      newArray.properties.length = i;
    }
    return newArray;
  };
  this.ARRAY = this.createNativeFunction(wrapper, true);
  this.ARRAY_PROTO = this.ARRAY.properties['prototype'];
  this.setProperty(globalObject, 'Array', this.ARRAY,
      Interpreter.NONENUMERABLE_DESCRIPTOR);

  // Static methods on Array.
  wrapper = function isArray(obj) {
    return obj && obj.class === 'Array';
  };
  this.setProperty(this.ARRAY, 'isArray',
                   this.createNativeFunction(wrapper, false),
                   Interpreter.NONENUMERABLE_DESCRIPTOR);

  // Instance methods on Array.
  this.setProperty(this.ARRAY_PROTO, 'length', 0,
      {'configurable': false, 'enumerable': false, 'writable': true});
  this.ARRAY_PROTO.class = 'Array';

  this.polyfills_.push(
/* POLYFILL START */
"(function() {",
  "function createArrayMethod_(name, func) {",
    "Object.defineProperty(func, 'name', {value: name});",
    "Object.defineProperty(Array.prototype, name,",
        "{configurable: true, writable: true, value: func});",
  "}",

  "createArrayMethod_('pop',",
    "function() {",
      "if (!this) throw TypeError();",
      "var o = Object(this), len = o.length >>> 0;",
      "if (!len || len < 0) {",
        "o.length = 0;",
        "return undefined;",
      "}",
      "len--;",
      "var x = o[len];",
      "delete o[len];",  // Needed for non-arrays.
      "o.length = len;",
      "return x;",
    "}",
  ");",

  "createArrayMethod_('push',",
    "function(var_args) {",
      "if (!this) throw TypeError();",
      "var o = Object(this), len = o.length >>> 0;",
      "for (var i = 0; i < arguments.length; i++) {",
        "o[len] = arguments[i];",
        "len++;",
      "}",
      "o.length = len;",
      "return len;",
    "}",
  ");",

  "createArrayMethod_('shift',",
    "function() {",
      "if (!this) throw TypeError();",
      "var o = Object(this), len = o.length >>> 0;",
      "if (!len || len < 0) {",
        "o.length = 0;",
        "return undefined;",
      "}",
      "var value = o[0];",
      "for (var i = 0; i < len - 1; i++) {",
        "if ((i + 1) in o) {",
          "o[i] = o[i + 1];",
        "} else {",
          "delete o[i];",
        "}",
      "}",
      "delete o[i];",  // Needed for non-arrays.
      "o.length = len - 1;",
      "return value;",
    "}",
  ");",

  "createArrayMethod_('unshift',",
    "function(var_args) {",
      "if (!this) throw TypeError();",
      "var o = Object(this), len = o.length >>> 0;",
      "if (!len || len < 0) {",
        "len = 0;",
      "}",
      "for (var i = len - 1; i >= 0; i--) {",
        "if (i in o) {",
          "o[i + arguments.length] = o[i];",
        "} else {",
          "delete o[i + arguments.length];",
        "}",
      "}",
      "for (var i = 0; i < arguments.length; i++) {",
        "o[i] = arguments[i];",
      "}",
      "return (o.length = len + arguments.length);",
    "}",
  ");",

  "createArrayMethod_('reverse',",
    "function() {",
      "if (!this) throw TypeError();",
      "var o = Object(this), len = o.length >>> 0;",
      "if (!len || len < 2) {",
        "return o;",  // Not an array, or too short to reverse.
      "}",
      "for (var i = 0; i < len / 2 - 0.5; i++) {",
        "var x = o[i];",
        "var hasX = i in o;",
        "if ((len - i - 1) in o) {",
          "o[i] = o[len - i - 1];",
        "} else {",
          "delete o[i];",
        "}",
        "if (hasX) {",
          "o[len - i - 1] = x;",
        "} else {",
          "delete o[len - i - 1];",
        "}",
      "}",
      "return o;",
    "}",
  ");",

  "createArrayMethod_('indexOf',",
    "function(searchElement, fromIndex) {",
      "if (!this) throw TypeError();",
      "var o = Object(this), len = o.length >>> 0;",
      "var n = fromIndex | 0;",
      "if (!len || n >= len) {",
        "return -1;",
      "}",
      "var i = Math.max(n >= 0 ? n : len - Math.abs(n), 0);",
      "while (i < len) {",
        "if (i in o && o[i] === searchElement) {",
          "return i;",
        "}",
        "i++;",
      "}",
      "return -1;",
    "}",
  ");",

  "createArrayMethod_('lastIndexOf',",
    "function(searchElement, fromIndex) {",
      "if (!this) throw TypeError();",
      "var o = Object(this), len = o.length >>> 0;",
      "if (!len) {",
        "return -1;",
      "}",
      "var n = len - 1;",
      "if (arguments.length > 1) {",
        "n = fromIndex | 0;",
        "if (n) {",
          "n = (n > 0 || -1) * Math.floor(Math.abs(n));",
        "}",
      "}",
      "var i = n >= 0 ? Math.min(n, len - 1) : len - Math.abs(n);",
      "while (i >= 0) {",
        "if (i in o && o[i] === searchElement) {",
          "return i;",
        "}",
        "i--;",
      "}",
      "return -1;",
    "}",
  ");",

  "createArrayMethod_('slice',",
    "function(start, end) {",
      "if (!this) throw TypeError();",
      "var o = Object(this), len = o.length >>> 0;",
      // Handle negative value for "start"
      "start |= 0;",
      "start = (start >= 0) ? start : Math.max(0, len + start);",
      // Handle negative value for "end"
      "if (typeof end !== 'undefined') {",
        "if (end !== Infinity) {",
          "end |= 0;",
        "}",
        "if (end < 0) {",
          "end = len + end;",
        "} else {",
          "end = Math.min(end, len);",
        "}",
      "} else {",
        "end = len;",
      "}",
      "var size = end - start;",
      "var cloned = new Array(size);",
      "for (var i = 0; i < size; i++) {",
        "if ((start + i) in o) {",
          "cloned[i] = o[start + i];",
        "}",
      "}",
      "return cloned;",
    "}",
  ");",

  "createArrayMethod_('splice',",
    "function(start, deleteCount, var_args) {",
      "if (!this) throw TypeError();",
      "var o = Object(this), len = o.length >>> 0;",
      "start |= 0;",
      "if (start < 0) {",
        "start = Math.max(len + start, 0);",
      "} else {",
        "start = Math.min(start, len);",
      "}",
      "if (arguments.length < 2) {",
        "deleteCount = len - start;",
      "} else {",
        "deleteCount |= 0;",
        "deleteCount = Math.max(0, Math.min(deleteCount, len - start));",
      "}",
      "var removed = [];",
      // Remove specified elements.
      "for (var i = start; i < start + deleteCount; i++) {",
        "if (i in o) {",
          "removed.push(o[i]);",
        "} else {",
          "removed.length++;",
        "}",
        "if ((i + deleteCount) in o) {",
          "o[i] = o[i + deleteCount];",
        "} else {",
          "delete o[i];",
        "}",
      "}",
      // Move other element to fill the gap.
      "for (var i = start + deleteCount; i < len - deleteCount; i++) {",
        "if ((i + deleteCount) in o) {",
          "o[i] = o[i + deleteCount];",
        "} else {",
          "delete o[i];",
        "}",
      "}",
      // Delete superfluous properties.
      "for (var i = len - deleteCount; i < len; i++) {",
        "delete o[i];",
      "}",
      "len -= deleteCount;",
      // Insert specified items.
      "if (arguments.length > 2) {",
        "var arl = arguments.length - 2;",
        "for (var i = len - 1; i >= start; i--) {",
          "if (i in o) {",
            "o[i + arl] = o[i];",
          "} else {",
            "delete o[i + arl];",
          "}",
        "}",
        "len += arl;",
        "for (var i = 2; i < arguments.length; i++) {",
          "o[start + i - 2] = arguments[i];",
        "}",
      "}",
      "o.length = len;",
      "return removed;",
    "}",
  ");",

  "createArrayMethod_('concat',",
    "function(var_args) {",
      "if (!this) throw TypeError();",
      "var o = Object(this);",
      "var cloned = [];",
      "for (var i = -1; i < arguments.length; i++) {",
        "var value = (i === -1) ? o : arguments[i];",
        "if (Array.isArray(value)) {",
          "for (var j = 0, l = value.length; j < l; j++) {",
            "if (j in value) {",
              "cloned.push(value[j]);",
            "} else {",
              "cloned.length++;",
            "}",
          "}",
        "} else {",
          "cloned.push(value);",
        "}",
      "}",
      "return cloned;",
    "}",
  ");",

  "createArrayMethod_('join',",
    "function(opt_separator) {",
      "if (!this) throw TypeError();",
      "var o = Object(this), len = o.length >>> 0;",
      "var sep = typeof opt_separator === 'undefined' ?",
          "',' : ('' + opt_separator);",
      "var str = '';",
      "for (var i = 0; i < len; i++) {",
        "if (i && sep) str += sep;",
        "str += (o[i] === null || o[i] === undefined) ? '' : o[i];",
      "}",
      "return str;",
    "}",
  ");",

  // Polyfill copied from:
  // developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/every
  "createArrayMethod_('every',",
    "function(callback, thisArg) {",
      "if (!this || typeof callback !== 'function') throw TypeError();",
      "var t, k = 0;",
      "var o = Object(this), len = o.length >>> 0;",
      "if (arguments.length > 1) t = thisArg;",
      "while (k < len) {",
        "if (k in o && !callback.call(t, o[k], k, o)) return false;",
        "k++;",
      "}",
      "return true;",
    "}",
  ");",

  // Polyfill copied from:
  // developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
  "createArrayMethod_('filter',",
    "function(callback, var_args) {",
      "if (!this || typeof callback !== 'function') throw TypeError();",
      "var o = Object(this), len = o.length >>> 0;",
      "var res = [];",
      "var thisArg = arguments.length >= 2 ? arguments[1] : void 0;",
      "for (var i = 0; i < len; i++) {",
        "if (i in o) {",
          "var val = o[i];",
          "if (callback.call(thisArg, val, i, o)) res.push(val);",
        "}",
      "}",
      "return res;",
    "}",
  ");",

  // Polyfill copied from:
  // developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
  "createArrayMethod_('forEach',",
    "function(callback, thisArg) {",
      "if (!this || typeof callback !== 'function') throw TypeError();",
      "var t, k = 0;",
      "var o = Object(this), len = o.length >>> 0;",
      "if (arguments.length > 1) t = thisArg;",
      "while (k < len) {",
        "if (k in o) callback.call(t, o[k], k, o);",
        "k++;",
      "}",
    "}",
  ");",

  // Polyfill copied from:
  // developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/map
  "createArrayMethod_('map',",
    "function(callback, thisArg) {",
      "if (!this || typeof callback !== 'function') throw TypeError();",
      "var t, k = 0;",
      "var o = Object(this), len = o.length >>> 0;",
      "if (arguments.length > 1) t = thisArg;",
      "var a = new Array(len);",
      "while (k < len) {",
        "if (k in o) a[k] = callback.call(t, o[k], k, o);",
        "k++;",
      "}",
      "return a;",
    "}",
  ");",

  // Polyfill copied from:
  // developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce
  "createArrayMethod_('reduce',",
    "function(callback /*, initialValue*/) {",
      "if (!this || typeof callback !== 'function') throw TypeError();",
      "var o = Object(this), len = o.length >>> 0;",
      "var k = 0, value;",
      "if (arguments.length === 2) {",
        "value = arguments[1];",
      "} else {",
        "while (k < len && !(k in o)) k++;",
        "if (k >= len) {",
          "throw TypeError('Reduce of empty array with no initial value');",
        "}",
        "value = o[k++];",
      "}",
      "for (; k < len; k++) {",
        "if (k in o) value = callback(value, o[k], k, o);",
      "}",
      "return value;",
    "}",
  ");",

  // Polyfill copied from:
  // developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/ReduceRight
  "createArrayMethod_('reduceRight',",
    "function(callback /*, initialValue*/) {",
      "if (!this || typeof callback !== 'function') throw TypeError();",
      "var o = Object(this), len = o.length >>> 0;",
      "var k = len - 1, value;",
      "if (arguments.length >= 2) {",
        "value = arguments[1];",
      "} else {",
        "while (k >= 0 && !(k in o)) k--;",
        "if (k < 0) {",
          "throw TypeError('Reduce of empty array with no initial value');",
        "}",
        "value = o[k--];",
      "}",
      "for (; k >= 0; k--) {",
        "if (k in o) value = callback(value, o[k], k, o);",
      "}",
      "return value;",
    "}",
  ");",

  // Polyfill copied from:
  // developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/some
  "createArrayMethod_('some',",
    "function(callback /*, thisArg*/) {",
      "if (!this || typeof callback !== 'function') throw TypeError();",
      "var o = Object(this), len = o.length >>> 0;",
      "var thisArg = arguments.length >= 2 ? arguments[1] : void 0;",
      "for (var i = 0; i < len; i++) {",
        "if (i in o && callback.call(thisArg, o[i], i, o)) return true;",
      "}",
      "return false;",
    "}",
  ");",

  "createArrayMethod_('sort',",
    "function(opt_comp) {",  // Bubble sort!
      "if (!this) throw TypeError();",
      "if (typeof opt_comp !== 'function') {",
        "opt_comp = undefined;",
      "}",
      "for (var i = 0; i < this.length; i++) {",
        "var changes = 0;",
        "for (var j = 0; j < this.length - i - 1; j++) {",
          "if (opt_comp ? (opt_comp(this[j], this[j + 1]) > 0) :",
              "(String(this[j]) > String(this[j + 1]))) {",
            "var swap = this[j];",
            "var hasSwap = j in this;",
            "if ((j + 1) in this) {",
              "this[j] = this[j + 1];",
            "} else {",
              "delete this[j];",
            "}",
            "if (hasSwap) {",
              "this[j + 1] = swap;",
            "} else {",
              "delete this[j + 1];",
            "}",
            "changes++;",
          "}",
        "}",
        "if (!changes) break;",
      "}",
      "return this;",
    "}",
  ");",

  "createArrayMethod_('toLocaleString',",
    "function() {",
      "if (!this) throw TypeError();",
      "var o = Object(this), len = o.length >>> 0;",
      "var out = [];",
      "for (var i = 0; i < len; i++) {",
        "out[i] = (o[i] === null || o[i] === undefined) ? '' : o[i].toLocaleString();",
      "}",
      "return out.join(',');",
    "}",
  ");",
"})();",
""
/* POLYFILL END */
);
};

/**
 * Initialize the String class.
 * @param {!Interpreter.Object} globalObject Global object.
 */
Interpreter.prototype.initString = function(globalObject) {
  var thisInterpreter = this;
  var wrapper;
  // String constructor.
  wrapper = function String(value) {
    value = arguments.length ? Interpreter.nativeGlobal.String(value) : '';
    if (thisInterpreter.calledWithNew()) {
      // Called as `new String()`.
      this.data = value;
      return this;
    } else {
      // Called as `String()`.
      return value;
    }
  };
  this.STRING = this.createNativeFunction(wrapper, true);
  this.setProperty(globalObject, 'String', this.STRING,
      Interpreter.NONENUMERABLE_DESCRIPTOR);

  // Static methods on String.
  this.setProperty(this.STRING, 'fromCharCode',
      this.createNativeFunction(String.fromCharCode, false),
      Interpreter.NONENUMERABLE_DESCRIPTOR);

  // Instance methods on String.
  // Methods with exclusively primitive arguments.
  var functions = ['charAt', 'charCodeAt', 'concat', 'indexOf', 'lastIndexOf',
      'slice', 'substr', 'substring', 'toLocaleLowerCase', 'toLocaleUpperCase',
      'toLowerCase', 'toUpperCase', 'trim'];
  for (var i = 0; i < functions.length; i++) {
    this.setNativeFunctionPrototype(this.STRING, functions[i],
                                    String.prototype[functions[i]]);
  }

  wrapper = function localeCompare(compareString, locales, options) {
    locales = thisInterpreter.pseudoToNative(locales);
    options = thisInterpreter.pseudoToNative(options);
    try {
      return String(this).localeCompare(compareString,
          /** @type {?} */(locales), /** @type {?} */(options));
    } catch (e) {
      thisInterpreter.throwException(thisInterpreter.ERROR,
          'localeCompare: ' + e.message);
    }
  };
  this.setNativeFunctionPrototype(this.STRING, 'localeCompare', wrapper);

  wrapper = function split(separator, limit, callback) {
    var string = String(this);
    limit = limit ? Number(limit) : undefined;
    // Example of catastrophic split RegExp:
    // 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaac'.split(/^(a+)+b/)
    if (thisInterpreter.isa(separator, thisInterpreter.REGEXP)) {
      separator = separator.data;
      thisInterpreter.maybeThrowRegExp(separator, callback);
      if (thisInterpreter['REGEXP_MODE'] === 2) {
        if (Interpreter.vm) {
          // Run split in vm.
          var sandbox = {
            'string': string,
            'separator': separator,
            'limit': limit,
          };
          var code = 'string.split(separator, limit)';
          var jsList =
              thisInterpreter.vmCall(code, sandbox, separator, callback);
          if (jsList !== Interpreter.REGEXP_TIMEOUT) {
            callback(thisInterpreter.nativeToPseudo(jsList));
          }
        } else {
          // Run split in separate thread.
          var splitWorker = thisInterpreter.createWorker();
          var pid = thisInterpreter.regExpTimeout(separator, splitWorker,
              callback);
          splitWorker.onmessage = function(e) {
            clearTimeout(pid);
            callback(thisInterpreter.nativeToPseudo(e.data));
          };
          splitWorker.postMessage(['split', string, separator, limit]);
        }
        return;
      }
    }
    // Run split natively.
    var jsList = string.split(separator, limit);
    callback(thisInterpreter.nativeToPseudo(jsList));
  };
  this.setAsyncFunctionPrototype(this.STRING, 'split', wrapper);

  wrapper = function match(regexp, callback) {
    var string = String(this);
    regexp = thisInterpreter.isa(regexp, thisInterpreter.REGEXP) ?
        regexp.data : new RegExp(regexp);
    // Example of catastrophic match RegExp:
    // 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaac'.match(/^(a+)+b/)
    thisInterpreter.maybeThrowRegExp(regexp, callback);
    if (thisInterpreter['REGEXP_MODE'] === 2) {
      if (Interpreter.vm) {
        // Run match in vm.
        var sandbox = {
          'string': string,
          'regexp': regexp,
        };
        var code = 'string.match(regexp)';
        var m = thisInterpreter.vmCall(code, sandbox, regexp, callback);
        if (m !== Interpreter.REGEXP_TIMEOUT) {
          callback(m && thisInterpreter.matchToPseudo_(m));
        }
      } else {
        // Run match in separate thread.
        var matchWorker = thisInterpreter.createWorker();
        var pid = thisInterpreter.regExpTimeout(regexp, matchWorker, callback);
        matchWorker.onmessage = function(e) {
          clearTimeout(pid);
          callback(e.data && thisInterpreter.matchToPseudo_(e.data));
        };
        matchWorker.postMessage(['match', string, regexp]);
      }
      return;
    }
    // Run match natively.
    var m = string.match(regexp);
    callback(m && thisInterpreter.matchToPseudo_(m));
  };
  this.setAsyncFunctionPrototype(this.STRING, 'match', wrapper);

  wrapper = function search(regexp, callback) {
    var string = String(this);
    if (thisInterpreter.isa(regexp, thisInterpreter.REGEXP)) {
      regexp = regexp.data;
    } else {
      regexp = new RegExp(regexp);
    }
    // Example of catastrophic search RegExp:
    // 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaac'.search(/^(a+)+b/)
    thisInterpreter.maybeThrowRegExp(regexp, callback);
    if (thisInterpreter['REGEXP_MODE'] === 2) {
      if (Interpreter.vm) {
        // Run search in vm.
        var sandbox = {
          'string': string,
          'regexp': regexp
        };
        var code = 'string.search(regexp)';
        var n = thisInterpreter.vmCall(code, sandbox, regexp, callback);
        if (n !== Interpreter.REGEXP_TIMEOUT) {
          callback(n);
        }
      } else {
        // Run search in separate thread.
        var searchWorker = thisInterpreter.createWorker();
        var pid = thisInterpreter.regExpTimeout(regexp, searchWorker, callback);
        searchWorker.onmessage = function(e) {
          clearTimeout(pid);
          callback(e.data);
        };
        searchWorker.postMessage(['search', string, regexp]);
      }
      return;
    }
    // Run search natively.
    callback(string.search(regexp));
  };
  this.setAsyncFunctionPrototype(this.STRING, 'search', wrapper);

  wrapper = function replace_(substr, newSubstr, callback) {
    // Support for function replacements is the responsibility of a polyfill.
    var string = String(this);
    newSubstr = String(newSubstr);
    // Example of catastrophic replace RegExp:
    // 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaac'.replace(/^(a+)+b/, '')
    if (thisInterpreter.isa(substr, thisInterpreter.REGEXP)) {
      substr = substr.data;
      thisInterpreter.maybeThrowRegExp(substr, callback);
      if (thisInterpreter['REGEXP_MODE'] === 2) {
        if (Interpreter.vm) {
          // Run replace in vm.
          var sandbox = {
            'string': string,
            'substr': substr,
            'newSubstr': newSubstr,
          };
          var code = 'string.replace(substr, newSubstr)';
          var str = thisInterpreter.vmCall(code, sandbox, substr, callback);
          if (str !== Interpreter.REGEXP_TIMEOUT) {
            callback(str);
          }
        } else {
          // Run replace in separate thread.
          var replaceWorker = thisInterpreter.createWorker();
          var pid = thisInterpreter.regExpTimeout(substr, replaceWorker,
              callback);
          replaceWorker.onmessage = function(e) {
            clearTimeout(pid);
            callback(e.data);
          };
          replaceWorker.postMessage(['replace', string, substr, newSubstr]);
        }
        return;
      }
    }
    // Run replace natively.
    callback(string.replace(substr, newSubstr));
  };
  this.setAsyncFunctionPrototype(this.STRING, 'replace', wrapper);
  // Add a polyfill to handle replace's second argument being a function.
  this.polyfills_.push(
/* POLYFILL START */
"(function() {",
  "var replace_ = String.prototype.replace;",
  "String.prototype.replace = function replace(substr, newSubstr) {",
    "if (typeof newSubstr !== 'function') {",
      // string.replace(string|regexp, string)
      "return replace_.call(this, substr, newSubstr);",
    "}",
    "var str = this;",
    "if (substr instanceof RegExp) {",
      // string.replace(regexp, function)
      "var subs = [];",
      "var m = substr.exec(str);",
      "while (m) {",
        "m.push(m.index, str);",
        "var inject = newSubstr.apply(null, m);",
        "subs.push([m.index, m[0].length, inject]);",
        "m = substr.global ? substr.exec(str) : null;",
      "}",
      "for (var i = subs.length - 1; i >= 0; i--) {",
        "str = str.substring(0, subs[i][0]) + subs[i][2] + ",
            "str.substring(subs[i][0] + subs[i][1]);",
      "}",
    "} else {",
      // string.replace(string, function)
      "var i = str.indexOf(substr);",
      "if (i !== -1) {",
        "var inject = newSubstr(str.substr(i, substr.length), i, str);",
        "str = str.substring(0, i) + inject + ",
            "str.substring(i + substr.length);",
      "}",
    "}",
    "return str;",
  "};",
"})();",
""
/* POLYFILL END */
);
};

/**
 * Initialize the Boolean class.
 * @param {!Interpreter.Object} globalObject Global object.
 */
Interpreter.prototype.initBoolean = function(globalObject) {
  var thisInterpreter = this;
  var wrapper;
  // Boolean constructor.
  wrapper = function Boolean(value) {
    value = Interpreter.nativeGlobal.Boolean(value);
    if (thisInterpreter.calledWithNew()) {
      // Called as `new Boolean()`.
      this.data = value;
      return this;
    } else {
      // Called as `Boolean()`.
      return value;
    }
  };
  this.BOOLEAN = this.createNativeFunction(wrapper, true);
  this.setProperty(globalObject, 'Boolean', this.BOOLEAN,
      Interpreter.NONENUMERABLE_DESCRIPTOR);
};

/**
 * Initialize the Number class.
 * @param {!Interpreter.Object} globalObject Global object.
 */
Interpreter.prototype.initNumber = function(globalObject) {
  var thisInterpreter = this;
  var wrapper;
  // Number constructor.
  wrapper = function Number(value) {
    value = arguments.length ? Interpreter.nativeGlobal.Number(value) : 0;
    if (thisInterpreter.calledWithNew()) {
      // Called as `new Number()`.
      this.data = value;
      return this;
    } else {
      // Called as `Number()`.
      return value;
    }
  };
  this.NUMBER = this.createNativeFunction(wrapper, true);
  this.setProperty(globalObject, 'Number', this.NUMBER,
      Interpreter.NONENUMERABLE_DESCRIPTOR);

  var numConsts = ['MAX_VALUE', 'MIN_VALUE', 'NaN', 'NEGATIVE_INFINITY',
                   'POSITIVE_INFINITY'];
  for (var i = 0; i < numConsts.length; i++) {
    this.setProperty(this.NUMBER, numConsts[i], Number[numConsts[i]],
        Interpreter.NONCONFIGURABLE_READONLY_NONENUMERABLE_DESCRIPTOR);
  }

  // Instance methods on Number.
  wrapper = function toExponential(fractionDigits) {
    try {
      return Number(this).toExponential(fractionDigits);
    } catch (e) {
      // Throws if fractionDigits isn't within 0-20.
      thisInterpreter.throwException(thisInterpreter.ERROR, e.message);
    }
  };
  this.setNativeFunctionPrototype(this.NUMBER, 'toExponential', wrapper);

  wrapper = function toFixed(digits) {
    try {
      return Number(this).toFixed(digits);
    } catch (e) {
      // Throws if digits isn't within 0-20.
      thisInterpreter.throwException(thisInterpreter.ERROR, e.message);
    }
  };
  this.setNativeFunctionPrototype(this.NUMBER, 'toFixed', wrapper);

  wrapper = function toPrecision(precision) {
    try {
      return Number(this).toPrecision(precision);
    } catch (e) {
      // Throws if precision isn't within range (depends on implementation).
      thisInterpreter.throwException(thisInterpreter.ERROR, e.message);
    }
  };
  this.setNativeFunctionPrototype(this.NUMBER, 'toPrecision', wrapper);

  wrapper = function toString(radix) {
    try {
      return Number(this).toString(radix);
    } catch (e) {
      // Throws if radix isn't within 2-36.
      thisInterpreter.throwException(thisInterpreter.ERROR, e.message);
    }
  };
  this.setNativeFunctionPrototype(this.NUMBER, 'toString', wrapper);

  wrapper = function toLocaleString(locales, options) {
    locales = locales ? thisInterpreter.pseudoToNative(locales) : undefined;
    options = options ? thisInterpreter.pseudoToNative(options) : undefined;
    try {
      return Number(this).toLocaleString(
          /** @type {?} */(locales), /** @type {?} */(options));
    } catch (e) {
      thisInterpreter.throwException(thisInterpreter.ERROR,
          'toLocaleString: ' + e.message);
    }
  };
  this.setNativeFunctionPrototype(this.NUMBER, 'toLocaleString', wrapper);
};

/**
 * Initialize the Date class.
 * @param {!Interpreter.Object} globalObject Global object.
 */
Interpreter.prototype.initDate = function(globalObject) {
  var thisInterpreter = this;
  var wrapper;
  // Date constructor.
  wrapper = function Date(_value, var_args) {
    if (!thisInterpreter.calledWithNew()) {
      // Called as `Date()`.
      // Calling Date() as a function returns a string, no arguments are heeded.
      return Interpreter.nativeGlobal.Date();
    }
    // Called as `new Date(...)`.
    var args = [null].concat(Array.from(arguments));
    this.data = new (Function.prototype.bind.apply(
        Interpreter.nativeGlobal.Date, args));
    return this;
  };
  this.DATE = this.createNativeFunction(wrapper, true);
  this.DATE_PROTO = this.DATE.properties['prototype'];
  this.setProperty(globalObject, 'Date', this.DATE,
      Interpreter.NONENUMERABLE_DESCRIPTOR);

  // Static methods on Date.
  this.setProperty(this.DATE, 'now', this.createNativeFunction(Date.now, false),
      Interpreter.NONENUMERABLE_DESCRIPTOR);

  this.setProperty(this.DATE, 'parse',
      this.createNativeFunction(Date.parse, false),
      Interpreter.NONENUMERABLE_DESCRIPTOR);

  this.setProperty(this.DATE, 'UTC', this.createNativeFunction(Date.UTC, false),
      Interpreter.NONENUMERABLE_DESCRIPTOR);

  // Instance methods on Date.
  var functions = ['getDate', 'getDay', 'getFullYear', 'getHours',
      'getMilliseconds', 'getMinutes', 'getMonth', 'getSeconds', 'getTime',
      'getTimezoneOffset', 'getUTCDate', 'getUTCDay', 'getUTCFullYear',
      'getUTCHours', 'getUTCMilliseconds', 'getUTCMinutes', 'getUTCMonth',
      'getUTCSeconds', 'getYear',
      'setDate', 'setFullYear', 'setHours', 'setMilliseconds',
      'setMinutes', 'setMonth', 'setSeconds', 'setTime', 'setUTCDate',
      'setUTCFullYear', 'setUTCHours', 'setUTCMilliseconds', 'setUTCMinutes',
      'setUTCMonth', 'setUTCSeconds', 'setYear',
      'toDateString', 'toJSON', 'toGMTString', 'toLocaleDateString',
      'toLocaleString', 'toLocaleTimeString', 'toTimeString', 'toUTCString'];
  for (var i = 0; i < functions.length; i++) {
    wrapper = (function(nativeFunc) {
      return function(var_args) {
        var date = this.data;
        if (!(date instanceof Date)) {
          thisInterpreter.throwException(thisInterpreter.TYPE_ERROR,
              nativeFunc + ' not called on a Date');
        }
        var args = [];
        for (var i = 0; i < arguments.length; i++) {
          args[i] = thisInterpreter.pseudoToNative(arguments[i]);
        }
        return date[nativeFunc].apply(date, args);
      };
    })(functions[i]);
    this.setNativeFunctionPrototype(this.DATE, functions[i], wrapper);
  }

  // Unlike the previous instance methods, toISOString may throw.
  wrapper = function toISOString() {
    try {
      return this.data.toISOString();
    } catch (e) {
      thisInterpreter.throwException(thisInterpreter.RANGE_ERROR,
          'toISOString: ' + e.message);
    }
  };
  this.setNativeFunctionPrototype(this.DATE, 'toISOString', wrapper);
};

/**
 * Initialize Regular Expression object.
 * @param {!Interpreter.Object} globalObject Global object.
 */
Interpreter.prototype.initRegExp = function(globalObject) {
  var thisInterpreter = this;
  var wrapper;
  // RegExp constructor.
  wrapper = function RegExp(pattern, flags) {
    if (thisInterpreter.calledWithNew()) {
      // Called as `new RegExp()`.
      var rgx = this;
    } else {
      // Called as `RegExp()`.
      if (flags === undefined &&
          thisInterpreter.isa(pattern, thisInterpreter.REGEXP)) {
        // Regexp(/foo/) returns the same obj.
        return pattern;
      }
      var rgx = thisInterpreter.createObjectProto(thisInterpreter.REGEXP_PROTO);
    }
    pattern = pattern === undefined ? '' : String(pattern);
    flags = flags ? String(flags) : '';
    if (!/^[gmi]*$/.test(flags)) {
      // Don't allow ES6 flags 'y' and 's' to pass through.
      thisInterpreter.throwException(thisInterpreter.SYNTAX_ERROR,
          'Invalid regexp flag: ' + flags);
    }
    try {
      var nativeRegExp = new Interpreter.nativeGlobal.RegExp(pattern, flags)
    } catch (e) {
      // Throws if flags are repeated.
      thisInterpreter.throwException(thisInterpreter.SYNTAX_ERROR, e.message);
    }
    thisInterpreter.populateRegExp(rgx, nativeRegExp);
    return rgx;
  };
  this.REGEXP = this.createNativeFunction(wrapper, true);
  this.REGEXP_PROTO = this.REGEXP.properties['prototype'];
  this.setProperty(globalObject, 'RegExp', this.REGEXP,
      Interpreter.NONENUMERABLE_DESCRIPTOR);

  this.setProperty(this.REGEXP.properties['prototype'], 'global', undefined,
      Interpreter.READONLY_NONENUMERABLE_DESCRIPTOR);
  this.setProperty(this.REGEXP.properties['prototype'], 'ignoreCase', undefined,
      Interpreter.READONLY_NONENUMERABLE_DESCRIPTOR);
  this.setProperty(this.REGEXP.properties['prototype'], 'multiline', undefined,
      Interpreter.READONLY_NONENUMERABLE_DESCRIPTOR);
  this.setProperty(this.REGEXP.properties['prototype'], 'source', '(?:)',
      Interpreter.READONLY_NONENUMERABLE_DESCRIPTOR);

  // Use polyfill to avoid complexity of regexp threads.
  this.polyfills_.push(
/* POLYFILL START */
"Object.defineProperty(RegExp.prototype, 'test',",
    "{configurable: true, writable: true, value:",
  "function test(str) {",
    "return !!this.exec(str);",
  "}",
"});"
/* POLYFILL END */
);

  wrapper = function exec(string, callback) {
    var regexp = this.data;
    string = String(string);
    // Get lastIndex from wrapped regexp, since this is settable.
    regexp.lastIndex = Number(thisInterpreter.getProperty(this, 'lastIndex'));
    // Example of catastrophic exec RegExp:
    // /^(a+)+b/.exec('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaac')
    thisInterpreter.maybeThrowRegExp(regexp, callback);
    if (thisInterpreter['REGEXP_MODE'] === 2) {
      if (Interpreter.vm) {
        // Run exec in vm.
        var sandbox = {
          'string': string,
          'regexp': regexp,
        };
        var code = 'regexp.exec(string)';
        var match = thisInterpreter.vmCall(code, sandbox, regexp, callback);
        if (match !== Interpreter.REGEXP_TIMEOUT) {
          thisInterpreter.setProperty(this, 'lastIndex', regexp.lastIndex);
          callback(thisInterpreter.matchToPseudo_(match));
        }
      } else {
        // Run exec in separate thread.
        // Note that lastIndex is not preserved when a RegExp is passed to a
        // Web Worker.  Thus it needs to be passed back and forth separately.
        var execWorker = thisInterpreter.createWorker();
        var pid = thisInterpreter.regExpTimeout(regexp, execWorker, callback);
        var thisPseudoRegExp = this;
        execWorker.onmessage = function(e) {
          clearTimeout(pid);
          // Return tuple: [result, lastIndex]
          thisInterpreter.setProperty(thisPseudoRegExp, 'lastIndex', e.data[1]);
          callback(thisInterpreter.matchToPseudo_(e.data[0]));
        };
        execWorker.postMessage(['exec', regexp, regexp.lastIndex, string]);
      }
      return;
    }
    // Run exec natively.
    var match = regexp.exec(string);
    thisInterpreter.setProperty(this, 'lastIndex', regexp.lastIndex);
    callback(thisInterpreter.matchToPseudo_(match));
  };
  this.setAsyncFunctionPrototype(this.REGEXP, 'exec', wrapper);
};

/**
 * Regexp.prototype.exec and String.prototype.match both return an array
 * of matches.  This array has two extra properties, 'input' and 'index'.
 * Convert this native JavaScript data structure into an JS-Interpreter object.
 * @param {!Array} match The native JavaScript match array to be converted.
 * @returns {Interpreter.Value} The equivalent JS-Interpreter array or null.
 * @private
 */
Interpreter.prototype.matchToPseudo_ = function(match) {
  if (match) {
    // ES9 adds a 'groups' property.  This isn't part of ES5.  Delete it.
    // ES13 adds an 'indices' property though Acorn should forbid the
    // regex 'd' flag that creates it.
    // Future ES versions may add more properties.
    // Delete all properties not compatible with ES5.
    var props = /** @type {!Array<?>} */(Object.getOwnPropertyNames(match));
    for (var i = 0; i < props.length; i++) {
      var prop = props[i];
      if (isNaN(Number(prop)) && prop !== 'length' &&
          prop !== 'input' && prop !== 'index') {
        delete match[prop];
      }
    }
    // Convert from a native data structure to JS-Iterpreter objects.
    return this.nativeToPseudo(match);
  }
  return null;
};

/**
 * Initialize the Error class.
 * @param {!Interpreter.Object} globalObject Global object.
 */
Interpreter.prototype.initError = function(globalObject) {
  var thisInterpreter = this;
  // Error constructor.
  this.ERROR = this.createNativeFunction(function Error(opt_message) {
    if (thisInterpreter.calledWithNew()) {
      // Called as `new Error()`.
      var newError = this;
    } else {
      // Called as `Error()`.
      var newError = thisInterpreter.createObject(thisInterpreter.ERROR);
    }
    thisInterpreter.populateError(newError, opt_message);
    return newError;
  }, true);
  this.setProperty(globalObject, 'Error', this.ERROR,
      Interpreter.NONENUMERABLE_DESCRIPTOR);
  this.setProperty(this.ERROR.properties['prototype'], 'message', '',
      Interpreter.NONENUMERABLE_DESCRIPTOR);
  this.setProperty(this.ERROR.properties['prototype'], 'name', 'Error',
      Interpreter.NONENUMERABLE_DESCRIPTOR);

  var createErrorSubclass = function(name) {
    var constructor = thisInterpreter.createNativeFunction(
        function(opt_message) {
          if (thisInterpreter.calledWithNew()) {
            // Called as `new XyzError()`.
            var newError = this;
          } else {
            // Called as `XyzError()`.
            var newError = thisInterpreter.createObject(constructor);
          }
          thisInterpreter.populateError(newError, opt_message);
          return newError;
        }, true);
    thisInterpreter.setProperty(constructor, 'prototype',
        thisInterpreter.createObject(thisInterpreter.ERROR),
        Interpreter.NONENUMERABLE_DESCRIPTOR);
    thisInterpreter.setProperty(constructor.properties['prototype'], 'name',
        name, Interpreter.NONENUMERABLE_DESCRIPTOR);
    thisInterpreter.setProperty(globalObject, name, constructor,
        Interpreter.NONENUMERABLE_DESCRIPTOR);

    return constructor;
  };

  this.EVAL_ERROR = createErrorSubclass('EvalError');
  this.RANGE_ERROR = createErrorSubclass('RangeError');
  this.REFERENCE_ERROR = createErrorSubclass('ReferenceError');
  this.SYNTAX_ERROR = createErrorSubclass('SyntaxError');
  this.TYPE_ERROR = createErrorSubclass('TypeError');
  this.URI_ERROR = createErrorSubclass('URIError');
};

/**
 * Initialize Math object.
 * @param {!Interpreter.Object} globalObject Global object.
 */
Interpreter.prototype.initMath = function(globalObject) {
  var myMath = this.createObjectProto(this.OBJECT_PROTO);
  this.setProperty(globalObject, 'Math', myMath,
      Interpreter.NONENUMERABLE_DESCRIPTOR);
  var mathConsts = ['E', 'LN2', 'LN10', 'LOG2E', 'LOG10E', 'PI',
                    'SQRT1_2', 'SQRT2'];
  for (var i = 0; i < mathConsts.length; i++) {
    this.setProperty(myMath, mathConsts[i], Math[mathConsts[i]],
        Interpreter.READONLY_NONENUMERABLE_DESCRIPTOR);
  }
  var numFunctions = ['abs', 'acos', 'asin', 'atan', 'atan2', 'ceil', 'cos',
                      'exp', 'floor', 'log', 'max', 'min', 'pow', 'random',
                      'round', 'sin', 'sqrt', 'tan'];
  for (var i = 0; i < numFunctions.length; i++) {
    this.setProperty(myMath, numFunctions[i],
        this.createNativeFunction(Math[numFunctions[i]], false),
        Interpreter.NONENUMERABLE_DESCRIPTOR);
  }
};

/**
 * Initialize JSON object.
 * @param {!Interpreter.Object} globalObject Global object.
 */
Interpreter.prototype.initJSON = function(globalObject) {
  var wrapper;
  var thisInterpreter = this;
  var myJSON = thisInterpreter.createObjectProto(this.OBJECT_PROTO);
  this.setProperty(globalObject, 'JSON', myJSON,
      Interpreter.NONENUMERABLE_DESCRIPTOR);

  wrapper = function parse(text) {
    try {
      var nativeObj = JSON.parse(String(text));
    } catch (e) {
      thisInterpreter.throwException(thisInterpreter.SYNTAX_ERROR, e.message);
    }
    return thisInterpreter.nativeToPseudo(nativeObj);
  };
  this.setProperty(myJSON, 'parse', this.createNativeFunction(wrapper, false));

  wrapper = function stringify(value, replacer, space) {
    if (replacer && replacer.class === 'Function') {
      thisInterpreter.throwException(thisInterpreter.TYPE_ERROR,
          'Function replacer on JSON.stringify not supported');
    } else if (replacer && replacer.class === 'Array') {
      replacer = thisInterpreter.pseudoToNative(replacer);
      replacer = replacer.filter(function(word) {
        // Spec says we should also support boxed primitives here.
        return typeof word === 'string' || typeof word === 'number';
      });
    } else {
      replacer = null;
    }
    // Spec says we should also support boxed primitives here.
    if (typeof space !== 'string' && typeof space !== 'number') {
      space = undefined;
    }

    var nativeObj = thisInterpreter.pseudoToNative(value);
    try {
      var str = JSON.stringify(nativeObj, replacer, space);
    } catch (e) {
      thisInterpreter.throwException(thisInterpreter.TYPE_ERROR, e.message);
    }
    return str;
  };
  this.setProperty(myJSON, 'stringify',
      this.createNativeFunction(wrapper, false));
};

/**
 * Is an object of a certain class?
 * @param {Interpreter.Value} child Object to check.
 * @param {Interpreter.Object} constructor Constructor of object.
 * @returns {boolean} True if object is the class or inherits from it.
 *     False otherwise.
 */
Interpreter.prototype.isa = function(child, constructor) {
  if (child === null || child === undefined || !constructor) {
    return false;
  }
  var proto = constructor.properties['prototype'];
  if (child === proto) {
    return true;
  }
  // The first step up the prototype chain is harder since the child might be
  // a primitive value.  Subsequent steps can just follow the .proto property.
  child = this.getPrototype(child);
  while (child) {
    if (child === proto) {
      return true;
    }
    child = child.proto;
  }
  return false;
};

/**
 * Initialize a pseudo regular expression object based on a native regular
 * expression object.
 * @param {!Interpreter.Object} pseudoRegexp The existing object to set.
 * @param {!RegExp} nativeRegexp The native regular expression.
 */
Interpreter.prototype.populateRegExp = function(pseudoRegexp, nativeRegexp) {
  pseudoRegexp.data = new RegExp(nativeRegexp.source, nativeRegexp.flags);
  // lastIndex is settable, all others are read-only attributes
  this.setProperty(pseudoRegexp, 'lastIndex', nativeRegexp.lastIndex,
      Interpreter.NONENUMERABLE_DESCRIPTOR);
  this.setProperty(pseudoRegexp, 'source', nativeRegexp.source,
      Interpreter.READONLY_NONENUMERABLE_DESCRIPTOR);
  this.setProperty(pseudoRegexp, 'global', nativeRegexp.global,
      Interpreter.READONLY_NONENUMERABLE_DESCRIPTOR);
  this.setProperty(pseudoRegexp, 'ignoreCase', nativeRegexp.ignoreCase,
      Interpreter.READONLY_NONENUMERABLE_DESCRIPTOR);
  this.setProperty(pseudoRegexp, 'multiline', nativeRegexp.multiline,
      Interpreter.READONLY_NONENUMERABLE_DESCRIPTOR);
};

/**
 * Initialize a pseudo error object.
 * @param {!Interpreter.Object} pseudoError The existing object to set.
 * @param {string=} opt_message Error's message.
 */
Interpreter.prototype.populateError = function(pseudoError, opt_message) {
  if (opt_message) {
    this.setProperty(pseudoError, 'message', String(opt_message),
        Interpreter.NONENUMERABLE_DESCRIPTOR);
  }
  var tracebackData = [];
  for (var i = this.stateStack.length - 1; i >= 0; i--) {
    var state = this.stateStack[i];
    var node = state.node;
    if (node.type === 'CallExpression') {
      var func = state.func_;
      if (func && tracebackData.length) {
        tracebackData[tracebackData.length - 1].datumName =
            this.getProperty(func, 'name');
      }
    }
    if (node.loc &&
        (!tracebackData.length || node.type === 'CallExpression')) {
      tracebackData.push({datumLoc: node.loc});
    }
  }
  var errorName = String(this.getProperty(pseudoError, 'name'));
  var errorMessage = String(this.getProperty(pseudoError, 'message'));
  var stackString = errorName + ': ' + errorMessage + '\n';
  for (var i = 0; i < tracebackData.length; i++) {
    var loc = tracebackData[i].datumLoc;
    var name = tracebackData[i].datumName;
    var locString = loc.source + ':' +
        loc.start.line + ':' + loc.start.column;
    if (name) {
      stackString += '  at ' + name + ' (' + locString + ')\n';
    } else {
      stackString += '  at ' + locString + '\n';
    }
  }
  this.setProperty(pseudoError, 'stack', stackString.trim(),
      Interpreter.NONENUMERABLE_DESCRIPTOR);
};

/**
 * Create a Web Worker to execute regular expressions.
 * Using a separate file fails in Chrome when run locally on a file:// URI.
 * Using a data encoded URI fails in IE and Edge.
 * Using a blob works in IE11 and all other browsers.
 * @returns {!Worker} Web Worker with regexp execution code loaded.
 */
Interpreter.prototype.createWorker = function() {
  var blob = this.createWorker.blob_;
  if (!blob) {
    blob = new Blob([Interpreter.WORKER_CODE.join('\n')],
        {type: 'application/javascript'});
    // Cache the blob, so it doesn't need to be created next time.
    this.createWorker.blob_ = blob;
  }
  return new Worker(URL.createObjectURL(blob));
};

/**
 * Execute regular expressions in a node vm.
 * @param {string} code Code to execute.
 * @param {!Object} sandbox Global variables for new vm.
 * @param {!RegExp} nativeRegExp Regular expression.
 * @param {!Function} callback Asynchronous callback function.
 */
Interpreter.prototype.vmCall = function(code, sandbox, nativeRegExp, callback) {
  var options = {'timeout': this['REGEXP_THREAD_TIMEOUT']};
  try {
    return Interpreter.vm['runInNewContext'](code, sandbox, options);
  } catch (_e) {
    callback(null);
    this.throwException(this.ERROR, 'RegExp Timeout: ' + nativeRegExp);
  }
  return Interpreter.REGEXP_TIMEOUT;
};

/**
 * If REGEXP_MODE is 0, then throw an error.
 * Also throw if REGEXP_MODE is 2 and JS doesn't support Web Workers or vm.
 * @param {!RegExp} nativeRegExp Regular expression.
 * @param {!Function} callback Asynchronous callback function.
 */
Interpreter.prototype.maybeThrowRegExp = function(nativeRegExp, callback) {
  var ok;
  if (this['REGEXP_MODE'] === 0) {
    // Fail: No RegExp support.
    ok = false;
  } else if (this['REGEXP_MODE'] === 1) {
    // Ok: Native RegExp support.
    ok = true;
  } else {
    // Sandboxed RegExp handling.
    if (Interpreter.vm) {
      // Ok: Node's vm module already loaded.
      ok = true;
    } else if (typeof Worker === 'function' && typeof URL === 'function') {
      // Ok: Web Workers available.
      ok = true;
    } else if (true) {
      // Try to load Node's vm module.
      try {
        Interpreter.vm = __webpack_require__(/*! vm */ "vm");
      } catch (_e) {}
      ok = !!Interpreter.vm;
    } else {}
  }
  if (!ok) {
    callback(null);
    this.throwException(this.ERROR, 'Regular expressions not supported: ' +
        nativeRegExp);
  }
};

/**
 * Set a timeout for regular expression threads.  Unless cancelled, this will
 * terminate the thread and throw an error.
 * @param {!RegExp} nativeRegExp Regular expression (used for error message).
 * @param {!Worker} worker Thread to terminate.
 * @param {!Function} callback Async callback function to continue execution.
 * @returns {number} PID of timeout.  Used to cancel if thread completes.
 */
Interpreter.prototype.regExpTimeout = function(nativeRegExp, worker, callback) {
  var thisInterpreter = this;
  return setTimeout(function() {
      worker.terminate();
      callback(null);
      try {
        thisInterpreter.throwException(thisInterpreter.ERROR,
            'RegExp Timeout: ' + nativeRegExp);
      } catch (_e) {
        // Eat the expected Interpreter.STEP_ERROR.
      }
  }, this['REGEXP_THREAD_TIMEOUT']);
};

/**
 * Create a new data object based on a constructor's prototype.
 * @param {Interpreter.Object} constructor Parent constructor function,
 *     or null if scope object.
 * @returns {!Interpreter.Object} New data object.
 */
Interpreter.prototype.createObject = function(constructor) {
  return this.createObjectProto(constructor &&
                                constructor.properties['prototype']);
};

/**
 * Create a new data object based on a prototype.
 * @param {Interpreter.Object} proto Prototype object.
 * @returns {!Interpreter.Object} New data object.
 */
Interpreter.prototype.createObjectProto = function(proto) {
  if (typeof proto !== 'object') {
    throw Error('Non object prototype');
  }
  var obj = new Interpreter.Object(proto);
  if (this.isa(obj, this.ERROR)) {
    // Record this object as being an error so that its toString function can
    // process it correctly (toString has no access to the interpreter and could
    // not otherwise determine that the object is an error).
    obj.class = 'Error';
  }
  return obj;
};

/**
 * Create a new array.
 * @returns {!Interpreter.Object} New array.
 */
Interpreter.prototype.createArray = function() {
  var array = this.createObjectProto(this.ARRAY_PROTO);
  // Arrays have length.
  this.setProperty(array, 'length', 0,
      {'configurable': false, 'enumerable': false, 'writable': true});
  array.class = 'Array';
  return array;
};

/**
 * Create a new function object (could become interpreted or native or async).
 * @param {number} argumentLength Number of arguments.
 * @param {boolean} isConstructor True if function can be used with 'new'.
 * @returns {!Interpreter.Object} New function.
 * @private
 */
Interpreter.prototype.createFunctionBase_ = function(argumentLength,
                                                     isConstructor) {
  var func = this.createObjectProto(this.FUNCTION_PROTO);
  if (isConstructor) {
    var proto = this.createObjectProto(this.OBJECT_PROTO);
    this.setProperty(func, 'prototype', proto,
                     Interpreter.NONENUMERABLE_DESCRIPTOR);
    this.setProperty(proto, 'constructor', func,
                     Interpreter.NONENUMERABLE_DESCRIPTOR);
  } else {
    func.illegalConstructor = true;
  }
  this.setProperty(func, 'length', argumentLength,
      Interpreter.READONLY_NONENUMERABLE_DESCRIPTOR);
  func.class = 'Function';
  // When making changes to this function, check to see if those changes also
  // need to be made to the creation of FUNCTION_PROTO in initFunction.
  return func;
};

/**
 * Create a new interpreted function.
 * @param {!Object} node AST node defining the function.
 * @param {!Interpreter.Scope} scope Parent scope.
 * @param {string=} opt_name Optional name for function.
 * @returns {!Interpreter.Object} New function.
 */
Interpreter.prototype.createFunction = function(node, scope, opt_name) {
  var func = this.createFunctionBase_(node.params.length, true);
  func.parentScope = scope;
  func.node = node;
  // Choose a name for this function.
  // function foo() {}             -> 'foo'
  // var bar = function() {};      -> 'bar'
  // var bar = function foo() {};  -> 'foo'
  // foo.bar = function() {};      -> ''
  // var bar = new Function('');   -> 'anonymous'
  var name = node.id ? String(node.id.name) : (opt_name || '');
  this.setProperty(func, 'name', name,
      Interpreter.READONLY_NONENUMERABLE_DESCRIPTOR);
  return func;
};

/**
 * Create a new native function.
 * @param {!Function} nativeFunc JavaScript function.
 * @param {boolean} isConstructor True if function can be used with 'new'.
 * @returns {!Interpreter.Object} New function.
 */
Interpreter.prototype.createNativeFunction = function(nativeFunc,
                                                      isConstructor) {
  var func = this.createFunctionBase_(nativeFunc.length, isConstructor);
  func.nativeFunc = nativeFunc;
  nativeFunc.id = this.functionCounter_++;
  this.setProperty(func, 'name', nativeFunc.name,
      Interpreter.READONLY_NONENUMERABLE_DESCRIPTOR);
  return func;
};

/**
 * Create a new native asynchronous function.
 * @param {!Function} asyncFunc JavaScript function.
 * @returns {!Interpreter.Object} New function.
 */
Interpreter.prototype.createAsyncFunction = function(asyncFunc) {
  var func = this.createFunctionBase_(asyncFunc.length, true);
  func.asyncFunc = asyncFunc;
  asyncFunc.id = this.functionCounter_++;
  this.setProperty(func, 'name', asyncFunc.name,
      Interpreter.READONLY_NONENUMERABLE_DESCRIPTOR);
  return func;
};

/**
 * Converts from a native JavaScript object or value to a JS-Interpreter object.
 * Can handle JSON-style values, regular expressions, dates and functions.
 * Does handle cycles.
 * @param {*} nativeObj The native JavaScript object to be converted.
 * @param {Object=} opt_cycles Cycle detection object (used by recursive calls).
 * @returns {Interpreter.Value} The equivalent JS-Interpreter object.
 */
Interpreter.prototype.nativeToPseudo = function(nativeObj, opt_cycles) {
  if (nativeObj === null || nativeObj === undefined ||
      nativeObj === true || nativeObj === false ||
      typeof nativeObj === 'string' || typeof nativeObj === 'number') {
    // Primitive value.
    return nativeObj;
  }
  if (nativeObj instanceof Interpreter.Object) {
    throw Error('Object is already pseudo');
  }

  // Look up if this object has already been converted.
  var cycles = opt_cycles || {
    pseudo: [],
    native: [],
  };
  var index = cycles.native.indexOf(nativeObj);
  if (index !== -1) {
    return cycles.pseudo[index];
  }
  cycles.native.push(nativeObj);

  if (nativeObj instanceof RegExp) {
    var pseudoRegexp = this.createObjectProto(this.REGEXP_PROTO);
    this.populateRegExp(pseudoRegexp, nativeObj);
    cycles.pseudo.push(pseudoRegexp);
    return pseudoRegexp;
  }

  if (nativeObj instanceof Date) {
    var pseudoDate = this.createObjectProto(this.DATE_PROTO);
    pseudoDate.data = new Date(nativeObj.valueOf());
    cycles.pseudo.push(pseudoDate);
    return pseudoDate;
  }

  // Boxed primitives.
  var pseudoBox;
  if (nativeObj instanceof Number) {
    pseudoBox = this.createObject(this.NUMBER);
  } else if (nativeObj instanceof String) {
    pseudoBox = this.createObject(this.STRING);
  } else if (nativeObj instanceof Boolean) {
    pseudoBox = this.createObject(this.BOOLEAN);
  }
  if (pseudoBox) {
    pseudoBox.data = nativeObj.valueOf();
    cycles.pseudo.push(pseudoBox);
    return pseudoBox;
  }

  if (typeof nativeObj === 'function') {
    var thisInterpreter = this;
    var wrapper = function() {
      var args = Array.prototype.slice.call(arguments).map(function(i) {
          return thisInterpreter.pseudoToNative(i);
      });
      var value = nativeObj.apply(thisInterpreter, args);
      return thisInterpreter.nativeToPseudo(value);
    };
    var prototype = Object.getOwnPropertyDescriptor(nativeObj, 'prototype');
    var pseudoFunction = this.createNativeFunction(wrapper, !!prototype);
    cycles.pseudo.push(pseudoFunction);
    return pseudoFunction;
  }

  var pseudoObj;
  if (Array.isArray(nativeObj)) {  // Array.
    pseudoObj = this.createArray();
  } else {  // Object.
    pseudoObj = this.createObjectProto(this.OBJECT_PROTO);
  }
  cycles.pseudo.push(pseudoObj);
  for (var key in nativeObj) {
    this.setProperty(pseudoObj, key,
        this.nativeToPseudo(nativeObj[key], cycles));
  }
  return pseudoObj;
};

/**
 * Converts from a JS-Interpreter object to native JavaScript object.
 * Can handle JSON-style values, regular expressions, and dates.
 * Does not handle functions (for security reasons).
 * Does handle cycles.
 * @param {Interpreter.Value} pseudoObj The JS-Interpreter object to be
 * converted.
 * @param {Object=} opt_cycles Cycle detection object (used by recursive calls).
 * @returns {*} The equivalent native JavaScript object or value.
 */
Interpreter.prototype.pseudoToNative = function(pseudoObj, opt_cycles) {
  if (pseudoObj === null || pseudoObj === undefined ||
      pseudoObj === true || pseudoObj === false ||
      typeof pseudoObj === 'string' || typeof pseudoObj === 'number') {
    // Primitive value.
    return pseudoObj;
  }
  if (!(pseudoObj instanceof Interpreter.Object)) {
    throw Error('Object is not pseudo');
  }

  // Look up if this object has already been converted.
  var cycles = opt_cycles || {
    pseudo: [],
    native: [],
  };
  var index = cycles.pseudo.indexOf(pseudoObj);
  if (index !== -1) {
    return cycles.native[index];
  }
  cycles.pseudo.push(pseudoObj);

  if (this.isa(pseudoObj, this.REGEXP)) {  // Regular expression.
    var nativeRegExp = new RegExp(pseudoObj.data.source, pseudoObj.data.flags);
    nativeRegExp.lastIndex = pseudoObj.data.lastIndex;
    cycles.native.push(nativeRegExp);
    return nativeRegExp;
  }

  if (this.isa(pseudoObj, this.DATE)) {  // Date.
    var nativeDate = new Date(pseudoObj.data.valueOf());
    cycles.native.push(nativeDate);
    return nativeDate;
  }

  // Boxed primitives.
  if (this.isa(pseudoObj, this.NUMBER) ||
      this.isa(pseudoObj, this.STRING) ||
      this.isa(pseudoObj, this.BOOLEAN)) {
    var nativeBox = Object(pseudoObj.data);
    cycles.native.push(nativeBox);
    return nativeBox;
  }

  // Functions are not supported for security reasons.  Probably not a great
  // idea for the JS-Interpreter to be able to create native JS functions.
  // Still, if that floats your boat, this is where you'd add it.  Good luck.

  var nativeObj = this.isa(pseudoObj, this.ARRAY) ? [] : {};
  cycles.native.push(nativeObj);
  var val;
  for (var key in pseudoObj.properties) {
    val = this.pseudoToNative(pseudoObj.properties[key], cycles);
    // Use defineProperty to avoid side effects if setting '__proto__'.
    Object.defineProperty(nativeObj, key,
        {'value': val, 'writable': true, 'enumerable': true,
         'configurable': true});
  }
  return nativeObj;
};

/**
 * Look up the prototype for this value.
 * @param {Interpreter.Value} value Data object.
 * @returns {Interpreter.Object} Prototype object, null if none.
 */
Interpreter.prototype.getPrototype = function(value) {
  switch (typeof value) {
    case 'number':
      return this.NUMBER.properties['prototype'];
    case 'boolean':
      return this.BOOLEAN.properties['prototype'];
    case 'string':
      return this.STRING.properties['prototype'];
  }
  if (value) {
    return value.proto;
  }
  return null;
};

/**
 * Fetch a property value from a data object.
 * @param {Interpreter.Value} obj Data object.
 * @param {Interpreter.Value} name Name of property.
 * @returns {Interpreter.Value} Property value (may be undefined).
 */
Interpreter.prototype.getProperty = function(obj, name) {
  if (this.getterStep_) {
    throw Error('Getter not supported in that context');
  }
  name = String(name);
  if (obj === undefined || obj === null) {
    this.throwException(this.TYPE_ERROR,
                        "Cannot read property '" + name + "' of " + obj);
  }
  if (typeof obj === 'object' && !(obj instanceof Interpreter.Object)) {
    throw TypeError('Expecting native value or pseudo object');
  }
  if (name === 'length') {
    // Special cases for magic length property.
    if (this.isa(obj, this.STRING)) {
      return String(obj).length;
    }
  } else if (name.charCodeAt(0) < 0x40) {
    // Might have numbers in there?
    // Special cases for string array indexing
    if (this.isa(obj, this.STRING)) {
      var n = Interpreter.legalArrayIndex(name);
      if (!isNaN(n) && n < String(obj).length) {
        return String(obj)[n];
      }
    }
  }
  do {
    if (obj.properties && name in obj.properties) {
      var getter = obj.getter[name];
      if (getter) {
        // Flag this function as being a getter and thus needing immediate
        // execution (rather than being the value of the property).
        this.getterStep_ = true;
        return getter;
      }
      return obj.properties[name];
    }
  } while ((obj = this.getPrototype(obj)));
  return undefined;
};

/**
 * Does the named property exist on a data object.
 * @param {Interpreter.Object} obj Data object.
 * @param {Interpreter.Value} name Name of property.
 * @returns {boolean} True if property exists.
 */
Interpreter.prototype.hasProperty = function(obj, name) {
  if (!(obj instanceof Interpreter.Object)) {
    throw TypeError('Primitive data type has no properties');
  }
  name = String(name);
  if (name === 'length' && this.isa(obj, this.STRING)) {
    return true;
  }
  if (this.isa(obj, this.STRING)) {
    var n = Interpreter.legalArrayIndex(name);
    if (!isNaN(n) && n < String(obj).length) {
      return true;
    }
  }
  do {
    if (obj.properties && name in obj.properties) {
      return true;
    }
  } while ((obj = this.getPrototype(obj)));
  return false;
};

/**
 * Set a property value on a data object.
 * @param {Interpreter.Value} obj Data object.
 * @param {Interpreter.Value} name Name of property.
 * @param {Interpreter.Value} value New property value.
 *     Use Interpreter.VALUE_IN_DESCRIPTOR if value is handled by
 *     descriptor instead.
 * @param {Object=} opt_descriptor Optional descriptor object.
 * @returns {!Interpreter.Object|undefined} Returns a setter function if one
 *     needs to be called, otherwise undefined.
 */
Interpreter.prototype.setProperty = function(obj, name, value, opt_descriptor) {
  if (this.setterStep_) {
    // Getter from previous call to setProperty was not handled.
    throw Error('Setter not supported in that context');
  }
  name = String(name);
  if (obj === undefined || obj === null) {
    this.throwException(this.TYPE_ERROR,
                        "Cannot set property '" + name + "' of " + obj);
  }
  if (typeof obj === 'object' && !(obj instanceof Interpreter.Object)) {
    throw TypeError('Expecting native value or pseudo object');
  }
  if (opt_descriptor && ('get' in opt_descriptor || 'set' in opt_descriptor) &&
      ('value' in opt_descriptor || 'writable' in opt_descriptor)) {
    this.throwException(this.TYPE_ERROR, 'Invalid property descriptor. ' +
        'Cannot both specify accessors and a value or writable attribute');
  }
  var strict = !this.stateStack || this.getScope().strict;
  if (!(obj instanceof Interpreter.Object)) {
    if (strict) {
      this.throwException(this.TYPE_ERROR, "Can't create property '" + name +
                          "' on '" + obj + "'");
    }
    return;
  }
  if (this.isa(obj, this.STRING)) {
    var n = Interpreter.legalArrayIndex(name);
    if (name === 'length' || (!isNaN(n) && n < String(obj).length)) {
      // Can't set length or letters on String objects.
      if (strict) {
        this.throwException(this.TYPE_ERROR, "Cannot assign to read only " +
            "property '" + name + "' of String '" + obj.data + "'");
      }
      return;
    }
  }
  if (obj.class === 'Array') {
    // Arrays have a magic length variable that is bound to the elements.
    var len = obj.properties.length;
    var i;
    if (name === 'length') {
      // Delete elements if length is smaller.
      if (opt_descriptor) {
        if (!('value' in opt_descriptor)) {
          return;
        }
        value = opt_descriptor['value'];
      }
      value = Interpreter.legalArrayLength(value);
      if (isNaN(value)) {
        this.throwException(this.RANGE_ERROR, 'Invalid array length');
      }
      if (value < len) {
        for (i in obj.properties) {
          i = Interpreter.legalArrayIndex(i);
          if (!isNaN(i) && value <= i) {
            delete obj.properties[i];
          }
        }
      }
    } else if (!isNaN(i = Interpreter.legalArrayIndex(name))) {
      // Increase length if this index is larger.
      obj.properties.length = Math.max(len, i + 1);
    }
  }
  if (obj.preventExtensions && !(name in obj.properties)) {
    if (strict) {
      this.throwException(this.TYPE_ERROR, "Can't add property '" + name +
                          "', object is not extensible");
    }
    return;
  }
  if (opt_descriptor) {
    // Define the property.
    var descriptor = {};
    if ('get' in opt_descriptor && opt_descriptor['get']) {
      obj.getter[name] = opt_descriptor['get'];
      descriptor['get'] = this.setProperty.placeholderGet_;
    }
    if ('set' in opt_descriptor && opt_descriptor['set']) {
      obj.setter[name] = opt_descriptor['set'];
      descriptor['set'] = this.setProperty.placeholderSet_;
    }
    if ('configurable' in opt_descriptor) {
      descriptor['configurable'] = opt_descriptor['configurable'];
    }
    if ('enumerable' in opt_descriptor) {
      descriptor['enumerable'] = opt_descriptor['enumerable'];
    }
    if ('writable' in opt_descriptor) {
      descriptor['writable'] = opt_descriptor['writable'];
      delete obj.getter[name];
      delete obj.setter[name];
    }
    if ('value' in opt_descriptor) {
      descriptor['value'] = opt_descriptor['value'];
      delete obj.getter[name];
      delete obj.setter[name];
    } else if (value !== Interpreter.VALUE_IN_DESCRIPTOR) {
      descriptor['value'] = value;
      delete obj.getter[name];
      delete obj.setter[name];
    }
    try {
      Object.defineProperty(obj.properties, name, descriptor);
    } catch (e) {
      this.throwException(this.TYPE_ERROR, 'Cannot redefine property: ' + name);
    }
    // Now that the definition has suceeded, clean up any obsolete get/set funcs.
    if ('get' in opt_descriptor && !opt_descriptor['get']) {
      delete obj.getter[name];
    }
    if ('set' in opt_descriptor && !opt_descriptor['set']) {
      delete obj.setter[name];
    }
  } else {
    // Set the property.
    if (value === Interpreter.VALUE_IN_DESCRIPTOR) {
      throw ReferenceError('Value not specified');
    }
    // Determine the parent (possibly self) where the property is defined.
    var defObj = obj;
    while (!(name in defObj.properties)) {
      defObj = this.getPrototype(defObj);
      if (!defObj) {
        // This is a new property.
        defObj = obj;
        break;
      }
    }
    if (defObj.setter && defObj.setter[name]) {
      this.setterStep_ = true;
      return defObj.setter[name];
    }
    if (defObj.getter && defObj.getter[name]) {
      if (strict) {
        this.throwException(this.TYPE_ERROR, "Cannot set property '" + name +
            "' of object '" + obj + "' which only has a getter");
      }
    } else {
      // No setter, simple assignment.
      try {
        obj.properties[name] = value;
      } catch (_e) {
        if (strict) {
          this.throwException(this.TYPE_ERROR, "Cannot assign to read only " +
              "property '" + name + "' of object '" + obj + "'");
        }
      }
    }
  }
};

Interpreter.prototype.setProperty.placeholderGet_ =
    function() {throw Error('Placeholder getter');};
Interpreter.prototype.setProperty.placeholderSet_ =
    function() {throw Error('Placeholder setter');};

/**
 * Convenience method for adding a native function as a non-enumerable property
 * onto an object's prototype.
 * @param {!Interpreter.Object} obj Data object.
 * @param {Interpreter.Value} name Name of property.
 * @param {!Function} wrapper Function object.
 */
Interpreter.prototype.setNativeFunctionPrototype =
    function(obj, name, wrapper) {
  this.setProperty(obj.properties['prototype'], name,
      this.createNativeFunction(wrapper, false),
      Interpreter.NONENUMERABLE_DESCRIPTOR);
};

/**
 * Convenience method for adding an async function as a non-enumerable property
 * onto an object's prototype.
 * @param {!Interpreter.Object} obj Data object.
 * @param {Interpreter.Value} name Name of property.
 * @param {!Function} wrapper Function object.
 */
Interpreter.prototype.setAsyncFunctionPrototype =
    function(obj, name, wrapper) {
  this.setProperty(obj.properties['prototype'], name,
      this.createAsyncFunction(wrapper),
      Interpreter.NONENUMERABLE_DESCRIPTOR);
};

/**
 * Returns the current scope from the stateStack.
 * @returns {!Interpreter.Scope} Current scope.
 */
Interpreter.prototype.getScope = function() {
  var scope = this.stateStack[this.stateStack.length - 1].scope;
  if (!scope) {
    throw Error('No scope found');
  }
  return scope;
};

/**
 * Create a new scope dictionary.
 * @param {!Object} node AST node defining the scope container
 *     (e.g. a function).
 * @param {Interpreter.Scope} parentScope Scope to link to.
 * @returns {!Interpreter.Scope} New scope.
 */
Interpreter.prototype.createScope = function(node, parentScope) {
  // Determine if this scope starts with `use strict`.
  var strict = false;
  if (parentScope && parentScope.strict) {
    strict = true;
  } else {
    var firstNode = node.body && node.body[0];
    if (firstNode && firstNode.expression &&
        firstNode.expression.type === 'Literal' &&
        firstNode.expression.value === 'use strict') {
      strict = true;
    }
  }
  var object = this.createObjectProto(null);
  var scope = new Interpreter.Scope(parentScope, strict, object);
  if (!parentScope) {
    this.initGlobal(scope.object);
  }
  this.populateScope_(node, scope);
  return scope;
};

/**
 * Create a new special scope dictionary. Similar to createScope(), but
 * doesn't assume that the scope is for a function body.
 * This is used for 'catch' clauses, 'with' statements,
 * and named function expressions.
 * @param {!Interpreter.Scope} parentScope Scope to link to.
 * @param {Interpreter.Object=} opt_object Optional object to transform into
 *     scope.
 * @returns {!Interpreter.Scope} New scope.
 */
Interpreter.prototype.createSpecialScope = function(parentScope, opt_object) {
  if (!parentScope) {
    throw Error('parentScope required');
  }
  var object = opt_object || this.createObjectProto(null);
  return new Interpreter.Scope(parentScope, parentScope.strict, object);
};

/**
 * Retrieves a value from the scope chain.
 * @param {string} name Name of variable.
 * @returns {Interpreter.Value} Any value.
 *   May be flagged as being a getter and thus needing immediate execution
 *   (rather than being the value of the property).
 */
Interpreter.prototype.getValueFromScope = function(name) {
  var scope = this.getScope();
  while (scope && scope !== this.globalScope) {
    if (name in scope.object.properties) {
      return scope.object.properties[name];
    }
    scope = scope.parentScope;
  }
  // The root scope is also an object which has inherited properties and
  // could also have getters.
  if (scope === this.globalScope && this.hasProperty(scope.object, name)) {
    return this.getProperty(scope.object, name);
  }
  // Typeof operator is unique: it can safely look at non-defined variables.
  var prevNode = this.stateStack[this.stateStack.length - 1].node;
  if (prevNode.type === 'UnaryExpression' &&
      prevNode.operator === 'typeof') {
    return undefined;
  }
  this.throwException(this.REFERENCE_ERROR, name + ' is not defined');
};

/**
 * Sets a value to the current scope.
 * @param {string} name Name of variable.
 * @param {Interpreter.Value} value Value.
 * @returns {!Interpreter.Object|undefined} Returns a setter function if one
 *     needs to be called, otherwise undefined.
 */
Interpreter.prototype.setValueToScope = function(name, value) {
  var scope = this.getScope();
  var strict = scope.strict;
  while (scope && scope !== this.globalScope) {
    if (name in scope.object.properties) {
      try {
        scope.object.properties[name] = value;
      } catch (_e) {
        if (strict) {
          this.throwException(this.TYPE_ERROR,
              "Cannot assign to read only variable '" + name + "'");
        }
      }
      return undefined;
    }
    scope = scope.parentScope;
  }
  // The root scope is also an object which has readonly properties and
  // could also have setters.
  if (scope === this.globalScope &&
      (!strict || this.hasProperty(scope.object, name))) {
    return this.setProperty(scope.object, name, value);
  }
  this.throwException(this.REFERENCE_ERROR, name + ' is not defined');
};

/**
 * Create a new scope for the given node and populate it with all variables
 * and named functions.
 * @param {!Object} node AST node (usually a program or function when initally
 *   calling this function, though it recurses to scan many child nodes).
 * @param {!Interpreter.Scope} scope Scope dictionary to populate.
 * @returns {!Object} Map of all variable and function names.
 * @private
 */
Interpreter.prototype.populateScope_ = function(node, scope) {
  var variableCache;
  if (!node.variableCache_) {
    variableCache = Object.create(null);
    switch (node.type) {
      case 'VariableDeclaration':
        for (var i = 0; i < node.declarations.length; i++) {
          variableCache[node.declarations[i].id.name] = true;
        }
        break;
      case 'FunctionDeclaration':
        variableCache[node.id.name] = node;
        break;
      case 'BlockStatement':
      case 'CatchClause':
      case 'DoWhileStatement':
      case 'ForInStatement':
      case 'ForStatement':
      case 'IfStatement':
      case 'LabeledStatement':
      case 'Program':
      case 'SwitchCase':
      case 'SwitchStatement':
      case 'TryStatement':
      case 'WithStatement':
      case 'WhileStatement':
        // All the structures within which a variable or function could hide.
        var nodeClass = node.constructor;
        for (var name in node) {
          if (node[name] === node.loc) continue;
          var prop = node[name];
          if (prop && typeof prop === 'object') {
            var childCache;
            if (Array.isArray(prop)) {
              for (var i = 0; i < prop.length; i++) {
                if (prop[i] && prop[i].constructor === nodeClass) {
                  childCache = this.populateScope_(prop[i], scope);
                  for (var name in childCache) {
                    variableCache[name] = childCache[name];
                  }
                }
              }
            } else {
              if (prop.constructor === nodeClass) {
                childCache = this.populateScope_(prop, scope);
                for (var name in childCache) {
                  variableCache[name] = childCache[name];
                }
              }
            }
          }
        }
    }
    node.variableCache_ = variableCache;
  } else {
    variableCache = node.variableCache_;
  }
  for (var name in variableCache) {
    if (variableCache[name] === true) {
      this.setProperty(scope.object, name, undefined,
          Interpreter.VARIABLE_DESCRIPTOR);
    } else {
      this.setProperty(scope.object, name,
          this.createFunction(variableCache[name], scope),
          Interpreter.VARIABLE_DESCRIPTOR);
    }
  }
  return variableCache;
};

/**
 * Is the current state directly being called with as a construction with 'new'.
 * @returns {boolean} True if 'new foo()', false if 'foo()'.
 */
Interpreter.prototype.calledWithNew = function() {
  return this.stateStack[this.stateStack.length - 1].isConstructor;
};

/**
 * Gets a value from the scope chain or from an object property.
 * @param {!Array} ref Name of variable or object/propname tuple.
 * @returns {Interpreter.Value} Any value.
 *   May be flagged as being a getter and thus needing immediate execution
 *   (rather than being the value of the property).
 */
Interpreter.prototype.getValue = function(ref) {
  if (ref[0] === Interpreter.SCOPE_REFERENCE) {
    // A null/varname variable lookup.
    return this.getValueFromScope(ref[1]);
  } else {
    // An obj/prop components tuple (foo.bar).
    return this.getProperty(ref[0], ref[1]);
  }
};

/**
 * Sets a value to the scope chain or to an object property.
 * @param {!Array} ref Name of variable or object/propname tuple.
 * @param {Interpreter.Value} value Value.
 * @returns {!Interpreter.Object|undefined} Returns a setter function if one
 *     needs to be called, otherwise undefined.
 */
Interpreter.prototype.setValue = function(ref, value) {
  if (ref[0] === Interpreter.SCOPE_REFERENCE) {
    // A null/varname variable lookup.
    return this.setValueToScope(ref[1], value);
  }
  // An obj/prop components tuple (foo.bar).
  return this.setProperty(ref[0], ref[1], value);
};

/**
 * Throw an exception in the interpreter that can be handled by an
 * interpreter try/catch statement.  If unhandled, a real exception will
 * be thrown.  Can be called with either an error class and a message, or
 * with an actual object to be thrown.
 * @param {!Interpreter.Object|Interpreter.Value} errorClass Type of error
 *   (if message is provided) or the value to throw (if no message).
 * @param {string=} opt_message Message being thrown.
 */
Interpreter.prototype.throwException = function(errorClass, opt_message) {
  if (!this.globalScope) {
    // This is an error being thrown in the initialization, throw a real error.
    throw (opt_message === undefined) ? errorClass : opt_message;
  }
  if (opt_message === undefined ||
      !(errorClass instanceof Interpreter.Object)) {
    var error = errorClass;  // This is a value to throw, not an error class.
  } else {
    var error = this.createObject(errorClass);
    this.populateError(error, opt_message);
  }
  this.unwind(Interpreter.Completion.THROW, error, undefined);
  // Abort anything related to the current step.
  throw Interpreter.STEP_ERROR;
};

/**
 * Unwind the stack to the innermost relevant enclosing TryStatement,
 * For/ForIn/WhileStatement or Call/NewExpression.  If this results in
 * the stack being completely unwound the thread will be terminated
 * and the appropriate error being thrown.
 * @param {Interpreter.Completion} type Completion type.
 * @param {Interpreter.Value} value Value computed, returned or thrown.
 * @param {string|undefined} label Target label for break or return.
 */
Interpreter.prototype.unwind = function(type, value, label) {
  if (type === Interpreter.Completion.NORMAL) {
    throw TypeError('Should not unwind for NORMAL completions');
  }

  loop: for (var stack = this.stateStack; stack.length > 0; stack.pop()) {
    var state = stack[stack.length - 1];
    switch (state.node.type) {
      case 'TryStatement':
        state.cv = {type: type, value: value, label: label};
        return;
      case 'CallExpression':
      case 'NewExpression':
        if (type === Interpreter.Completion.RETURN) {
          state.value = value;
          return;
        } else if (type === Interpreter.Completion.BREAK ||
            type === Interpreter.Completion.CONTINUE) {
          throw Error('Unsyntactic break/continue not rejected by Acorn');
        }
        break;
      case 'Program':
        if (type === Interpreter.Completion.RETURN) {
          // While a return outside of a function call isn't normally possible,
          // this can happen if a setTimeout/setInterval task returns.
          return;
        }
        // Don't pop the stateStack.
        // Leave the root scope on the tree in case the program is appended to.
        state.done = true;
        break loop;
    }
    if (type === Interpreter.Completion.BREAK) {
      if (label ? (state.labels && state.labels.indexOf(label) !== -1) :
          (state.isLoop || state.isSwitch)) {
        stack.pop();
        return;
      }
    } else if (type === Interpreter.Completion.CONTINUE) {
      if (label ? (state.labels && state.labels.indexOf(label) !== -1) :
          state.isLoop) {
        return;
      }
    }
  }

  // Unhandled completion.  Throw a real error.
  var realError;
  if (this.isa(value, this.ERROR)) {
    var errorTable = {
      'EvalError': EvalError,
      'RangeError': RangeError,
      'ReferenceError': ReferenceError,
      'SyntaxError': SyntaxError,
      'TypeError': TypeError,
      'URIError': URIError,
    };
    var name = String(this.getProperty(value, 'name'));
    var message = this.getProperty(value, 'message').valueOf();
    var errorConstructor = errorTable[name] || Error;
    realError = errorConstructor(message);
    realError.stack = String(this.getProperty(value, 'stack'));
  } else {
    realError = String(value);
  }
  // Overwrite the previous (more or less random) interpreter return value.
  // Replace it with the error.
  this.value = realError;
  throw realError;
};

/**
 * AST to code.  Summarizes the expression at the given node.  Currently
 * not guaranteed to be correct or complete.  Used for error messages.
 * E.g. `escape('hello') + 42` -> 'escape(...) + 42'
 * @param {!Object} node AST node.
 * @returns {string} Code string.
 */
Interpreter.prototype.nodeSummary = function(node) {
  switch (node.type) {
    case 'ArrayExpression':
      return '[...]';
    case 'BinaryExpression':
    case 'LogicalExpression':
      return this.nodeSummary(node.left) + ' ' + node.operator + ' ' +
          this.nodeSummary(node.right);
    case 'CallExpression':
      return this.nodeSummary(node.callee) + '(...)';
    case 'ConditionalExpression':
      return this.nodeSummary(node.test) + ' ? ' +
          this.nodeSummary(node.consequent) + ' : ' +
          this.nodeSummary(node.alternate);
    case 'Identifier':
      return node.name;
    case 'Literal':
      return node.raw;
    case 'MemberExpression':
      var obj = this.nodeSummary(node.object);
      var prop = this.nodeSummary(node.property);
      return node.computed ? (obj + '[' + prop + ']') : (obj + '.' + prop);
    case 'NewExpression':
      return 'new ' + this.nodeSummary(node.callee) + '(...)';
    case 'ObjectExpression':
      return '{...}';
    case 'ThisExpression':
      return 'this';
    case 'UnaryExpression':
      return node.operator + ' ' + this.nodeSummary(node.argument);
    case 'UpdateExpression':
      var argument = this.nodeSummary(node.argument);
      return node.prefix ? node.operator + argument : argument + node.operator;
  }
  return '???';
};

/**
 * Create a new queued task.
 * @param {boolean} isInterval True if setInterval, false if setTimeout.
 * @param {!Arguments} args Arguments from setInterval and setTimeout.
 *     [code, delay]
 *     [functionRef, delay, param1, param2, param3, ...]
 * @returns {number} PID of new task.
 * @private
 */
Interpreter.prototype.createTask_ = function(isInterval, args) {
  var parentState = this.stateStack[this.stateStack.length - 1];
  var argsArray = Array.from(args);
  var exec = argsArray.shift();
  var delay = Math.max(Number(argsArray.shift() || 0), 0);
  var node = this.newNode();
  var scope, functionRef, ast;

  if ((exec instanceof Interpreter.Object) && exec.class === 'Function') {
    // setTimeout/setInterval with a function reference.
    functionRef = exec;
    node.type = 'CallExpression';
    scope = parentState.scope;
  } else {
    // setTimeout/setInterval with code string.
    try {
      ast = this.parse_(String(exec), 'taskCode' + (this.taskCodeNumber_++));
    } catch (e) {
      // Acorn threw a SyntaxError.  Rethrow as a trappable error.
      this.throwException(this.SYNTAX_ERROR, 'Invalid code: ' + e.message);
    }
    node.type = 'EvalProgram_';
    node.body = ast.body;
    // Change highlighting to encompass the string.
    var execNode = parentState.node.arguments[0];
    var execStart = execNode ? execNode.start : undefined;
    var execEnd = execNode ? execNode.end : undefined;
    Interpreter.stripLocations_(node, execStart, execEnd);
    scope = this.globalScope;
    argsArray.length = 0;
  }

  var task = new Interpreter.Task(functionRef, argsArray, scope, node,
      isInterval ? delay : -1);
  this.scheduleTask_(task, delay);
  return task.pid;
};

/**
 * Schedule a task to execute at some time in the future.
 * @param {!Interpreter.Task} task Task to schedule.
 * @param {number} delay Number of ms before the task should execute.
 * @private
 */
Interpreter.prototype.scheduleTask_ = function(task, delay) {
  task.time = Date.now() + delay;
  // For optimum efficiency we could do a binary search and inject the task
  // at the right spot.  But 'push' & 'sort' is just two lines of code.
  this.tasks.push(task);
  this.tasks.sort(function(a, b) {return a.time - b.time});
};

/**
 * Delete a queued task.
 * @param {number} pid PID of task to delete.
 * @private
 */
Interpreter.prototype.deleteTask_ = function(pid) {
  for (var i = 0; i < this.tasks.length; i++) {
    if (this.tasks[i].pid == pid) {
      this.tasks.splice(i, 1);
      break;
    }
  }
};

/**
 * Find the next queued task that's due to run.
 * @returns {Interpreter.State} Starting state of next task.  Null if no task.
 * @private
 */
Interpreter.prototype.nextTask_ = function() {
  var task = this.tasks[0];
  if (!task || task.time > Date.now()) {
    return null;
  }
  // Found a task that's due to run.
  this.tasks.shift();
  if (task.interval >= 0) {
    this.scheduleTask_(task, task.interval);
  }
  var state = new Interpreter.State(task.node, task.scope);
  if (task.functionRef) {
    // setTimeout/setInterval with a function reference.
    state.doneCallee_ = 2;
    state.funcThis_ = this.globalObject;
    state.func_ = task.functionRef;
    state.doneArgs_ = true;
    state.arguments_ = task.argsArray;
  }
  return state;
};

/**
 * Create a call to a getter function.
 * @param {!Interpreter.Object} func Function to execute.
 * @param {!Interpreter.Object|!Array} left
 *     Name of variable or object/propname tuple.
 * @private
 */
Interpreter.prototype.createGetter_ = function(func, left) {
  if (!this.getterStep_) {
    throw Error('Unexpected call to createGetter');
  }
  // Clear the getter flag.
  this.getterStep_ = false;
  // Normally `this` will be specified as the object component (o.x).
  // Sometimes `this` is explicitly provided (o).
  var funcThis = Array.isArray(left) ? left[0] : left;
  var node = this.newNode();
  node.type = 'CallExpression';
  var state = new Interpreter.State(node,
      this.stateStack[this.stateStack.length - 1].scope);
  state.doneCallee_ = 2;
  state.funcThis_ = funcThis;
  state.func_ = func;
  state.doneArgs_ = true;
  state.arguments_ = [];
  return state;
};

/**
 * Create a call to a setter function.
 * @param {!Interpreter.Object} func Function to execute.
 * @param {!Interpreter.Object|!Array} left
 *     Name of variable or object/propname tuple.
 * @param {Interpreter.Value} value Value to set.
 * @private
 */
Interpreter.prototype.createSetter_ = function(func, left, value) {
  if (!this.setterStep_) {
    throw Error('Unexpected call to createSetter');
  }
  // Clear the setter flag.
  this.setterStep_ = false;
  // Normally `this` will be specified as the object component (o.x).
  // Sometimes `this` is implicitly the global object (x).
  var funcThis = Array.isArray(left) ? left[0] : this.globalObject;
  var node = this.newNode();
  node.type = 'CallExpression';
  var state = new Interpreter.State(node,
      this.stateStack[this.stateStack.length - 1].scope);
  state.doneCallee_ = 2;
  state.funcThis_ = funcThis;
  state.func_ = func;
  state.doneArgs_ = true;
  state.arguments_ = [value];
  return state;
};

/**
 * In non-strict mode `this` must be an object.
 * Must not be called in strict mode.
 * @param {Interpreter.Value} value Proposed value for `this`.
 * @returns {!Interpreter.Object} Final value for `this`.
 * @private
 */
Interpreter.prototype.boxThis_ = function(value) {
  if (value === undefined || value === null) {
    // `Undefined` and `null` are changed to the global object.
    return this.globalObject;
  }
  if (!(value instanceof Interpreter.Object)) {
    // Primitives must be boxed.
    var box = this.createObjectProto(this.getPrototype(value));
    box.data = value;
    return box;
  }
  return value;
};

/**
 * Return the global scope object.
 * @returns {!Interpreter.Scope} Scope object.
 */
Interpreter.prototype.getGlobalScope = function() {
  return this.globalScope;
};

/**
 * Sets the global scope object.
 * @param {!Interpreter.Scope} newScope Scope object.
 */
Interpreter.prototype.setGlobalScope = function(newScope) {
  this.globalScope = newScope;
  this.stateStack[0].scope = newScope;
};

/**
 * Return the state stack.
 * @returns {!Array<!Interpreter.State>} State stack.
 */
Interpreter.prototype.getStateStack = function() {
  return this.stateStack;
};

/**
 * Replace the state stack with a new one.
 * @param {!Array<!Interpreter.State>} newStack New state stack.
 */
Interpreter.prototype.setStateStack = function(newStack) {
  this.stateStack = newStack;
};

/**
 * Typedef for JS values.
 * @typedef {!Interpreter.Object|boolean|number|string|undefined|null}
 */
Interpreter.Value;

/**
 * Class for a state.
 * @param {!Object} node AST node for the state.
 * @param {!Interpreter.Scope} scope Scope object for the state.
 * @constructor
 */
Interpreter.State = function(node, scope) {
  this.node = node;
  this.scope = scope;
};

/**
 * Class for a scope.
 * @param {Interpreter.Scope} parentScope Parent scope.
 * @param {boolean} strict True if "use strict".
 * @param {!Interpreter.Object} object Object containing scope's variables.
 * @struct
 * @constructor
 */
Interpreter.Scope = function(parentScope, strict, object) {
  this.parentScope = parentScope;
  this.strict = strict;
  this.object = object;
};

/**
 * Class for an object.
 * @param {Interpreter.Object} proto Prototype object or null.
 * @constructor
 */
Interpreter.Object = function(proto) {
  this.getter = Object.create(null);
  this.setter = Object.create(null);
  this.properties = Object.create(null);
  this.proto = proto;
};

/** @type {Interpreter.Object} */
Interpreter.Object.prototype.proto = null;

/** @type {string} */
Interpreter.Object.prototype.class = 'Object';

/** @type {Date|RegExp|boolean|number|string|null} */
Interpreter.Object.prototype.data = null;

/**
 * Convert this object into a string.
 * @returns {string} String value.
 * @override
 */
Interpreter.Object.prototype.toString = function() {
  if (!Interpreter.currentInterpreter_) {
    // Called from outside an interpreter.
    return '[object Interpreter.Object]';
  }
  if (!(this instanceof Interpreter.Object)) {
    // Primitive value.
    return String(this);
  }

  if (this.class === 'Array') {
    // Array contents must not have cycles.
    var cycles = Interpreter.toStringCycles_;
    cycles.push(this);
    try {
      var strs = [];
      // Truncate very long strings.  This is not part of the spec,
      // but it prevents hanging the interpreter for gigantic arrays.
      var maxLength = this.properties.length;
      var truncated = false;
      if (maxLength > 1024) {
        maxLength = 1000;
        truncated = true;
      }
      for (var i = 0; i < maxLength; i++) {
        var value = this.properties[i];
        strs[i] = ((value instanceof Interpreter.Object) &&
            cycles.indexOf(value) !== -1) ? '...' : value;
      }
      if (truncated) {
        strs.push('...');
      }
    } finally {
      cycles.pop();
    }
    return strs.join(',');
  }

  if (this.class === 'Error') {
    // Error name and message properties must not have cycles.
    var cycles = Interpreter.toStringCycles_;
    if (cycles.indexOf(this) !== -1) {
      return '[object Error]';
    }
    var name, message;
    // Bug: Does not support getters and setters for name or message.
    var obj = this;
    do {
      if ('name' in obj.properties) {
        name = obj.properties.name;
        break;
      }
    } while ((obj = obj.proto));
    obj = this;
    do {
      if ('message' in obj.properties) {
        message = obj.properties.message;
        break;
      }
    } while ((obj = obj.proto));
    cycles.push(this);
    try {
      name = name && String(name);
      message = message && String(message);
    } finally {
      cycles.pop();
    }
    return message ? name + ': ' + message : String(name);
  }

  if (this.data !== null) {
    // RegExp, Date, and boxed primitives.
    return String(this.data);
  }

  return '[object ' + this.class + ']';
};

/**
 * Return the object's value.
 * @returns {Interpreter.Value} Value.
 * @override
 */
Interpreter.Object.prototype.valueOf = function() {
  if (!Interpreter.currentInterpreter_) {
    // Called from outside an interpreter.
    return this;
  }
  if (this.data === undefined || this.data === null ||
      this.data instanceof RegExp) {
    return this;  // An Object, RegExp, or primitive.
  }
  if (this.data instanceof Date) {
    return this.data.valueOf();  // Milliseconds.
  }
  return /** @type {(boolean|number|string)} */ (this.data);  // Boxed primitive.
};

/**
 * Class for a task.
 * @param {!Interpreter.Object|undefined} functionRef Function to call.
 * @param {!Array<Interpreter.Value>} argsArray Array of arguments.
 * @param {!Interpreter.Scope} scope Scope for this task.
 * @param {!Object} node AST node to execute.
 * @param {number} interval Number of ms this task repeats.  -1 for no repeats.
 * @struct
 * @constructor
 */
Interpreter.Task = function(functionRef, argsArray, scope, node, interval) {
  this.functionRef = functionRef;
  this.argsArray = argsArray;
  this.scope = scope;
  this.node = node;

  this.interval = interval;
  this.pid = ++Interpreter.Task.pid;
  this.time = 0;
};

Interpreter.Task.pid = 0;

///////////////////////////////////////////////////////////////////////////////
// Functions to handle each node type.
///////////////////////////////////////////////////////////////////////////////

Interpreter.prototype['stepArrayExpression'] = function(stack, state, node) {
  var elements = node.elements;
  var n = state.n_ || 0;
  if (!state.array_) {
    state.array_ = this.createArray();
    state.array_.properties.length = elements.length;
  } else {
    this.setProperty(state.array_, n, state.value);
    n++;
  }
  while (n < elements.length) {
    // Skip missing elements - they're not defined, not undefined.
    if (elements[n]) {
      state.n_ = n;
      return new Interpreter.State(elements[n], state.scope);
    }
    n++;
  }
  stack.pop();
  stack[stack.length - 1].value = state.array_;
};

Interpreter.prototype['stepAssignmentExpression'] =
    function(stack, state, node) {
  if (!state.doneLeft_) {
    state.doneLeft_ = true;
    var nextState = new Interpreter.State(node.left, state.scope);
    nextState.components = true;
    return nextState;
  }
  if (!state.doneRight_) {
    if (!state.leftReference_) {
      state.leftReference_ = state.value;
    }
    if (state.doneGetter_) {
      state.leftValue_ = state.value;
    }
    if (!state.doneGetter_ && node.operator !== '=') {
      var leftValue = this.getValue(state.leftReference_);
      state.leftValue_ = leftValue;
      if (this.getterStep_) {
        // Call the getter function.
        state.doneGetter_ = true;
        var func = /** @type {!Interpreter.Object} */ (leftValue);
        return this.createGetter_(func, state.leftReference_);
      }
    }
    state.doneRight_ = true;
    // When assigning an unnamed function to a variable, the function's name
    // is set to the variable name.  Record the variable name in case the
    // right side is a functionExpression.
    // E.g. foo = function() {};
    if (node.operator === '=' && node.left.type === 'Identifier') {
      state.destinationName = node.left.name;
    }
    return new Interpreter.State(node.right, state.scope);
  }
  if (state.doneSetter_) {
    // Return if setter function.
    // Setter method on property has completed.
    // Ignore its return value, and use the original set value instead.
    stack.pop();
    stack[stack.length - 1].value = state.setterValue_;
    return;
  }
  var value = state.leftValue_;
  var rightValue = state.value;
  switch (node.operator) {
    case '=':    value =    rightValue; break;
    case '+=':   value +=   rightValue; break;
    case '-=':   value -=   rightValue; break;
    case '*=':   value *=   rightValue; break;
    case '/=':   value /=   rightValue; break;
    case '%=':   value %=   rightValue; break;
    case '<<=':  value <<=  rightValue; break;
    case '>>=':  value >>=  rightValue; break;
    case '>>>=': value >>>= rightValue; break;
    case '&=':   value &=   rightValue; break;
    case '^=':   value ^=   rightValue; break;
    case '|=':   value |=   rightValue; break;
    default:
      throw SyntaxError('Unknown assignment expression: ' + node.operator);
  }
  var setter = this.setValue(state.leftReference_, value);
  if (setter) {
    state.doneSetter_ = true;
    state.setterValue_ = value;
    return this.createSetter_(setter, state.leftReference_, value);
  }
  // Return if no setter function.
  stack.pop();
  stack[stack.length - 1].value = value;
};

Interpreter.prototype['stepBinaryExpression'] = function(stack, state, node) {
  if (!state.doneLeft_) {
    state.doneLeft_ = true;
    return new Interpreter.State(node.left, state.scope);
  }
  if (!state.doneRight_) {
    state.doneRight_ = true;
    state.leftValue_ = state.value;
    return new Interpreter.State(node.right, state.scope);
  }
  stack.pop();
  var leftValue = state.leftValue_;
  var rightValue = state.value;
  var value;
  switch (node.operator) {
    case '==':  value = leftValue ==  rightValue; break;
    case '!=':  value = leftValue !=  rightValue; break;
    case '===': value = leftValue === rightValue; break;
    case '!==': value = leftValue !== rightValue; break;
    case '>':   value = leftValue >   rightValue; break;
    case '>=':  value = leftValue >=  rightValue; break;
    case '<':   value = leftValue <   rightValue; break;
    case '<=':  value = leftValue <=  rightValue; break;
    case '+':   value = leftValue +   rightValue; break;
    case '-':   value = leftValue -   rightValue; break;
    case '*':   value = leftValue *   rightValue; break;
    case '/':   value = leftValue /   rightValue; break;
    case '%':   value = leftValue %   rightValue; break;
    case '&':   value = leftValue &   rightValue; break;
    case '|':   value = leftValue |   rightValue; break;
    case '^':   value = leftValue ^   rightValue; break;
    case '<<':  value = leftValue <<  rightValue; break;
    case '>>':  value = leftValue >>  rightValue; break;
    case '>>>': value = leftValue >>> rightValue; break;
    case 'in':
      if (!(rightValue instanceof Interpreter.Object)) {
        this.throwException(this.TYPE_ERROR,
            "'in' expects an object, not '" + rightValue + "'");
      }
      value = this.hasProperty(rightValue, leftValue);
      break;
    case 'instanceof':
      if (!this.isa(rightValue, this.FUNCTION)) {
        this.throwException(this.TYPE_ERROR,
            "'instanceof' expects an object, not '" + rightValue + "'");
      }
      value = (leftValue instanceof Interpreter.Object) ?
          this.isa(leftValue, rightValue) : false;
      break;
    default:
      throw SyntaxError('Unknown binary operator: ' + node.operator);
  }
  stack[stack.length - 1].value = value;
};

Interpreter.prototype['stepBlockStatement'] = function(stack, state, node) {
  var n = state.n_ || 0;
  var expression = node.body[n];
  if (expression) {
    state.n_ = n + 1;
    return new Interpreter.State(expression, state.scope);
  }
  stack.pop();
};

Interpreter.prototype['stepBreakStatement'] = function(stack, state, node) {
  var label = node.label && node.label.name;
  this.unwind(Interpreter.Completion.BREAK, undefined, label);
};

/**
 * Number of evals called by the interpreter.
 * @private
 */
Interpreter.prototype.evalCodeNumber_ = 0;

Interpreter.prototype['stepCallExpression'] = function(stack, state, node) {
  // Handles both CallExpression and NewExpression.
  if (!state.doneCallee_) {
    state.doneCallee_ = 1;
    // Components needed to determine value of `this`.
    var nextState = new Interpreter.State(node.callee, state.scope);
    nextState.components = true;
    return nextState;
  }
  if (state.doneCallee_ === 1) {
    // Determine value of the function.
    state.doneCallee_ = 2;
    var func = state.value;
    if (Array.isArray(func)) {
      state.func_ = this.getValue(func);
      if (func[0] === Interpreter.SCOPE_REFERENCE) {
        // (Globally or locally) named function.  Is it named 'eval'?
        state.directEval_ = (func[1] === 'eval');
      } else {
        // Method function, `this` is object (ignored if invoked as `new`).
        state.funcThis_ = func[0];
      }
      func = state.func_;
      if (this.getterStep_) {
        // Call the getter function.
        state.doneCallee_ = 1;
        return this.createGetter_(/** @type {!Interpreter.Object} */ (func),
            state.value);
      }
    } else {
      // Already evaluated function: (function(){...})();
      state.func_ = func;
    }
    state.arguments_ = [];
    state.n_ = 0;
  }
  var func = state.func_;
  if (!state.doneArgs_) {
    if (state.n_ !== 0) {
      state.arguments_.push(state.value);
    }
    if (node.arguments[state.n_]) {
      return new Interpreter.State(node.arguments[state.n_++], state.scope);
    }
    // Determine value of `this` in function.
    if (node.type === 'NewExpression') {
      if (!(func instanceof Interpreter.Object) || func.illegalConstructor) {
        // Illegal: new escape();
        this.throwException(this.TYPE_ERROR,
            this.nodeSummary(node.callee) + ' is not a constructor');
      }
      // Constructor, `this` is new object.
      if (func === this.ARRAY) {
        state.funcThis_ = this.createArray();
      } else {
        var proto = func.properties['prototype'];
        if (typeof proto !== 'object' || proto === null) {
          // Non-object prototypes default to `Object.prototype`.
          proto = this.OBJECT_PROTO;
        }
        state.funcThis_ = this.createObjectProto(proto);
      }
      state.isConstructor = true;
    }
    state.doneArgs_ = true;
  }
  if (!state.doneExec_) {
    state.doneExec_ = true;
    if (!(func instanceof Interpreter.Object)) {
      this.throwException(this.TYPE_ERROR,
          this.nodeSummary(node.callee) + ' is not a function');
    }
    var funcNode = func.node;
    if (funcNode) {
      var scope = this.createScope(funcNode.body, func.parentScope);
      // Build arguments variable.
      var argsList = this.createArray();
      for (var i = 0; i < state.arguments_.length; i++) {
        this.setProperty(argsList, i, state.arguments_[i]);
      }
      this.setProperty(scope.object, 'arguments', argsList);
      // Add all arguments (may clobber 'arguments' if a param is named such).
      for (var i = 0; i < funcNode.params.length; i++) {
        var paramName = funcNode.params[i].name;
        var paramValue = state.arguments_.length > i ? state.arguments_[i] :
            undefined;
        this.setProperty(scope.object, paramName, paramValue);
      }
      if (!scope.strict) {
        state.funcThis_ = this.boxThis_(state.funcThis_);
      }
      this.setProperty(scope.object, 'this', state.funcThis_,
                       Interpreter.READONLY_DESCRIPTOR);
      state.value = undefined;  // Default value if no explicit return.
      return new Interpreter.State(funcNode.body, scope);
    } else if (func.eval) {
      var code = state.arguments_[0];
      if (typeof code !== 'string') {
        // JS does not parse String objects:
        // eval(new String('1 + 1')) -> '1 + 1'
        state.value = code;
      } else {
        try {
          var ast = this.parse_(String(code),
             'eval' + (this.evalCodeNumber_++));
        } catch (e) {
          // Acorn threw a SyntaxError.  Rethrow as a trappable error.
          this.throwException(this.SYNTAX_ERROR, 'Invalid code: ' + e.message);
        }
        var evalNode = this.newNode();
        evalNode.type = 'EvalProgram_';
        evalNode.body = ast.body;
        Interpreter.stripLocations_(evalNode, node.start, node.end);
        // Create new scope and update it with definitions in eval().
        var scope = state.directEval_ ? state.scope : this.globalScope;
        if (scope.strict) {
          // Strict mode get its own scope in eval.
          scope = this.createScope(ast, scope);
        } else {
          // Non-strict mode pollutes the current scope.
          this.populateScope_(ast, scope);
        }
        this.value = undefined;  // Default value if no code.
        return new Interpreter.State(evalNode, scope);
      }
    } else if (func.nativeFunc) {
      if (!state.scope.strict) {
        state.funcThis_ = this.boxThis_(state.funcThis_);
      }
      state.value = func.nativeFunc.apply(state.funcThis_, state.arguments_);
    } else if (func.asyncFunc) {
      var thisInterpreter = this;
      var callback = function(value) {
        state.value = value;
        thisInterpreter.paused_ = false;
      };
      // Force the argument lengths to match, then append the callback.
      var argLength = func.asyncFunc.length - 1;
      var argsWithCallback = state.arguments_.concat(
          new Array(argLength)).slice(0, argLength);
      argsWithCallback.push(callback);
      this.paused_ = true;
      if (!state.scope.strict) {
        state.funcThis_ = this.boxThis_(state.funcThis_);
      }
      func.asyncFunc.apply(state.funcThis_, argsWithCallback);
      return;
    } else {
      /* A child of a function is a function but is not callable.  For example:
      var F = function() {};
      F.prototype = escape;
      var f = new F();
      f();
      */
      this.throwException(this.TYPE_ERROR,
          this.nodeSummary(node.callee) + ' is not callable');
    }
  } else {
    // Execution complete.  Put the return value on the stack.
    stack.pop();
    if (state.isConstructor && typeof state.value !== 'object') {
      // Normal case for a constructor is to use the `this` value.
      stack[stack.length - 1].value = state.funcThis_;
    } else {
      // Non-constructors or constructions explicitly returning objects use
      // the return value.
      stack[stack.length - 1].value = state.value;
    }
  }
};

Interpreter.prototype['stepConditionalExpression'] =
    function(stack, state, node) {
  // Handles both ConditionalExpression and IfStatement.
  var mode = state.mode_ || 0;
  if (mode === 0) {
    state.mode_ = 1;
    return new Interpreter.State(node.test, state.scope);
  }
  if (mode === 1) {
    state.mode_ = 2;
    var value = Boolean(state.value);
    if (value && node.consequent) {
      // Execute `if` block.
      return new Interpreter.State(node.consequent, state.scope);
    } else if (!value && node.alternate) {
      // Execute `else` block.
      return new Interpreter.State(node.alternate, state.scope);
    }
    // eval('1;if(false){2}') -> undefined
    this.value = undefined;
  }
  stack.pop();
  if (node.type === 'ConditionalExpression') {
    stack[stack.length - 1].value = state.value;
  }
};

Interpreter.prototype['stepContinueStatement'] = function(stack, state, node) {
  var label = node.label && node.label.name;
  this.unwind(Interpreter.Completion.CONTINUE, undefined, label);
};

Interpreter.prototype['stepDebuggerStatement'] = function(stack, state, node) {
  // Do nothing.  May be overridden by developers.
  stack.pop();
};

Interpreter.prototype['stepDoWhileStatement'] = function(stack, state, node) {
  // Handles both DoWhileStatement and WhileStatement.
  if (node.type === 'DoWhileStatement' && state.test_ === undefined) {
    // First iteration of do/while executes without checking test.
    state.value = true;
    state.test_ = true;
  }
  if (!state.test_) {
    state.test_ = true;
    return new Interpreter.State(node.test, state.scope);
  }
  if (!state.value) {  // Done, exit loop.
    stack.pop();
  } else if (node.body) {  // Execute the body.
    state.test_ = false;
    state.isLoop = true;
    return new Interpreter.State(node.body, state.scope);
  }
};

Interpreter.prototype['stepEmptyStatement'] = function(stack, state, node) {
  stack.pop();
};

Interpreter.prototype['stepEvalProgram_'] = function(stack, state, node) {
  var n = state.n_ || 0;
  var expression = node.body[n];
  if (expression) {
    state.n_ = n + 1;
    return new Interpreter.State(expression, state.scope);
  }
  stack.pop();
  stack[stack.length - 1].value = this.value;
};

Interpreter.prototype['stepExpressionStatement'] = function(stack, state, node) {
  if (!state.done_) {
    this.value = undefined;
    state.done_ = true;
    return new Interpreter.State(node.expression, state.scope);
  }
  stack.pop();
  // Save this value to interpreter.value for use as a return value if
  // this code is inside an eval function.
  this.value = state.value;
};

Interpreter.prototype['stepForInStatement'] = function(stack, state, node) {
  // First, initialize a variable if exists.  Only do so once, ever.
  if (!state.doneInit_) {
    state.doneInit_ = true;
    if (node.left.declarations &&
        node.left.declarations[0].init) {
      if (state.scope.strict) {
        this.throwException(this.SYNTAX_ERROR,
            'for-in loop variable declaration may not have an initializer');
      }
      // Variable initialization: for (var x = 4 in y)
      return new Interpreter.State(node.left, state.scope);
    }
  }
  // Second, look up the object.  Only do so once, ever.
  if (!state.doneObject_) {
    state.doneObject_ = true;
    if (!state.variable_) {
      state.variable_ = state.value;
    }
    return new Interpreter.State(node.right, state.scope);
  }
  if (!state.isLoop) {
    // First iteration.
    state.isLoop = true;
    state.object_ = state.value;
    state.visited_ = Object.create(null);
  }
  // Third, find the property name for this iteration.
  if (state.name_ === undefined) {
    gotPropName: while (true) {
      if (state.object_ instanceof Interpreter.Object) {
        if (!state.props_) {
          state.props_ = Object.getOwnPropertyNames(state.object_.properties);
        }
        while (true) {
          var prop = state.props_.shift();
          if (prop === undefined) {
            break;  // Reached end of this object's properties.
          }
          if (!Object.prototype.hasOwnProperty.call(state.object_.properties,
                prop)) {
            continue;  // Property has been deleted in the loop.
          }
          if (state.visited_[prop]) {
            continue;  // Already seen this property on a child.
          }
          state.visited_[prop] = true;
          if (!Object.prototype.propertyIsEnumerable.call(
                state.object_.properties, prop)) {
            continue;  // Skip non-enumerable property.
          }
          state.name_ = prop;
          break gotPropName;
        }
      } else if (state.object_ !== null && state.object_ !== undefined) {
        // Primitive value (other than null or undefined).
        if (!state.props_) {
          state.props_ = Object.getOwnPropertyNames(state.object_);
        }
        while (true) {
          var prop = state.props_.shift();
          if (prop === undefined) {
            break;  // Reached end of this value's properties.
          }
          state.visited_[prop] = true;
          if (!Object.prototype.propertyIsEnumerable.call(
                state.object_, prop)) {
            continue;  // Skip non-enumerable property.
          }
          state.name_ = prop;
          break gotPropName;
        }
      }
      state.object_ = this.getPrototype(state.object_);
      state.props_ = null;
      if (state.object_ === null) {
        // Done, exit loop.
        stack.pop();
        return;
      }
    }
  }
  // Fourth, find the variable
  if (!state.doneVariable_) {
    state.doneVariable_ = true;
    var left = node.left;
    if (left.type === 'VariableDeclaration') {
      // Inline variable declaration: for (var x in y)
      state.variable_ =
          [Interpreter.SCOPE_REFERENCE, left.declarations[0].id.name];
    } else {
      // Arbitrary left side: for (foo().bar in y)
      state.variable_ = null;
      var nextState = new Interpreter.State(left, state.scope);
      nextState.components = true;
      return nextState;
    }
  }
  if (!state.variable_) {
    state.variable_ = state.value;
  }
  // Fifth, set the variable.
  if (!state.doneSetter_) {
    state.doneSetter_ = true;
    var value = state.name_;
    var setter = this.setValue(state.variable_, value);
    if (setter) {
      return this.createSetter_(setter, state.variable_, value);
    }
  }
  // Next step will be step three.
  state.name_ = undefined;
  // Reevaluate the variable since it could be a setter on the global object.
  state.doneVariable_ = false;
  state.doneSetter_ = false;
  // Sixth and finally, execute the body if there was one.
  if (node.body) {
    return new Interpreter.State(node.body, state.scope);
  }
};

Interpreter.prototype['stepForStatement'] = function(stack, state, node) {
  switch (state.mode_) {
    default:
      state.mode_ = 1;
      if (node.init) {
        return new Interpreter.State(node.init, state.scope);
      }
      break;
    case 1:
      state.mode_ = 2;
      if (node.test) {
        return new Interpreter.State(node.test, state.scope);
      }
      break;
    case 2:
      state.mode_ = 3;
      if (node.test && !state.value) {
        // Done, exit loop.
        stack.pop();
      } else {  // Execute the body.
        state.isLoop = true;
        return new Interpreter.State(node.body, state.scope);
      }
      break;
    case 3:
      state.mode_ = 1;
      if (node.update) {
        return new Interpreter.State(node.update, state.scope);
      }
      break;
  }
};

Interpreter.prototype['stepFunctionDeclaration'] =
    function(stack, state, node) {
  // This was found and handled when the scope was populated.
  stack.pop();
};

Interpreter.prototype['stepFunctionExpression'] = function(stack, state, node) {
  stack.pop();
  state = stack[stack.length - 1];
  var parentScope = state.scope;
  if (node.id) {
    // Create a tiny scope to store the function name.
    // E.g. var x = function foo(){};
    parentScope = this.createSpecialScope(parentScope);
  }
  state.value = this.createFunction(node, parentScope, state.destinationName);
  if (node.id) {
    // Record the function name, read-only.
    this.setProperty(parentScope.object, node.id.name, state.value,
        Interpreter.READONLY_DESCRIPTOR);
  }
};

Interpreter.prototype['stepIdentifier'] = function(stack, state, node) {
  stack.pop();
  if (state.components) {
    stack[stack.length - 1].value = [Interpreter.SCOPE_REFERENCE, node.name];
    return;
  }
  var value = this.getValueFromScope(node.name);
  // An identifier could be a getter if it's a property on the global object.
  if (this.getterStep_) {
    // Call the getter function.
    var func = /** @type {!Interpreter.Object} */ (value);
    return this.createGetter_(func, this.globalObject);
  }
  stack[stack.length - 1].value = value;
};

Interpreter.prototype['stepIfStatement'] =
    Interpreter.prototype['stepConditionalExpression'];

Interpreter.prototype['stepLabeledStatement'] = function(stack, state, node) {
  // No need to hit this node again on the way back up the stack.
  stack.pop();
  // Note that a statement might have multiple labels.
  var labels = state.labels || [];
  labels.push(node.label.name);
  var nextState = new Interpreter.State(node.body, state.scope);
  nextState.labels = labels;
  return nextState;
};

Interpreter.prototype['stepLiteral'] = function(stack, state, node) {
  stack.pop();
  var value = node.value;
  if (value instanceof RegExp) {
    var pseudoRegexp = this.createObjectProto(this.REGEXP_PROTO);
    this.populateRegExp(pseudoRegexp, value);
    value = pseudoRegexp;
  }
  stack[stack.length - 1].value = value;
};

Interpreter.prototype['stepLogicalExpression'] = function(stack, state, node) {
  if (node.operator !== '&&' && node.operator !== '||') {
    throw SyntaxError('Unknown logical operator: ' + node.operator);
  }
  if (!state.doneLeft_) {
    state.doneLeft_ = true;
    return new Interpreter.State(node.left, state.scope);
  }
  if (!state.doneRight_) {
    if ((node.operator === '&&' && !state.value) ||
        (node.operator === '||' && state.value)) {
      // Shortcut evaluation.
      stack.pop();
      stack[stack.length - 1].value = state.value;
    } else {
      state.doneRight_ = true;
      return new Interpreter.State(node.right, state.scope);
    }
  } else {
    stack.pop();
    stack[stack.length - 1].value = state.value;
  }
};

Interpreter.prototype['stepMemberExpression'] = function(stack, state, node) {
  if (!state.doneObject_) {
    state.doneObject_ = true;
    return new Interpreter.State(node.object, state.scope);
  }
  var propName;
  if (!node.computed) {
    state.object_ = state.value;
    // obj.foo -- Just access `foo` directly.
    propName = node.property.name;
  } else if (!state.doneProperty_) {
    state.object_ = state.value;
    // obj[foo] -- Compute value of `foo`.
    state.doneProperty_ = true;
    return new Interpreter.State(node.property, state.scope);
  } else {
    propName = state.value;
  }
  stack.pop();
  if (state.components) {
    stack[stack.length - 1].value = [state.object_, propName];
  } else {
    var value = this.getProperty(state.object_, propName);
    if (this.getterStep_) {
      // Call the getter function.
      var func = /** @type {!Interpreter.Object} */ (value);
      return this.createGetter_(func, state.object_);
    }
    stack[stack.length - 1].value = value;
  }
};

Interpreter.prototype['stepNewExpression'] =
    Interpreter.prototype['stepCallExpression'];

Interpreter.prototype['stepObjectExpression'] = function(stack, state, node) {
  var n = state.n_ || 0;
  var property = node.properties[n];
  if (!state.object_) {
    // First execution.
    state.object_ = this.createObjectProto(this.OBJECT_PROTO);
    state.properties_ = Object.create(null);
  } else {
    // Set the property computed in the previous execution.
    var propName = state.destinationName;
    if (!state.properties_[propName]) {
      // Create temp object to collect value, getter, and/or setter.
      state.properties_[propName] = {};
    }
    state.properties_[propName][property.kind] = state.value;
    state.n_ = ++n;
    property = node.properties[n];
  }
  if (property) {
    // Determine property name.
    var key = property.key;
    if (key.type === 'Identifier') {
      var propName = key.name;
    } else if (key.type === 'Literal') {
      var propName = key.value;
    } else {
      throw SyntaxError('Unknown object structure: ' + key.type);
    }
    // When assigning an unnamed function to a property, the function's name
    // is set to the property name.  Record the property name in case the
    // value is a functionExpression.
    // E.g. {foo: function() {}}
    state.destinationName = propName;
    return new Interpreter.State(property.value, state.scope);
  }
  for (var key in state.properties_) {
    var kinds = state.properties_[key];
    if ('get' in kinds || 'set' in kinds) {
      // Set a property with a getter or setter.
      var descriptor = {
        'configurable': true,
        'enumerable': true,
        'get': kinds['get'],
        'set': kinds['set'],
      };
      this.setProperty(state.object_, key, Interpreter.VALUE_IN_DESCRIPTOR,
                       descriptor);
    } else {
      // Set a normal property with a value.
      this.setProperty(state.object_, key, kinds['init']);
    }
  }
  stack.pop();
  stack[stack.length - 1].value = state.object_;
};

Interpreter.prototype['stepProgram'] = function(stack, state, node) {
  var expression = node.body.shift();
  if (expression) {
    state.done = false;
    return new Interpreter.State(expression, state.scope);
  }
  state.done = true;
  // Don't pop the stateStack.
  // Leave the root scope on the tree in case the program is appended to.
};

Interpreter.prototype['stepReturnStatement'] = function(stack, state, node) {
  if (node.argument && !state.done_) {
    state.done_ = true;
    return new Interpreter.State(node.argument, state.scope);
  }
  this.unwind(Interpreter.Completion.RETURN, state.value, undefined);
};

Interpreter.prototype['stepSequenceExpression'] = function(stack, state, node) {
  var n = state.n_ || 0;
  var expression = node.expressions[n];
  if (expression) {
    state.n_ = n + 1;
    return new Interpreter.State(expression, state.scope);
  }
  stack.pop();
  stack[stack.length - 1].value = state.value;
};

Interpreter.prototype['stepSwitchStatement'] = function(stack, state, node) {
  if (!state.test_) {
    state.test_ = 1;
    return new Interpreter.State(node.discriminant, state.scope);
  }
  if (state.test_ === 1) {
    state.test_ = 2;
    // Preserve switch value between case tests.
    state.switchValue_ = state.value;
    state.defaultCase_ = -1;
  }

  while (true) {
    var index = state.index_ || 0;
    var switchCase = node.cases[index];
    if (!state.matched_ && switchCase && !switchCase.test) {
      // Test on the default case is null.
      // Bypass (but store) the default case, and get back to it later.
      state.defaultCase_ = index;
      state.index_ = index + 1;
      continue;
    }
    if (!switchCase && !state.matched_ && state.defaultCase_ !== -1) {
      // Ran through all cases, no match.  Jump to the default.
      state.matched_ = true;
      state.index_ = state.defaultCase_;
      continue;
    }
    if (switchCase) {
      if (!state.matched_ && !state.tested_ && switchCase.test) {
        state.tested_ = true;
        return new Interpreter.State(switchCase.test, state.scope);
      }
      if (state.matched_ || state.value === state.switchValue_) {
        state.matched_ = true;
        var n = state.n_ || 0;
        if (switchCase.consequent[n]) {
          state.isSwitch = true;
          state.n_ = n + 1;
          return new Interpreter.State(switchCase.consequent[n], state.scope);
        }
      }
      // Move on to next case.
      state.tested_ = false;
      state.n_ = 0;
      state.index_ = index + 1;
    } else {
      stack.pop();
      return;
    }
  }
};

Interpreter.prototype['stepThisExpression'] = function(stack, state, node) {
  stack.pop();
  stack[stack.length - 1].value = this.getValueFromScope('this');
};

Interpreter.prototype['stepThrowStatement'] = function(stack, state, node) {
  if (!state.done_) {
    state.done_ = true;
    return new Interpreter.State(node.argument, state.scope);
  } else {
    this.throwException(state.value);
  }
};

Interpreter.prototype['stepTryStatement'] = function(stack, state, node) {
  // This step also handles all CatchClause nodes, since these nodes can
  // only appear inside the `handler` property of a TryStatement node.
  if (!state.doneBlock_) {
    state.doneBlock_ = true;
    return new Interpreter.State(node.block, state.scope);
  }
  if (state.cv && state.cv.type === Interpreter.Completion.THROW &&
      !state.doneHandler_ && node.handler) {
    state.doneHandler_ = true;
    // Create an new scope and add the error variable.
    var scope = this.createSpecialScope(state.scope);
    this.setProperty(scope.object, node.handler.param.name, state.cv.value);
    state.cv = undefined;  // This error has been handled, don't rethrow.
    // Execute catch clause.
    return new Interpreter.State(node.handler.body, scope);
  }
  if (!state.doneFinalizer_ && node.finalizer) {
    state.doneFinalizer_ = true;
    return new Interpreter.State(node.finalizer, state.scope);
  }
  stack.pop();
  if (state.cv) {
    // There was no catch handler, or the catch/finally threw an error.
    // Throw the error up to a higher try.
    this.unwind(state.cv.type, state.cv.value, state.cv.label);
  }
};

Interpreter.prototype['stepUnaryExpression'] = function(stack, state, node) {
  if (!state.done_) {
    state.done_ = true;
    var nextState = new Interpreter.State(node.argument, state.scope);
    nextState.components = node.operator === 'delete';
    return nextState;
  }
  stack.pop();
  var value = state.value;
  switch (node.operator) {
    case '-':
      value = -value;
      break;
    case '+':
      value = +value;
      break;
    case '!':
      value = !value;
      break;
    case '~':
      value = ~value;
      break;
    case 'delete':
      var result = true;
      // If value is not an array, then it is a primitive, or some other value.
      // If so, skip the delete and return true.
      if (Array.isArray(value)) {
        var obj = value[0];
        if (obj === Interpreter.SCOPE_REFERENCE) {
          // `delete foo;` is the same as `delete window.foo;`.
          obj = state.scope;
        }
        var name = String(value[1]);
        try {
          delete obj.properties[name];
        } catch (_e) {
          if (state.scope.strict) {
            this.throwException(this.TYPE_ERROR, "Cannot delete property '" +
                                name + "' of '" + obj + "'");
          } else {
            result = false;
          }
        }
      }
      value = result;
      break;
    case 'typeof':
      value = (value && value.class === 'Function') ? 'function' : typeof value;
      break;
    case 'void':
      value = undefined;
      break;
    default:
      throw SyntaxError('Unknown unary operator: ' + node.operator);
  }
  stack[stack.length - 1].value = value;
};

Interpreter.prototype['stepUpdateExpression'] = function(stack, state, node) {
  if (!state.doneLeft_) {
    state.doneLeft_ = true;
    var nextState = new Interpreter.State(node.argument, state.scope);
    nextState.components = true;
    return nextState;
  }
  if (!state.leftSide_) {
    state.leftSide_ = state.value;
  }
  if (state.doneGetter_) {
    state.leftValue_ = state.value;
  }
  if (!state.doneGetter_) {
    var leftValue = this.getValue(state.leftSide_);
    state.leftValue_ = leftValue;
    if (this.getterStep_) {
      // Call the getter function.
      state.doneGetter_ = true;
      var func = /** @type {!Interpreter.Object} */ (leftValue);
      return this.createGetter_(func, state.leftSide_);
    }
  }
  if (state.doneSetter_) {
    // Return if setter function.
    // Setter method on property has completed.
    // Ignore its return value, and use the original set value instead.
    stack.pop();
    stack[stack.length - 1].value = state.setterValue_;
    return;
  }
  var leftValue = Number(state.leftValue_);
  var changeValue;
  if (node.operator === '++') {
    changeValue = leftValue + 1;
  } else if (node.operator === '--') {
    changeValue = leftValue - 1;
  } else {
    throw SyntaxError('Unknown update expression: ' + node.operator);
  }
  var returnValue = node.prefix ? changeValue : leftValue;
  var setter = this.setValue(state.leftSide_, changeValue);
  if (setter) {
    state.doneSetter_ = true;
    state.setterValue_ = returnValue;
    return this.createSetter_(setter, state.leftSide_, changeValue);
  }
  // Return if no setter function.
  stack.pop();
  stack[stack.length - 1].value = returnValue;
};

Interpreter.prototype['stepVariableDeclaration'] = function(stack, state, node) {
  // This step also handles all VariableDeclarator nodes, since these nodes can
  // only appear inside the `declarations` array of a VariableDeclaration node.
  var declarations = node.declarations;
  var n = state.n_ || 0;
  var declarationNode = declarations[n];
  if (state.init_ && declarationNode) {
    // This setValue call never needs to deal with calling a setter function.
    // Note that this is setting the init value, not defining the variable.
    // Variable definition is done when scope is populated.
    this.setValueToScope(declarationNode.id.name, state.value);
    state.init_ = false;
    declarationNode = declarations[++n];
  }
  while (declarationNode) {
    // Skip any declarations that are not initialized.  They have already
    // been defined as undefined in populateScope_.
    if (declarationNode.init) {
      state.n_ = n;
      state.init_ = true;
      // When assigning an unnamed function to a variable, the function's name
      // is set to the variable name.  Record the variable name in case the
      // right side is a functionExpression.
      // E.g. var foo = function() {};
      state.destinationName = declarationNode.id.name;
      return new Interpreter.State(declarationNode.init, state.scope);
    }
    declarationNode = declarations[++n];
  }
  stack.pop();
};

Interpreter.prototype['stepWithStatement'] = function(stack, state, node) {
  if (!state.doneObject_) {
    state.doneObject_ = true;
    return new Interpreter.State(node.object, state.scope);
  }
  stack.pop();
  var scope = this.createSpecialScope(state.scope, state.value);
  return new Interpreter.State(node.body, scope);
};

Interpreter.prototype['stepWhileStatement'] =
    Interpreter.prototype['stepDoWhileStatement'];

// Preserve top-level API functions from being pruned/renamed by JS compilers.
// Add others as needed.
Interpreter.nativeGlobal['Interpreter'] = Interpreter;
Interpreter.prototype['step'] = Interpreter.prototype.step;
Interpreter.prototype['run'] = Interpreter.prototype.run;
Interpreter.prototype['getStatus'] = Interpreter.prototype.getStatus;
Interpreter.prototype['appendCode'] = Interpreter.prototype.appendCode;
Interpreter.prototype['createObject'] = Interpreter.prototype.createObject;
Interpreter.prototype['createObjectProto'] =
    Interpreter.prototype.createObjectProto;
Interpreter.prototype['createNativeFunction'] =
    Interpreter.prototype.createNativeFunction;
Interpreter.prototype['createAsyncFunction'] =
    Interpreter.prototype.createAsyncFunction;
Interpreter.prototype['getProperty'] = Interpreter.prototype.getProperty;
Interpreter.prototype['setProperty'] = Interpreter.prototype.setProperty;
Interpreter.prototype['nativeToPseudo'] = Interpreter.prototype.nativeToPseudo;
Interpreter.prototype['pseudoToNative'] = Interpreter.prototype.pseudoToNative;
Interpreter.prototype['getGlobalScope'] = Interpreter.prototype.getGlobalScope;
Interpreter.prototype['setGlobalScope'] = Interpreter.prototype.setGlobalScope;
Interpreter.prototype['getStateStack'] = Interpreter.prototype.getStateStack;
Interpreter.prototype['setStateStack'] = Interpreter.prototype.setStateStack;
Interpreter['Status'] = Interpreter.Status;
Interpreter['VALUE_IN_DESCRIPTOR'] = Interpreter.VALUE_IN_DESCRIPTOR;

/*** EXPORTS FROM exports-loader ***/
module.exports = {
  Interpreter
};


/***/ }),

/***/ "./original-repo/acorn.js":
/*!********************************!*\
  !*** ./original-repo/acorn.js ***!
  \********************************/
/***/ (function(module, exports) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
 * @license
 * Copyright 2012 Marijn Haverbeke
 * SPDX-License-Identifier: MIT
 */

// Acorn is a tiny, fast JavaScript parser written in JavaScript.
//
// Acorn was written by Marijn Haverbeke and released under an MIT
// license. The Unicode regexps (for identifiers and whitespace) were
// taken from [Esprima](http://esprima.org) by Ariya Hidayat.
//
// Git repositories for Acorn are available at
//
//     http://marijnhaverbeke.nl/git/acorn
//     https://github.com/marijnh/acorn.git
//
// Please use the [github bug tracker][ghbt] to report issues.
//
// [ghbt]: https://github.com/marijnh/acorn/issues
//
// This file defines the main parser interface. The library also comes
// with a [error-tolerant parser][dammit] and an
// [abstract syntax tree walker][walk], defined in other files.
//
// [dammit]: acorn_loose.js
// [walk]: util/walk.js

(function(root, mod) {
  if (true) return mod(exports); // CommonJS
  if (true) return !(__WEBPACK_AMD_DEFINE_ARRAY__ = [exports], __WEBPACK_AMD_DEFINE_FACTORY__ = (mod),
		__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
		(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
  mod(root.acorn || (root.acorn = {})); // Plain browser env
})((typeof globalThis === 'undefined') ? this || window : globalThis, function(exports) {
  "use strict";

  exports.version = "0.5.0";
  // Plus additional edits marked with 'JS-Interpreter change' comments.

  // JS-Interpreter change:
  // For global object, use 'globalThis' if it exists,
  // fall back to 'this' or 'window'.  Same logic as in JS-Interpreter.
  // -- Neil Fraser, March 2024.

  // JS-Interpreter change:
  // Added JSDoc type definitions.
  // -- Neil Fraser, July 2023.

  // JS-Interpreter change:
  // No longer exporting defaultOptions, getLineInfo, tokenize, tokTypes,
  // isIdentifierStart, and isIdentifierChar.  Not used by JS-Interpreter.
  // -- Neil Fraser, February 2023.

  // The main exported interface (under `self.acorn` when in the
  // browser) is a `parse` function that takes a code string and
  // returns an abstract syntax tree as specified by [Mozilla parser
  // API][api], with the caveat that the SpiderMonkey-specific syntax
  // (`let`, `yield`, inline XML, etc) is not recognized.
  //
  // [api]: https://developer.mozilla.org/en-US/docs/SpiderMonkey/Parser_API

  /** @type {!Object|undefined} */
  var options;

  /** @type {string} */
  var input = '';
  /** @type {number|undefined} */
  var inputLen;
  /** @type {*} */
  var sourceFile;

  /**
   * @param {string} inpt
   * @param {Object=} opts
   * @returns
   */
  exports.parse = function(inpt, opts) {
    input = String(inpt);
    inputLen = input.length;
    setOptions(opts);
    initTokenState();
    return parseTopLevel(options.program);
  };

  // A second optional argument can be given to further configure
  // the parser process. These options are recognized:

  var defaultOptions = {
    // JS-Interpreter change:
    // `ecmaVersion` option has been removed along with all cases where
    // it is checked.  In this version of Acorn it was limited to 3 or 5,
    // and there's no use case for 3 with JS-Interpreter.
    // -- Neil Fraser, December 2022.

    // Turn on `strictSemicolons` to prevent the parser from doing
    // automatic semicolon insertion.
    strictSemicolons: false,
    // When `allowTrailingCommas` is false, the parser will not allow
    // trailing commas in array and object literals.
    allowTrailingCommas: true,
    // By default, reserved words are not enforced. Enable
    // `forbidReserved` to enforce them. When this option has the
    // value "everywhere", reserved words and keywords can also not be
    // used as property names.
    forbidReserved: false,
    // When enabled, a return at the top level is not considered an
    // error.
    allowReturnOutsideFunction: false,
    // When `locations` is on, `loc` properties holding objects with
    // `start` and `end` properties in `{line, column}` form (with
    // line being 1-based and column 0-based) will be attached to the
    // nodes.
    locations: false,
    // A function can be passed as `onComment` option, which will
    // cause Acorn to call that function with `(block, text, start,
    // end)` parameters whenever a comment is skipped. `block` is a
    // boolean indicating whether this is a block (`/* */`) comment,
    // `text` is the content of the comment, and `start` and `end` are
    // character offsets that denote the start and end of the comment.
    // When the `locations` option is on, two more parameters are
    // passed, the full `{line, column}` locations of the start and
    // end of the comments. Note that you are not allowed to call the
    // parser from the callback—that will corrupt its internal state.
    onComment: null,
    // Nodes have their start and end characters offsets recorded in
    // `start` and `end` properties (directly on the node, rather than
    // the `loc` object, which holds line/column data. To also add a
    // [semi-standardized][range] `range` property holding a `[start,
    // end]` array with the same numbers, set the `ranges` option to
    // `true`.
    //
    // [range]: https://bugzilla.mozilla.org/show_bug.cgi?id=745678
    ranges: false,
    // It is possible to parse multiple files into a single AST by
    // passing the tree produced by parsing the first file as
    // `program` option in subsequent parses. This will add the
    // toplevel forms of the parsed file to the `Program` (top) node
    // of an existing parse tree.
    program: null,
    // When `locations` is on, you can pass this to record the source
    // file in every node's `loc` object.
    sourceFile: null,
    // This value, if given, is stored in every node, whether
    // `locations` is on or off.
    directSourceFile: null,
  };

  /**
   * @param {Object|undefined} opts
   */
  function setOptions(opts) {
    options = opts || {};
    for (var opt in defaultOptions) {
      if (!Object.prototype.hasOwnProperty.call(options, opt)) {
        options[opt] = defaultOptions[opt];
      }
    }
    sourceFile = options.sourceFile;
  }

  /**
   * The `getLineInfo` function is mostly useful when the
   * `locations` option is off (for performance reasons) and you
   * want to find the line/column position for a given character
   * offset. `input` should be the code string that the offset refers
   * into.
   *
   * @param {string} input
   * @param {number} offset
   * @returns {!Object}
   */
  var getLineInfo = function(input, offset) {
    for (var line = 1, cur = 0;;) {
      lineBreak.lastIndex = cur;
      var match = lineBreak.exec(input);
      if (match && match.index < offset) {
        ++line;
        cur = match.index + match[0].length;
      } else {
        break;
      }
    }
    return {line: line, column: offset - cur};
  };

  // JS-Interpreter change:
  // tokenize function never used.  Removed.
  // -- Neil Fraser, February 2023.

  // State is kept in (closure-)global variables. We already saw the
  // `options`, `input`, and `inputLen` variables above.

  /**
   * The current position of the tokenizer in the input.
   * @type {number}
   */
  var tokPos = 0;

  /**
   * The start offset of the current token.
   * @type {number}
   */
  var tokStart = 0;

  /**
   * The end offset of the current token.
   * @type {number}
   */
  var tokEnd = 0;

  /**
   * When `options.locations` is true, holds object
   * containing the token's start line/column pairs.
   * @type {!line_loc_t|undefined}
   */
  var tokStartLoc;

  /**
   * When `options.locations` is true, holds object
   * containing the token's end line/column pairs.
   * @type {!line_loc_t|undefined}
   */
  var tokEndLoc;

  /**
   * The type of the current token. Token types are objects,
   * named by variables against which they can be compared, and
   * holding properties that describe them (indicating, for example,
   * the precedence of an infix operator, and the original name of a
   * keyword token).
   * @type {!Object|undefined}
   */
  var tokType;

  /**
   * The value of the current token. The kind of value that's held in
   * `tokVal` depends on the type of the token. For literals, it is the
   * literal value, for operators, the operator name, and so on.
   * @type {*}
   */
  var tokVal;

  /**
   * Interal state for the tokenizer. To distinguish between division
   * operators and regular expressions, it remembers whether the last
   * token was one that is allowed to be followed by an expression.
   * (If it is, a slash is probably a regexp, if it isn't it's a
   * division operator. See the `parseStatement` function for a caveat.)
   * @type {boolean|undefined}
   */
  var tokRegexpAllowed;

  /**
   * When `options.locations` is true, `tokCurLine` is used to keep
   * track of the current line.
   * @type {number|undefined}
   */
  var tokCurLine;

  /**
   * When `options.locations` is true, `tokLineStart` is used to know
   * when a new line has been entered.
   * @type {number|undefined}
   */
  var tokLineStart;

  /**
   * The start of the position of the previous token, which is useful
   * when finishing a node and assigning its `end` position.
   * @type {number}
   */
  var lastStart = 0;

  /**
   * The end oy the position of the previous token, which is useful
   * when finishing a node and assigning its `end` position.
   * @type {number}
   */
  var lastEnd = 0;

  /**
   * Stores the position of the previous token, which is useful
   * when finishing a node and assigning its `end` position.
   * @type {!line_loc_t|undefined}
   */
  var lastEndLoc;

  /**
   * `inFunction` is used to reject `return` statements outside of functions.
   * @type {boolean|undefined}
   */
  var inFunction;

  /**
   * `labels` is used to verify that `break` and `continue` have somewhere
   * to jump to.
   * @type {!Array<!Object>|undefined}
   */
  var labels;

  /**
   * `strict` indicates whether strict mode is on.
   * @type {boolean|undefined}
   */
  var strict;

  /**
   * This function is used to raise exceptions on parse errors. It
   * takes an offset integer (into the current `input`) to indicate
   * the location of the error, attaches the position to the end
   * of the error message, and then raises a `SyntaxError` with that
   * message.
   *
   * @param {number} pos
   * @param {string} message
   * @throws {SyntaxError}
   */
  function raise(pos, message) {
    var loc = getLineInfo(input, pos);
    message += " (" + loc.line + ":" + loc.column + ")";
    var err = new SyntaxError(message);
    err.pos = pos;
    err.loc = loc;
    err.raisedAt = tokPos;
    throw err;
  }

  // Reused empty array added for node fields that are always empty.

  var empty = [];

  // ## Token types

  // The assignment of fine-grained, information-carrying type objects
  // allows the tokenizer to store the information it has about a
  // token in a way that is very cheap for the parser to look up.

  // All token type variables start with an underscore, to make them
  // easy to recognize.

  // These are the general types. The `type` property is only used to
  // make them recognizeable when debugging.

  var _num = {type: "num"};
  var _regexp = {type: "regexp"};
  var _string = {type: "string"};
  var _name = {type: "name"};
  var _eof = {type: "eof"};

  // Keyword tokens. The `keyword` property (also used in keyword-like
  // operators) indicates that the token originated from an
  // identifier-like word, which is used when parsing property names.
  //
  // The `beforeExpr` property is used to disambiguate between regular
  // expressions and divisions. It is set on all token types that can
  // be followed by an expression (thus, a slash after them would be a
  // regular expression).
  //
  // `isLoop` marks a keyword as starting a loop, which is important
  // to know when parsing a label, in order to allow or disallow
  // continue jumps to that label.

  var _break = {keyword: "break"};
  var _case = {keyword: "case", beforeExpr: true};
  var _catch = {keyword: "catch"};
  var _continue = {keyword: "continue"};
  var _debugger = {keyword: "debugger"};
  var _default = {keyword: "default"};
  var _do = {keyword: "do", isLoop: true};
  var _else = {keyword: "else", beforeExpr: true};
  var _finally = {keyword: "finally"};
  var _for = {keyword: "for", isLoop: true};
  var _function = {keyword: "function"};
  var _if = {keyword: "if"};
  var _return = {keyword: "return", beforeExpr: true};
  var _switch = {keyword: "switch"};
  var _throw = {keyword: "throw", beforeExpr: true};
  var _try = {keyword: "try"};
  var _var = {keyword: "var"};
  var _while = {keyword: "while", isLoop: true};
  var _with = {keyword: "with"};
  var _new = {keyword: "new", beforeExpr: true};
  var _this = {keyword: "this"};

  // The keywords that denote values.

  var _null = {keyword: "null", atomValue: null};
  var _true = {keyword: "true", atomValue: true};
  var _false = {keyword: "false", atomValue: false};

  // Some keywords are treated as regular operators. `in` sometimes
  // (when parsing `for`) needs to be tested against specifically, so
  // we assign a variable name to it for quick comparing.

  var _in = {keyword: "in", binop: 7, beforeExpr: true};

  // Map keyword names to token types.

  var keywordTypes = {
    "break": _break,
    "case": _case,
    "catch": _catch,
    "continue": _continue,
    "debugger": _debugger,
    "default": _default,
    "do": _do,
    "else": _else,
    "finally": _finally,
    "for": _for,
    "function": _function,
    "if": _if,
    "return": _return,
    "switch": _switch,
    "throw": _throw,
    "try": _try,
    "var": _var,
    "while": _while,
    "with": _with,
    "null": _null,
    "true": _true,
    "false": _false,
    "new": _new,
    "in": _in,
    "instanceof": {keyword: "instanceof", binop: 7, beforeExpr: true},
    "this": _this,
    "typeof": {keyword: "typeof", prefix: true, beforeExpr: true},
    "void": {keyword: "void", prefix: true, beforeExpr: true},
    "delete": {keyword: "delete", prefix: true, beforeExpr: true},
  };

  // Punctuation token types. Again, the `type` property is purely for debugging.

  var _bracketL = {type: "[", beforeExpr: true};
  var _bracketR = {type: "]"};
  var _braceL = {type: "{", beforeExpr: true};
  var _braceR = {type: "}"};
  var _parenL = {type: "(", beforeExpr: true};
  var _parenR = {type: ")"};
  var _comma = {type: ",", beforeExpr: true};
  var _semi = {type: ";", beforeExpr: true};
  var _colon = {type: ":", beforeExpr: true};
  var _dot = {type: "."};
  var _question = {type: "?", beforeExpr: true};

  // Operators. These carry several kinds of properties to help the
  // parser use them properly (the presence of these properties is
  // what categorizes them as operators).
  //
  // `binop`, when present, specifies that this operator is a binary
  // operator, and will refer to its precedence.
  //
  // `prefix` and `postfix` mark the operator as a prefix or postfix
  // unary operator. `isUpdate` specifies that the node produced by
  // the operator should be of type UpdateExpression rather than
  // simply UnaryExpression (`++` and `--`).
  //
  // `isAssign` marks all of `=`, `+=`, `-=` etcetera, which act as
  // binary operators with a very low precedence, that should result
  // in AssignmentExpression nodes.

  var _slash = {binop: 10, beforeExpr: true};
  var _eq = {isAssign: true, beforeExpr: true};
  var _assign = {isAssign: true, beforeExpr: true};
  var _incDec = {postfix: true, prefix: true, isUpdate: true};
  var _prefix = {prefix: true, beforeExpr: true};
  var _logicalOR = {binop: 1, beforeExpr: true};
  var _logicalAND = {binop: 2, beforeExpr: true};
  var _bitwiseOR = {binop: 3, beforeExpr: true};
  var _bitwiseXOR = {binop: 4, beforeExpr: true};
  var _bitwiseAND = {binop: 5, beforeExpr: true};
  var _equality = {binop: 6, beforeExpr: true};
  var _relational = {binop: 7, beforeExpr: true};
  var _bitShift = {binop: 8, beforeExpr: true};
  var _plusMin = {binop: 9, prefix: true, beforeExpr: true};
  var _multiplyModulo = {binop: 10, beforeExpr: true};

  // JS-Interpreter change:
  // tokTypes map never used.  Removed.
  // -- Neil Fraser, February 2023.

  // JS-Interpreter change:
  // Acorn's original code built up functions using strings for maximum efficiency.
  // However, this triggered a CSP unsafe-eval requirement.  Here's a slower, but
  // simpler approach.  -- Neil Fraser, January 2022.
  // https://github.com/NeilFraser/JS-Interpreter/issues/228

  /**
   * @param {string} words
   * @returns {function(*): boolean}
   */
  function makePredicate(words) {
    var wordList = words.split(" ");
    var set = Object.create(null);
    for (var i = 0; i < wordList.length; i++) {
      set[wordList[i]] = true;
    }
    return function(str) {
      return set[str] || false;
    };
  }

  // ECMAScript 5 reserved words.

  var isReservedWord5 = makePredicate("class enum extends super const export import");

  // The additional reserved words in strict mode.

  var isStrictReservedWord = makePredicate("implements interface let package private protected public static yield");

  // The forbidden variable names in strict mode.

  var isStrictBadIdWord = makePredicate("eval arguments");

  // And the keywords.

  var isKeyword = makePredicate("break case catch continue debugger default do else finally for function if return switch throw try var while with null true false instanceof typeof void delete new in this");

  // ## Character categories

  // Big ugly regular expressions that match characters in the
  // whitespace, identifier, and identifier-start categories. These
  // are only applied when a character is found to actually have a
  // code point above 128.

  var nonASCIIwhitespace = /[\u1680\u180e\u2000-\u200a\u202f\u205f\u3000\ufeff]/;
  var nonASCIIidentifierStartChars = "\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc";
  var nonASCIIidentifierChars = "\u0300-\u036f\u0483-\u0487\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u0610-\u061a\u0620-\u0649\u0672-\u06d3\u06e7-\u06e8\u06fb-\u06fc\u0730-\u074a\u0800-\u0814\u081b-\u0823\u0825-\u0827\u0829-\u082d\u0840-\u0857\u08e4-\u08fe\u0900-\u0903\u093a-\u093c\u093e-\u094f\u0951-\u0957\u0962-\u0963\u0966-\u096f\u0981-\u0983\u09bc\u09be-\u09c4\u09c7\u09c8\u09d7\u09df-\u09e0\u0a01-\u0a03\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a66-\u0a71\u0a75\u0a81-\u0a83\u0abc\u0abe-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ae2-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b3c\u0b3e-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5f-\u0b60\u0b66-\u0b6f\u0b82\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c62-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0cbc\u0cbe-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0ce2-\u0ce3\u0ce6-\u0cef\u0d02\u0d03\u0d46-\u0d48\u0d57\u0d62-\u0d63\u0d66-\u0d6f\u0d82\u0d83\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e34-\u0e3a\u0e40-\u0e45\u0e50-\u0e59\u0eb4-\u0eb9\u0ec8-\u0ecd\u0ed0-\u0ed9\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f41-\u0f47\u0f71-\u0f84\u0f86-\u0f87\u0f8d-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1029\u1040-\u1049\u1067-\u106d\u1071-\u1074\u1082-\u108d\u108f-\u109d\u135d-\u135f\u170e-\u1710\u1720-\u1730\u1740-\u1750\u1772\u1773\u1780-\u17b2\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1920-\u192b\u1930-\u193b\u1951-\u196d\u19b0-\u19c0\u19c8-\u19c9\u19d0-\u19d9\u1a00-\u1a15\u1a20-\u1a53\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1b46-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1bb0-\u1bb9\u1be6-\u1bf3\u1c00-\u1c22\u1c40-\u1c49\u1c5b-\u1c7d\u1cd0-\u1cd2\u1d00-\u1dbe\u1e01-\u1f15\u200c\u200d\u203f\u2040\u2054\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2d81-\u2d96\u2de0-\u2dff\u3021-\u3028\u3099\u309a\ua640-\ua66d\ua674-\ua67d\ua69f\ua6f0-\ua6f1\ua7f8-\ua800\ua806\ua80b\ua823-\ua827\ua880-\ua881\ua8b4-\ua8c4\ua8d0-\ua8d9\ua8f3-\ua8f7\ua900-\ua909\ua926-\ua92d\ua930-\ua945\ua980-\ua983\ua9b3-\ua9c0\uaa00-\uaa27\uaa40-\uaa41\uaa4c-\uaa4d\uaa50-\uaa59\uaa7b\uaae0-\uaae9\uaaf2-\uaaf3\uabc0-\uabe1\uabec\uabed\uabf0-\uabf9\ufb20-\ufb28\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\uff10-\uff19\uff3f";
  var nonASCIIidentifierStart = new RegExp("[" + nonASCIIidentifierStartChars + "]");
  var nonASCIIidentifier = new RegExp("[" + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "]");

  // Whether a single character denotes a newline.

  var newline = /[\n\r\u2028\u2029]/;

  // Matches a whole line break (where CRLF is considered a single
  // line break). Used to count lines.

  var lineBreak = /\r\n|[\n\r\u2028\u2029]/g;

  /**
   * Test whether a given character code starts an identifier.
   *
   * @param {number} code
   * @returns {boolean}
   */
  var isIdentifierStart = function(code) {
    if (code < 65) return code === 36;
    if (code < 91) return true;
    if (code < 97) return code === 95;
    if (code < 123) return true;
    return code >= 0xaa && nonASCIIidentifierStart.test(String.fromCharCode(code));
  };

  /**
   * Test whether a given character is part of an identifier.
   *
   * @param {number} code
   * @returns {boolean}
   */
  var isIdentifierChar = function(code) {
    if (code < 48) return code === 36;
    if (code < 58) return true;
    if (code < 65) return false;
    if (code < 91) return true;
    if (code < 97) return code === 95;
    if (code < 123) return true;
    return code >= 0xaa && nonASCIIidentifier.test(String.fromCharCode(code));
  };

  // ## Tokenizer

  /**
   * These are used when `options.locations` is on, for the
   * `tokStartLoc` and `tokEndLoc` properties.
   * @constructor
   */
  function line_loc_t() {
    this.line = tokCurLine;
    this.column = tokPos - tokLineStart;
  }

  /**
   * Reset the token state. Used at the start of a parse.
   */
  function initTokenState() {
    tokCurLine = 1;
    tokPos = tokLineStart = 0;
    tokRegexpAllowed = true;
    skipSpace();
  }

  /**
   * Called at the end of every token. Sets `tokEnd`, `tokVal`, and
   * `tokRegexpAllowed`, and skips the space after the token, so that
   * the next one's `tokStart` will point at the right position.
   *
   * @param {!Object} type
   * @param {*=} val
   */
  function finishToken(type, val) {
    tokEnd = tokPos;
    if (options.locations) {
      tokEndLoc = new line_loc_t();
    }
    tokType = type;
    skipSpace();
    tokVal = val;
    tokRegexpAllowed = type.beforeExpr;
  }

  function skipBlockComment() {
    var startLoc = options.onComment && options.locations && new line_loc_t();
    var start = tokPos;
    var end = input.indexOf("*/", tokPos += 2);
    if (end === -1) {
      raise(tokPos - 2, "Unterminated comment");
    }
    tokPos = end + 2;
    if (options.locations) {
      lineBreak.lastIndex = start;
      var match;
      while ((match = lineBreak.exec(input)) && match.index < tokPos) {
        ++tokCurLine;
        tokLineStart = match.index + match[0].length;
      }
    }
    if (options.onComment) {
      options.onComment(true, input.slice(start + 2, end), start, tokPos,
                        startLoc, options.locations && new line_loc_t());
    }
  }

  function skipLineComment() {
    var start = tokPos;
    var startLoc = options.onComment && options.locations && new line_loc_t();
    var ch = input.charCodeAt(tokPos += 2);
    while (tokPos < inputLen && ch !== 10 && ch !== 13 && ch !== 8232 && ch !== 8233) {
      ++tokPos;
      ch = input.charCodeAt(tokPos);
    }
    if (options.onComment) {
      options.onComment(false, input.slice(start + 2, tokPos), start, tokPos,
                        startLoc, options.locations && new line_loc_t());
    }
  }

  // Called at the start of the parse and after every token. Skips
  // whitespace and comments, and.

  function skipSpace() {
    while (tokPos < inputLen) {
      var ch = input.charCodeAt(tokPos);
      if (ch === 32) { // ' '
        ++tokPos;
      } else if (ch === 13) {
        ++tokPos;
        var next = input.charCodeAt(tokPos);
        if (next === 10) {
          ++tokPos;
        }
        if (options.locations) {
          ++tokCurLine;
          tokLineStart = tokPos;
        }
      } else if (ch === 10 || ch === 8232 || ch === 8233) {
        ++tokPos;
        if (options.locations) {
          ++tokCurLine;
          tokLineStart = tokPos;
        }
      } else if (ch > 8 && ch < 14) {
        ++tokPos;
      } else if (ch === 47) { // '/'
        var next = input.charCodeAt(tokPos + 1);
        if (next === 42) { // '*'
          skipBlockComment();
        } else if (next === 47) { // '/'
          skipLineComment();
        } else break;
      } else if (ch === 160) { // '\xa0'
        ++tokPos;
      } else if (ch >= 5760 && nonASCIIwhitespace.test(String.fromCharCode(ch))) {
        ++tokPos;
      } else {
        break;
      }
    }
  }

  // ### Token reading

  // This is the function that is called to fetch the next token. It
  // is somewhat obscure, because it works in character codes rather
  // than characters, and because operator parsing has been inlined
  // into it.
  //
  // All in the name of speed.
  //
  // The `forceRegexp` parameter is used in the one case where the
  // `tokRegexpAllowed` trick does not work. See `parseStatement`.

  function readToken_dot() {
    var next = input.charCodeAt(tokPos + 1);
    if (next >= 48 && next <= 57) {
      readNumber(true);
    } else {
      ++tokPos;
      finishToken(_dot);
    }
  }

  function readToken_slash() {  // '/'
    var next = input.charCodeAt(tokPos + 1);
    if (tokRegexpAllowed) {
      ++tokPos;
      readRegexp();
    } else if (next === 61) {
      finishOp(_assign, 2);
    } else {
      finishOp(_slash, 1);
    }
  }

  function readToken_mult_modulo() {  // '%*'
    var next = input.charCodeAt(tokPos + 1);
    if (next === 61) {
      finishOp(_assign, 2);
    } else {
      finishOp(_multiplyModulo, 1);
    }
  }

  /**
   * @param {number} code
   */
  function readToken_pipe_amp(code) {  // '|&'
    var next = input.charCodeAt(tokPos + 1);
    if (next === code) {
      finishOp(code === 124 ? _logicalOR : _logicalAND, 2);
    } else if (next === 61) {
      finishOp(_assign, 2);
    } else {
      finishOp(code === 124 ? _bitwiseOR : _bitwiseAND, 1);
    }
  }

  function readToken_caret() {  // '^'
    var next = input.charCodeAt(tokPos + 1);
    if (next === 61) {
      finishOp(_assign, 2);
    } else {
      finishOp(_bitwiseXOR, 1);
    }
  }

  /**
   * @param {number} code
   */
  function readToken_plus_min(code) {  // '+-'
    var next = input.charCodeAt(tokPos + 1);
    if (next === code) {
      if (next === 45 && input.charCodeAt(tokPos + 2) === 62 &&
          newline.test(input.slice(lastEnd, tokPos))) {
        // A `-->` line comment
        tokPos += 3;
        skipLineComment();
        skipSpace();
        readToken();
        return;
      }
      finishOp(_incDec, 2);
    } else if (next === 61) {
      finishOp(_assign, 2);
    } else {
      finishOp(_plusMin, 1);
    }
  }

  /**
   * @param {number} code
   */
  function readToken_lt_gt(code) {  // '<>'
    var next = input.charCodeAt(tokPos + 1);
    var size = 1;
    if (next === code) {
      size = (code === 62 && input.charCodeAt(tokPos + 2) === 62) ? 3 : 2;
      if (input.charCodeAt(tokPos + size) === 61) {
        finishOp(_assign, size + 1);
      } else {
        finishOp(_bitShift, size);
      }
      return;
    }
    if (next === 33 && code === 60 && input.charCodeAt(tokPos + 2) === 45 &&
        input.charCodeAt(tokPos + 3) === 45) {
      // `<!--`, an XML-style comment that should be interpreted as a line comment
      tokPos += 4;
      skipLineComment();
      skipSpace();
      readToken();
      return;
    }
    if (next === 61) {
      size = input.charCodeAt(tokPos + 2) === 61 ? 3 : 2;
    }
    finishOp(_relational, size);
  }

  /**
   * @param {number} code
   */
  function readToken_eq_excl(code) {  // '=!'
    var next = input.charCodeAt(tokPos + 1);
    if (next === 61) {
      finishOp(_equality, input.charCodeAt(tokPos + 2) === 61 ? 3 : 2);
    } else {
      finishOp(code === 61 ? _eq : _prefix, 1);
    }
  }

  /**
   * @param {number} code
   * @returns {boolean|undefined}
   */
  function getTokenFromCode(code) {
    switch(code) {
      // The interpretation of a dot depends on whether it is followed
      // by a digit.
      case 46: // '.'
        return readToken_dot();

        // Punctuation tokens.
      case 40:  ++tokPos; return finishToken(_parenL);
      case 41:  ++tokPos; return finishToken(_parenR);
      case 59:  ++tokPos; return finishToken(_semi);
      case 44:  ++tokPos; return finishToken(_comma);
      case 91:  ++tokPos; return finishToken(_bracketL);
      case 93:  ++tokPos; return finishToken(_bracketR);
      case 123: ++tokPos; return finishToken(_braceL);
      case 125: ++tokPos; return finishToken(_braceR);
      case 58:  ++tokPos; return finishToken(_colon);
      case 63:  ++tokPos; return finishToken(_question);

        // '0x' is a hexadecimal number.
      case 48: // '0'
        var next = input.charCodeAt(tokPos + 1);
        if (next === 120 || next === 88) return readHexNumber();
        // Anything else beginning with a digit is an integer, octal
        // number, or float.
      case 49: case 50: case 51: case 52: case 53: case 54: case 55: case 56: case 57: // 1-9
        return readNumber(false);

        // Quotes produce strings.
      case 34: case 39: // '"', "'"
        return readString(code);

      // Operators are parsed inline in tiny state machines. '=' (61) is
      // often referred to. `finishOp` simply skips the amount of
      // characters it is given as second argument, and returns a token
      // of the type given by its first argument.

      case 47: // '/'
        return readToken_slash();

      case 37: case 42: // '%*'
        return readToken_mult_modulo();

      case 124: case 38: // '|&'
        return readToken_pipe_amp(code);

      case 94: // '^'
        return readToken_caret();

      case 43: case 45: // '+-'
        return readToken_plus_min(code);

      case 60: case 62: // '<>'
        return readToken_lt_gt(code);

      case 61: case 33: // '=!'
        return readToken_eq_excl(code);

      case 126: // '~'
        return finishOp(_prefix, 1);
    }

    return false;
  }

  /**
   * @param {boolean=} forceRegexp
   */
  function readToken(forceRegexp) {
    if (!forceRegexp) {
      tokStart = tokPos;
    } else {
      tokPos = tokStart + 1;
    }
    if (options.locations) {
      tokStartLoc = new line_loc_t();
    }
    if (forceRegexp) return readRegexp();
    if (tokPos >= inputLen) return finishToken(_eof);

    var code = input.charCodeAt(tokPos);
    // Identifier or keyword. '\uXXXX' sequences are allowed in
    // identifiers, so '\' also dispatches to that.
    if (isIdentifierStart(code) || code === 92) {  // '\'
      return readWord();
    }

    var tok = getTokenFromCode(code);

    if (tok === false) {
      // If we are here, we either found a non-ASCII identifier
      // character, or something that's entirely disallowed.
      var ch = String.fromCharCode(code);
      if (ch === "\\" || nonASCIIidentifierStart.test(ch)) {
        return readWord();
      }
      raise(tokPos, "Unexpected character '" + ch + "'");
    }
  }

  /**
   * @param {!Object} type
   * @param {number} size
   */
  function finishOp(type, size) {
    var str = input.slice(tokPos, tokPos + size);
    tokPos += size;
    finishToken(type, str);
  }

  /**
   * Parse a regular expression. Some context-awareness is necessary,
   * since a '/' inside a '[]' set does not end the expression.
   */
  function readRegexp() {
    // JS-Interpreter change:
    // Removed redundant declaration of 'content' here.  Caused lint errors.
    // -- Neil Fraser, June 2022.
    var escaped;
    var inClass;
    var start = tokPos;
    for (;;) {
      if (tokPos >= inputLen) raise(start, "Unterminated regexp");
      var ch = input.charAt(tokPos);
      if (newline.test(ch)) raise(start, "Unterminated regexp");
      if (!escaped) {
        if (ch === "[") {
          inClass = true;
        } else if (ch === "]" && inClass) {
          inClass = false;
        } else if (ch === "/" && !inClass) {
          break;
        }
        escaped = ch === "\\";
      } else escaped = false;
      ++tokPos;
    }
    var content = input.slice(start, tokPos);
    ++tokPos;
    // Need to use `readWord1` because '\uXXXX' sequences are allowed
    // here (don't ask).
    var mods = readWord1();
    // JS-Interpreter change:
    // Acorn used to use 'gmsiy' to check for flags.  But 's' and 'y' are ES6.
    // -- Neil Fraser, December 2022.
    // https://github.com/acornjs/acorn/issues/1163
    if (mods && !/^[gmi]*$/.test(mods)) {
      raise(start, "Invalid regexp flag");
    }
    try {
      var value = new RegExp(content, mods);
    } catch (e) {
      if (e instanceof SyntaxError) raise(start, e.message);
      // JS-Interpreter change:
      // Acorn used to use raise(e) here which is incorrect.
      // -- Neil Fraser, July 2023.
      throw(e);
    }
    finishToken(_regexp, value);
  }

  /**
   * Read an integer in the given radix. Return null if zero digits
   * were read, the integer value otherwise. When `len` is given, this
   * will return `null` unless the integer has exactly `len` digits.
   * @param {number} radix
   * @param {number=} len
   * @returns {?number}
   */
  function readInt(radix, len) {
    var start = tokPos;
    var total = 0;
    var e = (len === undefined) ? Infinity : len;
    for (var i = 0; i < e; ++i) {
      var code = input.charCodeAt(tokPos), val;
      if (code >= 97) {
        val = code - 97 + 10; // a
      } else if (code >= 65) {
        val = code - 65 + 10; // A
      } else if (code >= 48 && code <= 57) {
        val = code - 48; // 0-9
      } else {
        val = Infinity;
      }
      if (val >= radix) break;
      ++tokPos;
      total = total * radix + val;
    }
    if (tokPos === start || len !== undefined && tokPos - start !== len) {
      return null;
    }
    return total;
  }

  function readHexNumber() {
    tokPos += 2; // 0x
    var val = readInt(16);
    if (val === null) {
      raise(tokStart + 2, "Expected hexadecimal number");
    }
    if (isIdentifierStart(input.charCodeAt(tokPos))) {
      raise(tokPos, "Identifier directly after number");
    }
    finishToken(_num, val);
  }

  /**
   * Read an integer, octal integer, or floating-point number.
   *
   * @param {boolean} startsWithDot
   */
  function readNumber(startsWithDot) {
    var start = tokPos;
    var isFloat = false;
    var octal = input.charCodeAt(tokPos) === 48;
    if (!startsWithDot && readInt(10) === null) {
      raise(start, "Invalid number");
    }
    if (input.charCodeAt(tokPos) === 46) {
      ++tokPos;
      readInt(10);
      isFloat = true;
    }
    var next = input.charCodeAt(tokPos);
    if (next === 69 || next === 101) { // 'eE'
      next = input.charCodeAt(++tokPos);
      if (next === 43 || next === 45) {
        ++tokPos; // '+-'
      }
      if (readInt(10) === null) {
        raise(start, "Invalid number");
      }
      isFloat = true;
    }
    if (isIdentifierStart(input.charCodeAt(tokPos))) {
      raise(tokPos, "Identifier directly after number");
    }

    var str = input.slice(start, tokPos);
    var val;
    if (isFloat) {
      val = parseFloat(str);
    } else if (!octal || str.length === 1) {
      val = parseInt(str, 10);
    } else if (/[89]/.test(str) || strict) {
      raise(start, "Invalid number");
    } else {
      val = parseInt(str, 8);
    }
    finishToken(_num, val);
  }

  /**
   * Read a string value, interpreting backslash-escapes.
   *
   * @param {number} quote
   */
  function readString(quote) {
    tokPos++;
    var out = "";
    for (;;) {
      if (tokPos >= inputLen) raise(tokStart, "Unterminated string constant");
      var ch = input.charCodeAt(tokPos);
      if (ch === quote) {
        ++tokPos;
        finishToken(_string, out);
        return;
      }
      if (ch === 92) { // '\'
        ch = input.charCodeAt(++tokPos);
        var octal = /^[0-7]+/.exec(input.slice(tokPos, tokPos + 3));
        if (octal) {
          octal = octal[0];
        }
        while (octal && parseInt(octal, 8) > 255) {
          octal = octal.slice(0, -1);
        }
        if (octal === "0") {
          octal = null;
        }
        ++tokPos;
        if (octal) {
          if (strict) raise(tokPos - 2, "Octal literal in strict mode");
          out += String.fromCharCode(parseInt(octal, 8));
          tokPos += octal.length - 1;
        } else {
          switch (ch) {
            case 110: out += "\n"; break; // 'n' -> '\n'
            case 114: out += "\r"; break; // 'r' -> '\r'
            case 120: out += String.fromCharCode(readHexChar(2)); break; // 'x'
            case 117: out += String.fromCharCode(readHexChar(4)); break; // 'u'
            case 85: out += String.fromCharCode(readHexChar(8)); break; // 'U'
            case 116: out += "\t"; break; // 't' -> '\t'
            case 98: out += "\b"; break; // 'b' -> '\b'
            case 118: out += "\u000b"; break; // 'v' -> '\u000b'
            case 102: out += "\f"; break; // 'f' -> '\f'
            case 48: out += "\0"; break; // 0 -> '\0'
            case 13:  // '\r'
              if (input.charCodeAt(tokPos) === 10) {
                ++tokPos; // '\r\n'
              }
            case 10: // ' \n'
              if (options.locations) {
                tokLineStart = tokPos;
                ++tokCurLine;
              }
              break;
            default: out += String.fromCharCode(ch); break;
          }
        }
      } else {
        if (ch === 13 || ch === 10 || ch === 8232 || ch === 8233) {
          raise(tokStart, "Unterminated string constant");
        }
        out += String.fromCharCode(ch); // '\'
        ++tokPos;
      }
    }
  }

  /**
   * Used to read character escape sequences ('\x', '\u', '\U').
   *
   * @param {number} len
   * @returns {number}
   */
  function readHexChar(len) {
    var n = readInt(16, len);
    if (n === null) raise(tokStart, "Bad character escape sequence");
    return /** @type {number} */(n);
  }

  // Used to signal to callers of `readWord1` whether the word
  // contained any escape sequences. This is needed because words with
  // escape sequences must not be interpreted as keywords.

  /** @type {boolean|undefined} */
  var containsEsc;

  /**
   * Read an identifier, and return it as a string. Sets `containsEsc`
   * to whether the word contained a '\u' escape.
   *
   * Only builds up the word character-by-character when it actually
   * containeds an escape, as a micro-optimization.
   *
   * @returns {string|undefined}
   */
  function readWord1() {
    containsEsc = false;
    var word;
    var first = true;
    var start = tokPos;
    for (;;) {
      var ch = input.charCodeAt(tokPos);
      if (isIdentifierChar(ch)) {
        if (containsEsc) {
          word += input.charAt(tokPos);
        }
        ++tokPos;
      } else if (ch === 92) { // "\"
        if (!containsEsc) {
          word = input.slice(start, tokPos);
        }
        containsEsc = true;
        if (input.charCodeAt(++tokPos) !== 117) { // "u"
          raise(tokPos, "Expecting Unicode escape sequence \\uXXXX");
        }
        ++tokPos;
        var esc = readHexChar(4);
        var escStr = String.fromCharCode(esc);
        if (!escStr) raise(tokPos - 1, "Invalid Unicode escape");
        if (!(first ? isIdentifierStart(esc) : isIdentifierChar(esc))) {
          raise(tokPos - 4, "Invalid Unicode escape");
        }
        word += escStr;
      } else {
        break;
      }
      first = false;
    }
    return containsEsc ? word : input.slice(start, tokPos);
  }

  /**
   * Read an identifier or keyword token. Will check for reserved
   * words when necessary.
   */
  function readWord() {
    var word = readWord1();
    var type = _name;
    if (!containsEsc && isKeyword(word)) {
      type = keywordTypes[word];
    }
    finishToken(type, word);
  }

  // ## Parser

  // A recursive descent parser operates by defining functions for all
  // syntactic elements, and recursively calling those, each function
  // advancing the input stream and returning an AST node. Precedence
  // of constructs (for example, the fact that `!x[1]` means `!(x[1])`
  // instead of `(!x)[1]` is handled by the fact that the parser
  // function that parses unary prefix operators is called first, and
  // in turn calls the function that parses `[]` subscripts — that
  // way, it'll receive the node for `x[1]` already parsed, and wraps
  // *that* in the unary operator node.
  //
  // Acorn uses an [operator precedence parser][opp] to handle binary
  // operator precedence, because it is much more compact than using
  // the technique outlined above, which uses different, nesting
  // functions to specify precedence, for all of the ten binary
  // precedence levels that JavaScript defines.
  //
  // [opp]: http://en.wikipedia.org/wiki/Operator-precedence_parser

  // ### Parser utilities

  /**
   * Continue to the next token.
   */
  function next() {
    lastStart = tokStart;
    lastEnd = tokEnd;
    lastEndLoc = tokEndLoc;
    readToken();
  }

  /**
   * Enter strict mode. Re-reads the next token to please pedantic
   * tests ("use strict"; 010; -- should fail).
   *
   * @param {boolean} strct
   */
  function setStrict(strct) {
    strict = strct;
    tokPos = tokStart;
    if (options.locations) {
      while (tokPos < tokLineStart) {
        tokLineStart = input.lastIndexOf("\n", tokLineStart - 2) + 1;
        --tokCurLine;
      }
    }
    skipSpace();
    readToken();
  }

  // Start an AST node, attaching a start offset.

  /**
   * @constructor
   */
  function node_t() {
    this.type = null;
    this.start = tokStart;
    this.end = null;
  }

  /**
   * @constructor
   */
  function node_loc_t() {
    this.start = tokStartLoc;
    this.end = null;
    if (sourceFile) {
      this.source = sourceFile;
    }
  }

  /**
   * @returns {!node_t}
   */
  function startNode() {
    var node = new node_t();
    if (options.locations) {
      node.loc = new node_loc_t();
    }
    if (options.directSourceFile) {
      node.sourceFile = options.directSourceFile;
    }
    if (options.ranges) {
      node.range = [tokStart, 0];
    }
    return node;
  }

  /**
   * Start a node whose start offset information should be based on
   * the start of another node. For example, a binary operator node is
   * only started after its left-hand side has already been parsed.
   *
   * @param {!node_t} other
   * @returns {!node_t}
   */
  function startNodeFrom(other) {
    var node = new node_t();
    node.start = other.start;
    if (options.locations) {
      node.loc = new node_loc_t();
      node.loc.start = other.loc.start;
    }
    if (options.ranges) {
      node.range = [other.range[0], 0];
    }
    return node;
  }

  /**
   * Finish an AST node, adding `type` and `end` properties.
   *
   * @param {!node_t} node
   * @param {string} type
   * @returns {!node_t}
   */
  function finishNode(node, type) {
    node.type = type;
    node.end = lastEnd;
    if (options.locations) {
      node.loc.end = lastEndLoc;
    }
    if (options.ranges) {
      node.range[1] = lastEnd;
    }
    return node;
  }

  /**
   * Test whether a statement node is the string literal `"use strict"`.
   *
   * @param {!node_t} stmt
   * @returns {boolean}
   */
  function isUseStrict(stmt) {
    return stmt.type === "ExpressionStatement" &&
        stmt.expression.type === "Literal" &&
        stmt.expression.value === "use strict";
  }

  /**
   * Predicate that tests whether the next token is of the given
   * type, and if yes, consumes it as a side effect.
   * @param {!Object} type
   * @returns {boolean}
   */
  function eat(type) {
    if (tokType === type) {
      next();
      return true;
    }
    return false;
  }

  /**
   * Test whether a semicolon can be inserted at the current position.
   *
   * @returns {boolean}
   */
  function canInsertSemicolon() {
    return !options.strictSemicolons &&
        (tokType === _eof || tokType === _braceR ||
         newline.test(input.slice(lastEnd, tokStart)));
  }

  /**
   * Consume a semicolon, or, failing that, see if we are allowed to
   * pretend that there is a semicolon at this position.
   */
  function semicolon() {
    if (!eat(_semi) && !canInsertSemicolon()) {
      unexpected();
    }
  }

  /**
   * Expect a token of a given type.  If found, consume it, otherwise,
   * raise an unexpected token error.
   *
   * @param {!Object} type
   */
  function expect(type) {
    if (tokType === type) {
      next();
    } else {
      unexpected();
    }
  }

  /**
   * Raise an unexpected token error.
   * @throws {SyntaxError}
   */
  function unexpected() {
    raise(tokStart, "Unexpected token");
  }

  /**
   * Verify that a node is an lval — something that can be assigned to.
   *
   * @param {!node_t} expr
   */
  function checkLVal(expr) {
    if (expr.type !== "Identifier" && expr.type !== "MemberExpression") {
      raise(expr.start, "Assigning to rvalue");
    }
    if (strict && expr.type === "Identifier" && isStrictBadIdWord(expr.name)) {
      raise(expr.start, "Assigning to " + expr.name + " in strict mode");
    }
  }

  // ### Statement parsing

  /**
   * Parse a program. Initializes the parser, reads any number of
   * statements, and wraps them in a Program node.  Optionally takes a
   * `program` argument.  If present, the statements will be appended
   * to its body instead of creating a new node.
   *
   * @param {node_t} program
   * @returns {!node_t}
   */
  function parseTopLevel(program) {
    lastStart = lastEnd = tokPos;
    if (options.locations) {
      lastEndLoc = new line_loc_t();
    }
    inFunction = strict = false;
    labels = [];
    readToken();

    var node = program || startNode();
    var first = true;
    if (!program) {
      node.body = [];
    }
    while (tokType !== _eof) {
      var stmt = parseStatement();
      node.body.push(stmt);
      if (first && isUseStrict(stmt)) {
        setStrict(true);
      }
      first = false;
    }
    return finishNode(node, "Program");
  }

  var loopLabel = {kind: "loop"};
  var switchLabel = {kind: "switch"};

  /**
   * Parse a single statement.
   *
   * If expecting a statement and finding a slash operator, parse a
   * regular expression literal. This is to handle cases like
   * `if (foo) /blah/.exec(foo);`, where looking at the previous token
   * does not help.
   *
   * @returns {!node_t}
   */
  function parseStatement() {
    if (tokType === _slash || tokType === _assign && tokVal === "/=") {
      readToken(true);
    }

    var starttype = tokType;
    var node = startNode();

    // Most types of statements are recognized by the keyword they
    // start with. Many are trivial to parse, some require a bit of
    // complexity.

    switch (starttype) {
      case _break: case _continue:
        next();
        var isBreak = starttype === _break;
        if (eat(_semi) || canInsertSemicolon()) {
          node.label = null;
        } else if (tokType !== _name) {
          unexpected();
        } else {
          node.label = parseIdent();
          semicolon();
        }

        // Verify that there is an actual destination to break or
        // continue to.
        for (var i = 0; i < labels.length; ++i) {
          var lab = labels[i];
          if (node.label === null || lab.name === node.label.name) {
            if (lab.kind !== null && (isBreak || lab.kind === "loop")) break;
            if (node.label && isBreak) break;
          }
        }
        if (i === labels.length) {
          raise(node.start, "Unsyntactic " + starttype.keyword);
        }
        return finishNode(node, isBreak ? "BreakStatement" : "ContinueStatement");

      case _debugger:
        next();
        semicolon();
        return finishNode(node, "DebuggerStatement");

      case _do:
        next();
        labels.push(loopLabel);
        node.body = parseStatement();
        labels.pop();
        expect(_while);
        node.test = parseParenExpression();
        semicolon();
        return finishNode(node, "DoWhileStatement");

        // Disambiguating between a `for` and a `for`/`in` loop is
        // non-trivial. Basically, we have to parse the init `var`
        // statement or expression, disallowing the `in` operator (see
        // the second parameter to `parseExpression`), and then check
        // whether the next token is `in`. When there is no init part
        // (semicolon immediately after the opening parenthesis), it is
        // a regular `for` loop.

      case _for:
        next();
        labels.push(loopLabel);
        expect(_parenL);
        if (tokType === _semi) return parseFor(node, null);
        if (tokType === _var) {
          var init = startNode();
          next();
          parseVar(init, true);
          finishNode(init, "VariableDeclaration");
          if (init.declarations.length === 1 && eat(_in))
            return parseForIn(node, init);
          return parseFor(node, init);
        }
        var init = parseExpression(false, true);
        if (eat(_in)) {
          checkLVal(init);
          return parseForIn(node, init);
        }
        return parseFor(node, init);

      case _function:
        next();
        return parseFunction(node, true);

      case _if:
        next();
        node.test = parseParenExpression();
        node.consequent = parseStatement();
        node.alternate = eat(_else) ? parseStatement() : null;
        return finishNode(node, "IfStatement");

      case _return:
        if (!inFunction && !options.allowReturnOutsideFunction) {
          raise(tokStart, "'return' outside of function");
        }
        next();

        // In `return` (and `break`/`continue`), the keywords with
        // optional arguments, we eagerly look for a semicolon or the
        // possibility to insert one.

        if (eat(_semi) || canInsertSemicolon()) {
          node.argument = null;
        } else {
          node.argument = parseExpression();
          semicolon();
        }
        return finishNode(node, "ReturnStatement");

      case _switch:
        next();
        node.discriminant = parseParenExpression();
        node.cases = [];
        expect(_braceL);
        labels.push(switchLabel);

        // Statements under must be grouped (by label) in SwitchCase
        // nodes. `cur` is used to keep the node that we are currently
        // adding statements to.

        for (var cur, sawDefault; tokType !== _braceR;) {
          if (tokType === _case || tokType === _default) {
            var isCase = tokType === _case;
            if (cur) {
              finishNode(cur, "SwitchCase");
            }
            node.cases.push(cur = startNode());
            cur.consequent = [];
            next();
            if (isCase) {
              cur.test = parseExpression();
            } else {
              if (sawDefault) {
                raise(lastStart, "Multiple default clauses");
              }
              sawDefault = true;
              cur.test = null;
            }
            expect(_colon);
          } else {
            if (!cur) unexpected();
            cur.consequent.push(parseStatement());
          }
        }
        if (cur) finishNode(cur, "SwitchCase");
        next(); // Closing brace
        labels.pop();
        return finishNode(node, "SwitchStatement");

      case _throw:
        next();
        if (newline.test(input.slice(lastEnd, tokStart)))
          raise(lastEnd, "Illegal newline after throw");
        node.argument = parseExpression();
        semicolon();
        return finishNode(node, "ThrowStatement");

      case _try:
        next();
        node.block = parseBlock();
        node.handler = null;
        if (tokType === _catch) {
          var clause = startNode();
          next();
          expect(_parenL);
          clause.param = parseIdent();
          if (strict && isStrictBadIdWord(clause.param.name))
            raise(clause.param.start, "Binding " + clause.param.name + " in strict mode");
          expect(_parenR);
          // JS-Interpreter change:
          // Obsolete unused property; commenting out.
          // -- Neil Fraser, January 2023.
          // clause.guard = null;
          clause.body = parseBlock();
          node.handler = finishNode(clause, "CatchClause");
        }
        // JS-Interpreter change:
        // Obsolete unused property; commenting out.
        // -- Neil Fraser, January 2023.
        // node.guardedHandlers = empty;
        node.finalizer = eat(_finally) ? parseBlock() : null;
        if (!node.handler && !node.finalizer)
          raise(node.start, "Missing catch or finally clause");
        return finishNode(node, "TryStatement");

      case _var:
        next();
        parseVar(node);
        semicolon();
        return finishNode(node, "VariableDeclaration");

      case _while:
        next();
        node.test = parseParenExpression();
        labels.push(loopLabel);
        node.body = parseStatement();
        labels.pop();
        return finishNode(node, "WhileStatement");

      case _with:
        if (strict) raise(tokStart, "'with' in strict mode");
        next();
        node.object = parseParenExpression();
        node.body = parseStatement();
        return finishNode(node, "WithStatement");

      case _braceL:
        return parseBlock();

      case _semi:
        next();
        return finishNode(node, "EmptyStatement");

      // If the statement does not start with a statement keyword or a
      // brace, it's an ExpressionStatement or LabeledStatement. We
      // simply start parsing an expression, and afterwards, if the
      // next token is a colon and the expression was a simple
      // Identifier node, we switch to interpreting it as a label.
      default:
        var maybeName = tokVal;
        var expr = parseExpression();
        if (starttype === _name && expr.type === "Identifier" && eat(_colon)) {
          for (var i = 0; i < labels.length; ++i) {
            if (labels[i].name === maybeName) {
              raise(expr.start, "Label '" + maybeName + "' is already declared");
            }
          }
          var kind = tokType.isLoop ? "loop" :
              (tokType === _switch ? "switch" : null);
          labels.push({name: maybeName, kind: kind});
          node.body = parseStatement();
          labels.pop();
          node.label = expr;
          return finishNode(node, "LabeledStatement");
        } else {
          node.expression = expr;
          semicolon();
          return finishNode(node, "ExpressionStatement");
        }
    }
  }

  /**
   * Used for constructs like `switch` and `if` that insist on
   * parentheses around their expression.
   *
   * @returns {!node_t}
   */
  function parseParenExpression() {
    expect(_parenL);
    var val = parseExpression();
    expect(_parenR);
    return val;
  }

  /**
   * Parse a semicolon-enclosed block of statements, handling `"use
   * strict"` declarations when `allowStrict` is true (used for
   * function bodies).
   *
   * @param {boolean=} allowStrict
   * @returns {!node_t}
   */
  function parseBlock(allowStrict) {
    var node = startNode();
    var first = true;
    var strict = false;
    var oldStrict;
    node.body = [];
    expect(_braceL);
    while (!eat(_braceR)) {
      var stmt = parseStatement();
      node.body.push(stmt);
      if (first && allowStrict && isUseStrict(stmt)) {
        oldStrict = strict;
        setStrict(strict = true);
      }
      first = false;
    }
    if (strict && !oldStrict) setStrict(false);
    return finishNode(node, "BlockStatement");
  }

  /**
   * Parse a regular `for` loop. The disambiguation code in `parseStatement`
   * will already have parsed the init statement or expression.
   *
   * @param {!node_t} node
   * @param {node_t} init
   * @returns {!node_t}
   */
  function parseFor(node, init) {
    node.init = init;
    expect(_semi);
    node.test = tokType === _semi ? null : parseExpression();
    expect(_semi);
    node.update = tokType === _parenR ? null : parseExpression();
    expect(_parenR);
    node.body = parseStatement();
    labels.pop();
    return finishNode(node, "ForStatement");
  }

  /**
   * Parse a `for`/`in` loop.
   *
   * @param {!node_t} node
   * @param {!node_t} init
   * @returns {!node_t}
   */
  function parseForIn(node, init) {
    node.left = init;
    node.right = parseExpression();
    expect(_parenR);
    node.body = parseStatement();
    labels.pop();
    return finishNode(node, "ForInStatement");
  }

  /**
   * Parse a list of variable declarations.
   *
   * @param {!node_t} node
   * @param {boolean=} noIn
   */
  function parseVar(node, noIn) {
    node.declarations = [];
    node.kind = "var";
    for (;;) {
      var decl = startNode();
      decl.id = parseIdent();
      if (strict && isStrictBadIdWord(decl.id.name))
        raise(decl.id.start, "Binding " + decl.id.name + " in strict mode");
      decl.init = eat(_eq) ? parseExpression(true, noIn) : null;
      node.declarations.push(finishNode(decl, "VariableDeclarator"));
      if (!eat(_comma)) break;
    }
  }

  // ### Expression parsing

  // These nest, from the most general expression type at the top to
  // 'atomic', nondivisible expression types at the bottom. Most of
  // the functions will simply let the function(s) below them parse,
  // and, *if* the syntactic construct they handle is present, wrap
  // the AST node that the inner parser gave them in another node.

  /**
   * Parse a full expression. The arguments are used to forbid comma
   * sequences (in argument lists, array literals, or object literals)
   * or the `in` operator (in for loops initalization expressions).
   *
   * @param {boolean=} noComma
   * @param {boolean=} noIn
   * @returns {!node_t}
   */
  function parseExpression(noComma, noIn) {
    var expr = parseMaybeAssign(noIn);
    if (!noComma && tokType === _comma) {
      var node = startNodeFrom(expr);
      node.expressions = [expr];
      while (eat(_comma)) node.expressions.push(parseMaybeAssign(noIn));
      return finishNode(node, "SequenceExpression");
    }
    return expr;
  }

  /**
   * Parse an assignment expression. This includes applications of
   * operators like `+=`.
   *
   * @param {boolean|undefined} noIn
   * @returns {!node_t}
   */
  function parseMaybeAssign(noIn) {
    var left = parseMaybeConditional(noIn);
    if (tokType.isAssign) {
      var node = startNodeFrom(left);
      node.operator = tokVal;
      node.left = left;
      next();
      node.right = parseMaybeAssign(noIn);
      checkLVal(left);
      return finishNode(node, "AssignmentExpression");
    }
    return left;
  }

  /**
   * Parse a ternary conditional (`?:`) operator.
   *
   * @param {boolean|undefined} noIn
   * @returns {!node_t}
   */
  function parseMaybeConditional(noIn) {
    var expr = parseExprOps(noIn);
    if (eat(_question)) {
      var node = startNodeFrom(expr);
      node.test = expr;
      node.consequent = parseExpression(true);
      expect(_colon);
      node.alternate = parseExpression(true, noIn);
      return finishNode(node, "ConditionalExpression");
    }
    return expr;
  }

  /**
   * Start the precedence parser.
   *
   * @param {boolean|undefined} noIn
   * @returns {!node_t}
   */
  function parseExprOps(noIn) {
    return parseExprOp(parseMaybeUnary(), -1, noIn);
  }

  /**
   * Parse binary operators with the operator precedence parsing
   * algorithm. `left` is the left-hand side of the operator.
   * `minPrec` provides context that allows the function to stop and
   * defer further parser to one of its callers when it encounters an
   * operator that has a lower precedence than the set it is parsing.
   *
   * @param {!node_t} left
   * @param {number} minPrec
   * @param {boolean|undefined} noIn
   * @returns {!node_t}
   */
  function parseExprOp(left, minPrec, noIn) {
    var prec = tokType.binop;
    if (prec !== null && (!noIn || tokType !== _in)) {
      if (prec > minPrec) {
        var node = startNodeFrom(left);
        node.left = left;
        node.operator = tokVal;
        var op = tokType;
        next();
        node.right = parseExprOp(parseMaybeUnary(), prec, noIn);
        var exprNode = finishNode(node, (op === _logicalOR || op === _logicalAND) ? "LogicalExpression" : "BinaryExpression");
        return parseExprOp(exprNode, minPrec, noIn);
      }
    }
    return left;
  }

  /**
   * Parse unary operators, both prefix and postfix.
   *
   * @returns {!node_t}
   */
  function parseMaybeUnary() {
    if (tokType.prefix) {
      var node = startNode();
      var update = tokType.isUpdate;
      node.operator = tokVal;
      node.prefix = true;
      tokRegexpAllowed = true;
      next();
      node.argument = parseMaybeUnary();
      if (update) checkLVal(node.argument);
      else if (strict && node.operator === "delete" &&
               node.argument.type === "Identifier")
        raise(node.start, "Deleting local variable in strict mode");
      return finishNode(node, update ? "UpdateExpression" : "UnaryExpression");
    }
    var expr = parseExprSubscripts();
    while (tokType.postfix && !canInsertSemicolon()) {
      var node = startNodeFrom(expr);
      node.operator = tokVal;
      node.prefix = false;
      node.argument = expr;
      checkLVal(expr);
      next();
      expr = finishNode(node, "UpdateExpression");
    }
    return expr;
  }

  /**
   * Parse call, dot, and `[]`-subscript expressions.
   *
   * @returns {!node_t}
   */
  function parseExprSubscripts() {
    return parseSubscripts(parseExprAtom());
  }

  /**
   * @param {!node_t} base
   * @param {boolean=} noCalls
   * @returns {!node_t}
   */
  function parseSubscripts(base, noCalls) {
    var node;
    if (eat(_dot)) {
      node = startNodeFrom(base);
      node.object = base;
      node.property = parseIdent(true);
      node.computed = false;
      return parseSubscripts(finishNode(node, "MemberExpression"), noCalls);
    }
    if (eat(_bracketL)) {
      node = startNodeFrom(base);
      node.object = base;
      node.property = parseExpression();
      node.computed = true;
      expect(_bracketR);
      return parseSubscripts(finishNode(node, "MemberExpression"), noCalls);
    }
    if (!noCalls && eat(_parenL)) {
      node = startNodeFrom(base);
      node.callee = base;
      node.arguments = parseExprList(_parenR, false);
      return parseSubscripts(finishNode(node, "CallExpression"), noCalls);
    }
    return base;
  }

  /**
   * Parse an atomic expression — either a single token that is an expression,
   * an expression started by a keyword like `function` or `new`,
   * or an expression wrapped in punctuation like `()`, `[]`, or `{}`.
   *
   * @returns {!node_t}
   * @suppress {missingReturn}
   */
  function parseExprAtom() {
    var node;
    switch (tokType) {
      case _this:
        node = startNode();
        next();
        return finishNode(node, "ThisExpression");
      case _name:
        return parseIdent();
      case _num: case _string: case _regexp:
        node = startNode();
        node.value = tokVal;
        node.raw = input.slice(tokStart, tokEnd);
        next();
        return finishNode(node, "Literal");

      case _null: case _true: case _false:
        node = startNode();
        node.value = tokType.atomValue;
        node.raw = tokType.keyword;
        next();
        return finishNode(node, "Literal");

      case _parenL:
        var tokStartLoc1 = tokStartLoc;
        var tokStart1 = tokStart;
        next();
        var val = parseExpression();
        val.start = tokStart1;
        val.end = tokEnd;
        if (options.locations) {
          val.loc.start = tokStartLoc1;
          val.loc.end = tokEndLoc;
        }
        if (options.ranges) {
          val.range = [tokStart1, tokEnd];
        }
        expect(_parenR);
        return val;

      case _bracketL:
        node = startNode();
        next();
        node.elements = parseExprList(_bracketR, true, true);
        return finishNode(node, "ArrayExpression");

      case _braceL:
        return parseObj();

      case _function:
        node = startNode();
        next();
        return parseFunction(node, false);

      case _new:
        return parseNew();
    }
    unexpected();
  }

  /**
   * New's precedence is slightly tricky. It must allow its argument to be
   * a `[]` or dot subscript expression, but not a call — at least, not
   * without wrapping it in parentheses. Thus, it uses the noCalls argument
   * to parseSubscripts to prevent it from consuming the argument list.
   *
   * @returns {!node_t}
   */
  function parseNew() {
    var node = startNode();
    next();
    node.callee = parseSubscripts(parseExprAtom(), true);
    node.arguments = eat(_parenL) ? parseExprList(_parenR, false) : empty;
    return finishNode(node, "NewExpression");
  }

  /**
   * Parse an object literal.
   *
   * @returns {!node_t}
   */
  function parseObj() {
    var node = startNode();
    var first = true;
    var sawGetSet = false;
    node.properties = [];
    next();
    while (!eat(_braceR)) {
      if (!first) {
        expect(_comma);
        if (options.allowTrailingCommas && eat(_braceR)) {
          break;
        }
      } else {
        first = false;
      }

      var prop = {key: parsePropertyName()};
      var isGetSet = false;
      var kind;
      if (eat(_colon)) {
        prop.value = parseExpression(true);
        kind = prop.kind = "init";
      } else if (prop.key.type === "Identifier" &&
                 (prop.key.name === "get" || prop.key.name === "set")) {
        isGetSet = sawGetSet = true;
        kind = prop.kind = prop.key.name;
        prop.key = parsePropertyName();
        if (tokType !== _parenL) unexpected();
        prop.value = parseFunction(startNode(), false);
      } else {
        unexpected();
      }

      // getters and setters are not allowed to clash — either with
      // each other or with an init property — and in strict mode,
      // init properties are also not allowed to be repeated.

      if (prop.key.type === "Identifier" && (strict || sawGetSet)) {
        for (var i = 0; i < node.properties.length; ++i) {
          var other = node.properties[i];
          if (other.key.name === prop.key.name) {
            var conflict = kind === other.kind || isGetSet && other.kind === "init" ||
                kind === "init" && (other.kind === "get" || other.kind === "set");
            if (conflict && !strict && kind === "init" && other.kind === "init") {
              conflict = false;
            }
            if (conflict) {
              raise(prop.key.start, "Redefinition of property");
            }
          }
        }
      }
      node.properties.push(prop);
    }
    return finishNode(node, "ObjectExpression");
  }

  /**
   * @returns {!node_t}
   */
  function parsePropertyName() {
    if (tokType === _num || tokType === _string) {
      return parseExprAtom();
    }
    return parseIdent(true);
  }

  /**
   * Parse a function declaration or literal (depending on the
   * `isStatement` parameter).
   *
   * @param {!node_t} node
   * @param {boolean} isStatement
   * @returns {!node_t}
   */
  function parseFunction(node, isStatement) {
    if (tokType === _name) {
      node.id = parseIdent();
    } else if (isStatement) {
      unexpected();
    } else {
      node.id = null;
    }
    node.params = [];
    var first = true;
    expect(_parenL);
    while (!eat(_parenR)) {
      if (!first) {
        expect(_comma);
      } else {
        first = false;
      }
      node.params.push(parseIdent());
    }

    // Start a new scope with regard to labels and the `inFunction`
    // flag (restore them to their old value afterwards).
    var oldInFunc = inFunction;
    var oldLabels = labels;
    inFunction = true;
    labels = [];
    node.body = parseBlock(true);
    inFunction = oldInFunc;
    labels = oldLabels;

    // If this is a strict mode function, verify that argument names
    // are not repeated, and it does not try to bind the words `eval`
    // or `arguments`.
    if (strict || node.body.body.length && isUseStrict(node.body.body[0])) {
      for (var i = node.id ? -1 : 0; i < node.params.length; ++i) {
        var id = i < 0 ? node.id : node.params[i];
        if (isStrictReservedWord(id.name) || isStrictBadIdWord(id.name)) {
          raise(id.start, "Defining '" + id.name + "' in strict mode");
        }
        if (i >= 0) {
          for (var j = 0; j < i; ++j) {
            if (id.name === node.params[j].name) {
              raise(id.start, "Argument name clash in strict mode");
            }
          }
        }
      }
    }

    return finishNode(node, isStatement ? "FunctionDeclaration" : "FunctionExpression");
  }

  /**
   * Parses a comma-separated list of expressions, and returns them as
   * an array. `close` is the token type that ends the list, and
   * `allowEmpty` can be turned on to allow subsequent commas with
   * nothing in between them to be parsed as `null` (which is needed
   * for array literals).
   *
   * @param {!Object} close
   * @param {boolean} allowTrailingComma
   * @param {boolean=} allowEmpty
   * @returns {!Array<!node_t>}
   */
  function parseExprList(close, allowTrailingComma, allowEmpty) {
    var elts = [];
    var first = true;
    while (!eat(close)) {
      if (!first) {
        expect(_comma);
        if (allowTrailingComma && options.allowTrailingCommas && eat(close)) {
          break;
        }
      } else {
        first = false;
      }

      elts.push((allowEmpty && tokType === _comma) ?
          null : parseExpression(true));
    }
    return elts;
  }

  /**
   * Parse the next token as an identifier. If `liberal` is true (used
   * when parsing properties), it will also convert keywords into
   * identifiers.
   *
   * @param {boolean=} liberal
   * @returns {!node_t}
   */
  function parseIdent(liberal) {
    var node = startNode();
    if (liberal && options.forbidReserved === "everywhere") {
      liberal = false;
    }
    if (tokType === _name) {
      if (!liberal &&
          (options.forbidReserved && isReservedWord5(tokVal) ||
           strict && isStrictReservedWord(tokVal)) &&
          input.slice(tokStart, tokEnd).indexOf("\\") === -1) {
        raise(tokStart, "The keyword '" + tokVal + "' is reserved");
      }
      node.name = tokVal;
    } else if (liberal && tokType.keyword) {
      node.name = tokType.keyword;
    } else {
      unexpected();
    }
    tokRegexpAllowed = false;
    next();
    return finishNode(node, "Identifier");
  }

});


/***/ }),

/***/ "vm":
/*!*********************!*\
  !*** external "vm" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("vm");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be in strict mode.
(() => {
"use strict";
/*!*******************************!*\
  !*** ./src/js-interpreter.js ***!
  \*******************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
const acorn = __webpack_require__(/*! ../original-repo/acorn */ "./original-repo/acorn.js");
globalThis.acorn = acorn;
const { Interpreter } = __webpack_require__(/*! ../original-repo/interpreter */ "./original-repo/interpreter.js");

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Interpreter);

})();

__webpack_exports__ = __webpack_exports__["default"];
/******/ 	return __webpack_exports__;
/******/ })()
;
});