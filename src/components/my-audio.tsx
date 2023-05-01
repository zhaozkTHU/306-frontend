import axios from "axios";
import { useState, useEffect } from "react";
import { Typography } from "antd";

const { Paragraph } = Typography;

interface MyAudioProps {
  url: string;
  style?: any;
  controls?: boolean;
}

const MyAudio = (props: MyAudioProps) => {
  const [audioUrl, setAudioUrl] = useState<string>("");

  useEffect(() => {
    axios
      .get("/api/file", {
        responseType: "arraybuffer",
        params: { url: props.url },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        const blob = new Blob([response.data], { type: "audio/mpeg" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [props.url]);

  return <audio src={audioUrl} controls={props.controls ?? true} />;
};

export default MyAudio;
