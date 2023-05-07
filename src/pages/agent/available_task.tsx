import { mapEntemplate2Zhtemplate, mapTag2Zh } from "@/const/interface";
import { downLoadZip, request } from "@/utils/network";
import { transTime } from "@/utils/valid";
import Typography from "@mui/material/Typography";
import { Button, Descriptions, Divider, Form, Modal, Select, Tag, message } from "antd";
import { ColumnsType } from "antd/es/table";
import { Table } from "antd/lib";
import { useEffect, useState } from "react";
import { AgentLabeler } from "./available_labeler";

interface AgentTaskInfo {
  task_id: number;
  create_at: number;
  deadline: number;
  title: string;
  batch_file: string;
  reward: number;
  time: number;
  labeler_number: number;
  demander_id: number;
  type: string;
  template: string;
}

const AgentAvailableTask = () => {
  const [tasks, setTasks] = useState<AgentTaskInfo[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(true);
  const [labelerLists, setLabelerLists] = useState<AgentLabeler[]>([])
  const [distributeModalOpen, setDistributeModalOpen] = useState<boolean>(false)

  const [detail, setDetail] = useState<AgentTaskInfo>({
    task_id: 1,
    create_at: 198374982,
    deadline: 21342342134,
    title: "任务标题",
    batch_file: "",
    reward: 3,
    time: 5,
    labeler_number: 5,
    demander_id: 3,
    type: "intent",
    template: "TextClassification",
  })
  const [loading, setLoading] = useState<boolean>(false)
  const [detailModalOpen, setDetailModalOpen] = useState<boolean>(false)

  const fetchList = async () => {
    request("/api/agent_acquire_labeler_list", "GET")
      .then((response) => {
        setLabelerLists(response.data.data)
      })
      .catch((error) => {
        if (error.response) {
          message.error(`获取标注方列表失败，${error.response.data.message}`);
        } else {
          message.error("获取标注方列表失败，网络错误");
        }
      })
      .finally(() => {
        setRefreshing(false);
      })
  }
  useEffect(() => {
    request("/api/agent_distribute", "GET")
      .then((response) => {
        setTasks(response.data.data)
      })
      .catch((error) => {
        if (error.response) {
          message.error(`获取可分发任务列表失败，${error.response.data.message}`);
        } else {
          message.error("获取可分发任务失败，网络错误");
        }
      })
    fetchList();
  }, [refreshing])

  const distribute = async (task_id: number, labeler: string[]) => {
    request("/api/agent_distribute", "POST", {
      task_id: task_id,
      labeler: labeler,
    })
      .then(() => {
        message.success("派发成功")
      })
      .catch((error) => {
        if (error.response) {
          message.error(`任务派发失败，${error.response.data.message}`);
        } else {
          message.error("任务派发失败，网络错误");
        }
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(true);
      })
  }

  const TasksTableColumns: ColumnsType<any> = [
    {
      title: "任务标题",
      dataIndex: "title",
      key: "title",
      align: "center",
      width: "30%"
    },
    {
      title: "任务模板",
      dataIndex: "template",
      key: "template",
      align: "center",
      width: "30%",
      render: (template) => {
        return (
          mapEntemplate2Zhtemplate[template]
        )
      }
    },
    {
      title: "操作",
      dataIndex: "operation",
      key: "operation",
      align: "center",
      render: (_, record) => {
        return (
          <>
            <Button type="link" onClick={() => {
              setDetail(record)
              setDetailModalOpen(true)
            }}>查看</Button>
            <Button type="link" onClick={() => {
              downLoadZip(record.batch_file)
            }}>下载</Button>
            <Button type="link" onClick={() => {
              setDetail(record)
              setDistributeModalOpen(true)
            }}>分发</Button>
          </>
        )
      }
    }
  ]

  return (
    <>
      <Modal open={detailModalOpen} onCancel={() => { setDetailModalOpen(false) }} footer={null}>
        <Typography component="h1" variant="h5" style={{ textAlign: 'center' }}>
          任务详情
        </Typography>
        <Descriptions bordered column={4}>
          <Descriptions.Item label="标题" span={4}>
            {detail.title}
          </Descriptions.Item>
          <Descriptions.Item label="创建时间" span={4}>
            {transTime(detail.create_at)}
          </Descriptions.Item>
          <Descriptions.Item label="截止时间" span={4}>
            {transTime(detail.deadline)}
          </Descriptions.Item>
          <Descriptions.Item label="模板" span={2}>
            {mapEntemplate2Zhtemplate[detail.template]}
          </Descriptions.Item>
          <Descriptions.Item label="要求标注方人数" span={2}>
            {detail.labeler_number}
          </Descriptions.Item>
          <Descriptions.Item label="单题奖励" span={2}>
            {detail.reward}
          </Descriptions.Item>
          <Descriptions.Item label="单题限时" span={2}>
            {detail.time}秒
          </Descriptions.Item>
          <Descriptions.Item label="任务标签" span={2}>
            <Tag color="cyan">{mapTag2Zh[detail.type]}</Tag>
          </Descriptions.Item>
        </Descriptions>
      </Modal>

      <Modal open={distributeModalOpen} footer={null} onCancel={() => { setDistributeModalOpen(false) }} destroyOnClose>
        <Typography component="h1" variant="h5" style={{ textAlign: 'center' }}>
          分配任务
        </Typography>
        <Divider />
        <Form
          name="basic"
          initialValues={{ remember: true }}
          onFinish={(values) => {
            setLoading(true)
            distribute(detail.task_id, values.labeler)
            setDistributeModalOpen(false)
          }}
          autoComplete="off"
        >
          <p>作为中介，您可以将该委托给您的任务分发给标注方，请在下面选择您要分发的标注方的名字</p>
          <Form.Item
            name="labeler"
            rules={[
              { required: true, message: "不能为空" },
            ]}
          >
            <Select
              size="large"
              showSearch
              mode="multiple"
              allowClear
              style={{ width: '100%' }}
              placeholder="请选择要分配的标注方，支持搜索"
              options={labelerLists.map((labeler) => {
                return {
                  label: labeler.username,
                  value: labeler.username
                }
              })}
            />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            style={{
              backgroundColor: "#3b5999",
              marginBottom: "5px",
            }}
          >
            确认
          </Button>
        </Form>
      </Modal>
      <Table columns={TasksTableColumns} dataSource={tasks} loading={refreshing || loading} pagination={{ pageSize: 8 }}/>
    </>
  )
}

export default AgentAvailableTask