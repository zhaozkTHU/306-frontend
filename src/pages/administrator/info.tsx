import CanvasImage from '@/components/canvas_image/canvas-image';

import React from 'react';
const AdministratorInfo = () => {
  return (
    <>
    <CanvasImage data={[{leftup: [50, 60], height: 100, width: 80},
      {leftup: [40, 70], height: 90, width: 40},
      {leftup: [300, 30], height: 170, width: 50},
      {leftup: [170, 50], height: 80, width: 70},
      {leftup: [80, 90], height: 50, width: 100},]} 
      src={'/logo/logo.png'} 
      type={'rectangle'} />

    <CanvasImage data={[[20, 20], [30, 30], [23, 45], [60, 78]]} src={'/media/img/taskimg/2a1alfaak4Uz2Om1Mg1Wa1.jpg'}
      type="point"
      />
    </>
  )
}

export default AdministratorInfo;