import React, { use, useEffect, useRef, useState } from "react";
import { Button, Radio, Divider } from "antd";
import MyImage from "../my-img";

interface ImageAnnotationProps {
  src: string;
  onChange: (annotations: any[]) => void;
  tools: string;
  initialAnnotations: Annotation[];
}
type Dot = { x: number; y: number };
type Rectangle = { x: number; y: number; width: number; height: number };
type Annotation = Dot | Rectangle;
function isRectangle(annotation: Annotation): annotation is Rectangle {
  return (annotation as Rectangle).width !== undefined;
}

const ImageAnnotation = (props: ImageAnnotationProps) => {
  const isDrawingRef = useRef<boolean>(false);
  const currentAnnotationRef = useRef<Annotation | null>(null);
  const annotationsRef = useRef<Annotation[]>(props.initialAnnotations ?? []);

  const [annotations, setAnnotations] = useState<Annotation[]>(()=>{
    const newAnnotations = props.initialAnnotations ?? [];
    return newAnnotations;
  });
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
    zIndex: 1,
  };
  useEffect(() => { // clear the canvas when the URL changes(change problem)
    // Clear the annotations and the canvas when the URL changes
    clearAnnotations();
  }, [props.src]);
  useEffect(() => {
    console.log("init", props.initialAnnotations);
    setAnnotations(props.initialAnnotations ?? []);
    annotationsRef.current = props.initialAnnotations ?? [];
    drawAnnotations();
  }, [props.initialAnnotations]);  
  
  useEffect(() => {
    console.log("init", props.initialAnnotations);
    setAnnotations(props.initialAnnotations ?? []);
    drawAnnotations();
  }, []);
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
    if (
      currentAnnotationRef.current &&
      props.tools === "rectangle" &&
      isRectangle(currentAnnotationRef.current)
    ) {
      ctx.beginPath();
      ctx.rect(
        currentAnnotationRef.current.x,
        currentAnnotationRef.current.y,
        currentAnnotationRef.current?.width ?? 0,
        currentAnnotationRef.current?.height ?? 0
      );
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  };
  useEffect(() => {
    currentAnnotationRef.current = currentAnnotation;
  }, [currentAnnotation]);
  useEffect(() => {
    annotationsRef.current = annotations;
  }, [annotations]);
  useEffect(() => {
    console.log("updated state");
    console.log(currentAnnotation);
    console.log(annotations);
  }, [currentAnnotation, annotations]);
  useEffect(() => {
    console.log("updated ref");
    console.log(currentAnnotationRef.current);
    console.log(annotationsRef.current);
  }, [currentAnnotationRef, annotationsRef]);

  useEffect(() => {
    drawAnnotations();
  }, [annotations, currentAnnotation, canvasRef]);

  useEffect(() => {
    if (!canvasRef.current) {
      console.log("no canvas");
      return;
    }
    const canvas = canvasRef.current as HTMLCanvasElement;
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [props.tools, canvasRef]);

  const handleMouseDown = (event: MouseEvent) => {
    if (!canvasRef.current) {
      console.log("down no canvas");
      return;
    }
    if (canvasRef.current) {
      console.log("width: ", canvasRef.current.width, "height: ", canvasRef.current.height);
    }
    console.log("down state");
    console.log(currentAnnotation);
    console.log(annotations);
    console.log("down ref");
    console.log(currentAnnotationRef.current);
    console.log(annotationsRef.current);
    console.log("is:", isDrawingRef.current);
    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (props.tools === "dot") {
      const dot = {
        type: "dot",
        x: x,
        y: y,
      };

      setAnnotations((prevAnnotations) => {
        const newAnnotations = [...prevAnnotations, dot];
        props.onChange(newAnnotations);
        return newAnnotations;
      });
      
    } 
    else if (props.tools === "rectangle") {
      isDrawingRef.current = true;
      currentAnnotationRef.current = {
        x: x,
        y: y,
        width: 0,
        height: 0,
      };
      setCurrentAnnotation({
        x: x,
        y: y,
        width: 0,
        height: 0,
      });
      console.log("aft down state");
      console.log(currentAnnotation);
      console.log(annotations);
      console.log("aft down ref");
      console.log(currentAnnotationRef.current);
      console.log(annotationsRef.current);
      console.log("is:", isDrawingRef.current);
    }
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (!canvasRef.current || isDrawingRef.current === false) {
      console.log("move no canvas");
      return;
    }

    if (isDrawingRef.current && props.tools === "rectangle" && currentAnnotationRef.current) {
      const canvas = canvasRef.current as HTMLCanvasElement;
      const rect = canvas.getBoundingClientRect();
      const x = Math.min(Math.max(event.clientX - rect.left, 0), canvas.width);
      const y = Math.min(Math.max(event.clientY - rect.top, 0), canvas.height);

      let width = x - currentAnnotationRef.current.x;
      let height = y - currentAnnotationRef.current.y;
      let adjustedX = currentAnnotationRef.current.x;
      let adjustedY = currentAnnotationRef.current.y;

      if (width < 0) {
        adjustedX += width;
        width = -width;
      }

      if (height < 0) {
        adjustedY += height;
        height = -height;
      }

      const updatedAnnotation = {
        x: adjustedX,
        y: adjustedY,
        width: width,
        height: height,
      };

      currentAnnotationRef.current = updatedAnnotation;
      setCurrentAnnotation(updatedAnnotation);
      drawAnnotations();
    }
  };

  const handleMouseUp = (event: MouseEvent) => {
    if (!canvasRef.current) {
      console.log("up no canvas");
      return;
    }
    console.log("up state");
    console.log(currentAnnotation);
    console.log(annotations);
    console.log("up ref");
    console.log(currentAnnotationRef.current);
    console.log(annotationsRef.current);
    console.log("is:", isDrawingRef.current);

    if (props.tools === "rectangle" && currentAnnotationRef.current) {
      const canvas = canvasRef.current as HTMLCanvasElement;
      const rect = canvas.getBoundingClientRect();
      const x = Math.min(Math.max(event.clientX - rect.left, 0), canvas.width);
      const y = Math.min(Math.max(event.clientY - rect.top, 0), canvas.height);
      isDrawingRef.current = false;

      // Calculate width and height based on mouse position and starting coordinates
      let width = x - currentAnnotationRef.current.x;
      let height = y - currentAnnotationRef.current.y;
      let adjustedX = currentAnnotationRef.current.x;
      let adjustedY = currentAnnotationRef.current.y;
      // If width is negative, adjust x and width
      if (width < 0) {
        adjustedX += width;
        width = -width;
      }
      // If height is negative, adjust y and height
      if (height < 0) {
        adjustedY += height;
        height = -height;
      }
      const finalAnnotation = {
        x: adjustedX,
        y: adjustedY,
        width: width,
        height: height,
      };

      annotationsRef.current = [...annotationsRef.current, finalAnnotation];
      currentAnnotationRef.current = null;
      setAnnotations((prevAnnotations) => {
        const newAnnotations = [...prevAnnotations, finalAnnotation];
        props.onChange(newAnnotations);
        return newAnnotations;
      });
      setCurrentAnnotation(null);
      drawAnnotations();
      isDrawingRef.current = false;
      console.log("aft up state:");
      console.log(currentAnnotation);
      console.log(annotations);
      console.log("aft up ref:");
      console.log(currentAnnotationRef.current);
      console.log(annotationsRef.current);
      console.log("is:", isDrawingRef.current);
    }
    isDrawingRef.current = false;
  };

  const clearAnnotations = () => {
    setAnnotations([]);
    setCurrentAnnotation(null);
    annotationsRef.current = [];
    isDrawingRef.current = false;
    currentAnnotationRef.current = null;
    props.onChange([]);
    drawAnnotations();
  };

  const undoLastAnnotation = () => {
    const newAnnotations = annotations.slice(0, -1);
    annotationsRef.current = newAnnotations;
    setCurrentAnnotation(null);
    currentAnnotationRef.current = null;
    isDrawingRef.current = false;
    setAnnotations(newAnnotations);
    props.onChange(newAnnotations);
    drawAnnotations();
  };

  const handleImageLoad = (size: { width: number; height: number }) => {
    if (canvasRef.current) {
      canvasRef.current.width = size.width;
      canvasRef.current.height = size.height;
      console.log("width: ", size.width, "height: ", size.height);
    }
  };

  return (
    <div style={imageAnnotationContainerStyle}>
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
      <canvas ref={canvasRef} style={{ ...annotationOverlayStyle /*border:"solid"*/ }} />
      <Divider />
      <div style={toolbarStyle}>
        <Radio.Group value={props.tools} disabled={true} buttonStyle="solid">
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
    </div>
  );
};

export default ImageAnnotation;
