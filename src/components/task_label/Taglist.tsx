import React, { useState, useEffect } from "react";
// import { UserIdContext } from "@/pages/_app";
// import { useContext } from "react";
import { Button, Table, Modal, message } from "antd";
import { TaskInfo } from "@/const/interface";
import TextClassificationComponent from "@/components/task_label/Option_tag";
import axios from "axios"

const TagList: React.FC = () => {
  const [tasks, setTasks] = useState<TaskInfo[]>([]);
  // const labelerId = useContext(UserIdContext);

  // const fetchTasks = async () => {
  //   const token = localStorage.getItem("token");
  //   const response = await fetch("/api/labeling", {
  //     // undetermined
  //     method: "GET",
  //     headers: { Authorization: `Bearer ${token}` }
  //     //   body: JSON.stringify({ labeler_id: labelerId }),
  //   });
  //   const data_json = await response.json();
  //   setTasks(JSON.parse(data_json).task);
  // };
  const fetchTasks = () => {
    const token = localStorage.getItem("token");
    axios
      .get("/api/labeling", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const tasks_json = response.data;
        setTasks(tasks_json.task);
      })
      .catch((error) => {
        console.error(error);
        message.error("Failed to fetch tasks");
      })
  };

  const Taggingboard = (task: TaskInfo) => {
    // 在这里处理跳转到标注组件的逻辑，需要传入task数据
    const [open, setOpen] = useState(true);

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
            labeler_num={task.labeler_num}
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
      title: "Style",
      dataIndex: "style",
      key: "style",
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
  ];

  return (
    <>
      <Table columns={columns} dataSource={tasks} rowKey="task_id" />
      <Button onClick={fetchTasks}>Update</Button>
    </>
  );
};

export default TagList;
