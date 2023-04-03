import TaskInfoForm from "./task-info-form";
import { TaskInfo } from "@/const/interface";
import React from "react";
import { message } from "antd";
import axios from "axios";

const CreateTask: React.FC = () => {
  const onFinish = (info: TaskInfo) => {
    axios
      .post(
        "/api/task",
        { ...info, create_at: new Date().valueOf() },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      )
      .then((value) => {
        if (value.data.code === 0) message.success("发布成功");
        else message.success("发布失败");
      })
      .catch((reason) => {
        console.log(reason);
        message.error("网络错误");
      });
  };

  return <TaskInfoForm taskInfo={{} as TaskInfo} onFinish={(info: TaskInfo) => onFinish(info)} />;
};

export default CreateTask;
