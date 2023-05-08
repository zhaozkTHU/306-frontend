import CameraButton from "@/components/FaceLogin";

const AgentDistributedTask = () => {
  return (<CameraButton fileName={"face.png"} onFinish={function (faceImage: File): void {
    const url = window.URL.createObjectURL(faceImage);
    const link = document.createElement("a");
    link.style.display = "none";
    link.href = url;
    link.download = "face.png";
    document.body.appendChild(link);
    link.click();
    URL.revokeObjectURL(link.href);
    document.body.removeChild(link);
  } } />)
};

export default AgentDistributedTask;
