import React, { useState, useEffect } from "react";
import { Button, Table, Modal, message } from "antd";
import { TaskInfo } from "@/const/interface";
import TagBoard from "./TagBoard";
import axios from "axios";

const TagList: React.FC = () => {
  const [tasks, setTasks] = useState<TaskInfo[]>([]);
  const [loading, setLoading] = useState(false);

  const handleStatusChange = (taskId: number, response: string) => {
    setLoading(true);
    const token = localStorage.getItem("token");
    axios
      .post(
        "/api/task_status",
        { task_id: taskId, response: response },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {
        setTasks([]);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        message.error("Failed to update task status");
        setLoading(false);
      });
  };
  const fetchTasks = () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    axios
      .get("/api/labeling", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const tasks_json = response.data;
        const task: TaskInfo[] = [
          {
            task_id: tasks_json.task_id,
            title: tasks_json.title,
            create_at: tasks_json.create_at,
            deadline: tasks_json.deadline,
            template: tasks_json.template,
            reward: tasks_json.reward,
            time: tasks_json.time,
            labeler_number: tasks_json.labeler_number,
            demander_id: tasks_json.demander_id,
            task_data: tasks_json.task_data,
          },
        ];
        setTasks([tasks_json.task]);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        message.warning("没有更新的任务了！");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const columns = [
    { title: "Title", dataIndex: "title" },
    {
      title: "Reward",
      dataIndex: "reward",
      render: (reward: number) => `$${reward}`,
    },
    {
      title: "Deadline",
      dataIndex: "deadline",
      render: (text: number) => new Date(text).toLocaleString(),
    },
    { title: "Template", dataIndex: "template" },
    {
      title: "Actions",
      render: (_: any, record: TaskInfo) => (
        <>
          <TagBoard task={record} />
          <Button
            onClick={() => handleStatusChange(Number(record.task_id), "no")}
          >
            Refuse
          </Button>
        </>
      ),
    },
  ];

  return (
    <>
      <TagTable columns={columns} tasks={tasks} loading={loading} />
      <Button onClick={fetchTasks}>Update</Button>
    </>
  );
};

interface TagTableProps {
  tasks: TaskInfo[];
  columns: any;
  loading: boolean;
}

const TagTable: React.FC<TagTableProps> = ({ tasks, columns, loading }) => {
  return (
    <Table
      dataSource={tasks}
      columns={columns}
      loading={loading}
      rowKey="task_id"
    />
  );
};

export default TagList;
