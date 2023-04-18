import React, { useState } from "react";
import { Button, Modal } from "antd";
import { TaskInfo } from "@/const/interface";
import ClassificationComponent from "@/components/task_label/Option_tag";
import SVTagComponent from "@/components/task_label/Audio_Video_tag";

interface TagBoardProps {
  task: TaskInfo;
}
const TagBoard: React.FC<TagBoardProps> = (prop: TagBoardProps) => {
  const [open, setOpen] = useState(false);
  const task = prop.task;
  const handleCancel = () => {
    setOpen(false);
  };
  const showModal = () => {
    setOpen(true);
  };
  if (!task) {
    return <div></div>;
  }
  if (task.template === "TextClassification" || task.template === "ImagesClassification") {
    return (
      <>
        <Button type="primary" onClick={showModal}>
          tagging
        </Button>
        <Modal title="Text Classification" open={open} onCancel={handleCancel} footer={null}>
          <ClassificationComponent
            title={task.title}
            create_at={task.create_at}
            deadline={task.deadline}
            template={task.template}
            reward={task.reward}
            time={task.time}
            labeler_number={task.labeler_number}
            task_id={task.task_id}
            task_data={task.task_data}
          />
        </Modal>
      </>
    );
  } else if (task.template === "SoundTag" || task.template === "VideoTag") {
    return (
      <>
        <Button type="primary" onClick={showModal}>
          tagging
        </Button>
        <Modal title="Face Dot" open={open} onCancel={handleCancel} footer={null}>
          <SVTagComponent
            title={task.title}
            create_at={task.create_at}
            deadline={task.deadline}
            template={task.template}
            reward={task.reward}
            time={task.time}
            labeler_number={task.labeler_number}
            task_id={task.task_id}
            task_data={task.task_data}
          />
        </Modal>
      </>
    );
  } else if (task.template === "FaceTag") {
    return (
      <>
        <Button type="primary" onClick={showModal}>
          tagging
        </Button>
        <Modal title="Face Dot" open={open} onCancel={handleCancel} footer={null}>
        </Modal>
      </>
    );
  } else if (task.template === "ImageFrame") {
    return <></>;
  } else {
    return <></>;
  }
};

export default TagBoard;
