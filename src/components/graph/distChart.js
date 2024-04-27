import * as d3 from 'd3';

function createDistChart(data, attribute, index) {
    let areaSVG = d3.select(`#distChart-${index}`);
    let svgWidth = areaSVG.node().getBoundingClientRect().width;
    let svgHeight = areaSVG.node().getBoundingClientRect().height;
    let margin = { top: 30, bottom: 30, left: 50, right: 30 };
    let svgInnerWidth = svgWidth - margin.left - margin.right;
    let svgInnerHeight = svgHeight - margin.top - margin.bottom;
  
    let chartArea = areaSVG
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
    let xAxis = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => +d[attribute])])
      .range([0, svgInnerWidth]);
    areaSVG
      .append("g")
      .attr(
        "transform",
        `translate(${margin.left},${svgInnerHeight + margin.top})`
      )
      .call(d3.axisBottom(xAxis).tickSize(0))
      .selectAll("text")
      .style("opacity", 0);
  
    let kde = kernelDensityEstimator(kernelEpanechnikov(0.2), xAxis.ticks(40));
    let density = kde(data.map((d) => +d[attribute]));
  
    let yAxis = d3
      .scaleLinear()
      .range([svgInnerHeight, 0])
      .domain([0, d3.max(density, (d) => d[1])]);
    areaSVG
      .select("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)
      .call(d3.axisLeft(yAxis))
      .selectAll("path,line,text")
      .style("opacity", 0);
    chartArea
      .append("path")
      .datum(density)
      .attr("fill", "#89b4d6")
      .attr("opacity", ".8")
      .attr("stroke", "#000")
      .attr("stroke-width", 1)
      .attr("stroke-linejoin", "round")
      .attr(
        "d",
        d3
          .area()
          .curve(d3.curveBasis)
          .x((d) => xAxis(d[0]))
          .y0(svgInnerHeight)
          .y1((d) => yAxis(d[1]))
      );
    chartArea
      .selectAll(".rug-line")
      .data(data)
      .enter()
      .append("line")
      .attr("class", "rug-line")
      .attr("x1", (d) => xAxis(+d[attribute]))
      .attr("x2", (d) => xAxis(+d[attribute]))
      .attr("y1", svgInnerHeight)
      .attr("y2", svgInnerHeight - svgInnerHeight)
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .attr("opacity", 0.8);
  }
  
  function kernelDensityEstimator(kernel, X) {
    return function (V) {
      return X.map(function (x) {
        return [
          x,
          d3.mean(V, function (v) {
            return kernel(x - v);
          }),
        ];
      });
    };
  }
  
  function kernelEpanechnikov(k) {
    return function (v) {
      return Math.abs((v /= k)) <= 1 ? (0.75 * (1 - v * v)) / k : 0;
    };
  }

  export default createDistChart;