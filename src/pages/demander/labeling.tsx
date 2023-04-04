import DemanderTaskBlock, { DemanderTaskBlockProps } from "@/components/demander-task-block";
import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

const DemanderLabeling = () => {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState<boolean>(true);
  const [tasks, setTasks] = useState<DemanderTaskBlockProps[]>([]);
  useEffect(() => {
    setRefreshing(true);
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
  }, [router]);

  return refreshing ? (
    <p>Loading...</p>
  ) : (
    tasks.map((task, idx) => <DemanderTaskBlock {...task} key={idx} />)
  );
};

export default DemanderLabeling;
