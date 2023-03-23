import TaskInfoForm from "./taskInfoForm";
import { TaskInfo } from "@/const/interface";
import { useState } from "react"
import React from "react";

const CreateTaskForm: React.FC = () => {
  const [taskInfo, setTaskInfo] = useState<TaskInfo>({} as TaskInfo);
  const onFinish = () => {
    console.log(taskInfo);
    // TODO: 发送请求 
  }

  return (
    <TaskInfoForm taskInfo={taskInfo} setTaskInfo={(info) => {setTaskInfo(info)}} onFinish={onFinish}/>
  )
}

export default CreateTaskForm;
