import { useContext } from "react";
import { message } from "antd";
import { TokenContext } from "@/pages/_app";
import axios from "axios";

export const DataExportCallback = (taskId: number, merge: boolean) => {
  const token = useContext(TokenContext);
  axios.post("/api/data", { task_id: taskId, merge: merge }, { headers: { Authorization: `Bearer ${token as string}` } })
    .then((value) => {
      if (value.data.code === 0) {
        const jsonData = JSON.stringify(value.data.data);
        const blob = new Blob([jsonData], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.download = "data.json";
        a.href = url;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        message.success("导出成功");
      } else {
        message.error("导出失败");
      }
    })
    .catch((reason) => {
      console.log(reason);
      message.error("网络错误");
    });
};

export default DataExportCallback;
