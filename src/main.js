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
  
  if (typeof Buffer === 'undefined') {
    throw new Error('Cannot continue without a binary Buffer implementation')
  }
  
  function deserializeMap(m) {
    var items = {};
    var keys = Object.keys(m);
    items = keys.reduce(function(object, key) {
      object[key] = Translator.toFlatJSON(m[key]);
      return object;
    }, {});
    return items;
  }
  
  function serializeMap(m) {
    var items = {'M': {}};
    var keys = Object.keys(m);
    items['M'] = keys.reduce(function(object, key) {
      object[key] = Translator.toDynamoDBJSON(m[key]);
      return object;
    }, {});
    return items;
  }
  
  var Deserializers = {
       'S': function(v) { return String(v); },
       'N': function(v) { return typeof v === 'string' ? v : Number(v); },
       'B': function(v) { return new Buffer(v, 'utf8'); },
    'BOOL': function(v) { return v ? true : false; },
    'NULL': function(v) { return null; },
      'SS': function(v) { return v.map(function(it) { return String(it); }); },
      'NS': function(v) { return v.map(function(it) { return typeof it === 'string' ? it : Number(it); }); },
      'BS': function(v) { return v.map(function(it) { return new Buffer(it, 'utf8'); }); },
       'L': function(v) { return v.map(function(it) { return Translator.toFlatJSON(it); }); },
       'M': function(v) { return deserializeMap(v); }
  };
  
  var Serializers = {
     'undefined': function(v) { return {'NULL': null}; },
          'null': function(v) { return {'NULL': null}; },
       'boolean': function(v) { return {'BOOL': v}; },
        'number': function(v) { return {'N': String(v)}; },
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
              return {'L': v.map(function(it) { return Translator.toDynamoDBJSON(it); })};
            }
         },
    'uint8array': function(v) { return {'B': v}; },
        'object': function(v) { return Buffer.isBuffer(v) ? {'B': v} : serializeMap(v); }
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