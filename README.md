# dynamodb-json-translator
Browser/Node compatiblle libarary used for wrapping and unwrapping of DynamoDB AttributeValue to and from flat JSON


## Installation

```
npm install dynamodb-json-translator
npm test
```

## Usage

  - `Translator.toFlatJSON`
  - `Translator.toDynamoDBJSON`


### 1) from DynamoDB JSON to flat JSON:

```
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
console.log(translated)
// [
//   "the-string", 
//   434, 
//   true,
//   false, 
//   [ 23, false, "stuff" ], 
//   { "k1": "v1", "k2": 23 }
// ]
```

### 2) from flat JSON to DynamoDB:

```
var translated = Translate.toDynamoDBJSON(23)
console.log(translated)
// { "N": 23 }

```


## Description
Implemented DynamoDB type prefixes are:

- S - string
- N - number
- B - binary
- BOOL - boolean
- NULL - null(or undefined)
- SS - string set
- NS - number set
- BS - binary set
- L - list(list of attributes with DynamoDB types)
- M - map(identical to JSON map, no DynamoDB prefixes)

## Notes
  - Set types for SS, NS and BS are converted to DynamoDB format if and only if all values of the JSON array have the same type as the first element
  - Numeric ranges, string lengths and binary buffer behavior depends on the platform where they run
  - Decided to use 3rd party `Buffer` implementation against the intrinsic **NodeJS** because it is easier to make it run in the browser(the class used is from https://github.com/feross/buffer)