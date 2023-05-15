import React, { useState, useEffect } from "react";
import { Button, message, Modal, Steps, Divider, Space, Spin, Input, Form } from "antd";
import {
  SaveOutlined,
  UploadOutlined,
  RightCircleOutlined,
  LeftCircleOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { TaskInfo, isTextTripleProblem, TextTripleProblem } from "@/const/interface";

const TripleComponent: React.FC<TaskInfo> = (taskInfo) => {
  const [currentProblemIndex, setCurrentProblemIndex] = useState(() => {
    const storedCurrentProblemIndex = localStorage.getItem(`currentProblemIndex-${taskInfo.task_id}`);
    return storedCurrentProblemIndex ? JSON.parse(storedCurrentProblemIndex) : 0;
  });

  const [triple, setTriple] = useState<{subject: string, object: string, relation: string}>(() => {
    const storedTriple = localStorage.getItem(`triple-${taskInfo.task_id}-${currentProblemIndex}`);
    return storedTriple ? JSON.parse(storedTriple) : {subject: '', object: '', relation: ''};
  });
  const [tripleStatus, setTripleStatus] = useState<{subject: string, object: string, relation: string}>(() => {
    return {subject: '', object: '', relation: ''};
  });
  const [uploadCompleted, setUploadCompleted] = useState<boolean>(() => {
    const storedUploadCompleted = localStorage.getItem(`uploadCompleted-${taskInfo.task_id}`);
    return storedUploadCompleted ? JSON.parse(storedUploadCompleted) : false;
  });
  const filteredTaskData = (taskInfo.task_data as Array<any>).filter(isTextTripleProblem);

  const [tripleAll, setTripleAll] = useState<Array<{subject: string, object: string, relation: string}>>(() => {
    const storedTripleAll = localStorage.getItem(`tripleAll-${taskInfo.task_id}`);
    return storedTripleAll
      ? JSON.parse(storedTripleAll)
      : filteredTaskData.map(()=>({ subject: '', object: '', relation: ''}));
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
  const [loading, setLoading] = useState(false); // using while upload
  const [timeRemaining, setTimeRemaining] = useState(taskInfo.deadline - Date.now());

  const currentProblem = filteredTaskData[currentProblemIndex] as TextTripleProblem;
  const { Step } = Steps;
  const completedProblemsCount = savedProblems.filter((saved) => saved).length;
  const totalProblemsCount = filteredTaskData.length;

  // save cur prob id to localstorage
  useEffect(() => {
    localStorage.setItem(
      `currentProblemIndex-${taskInfo.task_id}`,
      JSON.stringify(currentProblemIndex)
    );
  }, [currentProblemIndex]);

  useEffect(() => {
    localStorage.setItem(`tripleAll-${taskInfo.task_id}`, JSON.stringify(tripleAll));
  }, [tripleAll]);
  useEffect(() => {
    localStorage.setItem(
      `triple-${taskInfo.task_id}-${currentProblemIndex}`,
      JSON.stringify(triple)
    );
  }, [triple]);
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
    setTriple(filteredTaskData[index].triple || {subject: '', object: '', relation: ''});
    const storedTriple = localStorage.getItem(`triple-${taskInfo.task_id}-${index}`);
    setTriple(storedTriple ? JSON.parse(storedTriple) : {subject: '', object: '', relation: ''});

    const storedTimer = localStorage.getItem(`lastSaveTime-${taskInfo.task_id}-${index}`);
    setTimer(storedTimer ? JSON.parse(storedTimer) : 0);
  };

  const handleSubjectChange = (e: any) => {
    if (currentProblem.text.includes(e.target.value)) {
        setTriple((prev)=>({subject: e.target.value, object: prev.object, relation: prev.relation}));
        setTripleStatus({subject: '', object: '', relation: ''});
    } 
    else {
        setTripleStatus({subject: 'error', object: '', relation: ''});
    }
  };
  const handleObjectChange = (e: any) => {
    if (currentProblem.text.includes(e.target.value)) {
        setTriple((prev)=>({subject: prev.subject, object: e.target.value, relation: prev.relation}));
        setTripleStatus({subject: '', object: '', relation: ''});
    } 
    else {
        setTripleStatus({subject: '', object: 'error', relation: ''});
    }
  };
  const handleRelationChange = (e: any) => {
    setTriple((prev)=>({subject: prev.subject, object: prev.object, relation: e.target.value}));
  };

  const handleSave = () => {
    const lastSaveKey = `lastSaveTime-${taskInfo.task_id}-${currentProblemIndex}`;
    localStorage.setItem(lastSaveKey, JSON.stringify(timer));
    if (timer < taskInfo.time) {
      message.warning("tagging too fast!");
      return;
    }
    const newTaskData = [...filteredTaskData]; // chosen not chosen TripleAll
    newTaskData[currentProblemIndex].triple = triple;
    setTripleAll(newTaskData.map((problem) => problem.triple || {subject: '', object: '', relation: ''}));
    localStorage.setItem(`tripleAll-${taskInfo.task_id}`, JSON.stringify(tripleAll));
    const newSavedProblems = [...savedProblems];
    newSavedProblems[currentProblemIndex] = true;
    setSavedProblems(newSavedProblems);
    localStorage.setItem(`savedProblems-${taskInfo.task_id}`, JSON.stringify(savedProblems));
    localStorage.setItem(
      `triple-${taskInfo.task_id}-${currentProblemIndex}`,
      JSON.stringify(triple)
    );

    message.success("Saved!");
  };

  const handleBatch = () => {
    Modal.confirm({
      title: "Confirm Batch",
      content: "Are you sure you want to upload the answers?",
      onOk: handleConfirmedUpload,
      onCancel: () => {
        Modal.destroyAll(); // 关闭所有弹窗
      },
    });
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
        template: taskInfo.template,
        description: problem.description,
        text: problem.text,
        triple: tripleAll[problemIndex],
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

      setCurrentProblemIndex((prevState: number) => {
        const newIndex = prevState - 1;
        const newTriple = filteredTaskData[newIndex].triple || {subject: '', object: '', relation: ''}; 
        setTriple(newTriple);
        const storedTriple = localStorage.getItem(
          `triple-${taskInfo.task_id}-${newIndex}`
        );
        setTriple(storedTriple ? JSON.parse(storedTriple) : {subject: '', object: '', relation: ''});

        const storedTimer = localStorage.getItem(`lastSaveTime-${taskInfo.task_id}-${newIndex}`);
        setTimer(storedTimer ? JSON.parse(storedTimer) : 0);
        return newIndex;
      });
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

      setCurrentProblemIndex((prevState: number) => {
        const newIndex = prevState + 1;
        const newTriple = filteredTaskData[newIndex].triple || {subject: '', object: '', relation: ''};
        setTriple(newTriple);
        const storedTriple = localStorage.getItem(
          `triple-${taskInfo.task_id}-${newIndex}`
        );
        setTriple(storedTriple ? JSON.parse(storedTriple) : {subject: '', object: '', relation: ''});

        const storedTimer = localStorage.getItem(`lastSaveTime-${taskInfo.task_id}-${newIndex}`);
        setTimer(storedTimer ? JSON.parse(storedTimer) : 0);
        return newIndex;
      });
    } else {
      message.warning("This is the last problem!");
    }
  };

  if (!currentProblem) {
    console.log("Loading...");
    return <Spin tip="Loading..." />;
  }
  if (taskInfo.template === "TextTriple") {
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
        <div>{currentProblem && currentProblem.description}</div>
        <Divider />
        <div>{currentProblem && currentProblem.text}</div>
        <Form>
            <Form.Item
                validateStatus={tripleStatus.subject==="error" ? "error" : ""}
                help={tripleStatus.subject === "error" ? "主体字符串未在给定字符串中出现" : ""}
            >
                <Input
                    style={{ marginLeft: 8 }}
                    value={ triple.subject || "" }
                    onChange={handleSubjectChange}
                    placeholder="请输入主体"
                    allowClear
                    maxLength={20}
                    disabled={!(currentProblem && currentProblem.text)}
                />
            </Form.Item>
            <Form.Item
                validateStatus={tripleStatus.object==="error" ? "error" : ""}
                help={tripleStatus.object === "error" ? "对象字符串未在给定字符串中出现" : ""}
            >
               <Input
                    style={{ marginLeft: 8 }}
                    value={ triple.object || "" }
                    onChange={handleObjectChange}
                    placeholder="请输入对象"
                    allowClear
                    maxLength={20}
                    disabled={!(currentProblem && currentProblem.text)}
                /> 
            </Form.Item>
            <Form.Item>
                <Input
                    style={{ marginLeft: 8 }}
                    value={ triple.relation || "" }
                    onChange={handleRelationChange}
                    placeholder="请输入关系"
                    allowClear
                    maxLength={20}
                />
            </Form.Item>
        </ Form>
        
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
              onClick={handleBatch}
              disabled={uploadCompleted || timeRemaining <= 0} // 禁用按钮，如果已上传或截止日期已过
              type={uploadCompleted || timeRemaining <= 0 ? "default" : "primary"}
              icon={<UploadOutlined />}
            >
              {timeRemaining <= 0 ? "Deadline passed" : "Batch Upload"}
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

export default TripleComponent;
