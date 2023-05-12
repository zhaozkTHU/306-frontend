import React, { useState, useEffect } from "react";
import { Button, Modal, Progress, message, InputNumber, Tag, Space, Tooltip, Spin } from 'antd';
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
  const [showModal, setShowModal] = useState(false);
  const [buyExpModal, setBuyExpModal] = useState(false);
  const [buyTimeModal, setBuyTimeModal] = useState(false);
  const [exchangeValue, setExchangeValue] = useState(0);
  const token = localStorage.getItem("token");

  useEffect(() => {
    // Call your API when the component mounts
    fetchAccountInfo();
  }, []);

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

  const buyVipTime = (time: number) => {
    axios.post('/api/membership', {vip_time: time}, { headers: { Authorization: `Bearer ${token}` } })
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
    return <>return <Spin tip="Loading..."/>;</>
  }
  return (
    <div>
      <Tooltip title={vipExpiry ? new Date(vipExpiry * 1000).toLocaleString() : "loading"}>
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
        <Modal onCancel={() => setBuyExpModal(false)} onOk={buyExperience}>
          <InputNumber min={1} max={accountInfo && accountInfo.points} onChange={value => setExchangeValue(value || 0)} />
        </Modal>
      )}

      {buyTimeModal && (
        <Modal onCancel={() => setBuyTimeModal(false)}>
          <Button disabled={accountInfo && accountInfo.points < 5} onClick={() => buyVipTime(15)}>Buy 15s VIP Time</Button>
          <Button disabled={accountInfo && accountInfo.points < 9} onClick={() => buyVipTime(30)}>Buy 30s VIP Time</Button>
          <Button disabled={accountInfo && accountInfo.points < 15} onClick={() => buyVipTime(60)}>Buy 60s VIP Time</Button>
        </Modal>
      )}
    </div>
  );
};

export default MemberComponent;

     
