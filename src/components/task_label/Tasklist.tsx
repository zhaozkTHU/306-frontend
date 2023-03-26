import { useState, useEffect } from 'react';
import { Table, Button, message } from 'antd';
import { UserIdContext } from "@/pages/_app";
import { useContext } from "react"
import { TaskInfo } from "@/const/interface";

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<TaskInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const labelerId = useContext(UserIdContext)

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await fetch('/destribute', { // or GET??? undetermined
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ labeler_id: labelerId })
      });
      const tasks_json = await response.json();
      setTasks(JSON.parse(tasks_json).tasks);
    } catch (error) {
      console.error(error);
      message.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId: number, response: string) => {
    setLoading(true);
    try {
      const response_data = await fetch('/task_status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ labeler_id: labelerId, task_id: taskId, response: response })
      });
      await response_data.json();
      fetchTasks();
    } catch (error) {
      console.error(error);
      message.error('Failed to update task status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []); 

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title'
    },
    {
      title: 'Style',
      dataIndex: 'style'
    },
    {
      title: 'Reward',
      dataIndex: 'reward',
      render: (reward: number) => `$${reward}`
    },
    {
      title: 'Deadline',
      dataIndex: 'deadline',
      render: (deadline: number) => new Date(deadline).toLocaleString()
    },
    {
      title: 'Actions',
      render: (_: any, task: TaskInfo) => (
        <>
          <Button onClick={() => handleStatusChange(Number(task.task_id), 'tagging')}>Accept</Button>
          <Button onClick={() => handleStatusChange(Number(task.task_id), 'undesignated')}>Refuse</Button>
        </>
      )
    }
  ];

  return (
    <>
      <Button onClick={fetchTasks}>Update</Button>
      <Table dataSource={tasks} columns={columns} loading={loading} rowKey="id" />
    </>
  );
};

export default TaskList;