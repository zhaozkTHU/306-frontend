import { TaskInfo } from "@/const/interface";
import { Table, message } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import type { ColumnsType } from "antd/es/table";

interface DataType {
  task_id: number,
  create_at: number,
  deadline: string,
  template: TaskInfo["template"],
  reward: number,
  time: number,
  demander_id: number;
}

const columns: ColumnsType<DataType> = [
  {
    title: "任务ID",
    dataIndex: "task_id"
  },
  {
    title: "创建时间",
    dataIndex: "create_at",
    render: (create_at) => new Date(create_at).toLocaleDateString()
  },
  {
    title: "截止日期",
    dataIndex: "deadline",
    render: (deadline) => new Date(deadline).toLocaleDateString()
  },
  {
    title: "任务奖励",
    dataIndex: "reward",
    render: (reward) => `$${reward}`
  },
  {
    title: "任务模板",
    dataIndex: "template"
  },
  {
    title: "任务限时",
    dataIndex: "time",
    render: (time) => `${time}s`
  }
];

const LabelerChecking = () => {
  const [data, setData] = useState<DataType[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    axios.get("/api/completed", { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } })
      .then((value) => setData(value.data.data))
      .catch((reason) => message.error(reason.message))
      .finally(() => setLoading(false));
  });


  return (
    <Table columns={columns} dataSource={data} loading={loading} />
  );
};

export default LabelerChecking;
