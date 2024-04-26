import * as d3 from 'd3';
import { useEffect, useRef } from "react";
import { parseData } from "../app/dataParser/dataParser";
const width = 620;
const height = 320;
function drawGraph(data,svg) {
     // Initialize the links
     console.log(data);
  var link = svg
    .selectAll("line")
    .data(data.links)
    .enter()
    .append("line")
      .style("stroke", "#aaa")

  // Initialize the nodes
  const color = d3.scaleOrdinal(d3.schemeAccent);
  var node = svg
    .selectAll("circle")
    .data(data.nodes)
    .enter()
    .append("circle")
      .attr("r", (d)=> 5 + Math.sqrt(d.dom_score))
      .style("fill",(d)=>color(d.name))

  // Let's list the force we wanna apply on the network
  var simulation = d3.forceSimulation(data.nodes)                 // Force algorithm is applied to data.nodes
      .force("link", d3.forceLink()                               // This force provides links between nodes
            .id(function(d) { return d.id; })                     // This provide  the id of a node
            .links(data.links)                                    // and this the list of links
      )
      .force("charge", d3.forceManyBody().strength(-10000))         // This adds repulsion between nodes. Play with the -400 for the repulsion strength
      .force("center", d3.forceCenter(width / 2, height / 2))     // This force attracts nodes to the center of the svg area
      .on("end", ticked);

  // This function is run at each iteration of the force algorithm, updating the nodes position.
  function ticked() {
    link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node
         .attr("cx", function (d) { return d.x; })
         .attr("cy", function(d) { return d.y; });
  }}
  const buildGraphdata = (data,skyline,dominatedPoints,datasetNumericColumns) => {
    var nodes = [];
    var links = [];
    for(var i = 0; i < data.length; i++) {
        nodes.push({
            id:i,name:data[i].Player,
            dom_score:data[i].dom_score
        });
        for(var j = 0; j < data.length; j++) {
            if (i !==j)
                links.push({source:i,target:j});
        }
    }
    return {nodes:nodes,links:links};
}
function GraphView({props}) {


    let ref = useRef(null);
    useEffect(() => {
        let filteredData = [];

        const svg = d3.select(ref.current)
        parseData({limit:30}).then(({data,skyline,dominatedPoints,datasetNumericColumns}) => {
            let selectedpoints = Array.from({length: 4}, () => Math.floor(Math.random() * data.length));;
            for(var i of selectedpoints) {
                filteredData.push(data[i]);
            }
        
        drawGraph(buildGraphdata(filteredData,skyline,dominatedPoints,datasetNumericColumns),svg);
    });
    }, []);

  return (
    <div className="graphView">
      <h3>Graph View</h3>
      <svg id="graphSVG" ref = {ref}></svg>
    </div>
  );
}
function StackedBarGlyph() {
  
}
export default GraphView;
