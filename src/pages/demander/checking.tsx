import DemanderTaskBlock, { DemanderTaskBlockProps } from "@/components/demander-task-block"
import axios from "axios"
import { useEffect, useState } from "react"

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
  const [tasks, setTasks] = useState<DemanderTaskBlockProps[]>([])
  useEffect(() => {
    axios.get('task/checking', {
      headers:{
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    })
    .then((response) => {
      setTasks(response.data.task_list.map((task: any) => {
        return {...task, state: "checking"}
      }))
    })
    .catch((err) => {
    })
  })
  
  return (
    tasks.map((task) => 
      <DemanderTaskBlock {...task}/>
    )
  )  
}

export default DemanderChecking