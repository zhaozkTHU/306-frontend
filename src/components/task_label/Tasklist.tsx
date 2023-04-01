import { useState, useEffect } from "react";
import { Table, Button, message } from "antd";
// import { UserIdContext } from "@/pages/_app";
// import { useContext } from "react";
import { TaskInfo } from "@/const/interface";
import axios from "axios";

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<TaskInfo[]>([]);
  const [loading, setLoading] = useState(false);
  // const labelerId = useContext(UserIdContext);

  // const fetchTasks = async () => {
  //   const token = localStorage.getItem("token");
  //   setLoading(true);
  //   try {
  //     const response = await fetch("/api/destribute", {
  //       // undetermined
  //       method: "GET",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: "Bearer ${token}",
  //       },
  //       // body: JSON.stringify({ labeler_id: labelerId }),
  //     });
  //     const tasks_json = await response.json();
  //     setTasks(JSON.parse(tasks_json).tasks);
  //   } catch (error) {
  //     console.error(error);
  //     message.error("Failed to fetch tasks");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchTasks = () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    axios
      .get("/api/destribute", { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => {
        const tasks_json = response.data;
        setTasks(tasks_json.tasks);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        message.error("Failed to fetch tasks");
        setLoading(false);
      });
  };

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
        fetchTasks();
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        message.error("Failed to update task status");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
    },
    {
      title: "Style",
      dataIndex: "style",
    },
    {
      title: "Reward",
      dataIndex: "reward",
      render: (reward: number) => `$${reward}`,
    },
    {
      title: "Deadline",
      dataIndex: "deadline",
      render: (deadline: number) => new Date(deadline).toLocaleString(),
    },
    {
      title: "Actions",
      render: (_: any, task: TaskInfo) => (
        <>
          <Button onClick={() => handleStatusChange(Number(task.task_id), "tagging")}>
            Accept
          </Button>
          <Button onClick={() => handleStatusChange(Number(task.task_id), "undesignated")}>
            Refuse
          </Button>
        </>
      ),
    },
  ];

  return (
    <>
      <Button onClick={fetchTasks}>Update</Button>
      <Table dataSource={tasks} columns={columns} loading={loading} rowKey="id" />
    </>
  );
};

export default TaskList;
