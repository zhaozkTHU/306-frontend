import React, { useState } from "react";
import { Button, Checkbox, message } from "antd";
import axios from "axios";
import { TaskInfo, TextClassificationProblem } from "@/const/interface";

const TextClassificationComponent: React.FC<TaskInfo> = (taskInfo) => {
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0); // keep current pro id
  const [chosedOptions, setChosedOptions] = useState<boolean[]>([]); // current problem's answer
  // const [chosenOptionsAll, setChosenOptionsAll] = useState<boolean[][]>([]); // save all answers
  // const [chosenOptionsAll, setChosenOptionsAll] = useState<Array<boolean[]>>(taskInfo.task_data.map(() => []));
  const [chosedOptionsAll, setChosedOptionsAll] = useState<Array<boolean[]>>(
    taskInfo.task_data.map(problem => problem.options.map(() => false))
  );
  const [loading, setLoading] = useState(false); // using while upload

  const currentProblem = taskInfo.task_data[
    currentProblemIndex
  ] as TextClassificationProblem;

  const handleCheckboxChange = (index: number) => (e: any) => {
    setChosedOptions((prevState) => {
      const newState = [...prevState];
      newState[index] = e.target.checked;
      return newState;
    });
    setChosedOptionsAll((prevState) => {
      const newState = [...prevState];
      newState[currentProblemIndex][index] = e.target.checked;
      // newState[currentProblemIndex][index] = e.target.checked !== null ? e.target.checked : false;  // incase of null instwad of false
      return newState.map(problemOptions => problemOptions.map(option => option === null ? false : option));;
    });
  };

  const handleSave = () => {
    const newTaskData = [...taskInfo.task_data]; // chosed not chosen
    const modifiedChosedOptions = chosedOptions.map((option) => option === null ? false : option);
    if (modifiedChosedOptions.length < newTaskData[currentProblemIndex].options.length) {
      const remainingOptions = newTaskData[currentProblemIndex].options.length - modifiedChosedOptions.length;
      for (let i = 0; i < remainingOptions; i++) {
        modifiedChosedOptions.push(false);
      }
    }
    newTaskData[currentProblemIndex].chosen = modifiedChosedOptions;
    setChosedOptionsAll(newTaskData.map((problem) => problem.chosen || []));
    message.success("Saved!");
  };

  const handleUpload = async () => {
    // const tag_data = {
    //   tag_style: taskInfo.template,
    //   tag_time: Date.now(),
    //   tags: taskInfo.task_data.map((problem, problemIndex) => ({
    //     description: problem.description,
    //     options: problem.options,
    //     chosen: chosenOptionsAll[problemIndex],
    //   })),
    // };
    // const tag_data = {
    //   tag_style: taskInfo.template,
    //   tag_time: Date.now(),
    //   tags: taskInfo.task_data.map((problem, problemIndex) => ({
    //     description: problem.description,
    //     options: problem.options,
    //     chosen: chosenOptionsAll[problemIndex].map((option) => option === null ? false : option),
    //   })),
    // };
    const modifiedChosedOptionsAll = chosedOptionsAll.map((problem) => problem.map((option) => option === null ? false : option));
    const tag_data = {
      tag_style: taskInfo.template,
      tag_time: Date.now(),
      tags: taskInfo.task_data.map((problem, problemIndex) => ({
        description: problem.description,
        options: problem.options,
        chosed: modifiedChosedOptionsAll[problemIndex].slice(0, problem.options.length),
      })),
    };

    const token = localStorage.getItem("token");
    setLoading(true);
    axios
      .post(
        "/api/submit",
        { 
          task_id: taskInfo.task_id, 
          tag_data
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
      const newChosenOptions =
        taskInfo.task_data[currentProblemIndex - 1].chosen || [];
      setCurrentProblemIndex((prevState) => prevState - 1);
      setChosedOptions(newChosenOptions);
    } else {
      message.warning("This is the first problem!");
    }
  };

  const handleNext = () => {
    if (currentProblemIndex < taskInfo.task_data.length - 1) {
      const newChosedOptions =
        taskInfo.task_data[currentProblemIndex + 1].chosen || [];
      setCurrentProblemIndex((prevState) => prevState + 1);
      setChosedOptions(newChosedOptions);
    } else {
      message.warning("This is the last problem!");
    }
  };

  return (
    <div>
      <div>{currentProblem.description}</div>
      {currentProblem.options.map((option, index) => (
        <Checkbox
          key={index}
          checked={chosedOptions[index]}
          onChange={handleCheckboxChange(index)}
        >
          {option}
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

export default TextClassificationComponent;
