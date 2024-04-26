import ProjectionView from "./components/projectionView";
import ComparisonView from "./components/comparisonView";
import SelectDataset from "./components/selectDataset";
import TabularView from "./components/tabularView";
import { useState } from "react";
import "./App.css";
import GraphView from "./components/GraphView";

function App() {
  let [selectedpoints,setSelectedPoints] = useState([]);
  let [selectNewChart, setSelectNewChart] = useState(false);
  
  return (
    <div className="App">
      <header>
        <h1>SkyLens: Visual Analysis of Skyline on Multi-dimensional Data</h1>
      </header>
      <main>
        <div>
          <p></p>
          <button onClick={() => setSelectNewChart(!selectNewChart)}>Use {selectNewChart ? "Comparison View":"Graph View"}</button>
        </div> 
        <div className="upper">
          <ProjectionView selectedpoints={selectedpoints} setSelectedPoints={setSelectedPoints} />
          {selectNewChart && <GraphView selectedpoints={selectedpoints} setSelectedPoints={setSelectedPoints} />}
          {!selectNewChart && <ComparisonView selectedpoints={selectedpoints} setSelectedPoints={setSelectedPoints} />}
          <SelectDataset />
        </div>
        <div className="lower">
          <TabularView />
        </div>
      </main>
    </div>
  );
}

export default App;
