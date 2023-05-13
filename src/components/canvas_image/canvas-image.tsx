import { translateUrl } from "@/utils/valid";
import { useRef, useEffect, useState } from "react";
import { Image, Spin } from "antd";
import ImageFormatter from "../image-formatter";

interface CanvasImageProps {
  data: any[];
  src: string;
  type: "point" | "rectangle";
}

const colors: string[] = ["#FF0000", "#22ff00", "#d4ff00", "#00ccff"];

const CanvasImage = (props: CanvasImageProps) => {
  const canvasRef = useRef<any>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = translateUrl(props.src);
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      for (let i = 0; i < props.data.length; i++) {
        if (props.type == "rectangle") {
          ctx.strokeStyle = colors[i % 4];
          ctx.lineWidth = 2;
          ctx.strokeRect(
            props.data[i].x,
            props.data[i].y,
            props.data[i].width,
            props.data[i].height
          );
        } else {
          ctx.beginPath();
          ctx.arc(props.data[i].x, props.data[i].y, 3, 0, 2 * Math.PI);
          ctx.fillStyle = "red";
          ctx.fill();
        }
      }
      const dataURL = canvas.toDataURL("image/png");
      setImageUrl(dataURL);
    };
  }, []);
  return (
    <>
      <canvas width={90} ref={canvasRef} style={{ display: "none" }} />
      <ImageFormatter>
        <Image
          src={imageUrl}
          // alt="图片加载中，长时间无反应请刷新"
          width={"100%"}
          height={"100%"}
          style={{
            objectFit: "contain",
            objectPosition: "center center",
          }}
          placeholder={<>ndiuehndiu</>}
          loading="lazy"
        />
      </ImageFormatter>
    </>
  );
};

export default CanvasImage;
