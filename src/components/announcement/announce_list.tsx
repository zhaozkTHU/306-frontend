import React, { useState, useEffect } from "react";
import { Table, Checkbox, Select, Input, Space, Typography, Modal, Tag, message, Button } from "antd";
import axios from "axios";
import { Announcement, Label, mapLabel } from "@/const/interface";

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;
interface AnnouncementListProps {
    isAdmin: boolean;
}

export const AnnouncementList: React.FC<AnnouncementListProps> = ({ isAdmin }) => {
    const sampleAnnouncements = [
        {
          admin_name: 'Admin1',
          key: true,
          label: Label.Update,
          text: '这是一项更新公告，详情请点击标题查看。',
          time: Date.now(),
          title: '系统更新公告',
        },
        {
          admin_name: 'Admin2',
          key: false,
          label: Label.Maintain,
          text: '这是一项维护公告，详情请点击标题查看。',
          time: Date.now() - 100000,
          title: '系统维护公告',
        },
        {
          admin_name: 'Admin3',
          key: true,
          label: Label.Block,
          text: '这是一项封禁公告，详情请点击标题查看。',
          time: Date.now() - 200000,
          title: '封禁公告',
        },
        {
          admin_name: 'Admin4',
          key: false,
          label: Label.Other,
          text: '这是一项其他公告，详情请点击标题查看。',
          time: Date.now() - 300000,
          title: '其他公告',
        },
    ];
      
  const [data, setData] = useState<Array<Announcement>>(sampleAnnouncements); // list
  const [loading, setLoading] = useState<boolean>(false);
  const [editable, setEditable] = useState<boolean>(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState<Announcement>(() => {
    return ({
      admin_name: '',
      key: false,
      label: Label.Other,
      text: '',
      time: Date.now(),
      title: '',
    });
  });
  const [newAnnouncement, setNewAnnouncement] = useState<Announcement>(() => {
    return ({
      admin_name: '',
      key: false,
      label: Label.Other,
      text: '',
      time: Date.now(),
      title: '',
    });
  });
  
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState("time");
  const [label, setLabel] = useState<Label>(Label.All);
  const [open, setOpen] = useState(false);
  const [modalText, setModalText] = useState("");
  const [isNewAnnouncementModalOpen, setIsNewAnnouncementModalOpen] = useState(false); // New modal open state

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => { // 获取最新列表
    const token = localStorage.getItem("token");
    setLoading(true);
    axios
      .get(
        "/api/announcement",
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {
        setData(response.data);
        message.success("更新公告列表");
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        message.error("获取公告列表更新失败");
        setLoading(false);
      });
  };

  const handleUpload = () => { // 上传新创建公告
    Modal.confirm({
      title: "确认发布新公告",
      content: "你确定要发布新公告吗？",
      onOk: handleConfirmedUpload,
      onCancel: () => {
        Modal.destroyAll(); // 关闭所有弹窗
      },
    });
  };
  const handleConfirmedUpload = async () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    axios
      .post(
        "/api/announcement",
        newAnnouncement,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        message.success("已发布！");
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        message.error("发布失败");
        setLoading(false);
      });
  };

  const handleDelete = () => { // 删除任务
    Modal.confirm({
      title: "确认删除",
      content: "确认要删除该公告吗?",
      onOk: handleConfirmedDelete,
      onCancel: () => {
        Modal.destroyAll(); // 关闭所有弹窗
      },
    });
  };
  const handleConfirmedDelete = async () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    axios
      .delete(
        "/api/announcement", { 
            headers: { 
                Authorization: `Bearer ${token}` 
            },
            params: { 
                announce_id: currentAnnouncement.announce_id
            },
        }
      )
      .then(() => {
        message.success("已上传！");
        setLoading(false);
        fetchData();
        setEditable(false);
      })
      .catch((error) => {
        console.error(error);
        message.error("提交数据失败");
        setLoading(false);
      });
  };
  const handleChange = () => { // 删除任务
    Modal.confirm({
      title: "确认更改",
      content: "确认要更改公告吗?",
      onOk: handleConfirmedChange,
      onCancel: () => {
        Modal.destroyAll(); // 关闭所有弹窗
      },
    });
  };
  const handleConfirmedChange = async () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    axios
      .put(
        "/api/announcement", {
            announcement_id: currentAnnouncement.announce_id,
            announcement: currentAnnouncement
        },
        { headers: { Authorization: `Bearer ${token}` }},
      )
      .then(() => {
        message.success("已修改！");
        setLoading(false);
        fetchData();
        setEditable(false);
      })
      .catch((error) => {
        console.error(error);
        message.error("修改失败");
        setLoading(false);
      });
  };
  const handleNewAnnouncementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewAnnouncement({ ...newAnnouncement, [e.target.name]: e.target.value }); // Update new announcement content
  };
  const handleNewAnnouncementModalOpen = () => {
    setIsNewAnnouncementModalOpen(true); // Open new announcement modal
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  const handleSortKeyChange = (value: string) => {
    setSortKey(value);
  };
  const handleLabelChange = (value: Label) => {
    setLabel(value);
  };
  const handleTitleClick = (record: Announcement) => {
    setCurrentAnnouncement(record);
    setOpen(true);
  };
  const handleModalClose = () => {
    setOpen(false);
  };

  const handleEdit = () => {
    if (isAdmin) {
        if(editable) setEditable(false);
        else setEditable(true);
    } else {
      message.error("没有管理员权限不得修改公告");
    }
  };

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text: string, record: Announcement) => (
        <Title
          level={record.key ? 4 : 5}
          onClick={() => handleTitleClick(record)}
          style={{ color: record.key ? "red" : "black", cursor: "pointer" }}
        >
          {text}
        </Title>
      ),
    },
    {
      title: "Admin",
      dataIndex: "admin_name",
      key: "admin_name",
    },
    {
      title: "Label",
      dataIndex: "label",
      key: "label",
      render: (label: Label) => {
        const { name, color } = mapLabel[label] || { name: '未知', color: 'gray' };
        return <Tag color={color}>{name}</Tag>;
      },
    },
    {
      title: "Time",
      dataIndex: "time",
      key: "time",
    },
  ];

  let filteredData = data;
  if (searchTerm) {
    filteredData = filteredData.filter(
      (announcement) =>
        announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        announcement.admin_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  if (label !== "all") {
    filteredData = filteredData.filter((announcement) => announcement.label === label);
  }
  filteredData.sort((a, b) => {
    if (sortKey === "key") {
      return a.key === b.key ? 0 : a.key ? -1 : 1;
    } else {
      return b.time - a.time;
    }
  });

  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      <Space style={{ marginBottom: 16 }}>
        <Input.Search placeholder="根据标题/发布者检索" onChange={handleSearch} />
        <Select defaultValue={sortKey} onChange={handleSortKeyChange} style={{ width: 200 }}>
          <Option value="time">按时间排序</Option>
          <Option value="key">按重要性排序</Option>
        </Select>
        <Select defaultValue={label} onChange={handleLabelChange} style={{ width: 200 }}>
          <Option value="all">所有公告</Option>
          <Option value={Label.Block}>封禁公示</Option>
          <Option value={Label.Maintain}>维护公告</Option>
          <Option value={Label.Update}>更新公告</Option>
          <Option value={Label.Other}>其他公告</Option>
        </Select>
        <Button onClick={()=>fetchData()}>获取最新公告列表</Button>
        {isAdmin && (<Button onClick={handleNewAnnouncementModalOpen}>新建公告</Button>)}
      </Space>
      <Table dataSource={filteredData} columns={columns} rowKey="time" />
      <Modal
        title={"公告内容"}
        open={open}
        onOk={()=>(handleModalClose(),setEditable(false))}
        onCancel={()=>(handleModalClose(),setEditable(false))}
      >
        <Input
          value={currentAnnouncement?.title}
          showCount
          onChange={(e) => setCurrentAnnouncement({...currentAnnouncement, title: e.target.value})}
          maxLength={20}
          disabled={!editable}
        />
        <TextArea
          value={currentAnnouncement?.text}
          showCount
          onChange={(e) => setCurrentAnnouncement({...currentAnnouncement, text: e.target.value})}
          maxLength={1000}
          autoSize={{ minRows: 3, maxRows: 5 }}
          disabled={!editable}
        />
        {isAdmin && (
          <>
            <Button onClick={handleEdit}>{editable ? "退出修改模式":"进入修改模式"}</Button>
            {editable && (
              <>
                <Button onClick={handleChange}>上传修改</Button>
                <Button onClick={handleDelete}>删除公告</Button>
              </>
            )}
          </>
        )}
      </Modal>
      <Modal
          title="新建公告"
          open={isNewAnnouncementModalOpen}
          onOk={handleConfirmedUpload}
          onCancel={() => setIsNewAnnouncementModalOpen(false)}
        >
          <Space direction="vertical" style={{ width: "100%" }}>
            <Title level={5}>标题</Title>
            <Input
              name="title"
              showCount
              value={newAnnouncement.title}
              maxLength={20}
              onChange={handleNewAnnouncementChange}
            />
            <Title level={5}>内容</Title>
            <TextArea
                name="text"
                showCount
                value={newAnnouncement.text}
                maxLength={1000}
                autoSize={{ minRows: 3, maxRows: 5 }}
                onChange={(e) => setNewAnnouncement({...newAnnouncement, text: e.target.value})}
            />
            <Title level={5}>是否关键</Title>
            <Checkbox
                name="key"
                checked={newAnnouncement.key}
                onChange={(e) => setNewAnnouncement({...newAnnouncement, key: e.target.checked })}
            >
                是否关键
            </Checkbox>
            <Title level={5}>标签</Title>
            <Select
                value={newAnnouncement.label}
                onChange={(value) => setNewAnnouncement({...newAnnouncement, label: value })}
            >
                <Option value="block">封禁公告</Option>
                <Option value="maintain">维护公告</Option>
                <Option value="other">其他公告</Option>
                <Option value="update">更新公告</Option>
            </Select>
          </Space>
        </Modal>
    </Space>
  );
};
