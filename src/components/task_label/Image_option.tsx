import React, { useState, useEffect } from "react";
import { Button, Checkbox, message } from "antd";
import axios from "axios";
import {
  TaskInfo,
  ImagesClassificationProblem,
  isImagesClassificationProblem,
} from "@/const/interface";
import MyImage from "../my-img";

const ImagesClassificationComponent: React.FC<TaskInfo> = (taskInfo) => {
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0); // keep current pro id
  const [chosenOptions, setchosenOptions] = useState<boolean[]>([]); // current problem's answer
  const filteredTaskData = (taskInfo.task_data as Array<any>).filter(isImagesClassificationProblem);

  const [chosenOptionsAll, setchosenOptionsAll] = useState<Array<boolean[]>>(
    filteredTaskData.map((problem) => problem.options.map(() => false))
  );
  const [savedProblems, setSavedProblems] = useState<boolean[]>(
    new Array(filteredTaskData.length).fill(false)
  );
  const [loading, setLoading] = useState(false); // using while upload
  const [timer, setTimer] = useState(0);

  const currentProblem = filteredTaskData[currentProblemIndex] as ImagesClassificationProblem;

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prevTimer) => prevTimer + 1);
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [currentProblemIndex]);

  const handleCheckboxChange = (index: number) => (e: any) => {
    setchosenOptions((prevState) => {
      const newState = [...prevState];
      newState[index] = e.target.checked;
      return newState;
    });
    setchosenOptionsAll((prevState) => {
      const newState = [...prevState];
      newState[currentProblemIndex][index] = e.target.checked;
      // newState[currentProblemIndex][index] = e.target.checked !== null ? e.target.checked : false;  // incase of null instwad of false
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

  const handleUpload = async () => {
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
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        message.error("Failed to submit data");
        setLoading(false);
      });
  };

  const handlePrevious = () => {
    if (currentProblemIndex > 0) {
      const newChosenOptions = filteredTaskData[currentProblemIndex - 1].chosen || [];
      setCurrentProblemIndex((prevState) => prevState - 1);
      setchosenOptions(newChosenOptions);
    } else {
      message.warning("This is the first problem!");
    }
  };

  const handleNext = () => {
    if (currentProblemIndex < filteredTaskData.length - 1) {
      const newchosenOptions = filteredTaskData[currentProblemIndex + 1].chosen || [];
      setCurrentProblemIndex((prevState) => prevState + 1);
      setchosenOptions(newchosenOptions);
    } else {
      message.warning("This is the last problem!");
    }
  };

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
      </div>
      {currentProblem.options.map((option, index) => (
        <Checkbox key={index} checked={chosenOptions[index]} onChange={handleCheckboxChange(index)}>
          <MyImage url={"/api/file?url=" + option} />
        </Checkbox>
      ))}
      <div>
        <Button onClick={handlePrevious}>Previous</Button>
        <Button onClick={handleNext}>Next</Button>
        <Button onClick={handleSave}>Save</Button>
        <Button onClick={handleUpload}>Upload</Button>
      </div>
    </div>
  );
};

export default ImagesClassificationComponent;
