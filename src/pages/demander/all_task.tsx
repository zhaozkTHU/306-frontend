import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import DemanderTaskBlock, { DemanderTaskBlockProps } from "@/components/demander_task_block/demander-task-block";
import { Empty } from "antd";

const DemanderAllTask = () => {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState<boolean>(true);
  const [tasks, setTasks] = useState<DemanderTaskBlockProps[]>([]);
  useEffect(() => {
    // setRefreshing(true)
    axios
      .get("/api/task", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      })
      .then((response) => {
        const newTasks = response.data.demander_tasks.map((task: any) => {
          return { ...task};
        });
        setTasks(newTasks);
      })
      .catch((err) => {
        console.log(err)
      })
      setRefreshing(false)
    }, [router, refreshing])
  
    return refreshing ? (
      <p>Loading...</p>
    ) : (
      <>
        {tasks.length ? (
          tasks.map((task, idx) => (
            <DemanderTaskBlock {...task} key={idx} setRefreshing={setRefreshing} />
          ))
        ) : (
          <Empty description="暂无任务" />
        )}
      </>
    );
};

export default DemanderAllTask;