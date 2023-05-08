import { request } from "@/utils/network";
import { message } from "antd";
import { useEffect, useState } from "react"

interface Agent {
    batch_file: string;
    create_at: number;
    deadline: number;
    demander_id: number;
    labeler_id: number[];
    labeler_number: number;
    labeler_state: string[];
    reward: number;
    state: string;
    task_id: number;
    template: string;
    time: number;
    title: string;
    type: string;
}

const DemanderAgentList = () => {
  const [refreshing, setRefreshing] = useState<boolean>(true);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [detail, setDetail] = useState<Agent>({
    batch_file: "",
    create_at: 0,
    deadline: 0,
    demander_id: 0,
    labeler_id: [],
    labeler_number: 0,
    labeler_state: [],
    reward: 0,
    state: "",
    task_id: 0,
    template: "",
    time: 0,
    title: "",
    type: ""
  })
  useEffect(() => {
    request("/api/get_agent", "GET")
    .then((reponse) => {
      setAgents(reponse.data.data)
    })
    .catch((error) => {
      if (error.response) {
        message.error(`获取举报列表失败，${error.response.data.message}`);
      } else {
        message.error("获取举报列表失败，网络错误");
      }
    })
    .finally(() => {
      setRefreshing(false)
    })
  }, [refreshing])
  return <>DemanderAgentList</>
}

export default DemanderAgentList