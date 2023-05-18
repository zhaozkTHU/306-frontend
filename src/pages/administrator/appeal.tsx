import { Button, Space, Table, message } from "antd";
import { ColumnsType } from "antd/es/table";
import axios, { AxiosError } from "axios";
import { useEffect, useState } from "react";

interface AppealData {
  appeal_id: number;
  user_id: number;
  description: string;
}

const AdminAppeal = () => {
  const [appealData, setAppealData] = useState<AppealData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  useEffect(() => {
    axios.get("/api/admin/appeal", { headers: { Authorization: localStorage.getItem("token") } })
      .then((res) => setAppealData(res.data.data))
      .catch((err: AxiosError) => {
        message.error((err.response?.data as any).message);
      });
  });

  const columns: ColumnsType<AppealData> = [
    // {
    //   title: "申诉编号",
    //   dataIndex: "appeal_id",
    //   key: "appeal_id",
    // },
    {
      title: "用户ID",
      dataIndex: "user_id",
      key: "user_id",
    },
    {
      title: "申诉内容",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "操作",
      dataIndex: "appeal_id",
      render: (appeal_id: number, _, index) => (
        <Space>
          <Button
            type="link"
            onClick={() => {
              setLoading(true);
              axios.post(
                "/api/admin/appeal",
                { appeal_id, pass: true },
                { headers: { Authorization: localStorage.getItem("token") } }
              )
                .then(() => message.success("操作成功"))
                .catch((err: AxiosError) => {
                  message.error((err.response?.data as any).message);
                })
                .finally(() => { setLoading(false); setAppealData(appealData.splice(index, 1)); });
            }}
            loading={loading}
          >
            通过
          </Button>
          <Button
            type="link"
            onClick={() => {
              setLoading(true);
              axios.post(
                "/api/admin/appeal",
                { appeal_id, pass: false },
                { headers: { Authorization: localStorage.getItem("token") } }
              )
                .then(() => message.success("操作成功"))
                .catch((err: AxiosError) => {
                  message.error((err.response?.data as any).message);
                })
                .finally(() => { setLoading(false); setAppealData(appealData.splice(index, 1)); });
            }}
            loading={loading}
          >
            不通过
          </Button>
        </Space>
      )
    }
  ];

  return (
    <Table columns={columns} dataSource={appealData} />
  );
};

export default AdminAppeal;