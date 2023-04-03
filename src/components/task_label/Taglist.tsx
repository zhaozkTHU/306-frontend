import React, { useState, useEffect } from "react";
// import { UserIdContext } from "@/pages/_app";
// import { useContext } from "react";
import { Button, Table, Modal, message } from "antd";
import { TaskInfo } from "@/const/interface";
import TextClassificationComponent from "@/components/task_label/Option_tag";
import axios from "axios";

const TagList: React.FC = () => {
  const [tasks, setTasks] = useState<TaskInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // const labelerId = useContext(UserIdContext);
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
        message.error("Failed to fetch tasks");
        setLoading(false);
      });
    return (
      <>
        <TagTable columns={columns} tasks={tasks} />
        <Button onClick={fetchTasks}>Update</Button>
      </>
    );
  };

  const Taggingboard = (task: TaskInfo) => {
    // 在这里处理跳转到标注组件的逻辑，需要传入task数据
    setOpen(true);
    const handleCancel = () => {
      setOpen(false);
    };

    if (task.template === "ImagesClassification") {
      // 渲染图片标注组件
      return (
        <Modal
          title="Images Classification"
          open={open}
          onCancel={handleCancel}
          footer={null}
        >
          {/* <ImageClassificationComponent task={task} /> */}
        </Modal>
      );
    } else if (task.template === "TextClassification") {
      // 渲染文本标注组件
      return (
        <Modal
          title="Text Classification"
          open={open}
          onCancel={handleCancel}
          footer={null}
        >
          <TextClassificationComponent
            title={task.title}
            create_at={task.create_at}
            deadline={task.deadline}
            template={task.template}
            reward={task.reward}
            time={task.time}
            labeler_number={task.labeler_number}
            demander_id={task.demander_id}
            task_data={task.task_data}
          />
        </Modal>
      );
    }
    console.log(task);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Reward",
      dataIndex: "reward",
      key: "reward",
    },
    {
      title: "Deadline",
      dataIndex: "deadline",
      key: "deadline",
      render: (text: number) => new Date(text).toLocaleString(),
    },
    {
      title: "Template",
      dataIndex: "template",
      key: "template",
    },
    {
      title: "Tagging",
      key: "tagging",
      render: (text: any, record: TaskInfo) => (
        <Button type="primary" onClick={() => Taggingboard(record)}>
          Tagging
        </Button>
      ),
    },
    {
      title: "Refuse",
      key: "refuse",
      render: (text: any, task: TaskInfo) => (
        <Button type="primary" onClick={() => handleStatusChange(Number(task.task_id), "no")}>
            Refuse
        </Button>
      ),
    },
  ];

  return (
    <>
      <TagTable columns={columns} tasks={tasks} />
      <Button onClick={fetchTasks}>Update</Button>
    </>
  );
};

interface TagTableProps {
  tasks: TaskInfo[];
  columns: any;
}

const TagTable: React.FC<TagTableProps> = ({ tasks, columns }) => {
  return <Table columns={columns} dataSource={tasks} rowKey="task_id" />;
};

export default TagList;
