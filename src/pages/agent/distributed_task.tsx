import { ColumnsType } from "antd/es/table";
import { Button, Descriptions, Divider, Modal, Table, Tag, message } from "antd"
import { useEffect, useState } from "react";
import { downLoadZip, request } from "@/utils/network";
import { mapEntemplate2Zhtemplate, mapState2ColorChinese } from "@/const/interface";

interface task {
  title: string,
  create_at: number,
  deadline: number,
  reward: number,
  labeler_number: number,
  template: string,
  demander_id: number,
  labeler_id: number[],
  labeler_state: string[],
  state: string
}

const AgentDistributedTask = () => {
  const [refreshing, setRefreshing] = useState<boolean>(true);
  const [taskList, setTaskList] = useState<task[]>([]);
  const [detail, setDetail] = useState<task>({
    title: "",
    create_at: 0,
    deadline: 0,
    reward: 0,
    labeler_number: 0,
    template: "TextClassification",
    demander_id: 0,
    labeler_id: [],
    labeler_state: [],
    state: "labeling"
  });
  const [detailModalOpen, setDetailModalOpen] = useState<boolean>(false)
  useEffect(() => {
    request("/api/agent/distributed", "GET")
      .then((response) => {
        setTaskList(response.data.data)
      })
      .catch((error) => {
        if (error.response) {
          message.error(`获取任务列表失败，${error.response.data.message}`);
        } else {
          message.error("获取任务列表失败，网络错误");
        }
      })
      .finally(() => {
        setRefreshing(false)
      })
  }, [refreshing])
  const TaskListColumns: ColumnsType<any> = [
    {
      title: "任务标题",
      dataIndex: "title",
      key: "title",
      align: "center",
      width: "25%",
    },
    {
      title: "任务模板",
      dataIndex: "template",
      key: "template",
      align: "center",
      width: "25%",
      render: (template) => (
        mapEntemplate2Zhtemplate[template]
      )
    },
    {
      title: "任务状态",
      dataIndex: "state",
      key: "state",
      align: "center",
      width: "25%",
      render: (state) => (
        <Tag color={mapState2ColorChinese[state]['color']}>
          {mapState2ColorChinese[state]['description']}
        </Tag>
      )
    },
    {
      title: "操作",
      dataIndex: "operation",
      key: "operation",
      align: "center",
      render: (_, record) => (
        <>
          <Button onClick={() => { downLoadZip(record.batch_file) }} type="link">下载</Button>
          <Button type="link" onClick={() => { setDetail(record); setDetailModalOpen(true)}}>查看</Button>
        </>
      )
    }
  ]
  const LabelerTableColumn: ColumnsType<any> = [
    {
      title: "标注者ID",
      dataIndex: "labeler_id",
      key: "labeler_id",
      align: "center",
    },
    {
      title: "状态",
      dataIndex: "state",
      key: "state",
      align: "center"
    }
  ]
  return (
    <>
      <Modal open={detailModalOpen} onCancel={() => { setDetailModalOpen(false) }} footer={null}>
        <h3 style={{ textAlign: "center" }}>任务详情</h3>
        <Divider />
        <Descriptions bordered column={4}>
          <Descriptions.Item label="标题" span={4}>
            {detail.title}
          </Descriptions.Item>
          <Descriptions.Item label="创建时间" span={4}>
            {detail.create_at}
          </Descriptions.Item>
          <Descriptions.Item label="截止时间" span={4}>
            {detail.deadline}
          </Descriptions.Item>
          <Descriptions.Item label="奖励" span={2}>
            {detail.reward}
          </Descriptions.Item>
          <Descriptions.Item label="标注人数" span={2}>
            {detail.labeler_number}
          </Descriptions.Item>
          <Descriptions.Item label="发布者ID" span={4}>
            {detail.demander_id}
          </Descriptions.Item>
          <Descriptions.Item label="模板" span={4}>
            {mapEntemplate2Zhtemplate[detail.template]}
          </Descriptions.Item>
        </Descriptions>
        <Table columns={LabelerTableColumn} dataSource={detail.labeler_id.map((id: number, idx: number) => {
          return {
            labeler_id: id,
            state: detail.labeler_state[idx]
          }
        })} pagination={{ pageSize: 2 }}/>
      </Modal>
      <Table columns={TaskListColumns} loading={refreshing} dataSource={[detail]} />
    </>
  )
};

export default AgentDistributedTask;