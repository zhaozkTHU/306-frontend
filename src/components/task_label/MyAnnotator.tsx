import React, { useEffect, useRef, useState } from 'react';
import { Button, Radio } from 'antd';
import MyImage from '../my-img';
import 'antd/dist/antd.css';

interface ImageAnnotationProps {
    src: string;
    onChange: (annotations: any[]) => void;
    tools: string;
}
type Dot = { x: number; y: number };
type Rectangle = { x: number; y: number; width: number; height: number };
type Annotation = Dot | Rectangle;

const ImageAnnotation = (props: ImageAnnotationProps) => {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [currentAnnotation, setCurrentAnnotation] = useState<Annotation | null>(null);
  const [tools, setTools] = useState<string>(props.tools);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const imageAnnotationContainerStyle: React.CSSProperties = {
    position: 'relative' as 'relative',
    display: 'inline-block',
  };

  const toolbarStyle = {
    marginBottom: '10px',
  };

  const annotationOverlayStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    pointerEvents: 'none',
  };

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    const canvas = canvasRef.current as HTMLCanvasElement;
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
  
    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
    };
  }, [props.tools, canvasRef]);
  

  const handleMouseDown = (event: MouseEvent) => {
    if (props.tools === 'dot') {
      const dot = {
        type: 'dot',
        x: event.clientX,
        y: event.clientY,
      };
      setAnnotations([...annotations, dot]);
      props.onChange([...annotations, dot]);
    } else if (props.tools === 'rectangle') {
      setCurrentAnnotation({
        x: event.clientX,
        y: event.clientY,
        width: 0,
        height: 0,
      });
    }
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (props.tools === 'rectangle' && currentAnnotation) {
      const updatedAnnotation = {
        ...currentAnnotation,
        width: event.clientX - currentAnnotation.x,
        height: event.clientY - currentAnnotation.y,
      };
      setCurrentAnnotation(updatedAnnotation);
    }
  };

  const handleMouseUp = () => {
    if (props.tools === 'rectangle' && currentAnnotation) {
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

  return (
    <div style={imageAnnotationContainerStyle}>
      <div style={toolbarStyle}>
        <Radio.Group
          defaultValue="dot"
          buttonStyle="solid"
          onChange={(e) => setTools(e.target.value)}
        >
          <Radio.Button value="dot">Dot</Radio.Button>
          <Radio.Button value="rectangle">Rectangle</Radio.Button>
        </Radio.Group>
        <Button onClick={clearAnnotations} style={{ marginLeft: '10px' }}>
          Clear
        </Button>
        <Button onClick={undoLastAnnotation} style={{ marginLeft: '10px' }}>
          Undo
        </Button>
      </div>
      <MyImage url={props.src}/>
      <canvas ref={canvasRef} style={annotationOverlayStyle} />
    </div>
  );
};

export default ImageAnnotation;
