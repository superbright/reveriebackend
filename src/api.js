import KoaRouter from 'koa-router';
import arangojs, {Database, aql} from 'arangojs';

const api = KoaRouter();

const config = {
  hosts: '54.210.52.93:3000'
}

//let host = "localhost";
let host = "8937fa04.ngrok.io";
let port = 80;
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

api.updateObjectinPlanet = async function(data,io) {

    const { objectid,transform,planetid } = data;
      let objectCollection = db.collection("objects");
      let planetcollection = db.collection("universe");

        await objectCollection.lookupByKeys([objectid]).then(
        meta => {
          //console.log("length " + meta.length);
          if(meta.length == 0) {
            return;
          }
          objectCollection.update(meta[0],{transform:transform}).then(doc1 => {
              //console.log("updated");
          }, err => console.error(err.stack));
        });

        // await planetcollection.lookupByKeys([planetid]).then(
        // meta => {
        //   if(meta.length == 0) {
        //     return;
        //   }
        //   var timeline = meta[0].timeline;
        //   timeline.push({
        //     timestap: Date.now(),
        //     objectid: objectid,
        //     transform: transform
        //   });
        //   planetcollection.update(meta[0], {timeline: timeline}).then(doc1 => {
        //     console.log("updated");
        //   }, err => console.error(err.stack));
        // });
}

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

api.get('/getObjects/:planetid',
async(ctx, next) => {
  const { planetid } = ctx.params;
  try {
    var graphx = db.graph("multiverse");
    await graphx.get().then(data => {
        // data contains general information about the graph
    });
    await graphx.traversal('universe/'+planetid, {
      direction: 'outbound',
      graphName: "multiverse",
      edgeCollection : 'contains',
    //  visitor: 'result.vertices.push(vertex);result.paths.push(path);',
      maxDepth: 1,
      order: 'preorder-expander',
      init: 'result.vertices = [];',
      uniqueness : {
         vertices : "global",
         edges : "none"
       }
    })
    .then(result => {
       console.log(result); // ['a', 'b', 'c', 'd']
      ctx.body = { data: result.visited.vertices,
        id: planetid
      };
      ctx.status = 200;
    });

  } catch (err) {
    console.log(err);
  }

});

api.get('/getPlanets/:universe',
  async(ctx, next) => {
    const { universe } = ctx.params;

    try {
      var graphx = db.graph(universe);
      await graphx.get().then(data => {
          // data contains general information about the graph
      });

      await graphx.traversal('multiverse/454', {
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
      console.log(err);
    }
  }
);



api.put('/editObject/:objectid',
  async(ctx, next) => {
    const { objectid } = ctx.params;
    const { transform } = ctx.request.body;

    var keys = [objectid];
    let objectCollection = db.collection("objects");
    await objectCollection.lookupByKeys(keys).then(
      meta => {
        console.log(meta[0]);
        objectCollection.update(meta[0],{transform:transform}).then(doc1 => {
            ctx.body = doc1;
        });
      });
      ctx.status = 200;
});


//add new object to a planet
api.post('/deleteObject/:objectid',

  async(ctx, next) => {

  //  const { planetid } = ctx.params;
    const { objectid } = ctx.params;

    var graph = db.graph("multiverse");
    await graph.get().then(data => {
        // data contains general information about the graph
    });

    var collection = graph.vertexCollection('objects');
    collection.remove(objectid)
    .then(() => {
        console.log('ok destroyed');
        ctx.body = "ok";
        ctx.status = 200;
        // document 'vertices/some-key' no longer exists
    });
}
);

//add new object to a planet
api.post('/addObject/:planetid/:objectid',

  async(ctx, next) => {

    const { planetid } = ctx.params;
    const { objectid } = ctx.params;

    var edgedoccontainsobject = { };
    edgedoccontainsobject._from = 'universe/' + planetid;

    var docobject = {
      assetid: objectid,
      transform: {},
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
            console.log("Added");
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

    try {

      console.log(ctx.body);

      const { planetcollectionname } = ctx.params;
      const { universecollectionname } = ctx.params;
      const { name } = ctx.body;

      console.log(name);

      let edgedoccontainsplanet = { };
      let universecollection = db.collection(universecollectionname);
      let planetcollection = db.collection(planetcollectionname);
      let edgecollection = db.edgeCollection("contains");

      let data = await planetcollection.byExample({name:name});

      console.log(data._result.length);

      if(data._result.length > 0) {
        //ctx.body = {error: "name exists"};
        return ctx.throw(400, 'Name Exists');
      } else {
          await universecollection.all().then(data => {
              edgedoccontainsplanet._from = 'multiverse/' + data._result[0]._key;
          });

          let docplanet = {
            name: name,
            timeline: [],
            c: Date()
          };

          var planetobj = {};

          await planetcollection.save(docplanet).then(
              meta => {
                planetobj = meta;
                planetobj.name = name;
            edgedoccontainsplanet._to = 'universe/' + meta._key;
          });

          await edgecollection.save(edgedoccontainsplanet)
            .then(edge => {
                ctx.body = planetobj;
            });
      }
        //ctx.status = 200;

    } catch (err) {
      console.log(err);
      ctx.body = err.response.body;
    }
  });

// api.post('/createUniverse/:name',
//   async(ctx, next) => {
//     const { name } = ctx.params;
//     try {
//       let worldsCollection = db.collection(name);
//     //  console.log("name to create is " + name);
//       await worldsCollection.create().then(() => {
//         //  console.log("created worlds");
//             ctx.status = 200;
//         });
//
//     } catch (err) {
//       console.log(err);
//       ctx.body = err.response.body;
//     }
//   }
// );


export default api;
