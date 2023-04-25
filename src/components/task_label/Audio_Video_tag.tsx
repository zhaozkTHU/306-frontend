import React, { useState, useEffect } from "react";
import { Button, Radio, Input, message, Modal, Steps } from "antd";
import axios from "axios";
import { TaskInfo, TagProblem, isTagProblem } from "@/const/interface";
import MyAudio from "../my-audio";
import MyVideo from "../my-video";

const SVTagComponent: React.FC<TaskInfo> = (taskInfo) => {
  const [currentProblemIndex, setCurrentProblemIndex] = useState(() => { // keep current pro id
    const storedCurrentProblemIndex = localStorage.getItem(`currentProblemIndex-${taskInfo.task_id}`);
    return storedCurrentProblemIndex ? JSON.parse(storedCurrentProblemIndex) : 0;
  });
  const [chosenOptionIndex, setChosenOptionIndex] = useState<number | null>(() => { // curreny pro choice
    const storedChosenOptionIndex = localStorage.getItem(`chosenOptionIndex-${taskInfo.task_id}-${currentProblemIndex}`);
    return storedChosenOptionIndex ? JSON.parse(storedChosenOptionIndex) : null;
  });
  const [inputValue, setInputValue] = useState<string | null>(null);

  const filteredTaskData = (taskInfo.task_data as Array<any>).filter(isTagProblem);
  const [chosenOptionsAll, setChosenOptionsAll] = useState<Array<{ choiceIndex: number; input?: string }>>(() => {
    const storedChosenOptionsAll = localStorage.getItem(`chosenOptionsAll-${taskInfo.task_id}`);
    return storedChosenOptionsAll
      ? JSON.parse(storedChosenOptionsAll)
      : filteredTaskData.map((problem) => problem.data || { choiceIndex: -1 } );
  });
  const [savedProblems, setSavedProblems] = useState<boolean[]>(() => {
    const storedSavedProblems = localStorage.getItem(`savedProblems-${taskInfo.task_id}`);
    return storedSavedProblems
      ? JSON.parse(storedSavedProblems)
      : new Array(filteredTaskData.length).fill(false);
  });
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(() => {
    const storedTimer = localStorage.getItem(`lastSaveTime-${taskInfo.task_id}-${currentProblemIndex}`);
    return storedTimer ? JSON.parse(storedTimer) : 0;
  });
  const [timeRemaining, setTimeRemaining] = useState(taskInfo.deadline - Date.now());

  const currentProblem = filteredTaskData[currentProblemIndex] as TagProblem;
  const { Step } = Steps;

  const handleStepClick = (index: number) => {
    const lastSaveKey = `lastSaveTime-${taskInfo.task_id}-${currentProblemIndex}`;
    localStorage.setItem(lastSaveKey, JSON.stringify(timer));

    setCurrentProblemIndex(index);
    setChosenOptionIndex(filteredTaskData[index].data?.choiceIndex || null);
    const storedChosenOptions = localStorage.getItem(`chosenOptionIndex-${taskInfo.task_id}-${index}`);
    setChosenOptionIndex(storedChosenOptions ? JSON.parse(storedChosenOptions) : []);

    const storedTimer = localStorage.getItem(`lastSaveTime-${taskInfo.task_id}-${index}`);
    setTimer(storedTimer ? JSON.parse(storedTimer) : 0);
  };

  const completedProblemsCount = savedProblems.filter((saved) => saved).length;
  const totalProblemsCount = filteredTaskData.length;

  // save answers into localstorage
  useEffect(() => {
    localStorage.setItem(`chosenOptionsAll-${taskInfo.task_id}`, JSON.stringify(chosenOptionsAll));
  }, [chosenOptionsAll]);
  useEffect(() => {
    localStorage.setItem(`chosenOptions-${taskInfo.task_id}-${currentProblemIndex}`, JSON.stringify(chosenOptionIndex));
  }, [chosenOptionIndex]);
  useEffect(() => {
    localStorage.setItem(`savedProblems-${taskInfo.task_id}`, JSON.stringify(savedProblems));
  }, [savedProblems]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prevTimer: number) => prevTimer + 1);
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [currentProblemIndex]);

  useEffect(() => {
    setChosenOptionIndex(currentProblem.data?.choiceIndex || null);
    setInputValue(currentProblem.data?.input || null);
  }, [currentProblem]);

  const handleSVChange = (e: any) => {
    setChosenOptionIndex(e.target.value);
  };

  const handleInputChange = (e: any) => {
    setInputValue(e.target.value);
  };

  const handleSave = () => {
    const firstSaveKey = `firstSaveTime-${taskInfo.task_id}-${currentProblemIndex}`;
    if (!localStorage.getItem(firstSaveKey)) {
      localStorage.setItem(firstSaveKey, JSON.stringify(timer));
    }

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
    const allSaved = savedProblems.every((problemSaved) => problemSaved);
    if (!allSaved) {
      message.warning("未保存所有题目答案");
      return;
    }
    const tag_data = {
      tag_style: taskInfo.template,
      tag_time: Date.now(),
      tags: filteredTaskData.map((problem, problemIndex) => ({
        soundUrl: problem.url,
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
      setCurrentProblemIndex((prevState: number) => prevState - 1);
    } else {
      message.warning("这是第一道题！");
    }
  };

  const handleNext = () => {
    if (currentProblemIndex < filteredTaskData.length - 1) {
      setCurrentProblemIndex((prevState: number) => prevState + 1);
    } else {
      message.warning("这是最后一道题！");
    }
  };

  if (taskInfo.template === "SoundTag" || taskInfo.template === "VideoTag") {
    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>{currentProblem.description}</div>
          <div>{`Timer: ${timer}s`}</div>
        </div>
        { taskInfo.template === "SoundTag" ? 
          (<MyAudio url={"/api/audio?url=" + currentProblem.url} controls />) : (<MyVideo url={"/api/video?url=" + currentProblem.url} controls />)
        }
        <Radio.Group onChange={handleSVChange} value={chosenOptionIndex}>
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
  } else {
    return (
      <div>Error: Invalid task type!</div>
    );
  }
};

export default SVTagComponent;
