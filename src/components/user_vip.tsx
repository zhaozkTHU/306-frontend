import React, { useState, useEffect } from "react";
import { Button, Modal, Progress, message, InputNumber, Tag, Space, Tooltip, Spin, Select } from 'antd';
import { 
  SketchOutlined,
  CrownOutlined,
} from "@ant-design/icons";
import axios from 'axios';
import { mapLevel2Exp, mapLevel2Zh } from "@/const/interface"; // Importing your mappings

interface Info {
  username: string;
  level: string;
  exp: number;
  points: number;
}

const MemberComponent = () => {
  const [accountInfo, setAccountInfo] = useState<Info>(()=>{
    return {
      username: '名字五个字',
      level: 'bronze',
      exp: 0,
      points: 0,
    };
  });
  const [Loading, setLoading] = useState(true);
  const [vipExpiry, setVipExpiry] = useState(null);
  const [countdown, setCountdown] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [buyExpModal, setBuyExpModal] = useState(false);
  const [buyTimeModal, setBuyTimeModal] = useState(false);
  const [exchangeValue, setExchangeValue] = useState(0);
  const [vipTime, setVipTime] = useState<number>(0);
  const token = localStorage.getItem("token");
  const { Option } = Select;

  useEffect(() => {
    // Call your API when the component mounts
    fetchAccountInfo();
  }, []);
  useEffect(() => {
    if (vipExpiry) {
      const interval = setInterval(() => {
        const now = Date.now();
        const diff = vipExpiry * 1000 - now;

        if (diff < 0) {
          setCountdown('流量包不可用');
          clearInterval(interval);
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const secs = Math.floor((diff % (1000 * 60)) / 1000);
          setCountdown(`${hours}h ${mins}m ${secs}s`);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [vipExpiry]);

  const fetchAccountInfo = () => {
    axios.get('/api/account_info', { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => {
        setAccountInfo(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
      });
  };
  const buyExperience = () => {
    axios.post('/api/exp', {points: exchangeValue}, { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => {
        setAccountInfo(response.data);
        setBuyExpModal(false);
        message.success('Experience purchased successfully');
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const buyVipTime = () => {
    if(vipTime <= 0 || !(vipTime === 15 || vipTime === 30 || vipTime === 60)) {
      message.error('Please select a legal time period');
      return;
    }
    axios.post('/api/membership', {vip_time: vipTime}, { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => {
        setVipExpiry(response.data.ddl_time);
        setBuyTimeModal(false);
        message.success('VIP time purchased successfully');
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const getLevelProgress = (level: string) => {
    return (accountInfo.exp / mapLevel2Exp[level]) * 100;
  };

  if(Loading){
    return <Spin tip="Loading..."/>;
  }
  return (
    <div>
      <Tooltip title={vipExpiry ? countdown : <Spin size="small" tip="Loading..."/>}>
        <Button
          type="text"
          icon={(accountInfo.level === 'diamond') ? <SketchOutlined /> : <CrownOutlined />}
          onClick={() => setShowModal(true)}
          style={{
            fontSize: "20px",
            width: 80,
            height: 80,
            color: "white",
          }}
        />
      </Tooltip>

      {showModal && (
        <Modal open={showModal} onCancel={() => setShowModal(false)} footer={null}>
          <h2>{accountInfo && accountInfo.username}</h2>
          <Tag color={mapLevel2Zh[accountInfo.level].color}>Level: {mapLevel2Zh[accountInfo.level].name}</Tag>
          <p>Points: {accountInfo && accountInfo.points}</p>
          <p>Experience: <Progress size="small" percent={getLevelProgress(accountInfo.level)} type="circle" /></p>
          <Space >
            <Button disabled={accountInfo && (accountInfo.points <= 0 || accountInfo.level === "Diamond")} onClick={() => setBuyExpModal(true)}>Buy Experience</Button>
            <Button disabled={accountInfo && (accountInfo.points <= 0 || accountInfo.level === "Diamond")} onClick={() => setBuyTimeModal(true)}>Buy VIP Time</Button>
          </Space>
        </Modal>
      )}

      {buyExpModal && (
        <Modal onCancel={() => setBuyExpModal(false)} onOk={buyExperience} open={buyExpModal} title="购买经验">
          <InputNumber min={1} max={accountInfo && accountInfo.points} onChange={value => setExchangeValue(value || 0)} />
        </Modal>
      )}

      {buyTimeModal && (
        <Modal onCancel={() => setBuyTimeModal(false)} onOk={buyVipTime} open={buyTimeModal} title="购买流量包">
          <Select 
            onChange={(value: number) => setVipTime(value)}
            placeholder="选择流量包时长"
          >
            <Option value={15} disabled={accountInfo && accountInfo.points < 5}>
              15s 流量包
            </Option>
            <Option value={30} disabled={accountInfo && accountInfo.points < 9}>
              30s 流量包
            </Option>
            <Option value={60} disabled={accountInfo && accountInfo.points < 15}>
              60s 流量包
            </Option>
          </Select>
        </Modal>
      )}
    </div>
  );
};

export default MemberComponent;

     
