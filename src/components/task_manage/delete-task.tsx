import { TaskInfo } from "@/const/interface";
import { Button, List, message, Spin } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";

/**
 * 删除任务组件
 * @returns 删除任务组件
 */
const DeleteTask: React.FC = () => {
  const [taskInfo, setTaskInfo] = useState<TaskInfo[]>([]);
  const [deleteNum, setDeleteNum] = useState(0);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    axios
      .get("/api/task", {
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem("token")}`,
        },
      })
      .then((value) => {
        if (value.data.code === 0) setTaskInfo(value.data?.demander_tasks);
        else message.error(`获取任务失败 ${value.data?.code}`);
      })
      .catch((reason) => {
        console.log(reason);
        message.error(`获取任务失败 ${reason?.response?.data?.message}`);
      })
      .finally(() => setLoading(false));
  }, [deleteNum]);

  const onDelete = (taskId: number) => {
    setLoading(true);

    axios
      .delete(`/api/task/`, {
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem("token")}`,
        },
        params: { task_id: taskId },
      })
      .then((value) => {
        if (value.data.code === 0) {
          setDeleteNum((num) => num + 1);
          message.success("删除成功");
        } else {
          message.error("删除任务失败");
        }
      })
      .catch((reason) => {
        console.log(reason);
        message.error("删除任务失败");
      })
      .finally(() => setLoading(false));
  };

  return loading ? (
    <Spin tip="加载中" />
  ) : (
    <List
      dataSource={taskInfo}
      bordered
      renderItem={(item) => (
        <>
          <List.Item>{item.title}</List.Item>
          <List.Item>
            <Button onClick={() => onDelete(item.task_id as number)} danger>
              删除
            </Button>
          </List.Item>
        </>
      )}
    />
  );
};

export default DeleteTask;
