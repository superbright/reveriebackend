var gc = require('graphcommons');
var accesskey = "sk_fj5_UlUpdrmhx4dlN43Qxg";
var graph_id = "750107c0-4669-4245-97bc-6f0923ae95c2";

var callback = function(result) {
 console.log('log:', result);
}

var graphcommons = new gc(accesskey, callback);

log: { msg: 'Working' }
var graphcallback = function(graph) {
    //console.log('log:', graph);
    console.log(" properties edges");
    console.log('edges: ', graph.edges.length);
    console.log(" properties nodes");
    console.log('nodes: ', graph.nodes.length);

    //All the other properties of the graph can be retrieved from
    console.log(" properties ----")
    //console.log(graph.properties);
 }

graphcommons.graphs(graph_id,graphcallback);
