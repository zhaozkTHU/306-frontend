import React, { useEffect, useRef, useState } from "react";
import { Button, Radio } from "antd";
import MyImage from "../my-img";

interface ImageAnnotationProps {
  src: string;
  onChange: (annotations: any[]) => void;
  tools: string;
}
type Dot = { x: number; y: number };
type Rectangle = { x: number; y: number; width: number; height: number };
type Annotation = Dot | Rectangle;
function isRectangle(annotation: Annotation): annotation is Rectangle {
  return (annotation as Rectangle).width !== undefined;
}

const ImageAnnotation = (props: ImageAnnotationProps) => {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [currentAnnotation, setCurrentAnnotation] = useState<Annotation | null>(null);
  const [tools, setTools] = useState<string>(props.tools);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const imageAnnotationContainerStyle: React.CSSProperties = {
    position: "relative" as const,
    display: "inline-block",
  };

  const toolbarStyle = {
    marginBottom: "10px",
  };

  const annotationOverlayStyle: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    pointerEvents: "none",
  };

  const drawAnnotations = () => {
    if (!canvasRef.current) {
      return;
    }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }
  
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    // Draw annotations
    annotations.forEach((annotation) => {
      if (props.tools === "dot" && !isRectangle(annotation)) {
        ctx.beginPath();
        ctx.arc(annotation.x, annotation.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "red";
        ctx.fill();
      } else if (props.tools === "rectangle" && isRectangle(annotation)) {
        ctx.beginPath();
        ctx.rect(annotation.x, annotation.y, annotation?.width ?? 0, annotation?.height ?? 0);
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });
  
    // Draw the current annotation (if any)
    if (currentAnnotation && props.tools === "rectangle" && isRectangle(currentAnnotation)) {
      ctx.beginPath();
      ctx.rect(
        currentAnnotation.x,
        currentAnnotation.y,
        currentAnnotation?.width ?? 0,
        currentAnnotation?.height ?? 0
      );
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  };
  useEffect(() => {
    drawAnnotations();
  }, [annotations, currentAnnotation, canvasRef]);

  
  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    const canvas = canvasRef.current as HTMLCanvasElement;
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
    };
  }, [props.tools, canvasRef]);

  const handleMouseDown = (event: MouseEvent) => {
    if (props.tools === "dot") {
      const dot = {
        type: "dot",
        x: event.clientX,
        y: event.clientY,
      };
      setAnnotations([...annotations, dot]);
      props.onChange([...annotations, dot]);
    } else if (props.tools === "rectangle") {
      setCurrentAnnotation({
        x: event.clientX,
        y: event.clientY,
        width: 0,
        height: 0,
      });
    }
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (props.tools === "rectangle" && currentAnnotation) {
      const updatedAnnotation = {
        ...currentAnnotation,
        width: event.clientX - currentAnnotation.x,
        height: event.clientY - currentAnnotation.y,
      };
      setCurrentAnnotation(updatedAnnotation);
    }
  };

  const handleMouseUp = () => {
    if (props.tools === "rectangle" && currentAnnotation) {
      setAnnotations([...annotations, currentAnnotation]);
      props.onChange([...annotations, currentAnnotation]);
      setCurrentAnnotation(null);
    }
  };

  const clearAnnotations = () => {
    setAnnotations([]);
    props.onChange([]);
  };

  const undoLastAnnotation = () => {
    const newAnnotations = annotations.slice(0, -1);
    setAnnotations(newAnnotations);
    props.onChange(newAnnotations);
  };

  const handleImageLoad = (size: { width: number; height: number }) => {
    if (canvasRef.current) {
      canvasRef.current.width = size.width;
      canvasRef.current.height = size.height;
    }
  };

  return (
    <div style={imageAnnotationContainerStyle}>
      <div style={toolbarStyle}>
        <Radio.Group
          value={props.tools}
          disabled={true}
          buttonStyle="solid"
        >
          <Radio.Button value="dot">Dot</Radio.Button>
          <Radio.Button value="rectangle">Rectangle</Radio.Button>
        </Radio.Group>
        <Button onClick={clearAnnotations} style={{ marginLeft: "10px" }}>
          Clear
        </Button>
        <Button onClick={undoLastAnnotation} style={{ marginLeft: "10px" }}>
          Undo
        </Button>
      </div>
      <MyImage
        url={`${props.src}`}
        onImageLoad={handleImageLoad}
        style={{
          objectFit: "contain",
          objectPosition: "center center",
        }}
        alt="图片加载失败"
        height="100%"
        width="100%"
      />
      <canvas ref={canvasRef} style={annotationOverlayStyle} />
    </div>
  );
};

export default ImageAnnotation;
