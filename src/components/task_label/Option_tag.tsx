import React, { useState, useEffect } from "react";
import { Button, Checkbox, message, Modal } from "antd";
import axios from "axios";
import {
  TaskInfo,
  TextClassificationProblem,
  isClassificationProblem,
} from "@/const/interface";
import MyImage from "../my-img";

interface ClassificationProblem {
  description: string;
  options: string[];
  chosen?: boolean[];
}

const ClassificationComponent: React.FC<TaskInfo> = (taskInfo) => {
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0); // keep current pro id
  const [chosenOptions, setchosenOptions] = useState<boolean[]>([]); // current problem's answer
  const [uploadCompleted, setUploadCompleted] = useState(false);
  const filteredTaskData = (taskInfo.task_data as Array<any>).filter(isClassificationProblem);
  const [chosenOptionsAll, setchosenOptionsAll] = useState<Array<boolean[]>>(
    filteredTaskData.map((problem) => problem.options.map(() => false))
  );
  const [savedProblems, setSavedProblems] = useState<boolean[]>(
    new Array(filteredTaskData.length).fill(false)
  );
  const [loading, setLoading] = useState(false); // using while upload
  const [timer, setTimer] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(taskInfo.deadline - Date.now());

  const currentProblem = filteredTaskData[currentProblemIndex] as ClassificationProblem;

  // single problem count
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prevTimer) => prevTimer + 1);
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [currentProblemIndex]);
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
    setchosenOptions((prevState) => {
      const newState = [...prevState];
      newState[index] = e.target.checked;
      return newState;
    });
    setchosenOptionsAll((prevState) => {
      const newState = [...prevState];
      newState[currentProblemIndex][index] = e.target.checked;
      return newState.map((problemOptions) =>
        problemOptions.map((option) => (option === null ? false : option))
      );
    });
  };

  const handleSave = () => {
    const firstSaveKey = `firstSaveTime-${taskInfo.task_id}-${currentProblemIndex}`;
    if (!localStorage.getItem(firstSaveKey)) {
      localStorage.setItem(firstSaveKey, JSON.stringify(timer));
    }
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
    setchosenOptionsAll(newTaskData.map((problem) => problem.chosen || []));
    const newSavedProblems = [...savedProblems];
    newSavedProblems[currentProblemIndex] = true;
    setSavedProblems(newSavedProblems);

    message.success("Saved!");
  };

  const handleUpload = () => {
    Modal.confirm({
      title: "Confirm Upload",
      content: "Are you sure you want to upload the answers?",
      onOk: handleConfirmedUpload,
      onCancel: () => {},
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
        onCancel: () => {},
      });
    } else {
      handleConfirmedPrevious();
    }
  };
  const handleConfirmedPrevious = () => {
    if (currentProblemIndex > 0) {
      const newChosenOptions = filteredTaskData[currentProblemIndex - 1].chosen || [];
      setCurrentProblemIndex((prevState) => prevState - 1);
      setchosenOptions(newChosenOptions);
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
        onCancel: () => {},
      });
    } else {
      handleConfirmedNext();
    }
  };
  const handleConfirmedNext = () => {
    if (currentProblemIndex < filteredTaskData.length - 1) {
      const newchosenOptions = filteredTaskData[currentProblemIndex + 1].chosen || [];
      setCurrentProblemIndex((prevState) => prevState + 1);
      setchosenOptions(newchosenOptions);
    } else {
      message.warning("This is the last problem!");
    }
  };

  if (taskInfo.template === "TextClassification") {
    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>{currentProblem.description}</div>
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
        <div>{currentProblem.description}</div>
        {currentProblem.options.map((option, index) => (
          <Checkbox key={index} checked={chosenOptions[index]} onChange={handleCheckboxChange(index)}>
            {option}
          </Checkbox>
        ))}
        <div>
          <Button onClick={handlePrevious}>Previous</Button>
          <Button onClick={handleNext}>Next</Button>
          <Button onClick={handleSave}>Save</Button>
          <Button 
            onClick={handleUpload}
            disabled={uploadCompleted || timeRemaining <= 0} // 禁用按钮，如果已上传或截止日期已过
            type={uploadCompleted || timeRemaining <= 0 ? "default" : "primary"}
          >
            {uploadCompleted ? "Uploaded" : timeRemaining <= 0 ? "Deadline passed" : "Upload"}
          </Button>
        </div>
      </div>
    );
  } else if (taskInfo.template === "ImagesClassification") {
    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>{currentProblem.description}</div>
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
        {currentProblem.options.map((option, index) => (
          <Checkbox key={index} checked={chosenOptions[index]} onChange={handleCheckboxChange(index)}>
            <MyImage url={"/api/image?url=" + option} />
          </Checkbox>
        ))}
        <div>
          <Button onClick={handlePrevious}>Previous</Button>
          <Button onClick={handleNext}>Next</Button>
          <Button onClick={handleSave}>Save</Button>
          <Button 
            onClick={handleUpload}
            disabled={uploadCompleted || timeRemaining <= 0} // 禁用按钮，如果已上传或截止日期已过
            type={uploadCompleted || timeRemaining <= 0 ? "default" : "primary"}
          >
            {uploadCompleted ? "Uploaded" : timeRemaining <= 0 ? "Deadline passed" : "Upload"}
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

export default ClassificationComponent;
