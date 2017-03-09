'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

// simple function to create dataset
var createMultiVerse = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
    var edgedoccontainsuniverse, edgedoccontainsplanet, edgedoccontainsobject, universecollection, planetscollection, objectcollection, edgecollection, graph, docuniverse, i, docplanet, docobject;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            edgedoccontainsuniverse = { data: 'data' };
            edgedoccontainsplanet = { data: 'data' };
            edgedoccontainsobject = { data: 'data' };
            //create multiverse

            universecollection = db.collection("multiverse");
            _context.next = 7;
            return universecollection.create({
              waitForSync: true // always sync document changes to disk
            }).then(function () {
              console.log("created " + universecollection.name);
            });

          case 7:
            planetscollection = db.collection("universe");
            _context.next = 10;
            return planetscollection.create({
              waitForSync: true // always sync document changes to disk
            }).then(function () {
              console.log("created " + planetscollection.name);
            });

          case 10:

            //create object listing
            objectcollection = db.collection("objects");
            _context.next = 13;
            return objectcollection.create({
              waitForSync: true // always sync document changes to disk
            }).then(function () {
              console.log("created " + objectcollection.name);
            });

          case 13:

            //create edge collection
            edgecollection = db.edgeCollection("contains");
            _context.next = 16;
            return edgecollection.create({
              waitForSync: true // always sync document changes to disk
            }).then(function () {
              console.log("created " + edgecollection.name);
            });

          case 16:
            graph = db.graph('multiverse');
            _context.next = 19;
            return graph.create({
              edgeDefinitions: [{
                collection: 'contains',
                from: ['multiverse', 'universe'],
                to: ['universe', 'objects']
              }]
            }).then(function (data) {
              console.log("created graph " + data.name);
              // data contains general information about the graph
            });

          case 19:
            docuniverse = {
              a: 'universe',
              b: 'bar',
              c: Date()
            };

            //add a universe document

            _context.next = 22;
            return universecollection.save(docuniverse).then(function (meta) {
              console.log('Document saved:', meta._rev);
              console.log(meta);
              edgedoccontainsuniverse._from = 'multiverse/' + meta._key;
            }, function (err) {
              return console.error('Failed to save document:', err);
            });

          case 22:
            i = 0;

          case 23:
            if (!(i < numofelements)) {
              _context.next = 37;
              break;
            }

            docplanet = {
              name: 'planet' + i,
              c: Date()
            };
            //add a universe document

            _context.next = 27;
            return planetscollection.save(docplanet).then(function (meta) {
              console.log('Document saved:', meta._rev);
              console.log(meta);
              edgedoccontainsuniverse._to = 'universe/' + meta._key;
              edgedoccontainsplanet._from = 'universe/' + meta._key;
            }, function (err) {
              return console.error('Failed to save document:', err);
            });

          case 27:
            docobject = {
              a: 'object' + i,
              b: 'bar',
              c: Date()
            };

            //add a obj document

            _context.next = 30;
            return objectcollection.save(docobject).then(function (meta) {
              console.log('Document saved:', meta._rev);
              console.log(meta);
              edgedoccontainsplanet._to = 'objects/' + meta._key;
            }, function (err) {
              return console.error('Failed to save document:', err);
            });

          case 30:
            _context.next = 32;
            return edgecollection.save(edgedoccontainsplanet).then(function (edge) {
              console.log(edge);
            });

          case 32:
            _context.next = 34;
            return edgecollection.save(edgedoccontainsuniverse).then(function (edge) {
              console.log(edge);
            });

          case 34:
            i++;
            _context.next = 23;
            break;

          case 37:
            _context.next = 42;
            break;

          case 39:
            _context.prev = 39;
            _context.t0 = _context['catch'](0);

            console.error(_context.t0);

          case 42:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 39]]);
  }));

  return function createMultiVerse() {
    return _ref.apply(this, arguments);
  };
}();

// simple function to delete dataset


var destroyMultiVerse = function () {
  var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
    var graph;
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;
            _context2.next = 3;
            return db.listCollections().then(function (collections) {
              for (var i = 0; i < collections.length; i++) {
                var collection = db.collection(collections[i].name);
                collection.drop().then(function (col) {
                  console.log(collection.name + " droppped");
                });
              }
            });

          case 3:
            graph = db.graph('multiverse');
            _context2.next = 6;
            return graph.drop().then(function () {
              console.log("droped graph");
            });

          case 6:
            _context2.next = 11;
            break;

          case 8:
            _context2.prev = 8;
            _context2.t0 = _context2['catch'](0);

            console.error(_context2.t0);

          case 11:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this, [[0, 8]]);
  }));

  return function destroyMultiVerse() {
    return _ref2.apply(this, arguments);
  };
}();

//
//


var _arangojs = require('arangojs');

var _arangojs2 = _interopRequireDefault(_arangojs);

var _prompt = require('prompt');

var _prompt2 = _interopRequireDefault(_prompt);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var src = './src/app';

var promptschema = {
  properties: {
    whatsup: {
      message: 'want to <create> or <delete> test data',
      required: true
    }
  }
};

//
// Start the prompt
//
_prompt2.default.start();

_prompt2.default.get(promptschema, function (err, result) {

  console.log('Command-line input received:');
  console.log('  ok: ' + result.whatsup + " data");

  switch (result.whatsup) {
    case "create":
      createMultiVerse();
      break;
    case "delete":
      destroyMultiVerse();
      break;
  }
});

var host = "192.168.99.100";
var port = 8529;
var databasename = 'theseed';
var username = 'seed';
var password = 's33d';

var numofelements = 3;

var db = (0, _arangojs2.default)({
  url: 'http://' + username + ':' + password + '@' + host + ':' + port,
  databaseName: databasename
});
