simple_async
============

Simple JavaScript async flow control library.

### queue

Run functions in sequence. Each function running once the previous function has completed and called `next()`. If any function call `error()` or `done()`, no more functions are run and `onError`/`onDone` callback is called.

Arguments passed to `next()` are passed to the next function in the queue or `onDone` callback if no more functions left.
Arguments passed to `done()` and `error()` are passed to the `onError`/`onDone` callback respectively.

```js
var q = queue(
  function() {
    setTimeout(function() {
      // q.error('error!');
      q.next(1, 2);
    }, 500);
  },
  function(arg1, arg2) {
    // arg1 = 1, arg2 = 2
    setTimeout(function() {
      q.done(3, 4);
    }, 500);
  }
)
.onDone(function(val1, val2) {
  // val1 = 3, val2 = 4
})
.onError(function(err) {
});
```

### parallel

Run functions in parallel. Once a function has finished its work, it must to call `done()` or `done(this, val)` (where `this` is this function and `val` is a returning value);

When all functions have completed, `onDone` callback is called. `onDone` callback gets an array contaiting all results passed to `done(this, val)`. See example below.

```js
var q = parallel(
  function() {
    setTimeout(function() {
      q.done(this, 1);
    }.bind(this), 500);
  },
  function() {
    setTimeout(function() {
      q.done(this, 2);
    }.bind(this), 300);
  },
  function() {
    setTimeout(function() {
      q.done();
    }.bind(this), 700);
  },
  function() {
    setTimeout(function() {
      q.done(this, 4);
    }.bind(this), 100);
  }
)
.onDone(function(vals) {
  // vals = [1, 2, null, 4]
});
```
