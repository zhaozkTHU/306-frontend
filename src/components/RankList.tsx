import { useEffect, useState } from "react";
import axios from "axios";
import { Table, message } from "antd";
import type { ColumnsType } from "antd/lib/table";

interface RankListData {
  rank_lists: {
    username: string;
    points: string;
  }[];
  my_rank: number;
  my_points: number;
}

const columns: ColumnsType<RankListData["rank_lists"][0]> = [
  {
    title: "排名",
    render: (_value, _record, index) => index + 1,
  },
  {
    title: "用户名",
    dataIndex: "username",
  },
  {
    title: "积分",
    dataIndex: "points",
  }
];

const RankList: React.FC = () => {
  const [rankListData, setRankListData] = useState<RankListData>({ rank_lists: [], my_rank: 0, my_points: 0 });
  useEffect(() => {
    axios.get("/api/rank", { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } })
      .then((value) => { setRankListData(value.data); console.log(value.data); })
      .catch((reason) => {
        console.log(reason);
        message.error("获取排行榜失败");
      });
  }, []);

  // 强调my_rank所在行
  return (
    <Table
      columns={columns}
      dataSource={rankListData.rank_lists}
      rowKey="username"
      pagination={false}
      bordered
      rowClassName={(_record, index) => index === rankListData.my_rank - 1 ? "rank-list-row" : ""}
    />
  );
};

export default RankList;
