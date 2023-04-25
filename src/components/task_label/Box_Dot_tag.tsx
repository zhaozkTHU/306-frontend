import React, { useState, useEffect } from "react";
import { Button, Checkbox, message, Modal, Steps, Divider, Space } from "antd";
import { SaveOutlined, UploadOutlined, RightCircleOutlined, LeftCircleOutlined } from '@ant-design/icons';
import axios from "axios";
import {
  TaskInfo,
  isFaceTagProblem,
  FaceTagProblem,
  isImageFrameProblem,
  ImageFrameProblem,
} from "@/const/interface";
import MyImage from "../my-img";

const AnnotationComponent: React.FC<TaskInfo> = (taskInfo) => {
  const [currentProblemIndex, setCurrentProblemIndex] = useState(() => { // keep current pro id
    const storedCurrentProblemIndex = localStorage.getItem(`currentProblemIndex-${taskInfo.task_id}`);
    return storedCurrentProblemIndex ? JSON.parse(storedCurrentProblemIndex) : 0;
  });
  // while re-render, get current saved answer & upload status from localstorage
  const [chosenOptions, setChosenOptions] = useState<boolean[]>(() => {
    const storedChosenOptions = localStorage.getItem(`chosenOptions-${taskInfo.task_id}-${currentProblemIndex}`);
    return storedChosenOptions ? JSON.parse(storedChosenOptions) : [];
  });
  const [uploadCompleted, setUploadCompleted] = useState<boolean>(() => { // whether finished upload
    const storedUploadCompleted = localStorage.getItem(`uploadCompleted-${taskInfo.task_id}`);
    return storedUploadCompleted ? JSON.parse(storedUploadCompleted) : false;
  });
  const filteredTaskData = (taskInfo.task_data as Array<any>).filter(
    (taskInfo.template === "FaceTag") ? isFaceTagProblem : isImageFrameProblem
  );
  // while re-render, get the answer from localstorage
  const [chosenOptionsAll, setChosenOptionsAll] = useState<Array<boolean[]>>(() => {
    const storedChosenOptionsAll = localStorage.getItem(`chosenOptionsAll-${taskInfo.task_id}`);
    return storedChosenOptionsAll
      ? JSON.parse(storedChosenOptionsAll)
      : filteredTaskData.map((problem) => problem.options.map(() => false));
  });
  const [savedProblems, setSavedProblems] = useState<boolean[]>(() => {
    const storedSavedProblems = localStorage.getItem(`savedProblems-${taskInfo.task_id}`);
    return storedSavedProblems
      ? JSON.parse(storedSavedProblems)
      : new Array(filteredTaskData.length).fill(false);
  });
  const [timer, setTimer] = useState(() => {
    const storedTimer = localStorage.getItem(`lastSaveTime-${taskInfo.task_id}-${currentProblemIndex}`);
    return storedTimer ? JSON.parse(storedTimer) : 0;
  });
  const [loading, setLoading] = useState(false); // using while upload
  const [timeRemaining, setTimeRemaining] = useState(taskInfo.deadline - Date.now());

  const currentProblem = (taskInfo.template === 'FaceTag') ? (filteredTaskData[currentProblemIndex] as FaceTagProblem) : (filteredTaskData[currentProblemIndex] as ImageFrameProblem);
  const { Step } = Steps;

  const handleStepClick = (index: number) => {
    const lastSaveKey = `lastSaveTime-${taskInfo.task_id}-${currentProblemIndex}`;
    localStorage.setItem(lastSaveKey, JSON.stringify(timer));

    setCurrentProblemIndex(index);
    setChosenOptions(filteredTaskData[index].chosen || []);
    const storedChosenOptions = localStorage.getItem(`chosenOptions-${taskInfo.task_id}-${index}`);
    setChosenOptions(storedChosenOptions ? JSON.parse(storedChosenOptions) : []);

    const storedTimer = localStorage.getItem(`lastSaveTime-${taskInfo.task_id}-${index}`);
    setTimer(storedTimer ? JSON.parse(storedTimer) : 0);
  };

  const completedProblemsCount = savedProblems.filter((saved) => saved).length;
  const totalProblemsCount = filteredTaskData.length;

  // save cur prob id to localstorage
  useEffect(() => { // 存储 currentProblemIndex 到 localStorage
    localStorage.setItem(`currentProblemIndex-${taskInfo.task_id}`, JSON.stringify(currentProblemIndex));
  }, [currentProblemIndex]);

  // save answers into localstorage
  useEffect(() => {
    localStorage.setItem(`chosenOptionsAll-${taskInfo.task_id}`, JSON.stringify(chosenOptionsAll));
  }, [chosenOptionsAll]);
  useEffect(() => {
    localStorage.setItem(`chosenOptions-${taskInfo.task_id}-${currentProblemIndex}`, JSON.stringify(chosenOptions));
  }, [chosenOptions]);
  useEffect(() => {
    localStorage.setItem(`savedProblems-${taskInfo.task_id}`, JSON.stringify(savedProblems));
  }, [savedProblems]);

  // single problem count
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prevTimer: number) => prevTimer + 1);
    }, 1000); // 每1000毫秒（1秒）更新一次
    return () => {  // 清除intervalId以避免内存泄漏
      clearInterval(interval);
    };
  }, [currentProblemIndex]);
  
  // 使用 useEffect 监听 timer 的变化并存储到 localStorage
  useEffect(() => {
    localStorage.setItem(`lastSaveTime-${taskInfo.task_id}-${currentProblemIndex}`, JSON.stringify(timer));
  }, [timer]);
  // task ddl count
  useEffect(() => {
    const countdown = setInterval(() => {
      const remainingTime = taskInfo.deadline - Date.now();
      setTimeRemaining(remainingTime);
      if (remainingTime <= 0) {
        clearInterval(countdown);
        message.warning("Deadline reached!");
      }
    }, 1000);
    return () => {
      clearInterval(countdown);
    };
  }, [taskInfo.deadline]);

  const isCurrentProblemSaved = () => savedProblems[currentProblemIndex];
  const formatTimeRemaining = (milliseconds:number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  };
  const handleCheckboxChange = (index: number) => (e: any) => {
    setChosenOptions((prevState) => {
      const newState = [...prevState];
      newState[index] = e.target.checked;
      return newState;
    });
    setChosenOptionsAll((prevState) => {
      const newState = [...prevState];
      newState[currentProblemIndex][index] = e.target.checked;
      return newState.map((problemOptions) =>
        problemOptions.map((option) => (option === null ? false : option))
      );
    });
  };

  const handleSave = () => {
    const lastSaveKey = `lastSaveTime-${taskInfo.task_id}-${currentProblemIndex}`;
    localStorage.setItem(lastSaveKey, JSON.stringify(timer));
    if (timer < taskInfo.time) {
      message.warning("tagging too fast!");
      return;
    }
    const newTaskData = [...filteredTaskData]; // chosen not chosen
    const modifiedchosenOptions = chosenOptions.map((option) => (option === null ? false : option));
    if (modifiedchosenOptions.length < newTaskData[currentProblemIndex].options.length) {
      const remainingOptions =
        newTaskData[currentProblemIndex].options.length - modifiedchosenOptions.length;
      for (let i = 0; i < remainingOptions; i++) {
        modifiedchosenOptions.push(false);
      }
    }
    newTaskData[currentProblemIndex].chosen = modifiedchosenOptions;
    setChosenOptionsAll(newTaskData.map((problem) => problem.chosen || [])); 
    localStorage.setItem(`chosenOptionsAll-${taskInfo.task_id}`, JSON.stringify(chosenOptionsAll));
    const newSavedProblems = [...savedProblems];
    newSavedProblems[currentProblemIndex] = true;
    setSavedProblems(newSavedProblems);
    localStorage.setItem(`savedProblems-${taskInfo.task_id}`, JSON.stringify(savedProblems));
    localStorage.setItem(`chosenOptions-${taskInfo.task_id}-${currentProblemIndex}`, JSON.stringify(chosenOptions));

    message.success("Saved!");
  };

  const handleUpload = () => {
    Modal.confirm({
      title: "Confirm Upload",
      content: "Are you sure you want to upload the answers?",
      onOk: handleConfirmedUpload,
      onCancel: () => {
        Modal.destroyAll(); // 关闭所有弹窗
      },
    });
  };
  const handleConfirmedUpload = async () => {
    if (taskInfo.deadline - Date.now() <= 0) {
      message.error("任务已过期,无法上传标注");
      return;
    }
    const allSaved = savedProblems.every((problemSaved) => problemSaved);
    if (!allSaved) {
      message.warning("未保存所有题目答案");
      return;
    }

    const modifiedchosenOptionsAll = chosenOptionsAll.map((problem) =>
      problem.map((option) => (option === null ? false : option))
    );
    const tag_data = {
      tag_style: taskInfo.template,
      tag_time: Date.now(),
      tags: filteredTaskData.map((problem, problemIndex) => ({
        description: problem.description,
        options: problem.options,
        chosen: modifiedchosenOptionsAll[problemIndex].slice(0, problem.options.length),
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
        message.success("Uploaded!");
        setUploadCompleted(true);
        localStorage.setItem(`uploadCompleted-${taskInfo.task_id}`, JSON.stringify(true));
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        message.error("Failed to submit data");
        setLoading(false);
      });
  };

  const handlePrevious = () => {
    if (!isCurrentProblemSaved()) {
      Modal.confirm({
        title: "Unsaved Changes",
        content: "You have unsaved changes. Are you sure you want to switch questions?",
        onOk: handleConfirmedPrevious,
        onCancel: () => {
          Modal.destroyAll(); // 关闭所有弹窗
        },
      });
    } else {
      handleConfirmedPrevious();
    }
  };
  const handleConfirmedPrevious = () => {
    if (currentProblemIndex > 0) {
      const lastSaveKey = `lastSaveTime-${taskInfo.task_id}-${currentProblemIndex}`;
      localStorage.setItem(lastSaveKey, JSON.stringify(timer));

      setCurrentProblemIndex((prevState: number) => prevState - 1);
      const newChosenOptions = filteredTaskData[currentProblemIndex].chosen || [];
      setChosenOptions(newChosenOptions);
      const storedChosenOptions = localStorage.getItem(`chosenOptions-${taskInfo.task_id}-${currentProblemIndex}`);
      setChosenOptions(storedChosenOptions ? JSON.parse(storedChosenOptions) : []);

      const storedTimer = localStorage.getItem(`lastSaveTime-${taskInfo.task_id}-${currentProblemIndex}`);
      setTimer(storedTimer ? JSON.parse(storedTimer) : 0);
    } else {
      message.warning("This is the first problem!");
    }
  };

  const handleNext = () => {
    if (!isCurrentProblemSaved()) {
      Modal.confirm({
        title: "Unsaved Changes",
        content: "You have unsaved changes. Are you sure you want to switch questions?",
        onOk: handleConfirmedNext,
        onCancel: () => {
          Modal.destroyAll(); // 关闭所有弹窗
        },
      });
    } else {
      handleConfirmedNext();
    }
  };
  const handleConfirmedNext = () => {
    if (currentProblemIndex < filteredTaskData.length - 1) {
      const lastSaveKey = `lastSaveTime-${taskInfo.task_id}-${currentProblemIndex}`;
      localStorage.setItem(lastSaveKey, JSON.stringify(timer));

      
      setCurrentProblemIndex((prevState: number) => prevState + 1);
      const newchosenOptions = filteredTaskData[currentProblemIndex].chosen || [];
      setChosenOptions(newchosenOptions);
      const storedChosenOptions = localStorage.getItem(`chosenOptions-${taskInfo.task_id}-${currentProblemIndex}`);
      setChosenOptions(storedChosenOptions ? JSON.parse(storedChosenOptions) : []);

      const storedTimer = localStorage.getItem(`lastSaveTime-${taskInfo.task_id}-${currentProblemIndex}`);
      setTimer(storedTimer ? JSON.parse(storedTimer) : 0);
    } else {
      message.warning("This is the last problem!");
    }
  };

  if (taskInfo.template === "TextClassification" || taskInfo.template === "ImagesClassification") {
    return (
      <div>
        <Steps current={currentProblemIndex}>
          {filteredTaskData.map((_, index) => (
            <Step
              key={index}
              status={savedProblems[index] ? "finish" : "wait"}
              onClick={() => handleStepClick(index)}
            />
          ))}
        </Steps>
        <Divider />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            Completed: {completedProblemsCount}/{totalProblemsCount}
          </div>
          
          <div
            style={{
              color: timer < taskInfo.time ? "red" : "green",
            }}
          >
            {`Timer: ${timer}s`}
          </div>
          <div>
            {`Total time remaining: `}
            <span style={{ color: timeRemaining > 0 ? "green" : "red"}} >
              {formatTimeRemaining(timeRemaining)}
            </span>
          </div>
        </div>
        <Divider />
        <div>{currentProblem.description}</div>
        <Divider />
        <div>
          <Space>
          <Button onClick={handlePrevious} icon={<LeftCircleOutlined />}>Previous</Button>
          <Button onClick={handleNext} icon={<RightCircleOutlined />}>Next</Button>
          <Button 
            onClick={handleSave}
            disabled={uploadCompleted || timeRemaining <= 0} // 禁用按钮，如果已上传或截止日期已过
            type={uploadCompleted || timeRemaining <= 0 ? "default" : "primary"}
            icon={<SaveOutlined />}
          >
            {timeRemaining <= 0 ? "Deadline passed" : isCurrentProblemSaved() ? "Saved" : "Save"}
          </Button>
          <Button 
            onClick={handleUpload}
            disabled={uploadCompleted || timeRemaining <= 0} // 禁用按钮，如果已上传或截止日期已过
            type={uploadCompleted || timeRemaining <= 0 ? "default" : "primary"}
            icon={<UploadOutlined />}
          >
            {uploadCompleted ? "Uploaded" : timeRemaining <= 0 ? "Deadline passed" : "Upload"}
          </Button>
          </Space>
        </div>
      </div>
    );
  } else {
    return (
      <div>Error: Invalid task type!</div>
    );
  }
};

export default AnnotationComponent;
