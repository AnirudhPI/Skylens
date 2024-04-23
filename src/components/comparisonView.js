import * as d3 from 'd3';
import { useEffect, useRef } from "react";
import {parseData} from '../app/dataParser/dataParser';

function ComparisonView() {

  function drawRadarChart(positionX, positionY, radius, color, playerData) {

    const nameOfPlayer = playerData.Player;
    console.log('playerName: ', nameOfPlayer);

    var chartWidth = radius * 2;
    var chartHeight = radius * 2;

    var centerX = chartWidth / 2;
    var centerY = chartHeight / 2;

    var svg = d3.select('#comparisonSVG')
        .append('g')
        .attr('transform', `translate(${positionX - radius}, ${positionY - radius})`)


    function getLineCoordinates(angle, radius) {
        return {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
        };
    }
    
    var labels = ['GP', 'MIN', 'PTS', 'FGM', 'AST', 'STL', 'BLK'];

    var numLines = 7;
    var startingAngle = -Math.PI / 2; 

    for (var i = 0; i < numLines; i++) {
    var angle = startingAngle + (i * 2 * Math.PI) / numLines; 
    var coordinates = getLineCoordinates(angle, radius); 
    
    svg.append('line')
        .attr('x1', centerX)
        .attr('y1', centerY)
        .attr('x2', coordinates.x)
        .attr('y2', coordinates.y)
        .attr('stroke', 'black')
        .attr('stroke-width', 1);
    }

    var labelOffset = 15;

    labels.forEach(function(label, i) {
        var angle = -Math.PI / 2 + (i * 2 * Math.PI) / numLines; 
        var labelRadius = radius + labelOffset; 

        var labelCoordinates = getLineCoordinates(angle, labelRadius);
        
        svg.append('text')
            .attr('x', labelCoordinates.x)
            .attr('y', labelCoordinates.y)
            .attr('text-anchor', angle === -Math.PI / 2 || angle === Math.PI / 2 ? 'middle' : (angle < -Math.PI / 2 || (angle > 0 && angle < Math.PI / 2) ? 'start' : 'end'))
            .attr('dominant-baseline', angle < 0 ? 'hanging' : 'auto')
            .attr('alignment-baseline', angle === Math.PI / 2 ? 'middle' : (angle < 0 ? 'hanging' : 'baseline'))
            .attr('dy', angle === -Math.PI / 2 ? '0.35em' : (angle === Math.PI / 2 ? '-0.35em' : '0'))
            .attr('font-size', '10px')
            .attr('fill', 'black')
            .text(label);
    });

    var domicating_score = 2 * 5;
    
    svg.append('circle')
        .attr('cx', centerX)
        .attr('cy', centerY)
        .attr('r', domicating_score)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5');

    var scores = {
        GP: playerData.G/2,   // G
        MIN: playerData.MP,  // MP
        PTS: 14 * 1.2,  // 
        FGM: playerData.FG,   // FG
        AST: 11 * 1.2,  // 
        STL: 40 * 1.2,
        BLK: 39 * 1.2
    };

    // console.log('scores: ', scores);
    
    var labelAngles = {
      GP: 0,
      MIN: (1 * 2 * Math.PI) / 7,
      PTS: (2 * 2 * Math.PI) / 7,
      FGM: (3 * 2 * Math.PI) / 7,
      AST: (4 * 2 * Math.PI) / 7,
      STL: (5 * 2 * Math.PI) / 7,
      BLK: (6 * 2 * Math.PI) / 7
    };
    
    Object.entries(scores).forEach(([stat, value]) => {
      var angle = labelAngles[stat] - Math.PI / 2;
      
      var dotCoordinates = getLineCoordinates(angle, value);
      
      svg.append('circle')
          .attr('cx', dotCoordinates.x)
          .attr('cy', dotCoordinates.y)
          .attr('r', 4)
          .attr('class', 'red-dot')
          .attr('fill', color);
    });

    var lineGenerator = d3.line();

    var redDotPositions = svg.selectAll('.red-dot').nodes().map(function(node) {
      return [+node.getAttribute('cx'), +node.getAttribute('cy')];
    });

    redDotPositions.push(redDotPositions[0]);

    var pathData = lineGenerator(redDotPositions);

    svg.append('path')
        .attr('d', pathData)
        .attr('stroke', color)
        .attr('stroke-width', 2)
        .attr('fill', 'none');

    svg.append('text')
        .attr('x', centerX - 70)
        .attr('y', centerY - radius) 
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('fill', color)
        .text(playerData.Player);
  }

  function drawPieChart(centerX, centerY, scores, chartRadius, colors) {
    var pie = d3.pie();
    var arc = d3.arc().innerRadius(0).outerRadius(chartRadius / 3);

    var pieGroup = d3.select('#comparisonSVG').append('g')
                    .attr('transform', `translate(${centerX}, ${centerY})`);

    var arcs = pieGroup.selectAll('.arc')
                    .data(pie(scores))
                    .enter()
                    .append('g')
                    .attr('class', 'arc');

    arcs.append('path')
        .attr('d', arc)
        .attr('fill', function(d, i) {
            return colors[i];
        });
  }

  function updateVisualization(selectedPlayers) {

    d3.select('#comparisonSVG').selectAll('*').remove();

    var svgWidth = 400;
    var svgHeight = 300;
    d3.select('#comparisonSVG').attr('width', svgWidth).attr('height', svgHeight);

    var centerX = svgWidth / 2;
    var centerY = svgHeight / 2;
    var chartRadius = 100; 

    var colors = ['#8d53d4']

    parseData({filteredColumns : ["Player","Pos","G","GS","MP","FG","3P","DRB","TRB", "PTS"], limit:100}).then(parseData => {
        selectedPlayers.forEach((playerName, index) => {
            let playerData = parseData.data.find(player => player.Player === playerName);

            let positionY = (index * centerY * 2) + centerY;
            let positionX = (index * centerX * 2) + centerX;

            drawRadarChart(positionX + 50, positionY , chartRadius, colors[index], playerData);
        });
    }).catch(error => {
        console.error('Error loading the CSV file: ', error);
    });

  }

  function updateVisualization2(selectedPlayers) {
    d3.select('#comparisonSVG').selectAll('*').remove();

    var svgWidth = 400;
    var svgHeight = 300;
    d3.select('#comparisonSVG').attr('width', svgWidth).attr('height', svgHeight);

    var centerX = svgWidth / 2;
    var centerY = svgHeight / (selectedPlayers.length * 2);
    var chartRadius = 100;

    var colors = ['#8d53d4', '#db9430']

    parseData({filteredColumns : ["Player","Pos","G","GS","MP","FG","3P","DRB","TRB", "PTS"], limit:100}).then(parseData => {
        selectedPlayers.forEach((playerName, index) => {
            let playerData = parseData.data.find(player => player.Player === playerName);

            let positionY = (index * centerY * 2) + centerY;

            drawRadarChart(centerX + 50, positionY + 15, chartRadius - 50, colors[index], playerData);
        });
    }).catch(error => {
        console.error('Error loading the CSV file: ', error);
    });

    drawPieChart(centerX + 50, centerY+ 80, [dominating_scores[0], dominating_scores[1]], chartRadius - 50, colors);

  }

  function updateVisualization3(selectedPlayers) {
    d3.select('#comparisonSVG').selectAll('*').remove();

    var svgWidth = 400; 
    var svgHeight = 300;
    var svg = d3.select('#comparisonSVG').attr('width', svgWidth).attr('height', svgHeight);

    var centerX = svgWidth / 2;
    var centerY = svgHeight / 4;
    var chartRadius = svgWidth / 7;

    var offsetDistance = chartRadius / 4
    var topChartPosition = { x: centerX, y: centerY - 2 * offsetDistance -10};

    var bottomLeftChartPosition = { x: centerX - chartRadius * 2 -20, y: centerY * 2.5 };
    var bottomRightChartPosition = { x: centerX + chartRadius * 2 + 20, y: centerY * 2.5 };

    var chartPositions = [topChartPosition, bottomLeftChartPosition, bottomRightChartPosition];

    var colors = ['#8d53d4', '#db9430', '#309adb'];

    parseData({filteredColumns : ["Player","Pos","G","GS","MP","FG","3P","DRB","TRB", "PTS"], limit:100}).then(parseData => {
        console.log('parse: ', parseData)
        selectedPlayers.forEach((playerName, index) => {

            let playerData = parseData.data.find(player => player.Player === playerName);
            if (!playerData) {
                console.error('Player not found in data:', playerName);
                return;
            }
            let position = chartPositions[index];

            drawRadarChart(position.x+80, position.y+40, chartRadius, colors[index], playerData);
            
        });
    }).catch(error => {
        console.error('Error loading the CSV file: ', error);
    });

    // three lines

    svg.append('line')
      .attr('x1', centerX + 80)
      .attr('y1', centerY - 2 * offsetDistance + 80)
      .attr('x2', centerX + 80)
      .attr('y2', centerY+100)
      .attr('stroke', 'gray')
      .attr('stroke-width', 1);

    svg.append('line')
        .attr('x1', bottomLeftChartPosition.x + 150)
        .attr('y1', bottomLeftChartPosition.y + 10)
        .attr('x2', centerX + 80)
        .attr('y2', centerY+100)
        .attr('stroke', 'gray')
        .attr('stroke-width', 1);

    svg.append('line')
        .attr('x1', bottomRightChartPosition.x + 20)
        .attr('y1', bottomRightChartPosition.y + 10)
        .attr('x2', centerX + 80)
        .attr('y2', centerY+100)
        .attr('stroke', 'gray') 
        .attr('stroke-width', 1);


    // left 2 lines

    svg.append('line')
        .attr('x1', topChartPosition.x + 30)
        .attr('y1', topChartPosition.y + 70)
        .attr('x2', centerX)
        .attr('y2', centerY+60)
        .attr('stroke', 'gray') 
        .attr('stroke-width', 1);

    svg.append('line')
        .attr('x1', bottomLeftChartPosition.x + 100)
        .attr('y1', bottomLeftChartPosition.y - 20)
        .attr('x2', centerX)
        .attr('y2', centerY+60)
        .attr('stroke', 'gray') 
        .attr('stroke-width', 1);

    // right two lines

    svg.append('line')
        .attr('x1', topChartPosition.x + 120)
        .attr('y1', topChartPosition.y + 70)
        .attr('x2', centerX + 150)
        .attr('y2', centerY+60)
        .attr('stroke', 'gray') 
        .attr('stroke-width', 1);

    svg.append('line')
        .attr('x1', bottomRightChartPosition.x + 50)
        .attr('y1', bottomRightChartPosition.y - 20)
        .attr('x2', centerX + 150)
        .attr('y2', centerY+60)
        .attr('stroke', 'gray') 
        .attr('stroke-width', 1);

    // bottom lines

    svg.append('line')
        .attr('x1', bottomLeftChartPosition.x + 150)
        .attr('y1', bottomLeftChartPosition.y + 40 )
        .attr('x2', centerX + 80)
        .attr('y2', bottomLeftChartPosition.y + 40)
        .attr('stroke', 'gray') 
        .attr('stroke-width', 1);

    svg.append('line')
        .attr('x1', bottomRightChartPosition.x)
        .attr('y1', bottomRightChartPosition.y + 40)
        .attr('x2', centerX + 80)
        .attr('y2', bottomLeftChartPosition.y + 40)
        .attr('stroke', 'gray') 
        .attr('stroke-width', 1);
        

    drawPieChart(centerX + 80, centerY+100, dominating_scores, chartRadius, colors); // center pie
    drawPieChart(centerX, centerY+60, [dominating_scores[0], dominating_scores[1]], chartRadius, [colors[0], colors[1]]) // left pie
    drawPieChart(centerX + 150, centerY+60, [dominating_scores[0], dominating_scores[2]], chartRadius, [colors[0], colors[2]]) // right pie
    drawPieChart(centerX + 80, bottomLeftChartPosition.y + 40, [dominating_scores[1], dominating_scores[2]], chartRadius, [colors[1], colors[2]]) // last pie
  }


  function updateVisualizationBasedOnPlayers(selectedPlayers) {
    switch(selectedPlayers.length) {
        case 1:
            updateVisualization(selectedPlayers);
            break;
        case 2:
            updateVisualization2(selectedPlayers);
            break;
        case 3:
            updateVisualization3(selectedPlayers);
            break;
        default:
            d3.select('#comparisonSVG').selectAll('*').remove();
            console.log("The number of players selected does not match any visualization format.");
            break;
    }
  }


  // Static part, needs to be linked to Projection view

  /* var selectedPlayers = [];
  // var selectedPlayers = ['Julius Randle']; 
  // var selectedPlayers = ['Julius Randle', 'Anthony Edwards']; */
  var selectedPlayers = ['Julius Randle', 'Anthony Edwards', 'Buddy Hield']; 
  var dominating_scores = [2, 11, 15]
  

  let ref = useRef(null);
  useEffect(() => {
    updateVisualizationBasedOnPlayers(selectedPlayers)
  }, []);

  return (
    <div className="comparisonView">
      <h3>Comparison View</h3>
      <svg id="comparisonSVG" ref={ref}></svg>
    </div>
  );
}

export default ComparisonView;
