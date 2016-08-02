var test = require('tape')
var EventTarget = require('dom-event-target')
var OpStream = require('../')

test('basic insert/delete', function (t) {
  t.plan(1)

  var ta = new EventTarget()
  var stream = OpStream(ta)
  var ops = []

  ta.value = '1'
  ta.send('input')

  ta.value = '13'
  ta.send('input')

  ta.value = '123'
  ta.send('input')

  ta.value = '23'
  ta.send('input')

  stream.on('data', function (data) {
    ops.push(data)
  })

  process.nextTick(function () {
    t.deepEqual(ops, [
      {op: 'insert', pos: 0, str: '1'},
      {op: 'insert', pos: 1, str: '3'},
      {op: 'insert', pos: 1, str: '2'},
      {op: 'delete', pos: 0, count: 1}
    ])
  })
})

test('multiple insertions', function (t) {
  t.plan(1)

  var ta = new EventTarget()
  var stream = OpStream(ta)
  var ops = []

  ta.value = '123'
  ta.send('input')

  ta.value = '^123$'
  ta.send('input')

  stream.on('data', function (data) {
    ops.push(data)
  })

  process.nextTick(function () {
    t.deepEqual(ops, [
      {op: 'insert', pos: 0, str: '123'},
      {op: 'insert', pos: 3, str: '$'},
      {op: 'insert', pos: 0, str: '^'}
    ])
  })
})

test('deletions come before insertions', function (t) {
  // ..also, deletion 'pos's should go highest to lowest

  t.plan(1)

  var ta = new EventTarget()
  var stream = OpStream(ta)
  var ops = []

  ta.value = 'hello world!'
  ta.send('input')

  ta.value = 'goodbye world'
  ta.send('input')

  stream.on('data', function (data) {
    ops.push(data)
  })

  process.nextTick(function () {
    t.deepEqual(ops, [
      {op: 'insert', pos: 0, str: 'hello world!'},
      {op: 'delete', pos: 11, count: 1},
      {op: 'delete', pos: 2, count: 3},
      {op: 'delete', pos: 0, count: 1},
      {op: 'insert', pos: 0, str: 'goodby'}
    ])
  })
})
