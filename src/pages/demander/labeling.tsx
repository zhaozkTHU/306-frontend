import DemanderTaskBlock, { DemanderTaskBlockProps } from "@/components/demander_task_block/demander-task-block";
import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Empty } from "antd";

const DemanderLabeling = () => {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState<boolean>(true);
  const [tasks, setTasks] = useState<DemanderTaskBlockProps[]>([]);
  useEffect(() => {
    axios
      .get("/api/task/labeling", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        const newTasks = response.data.task_list.map((task: any) => {
          return { ...task, state: "labeling", isDone: [false], labeler_id: [-1] };
        });
        setTasks(newTasks);
      })
      .catch((err) => {
        console.log(err);
      });
    setRefreshing(false);
  }, [router, refreshing]);

  return refreshing ? (
    <p>Loading...</p>
  ) : (
    <>
      {tasks.length ? (
        tasks.map((task, idx) => (
          <DemanderTaskBlock {...task} key={idx} setRefreshing={setRefreshing} />
        ))
      ) : (
        <Empty description="暂无标注中的任务" />
      )}
    </>
  );
};

export default DemanderLabeling;