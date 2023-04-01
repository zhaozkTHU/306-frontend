import TaskInfoForm from "./task-info-form";
import { TaskInfo } from "@/const/interface";
import { useState } from "react";
import React from "react";
import { message } from "antd";
import axios from "axios";

const CreateTask: React.FC = () => {
  const [taskInfo, setTaskInfo] = useState<TaskInfo>({} as TaskInfo);
  const onFinish = (info: TaskInfo) => {
    const time = new Date().valueOf();
    setTaskInfo({
      ...info,
      create_at: time,
    });
    axios
      .post("/api/task", taskInfo, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((value) => {
        if (value.data.code === 0) message.success("发布成功");
        else message.success("发布失败");
      })
      .catch((reason) => {
        console.log(reason);
        message.error("网络错误");
      });
  };

  return <TaskInfoForm taskInfo={taskInfo} onFinish={(info: TaskInfo) => onFinish(info)} />;
};

export default CreateTask;
