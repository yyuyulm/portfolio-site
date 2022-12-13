import { useRef, useEffect } from "react";

const NodeCanvas = ({draw}) => {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current
        const context = canvas.getContext('2d')
    })
    return <canvas ref={canvasRef} draw = {draw}/>;
}
export default NodeCanvas;