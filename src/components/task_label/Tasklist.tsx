import { useState, useEffect } from "react";
import { Table, Button, message } from "antd";
import { TaskInfo } from "@/const/interface";
import axios from "axios";
import { render } from "@testing-library/react";

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<TaskInfo[]>([]);
  const [loading, setLoading] = useState(false);
  // const labelerId = useContext(UserIdContext);

  const fetchTasks = () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    axios
      .get("/api/distribute", { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => {
        const tasks_json = response.data;
        const task: TaskInfo[] = [{
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
        }]
        setTasks(task);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        message.error("没有更新的任务了!");
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
  }, [tasks]);

  const columns = [
    { title: "Title", dataIndex: "title" },
    { title: "Template", dataIndex: "template" },
    { title: "Reward", dataIndex: "reward", render: (reward: number) => `$${reward}` },
    { title: "Deadline", dataIndex: "deadline", render: (deadline: number) => new Date(deadline).toLocaleString() },
    { title: "Actions",
      render: (_: any, task: TaskInfo) => (
        <>
          <Button onClick={() => handleStatusChange(Number(task.task_id), "ok")}>
            Accept
          </Button>
          <Button onClick={() => handleStatusChange(Number(task.task_id), "no")}>
            Refuse
          </Button>
        </>
      ),
    },
  ];

  return (
    <>
      <TaskTable tasks={tasks} columns={columns} loading={loading} />
      <Button onClick={fetchTasks}>Update</Button>
    </>
  );
};

interface TaskTableProps {
  tasks: TaskInfo[];
  columns: any;
  loading: boolean;
}

const TaskTable: React.FC<TaskTableProps> = ({ tasks, columns, loading }) => {
  return (
    <Table dataSource={tasks} columns={columns} loading={loading} rowKey="id" />
  );
};

export default TaskList;
