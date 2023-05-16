import axios from "axios";

/**
 * 导出数据的回调函数
 * @param taskId 任务id
 * @param merge 是否合并数据
 * @throws 错误信息，应该是`string`
 */
const DataExportCallback = async (taskId: number, merge: boolean) => {
  let value;
  try {
    value = await axios.get("/api/data", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      params: { task_id: taskId, merge },
    });
  } catch (reason) {
    throw new Error((reason as any)?.data?.message);
  }
  if (value.data.code === 0) {
    const jsonData = JSON.stringify(value.data.tag_data);
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.download = "data.json";
    a.href = url;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } else {
    throw new Error(value.data?.message);
  }
};

export default DataExportCallback;
