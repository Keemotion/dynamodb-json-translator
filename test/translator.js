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
          'keyN': 32,
          'keyS': 'the-string',
          'bool': true, 
          'array': [1, 2, 3], 
          'map': {'k1': 'v1'}
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
              'k1': 'v1',
              'k2': 23
            }
          }
        ]
      })
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
            'k1': 'v1', 
            'k2': { 
              'n': 23, 
              'b': true, 
              's': 'str' 
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
          {'M': {'x1':23.3, 'y1':12.75}}
        ]
      }
      var input = [23, 'my-string', true, false, {'x1':23.3, 'y1':12.75}]
      var translated = Translator.toDynamoDBJSON(input)
      assert.deepEqual(translated, expected)
    })
  })
})