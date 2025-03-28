import VisualDebuggerBoiler from "../../components/Debugger/VisualDebuggerBoiler";
import { useLocation } from "react-router-dom";

const BubbleSort = () => {
  const location = useLocation();
  const {problemType, specificType} = location.state || {};

  return (
    <VisualDebuggerBoiler
      problemType={problemType}
      specificType={specificType}
      title="Merge Sort Visualizer"
      description="Visualize the Bubble Sort algorithm step-by-step with React Flow."
    />
  );
}

export default BubbleSort; 