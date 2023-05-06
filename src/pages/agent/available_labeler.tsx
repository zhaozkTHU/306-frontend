import { mapLevel2Zh, mapTag2Zh } from "@/const/interface";
import { request } from "@/utils/network";
import Typography from "@mui/material/Typography";
import { Button, Modal, Table, Tag, message } from "antd";
import { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react"

export interface AgentLabeler {
  username: string;
  points: number;
  level: "bronze" | "silver" | "gold" | "diamond";
  exp: number;
  credits: number;
  prefer: string;
  is_vip: boolean;
  is_blocked: boolean;
}


const AgentAvailableLabeler = () => {
  const [refreshing, setRefreshing] = useState<boolean>(true);
  const [labelerLists, setLabelerLists] = useState<AgentLabeler[]>([])
  const [labelerDetail, setLabelerDetail] = useState<AgentLabeler>({
    username: "",
    points: 0,
    level: "bronze",
    exp: 0,
    credits: 0,
    prefer: "intent",
    is_vip: false,
    is_blocked: false
  })
  const [LabelerModalOpen, setLabelerModalOpen] = useState<boolean>(false);

  useEffect(() => {
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
        setRefreshing(false)
      })
  }, [refreshing])
  const LabelerTableColumns: ColumnsType<any> = [
    {
      title: "用户名",
      dataIndex: "username",
      key: "username",
      align: "center",
      width: "20%",
      render: (name, record) => {
        return <Button type="link" onClick={() => { setLabelerDetail(record); setLabelerModalOpen(true) }}>{name}</Button>
      }
    },
    {
      title: "偏好设置",
      dataIndex: "prefer",
      key: "prefer",
      align: "center",
      render: (prefer) => (
        <Tag color="cyan">{prefer ? mapTag2Zh[prefer] : "暂无偏好"}</Tag>
      ),
      filters: [
        {
          text: "词性分类",
          value: "part-of-speech",
        },
        {
          text: "情感分类/分析",
          value: "sentiment",
        }
        ,
        {
          text: "意图揣测",
          value: "intent",
        }
        ,
        {
          text: "事件概括",
          value: "event",
        }
      ],
      onFilter: (values, record) => record.prefer === values,
    },
    {
      title: "信用分",
      dataIndex: "credits",
      key: "credits",
      align: "center",
      width: "15%",
      sorter: (a, b) => a.credits - b.credits,
    },
    {
      title: "等级",
      dataIndex: "level",
      key: "level",
      align: "center",
      width: "20%",
      render: (level) => (
        <Tag color={mapLevel2Zh[level]['color']}>{mapLevel2Zh[level]['name']}</Tag>
      )
    },
    {
      title: "状态",
      width: "20%",
      dataIndex: "is_blocked",
      key: "is_blocked",
      align: "center",
      render: (is_blocked) => {
        return (
          is_blocked ? <Tag color="rgb(252, 61, 14)">已封禁</Tag> :
            <Tag color="rgb(33, 198, 39)">正常</Tag>
        )
      }
    }
  ]

  return (
    <>
      <Modal open={LabelerModalOpen} onCancel={() => { setLabelerModalOpen(false) }} footer={null}>
        <Typography component="h1" variant="h5" style={{ textAlign: 'center' }}>
          标注方详情
        </Typography>

      </Modal>
      <Table columns={LabelerTableColumns} dataSource={labelerLists} loading={refreshing} pagination={{ pageSize: 5 }} />
    </>
  )
}

export default AgentAvailableLabeler