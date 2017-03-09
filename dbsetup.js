'use strict';
const src = './src/app';

import arangojs, {Database, aql} from 'arangojs';
import prompt from 'prompt';


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
  prompt.start();

  prompt.get(promptschema, function (err, result) {

    console.log('Command-line input received:');
    console.log('  ok: ' + result.whatsup + " data");

    switch(result.whatsup) {
      case "create":
        createMultiVerse();
      break;
      case "delete":
        destroyMultiVerse();
      break;
    }
  });

let host = "192.168.99.100";
let port = 8529;
let databasename = 'theseed';
let username = 'seed';
let password = 's33d';

let numofelements  = 3;

var db = arangojs({
  url: `http://${username}:${password}@${host}:${port}`,
  databaseName: databasename
});

// simple function to create dataset
async function createMultiVerse() {
 try {

    var edgedoccontainsuniverse = { data : 'data'};
    var edgedoccontainsplanet = { data : 'data'};
    var edgedoccontainsobject = { data : 'data'};
    //create multiverse
    var universecollection = db.collection("multiverse");
    await universecollection.create({
        waitForSync: true // always sync document changes to disk
    }).then( () => { console.log("created " + universecollection.name)});

    var planetscollection = db.collection("universe");
    await planetscollection.create({
        waitForSync: true // always sync document changes to disk
    }).then( () => { console.log("created " + planetscollection.name)});


    //create object listing
    var objectcollection = db.collection("objects");
    await objectcollection.create({
        waitForSync: true // always sync document changes to disk
    }).then( () => { console.log("created " + objectcollection.name)});

    //create edge collection
    var edgecollection = db.edgeCollection("contains");
    await edgecollection.create({
        waitForSync: true // always sync document changes to disk
    }).then( () => { console.log("created " + edgecollection.name)});

    var graph = db.graph('multiverse');
    await graph.create({
    edgeDefinitions: [
          {
              collection: 'contains',
              from: [
                  'multiverse','universe'
              ],
              to: [
                  'universe','objects'
              ]
          }
      ]
    }).then(data => {
        console.log("created graph " +  data.name);
        // data contains general information about the graph
    });

    var docuniverse = {
      a: 'universe',
      b: 'bar',
      c: Date()
    };

   //add a universe document
   await universecollection.save(docuniverse).then(
      meta => {
        console.log('Document saved:', meta._rev);
        console.log(meta);
        edgedoccontainsuniverse._from = 'multiverse/' + meta._key;

      } ,
      err => console.error('Failed to save document:', err)
    );



    for(let i = 0; i < numofelements; i ++ ) {
      let docplanet = {
        name: 'planet' + i,
        c: Date()
      };
         //add a universe document
         await planetscollection.save(docplanet).then(
            meta => {
              console.log('Document saved:', meta._rev);
              console.log(meta);
              edgedoccontainsuniverse._to = 'universe/' + meta._key;
              edgedoccontainsplanet._from = 'universe/' + meta._key;
            } ,
            err => console.error('Failed to save document:', err)
          );

          var docobject = {
              a: 'object' +i,
              b: 'bar',
              c: Date()
            };

          //add a obj document
          await objectcollection.save(docobject).then(
              meta => {
                console.log('Document saved:', meta._rev);
                console.log(meta);
                edgedoccontainsplanet._to = 'objects/' + meta._key;
              } ,
              err => console.error('Failed to save document:', err)
            );

            //  console.log(edgedoc);
              await edgecollection.save(edgedoccontainsplanet)
                .then(edge => {
                    console.log(edge);
                });
              await edgecollection.save(edgedoccontainsuniverse)
                .then(edge => {
                    console.log(edge);
                });

    }

  } catch(error) {
    console.error(error);
  }
}

// simple function to delete dataset
async function destroyMultiVerse() {

 try {
    await db.listCollections()
    .then(collections => {
        for(var i=0; i < collections.length; i++) {
          var collection = db.collection(collections[i].name);
          collection.drop()
          .then((col) => {
            console.log(collection.name + " droppped");
          });
        }
    });

    var graph = db.graph('multiverse');
    await graph.drop()
    .then(() => {
          console.log("droped graph");
    });
  } catch(error) {
    console.error(error);
  }
}


//
//
