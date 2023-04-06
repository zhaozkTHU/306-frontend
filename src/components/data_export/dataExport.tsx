import { message } from "antd";
import axios from "axios";

/**
 * 导出数据的回调函数
 * @param taskId 任务id 
 * @param merge 是否合并数据
 */
export const DataExportCallback = (taskId: number, merge: boolean) => {
  axios
    .post(
      "/api/data",
      { task_id: taskId, merge: merge },
      {
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem("token")}`,
        },
      }
    )
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
        message.error(`导出失败 ${value.data?.message}`);
      }
    })
    .catch((reason) => {
      console.log(reason);
      message.error(`网络错误 ${reason?.response?.data?.message}`);
    });
};

export default DataExportCallback;
