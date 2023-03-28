import { TaskInfo } from "@/const/interface";
import { UserIdContext } from "@/pages/_app";
import { request } from "@/utils/network";
import { Button, List, message, Spin } from "antd";
import React, { useContext, useEffect, useState } from "react";

const DeleteTask: React.FC = () => {
  const userId = useContext(UserIdContext);
  const [taskInfo, setTaskInfo] = useState<TaskInfo[]>([]);
  const [deleteNum, setDeleteNum] = useState(0);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    request(`/api/task/demander_id?${userId}`, "GET")
      .then((value) => {
        setTaskInfo(value.demander_tasks);
      })
      .catch((reason) => {
        console.log(reason);
        message.error("获取任务失败");
      })
      .finally(() => setLoading(false));
  }, [deleteNum, userId]);

  const onDelete = (taskId: number) => {
    setLoading(true);
    request(`/api/task/task_id?${taskId}`, "DELETE")
      .then((_) => {
        setDeleteNum((num) => num + 1);
        message.success("删除成功");
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
