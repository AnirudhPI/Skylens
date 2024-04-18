import ProjectionView from "./components/projectionView";
import ComparisonView from "./components/comparisonView";
import SelectDataset from "./components/selectDataset";
import TabularView from "./components/tabularView";
import "./App.css";

function App() {
  return (
    <div className="App">
      <header>
        <h1>SkyLens: Visual Analysis of Skyline on Multi-dimensional Data</h1>
      </header>
      <main>
        <div className="upper">
          <ProjectionView />
          <ComparisonView />
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
