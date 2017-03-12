import Koa from 'koa';
import api from './api';
import views from 'koa-views';
import IO from 'koa-socket';

//import config from './config';
import bodyParser from 'koa-bodyparser';
import cors from 'kcors';
import websockify from 'koa-websocket';

const io = new IO();

const app = websockify(new Koa())
.use(views(__dirname + '/views', {
  map: {
    html: 'underscore'
  }
})).use(cors())
  // .use(async (ctx, next) => {
  //   ctx.state.collections = config.collections;
  //   ctx.state.authorizationHeader = 'Key ' + config.key;
  //   await next();
  // })
  .use(bodyParser()) //{ enableTypes: ['json'] }
  .use(async (ctx, next) => {
    ctx.body = ctx.request.body;
    await next();
  }).use(api.routes())

  io.on( 'connection', ( ctx, data ) => {
    console.log( 'join event fired', data )
    io.broadcast( 'hello', {
      numConnections: io.connections.size
    });
  });

    io.on('dumb', ( ctx, data ) => {
      io.broadcast( 'hello', {
        message: "dumb"
      });
    });

  io.on('updateobject', ( ctx, data ) => {
    //console.log( `message: ${ data }` )
    api.updateObjectinPlanet(JSON.parse(data),io);
    io.broadcast( 'hello', {
      numConnections: io.connections.size
    });
  });
  io.attach( app )
export default app;
