import axios from "axios";
import { useState, useEffect } from "react";
import { Image, ImageProps } from "antd";
interface MyImageProps extends Omit<ImageProps, "src"> {
  url: string;
}

const MyImage = (props: MyImageProps) => {
  const [imageUrl, setImageUrl] = useState<string>("");

  useEffect(() => {
    axios
      .get("/api/image", {
        responseType: "arraybuffer", // 将响应数据解析为 ArrayBuffer 类型
        params: { url: props.url },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        const blob = new Blob([response.data], { type: "image/jpeg" });
        const url = URL.createObjectURL(blob);
        setImageUrl(url);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [props.url]);

  return <Image src={imageUrl} {...props} alt={props.alt} />;
};

export default MyImage;
