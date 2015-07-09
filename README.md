# dynamodb-json-translator
Browser/Node compatiblle libarary used for wrapping and unwrapping of DynamoDB AttributeValue to and from flat JSON


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

## Notes
  - SS, NS and BS are converted to DynamoDB format if and only if all values of the JSON array have the same type as the first element