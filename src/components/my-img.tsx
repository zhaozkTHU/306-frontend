import axios from "axios";
import { useState, useEffect } from "react";
import { Image } from "antd";
interface MyImageProps {
  url: string,
  style?: any,
  alt?: string
}


const MyImage = (props: MyImageProps) => {
  const [imageUrl, setImageUrl] = useState<string>("");

  useEffect(() => {
    axios.get(`${props.url}`, {
      responseType: 'arraybuffer', // 将响应数据解析为 ArrayBuffer 类型
      headers: {
        'Authorization': `Bearer ${localStorage.getItem("token")}`
      }
    }
    ).then(response => {
      const blob = new Blob([response.data], { type: 'image/jpeg' });
      const url = URL.createObjectURL(blob);
      setImageUrl(url);
    }).catch(error => {
      console.error(error);
    });
  }, []);

  return (
    <Image src={imageUrl} alt={props.alt} style={{maxWidth:'100%', minWidth:'100%' }}/>
  );
}

export default MyImage;