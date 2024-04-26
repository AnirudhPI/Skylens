import * as d3 from "d3";



let datasetColumns;
let datasetNumericColumns;
export let table_columns = ["Player","G","ORB", "DRB", "TRB", "AST", "STL","PTS" ];

export async function parseData() {

    return await d3.csv(`/nba_stats.csv`)
        .then((data) => {

            // filter columns based on games played.
            datasetColumns = data.columns.filter((column)=> table_columns.includes(column));
            data = data.filter((row) => Number(row['G']) >= 70);
            console.log('filter',data);
           
                datasetNumericColumns = datasetColumns.filter((column) => 
                    {
                    for (var i = 0; i < data.length; i++) {
                        let value = data[i][column];
                        if (!value) continue;
                        if (!isNaN(value)) return true;
                        else return false;
                    }
                });
                
            // converting numerical columns to numbers
            for (var i = 0; i < data.length; i++) {
                data[i].id = i;
                for (var j = 0; j < datasetNumericColumns.length; j++) {
                    data[i][datasetNumericColumns[j]] = Number(data[i][datasetNumericColumns[j]]);
                }
            }

            let result =  calculateSkylinePoints(data);
            result.data = result.data.sort((a,b) => a.dom_score - b.dom_score);
            return result;
        })
        .catch((e) => {
            console.log(e);
            return { data: [], skyline: [], dominatedPoints: [] };
        });
}


function calculateSkylinePoints(data) {
    const skyline = [];
    const dominatedPoints = [];
    
    //  loop through all data points, and for each point, check if it dominates any other points push to skyline or dominatedPoints
    for (let i = 0; i < data.length; i++) {
        const dataPoint1 = data[i];
        dataPoint1.dom_score = 0;
        let isDominated = false;
        for (let j = 0; j < data.length; j++) {
            
            if (i !== j) {
                const dataPoint2 = data[j];
    
                if (dominates(dataPoint2, dataPoint1)) {
                    isDominated = true;
                    break;
                } else if (dominates(dataPoint1, dataPoint2)) {
                    // If dataPoint1 dominates dataPoint2, add dataPoint2 to dominatedPoints
                    if (!dataPoint2.dominated_by) dataPoint2.dominated_by = [];
                    dataPoint2.dominated_by.push(dataPoint1.id);
                    dataPoint1.dom_score = dataPoint1.dom_score + 1;
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
    
    
    console.log({ data: data, skyline, dominatedPoints: uniqueDominatedPoints, datasetNumericColumns })
    return { data: data, skyline, dominatedPoints: uniqueDominatedPoints, datasetNumericColumns };
}


function dominates(point1, point2) {
    return (
        datasetNumericColumns.every((column) => +point1[column] >= +point2[column]) &&
        datasetNumericColumns.some((column) => +point1[column] > +point2[column])
    );
}

