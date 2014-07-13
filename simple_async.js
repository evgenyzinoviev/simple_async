// simple_async.js
// ch1p@ch1p.com (c) 2014

(function(window) {

  var STATE_CREATED = 0,
      STATE_STARTED = 1,
      STATE_ERROR = 2,
      STATE_DONE = 3;

  function isFunction(obj) {
    return Object.prototype.toString.call(obj) === '[object Function]';
  }
  function isStateValid(state) {
    return state >= 0 && state <= 3;
  }
  function argumentsToArray(args) {
    return Array.prototype.slice.call(args);
  }
  function getFunctions(args) {
    var fs = [];
    for (var i = 0; i < args.length; i++) {
      if (isFunction(args[i])) {
        fs.push(args[i]);
      }
    }
    return fs;
  }

  function Queue(fs) {
    this.fs = fs;
    this.state = STATE_CREATED;

    this.errorData = null;
    this.doneData = null;
    this.onDoneCallback = null;
    this.onErrorCallback = null;

    var self = this;
    setTimeout(function() {
      self.run();
    }, 0);
  }
  Queue.prototype.onDone = function(f) {
    this.onDoneCallback = f;
    return this;
  };
  Queue.prototype.onError = function(f) {
    this.onErrorCallback = f;
    return this;
  };
  Queue.prototype.run = function() {
    if (this.state == STATE_CREATED) {
      this.setState(STATE_STARTED);
    }
  };
  Queue.prototype.next = function() {
    if (!this.fs.length) {
      if (arguments.length) {
        this.doneData = argumentsToArray(arguments);
      }
      this.setState(STATE_DONE);
      return;
    }

    var f = this.fs.shift();
    f.apply(this, arguments);
  };
  Queue.prototype.error = function() {
    if (this.state == STATE_STARTED) {
      this.errorData = argumentsToArray(arguments);
      this.setState(STATE_ERROR);
    }
  };
  Queue.prototype.done = function() {
    if (this.state == STATE_STARTED) {
      this.doneData = argumentsToArray(arguments);
      this.setState(STATE_DONE);
    }
  };
  Queue.prototype.setState = function(state) {
    if (!isStateValid(state)) {
      throw new Error("state " + state + " is invalid");
    }

    this.state = state;
    switch (state) {
    case STATE_STARTED: 
      this.next();
      break;

    case STATE_ERROR:
      this.onErrorCallback && this.onErrorCallback.apply(this, this.errorData);
      break;

    case STATE_DONE:
      this.onDoneCallback && this.onDoneCallback.apply(this, this.doneData);
      break;
    }
  };

  // Public API:
  // onDone()
  // done()
  function Parallel(fs) {
    this.fs = fs;
    this.state = STATE_CREATED;

    this.doneCount = 0;
    this.dones = [];
    this.result = [];
    this.onDoneCallback = null;

    var self = this;
    setTimeout(function() {
      self.run();
    }, 0);
  }

  Parallel.prototype.onDone = function(f) {
    this.onDoneCallback = f;
    return this;
  };
  Parallel.prototype.run = function() {
    if (this.state == STATE_CREATED) {
      this.setState(STATE_STARTED);
    }
  };
  Parallel.prototype.runAll = function() {
    var i;
    for (i = 0; i < this.fs.length; i++) {
      this.result.push(null);
      this.dones.push(null);
    }
    for (i = 0; i < this.fs.length; i++) {
      this.fs[i].apply(this.fs[i]);
    }
  };
  Parallel.prototype.done = function(f, result) {
    if (this.state == STATE_STARTED) {
      if (f) {
        var ind = this.fs.indexOf(f);
        if (ind != -1) {
          if (this.dones[ind])
            return;

          this.dones[ind] = true;
          this.result[ind] = result;
        }
      }

      this.doneCount++;
      if (this.doneCount >= this.fs.length) {
        this.setState(STATE_DONE);
      }
    }
  };
  Parallel.prototype.setState = function(state) {
    if (!isStateValid(state)) {
      throw new Error("state " + state + " is invalid");
    }

    this.state = state;
    switch (state) {
    case STATE_STARTED: 
      this.runAll();
      break;

    case STATE_DONE:
      this.onDoneCallback && this.onDoneCallback.call(this, this.result);
      break;
    }
  };

  window.queue = function() {
    return new Queue(getFunctions(arguments));
  };
  window.parallel = function() {
    return new Parallel(getFunctions(arguments));
  };

})(window);
