import React, { useState, useEffect } from "react";
import { Button, Checkbox, message, Modal, Steps, Divider, Space } from "antd";
import { SaveOutlined, UploadOutlined, RightCircleOutlined, LeftCircleOutlined } from '@ant-design/icons';
import axios from "axios";
import ReactPictureAnnotation from 'react-picture-annotation';
import {
  TaskInfo,
  isFaceTagProblem,
  FaceTagProblem,
  isImageFrameProblem,
  ImageFrameProblem,
} from "@/const/interface";


const MyImageUrl = (src: string) => {
  const [imageUrl, setImageUrl] = useState<string>("");

  useEffect(() => {
    axios
      .get("/api/file", {
        responseType: "arraybuffer", // 将响应数据解析为 ArrayBuffer 类型
        params: { url: src },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        const blob = new Blob([response.data], { type: "image/jpeg" });
        const url = URL.createObjectURL(blob);
        setImageUrl(url);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [src]);

  return imageUrl;
};
const AnnotationComponent: React.FC<TaskInfo> = (taskInfo) => {
  const [currentProblemIndex, setCurrentProblemIndex] = useState(() => { // keep current pro id
    const storedCurrentProblemIndex = localStorage.getItem(`currentProblemIndex-${taskInfo.task_id}`);
    return storedCurrentProblemIndex ? JSON.parse(storedCurrentProblemIndex) : 0;
  });
  // while re-render, get current saved answer & upload status from localstorage
  const [tagAnswers, setTagAnswers] = useState<Array<{ x: number; y: number; width: number; height: number } | { x: number; y: number }>> (() => {
    const storedTagAnswers = localStorage.getItem(`tagAnswers-${taskInfo.task_id}-${currentProblemIndex}`);
    return storedTagAnswers ? JSON.parse(storedTagAnswers) : [];
  });
  const [uploadCompleted, setUploadCompleted] = useState<boolean>(() => { // whether finished upload
    const storedUploadCompleted = localStorage.getItem(`uploadCompleted-${taskInfo.task_id}`);
    return storedUploadCompleted ? JSON.parse(storedUploadCompleted) : false;
  });
  const filteredTaskData = (taskInfo.task_data as Array<any>).filter(
    (taskInfo.template === "FaceTag") ? isFaceTagProblem : isImageFrameProblem
  );
  // while re-render, get the answer from localstorage
  const [tagAnswersAll, setTagAnswersAll] = useState<Array< Array<{ x: number; y: number; width: number; height: number } | { x: number; y: number }> >>(() => {
    const storedTagAnswersAll = localStorage.getItem(`tagAnswersAll-${taskInfo.task_id}`);
    return storedTagAnswersAll ? JSON.parse(storedTagAnswersAll) : [];
  });
  const [savedProblems, setSavedProblems] = useState<boolean[]>(() => {
    const storedSavedProblems = localStorage.getItem(`savedProblems-${taskInfo.task_id}`);
    return storedSavedProblems ? JSON.parse(storedSavedProblems) : new Array(filteredTaskData.length).fill(false);
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
    setTagAnswers(filteredTaskData[index].data || []);
    const storedTagAnswers = localStorage.getItem(`tagAnswers-${taskInfo.task_id}-${index}`);
    setTagAnswers(storedTagAnswers ? JSON.parse(storedTagAnswers) : []);

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
    localStorage.setItem(`tagAnswersAll-${taskInfo.task_id}`, JSON.stringify(tagAnswersAll));
  }, [tagAnswersAll]);
  useEffect(() => {
    localStorage.setItem(`tagAnswers-${taskInfo.task_id}-${currentProblemIndex}`, JSON.stringify(tagAnswers));
  }, [tagAnswers]);
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
  const handleTagChange = (updatedAnnotations: Array<{ x: number; y: number; width: number; height: number } | { x: number; y: number }>) => {
    console.log("标注数据：", updatedAnnotations);
    setTagAnswers(updatedAnnotations);
    setTagAnswersAll((prevState) => {
      const newState = [...prevState];
      newState[currentProblemIndex] = updatedAnnotations;
      return newState;
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
    newTaskData[currentProblemIndex].data = tagAnswers;
    setTagAnswersAll(newTaskData.map((problem) => problem.data || [])); 
    localStorage.setItem(`tagAnswersAll-${taskInfo.task_id}`, JSON.stringify(tagAnswersAll));
    const newSavedProblems = [...savedProblems];
    newSavedProblems[currentProblemIndex] = true;
    setSavedProblems(newSavedProblems);
    localStorage.setItem(`savedProblems-${taskInfo.task_id}`, JSON.stringify(savedProblems));
    localStorage.setItem(`tagAnswers-${taskInfo.task_id}-${currentProblemIndex}`, JSON.stringify(tagAnswers));

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

    const tag_data = {
      tag_style: taskInfo.template,
      tag_time: Date.now(),
      tags: filteredTaskData.map((problem, problemIndex) => ({
        description: problem.description,
        url: problem.url,
        data: tagAnswersAll[problemIndex],
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
      const newTagAnswers = filteredTaskData[currentProblemIndex].data || [];
      setTagAnswers(newTagAnswers);
      const storedTagAnswers = localStorage.getItem(`tagAnswers-${taskInfo.task_id}-${currentProblemIndex}`);
      setTagAnswers(storedTagAnswers ? JSON.parse(storedTagAnswers) : []);

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
      const newTagAnswers = filteredTaskData[currentProblemIndex].data || [];
      setTagAnswers(newTagAnswers);
      const storedTagAnswers = localStorage.getItem(`tagAnswers-${taskInfo.task_id}-${currentProblemIndex}`);
      setTagAnswers(storedTagAnswers ? JSON.parse(storedTagAnswers) : []);

      const storedTimer = localStorage.getItem(`lastSaveTime-${taskInfo.task_id}-${currentProblemIndex}`);
      setTimer(storedTimer ? JSON.parse(storedTimer) : 0);
    } else {
      message.warning("This is the last problem!");
    }
  };

  if (taskInfo.template === "FaceTag" || taskInfo.template === "ImageFrame") {
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
        {/* <MyImage url={"/api/image?url=" + currentProblem.url}/> */}
        {/* <Annotator
          images={[
            {
              src: MyImageUrl("/api/image?url=" + currentProblem.url),
              name: "annotation-image",
              regions: [],
            },
          ]}
          onExit={handleTagChange}
          enabledTools={[(taskInfo.template === 'FaceTag')?"create-point":"create-box"]}
          // loadImage={loadImage}
        /> */}
        {/* <ReactPictureAnnotation
          image={MyImageUrl("/api/image?url=" + currentProblem.url)}
          // onSelect={onSelect}
          onChange={handleTagChange}
          width={400}
          height={400}
        /> */}
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
