# tokenize

Create streaming tokenizers with ease.

## Synopsis

```javascript
var test = require('tape')
var from = require('from')
var createTokenizer = require('./create-tokenizer')

test('createTokenizer', function (t) {
  var tokenizer = createTokenizer([
    ['letters', '[a-zA-Z]+'],
    ['number', '[0-9]+'],
  ])

  var expectedTokens = [
    ['letters', 'abc', 0],
    ['number', '123', 3],
    ['letters', 'wowneat', 6]
  ]

  tokenizer.on('data', function (token) {
    t.deepEqual(token, expectedTokens.shift())
  })

  tokenizer.on('error', function (err) {
    t.equal(err.position, 13)
    t.equal(err.message,
            'Invalid token at position 13: " and this stuff is an error"')
  })

  t.plan(expectedTokens.length + 2)

  from([
    'abc123',
    'wowneat',
    ' and this stuff is an error' // no pattern matches whitespace
  ]).pipe(tokenizer)
})
```

## License

MIT
