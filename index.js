/* colorlogger.js */
/*
*  author: Ran
*  des: make terminal log more corlorful~
*/

var fs   = require('fs');
var util = require('util');
var Promise = Promise || require('bluebird');

// custom logger
var log = function () {
  var copy = arguments;
  process.stdout.write(
    Array.prototype.reduce.call(copy, function (a, b, i) {
      if (!i) return "" + b;
      return a + " " + b;
    }, ''));
};

/* hash code for background and font */
var _hash = {
  'b': 4,
  'f': 3
};

var styleSelector = {
  'close': '\33[0m',
  'clean': '\33[2J',
  'highlight': '\33[1m',
  'underline': '\33[4m'
};

/* cache the custom style */
var _style = '';

/*
*  colorSelector['red']('b') // background color red
*  colorSelector['red']('f') // font color red
*/
var colorSelector = {
  'black': function (n) {
    return '\33[' + _hash[n] + '0m';
  },
  'red': function (n) {
    return '\33[' + _hash[n] + '1m';
  },
  'green': function (n) {
    return '\33[' + _hash[n] + '2m';
  },
  'yellow': function (n) {
    return '\33[' + _hash[n] + '3m';
  },
  'blue': function (n) {
    return '\33[' + _hash[n] + '4m';
  },
  'pink': function (n) {
    return '\33[' + _hash[n] + '5m';
  },
  'cyan': function (n) {
    return '\33[' + _hash[n] + '6m';
  },
  'white': function (n) {
    return '\33[' + _hash[n] + '7m';
  }
};

var styleCtrl = function (styleName, on) {
  var style_1 = _style.slice(0, 4),
      style_2 = _style.slice(4, 8);
  if (typeof on == 'boolean' && !on) {
    if (style_1 == styleSelector[styleName])
      _style = _style.slice(4), style_1 = '';
    if (style_2 == styleSelector[styleName])
      _style = style_1 + _style.slice(4, 8);
  } else {
    if (style_1 != styleSelector[styleName] && style_2 != styleSelector[styleName])
      _style = styleSelector[styleName] + _style;
  }
  return this;
};

function Color() {
  this.logCache = '';
  this.lastLog = '';
}

Color.prototype = {
  log: function () {
    var copy = arguments;
    var length = Object.keys(copy).length;
    if (length) {
      copy[0] = _style + copy[0];
      copy[length - 1] += styleSelector.close + "\r\n";
      log.apply(null, copy);
      this.lastLog = Array.prototype.join.call(copy, ' ');
      this.logCache += this.lastLog;
    } else {
      log(_style+styleSelector.close+"\r\n");
    }
    return this;
  },
  colored: function (color, mod, override) {
    if (typeof mod == 'boolean' || mod == undefined)
      override = mod, mod = 'f';
    if (override) {
      var style_1 = _style.slice(0, 4),
          style_2 = _style.slice(4, 8);
      if (style_1.match(/^(\33\[1m)|(\33\[4m)$/))
        _style = style_1 + colorSelector[color](mod);
      if (style_2.match(/^(\33\[1m)|(\33\[4m)$/))
        _style = style_2 + colorSelector[color](mod);
      else
        _style = colorSelector[color](mod);
    } else {
      var colorName = colorSelector[color](mod);
      var pattern = '\\' + colorName.slice(0, 1) + '\\' + colorName.slice(1);
      if (!_style.match(RegExp(pattern)))
        _style += colorName;
    }
    return this;
  },
  default: function () {
    _style = '';
    return this;
  },
  clean: function () {
    console.log(styleSelector.clean);
    return this;
  },
  close: function () {
    console.log(styleSelector.close);
    return this;
  },
  save: function (dir, options) {
    options = options || {
      record: 'l',
      append: false
    };
    options.record = (options.record == 'l') ? this.lastLog : this.logCache;

    return new Promise(function(resolve, reject) {
      fs.writeFile(dir, options.record, {
        flag: options.append ? 'a' : 'w'
      }, function (err) {
        if (err) {
          return reject(err);
        } else {
          return resolve();
        }
      });
    });
  },
  load: function (dir) {
    return new Promise(function(resolve, reject) {
      fs.readFile(dir, function (err, buf) {
        if (err) {
          return reject(err);
        } else {
          return resolve(buf && buf.toString());
        }
      });
    });
  },
  highlight: function (on) {
    styleCtrl('highlight', on);
    return this;
  },
  underline: function (on) {
    styleCtrl('underline', on);
    return this;
  }
};

module.exports = Color;
