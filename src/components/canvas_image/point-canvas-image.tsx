import { useRef, useEffect, useState } from "react";

interface PointCanvasImageProps {
  data: [number, number][]
  src: string
}

const PointCanvasImage = (props: PointCanvasImageProps) => {
  const canvasRef = useRef<any>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = props.src;
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      for (let i = 0; i < props.data.length; i++) {
        ctx.beginPath();
        ctx.arc(props.data[i][0], props.data[i][1], 3, 0, 2 * Math.PI)
        ctx.fillStyle = 'red'
        ctx.fill();
      }
    };
  });
  return <canvas ref={canvasRef} />;
}

export default PointCanvasImage