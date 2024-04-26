import * as d3 from 'd3';
import { UMAP } from 'umap-js';
import {parseData} from '../app/dataParser/dataParser';

function ProjectionView(props) {
  let radial_box;
  let x;
  let y;

  parseData().then(({data,skyline,dominatedPoints,datasetNumericColumns}) => {

          const filtered_skyline = skyline;
          const NumericalData = filtered_skyline.map(obj =>
              datasetNumericColumns.map(key => obj[key])
            );
          
          const NumericalDataWithKey = filtered_skyline.map(obj =>
              Object.fromEntries(
                  datasetNumericColumns.map(key => [key, obj[key]])
              )
          );

          const umap = new UMAP({nNeighbors: 15, nEpochs:100});

          const reducedData = umap.fit(NumericalData);
          
          const svg = d3.select("#projectionSVG");

          var width = svg.node().getBoundingClientRect().width;
          var height = svg.node().getBoundingClientRect().height;

          const xScale = d3.scaleLinear()
            .domain([d3.min(reducedData, d => d[0]), d3.max(reducedData, d => d[0])])
            .range([40, width - 40]); 
        
          const yScale = d3.scaleLinear()
            .domain([d3.min(reducedData, d => d[1]), d3.max(reducedData, d => d[1])])
            .range([height - 40, 40]); 
        
          const maxDomScore = d3.max(filtered_skyline, d => d.dom_score);

          svg.selectAll("circle")
          .data(reducedData)
          .enter()
          .append("circle")
          .attr("class", (d,i) => { return `ind${filtered_skyline[i].id}`})
          .attr("cx", d => xScale(d[0]))
          .attr("cy", d => yScale(d[1]))
          .attr("r", 4)
          .attr("fill", (d, i) => {
            const dom_value = filtered_skyline[i]["dom_score"];
            return d3.interpolateRgb('#fdf7ed', '#91191c')(dom_value/maxDomScore);
          })
          .on('mouseover', (event, d) => {
            
            var className = event.srcElement.className.baseVal;
            var classRadial = className.substring(3)

            svg.selectAll(`.${className}`)
            .attr("r", 13)

            y.range([15, 50])   

            radial_box.selectAll(`.index${classRadial}`)
              .attr("d", d3.arc()
              .innerRadius(15)
              .outerRadius(d => y(d.value)) 
              .startAngle(d => x(d.key))
              .endAngle(d => (x(d.key) + x.bandwidth()))
              .padAngle(0.01)
              .padRadius(60));

          d3.select('.tooltip').remove();

          var tooltip = d3.select("body")
          .append("div")
          .classed("tooltip", true)
          .style("font-size", "16px")
          .style("position", "absolute")
          .style("background-color", "grey")
          .style("border", "none")
          .style("border-radius", "5px")
          .style("padding", "15px")
          .style("text-align", "left")
          .style("color", "white");

          var player = filtered_skyline.filter(x => x.id === Number(classRadial))[0];

          tooltip
          .style("opacity", "100%")
          .html("<span>Player: </span>" + player.Player + "<br><span> Domination Score: </span>" + player.dom_score)
          .style("left", (event.pageX + 20) + "px")
          .style("top", (event.pageY + 20) + "px");

            

          })
          .on('mouseout',(event, d) => {

            var className = event.srcElement.className.baseVal;
            var classRadial = className.substring(3)

            y.range([4, 25])   
            radial_box.selectAll(`.index${classRadial}`)
              .attr("d", d3.arc()
              .innerRadius(4)
              .outerRadius(d => y(d.value)) 
              .startAngle(d => x(d.key))
              .endAngle(d => (x(d.key) + x.bandwidth()))
              .padAngle(0.01)
              .padRadius(60))
            
            svg.selectAll(`.${className}`)
            .attr("r", 4)

            d3.select('.tooltip').remove();

          }); 
        
          x = d3.scaleBand()
          .range([0, 2 * Math.PI])
          .align(0)                 
          .domain( datasetNumericColumns );

          const maxValues = {};
          datasetNumericColumns.forEach(key => {
              maxValues[key] = d3.max(NumericalDataWithKey, d => d[key]);
          });
          
          y = d3.scaleRadial()
          .range([4, 25])   
          .domain([d3.min(Object.values(maxValues)), d3.max(Object.values(maxValues))]); 

          radial_box = svg.selectAll("g")
          .data(reducedData)
          .enter()
          .append("g")
          .attr("transform", d => `translate(${xScale(d[0])},${yScale(d[1])})`);

          radial_box.selectAll("path")
          .data((d, i) => datasetNumericColumns.map(key => ({ key, value: NumericalDataWithKey[i][key], index: filtered_skyline[i].id })))
          .enter()
          .append("path")
          .attr('class', (d) => `index${d.index}`)
          .attr("fill", "#9970AB")
          .attr("d", d3.arc()
              .innerRadius(5)
              .outerRadius(d => y(d.value)) 
              .startAngle(d => x(d.key))
              .endAngle(d => (x(d.key) + x.bandwidth()))
              .padAngle(0.01)
              .padRadius(60))
          .on('mouseover', (event, d) => {

            y.range([15, 50])   

            radial_box.selectAll(`.index${d.index}`)
              .attr("d", d3.arc()
              .innerRadius(15)
              .outerRadius(d => y(d.value)) 
              .startAngle(d => x(d.key))
              .endAngle(d => (x(d.key) + x.bandwidth()))
              .padAngle(0.01)
              .padRadius(60))

            svg.selectAll(`.ind${d.index}`)
            .attr("r", 13)

            d3.select('.tooltip').remove();

            var tooltip = d3.select("body")
            .append("div")
            .classed("tooltip", true)
            .style("font-size", "16px")
            .style("position", "absolute")
            .style("background-color", "grey")
            .style("border", "none")
            .style("border-radius", "5px")
            .style("padding", "15px")
            .style("text-align", "left")
            .style("color", "white");

            var player = filtered_skyline.filter(x => x.id === d.index)[0];
            
            tooltip
            .style("opacity", "100%")
            .html("<span>Player: </span>" + player.Player + "<br><span> Domination Score: </span>" + player.dom_score)
            .style("left", (event.pageX + 20) + "px")
            .style("top", (event.pageY + 20) + "px");



          })
          .on('mouseout',(event, d) => {

            y.range([4, 25])   
            radial_box.selectAll(`.index${d.index}`)
              .attr("d", d3.arc()
              .innerRadius(4)
              .outerRadius(d => y(d.value)) 
              .startAngle(d => x(d.key))
              .endAngle(d => (x(d.key) + x.bandwidth()))
              .padAngle(0.01)
              .padRadius(60))
            
            svg.selectAll(`.ind${d.index}`)
            .attr("r", 4)

            d3.select('.tooltip').remove();


          });
            
        
      })
      .catch((e) => {
          console.log(e);
  });

  return (
    <div className="projectionView">
      <h3>Projection View</h3>
      <svg id="projectionSVG"></svg>
    </div>
  );
}

export default ProjectionView;
