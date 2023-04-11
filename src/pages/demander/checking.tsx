import DemanderTaskBlock, { DemanderTaskBlockProps } from "@/components/demander_task_block/demander-task-block";
import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Empty } from "antd";

const DemanderChecking = () => {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState<boolean>(true);
  const [tasks, setTasks] = useState<DemanderTaskBlockProps[]>([]);
  useEffect(() => {
    setRefreshing(true);
    axios
      .get("/api/task/checking", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        const newTasks = response.data.task_list.map((task: any) => {
          return { ...task, state: "checking" };
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
        <Empty description="暂无待审核的任务" />
      )}
    </>
  );
};

export default DemanderChecking;
