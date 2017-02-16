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
  .use(bodyParser({ enableTypes: ['json'] }))
  .use(api.routes());
  //.use(api.allowedMethods());

  app.use(async (ctx, next) => {
    ctx.body = ctx.request.body;
    console.log(ctx.request.body);
    await next();
  });
//
// app.use(ctx => {
//   console.log(ctx.request.body);
//   // the parsed body will store in this.request.body
//   // if nothing was parsed, body will be an empty object {}
//
//    await next();
// });

  io.on( 'connection', ( ctx, data ) => {
    console.log( 'join event fired', data )
    // io.broadcast( 'boop', {
    //   numConnections: io.connections.size
    // });
  })

  io.on( 'message', ( ctx, data ) => {
  console.log( `message: ${ data }` )
})
  io.attach( app )
export default app;
