import TaskInfoForm from "./task-info-form";
import { TaskInfo } from "@/const/interface";
import { useState } from "react";
import React from "react";
import { request } from "@/utils/network";
import { message, Spin } from "antd";

const UpdateTask: React.FC<{ taskId: number; }> = (props) => {
  // TODO: 获取数据
  const [taskInfo, setTaskInfo] = useState<TaskInfo>({} as TaskInfo);
  const [loading, setLoading] = useState(true);
  request("/api/task", "GET", { task_id: props.taskId })
    .then((res) => { setTaskInfo(res); setLoading(false); })
    .catch((reason) => { console.log(reason); message.error("获取数据失败"); });
  const onFinish = () => {
    setLoading(true);
    console.log(taskInfo);
    request("/api/task", "PUT", taskInfo)
      .then((_) => { setLoading(false); message.success("更新成功"); })
      .catch((reason) => { console.log(reason); setLoading(false); message.error("更新失败"); });
  };

  return (
    loading ? <Spin tip="加载中" /> :
      <TaskInfoForm taskInfo={taskInfo} setTaskInfo={(info) => { setTaskInfo(info); }} onFinish={onFinish} />
  );
};

export default UpdateTask;
