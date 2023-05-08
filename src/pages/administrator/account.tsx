import { mapLevel2Zh, mapRole2En } from "@/const/interface";
import { request } from "@/utils/network";
import { SearchOutlined } from "@ant-design/icons";
import Typography from "@mui/material/Typography";
import { Button, Tag, message, Table, Modal, Divider, Descriptions, Input, Space, InputRef } from "antd";
import { ColumnsType } from "antd/es/table";
import { useEffect, useRef, useState } from "react";

interface UserDetail {
  username: string;
  invitecode: string;
  level: "bronze" | "silver" | "gold" | "diamond";
  exp: number;
  points: number;
  credits: number;
  role: string;
  is_blocked: boolean;
  is_vip: boolean;
}

const AdministratorAccount = () => {
  const [refreshing, setRefreshing] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [userList, setUserList] = useState<UserDetail[]>([]);
  const searchInput = useRef<InputRef>(null);
  const [detail, setDetail] = useState<UserDetail>({
    username: "",
    invitecode: "",
    level: "bronze",
    exp: 0,
    points: 0,
    credits: 0,
    role: "demander",
    is_blocked: true,
    is_vip: false,
  });
  const [detailModalOpen, setDetailModalOpen] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>("");
  useEffect(() => {
    request("/api/administrator/user_info", "GET")
      .then((response) => {
        setUserList(response.data.data);
      })
      .catch((error) => {
        if (error.response) {
          message.error(`获取用户列表失败，${error.response.data.message}`);
        } else {
          message.error("获取用户列表失败，网络错误");
        }
      })
      .finally(() => {
        setRefreshing(false);
      });
  }, [refreshing]);
  const block = async (username: string, block: boolean) => {
    request("/api/block_account", "POST", {
      username: username,
      block: block,
    })
      .then(() => {
        message.success(`${block ? "封禁" : "解封"}成功`);
      })
      .catch((error) => {
        if (error.response) {
          message.error(`操作失败，${error.response.data.message}`);
        } else {
          message.error("操作失败，网络错误");
        }
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(true);
      });
  };
  const userListColumns: ColumnsType<any> = [
    {
      title: "用户名",
      dataIndex: "username",
      key: "username",
      align: "center",
      width: "25%",
      filtered: true,
      filterDropdown: () => (
        <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`搜索用户名`}
          value={searchText}
          onChange={(e) => {setSearchText(e.target.value?e.target.value:"");}}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => {}}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            搜索
          </Button>
          <Button
            onClick={() => {}}
            size="small"
            style={{ width: 90 }}
          >
            重置
          </Button>
        </Space>
      </div>
      ),
      onFilter: (value, record) => searchText.indexOf(value.toString())===-1,
      render: (username, record) => {
        return (
          <Button
            type="link"
            onClick={() => {
              setDetail(record);
              setDetailModalOpen(true);
            }}
          >
            {username}
          </Button>
        );
      },
    },
    {
      title: "身份",
      dataIndex: "role",
      key: "role",
      align: "center",
      width: "25%",
      filters: [
        {
          text: "需求方",
          value: "demander",
        },
        {
          text: "标注方",
          value: "labeler",
        },
        {
          text: "中介",
          value: "agent",
        },
        {
          text: "管理员",
          value: "administrator",
        },
      ],
      onFilter: (values, record) => record.role === values,
      render: (role) => {
        return <p>{mapRole2En[role]}</p>;
      },
    },
    {
      title: "状态",
      dataIndex: "is_blocked",
      key: "is_blocked",
      align: "center",
      width: "25%",
      filters: [
        {
          text: "已封禁",
          value: true,
        },
        {
          text: "正常",
          value: false,
        },
      ],
      onFilter: (values, record) => record.is_blocked === values,
      render: (is_blocked) => {
        return is_blocked ? (
          <Tag color="rgb(252, 61, 14)">已封禁</Tag>
        ) : (
          <Tag color="rgb(33, 198, 39)">正常</Tag>
        );
      },
    },
    {
      title: "操作",
      dataIndex: "operation",
      key: "operation",
      align: "center",
      width: "25%",
      render: (_, record) => {
        return (
          <>
            <Button
              type="link"
              onClick={() => {
                setLoading(true);
                block(record.username, true);
              }}
              disabled={record.is_blocked}
            >
              封禁
            </Button>
            <Button
              type="link"
              onClick={() => {
                setLoading(true);
                block(record.username, false);
              }}
              disabled={!record.is_blocked}
            >
              解封
            </Button>
          </>
        );
      },
    },
  ];
  return (
    <>
      <Modal
        onCancel={() => {
          setDetailModalOpen(false);
        }}
        footer={null}
        open={detailModalOpen}
      >
        <Typography component="h1" variant="h5" style={{ textAlign: "center" }}>
          用户详情
        </Typography>
        <Divider></Divider>
        <Descriptions bordered column={4}>
          <Descriptions.Item label="用户名" span={4}>
            {detail.username}
          </Descriptions.Item>
          <Descriptions.Item label="身份" span={4}>
            {detail.role}
          </Descriptions.Item>
          <Descriptions.Item label="等级" span={4}>
            <Tag color={mapLevel2Zh[detail.level]["color"]}>
              {mapLevel2Zh[detail.level]["name"]}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="经验" span={2}>
            {detail.exp}
          </Descriptions.Item>
          <Descriptions.Item label="信用分" span={2}>
            {detail.credits}
          </Descriptions.Item>
          <Descriptions.Item label="邀请码" span={4}>
            {detail.invitecode}
          </Descriptions.Item>
          <Descriptions.Item label="会员权限" span={4}>
            {detail.is_vip ? "有" : "无"}
          </Descriptions.Item>
        </Descriptions>
      </Modal>
      <Table
        columns={userListColumns}
        dataSource={userList}
        loading={refreshing || loading}
        pagination={{ pageSize: 5 }}
      />
    </>
  );
};

export default AdministratorAccount;
