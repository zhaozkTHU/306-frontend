import React, { useState } from 'react';
import { Button, Input, message } from 'antd';

interface Task {
  id: number;
  style: string;
  task_data: string[];
}

interface Props {
  task: Task;
  onFinish: (tagInfo: string[]) => void;
}

const TextTagging: React.FC<Props> = ({ task, onFinish }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [tagInfos, setTagInfos] = useState<string[]>(new Array(task?.task_data?.length).fill('')||0);

  const handleSave = () => {
    setTagInfos((prev) => {
      const updatedTagInfos = [...prev];
      updatedTagInfos[currentIdx] = inputRef.current?.state?.value || ''; //make sure the input exist & value state is both defined
      return updatedTagInfos;
    });
    message.success('标注信息已保存');
  };

  const handleFinish = () => {
    const hasEmptyTagInfo = tagInfos.some((tag) => tag === '');
    if (hasEmptyTagInfo) {
      message.warning('请完成所有题目的标注信息');
      return;
    }
    // 上传标注信息到后端
    const labeler_id = 1; // 假设当前用户的ID为1
    const { id: task_id } = task;
    const taginfo = tagInfos;
    fetch('/submit_note', {
      method: 'POST',
      body: JSON.stringify({ labeler_id, task_id, taginfo }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then(() => {
        message.success('标注信息上传成功');
        onFinish(tagInfos);
      })
      .catch((error) => {
        console.error('标注信息上传失败', error);
        message.error('标注信息上传失败');
      });
  };

  const handlePrev = () => {
    if (currentIdx === 0) {
      message.warning('已经是第一题了');
      return;
    }
    setCurrentIdx((prev) => prev - 1);
  };

  const handleNext = () => {
    if (currentIdx === task.task_data.length - 1) {
      message.warning('已经是最后一题了');
      return;
    }
    setCurrentIdx((prev) => prev + 1);
  };

  const inputRef = React.createRef<Input>();

  return (
    <div>
      <div>{`第 ${currentIdx + 1} 题：${task.task_data[currentIdx]}`}</div>
      <Input.TextArea ref={inputRef} placeholder="请输入标注信息" />
      <div>
        <Button onClick={handleSave}>保存</Button>
        <Button onClick={handlePrev} disabled={currentIdx === 0}>
          上一题
        </Button>
        <Button onClick={handleNext} disabled={currentIdx === task.task_data.length - 1}>
          下一题
        </Button>
      </div>
      <div>
        <Button type="primary" onClick={handleFinish}>
          完成
        </Button>
      </div>
    </div>
  );
};

export default TextTagging;
