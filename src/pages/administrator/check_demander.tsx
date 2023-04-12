import { Button, message, Table } from "antd";
import { ColumnsType } from "antd/es/table";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const AdministratorCheckDemander = () => {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState<boolean>(true);
  const [demanders, setDemanders] = useState<{ username: string; invitecode: string }[]>([]);
  useEffect(() => {
    if (!router.isReady) {
      return;
    }
    axios
      .get("/api/demander_apply", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        const newDemanders = response.data.data;
        setDemanders(newDemanders);
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
      title: "用户名",
      dataIndex: "username",
      key: "username",
      align: "center",
    },
    {
      title: "邀请码",
      dataIndex: "invitecode",
      key: "invitecode",
      align: "center",
    },
    {
      title: "审核操作",
      key: "check",
      align: "center",
      render: (_, record) => (
        <>
          <Button
            type="link"
            onClick={() => {
              axios
                .post(
                  "/api/apply_result",
                  {
                    username: `${record.username}`,
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
                  "/api/apply_result",
                  {
                    username: `${record.username}`,
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
            不通过
          </Button>
        </>
      ),
    },
  ];
  return (
    <>
      <Table columns={columns} dataSource={demanders} />
    </>
  );
};

export default AdministratorCheckDemander;
