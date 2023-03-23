import React, { useState, useEffect } from 'react';
import { Table, Button } from 'antd';
// import { TextTagging } from Tagboard;

interface Task {
  id: number;
  name: string;
  status: string;
}

interface Props {
  labelerId: number;
}

const TagList: React.FC<Props> = ({ labelerId }) => {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    fetchTasks();
  }, [labelerId]);

  const fetchTasks = async () => {
    const response = await fetch('/annotating', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ labeler_id: labelerId }),
    });
    const data = await response.json();
    setTasks(data.tasks);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Action',
      key: 'action',
      render: (text: string, record: Task) => (
        <Button type="primary" onClick={() => handleTagging(record)}>
          Tagging
        </Button>
      ),
    },
  ];

  const handleTagging = (task: Task) => {
    // TODO: navigate to tagging component with the task data

    // if task.style == 'describe' 

    // if task.style == ''

  }

  return (
    <>
      <Button onClick={fetchTasks}>Update</Button>
      <Table dataSource={tasks} columns={columns} rowKey="id" />
    </>
  );
}

export default TagList;