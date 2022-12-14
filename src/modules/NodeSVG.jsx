import { useD3 } from './useD3';
import ForceGraph from './ForceGraph';


const NodeSVG = ({data,dimensions}) => {

    const { width, height, margin } = dimensions;
    const svgWidth = width + margin.left + margin.right;
    const svgHeight = height + margin.top + margin.bottom;

    const svgRef = useD3(
        (svg) => {
            ForceGraph(svg, data, {
                nodeId: d => d.id,
                nodeGroup: d => d.type,
                nodeFill: "#fff",
                nodeStroke: "#000",
                nodeStrokeWidth: 1.5,
                linkStroke: "#000",
                linkStrokeWidth: 0.6,
                linkStrokeOpacity: 1,
                
                width : svgWidth,
                height : svgHeight
              });
            console.log('re')
        },[data, dimensions],
    );

    return <svg 
        ref={svgRef} 
        ></svg>
}

export default NodeSVG
