import { Button, Divider } from "antd";
import { Spin } from "antd/lib";
import axios from "axios";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

interface DottedProps {
  problemList: any[],
  index: number,
  setProblemList: Dispatch<SetStateAction<any[]>>
}

const Dotted = (props: DottedProps) => {
  const [loading, setLoading] = useState<boolean>(true);
  const canvasRef = useRef<any>(null);
  const [flag, setFlag] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string>("");

  const img = new Image();
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    img.onload = () => {
      canvas.width = 400;
      canvas.height = 400 * img.height / img.width;
      for (const marker of props.problemList[props.index].data ? props.problemList[props.index].data : []) {
        ctx.beginPath();
        ctx.arc(marker.x, marker.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "red";
        ctx.fill();
      }
      setLoading(false);
    };
  }, [])

  useEffect(() => {
    axios
      .get("/api/file", {
        responseType: "arraybuffer", // 将响应数据解析为 ArrayBuffer 类型
        params: { url: props.problemList[props.index].url },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        const blob = new Blob([response.data], { type: "image/jpeg" });
        const url = URL.createObjectURL(blob);
        setImageUrl(url);
        img.src = url;
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const handleMouseUp = (event: any) => {
    const offsetX = event.offsetX;
    const offsetY = event.offsetY;
    const newProblems = [...props.problemList];
    console.log(1)
    console.log([...(newProblems[props.index].data)]);
    // [...(newProblems[props.index].data ? newProblems[props.index].data : []), { x: startX / canvas.width, y: startY / canvas.height, width: width / canvas.width, height: height / canvas.height }];
    newProblems[props.index].data = [...(newProblems[props.index].data ? newProblems[props.index].data : []), { x: offsetX, y: offsetY }];
    props.setProblemList(newProblems)
    setFlag((i) => (!i));
  }


  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.addEventListener("mouseup", handleMouseUp);
    return () => {
      canvas.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const marker of props.problemList[props.index].data ? props.problemList[props.index].data : []) {
      ctx.beginPath();
      ctx.arc(marker.x, marker.y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = "red";
      ctx.fill();
    }
  }, [flag])

  return (
    <div style={{
      position: "relative",
    }}>
      <Button style={{
        backgroundColor: "#3b5999",
        color: "white"
      }}
        onClick={() => {
          const newProblems = [...props.problemList]
          newProblems[props.index].data.pop();
          props.setProblemList(newProblems);
          setFlag((i) => (!i))
        }}
      >撤销</Button>
      <Divider type="vertical" />
      <Button
        style={{
          backgroundColor: "#3b5999",
          color: "white"
        }}
        onClick={() => {
          const newProblems = [...props.problemList]
          newProblems[props.index].data.length = 0;
          props.setProblemList(newProblems);
          setFlag((i) => (!i))
          const canvas = canvasRef.current;
          const ctx = canvas.getContext("2d");
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }}
      >清空</Button>
      <Spin spinning={loading} tip={"图片加载中"}>
        <img src={imageUrl} style={{ position: "relative", top: "0", left: "0", zIndex: "1", width: 400 }} />
        <canvas
          ref={canvasRef}
          style={{ position: "absolute", top: "0", left: "0", zIndex: "2", backgroundColor: "transparent", width: 400,
          display: loading?"none":"block"
        }} />
      </Spin>
    </div>
  );
}

export default Dotted