import React, { useEffect, useState } from 'react';
import { parseData } from '../app/dataParser/dataParser';
import './tabularView.css';
import createAttrChart from './graph/attrChart';
import createDistChart from './graph/distChart';
import createMatrixChart from './graph/matrixChart';

const tableData = await parseData().then((res) => res.data).catch(err => console.log(err));
const reducedTableData = tableData.slice(0, 30);

const TableDisplay = ({ data = reducedTableData }) => {

  const [clickedCell, setClickedCell] = useState({ attribute: null, rowIndex: null });

  let columns = ["Player", "G", "ORB", "DRB", "TRB", "AST", "STL", "PTS"];

  useEffect(() => {
    // display dist cart 
    columns.map((column, index) => (
      index !== 0 && createDistChart(tableData, column, index)
    ))

    // display attr chart
    data.map((row, rowIndex) => (
      columns.map((column, colIndex) => (
        colIndex !== 0 && createAttrChart(tableData, row["Player"], column, rowIndex, colIndex)
      ))
    ))
  }, []);

  useEffect(() => {
    if (clickedCell.rowIndex !== null) {
      const { attribute, rowIndex } = clickedCell;
      columns.map((column, colIndex) => (
        colIndex !==0 && createMatrixChart(tableData, column, rowIndex, colIndex)
      ))

    }
  }, [clickedCell]);

  const handleRowClick = (attribute, rowIndex) => {
    setClickedCell({ attribute, rowIndex });
  };

  return (
    <div className="table-container">
      <table className='table'>
        <thead className="table-header">
          <tr>
            {columns.map((column, index) => (
              <th key={index}>
                {column}
                {index !== 0 && <svg id={`distChart-${index}`}></svg>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="table-body">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="table-row" >
              {columns.map((column, colIndex) => (
                <td key={colIndex} onClick={() => handleRowClick(column, rowIndex)}>
                  {colIndex == 0 ? row[column] :(
                    <>
                      <svg id={`attrChart-${rowIndex}-${colIndex}`}></svg>
                      {clickedCell.rowIndex === rowIndex && (
                        <svg id={`matChart-${rowIndex}-${colIndex}`}></svg>
                      )}
                    </>
                  )
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>

  );
};


function TabularView() {
  return (
    <div className="tabularView">
      <h3>Tabular View</h3>
      <TableDisplay />
    </div>
  );
}

export default TabularView;
