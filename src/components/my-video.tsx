import axios from "axios";
import { useState, useEffect } from "react";
import { Typography } from "antd";

const { Paragraph } = Typography;

interface MyVideoProps {
  url: string;
  style?: any;
  controls?: boolean;
  poster?: string;
}

const MyVideo = (props: MyVideoProps) => {
  const [videoUrl, setVideoUrl] = useState<string>("");

  useEffect(() => {
    axios
      .get(`${props.url}`, {
        responseType: "arraybuffer",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        const blob = new Blob([response.data], { type: "video/mp4" });
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [props.url]);

  return (
    <Paragraph style={props.style}>
      <video src={videoUrl} controls={props.controls ?? true} poster={props.poster} />
    </Paragraph>
  );
};

export default MyVideo;
