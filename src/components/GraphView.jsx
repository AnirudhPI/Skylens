import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
	parseData,
	calculateExclusiveDominantionScores,
} from "../app/dataParser/dataParser";
import { type } from "@testing-library/user-event/dist/type";

const buildGraphdata = (skyline, dominatedPoints, datasetNumericColumns) => {
	let nodes = [];
	let links = [];
	console.log("skyline", skyline);
	for (let i = 0; i < skyline.length; i++) {
		nodes.push({
			id: i,
            type:"node",
			name: skyline[i].Player,
			dom_score: skyline[i].dom_score,
		});
		for (let j = i; j < skyline.length; j++) {
			if (i !== j)
				links.push({
                    type: "link",
					source: i,
					target: j,
					dom_score: calculateExclusiveDominantionScores(
						dominatedPoints,
						skyline[i].id,
						skyline[j].id
					),
				});
		}
	}
	console.log(dominatedPoints);
	console.log("links", links);
	return { nodes: nodes, links: links };
};

const MouseTracker = ({ children, offset = { x: 0, y: 0 } }) => {
	console.log("children", children);
	const element = useRef({});

	useEffect(() => {
		function handler(e) {
			console.log("e", element.current);
			if (element.current) {
				console.log(e.clientX, e.clientY);
				const x = e.clientX + offset.x,
					y = e.clientY + offset.y;
				element.current.style.top = `${y}px`;
				element.current.style.left = `${x}px`;
				element.current.style.visibility = "visible";
			}
		}
		document.addEventListener("mousemove", handler);
		return () => document.removeEventListener("mousemove", handler);
	}, [offset.x, offset.y]);

	return createPortal(
		<div className='mouse-tracker' ref={element}>
			{children}
		</div>,
		document.body
	);
};

function GraphView(props) {
    
    let graphRef = useRef(null);
	let parallelRef = useRef(null);
;
	const [target, setTarget] = useState(null);
    const color = d3.scaleOrdinal(["#8d53d4", "#db9430", "#309adb"]).domain(d3.range(props.selectedpoints.length));
    
	function drawGraph(data, svg,color) {
		// Initialize the links
		let link = svg
			.selectAll(".link")
			.data(data.links)
			.enter()
			.append("g")
			.on("mouseenter", (event, d) => setTarget(d))
			.on("mouseleave", (event, d) => setTarget(d))
			.attr("class", "link");

		// Initialize the nodes
		
		let node = svg
			.selectAll("circle")
			.data(data.nodes)
			.enter()
			.append("circle")
			.attr("r", (d) => 10 + Math.sqrt(d.dom_score))
			// .style("fill", "none")
			.style("fill", (d) => color(d.id))
			.on("mouseenter", (event, d) => setTarget(d))
			.on("mouseleave", (event, d) => setTarget(null));
		const width = svg.node().getBoundingClientRect().width;
		const height = svg.node().getBoundingClientRect().height;
		// Let's list the force we wanna apply on the network
		let simulation = d3
			.forceSimulation(data.nodes)
			.force(
				"link",
				d3
					.forceLink()
					.id((d) => d.id)
					.links(data.links)
			)
			.force("charge", d3.forceManyBody().strength(-10000))
			.force("center", d3.forceCenter(width / 2, height / 2))
			.on("tick", ticked)
			.on("end", ended);
		// This function is run at each iteration of the force algorithm, updating the nodes and links position.
		function ended() {
			// Update link positions
			link.each(function (d) {
				const barsData = axis2d(d);
				console.log("inbards", d, barsData);
				d3.select(this)
					.selectAll(".bar")
					.data(barsData)
					.enter()
					.append("line")
					.attr("class", "bar")
					.attr("stroke-width", 5)

					.attr("stroke", (d) => color(d.id))
					.attr("x1", (d) => d.x1)
					.attr("y1", (d) => d.y1)
					.attr("x2", (d) => d.x2)
					.attr("y2", (d) => d.y2)
					.attr("stroke-linecap", "round");
			});
		}
		function ticked() {
			// Update node positions
			node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
		}
	}
	const drawParallelAxisChart = (
		selectedData,
		datasetNumericColumns,
		svg,
        color
	) => {
		const width = 400;
		const height = 400;
        console.log("selectedDataparal",selectedData);
        svg.attr("width",400).attr("height",400);
		let y = {};
		for (let i in datasetNumericColumns) {
			let name = datasetNumericColumns[i];
			y[name] = d3
				.scaleLinear()

				.domain(
					[0.9 * d3.min(selectedData, d => Number(d[name])), 1.1 * d3.max(selectedData, d => Number(d[name]))]
				)
				.range([height-40, 20]);
		}

		// Build the X scale -> it find the best position for each Y axis
		let x = d3
			.scalePoint()
			.range([0, width-20])
			.padding(1)
			.domain(datasetNumericColumns);

		// The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
		function path(d) {
			return d3.line()(
				datasetNumericColumns.map(function (p) {
					return [x(p), y[p](d[p])];
				})
			);
		}

		// Draw the lines
		svg.selectAll("myPath")
			.data(selectedData)
			.enter()
			.append("path")
			.attr("d", path)
			.style("fill", "none")
            .style("stroke-width", 2)
			.style("stroke", d=>color(d.id))
			// .style("opacity", 0.5);

		// Draw the axis:
		svg.selectAll("myAxis")
			// For each dimension of the dataset I add a 'g' element:
			.data(datasetNumericColumns)
			.enter()
			.append("g")
			// I translate this element to its right position on the x axis
			.attr("transform", function (d) {
				return "translate(" + x(d) + ")";
			})
			// And I build the axis with the call function
			.each(function (d) {
                console.log("d",d);
				d3.select(this).call(d3.axisLeft().scale(y[d]).ticks(7));
			})
			// Add axis title
			.append("text")
			.style("text-anchor", "middle")
			.attr("y", 0)
			.text(function (d) {
				return d;
			})
			.style("fill", "black");
	};
	
	useEffect(() => {
		let filteredSkyline = [];
		const svg = d3.select(graphRef.current);
        
		parseData().then(
			({ _, skyline, dominatedPoints, datasetNumericColumns }) => {
				for (let i of props.selectedpoints) {
					filteredSkyline.push(skyline[i]);
				}

				drawGraph(
					buildGraphdata(
						filteredSkyline,
						dominatedPoints,
						datasetNumericColumns
					),
					svg,color
				);
			}
		);
		return () => svg.selectAll("*").remove();
	}, [props.selectedpoints]);
	useEffect(() => {
		const svg = d3.select(parallelRef.current);
		if (target) {
			parseData().then(
				({ data, skyline, dominatedPoints, datasetNumericColumns }) => {
					let selectedData;
                    if (target.type === "link"){
                        selectedData = data.filter(
						(d) =>
							d.id === target.source.id ||
							d.id === target.target.id
					); 
                    }else{
                        selectedData = data.filter(
						(d) =>
							d.id === target.id);
                    }
                    

					drawParallelAxisChart(
						selectedData,
						datasetNumericColumns,
						svg,
                        color
					);
				}
			);
		}
        return () => svg.selectAll("*").remove();
	}, [target]);

	return (
		<div className='graphView' key={props.selectedpoints}>
			
			{target && (
				<MouseTracker offset={{ x: 10, y: 10 }} className="tooltip-parallel">
                    
					<div className='parallel-axis-container'>
                        {target.type === "link" && (
                            <div className="label">
                                <div style={{color:color(target.source.id)}}>
                                    <p>Player: {target.source.name}</p>
                                    <p>Ex. Dom Score: {target.dom_score[0]}</p>
                                </div>
                                <div style={{color:color(target.target.id)}}>
                                    <p>Player: {target.target.name}</p>
                                    <p>Ex. Dom Score: {target.dom_score[1]}</p>
                                </div>
                                <svg id='parallelSVG' ref={parallelRef}></svg>
                            </div>
                          
                        )}
                        {target.type === "node" && (
                                <div style={{color:color(target.id)}}>
                                    <p>Player: {target.name}</p>
                                    <p>Ex. Dom Score: {target.dom_score}</p>
                                </div>
                               
                          
                        )}
                        <svg id='parallelSVG' ref={parallelRef}></svg>
                        </div>
				</MouseTracker>
			)}

			<h3>Graph View</h3>
			<svg id='graphSVG' ref={graphRef}></svg>
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
	const lerps = dom_score.map((d) => d / domscore_sum);
	// const lerps = [0.5,0.5];
	const scaledX1 = x1 + margin * length * Math.cos(theta);
	const scaledY1 = y1 + margin * length * Math.sin(theta);
	const scaledX2 = x2 - margin * length * Math.cos(theta);
	const scaledY2 = y2 - margin * length * Math.sin(theta);

	const ret = [
		{
			x1: scaledX1,
			y1: scaledY1,
			x2:
				scaledX1 +
				lerps[0] * (1 - 2 * margin) * length * Math.cos(theta),
			y2:
				scaledY1 +
				lerps[0] * (1 - 2 * margin) * length * Math.sin(theta),
			id: links.target.id,
		},
		{
			x1:
				scaledX1 +
				lerps[0] * (1 - 2 * margin) * length * Math.cos(theta),
			y1:
				scaledY1 +
				lerps[0] * (1 - 2 * margin) * length * Math.sin(theta),
			x2: scaledX2,
			y2: scaledY2,
			id: links.source.id,
		},
	];

	return ret;
}

export default GraphView;
