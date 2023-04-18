import { TaskInfo } from "@/const/interface";
import { Button, Descriptions, message, Modal } from "antd";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { ColumnsType } from "antd/es/table";
import { Table } from "antd/lib";
import { transTime } from "@/utils/valid";

const AdministratorCheckTask = () => {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState<boolean>(true);
  const [tasks, setTasks] = useState<TaskInfo[]>([]);
  const [taskDetailModalOpen, setTaskDetailModalOpen] = useState<boolean>(false);
  const [taskDetail, setTaskDetail] = useState<TaskInfo>({
    task_id: -1,
    title: "",
    create_at: 0,
    deadline: 0,
    template: "TextClassification",
    reward: 0,
    time: 0,
    labeler_number: 0,
    demander_id: -1,
    task_data: [],
  });
  useEffect(() => {
    if (!router.isReady) {
      return;
    }
    axios
      .get("/api/undistribute", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        const newTasks = response.data.tasks;
        setTasks(newTasks);
      })
      .catch((error) => {
        if (error.response) {
          message.error(`获取需求方权限申请失败，${error.response.data.message}`);
        } else {
          message.error("网络失败，请稍后再试");
        }
      })
      .finally(() => {
        setRefreshing(false);
      });
  }, [router, refreshing]);
  const columns: ColumnsType<any> = [
    {
      title: "标题",
      dataIndex: "title",
      key: "title",
      align: "center",
      render: (text, record) => (
        <Button
          type="link"
          onClick={() => {
            setTaskDetail(record);
            setTaskDetailModalOpen(true);
          }}
        >
          {text}
        </Button>
      ),
    },
    {
      title: "模板",
      dataIndex: "template",
      key: "template",
      align: "center",
    },
    {
      title: "审核操作",
      key: "action",
      align: "center",
      render: (_, record) => (
        <>
          <Button
            type="link"
            onClick={() => {
              axios
                .post(
                  "/api/audit_result",
                  {
                    task_id: `${record.task_id}`,
                    result: true,
                  },
                  {
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                  }
                )
                .then(() => {
                  message.success("审核结果提交成功");
                })
                .catch((error) => {
                  if (error.response) {
                    message.error(`审核结果提交失败，${error.response.data.message}`);
                  } else {
                    message.error("网络失败，请稍后再试");
                  }
                })
                .finally(() => {
                  setRefreshing(true);
                });
            }}
          >
            通过
          </Button>
          <Button
            type="link"
            onClick={() => {
              axios
                .post(
                  "/api/audit_result",
                  {
                    task_id: `${record.task_id}`,
                    result: false,
                  },
                  {
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                  }
                )
                .then(() => {
                  message.success("审核结果提交成功");
                })
                .catch((error) => {
                  if (error.response) {
                    message.error(`审核结果提交失败，${error.response.data.message}`);
                  } else {
                    message.error("网络失败，请稍后再试");
                  }
                })
                .finally(() => {
                  setRefreshing(true);
                });
            }}
          >
            不通过
          </Button>
        </>
      ),
    },
  ];
  return (
    <>
      <Modal
        open={taskDetailModalOpen}
        onCancel={() => setTaskDetailModalOpen(false)}
        footer={null}
        title={taskDetail.title}
      >
        <>
          <p>创建人ID: {taskDetail.demander_id}</p>
          <p>创建时间: {transTime(taskDetail.create_at)}</p>
          <p>截止时间: {transTime(taskDetail.deadline)}</p>
          <p>任务模板: {taskDetail.template}</p>
          <p>单题奖励: {taskDetail.reward}</p>
          <p>单题限时: {taskDetail.time}</p>
          <p>标注者人数: {taskDetail.labeler_number}</p>
          <p>任务详情:</p>
        </>
      </Modal>
      <Table columns={columns} dataSource={tasks} />
    </>
  );
};

export default AdministratorCheckTask;
