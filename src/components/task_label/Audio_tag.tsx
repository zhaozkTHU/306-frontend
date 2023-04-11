import React, { useState, useEffect } from "react";
import { Button, Radio, Input, message, Card } from "antd";
import axios from "axios";
import { TaskInfo, SoundTagProblem, isSoundTagProblem } from "@/const/interface";

const SoundTagComponent: React.FC<TaskInfo> = (taskInfo) => {
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [chosenOptionIndex, setChosenOptionIndex] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState<string | null>(null);
  const filteredTaskData = (taskInfo.task_data as Array<any>).filter(isSoundTagProblem);
  const [chosenOptionsAll, setChosenOptionsAll] = useState<Array<{ choiceIndex: number; input?: string }>> (
    filteredTaskData.map((problem) => problem.data || { choiceIndex: -1 })
  );
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  const currentProblem = filteredTaskData[currentProblemIndex] as SoundTagProblem;

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prevTimer) => prevTimer + 1);
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [currentProblemIndex]);

  useEffect(() => {
    setChosenOptionIndex(currentProblem.data?.choiceIndex || null);
    setInputValue(currentProblem.data?.input || null);
  }, [currentProblem]);

  const handleRadioChange = (e: any) => {
    setChosenOptionIndex(e.target.value);
  };

  const handleInputChange = (e: any) => {
    setInputValue(e.target.value);
  };

  const handleSave = () => {
    if (timer < taskInfo.time) {
      message.warning("标记太快了！");
      return;
    }
    const newTaskData = [...filteredTaskData];
    newTaskData[currentProblemIndex].data = {
      choiceIndex: chosenOptionIndex || -1,
      input: inputValue || undefined,
    };
    setChosenOptionsAll(newTaskData.map((problem) => problem.data || { choiceIndex: -1 }));
    message.success("已保存！");
  };

  const handleUpload = async () => {
    const tag_data = {
      tag_style: taskInfo.template,
      tag_time: Date.now(),
      tags: filteredTaskData.map((problem, problemIndex) => ({
        soundUrl: problem.soundUrl,
        description: problem.description,
        choice: problem.choice,
        data: chosenOptionsAll[problemIndex],
      })),
    };

    const token = localStorage.getItem("token");
    setLoading(true);
    axios
      .post(
        "/api/submit",
        {
          task_id: taskInfo.task_id,
          tag_data,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        message.success("已上传！");
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        message.error("提交数据失败");
        setLoading(false);
      });
  };

  const handlePrevious = () => {
    if (currentProblemIndex > 0) {
      setCurrentProblemIndex((prevState) => prevState - 1);
    } else {
      message.warning("这是第一道题！");
    }
  };

  const handleNext = () => {
    if (currentProblemIndex < filteredTaskData.length - 1) {
      setCurrentProblemIndex((prevState) => prevState + 1);
    } else {
      message.warning("这是最后一道题！");
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>{currentProblem.description}</div>
        <div>{`Timer: ${timer}s`}</div>
      </div>
      <audio src={currentProblem.soundUrl} controls />
      <Radio.Group onChange={handleRadioChange} value={chosenOptionIndex}>
        {currentProblem.choice.map((option, index) => (
          <Radio key={index} value={index}>
            {option.text}
            {option.needInput && (
              <Input
              style={{ marginLeft: 8 }}
              value={chosenOptionIndex === index ? inputValue || "" : ""}
              onChange={handleInputChange}
              disabled={chosenOptionIndex !== index}
              />
            )}
          </Radio>
        ))}
      </Radio.Group>
      <div>
        <Button onClick={handlePrevious}>上一题</Button>
        <Button onClick={handleNext}>下一题</Button>
        <Button onClick={handleSave}>保存</Button>
        <Button onClick={handleUpload} loading={loading}>
          上传
        </Button>
      </div>
    </div>
  );
};

export default SoundTagComponent;
