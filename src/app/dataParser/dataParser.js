import * as d3 from "d3";

let selected_dataset = "";
const filename = "";
let selectedDataset = [];
let skyline = [];
let dominatedPoints = [];

let datasetColumns;
let datasetNumericColumns;


function getNumericColumns() {
    return datasetColumns.filter((column) => isNumeric(column));
}

function isNumeric(column) {
    return !isNaN(+column);
}

export default async function parseData({filteredColumns = ["Player","Pos","G","GS","MP","FG","3P","DRB","TRB"],limit=100}) {

    return await d3.csv(`/nba_stats.csv`)
        .then((data) => {
            selectedDataset = data;
            datasetColumns = data.columns.filter((column) => filteredColumns.indexOf(column) > -1);

            datasetNumericColumns = datasetColumns
                .filter((column) => {
                    for (var i = 0; i < data.length; i++) {
                        let value = data[i][column];
                        if (!value) continue;
                        if (!isNaN(value)) return true;
                        else return false;
                    }
                });
                
            // converting numerical columns to numbers
            for (var i = 0; i < data.length; i++) {
                for (var j = 0; j < datasetNumericColumns.length; j++) {
                    data[i][datasetNumericColumns[j]] = Number(data[i][datasetNumericColumns[j]]);
                }
            }
            let result =  calculateSkylinePoints();
            result.data = result.data.sort((a,b) => a.dom_score - b.dom_score).reverse().slice(0,limit);
            return result;
        })
        .catch((e) => {
            console.log(e);
            return { data: [], skyline: [], dominatedPoints: [] };
        });
}


function calculateSkylinePoints() {
    const skyline = [];
    const dominatedPoints = [];
    
    //  loop through all data points, and for each point, check if it dominates any other points push to skyline or dominatedPoints
    for (let i = 0; i < selectedDataset.length; i++) {
        const dataPoint1 = selectedDataset[i];
        let isDominated = false;
        
        for (let j = 0; j < selectedDataset.length; j++) {
            if (i !== j) {
                const dataPoint2 = selectedDataset[j];
                
                if (dominates(dataPoint2, dataPoint1)) {
                    isDominated = true;
                    break;
                } else if (dominates(dataPoint1, dataPoint2)) {
                    // If dataPoint1 dominates dataPoint2, add dataPoint2 to dominatedPoints
                    dominatedPoints.push(dataPoint2);
                }
            }
        }
        
        if (!isDominated) {
            skyline.push(dataPoint1);
        }
    }
    
    // Remove duplicates from dominatedPoints
    const uniqueDominatedPoints = Array.from(new Set(dominatedPoints.map(JSON.stringify)), JSON.parse);
    
    // calculate dom_score for each data point
    selectedDataset.forEach((dataPoint) => {
        dataPoint.dom_score = calculateDomScore(dataPoint, uniqueDominatedPoints);
    });
    
    return { data: selectedDataset, skyline, dominatedPoints: uniqueDominatedPoints, datasetNumericColumns };
}


function dominates(point1, point2) {
    return (
        datasetNumericColumns.every((column) => +point1[column] >= +point2[column]) &&
        datasetNumericColumns.some((column) => +point1[column] > +point2[column])
    );
}

function calculateDomScore(point, dominatedPoints) {
    return dominatedPoints.filter((dominatedPoint) => dominates(point, dominatedPoint)).length;
}
