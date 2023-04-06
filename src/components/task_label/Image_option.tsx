import React, { useState, useEffect } from "react";
import { Button, Checkbox, message, Card } from "antd";
import axios from "axios";
import { TaskInfo, ImagesClassificationProblem } from "@/const/interface";

const ImagesClassificationComponent: React.FC<TaskInfo> = (taskInfo) => {
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0); // keep current pro id
  const [chosenOptions, setchosenOptions] = useState<boolean[]>([]); // current problem's answer
  const [chosenOptionsAll, setchosenOptionsAll] = useState<Array<boolean[]>>(
    taskInfo.task_data.map((problem) => problem.options.map(() => false))
  );
  const [loading, setLoading] = useState(false); // using while upload
  const [timer, setTimer] = useState(0);

  
  const currentProblem = taskInfo.task_data[
    currentProblemIndex
  ] as ImagesClassificationProblem;
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prevTimer) => prevTimer + 1);
    }, 1000);
    return () => { clearInterval(interval); };
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
    if (timer < taskInfo.time) {
      message.warning("tagging too fast!");
      return;
    }
    const newTaskData = [...taskInfo.task_data]; // chosen not chosen
    const modifiedchosenOptions = chosenOptions.map((option) =>
      option === null ? false : option
    );
    if (
      modifiedchosenOptions.length <
      newTaskData[currentProblemIndex].options.length
    ) {
      const remainingOptions =
        newTaskData[currentProblemIndex].options.length -
        modifiedchosenOptions.length;
      for (let i = 0; i < remainingOptions; i++) {
        modifiedchosenOptions.push(false);
      }
    }
    newTaskData[currentProblemIndex].chosen = modifiedchosenOptions;
    setchosenOptionsAll(newTaskData.map((problem) => problem.chosen || []));
    message.success("Saved!");
  };

  const handleUpload = async () => {
    const modifiedchosenOptionsAll = chosenOptionsAll.map((problem) =>
      problem.map((option) => (option === null ? false : option))
    );
    const tag_data = {
      tag_style: taskInfo.template,
      tag_time: Date.now(),
      tags: taskInfo.task_data.map((problem, problemIndex) => ({
        description: problem.description,
        options: problem.options,
        chosen: modifiedchosenOptionsAll[problemIndex].slice(
          0,
          problem.options.length
        ),
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
      const newChosenOptions =
        taskInfo.task_data[currentProblemIndex - 1].chosen || [];
      setCurrentProblemIndex((prevState) => prevState - 1);
      setchosenOptions(newChosenOptions);
    } else {
      message.warning("This is the first problem!");
    }
  };

  const handleNext = () => {
    if (currentProblemIndex < taskInfo.task_data.length - 1) {
      const newchosenOptions =
        taskInfo.task_data[currentProblemIndex + 1].chosen || [];
      setCurrentProblemIndex((prevState) => prevState + 1);
      setchosenOptions(newchosenOptions);
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
          checked={chosenOptions[index]}
          onChange={handleCheckboxChange(index)}
        >
        <Card
            hoverable
            style={{ width: 240 }}
            cover={<img alt="example" src={option} />}
        />
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

