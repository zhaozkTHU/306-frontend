import axios from "axios";
import { useState, useEffect } from "react";
import { Image, ImageProps } from "antd";
interface MyImageProps extends Omit<ImageProps, "src"> {
  url: string;
  onImageLoad?: (size: { width: number; height: number }) => void;
}

const MyImage = (props: MyImageProps) => {
  const [imageUrl, setImageUrl] = useState<string>("");

  useEffect(() => {
    axios
      .get("/api/file", {
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

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (props.onImageLoad) {
      const imgElement = e.target as HTMLImageElement; // Cast event target to HTMLImageElement
      const { offsetWidth, offsetHeight } = imgElement;
      props.onImageLoad({ width: offsetWidth, height: offsetHeight });
      console.log("image loaded","W: ",offsetWidth,"H: ",offsetHeight);
    }
  };

  return <Image src={imageUrl} {...props} alt={props.alt} onLoad={handleImageLoad} preview={false}/>;
};

export default MyImage;
