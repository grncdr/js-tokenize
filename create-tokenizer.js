var through = require('through2')

module.exports = createTokenizer

function createTokenizer (rules, maxLength) {
  rules = rules.map(function (rule) {
    var pattern = rule[1]
    if (!(pattern instanceof RegExp)) {
      if (pattern[0] != '^')
        pattern = '^' + pattern
      pattern = new RegExp(pattern)
    }
    return [rule[0], pattern]
  })

  if (maxLength == null) maxLength = 4096

  const ruleCount = rules.length
  var position = 0
  var remainder = ""

  var transform = through({objectMode: true}, tokenize, errIfRemaining)
  // Allow parsers to generate better errors
  transform.resetPosition = function () { position = 0 }
  return transform

  function tokenize (string, _, cb) {
    var subject = remainder + string
    if (subject.length > maxLength) {
      cb(new Error("Token exceeded maximum length of " + maxLength))
    }
    var token;
    debugger
    while (token = getToken(subject)) {
      this.push(token)
      var len = token[1].length
      subject = subject.slice(len)
      position += len
    }
    remainder = subject
    cb()
  }

  function getToken (subject) {
    for (var idx = 0; idx < ruleCount; idx++) {
      var name = rules[idx][0], rgx = rules[idx][1];
      var match = subject.match(rgx);
      if (match) {
        return [name, match[0], position]
      }
    }
  }

  function errIfRemaining (cb) {
    var err
    if (remainder.length) {
      err = new Error('Invalid token at position ' + position +
                      ': ' + JSON.stringify(remainder))
      err.position = position
    }
    cb(err)
  }
}
