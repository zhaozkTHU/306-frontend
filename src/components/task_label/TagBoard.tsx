import React, { useState } from "react";
import { Button, Modal } from "antd";
import { TaskInfo } from "@/const/interface";
import OptionComponent from "@/components/task_label/Option_tag";
import SVTagComponent from "@/components/task_label/Audio_Video_tag";
import AnnotationComponent from "@/components/task_label/Box_Dot_tag";
import TripleComponent from "@/components/task_label/Triple_tag";

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
        <Modal
          title="Classification"
          open={open}
          onCancel={handleCancel}
          footer={null}
          width={"80%"}
          style={{
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        >
          <OptionComponent
            title={task.title}
            create_at={task.create_at}
            deadline={task.deadline}
            template={task.template}
            reward={task.reward}
            time={task.time}
            labeler_number={task.labeler_number}
            task_id={task.task_id}
            task_data={task.task_data}
            batch={false}
            type={task.type}
            distribute={task.distribute}
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
        <Modal
          title="Sound Video Tag"
          open={open}
          onCancel={handleCancel}
          footer={null}
          width={"80%"}
          style={{
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        >
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
            batch={false}
            type={task.type}
            distribute={task.distribute}
          />
        </Modal>
      </>
    );
  } else if (task.template === "FaceTag" || task.template === "ImageFrame") {
    return (
      <>
        <Button type="primary" onClick={showModal}>
          tagging
        </Button>
        <Modal
          title="Image annontation"
          open={open}
          onCancel={handleCancel}
          footer={null}
          width={"80%"}
          style={{
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        >
          <AnnotationComponent
            title={task.title}
            create_at={task.create_at}
            deadline={task.deadline}
            template={task.template}
            reward={task.reward}
            time={task.time}
            labeler_number={task.labeler_number}
            task_id={task.task_id}
            task_data={task.task_data}
            batch={false}
            type={task.type}
            distribute={task.distribute}
          />
        </Modal>
      </>
    );
  } else if (task.template === "TextTriple") {
    return (
      <>
        <Button type="primary" onClick={showModal}>
          tagging
        </Button>
        <Modal
          title="Text Triple"
          open={open}
          onCancel={handleCancel}
          footer={null}
          width={"80%"}
          style={{
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        >
          <TripleComponent
            title={task.title}
            create_at={task.create_at}
            deadline={task.deadline}
            template={task.template}
            reward={task.reward}
            time={task.time}
            labeler_number={task.labeler_number}
            task_id={task.task_id}
            task_data={task.task_data}
            batch={false}
            type={task.type}
            distribute={task.distribute}
          />
        </Modal>
      </>
    );
  } else {
    return <>error type</>;
  }
};

export default TagBoard;
