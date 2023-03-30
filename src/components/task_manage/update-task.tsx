import TaskInfoForm from "./task-info-form";
import { TaskInfo } from "@/const/interface";
import { useEffect, useMemo, useState } from "react";
import React from "react";
import { message, Spin } from "antd";
import axios from "axios";
import { useRouter } from "next/router";

const UpdateTask: React.FC<{ taskId: number }> = (props) => {
  // TODO: 获取数据
  const [taskInfo, setTaskInfo] = useState<TaskInfo>({} as TaskInfo);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const token = useMemo(() => {
    if (!router.isReady) return undefined;
    return localStorage.getItem("token");
  }, [router]);

  useEffect(() => {
    if (!router.isReady) return;

    axios
      .post("/api/data", {}, { headers: { Authorization: `Bearer ${token}` } })
      .then((value) => {
        if (value.data.code === 0) {
          setTaskInfo(value.data.demander_tasks);
          setLoading(false);
        } else {
          message.error("获取数据失败");
        }
      })
      .catch((reason) => {
        console.log(reason);
        message.error("获取数据失败");
      });
  }, [router, token]);

  const onFinish = (info: TaskInfo) => {
    setLoading(true);
    setTaskInfo({ ...taskInfo, ...info });

    axios
      .put("/api/task", taskInfo, {
        headers: { Authorization: `Bearer ${token}` },
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
