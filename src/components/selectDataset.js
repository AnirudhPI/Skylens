
import { table_columns } from "../app/dataParser/dataParser"
const datasetDescriptions={
  
  "Rk" : "Ranking",
  "Player" : "Player's name",

  "G" : "Games played",

  "ORB" : "Offensive rebounds per game",
  "DRB" : "Defensive rebounds per game",
  "TRB" : "Total rebounds per game",
  "AST" : "Assists per game",
  "STL" : "Steals per game",

 
  "PTS" : "Points per game",

}
function DatasetAttributes() {
  return table_columns.map((column) => (
    <div className="datasetAttribute" key={column}>
      <div><b>{column}</b>: {datasetDescriptions[column]}</div>
    </div>
  )); 
}
export default function SelectDataset() {
  return (
    <div className="selectDataset">
      <div>
        <h3>Dataset Attributes</h3>  
      </div>
      
      <DatasetAttributes />
    </div>
  );
}


