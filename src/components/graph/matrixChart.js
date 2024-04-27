import * as d3 from 'd3';
function createMatrixChart(data, attribute, rowIndex, colIndex) {
    let matrixSVG = d3.select(`#matChart-${rowIndex}-${colIndex}`);
    matrixSVG.append("g");
    let svgWidth = matrixSVG.node().getBoundingClientRect().width;
    let svgHeight = matrixSVG.node().getBoundingClientRect().height;
    let margin = { top: 30, bottom: 30, left: 50, right: 30 };
    let svgInnerWidth = svgWidth - margin.left - margin.right;
    let svgInnerHeight = svgHeight - margin.top - margin.bottom;
  
    let numAttr = ["G", "GS", "MP", "FG", "3P", "TRB", "DRB"];
  
    for (let i = 0; i < numAttr.length; i++) {
      if (attribute == numAttr[i]) {
        data.sort(function (a, b) {
          return d3.ascending(+a[numAttr[i]], +b[numAttr[i]]);
        });
      }
    }
  
    for (let i = 0; i < numAttr.length; i++) {
      const extent = d3.extent(data, (d) => +d[numAttr[i]]);
      const colorScale = d3.scaleQuantize().domain(extent).range(d3.schemeAccent);
      for (let j = 0; j < data.length - 1; j++) {
        matrixSVG
          .append("rect")
          .attr("x", j * 7 + 20)
          .attr("y", 20 + i * 22)
          .attr("height", "20px")
          .attr("width", "5px")
          .style("fill", (d) => colorScale(data[j][numAttr[i]]));
      }
    }
  }

  export default createMatrixChart;