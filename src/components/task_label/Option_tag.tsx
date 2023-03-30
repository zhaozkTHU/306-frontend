import React, { useState } from "react";
import { Button, Checkbox, message } from "antd";
import axios from "axios"
// import { UserIdContext } from "@/pages/_app";
// import { useContext } from "react";
import { TaskInfo, TextClassificationProblem } from "@/const/interface";

const TextClassificationComponent: React.FC<TaskInfo> = (taskInfo) => {
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [chosenOptions, setChosenOptions] = useState<boolean[]>([]);
  const [loading, setLoading] = useState(false);
  // const labelerId = useContext(UserIdContext);

  const currentProblem = taskInfo.task_data[
    currentProblemIndex
  ] as TextClassificationProblem;

  const handleCheckboxChange = (index: number) => (e: any) => {
    setChosenOptions((prevState) => {
      const newState = [...prevState];
      newState[index] = e.target.checked;
      return newState;
    });
  };

  const handleSave = () => {
    const newTaskData = [...taskInfo.task_data];
    newTaskData[currentProblemIndex].chosen = chosenOptions;
    message.success("Saved!");
  };

  const handleUpload = async () => {
    const tag_data = {
      tag_template: taskInfo.template,
      tag_time: Date.now(),
      tags: currentProblem.options.map((option, index) => ({
        description: option,
        options: currentProblem.options,
        chosen: chosenOptions[index],
      })),
    };
    const token = localStorage.getItem("token");
    setLoading(true);
    // const response = await fetch("/api/submit", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     Authorization: "Bearer " + token,
    //   },
    //   body: JSON.stringify({
    //     // labeler_id: labelerId,
    //     task_id: taskInfo.task_id,
    //     tag_data,
    //   }),
    // });
    // await response.json();
    // message.success("Uploaded!");
    axios
      .post(
        "/api/submit",
        { task_id: taskInfo.task_id, tag_data },
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
      setChosenOptions(newChosenOptions);
    } else {
      message.warning("This is the first problem!");
    }
  };

  const handleNext = () => {
    if (currentProblemIndex < taskInfo.task_data.length - 1) {
      const newChosenOptions =
        taskInfo.task_data[currentProblemIndex + 1].chosen || [];
      setCurrentProblemIndex((prevState) => prevState + 1);
      setChosenOptions(newChosenOptions);
    } else {
      message.warning("This is the last problem!");
    }
  };

  // const handleClose = () => {
  //   // perform any necessary cleanup and close the component
  // };

  return (
    <div>
      <div>{currentProblem.description}</div>
      {currentProblem.options.map((option, index) => (
        <Checkbox
          key={index}
          checked={chosenOptions[index]}
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
      {/* <div>
        <Button onClick={handleClose}>Close</Button>
      </div> */}
    </div>
  );
};

export default TextClassificationComponent;
