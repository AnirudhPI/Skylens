import * as d3 from 'd3';
import { UMAP } from 'umap-js';

function ProjectionView() {
  let filteredColumns = ["Age"];

  d3.csv(`/nba_stats.csv`, function(d){
    return {
        Player: d.Player,
        Pos: d.Pos,
        G: +d.G,   
        GS: +d.GS,
        MP: +d.MP, 
        FG: +d.FG,
        "3P": +d["3P"], 
        DRB: +d.DRB, 
        TRB: +d.TRB
    };
  }).then((data) => {

  
          const selectedDataset = data;
          const datasetColumns = data.columns;
          const datasetNumericColumns = datasetColumns
              .filter((column) => filteredColumns.indexOf(column) < 0)
              .filter((column) => {
                  for (var i = 0; i < data.length; i++) {
                      let value = data[i][column];
                      if (!value) continue;
                      if (!isNaN(value)) return true;
                      else return false;
                  }
            });

          //MY CODE WHICH STAYS IN THIS, ABOVE PART SHOULD COME UPON DATASET SELECT
          //THE selectedDataset SHOULD BE REPLACED WITH SKYLINE POINTS ONLY WITHOUT SPLICE.
          const filtered_skyline = selectedDataset.splice(0,30);
          filtered_skyline.forEach((element,index) => {
              element['dom_score'] = 25 + index * 5;  
          });
        
          const NumericalData = filtered_skyline.map(obj =>
              datasetNumericColumns.map(key => obj[key])
            );
          
          const NumericalDataWithKey = filtered_skyline.map(obj =>
              Object.fromEntries(
                  datasetNumericColumns.map(key => [key, obj[key]])
              )
          );
        
          const umap = new UMAP({nNeighbors: 20});
          const reducedData = umap.fit(NumericalData);
          
          const svg = d3.select("#projectionSVG");
        
          const xScale = d3.scaleLinear()
            .domain([d3.min(reducedData, d => d[0]), d3.max(reducedData, d => d[0])])
            .range([20, 490]); 
        
          const yScale = d3.scaleLinear()
            .domain([d3.min(reducedData, d => d[1]), d3.max(reducedData, d => d[1])])
            .range([350, 20]); 
        
          const maxDomScore = d3.max(filtered_skyline, d => d.dom_score);
        
          svg.selectAll("circle")
            .data(reducedData)
            .enter()
            .append("circle")
            .attr("class", (d,i) => { return filtered_skyline[i].Player})
            .attr("cx", d => xScale(d[0]))
            .attr("cy", d => yScale(d[1]))
            .attr("r", 4)
            .attr("fill", (d, i) => {
              const dom_value = filtered_skyline[i]["dom_score"];
              return d3.interpolateRgb('#fdf7ed', '#91191c')(dom_value/maxDomScore);
            }
            ); 
        
          var x = d3.scaleBand()
          .range([0, 2 * Math.PI])
          .align(0)                 
          .domain( datasetNumericColumns );
      
          var y = d3.scaleRadial()
          .range([20, 40])   
          .domain([0, 350]); 

          svg.selectAll("g")
          .data(reducedData)
          .enter()
          .append("g")
          .attr("transform", d => `translate(${xScale(d[0])},${yScale(d[1])})`)
          .selectAll("path")
          .data((d, i) => datasetNumericColumns.map(key => ({ key, value: NumericalDataWithKey[i][key]})))
          .enter()
          .append("path")
          .attr("fill", "#9970AB")
          .attr("d", d3.arc()
              .innerRadius(5)
              .outerRadius(d => y(d.value)) 
              .startAngle(d => x(d.key))
              .endAngle(d => (x(d.key) + x.bandwidth()))
              .padAngle(0.01)
              .padRadius(60));

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
