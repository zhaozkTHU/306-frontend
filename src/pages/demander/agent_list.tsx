import { mapLevel2Zh } from "@/const/interface";
import { request } from "@/utils/network";
import { message, Table, Tag } from "antd";
import { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";

interface Agent {
  batch_file: string;
  create_at: number;
  deadline: number;
  demander_id: number;
  labeler_id: number[];
  labeler_number: number;
  labeler_state: string[];
  reward: number;
  state: string;
  task_id: number;
  template: string;
  time: number;
  title: string;
  type: string;
}

const DemanderAgentList = () => {
  const [refreshing, setRefreshing] = useState<boolean>(true);
  const [agents, setAgents] = useState<Agent[]>([]);
  // const [detail, setDetail] = useState<Agent>({
  //   batch_file: "",
  //   create_at: 0,
  //   deadline: 0,
  //   demander_id: 0,
  //   labeler_id: [],
  //   labeler_number: 0,
  //   labeler_state: [],
  //   reward: 0,
  //   state: "",
  //   task_id: 0,
  //   template: "",
  //   time: 0,
  //   title: "",
  //   type: ""
  // })
  useEffect(() => {
    request("/api/get_agent", "GET")
      .then((reponse) => {
        setAgents(reponse.data.data);
      })
      .catch((error) => {
        if (error.response) {
          message.error(`获取举报列表失败，${error.response.data.message}`);
        } else {
          message.error("获取举报列表失败，网络错误");
        }
      })
      .finally(() => {
        setRefreshing(false);
      });
  }, [refreshing]);

  const AgentTableColumns: ColumnsType<any> = [
    {
      title: "中介用户名",
      dataIndex: "username",
      key: "username",
      align: "center",
      width: "20%",
      sorter: (a, b) => a.reporter_id - b.reporter_id,
    },
    {
      title: "等级",
      dataIndex: "level",
      key: "level",
      align: "center",
      width: "20%",
      filters: [
        {
          text: "青铜",
          value: "bronze",
        },
        {
          text: "白银",
          value: "silver",
        },
        {
          text: "黄金",
          value: "gold",
        },
        {
          text: "钻石",
          value: "diamond",
        },
      ],
      onFilter: (values, record) => record.level === values,
      render: (level) => (
        <Tag color={mapLevel2Zh[level]["color"]}>{mapLevel2Zh[level]["name"]}</Tag>
      ),
    },
    {
      title: "信用分",
      dataIndex: "credits",
      key: "credits",
      align: "center",
      width: "20%",
      sorter: (a, b) => a.credits - b.credits,
    },
  ];

  return (
    <Table
      columns={AgentTableColumns}
      loading={refreshing}
      dataSource={agents}
      pagination={{ pageSize: 6 }}
    />
  );
};

export default DemanderAgentList;
