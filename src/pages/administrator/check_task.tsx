import { TaskInfo } from "@/const/interface";
import { Button, Collapse, Descriptions, message, Modal, Spin } from "antd";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { ColumnsType } from "antd/es/table";
import { Table } from "antd/lib";
import { transTime } from "@/utils/valid";
import Problem from "@/components/demander_problem/problem";

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

  const { Panel } = Collapse;
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
    <Spin spinning={refreshing} tip="加载中...">
      <Modal
        open={taskDetailModalOpen}
        onCancel={() => setTaskDetailModalOpen(false)}
        footer={null}
        // title={taskDetail.title}
        width={"100%"}
        centered
      >
        <>
        <h3>基本信息</h3>
          <Descriptions bordered column={2}>
            <Descriptions.Item label="标题" span={2}>{taskDetail.title}</Descriptions.Item>
            <Descriptions.Item label="创建时间" span={1}>{transTime(taskDetail.create_at)}</Descriptions.Item>
            <Descriptions.Item label="截止时间" span={1}>{transTime(taskDetail.deadline)}</Descriptions.Item>
            <Descriptions.Item label="创建人ID" span={1}>{taskDetail.demander_id}</Descriptions.Item>
            <Descriptions.Item label="模板" span={1}>{taskDetail.template}</Descriptions.Item>
            <Descriptions.Item label="单题奖励" span={1}>{taskDetail.reward}</Descriptions.Item>
            <Descriptions.Item label="单题限时" span={1}>{taskDetail.time}</Descriptions.Item>
            <Descriptions.Item label="标注者人数" span={1}>{taskDetail.labeler_number}</Descriptions.Item>
          </Descriptions>
          <h3>题目详情</h3>
          <Collapse>
            <Panel key={""} header={"点击此处查看题目详情"}>
              {taskDetail.task_data.map((problem, idx) => 
                <Problem problem={problem} index={idx} template={`${taskDetail.template}`} showto="administrator" key={idx}/>
              )}
            </Panel>
          </Collapse>
        </>
      </Modal>
      <Table columns={columns} dataSource={tasks} />
    </Spin>
  );
};

export default AdministratorCheckTask;
