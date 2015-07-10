var assert = require('assert');
var Buffer = require('buffer/').Buffer;
var Translator = require('../src/main.js');

describe('Translator', function() {
  describe('toFlatJSON', function () {
    // NULL—Null
    it('should decode NULL(Null type)', function () {
      var expected = null
      var input = {'NULL': null}
      var translated = Translator.toFlatJSON(input)
      assert.equal(translated, expected)
    })
    // BOOL—Boolean
    it('should decode BOOL(Boolean type)', function () {
      var expected_t = true
      var input_t = {'BOOL': true}
      var translated_t = Translator.toFlatJSON(input_t)
      assert.equal(translated_t, expected_t)
      var expected_f = false
      var input_f = {'BOOL': false}
      var translated_f = Translator.toFlatJSON(input_f)
      assert.equal(translated_f, expected_f)
    })
    // N—Number
    it('should decode N(Number type)', function () {
      var expected = 234
      var input = {'N': 234}
      var translated = Translator.toFlatJSON(input)
      assert.equal(translated, expected)
    })
    // S—String
    it('should decode S(String type)', function () {
      var expected = 'ana-has-apples'
      var input = {'S': 'ana-has-apples'}
      var translated = Translator.toFlatJSON(input)
      assert.equal(translated, expected)
    })
    // B—Binary
    it('should decode B(Binary type)', function () {
      var expected = new Buffer('xtguv', 'utf8')
      var input = {'B': 'xtguv'}
      var translated = Translator.toFlatJSON(input)
      assert.ok(expected.equals(translated))
    })
    // NS—Number set
    it('should decode NS(Number set type)', function () {
      var expected = [3, 4, 0xff00ff, 44]
      var input = {'NS': [3, 4, 0xff00ff, '44']}
      var translated = Translator.toFlatJSON(input)
      assert.deepEqual(translated, expected)
    })
    // SS—String set
    it('should decode SS(String set type)', function () {
      var expected = ['str1', 'str2', 'str3', '44']
      var input = {'SS': ['str1', 'str2', 'str3', 44]}
      var translated = Translator.toFlatJSON(input)
      assert.deepEqual(translated, expected)
    })
    // BS—Binary set
    it('should decode BS(Binary set type)', function () {
      var expected = [new Buffer('3', 'utf8'), new Buffer('buffer', 'utf8')]
      var input = {'BS': [new Buffer('3', 'utf8'), new Buffer('buffer', 'utf8')]}
      var translated = Translator.toFlatJSON(input)
      var allEqual = true
      for (var i in translated) {
        if (!expected[i].equals(translated[i])) {
          allEqual = false
          break
        }
      }
      assert.ok(allEqual, 'Buffers are not equal')
    })
    // M—Map
    it('should decode M(Map type)', function () {
      var expected = { 
        'keyN': 32, 
        'keyS': 'the-string', 
        'bool': true, 
        'array': [1,2,3], 
        'map': { 'k1': 'v1' }
      }
      var translated = Translator.toFlatJSON({
        'M': { 
          'keyN': { 'N': 32 },
          'keyS': { 'S': 'the-string' },
          'bool': { 'BOOL': true },
          'array': { 'L': [ {'N':1}, {'N':2}, {'N':3}] },
          'map': { 'M': { 'k1': {'S': 'v1'} } }
        }
      })
      assert.deepEqual(translated, expected)
    })
    // L—List
    it('should decode L(List type)', function () {
      var expected = [
        'the-string', 
        434, 
        true, 
        false, 
        [ 23, false, 'stuff' ], 
        { 'k1': 'v1', 'k2': 23 }
      ]
      var translated = Translator.toFlatJSON({
        'L': [ 
          {'S': 'the-string'}, 
          {'N': 434}, 
          {'BOOL': true}, 
          {'BOOL': false}, 
          {
            'L': [
              {'N': 23}, 
              {'BOOL': false}, 
              {'S': 'stuff'}
            ]
          },
          {
            'M': {
              'k1': {'S': 'v1'},
              'k2': {'N': 23}
            }
          }
        ]
      })
      assert.deepEqual(translated, expected)
    })
    // Any
    it('should decode any value', function () {
      var expected = {
        'country_name': 'Romania',
        'country_code': 'RO',
        'contacts': [
          {
            'email': 'user.name@company.com',
            'name': 'User Name',
            'phone': '0032479236191'
          },
          {
            'email': 'john.doe@company.com',
            'name': 'John Doe',
            'phone': '0040724000000'
          }
        ],
        'gta_customer_id': '1005605042671477000999',
        'timestamp': 1435323290
      }
      var input = {
        'M': {
          'country_name': {
            'S': 'Romania'
          },
          'country_code': {
            'S': 'RO'
          },
          'contacts': {
            'L': [
              {
                'M': {
                  'email': {
                    'S': 'user.name@company.com'
                  },
                  'name': {
                    'S': 'User Name'
                  },
                  'phone': {
                    'S': '0032479236191'
                  }
                }
              },
              {
                'M': {
                  'email': {
                    'S': 'john.doe@company.com'
                  },
                  'name': {
                    'S': 'John Doe'
                  },
                  'phone': {
                    'S': '0040724000000'
                  }
                }
              }
            ]
          },
          'gta_customer_id': {
            'N': '1005605042671477000999'
          },
          'timestamp': {
            'N': 1435323290
          }
        }
      }
      var translated = Translator.toFlatJSON(input)
      assert.deepEqual(translated, expected)
    })
    
  })
})

describe('Translator', function() {
  describe('toDynamoDBJSON', function () {
    // NULL—null or undefined
    it('should encode NULL(Null type)', function () {
      var expected, input, translated
      // null
      expected = { 'NULL': null }
      input = null
      translated = Translator.toDynamoDBJSON(input)
      assert.deepEqual(translated, expected)
      // undefined
      expected = { 'NULL': null }
      input = undefined
      translated = Translator.toDynamoDBJSON(input)
      assert.deepEqual(translated, expected)
    })
    // BOOL-Boolean
    it('should encode BOOL(Boolean type)', function () {
      var expected, input, translated
      // true
      expected = { 'BOOL': true }
      input = true
      translated = Translator.toDynamoDBJSON(input)
      assert.deepEqual(translated, expected)
      // false
      expected = { 'BOOL': false }
      input = false
      translated = Translator.toDynamoDBJSON(input)
      assert.deepEqual(translated, expected)
    })
    // N—Number
    it('should encode N(Number type)', function () {
      var expected = { 'N': 32 }
      var input = 32
      var translated = Translator.toDynamoDBJSON(input)
      assert.deepEqual(translated, expected)
    })
    // S—String
    it('should encode S(String type)', function () {
      var expected = { 'S': 'ana-has-apples' }
      var input = 'ana-has-apples'
      var translated = Translator.toDynamoDBJSON(input)
      assert.deepEqual(translated, expected)
    })
    // B—Buffer
    it('should encode B(Binary type)', function () {
      var expected = { 'B': new Buffer('ana-has-apples') }
      var input = new Buffer('ana-has-apples')
      var translated = Translator.toDynamoDBJSON(input)
      assert.ok(expected.B.equals(translated.B), 'Encoded buffers are not equal')
    })
    // NS—Number set
    it('should encode NS(Number set type)', function () {
      var expected = { 'NS': [1, 3, 7] }
      var input = [1, 3, 7]
      var translated = Translator.toDynamoDBJSON(input)
      assert.deepEqual(translated, expected)
    })
    // SS—String set
    it('should encode SS(String set type)', function () {
      var expected = { 'SS': ['ana', 'has', 'apples'] }
      var input = ['ana', 'has', 'apples']
      var translated = Translator.toDynamoDBJSON(input)
      assert.deepEqual(translated, expected)
    })
    // BS—Binary set
    it('should encode BS(Binary set type)', function () {
      var expected = { 'BS': [
        new Buffer('ana', 'utf8'), 
        new Buffer('has', 'utf8'), 
        new Buffer('apples', 'utf8')
      ]}
      var input = [
        new Buffer('ana', 'utf8'), 
        new Buffer('has', 'utf8'), 
        new Buffer('apples', 'utf8')
      ]
      var translated = Translator.toDynamoDBJSON(input)
      var allEqual = true
      for (var i in translated['BS']) {
        if (!expected['BS'][i].equals(translated['BS'][i])) {
          allEqual = false
          break
        }
      }
      assert.ok(allEqual, 'Buffers are not equal')
    })
    // M—Map
    it('should encode M(Map type)', function () {
      var expected = { 
        'M': {
            'k1': {'S': 'v1'},
            'k2': { 
              'M': {
                'n': {'N':23},
                'b': {'BOOL':true},
                's': {'S':'str'}
              }
            }
        }
      }
      var input = {
        'k1': 'v1', 
        'k2': { 
          'n': 23, 
          'b': true, 
          's': 'str'
        }
      }
      var translated = Translator.toDynamoDBJSON(input)
      assert.deepEqual(translated, expected)
    })
    // L—List
    it('should encode L(List type)', function () {
      var expected = { 
        'L': [ 
          {'N': 23}, 
          {'S': 'my-string'}, 
          {'BOOL': true}, 
          {'BOOL': false}, 
          {'M': {'x1':{'N':23.3}, 'y1':{'N':12.75}}}
        ]
      }
      var input = [23, 'my-string', true, false, {'x1':23.3, 'y1':12.75}]
      var translated = Translator.toDynamoDBJSON(input)
      assert.deepEqual(translated, expected)
    })
    // Any
    it('should encode any value', function () {
      var expected = {
        'M': {
          'country_name': {
            'S': 'Romania'
          },
          'country_code': {
            'S': 'RO'
          },
          'contacts': {
            'L': [
              {
                'M': {
                  'email': {
                    'S': 'user.name@company.com'
                  },
                  'name': {
                    'S': 'User Name'
                  },
                  'phone': {
                    'S': '0032479236191'
                  }
                }
              },
              {
                'M': {
                  'email': {
                    'S': 'john.doe@company.com'
                  },
                  'name': {
                    'S': 'John Doe'
                  },
                  'phone': {
                    'S': '0040724000000'
                  }
                }
              }
            ]
          },
          'gta_customer_id': {
            'N': 1005605042671477000
          },
          'timestamp': {
            'N': 1435323290
          }
        }
      }
      var input = {
        'country_name': 'Romania',
        'country_code': 'RO',
        'contacts': [
          {
            'email': 'user.name@company.com',
            'name': 'User Name',
            'phone': '0032479236191'
          },
          {
            'email': 'john.doe@company.com',
            'name': 'John Doe',
            'phone': '0040724000000'
          }
        ],
        'gta_customer_id': 1005605042671477000,
        'timestamp': 1435323290
      }
      var translated = Translator.toDynamoDBJSON(input)
      assert.deepEqual(translated, expected)
    })
  })
})

describe('Translator', function() {
  describe('getJSTypeOf', function () {
    // undefined
    it('should return "undefined" for undefined input', function () {
      var expected = "undefined", input = undefined
      var detected = Translator.getJSTypeOf(input)
      assert.equal(detected, expected)
    })
    // null
    it('should return "null" for null input', function () {
      var expected = "null", input = null
      var detected = Translator.getJSTypeOf(input)
      assert.equal(detected, expected)
    })
    // Boolean
    it('should return "boolean" for Boolean input', function () {
      var expected = "boolean", input = true
      var detected = Translator.getJSTypeOf(input)
      assert.equal(detected, expected)
    })
    // Number
    it('should return "number" for Number input', function () {
      var expected = "number", input = 34
      var detected = Translator.getJSTypeOf(input)
      assert.equal(detected, expected)
    })
    // String
    it('should return "string" for String input', function () {
      var expected = "string", input = "a-string-input"
      var detected = Translator.getJSTypeOf(input)
      assert.equal(detected, expected)
    })
    // Array
    it('should return "array" for Array input', function () {
      var expected = "array", input = [1, 2, 3, 4]
      var detected = Translator.getJSTypeOf(input)
      assert.equal(detected, expected)
    })
    // uint8array
    it('should return "uint8array" for Buffer input', function () {
      var expected = "uint8array", input = new Buffer('abcd', 'utf8')
      var detected = Translator.getJSTypeOf(input)
      assert.equal(detected, expected)
    })
    // Object
    it('should return "object" for Object input', function () {
      var expected = "object", input = {'k': 'v'}
      var detected = Translator.getJSTypeOf(input)
      assert.equal(detected, expected)
    })
  })
})