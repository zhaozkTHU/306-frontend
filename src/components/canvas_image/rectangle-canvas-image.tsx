import { translateUrl } from "@/utils/valid";
import { useRef, useEffect } from "react";

interface RectangleCanvasImageProps {
  data: {
    leftup: [number, number];
    height: number;
    width: number
  }[];
  src: string
}

const colors : string[] = ["#FF0000", "#22ff00", "#d4ff00", "#00ccff"]

const RectangleCanvasImage = (props: RectangleCanvasImageProps) => {
  const canvasRef = useRef<any>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = translateUrl(props.src);
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      for (let i = 0; i < props.data.length; i++) {
        ctx.strokeStyle = colors[i%4];
        ctx.lineWidth = 2;
        ctx.strokeRect(props.data[i].leftup[0], props.data[i].leftup[1], props.data[i].width, props.data[i].height);
      }
    };
  });
  return <canvas ref={canvasRef} />;
}

export default RectangleCanvasImage