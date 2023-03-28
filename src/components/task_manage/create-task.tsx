import TaskInfoForm from "./task-info-form";
import { TaskInfo } from "@/const/interface";
import { useContext, useEffect, useState } from "react";
import React from "react";
import { UserIdContext } from "@/pages/_app";
import { request } from "@/utils/network";
import { message } from "antd";

const CreateTask: React.FC = () => {
  const userId = useContext(UserIdContext);
  const [taskInfo, setTaskInfo] = useState<TaskInfo>({} as TaskInfo);
  useEffect(() => {
    console.log("CreateTask", taskInfo);
  }, [taskInfo]);
  const onFinish = (info: TaskInfo) => {
    const time = new Date().valueOf();
    setTaskInfo({
      ...info,
      create_at: time,
      demander_id: userId,
    });
    request("/api/task", "POST", taskInfo)
      .then((value) => {
        console.log(value);
        message.success("发布成功");
      })
      .catch((reason) => {
        console.log(reason);
        message.error("发送失败");
      });
  };

  return (
    <TaskInfoForm taskInfo={taskInfo} onFinish={(info: TaskInfo) => onFinish(info)} />
  );
};

export default CreateTask;
