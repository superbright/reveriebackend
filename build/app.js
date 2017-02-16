'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _koa = require('koa');

var _koa2 = _interopRequireDefault(_koa);

var _api = require('./api');

var _api2 = _interopRequireDefault(_api);

var _koaViews = require('koa-views');

var _koaViews2 = _interopRequireDefault(_koaViews);

var _koaSocket = require('koa-socket');

var _koaSocket2 = _interopRequireDefault(_koaSocket);

var _koaBodyparser = require('koa-bodyparser');

var _koaBodyparser2 = _interopRequireDefault(_koaBodyparser);

var _kcors = require('kcors');

var _kcors2 = _interopRequireDefault(_kcors);

var _koaWebsocket = require('koa-websocket');

var _koaWebsocket2 = _interopRequireDefault(_koaWebsocket);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var io = new _koaSocket2.default();

//import config from './config';


var app = (0, _koaWebsocket2.default)(new _koa2.default()).use((0, _koaViews2.default)(__dirname + '/views', {
  map: {
    html: 'underscore'
  }
})).use((0, _kcors2.default)())
// .use(async (ctx, next) => {
//   ctx.state.collections = config.collections;
//   ctx.state.authorizationHeader = 'Key ' + config.key;
//   await next();
// })
.use((0, _koaBodyparser2.default)()).use(_api2.default.routes()).use(_api2.default.allowedMethods());

io.on('connection', function (ctx, data) {
  console.log('join event fired', data);
  io.broadcast('boop', {
    numConnections: io.connections.size
  });
});

io.on('message', function (ctx, data) {
  console.log('message: ' + data);
});
io.attach(app);
exports.default = app;