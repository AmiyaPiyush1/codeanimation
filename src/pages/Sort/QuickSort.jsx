import VisualDebuggerBoiler from "../../components/Debugger/VisualDebuggerBoiler";
import { useLocation } from "react-router-dom";

const QuickSort = () => {
  const location = useLocation();
  const {problemType, specificType} = location.state || {};
  
  return (
    <VisualDebuggerBoiler
      problemType={problemType}
      specificType={specificType}
      title="Merge Sort Visualizer"
      description="Visualize the Merge Sort algorithm step-by-step with React Flow."
    />
  );
}

export default QuickSort;