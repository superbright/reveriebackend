import KoaRouter from 'koa-router';
import arangojs, {Database, aql} from 'arangojs';

const api = KoaRouter();

const config = {
  hosts: '54.210.52.93:3000'
}

let host = "192.168.99.100";
let port = 8529;
let databasename = 'theseed';
let username = 'seed';
let password = 's33d';

var db = arangojs({
  url: `http://${username}:${password}@${host}:${port}`,
  databaseName: databasename
});

// console.log(db.name);
// var worldsCollection =  db.collection("temp");
// worldsCollection.create().then(
//   () => console.log('Collection created'),
//   err => console.error('Failed to create collection:', err)
// );
//
// var doc = {
//   a: 'foo',
//   b: 'bar',
//   c: Date()
// };
//
// worldsCollection.save(doc).then(
//   meta => console.log('Document saved:', meta._rev),
//   err => console.error('Failed to save document:', err)
// );

api.get('/',
  async (ctx, next) => {
    // Reply with 201 Created when the item is saved
    await ctx.render('index', {
     user: 'John'
   });
  }
);

// Get details of universe
api.get('/getUniverse/:universe',
  async(ctx,next) => {
      const { universe } = ctx.params;
      const { transform } = ctx.req
      try {
        var universeCollection = db.collection(universe);
        await universeCollection.all().then(result => {
          ctx.body = result._result;
          ctx.status = 200;
        });

      } catch (err) {
        console.log(err.response.body);
      }
  }
);

api.get('/getPlanets/:universe',
  async(ctx, next) => {
    const { universe } = ctx.params;

    try {
      var graphx = db.graph(universe);
      await graphx.get().then(data => {
          // data contains general information about the graph
      });

      await graphx.traversal('multiverse/838', {
        direction: 'outbound',
        graphName: universe,
       edgeCollection : 'contains',
      //  visitor: 'result.vertices.push(vertex);result.paths.push(path);',
        maxDepth: 1,
        order: 'preorder-expander',
        init: 'result.vertices = [];result.paths = []',
        uniqueness : {
           vertices : "global",
           edges : "global"
         }
      })
      .then(result => {
      //  console.log(result); // ['a', 'b', 'c', 'd']
        ctx.body = result.visited;
        ctx.status = 200;
      });

    } catch (err) {
      console.log(err.response.body);
    }
  }
);

api.put('/editObject/:objectid',
  async(ctx, next) => {
    const { objectid } = ctx.params;
    const { transform } = ctx.request.body;
    console.log(ctx.request.body);
    console.log()

    var keys = [objectid];
    let objectCollection = db.collection("objects");
    await objectCollection.lookupByKeys(keys).then(
      meta => {
        console.log(meta);
          ctx.body = meta;
      });
    ctx.status = 200;


  });

//add new object to a planet
api.post('/addObject/:planetid/:objectid',

  async(ctx, next) => {

    const { planetid } = ctx.params;
    const { objectid } = ctx.params;

    var edgedoccontainsobject = { };
    edgedoccontainsobject._from = 'universe/' + planetid;

    var docobject = {
      id: objectid,
      transformdata: [],
      c: Date()
    };

    try {

      let objectCollection = db.collection("objects");
      await objectCollection.save(docobject).then(meta => {
        edgedoccontainsobject._to = 'objects/' + meta._key;
      });

      let edgecollection = db.edgeCollection("contains");
      await edgecollection.save(edgedoccontainsobject)
        .then(edge => {
            console.log(edge);
        });
      ctx.body = edgedoccontainsobject;
      ctx.status = 200;

    } catch (err) {
      console.log(err);
      ctx.body = err.response.body;
    }
  }
);

api.post('/createPlanet/:planetcollectionname/:universecollectionname',
  async(ctx, next) => {
    const { name } = ctx.params;
    try {
      const { planetcollectionname } = ctx.params;
      const { universecollectionname } = ctx.params;
      console.log(universecollectionname);

      let edgedoccontainsplanet = { };
      let universecollection = db.collection(universecollectionname);
      let planetcollection = db.collection(planetcollectionname);
      let edgecollection = db.edgeCollection("contains");

      await universecollection.all().then(data => {
          // data contains general information about the graph
          console.log(data._result[0]._key);
          edgedoccontainsplanet._from = 'multiverse/' + data._result[0]._key;
      });

      let docplanet = {
        name: 'planet' + Math.floor((Math.random() * 1000) + 1),
        c: Date()
      };
      await planetcollection.save(docplanet).then(
          meta => {
        console.log("created room");
        edgedoccontainsplanet._to = 'universe/' + meta._key;
        });

      await edgecollection.save(edgedoccontainsplanet)
        .then(edge => {
            console.log(edge);
            ctx.body = edgedoccontainsplanet;
        });

        ctx.status = 200;

    } catch (err) {
      console.log(err);
      ctx.body = err.response.body;
    }
  });

api.post('/createUniverse/:name',
  async(ctx, next) => {
    const { name } = ctx.params;
    try {
      let worldsCollection = db.collection(name);
      console.log("name to create is " + name);
      await worldsCollection.create().then(() => {
          console.log("created worlds");
            ctx.status = 200;
        });

    } catch (err) {
      console.log(err);
      ctx.body = err.response.body;
    }
  }
);


export default api;
