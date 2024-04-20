
import { table_columns } from "../app/dataParser/dataParser"
const datasetDescriptions={
  
  "Rk" : "Ranking",
  "Player" : "Player's name",
  "Pos" : "Position",
  "Age" : "Player's age",
  "Tm" : "Team",
  "G" : "Games played",
  "GS" : "Games started",
  "MP" : "Minutes played per game",
  "FG" : "Field goals per game",
  "FGA" : "Field goal attempts per game",
  "FG%" : "Field goal percentage",
  "3P" : "3-point field goals per game",
  "3PA" : "3-point field goal attempts per game",
  "3P%" : "3-point field goal percentage",
  "2P" : "2-point field goals per game",
  "2PA" : "2-point field goal attempts per game",
  "2P%" : "2-point field goal percentage",
  "eFG%" : "Effective field goal percentage",
  "FT" : "Free throws per game",
  "FTA" : "Free throw attempts per game",
  "FT%" : "Free throw percentage",
  "ORB" : "Offensive rebounds per game",
  "DRB" : "Defensive rebounds per game",
  "TRB" : "Total rebounds per game",
  "AST" : "Assists per game",
  "STL" : "Steals per game",
  "BLK" : "Blocks per game",
  "TOV" : "Turnovers per game",
  "PF" : "Personal fouls per game",
  "PTS" : "Points per game",

}
function DatasetAttributes() {
  return table_columns.map((column) => (
    <div className="datasetAttribute">
      <div><b>{column}</b>: {datasetDescriptions[column]}</div>
    </div>
  )); 
}
export default function SelectDataset() {
  return (
    <div className="selectDataset">
      <h3>Dataset Attributes</h3>
      <DatasetAttributes />
    </div>
  );
}


