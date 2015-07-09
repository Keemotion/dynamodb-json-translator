(function(name, definition) {
  
  // Important NOTE
  // In browsers, binary types must use a 3rd party Buffer implementation,
  // the recommended one is from https://github.com/feross/buffer
  
  if (typeof module != 'undefined') {
    var Buffer = require('buffer/').Buffer;
    // CommonJS - NodeJS
    module.exports = definition(Buffer);
  } else if (typeof define == 'function' && typeof define.amd == 'object') {
    // AMD - RequireJS(Buffer class must be exposed as AMD)
    define(['Buffer'], definition);
  } else {
    // Global - Browser(Buffer class should exists globally)
    this[name] = definition(this.Buffer);
  }
  
}('mod', function(Buffer) {
  
  var Deserializers = {
       'S': function(v) { return String(v); },
       'N': function(v) { return Number(v); },
       'B': function(v) { return new Buffer(v, 'utf8'); },
    'BOOL': function(v) { return v ? true : false; },
    'NULL': function(v) { return null; },
      'SS': function(v) { return v.map(function(it) { return String(it); }); },
      'NS': function(v) { return v.map(function(it) { return Number(it); }); },
      'BS': function(v) { return v.map(function(it) { return new Buffer(it, 'utf8'); }); },
       'L': function(v) { return v.map(function(it) { return Translator.toFlatJSON(it); }); },
       'M': function(v) { return v; }
  };
  
  var Serializers = {
     'undefined': function(v) { return {'NULL': null}; },
          'null': function(v) { return {'NULL': null}; },
       'boolean': function(v) { return {'BOOL': v}; },
        'number': function(v) { return {'N': v}; },
        'string': function(v) { return {'S': v}; },
         'array': function(v) {
            // check if every element is Number => NS
            // check if every element is String => SS
            // check if every element is Binary => BS
            // else => L
            var numbers = v.filter(function(it) { return Translator.getJSTypeOf(it) === 'number'; });
            var strings = v.filter(function(it) { return Translator.getJSTypeOf(it) === 'string'; });
            var buffers = v.filter(function(it) { return Buffer.isBuffer(it); });
            // check if only numbers
            if (numbers.length === v.length) {
              return {'NS': numbers};
            } else if (strings.length === v.length) {
              return {'SS': strings};
            } else if (buffers.length === v.length) {
              return {'BS': buffers};
            } else {
              var values = v.map(function(it) { return Translator.toDynamoDBJSON(it); });
              return {'L': values};
            }
         },
    'uint8array': function(v) { return {'B': v}; },
        'object': function(v) { return Buffer.isBuffer(v) ? {'B': v} : {'M': v}; }
  };
  
  var Translator = {
    /**
     * Convert to flat JSON from DynamoDB json
     *
     * @param {mixed} input - DynamoDB JSON value
     */
    toFlatJSON: function(input) {
      if (typeof input !== 'object') {
        throw new Error('Invalid input, only objects are allowed');
      }
      var keys = Object.keys(input);
      if (keys.length === 0) {
        throw new Error('Invalid input, object has no attributes');
      }
      var typeSymbol = keys[0];
      if (typeSymbol in Deserializers) {
        return Deserializers[typeSymbol](input[typeSymbol]);
      } else {
        throw new Error('Unsupported deserialzier type: ' + typeSymbol);
      }
      return result;
    },
    /**
     * Convert to DynamoDB json from flat JSON
     *
     * @param {mixed} input - flat JSON value
     */
    toDynamoDBJSON: function(input) {
      var tof = Translator.getJSTypeOf(input);
      if (tof in Serializers) {
        return Serializers[tof](input);
      } else {
        throw new Error('Type is not supported');
      }
    },
    getJSTypeOf: function(val) {
      return Object.prototype.toString.call(val).replace(/^\[object (.+)\]$/, '$1').toLowerCase();
    }
  };
  
  return Translator;
}));