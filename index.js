// Generated by CoffeeScript 1.6.2
(function() {
  var File, GlobArrayRun, async, glob, globArray, _;

  glob = require("glob");

  async = require("async");

  _ = require("lodash");

  File = (function() {
    function File(pattern, path, index) {
      this.pattern = pattern;
      this.path = path;
      this.index = index;
    }

    File.prototype.compare = function(other) {
      var p1, p2, stars;

      stars = /((\/\*\*)?\/\*)?\.(\w+)$/;
      p1 = this.pattern.replace(stars, '');
      p2 = other.pattern.replace(stars, '');
      if (p1.length > p2.length) {
        return this;
      } else {
        return other;
      }
    };

    File.prototype.toString = function() {
      return "" + this.path + " (" + this.index + ": " + this.pattern;
    };

    return File;

  })();

  GlobArrayRun = (function() {
    function GlobArrayRun(array, opts, callback) {
      var globFns,
        _this = this;

      this.array = array;
      this.opts = opts != null ? opts : {};
      this.callback = callback;
      if (typeof this.callback !== 'function') {
        throw "Callback required";
      }
      if (typeof this.array === 'string') {
        return glob(this.array, this.opts, this.callback);
      }
      if (!(this.array instanceof Array)) {
        return this.callback("Array required");
      }
      _.bindAll(this);
      this.items = [];
      globFns = [];
      _.each(this.array, function(str, i) {
        if (str.match(/^(\w+:)?\/\//)) {
          return _this.items.push(new File(str, str, i));
        } else {
          return globFns.push(_this.makeGlobFn(str, i));
        }
      });
      async.parallel(globFns, this.complete);
    }

    GlobArrayRun.prototype.makeGlobFn = function(pattern, i) {
      var _this = this;

      return function(callback) {
        return glob(pattern, _this.opts, function(error, matches) {
          var match, _i, _len;

          if (error !== null) {
            return callback(error);
          }
          for (_i = 0, _len = matches.length; _i < _len; _i++) {
            match = matches[_i];
            _this.items.push(new File(pattern, match, i));
          }
          return callback(null);
        });
      };
    };

    GlobArrayRun.prototype.complete = function() {
      var files, obj;

      obj = {};
      _.each(this.items, function(current) {
        var existing, path;

        path = current.path;
        existing = obj[path];
        if (existing) {
          return obj[path] = current.compare(existing);
        } else {
          return obj[path] = current;
        }
      });
      files = _.values(obj);
      files.sort(function(a, b) {
        if (a.index >= b.index) {
          return 1;
        } else {
          return -1;
        }
      });
      return this.callback(null, files.map(function(f) {
        return f.path;
      }));
    };

    return GlobArrayRun;

  })();

  globArray = function(array, opts, callback) {
    if (typeof opts === 'function' && callback === undefined) {
      callback = opts;
      opts = {};
    }
    new GlobArrayRun(array, opts, callback);
    return null;
  };

  module.exports = globArray;

}).call(this);