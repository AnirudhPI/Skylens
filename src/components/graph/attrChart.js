import * as d3 from "d3";

function createAttrChart(data, player, attribute, rowIndex, colIndex) {
    let attrSVG = d3.select(`#attrChart-${rowIndex}-${colIndex}`);
    let svgWidth = attrSVG.node().getBoundingClientRect().width;
    let svgHeight = attrSVG.node().getBoundingClientRect().height;
    let margin = { top: 30, bottom: 30, left: 50, right: 30 };
    let svgInnerWidth = svgWidth - margin.left - margin.right;
    let svgInnerHeight = svgHeight - margin.top - margin.bottom;
  
    const playerData = data.find((d) => d["Player"] === player);
    const playerAttributeValue = +playerData[attribute];
    
    const adjustedData = data.map((d) => {
      const attrValue = +d[attribute];
      let temp_dict = { ...d };
      temp_dict[attribute] = attrValue - playerAttributeValue;
      return temp_dict;
    });
  
    let attrArea = attrSVG
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
    let xAxis = d3
      .scaleBand()
      .domain(data.map((d) => d["Player"]))
      .padding(0.2)
      .range([0, svgInnerWidth]);
  
    attrSVG
      .append("g")
      .attr(
        "transform",
        `translate(${margin.left},${svgInnerHeight / 2 + margin.top})`
      )
      .call(d3.axisBottom(xAxis).tickSize(0))
      .selectAll("text")
      .style("opacity", 0);
  
    let yAxis = d3
      .scaleLinear()
      .domain([
        -d3.max(adjustedData, (d) => d[attribute]),
        d3.max(adjustedData, (d) => d[attribute]),
      ])
      .range([svgInnerHeight, 0]);
  
    attrSVG
      .select("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)
      .call(d3.axisLeft(yAxis))
      .selectAll("path,line,text")
      .style("opacity", 0);
  
    attrArea
      .selectAll(".bar")
      .data(adjustedData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => xAxis(d["Player"]))
      .attr("y", (d) => yAxis(Math.max(0, d[attribute])))
      .attr("width", xAxis.bandwidth())
      .attr("height", (d) => Math.abs(yAxis(d[attribute]) - yAxis(0)))
      .attr("fill", "#88b4d6");
  
    attrArea
      .append("line")
      .attr("x1", xAxis(player) + xAxis.bandwidth() / 2)
      .attr("x2", xAxis(player) + xAxis.bandwidth() / 2)
      .attr("y1", yAxis(d3.min(adjustedData, (d) => d[attribute])))
      .attr("y2", yAxis(d3.max(adjustedData, (d) => d[attribute])))
      .attr("stroke", "#b293bf")
      .attr("stroke-width", 2);
  }

  export default createAttrChart;