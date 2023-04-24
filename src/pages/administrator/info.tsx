import PointCanvasImage from '@/components/canvas_image/point-canvas-image';
import CanvasImage from '@/components/canvas_image/point-canvas-image';
import RectangleCanvasImage from '@/components/canvas_image/rectangle-canvas-image';
import React, { useEffect, useRef } from 'react';
const AdministratorInfo = () => {
  return (
    <>
    <PointCanvasImage data={[[20, 20], [30, 30], [23, 45], [60, 78]]} src={'/logo/logo.png'}/>
    <RectangleCanvasImage data={[
      {leftup: [50, 60], height: 80, width: 50},
      {leftup: [40, 70], height: 80, width: 50},
      {leftup: [100, 30], height: 80, width: 50},
      {leftup: [170, 50], height: 80, width: 50},
      {leftup: [80, 90], height: 80, width: 50},
      ]} src={'%2Fmedia%2Fimg%2Ftaskimg%2Fhfl9sda9dl306%E7%9A%84%E5%89%AF%E6%9C%AC.png'}/>
    </>
  )
}

export default AdministratorInfo;