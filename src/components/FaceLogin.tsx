import React, { useState, useRef } from "react";
import { Button, Divider, Modal, message } from "antd";

interface CameraButtonProps {
  fileName: string;
  onFinish: (faceImage: File) => void;
}

const CameraButton: React.FC<CameraButtonProps> = (props) => {
  const [open, setOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleOk = () => {
    const canvas = canvasRef.current;
    if(canvas) {
      canvas.width = 1080;
      canvas.height = 720;
    }
    const context = canvas?.getContext("2d");
    if (videoRef.current && context) {
      if (canvas) context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      else context.drawImage(videoRef.current, 0, 0);
      canvas?.toBlob((blob) => {
        const file = new File([blob as Blob], props.fileName, { type: "image/png" });
        props.onFinish(file);
      });
      setOpen(false);
    }
  };

  const handleCancel = () => setOpen(false);

  const handleCapture = () => {
    const video = videoRef.current;
    const constraints: MediaStreamConstraints = { audio: false, video: true };
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        if (video) {
          video.srcObject = stream;
          video.play();
        }
        setOpen(true);
      })
      .catch((err) => {
        console.error(err);
        message.error("获取摄像头失败");
      });
  };

  return (
    <>
      {/* <Button onClick={handleCapture}>拍摄图片</Button> */}
      {/* <Modal title="拍摄图片" open={open} onOk={handleOk} onCancel={handleCancel}> */}
        <video ref={videoRef} style={{width: 400}}/>
        <canvas ref={canvasRef} style={{ display: "none" }} />
        <Divider/>
        <Button onClick={handleCapture}>打开摄像头</Button>
        <Divider type="vertical"/>
        <Button onClick={handleOk}>拍照</Button>
      {/* </Modal> */}
    </>
  );
};

export default CameraButton;
export type { CameraButtonProps };
