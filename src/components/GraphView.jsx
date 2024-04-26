import * as d3 from 'd3';
import { useEffect, useRef } from "react";
import { parseData,calculateExclusiveDominantionScores } from "../app/dataParser/dataParser";
const width = 800;
const height = 320;
function drawGraph(data, svg) {
  // Initialize the links
  var link = svg.selectAll(".link")
      .data(data.links)
      .enter()
      .append("g")
      .attr("class", "link");

  // Initialize the nodes
  const color = d3.scaleOrdinal(d3.schemeAccent);
  var node = svg.selectAll("circle")
      .data(data.nodes)
      .enter()
      .append("circle")
      .attr("r", d => 10 + Math.sqrt(d.dom_score))
      // .style("fill", "none")
      .style("fill", d => color(d.id));

  // Let's list the force we wanna apply on the network
  var simulation = d3.forceSimulation(data.nodes)
      .force("link", d3.forceLink()
          .id(d => d.id)
          .links(data.links)
      )
      .force("charge", d3.forceManyBody().strength(-10000))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .on("tick", ticked)
      .on("end", ended);
  // This function is run at each iteration of the force algorithm, updating the nodes and links position.
  function ended() {
      // Update link positions
      link.each(function(d) {
        const barsData = axis2d(d);
        console.log('inbards',d,barsData)
        d3.select(this)
            .selectAll(".bar")
            .data(barsData)
            .enter()
            .append("line")
            .attr("class", "bar")
            .attr("stroke-width", 5)
            
            .attr("stroke",d => color(d.id))
            .attr("x1", d => d.x1)
            .attr("y1", d => d.y1)
            .attr("x2", d => d.x2)
            .attr("y2", d => d.y2)
            .attr("stroke-linecap", "round")
      });

     
  }
  function ticked(){
     // Update node positions
     node.attr("cx", d => d.x)
     .attr("cy", d => d.y);
  }
}


  const buildGraphdata = (skyline,dominatedPoints,datasetNumericColumns) => {
    var nodes = [];
    var links = [];
    for(var i = 0; i < skyline.length; i++) {
        nodes.push({
            id:i,
            name:skyline[i].Player,
            dom_score:skyline[i].dom_score
        });
        for(let j = i; j < skyline.length; j++) {
            if (i !==j)
                links.push({
                  source:i,
                  target:j,
                  dom_score:calculateExclusiveDominantionScores(dominatedPoints, skyline[i].id,skyline[j].id)
                });
        }
    }
    console.log(dominatedPoints)
    console.log("links",links)
    return {nodes:nodes,links:links};
}
function GraphView(props) {


    let ref = useRef(null);
    useEffect(() => {
        let filteredSkyline = [];
        const svg = d3.select(ref.current)
        parseData({limit:30}).then(({_,skyline,dominatedPoints,datasetNumericColumns}) => {
 
            for(var i of props.selectedpoints) {
                filteredSkyline.push(skyline[i]);
            }

        drawGraph(buildGraphdata(filteredSkyline,dominatedPoints,datasetNumericColumns),svg);
    });
    }, [props.selectedpoints]);

  return (
    <div className="graphView" key = {props.selectedpoints}>
      <h3>Graph View</h3>
      <svg id="graphSVG" ref = {ref}></svg>
    </div>
  );
}
function axis2d(links) {
  const margin = 0.15; // Adjust the margin as needed

  const x1 = links.target.x;
  const y1 = links.target.y;
  const x2 = links.source.x;
  const y2 = links.source.y;
  const dom_score = links.dom_score;
  
  const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  const theta = Math.atan2(y2 - y1, x2 - x1);
  const domscore_sum = d3.sum(dom_score);
  const lerps = dom_score.map(d => d / domscore_sum);
  // const lerps = [0.5,0.5];
  const scaledX1 = x1 + margin * length * Math.cos(theta);
  const scaledY1 = y1 + margin * length * Math.sin(theta);
  const scaledX2 = x2 - margin * length * Math.cos(theta);
  const scaledY2 = y2 - margin * length * Math.sin(theta);

  const ret = [{
    x1: scaledX1,
    y1: scaledY1,
    x2: scaledX1 + lerps[0] * (1-2*margin) * length * Math.cos(theta),
    y2: scaledY1 + lerps[0] * (1-2*margin) * length * Math.sin(theta),
    id: links.target.id,
    
  }, {
    x1: scaledX1 + lerps[0]* (1-2*margin) * length * Math.cos(theta),
    y1: scaledY1 + lerps[0] * (1-2*margin) * length * Math.sin(theta),
    x2: scaledX2,
    y2: scaledY2,
    id: links.source.id,
  }];

  return ret;
}

export default GraphView;
