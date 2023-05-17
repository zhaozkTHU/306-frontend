import React, { useState, useRef, use, useEffect } from "react";
import { Button, Divider, Modal, message } from "antd";
import { CameraOutlined } from "@mui/icons-material";

const CameraVideo: React.FC<{
  fileName: string;
  onFinish: (faceImage: File) => void;
}> = (props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraOpen, setCameraOpen] = useState(false);

  useEffect(() => {
    return () => {
      const stream = videoRef.current?.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  });

  const handleOk = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = 1080;
      canvas.height = 810;
    }
    const context = canvas?.getContext("2d");
    if (videoRef.current && context) {
      if (canvas) context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      else context.drawImage(videoRef.current, 0, 0);
      canvas?.toBlob((blob) => {
        const file = new File([blob as Blob], props.fileName, { type: "image/png" });
        props.onFinish(file);
      });
    }
  };

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
      })
      .catch((err) => {
        console.error(err);
        message.error("获取摄像头失败");
      });
  };

  return (
    <>
      <video ref={videoRef} style={{ display: cameraOpen ? undefined : "none" }} />
      <canvas ref={canvasRef} style={{ display: "none" }} />
      <Divider />
      <Button onClick={() => { handleCapture(); setCameraOpen(true); }}>打开摄像头</Button>
      <Divider type="vertical" />
      <Button onClick={handleOk}>拍照</Button>
    </>
  );

};

export default CameraVideo;