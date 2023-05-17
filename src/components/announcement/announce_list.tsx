import React, { useState, useEffect } from "react";
import { Table, Select, Input, Space, Typography, Modal, Tag } from "antd";
import axios from "axios";
import { Announcement, Label, mapLabel } from "@/const/interface";

const { Title } = Typography;
const { Option } = Select;
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
      
  const [data, setData] = useState<Array<Announcement>>(sampleAnnouncements);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState("time");
  const [label, setLabel] = useState<Label>(Label.All);
  const [open, setOpen] = useState(false);
  const [modalText, setModalText] = useState("");

//   useEffect(() => {
//     const fetchData = async () => {
//       const result = await axios("GET/api/announcement");
//       setData(result.data);
//     };
//     fetchData();
//   }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSortKeyChange = (value: string) => {
    setSortKey(value);
  };

  const handleLabelChange = (value: Label) => {
    setLabel(value);
  };

  const handleTitleClick = (text: string) => {
    setModalText(text);
    setOpen(true);
  };

  const handleModalClose = () => {
    setOpen(false);
  };

  const handleEdit = async (record: Announcement) => {
    try {
      await axios.post("/announcement", { id: record.key, announcement: record });
      // 在这里，我假设公告的 ID 存储在 key 属性中。
      // 在请求成功后，你可能需要刷新数据。
    } catch (error) {
      // 处理错误
    }
  };
  
  const handleDelete = async (record: Announcement) => {
    try {
      await axios.post("/delete_announce", { id: record.key });
      // 在请求成功后，你可能需要刷新数据。
    } catch (error) {
      // 处理错误
    }
  };
  

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text: string, record: Announcement) => (
        <Title
          level={4}
          onClick={() => handleTitleClick(record.text)}
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
    {
        title: "Actions",
        key: "actions",
        render: (text: string, record: Announcement) => (
          isAdmin && (
            <Space size="middle">
              <a onClick={() => handleEdit(record)}>修改</a>
              <a onClick={() => handleDelete(record)}>删除</a>
            </Space>
          )
        ),
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
      </Space>
      <Table dataSource={filteredData} columns={columns} rowKey="time" />
      <Modal
        title="Announcement Text"
        open={open}
        onOk={handleModalClose}
        onCancel={handleModalClose}
      >
        <p>{modalText}</p>
      </Modal>
    </Space>
  );
};
