import TaskInfoForm from "./task-info-form";
import { TaskInfo } from "@/const/interface";
import { useEffect, useState } from "react";
import React from "react";
import { message, Spin } from "antd";
import axios from "axios";
import { useRouter } from "next/router";

const UpdateTask: React.FC<{ taskId: number }> = (props) => {
  // TODO: 获取数据
  const [taskInfo, setTaskInfo] = useState<TaskInfo>({} as TaskInfo);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;

    axios
      .get("/api/task", {
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem("token")}`,
        },
        params: { task_id: props.taskId },
      })
      .then((value) => {
        if (value.data.code === 0) {
          setTaskInfo(value.data.data);
        } else {
          message.error("获取数据失败");
        }
      })
      .catch((reason) => {
        console.log(reason);
        message.error("获取数据失败");
      })
      .finally(() => setLoading(false));
  }, [router, props.taskId]);

  const onFinish = (info: TaskInfo) => {
    setLoading(true);
    setTaskInfo({ ...taskInfo, ...info });

    axios
      .put("/api/task", taskInfo, {
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem("token")}`,
        },
      })
      .then((value) => {
        if (value.data.code === 0) console.log("更新成功");
        else message.error("更新失败");
      })
      .catch((reason) => {
        console.log(reason);
        message.error("网络错误");
      })
      .finally(() => setLoading(false));
  };

  return loading ? (
    <Spin tip="加载中" />
  ) : (
    <TaskInfoForm taskInfo={taskInfo} onFinish={(info) => onFinish(info)} />
  );
};

export default UpdateTask;
