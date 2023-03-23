import { useState, useEffect } from 'react';
import { Table, Button, message } from 'antd';

interface Task {
  id: number;
  title: string;
  style: string;
  reward: number;
  deadline: number;
}

interface Props {
  labelerId: number;
}

interface StatusChangeRequest {
  labelerId: string;
  taskId: number;
  status: string;
}

const TaskList: React.FC<Props> = ({ labelerId }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await fetch('/destribute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ labeler_id: labelerId })
      });
      const tasks = await response.json();
      setTasks(tasks);
    } catch (error) {
      console.error(error);
      message.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId: number, status: string) => {
    setLoading(true);
    try {
      const response = await fetch('/task_status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ labeler_id: labelerId, task_id: taskId, status: status })
      });
      await response.json();
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
      render: (_: any, task: Task) => (
        <>
          <Button onClick={() => handleStatusChange(task.id, 'tagging')}>Accept</Button>
          <Button onClick={() => handleStatusChange(task.id, 'undesignated')}>Refuse</Button>
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