import TaskInfoForm from "./task-info-form";
import { TaskInfo } from "@/const/interface";
import { useContext, useState } from "react";
import React from "react";
import { UserIdContext } from "@/pages/_app";
import dayjs from "dayjs";
import { request } from "@/utils/network";
import { message } from "antd";
import { useRouter } from "next/router";

const CreateTask: React.FC = () => {
  const userId = useContext(UserIdContext);
  const [taskInfo, setTaskInfo] = useState<TaskInfo>({} as TaskInfo);
  const router = useRouter();
  const onFinish = () => {
    setTaskInfo({
      ...taskInfo,
      create_at: new Date().valueOf(),
      deadline: dayjs(taskInfo.deadline).valueOf(),
      demander_id: userId
    });
    console.log(taskInfo);
    // request("/api/task", "POST", taskInfo)
    //   .then((value) => {
    //     console.log(value);
    //     message.success("发布成功");
    //     setTimeout(() => router.push("/"), 1000);
    //   })
    //   .catch((reason) => {
    //     console.log(reason);
    //     message.error("发送失败");
    //     setTimeout(() => router.push("/"), 1000);
    //   });
  };

  return (
    <TaskInfoForm taskInfo={taskInfo} setTaskInfo={(info) => { setTaskInfo(info); }} onFinish={onFinish} />
  );
};

export default CreateTask;
