import DemanderTaskBlock, { DemanderTaskBlockProps } from "@/components/demander-task-block"
import axios from "axios"
import { useEffect, useState } from "react"
import { useRouter } from "next/router"

const DemanderChecking = () => {
  // const tasks = [
  //   {
  //     task_id: 0,
  //     creat_at: 123,
  //     title: "文本分类任务一",
  //     state: "checking",
  //     labeler_number: 0,
  //     template: "TextClassification"
  //   },
  //   {
  //     task_id: 1,
  //     creat_at: 123,
  //     title: "文本分类任务二",
  //     state: "checking",
  //     labeler_number: 0,
  //     template: "TextClassification"
  //   },
  //   {
  //     task_id: 2,
  //     creat_at: 123,
  //     title: "文本分类任务三",
  //     state: "checking",
  //     labeler_number: 0,
  //     template: "TextClassification"
  //   }
  // ]
  const router = useRouter();
  const [refreshing, setRefreshing] = useState<boolean>(true);
  const [tasks, setTasks] = useState<DemanderTaskBlockProps[]>([]);
  useEffect(() => {
    setRefreshing(true);
    axios.get('/api/task/checking', {
      headers:{
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    })
    .then((response) => {
      const newTasks = response.data.task_list.map((task: any) => {
        return {...task, state: "checking"};
      })
      setTasks(newTasks);
    })
    .catch((err) => {
      console.log(err);
    })
    setRefreshing(false);
  }, [router])
  
  return refreshing?<p>Loading...</p>:(
    tasks.map((task, idx) => 
      <DemanderTaskBlock {...task} key={idx}/>
    )
  )
}

export default DemanderChecking