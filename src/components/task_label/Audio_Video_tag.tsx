import React, { useState, useEffect } from "react";
import { Button, Radio, Input, message, Modal, Steps, Divider, Space } from "antd";
import {
  SaveOutlined,
  UploadOutlined,
  RightCircleOutlined,
  LeftCircleOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { TaskInfo, TagProblem, isTagProblem } from "@/const/interface";
import MyAudio from "../my-audio";
import MyVideo from "../my-video";

const SVTagComponent: React.FC<TaskInfo> = (taskInfo) => {
  const [currentProblemIndex, setCurrentProblemIndex] = useState(() => {
    // keep current pro id
    const storedCurrentProblemIndex = localStorage.getItem(
      `currentProblemIndex-${taskInfo.task_id}`
    );
    return storedCurrentProblemIndex ? JSON.parse(storedCurrentProblemIndex) : 0;
  });
  const [chosenOptionIndex, setChosenOptionIndex] = useState<number | null>(() => {
    // curreny pro choice
    const storedChosenOptionIndex = localStorage.getItem(
      `chosenOptionIndex-${taskInfo.task_id}-${currentProblemIndex}`
    );
    return storedChosenOptionIndex ? JSON.parse(storedChosenOptionIndex) : null;
  });
  const [inputValue, setInputValue] = useState<string | null>(() => {
    // curreny pro choice
    const storedInputValue = localStorage.getItem(
      `inputValue-${taskInfo.task_id}-${currentProblemIndex}`
    );
    return storedInputValue ? JSON.parse(storedInputValue) : null;
  });
  const [uploadCompleted, setUploadCompleted] = useState<boolean>(() => {
    // whether finished upload
    const storedUploadCompleted = localStorage.getItem(`uploadCompleted-${taskInfo.task_id}`);
    return storedUploadCompleted ? JSON.parse(storedUploadCompleted) : false;
  });
  const filteredTaskData = (taskInfo.task_data as Array<any>).filter(isTagProblem);
  const [chosenOptionsAll, setChosenOptionsAll] = useState<
    Array<{ choiceIndex: number; input?: string }>
  >(() => {
    const storedChosenOptionsAll = localStorage.getItem(`chosenOptionsAll-${taskInfo.task_id}`);
    return storedChosenOptionsAll
      ? JSON.parse(storedChosenOptionsAll)
      : filteredTaskData.map((problem) => problem.data || { choiceIndex: -1 });
  });
  const [savedProblems, setSavedProblems] = useState<boolean[]>(() => {
    const storedSavedProblems = localStorage.getItem(`savedProblems-${taskInfo.task_id}`);
    return storedSavedProblems
      ? JSON.parse(storedSavedProblems)
      : new Array(filteredTaskData.length).fill(false);
  });
  const [timer, setTimer] = useState(() => {
    const storedTimer = localStorage.getItem(
      `lastSaveTime-${taskInfo.task_id}-${currentProblemIndex}`
    );
    return storedTimer ? JSON.parse(storedTimer) : 0;
  });
  const [loading, setLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(taskInfo.deadline - Date.now());

  const currentProblem = filteredTaskData[currentProblemIndex] as TagProblem;
  const { Step } = Steps;
  const completedProblemsCount = savedProblems.filter((saved) => saved).length;
  const totalProblemsCount = filteredTaskData.length;

  // save cur prob id to localstorage
  useEffect(() => {
    // 存储 currentProblemIndex 到 localStorage
    localStorage.setItem(
      `currentProblemIndex-${taskInfo.task_id}`,
      JSON.stringify(currentProblemIndex)
    );
  }, [currentProblemIndex]);
  // save answers into localstorage
  useEffect(() => {
    localStorage.setItem(`chosenOptionsAll-${taskInfo.task_id}`, JSON.stringify(chosenOptionsAll));
  }, [chosenOptionsAll]);
  useEffect(() => {
    localStorage.setItem(
      `chosenOptions-${taskInfo.task_id}-${currentProblemIndex}`,
      JSON.stringify(chosenOptionIndex)
    );
  }, [chosenOptionIndex]);
  useEffect(() => {
    localStorage.setItem(
      `inputValue-${taskInfo.task_id}-${currentProblemIndex}`,
      JSON.stringify(inputValue)
    );
  }, [inputValue]);
  useEffect(() => {
    localStorage.setItem(`savedProblems-${taskInfo.task_id}`, JSON.stringify(savedProblems));
  }, [savedProblems]);

  // single problem count
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prevTimer: number) => prevTimer + 1);
    }, 1000); // 每1000毫秒（1秒）更新一次
    return () => {
      clearInterval(interval);
    };
  }, [currentProblemIndex]);
  // 使用 useEffect 监听 timer 的变化并存储到 localStorage
  useEffect(() => {
    localStorage.setItem(
      `lastSaveTime-${taskInfo.task_id}-${currentProblemIndex}`,
      JSON.stringify(timer)
    );
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

  useEffect(() => {
    setChosenOptionIndex(currentProblem.data?.choiceIndex || null);
    setInputValue(currentProblem.data?.input || null);
  }, [currentProblem]);

  const isCurrentProblemSaved = () => savedProblems[currentProblemIndex];
  const formatTimeRemaining = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const handleStepClick = (index: number) => {
    const lastSaveKey = `lastSaveTime-${taskInfo.task_id}-${currentProblemIndex}`;
    localStorage.setItem(lastSaveKey, JSON.stringify(timer));

    setCurrentProblemIndex(index);
    setChosenOptionIndex(filteredTaskData[index].data?.choiceIndex || null);
    setInputValue(filteredTaskData[index].data?.input || null);
    const storedChosenOptions = localStorage.getItem(
      `chosenOptionIndex-${taskInfo.task_id}-${index}`
    );
    const storedInputValue = localStorage.getItem(
      `inputValue-${taskInfo.task_id}-${index}`
    );
    setChosenOptionIndex(storedChosenOptions ? JSON.parse(storedChosenOptions) : []);
    setInputValue(storedInputValue ? JSON.parse(storedInputValue) : '');

    const storedTimer = localStorage.getItem(`lastSaveTime-${taskInfo.task_id}-${index}`);
    setTimer(storedTimer ? JSON.parse(storedTimer) : 0);
  };

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
    const newSavedProblems = [...savedProblems];
    newSavedProblems[currentProblemIndex] = true;
    setSavedProblems(newSavedProblems);
    message.success("已保存！");
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
        setUploadCompleted(true);
        localStorage.setItem(`uploadCompleted-${taskInfo.task_id}`, JSON.stringify(true));
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        message.error("提交数据失败");
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
      const newChosenOptionIndex = filteredTaskData[currentProblemIndex].data?.choiceIndex || -1;
      const newInputValue = filteredTaskData[currentProblemIndex].data?.input || '';
      setChosenOptionIndex(newChosenOptionIndex);
      setInputValue(newInputValue);
      const storedChosenOptionIndex = localStorage.getItem(
        `chosenOptionIndex-${taskInfo.task_id}-${currentProblemIndex}`
      );
      const storedInputValue = localStorage.getItem(
        `inputValue-${taskInfo.task_id}-${currentProblemIndex}`
      );
      setChosenOptionIndex(storedChosenOptionIndex ? JSON.parse(storedChosenOptionIndex) : -1);
      setInputValue(storedInputValue ? JSON.parse(storedInputValue) : "");

      const storedTimer = localStorage.getItem(
        `lastSaveTime-${taskInfo.task_id}-${currentProblemIndex}`
      );
      setTimer(storedTimer ? JSON.parse(storedTimer) : 0);
    } else {
      message.warning("这是第一道题！");
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
      const newChosenOptionIndex = filteredTaskData[currentProblemIndex].data?.choiceIndex || -1;
      const newInputValue = filteredTaskData[currentProblemIndex].data?.input || '';
      setChosenOptionIndex(newChosenOptionIndex);
      setInputValue(newInputValue);
      const storedChosenOptionIndex = localStorage.getItem(
        `chosenOptionIndex-${taskInfo.task_id}-${currentProblemIndex}`
      );
      const storedInputValue = localStorage.getItem(
        `inputValue-${taskInfo.task_id}-${currentProblemIndex}`
      );
      setChosenOptionIndex(storedChosenOptionIndex ? JSON.parse(storedChosenOptionIndex) : -1);
      setInputValue(storedInputValue ? JSON.parse(storedInputValue) : "");
      
      const storedTimer = localStorage.getItem(
        `lastSaveTime-${taskInfo.task_id}-${currentProblemIndex}`
      );
      setTimer(storedTimer ? JSON.parse(storedTimer) : 0);
    } else {
      message.warning("这是最后一道题！");
    }
  };

  if (taskInfo.template === "SoundTag" || taskInfo.template === "VideoTag") {
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
            <span style={{ color: timeRemaining > 0 ? "green" : "red" }}>
              {formatTimeRemaining(timeRemaining)}
            </span>
          </div>
        </div>
        <Divider />
        <div>{currentProblem.description}</div>
        {taskInfo.template === "SoundTag" ? (
          <MyAudio url={"/api/file?url=" + currentProblem.url} controls />
        ) : (
          <MyVideo url={"/api/file?url=" + currentProblem.url} controls />
        )}
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
        <Divider />
        <div>
          <Space>
          <Button onClick={handlePrevious} icon={<LeftCircleOutlined />}>
              Previous
            </Button>
            <Button onClick={handleNext} icon={<RightCircleOutlined />}>
              Next
            </Button>
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
    return <div>Error: Invalid task type!</div>;
  }
};

export default SVTagComponent;
