import React, { useState, useEffect } from "react";
import { Button, Modal, Progress, message, InputNumber, Tag, Space, Tooltip, Spin, Select, Divider } from 'antd';
import { 
  SketchOutlined,
  CrownOutlined,
  QuestionCircleOutlined
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
  const [accountInfo, setAccountInfo] = useState<Info>(() => {
    return {
      username: '名字五个字',
      level: 'bronze',
      exp: 0,
      points: 0,
    };
  });
  const [Loading, setLoading] = useState(true);
  const [waitLoading, setWaitLoading] = useState(false);
  const [vipExpiry, setVipExpiry] = useState(null);
  const [countdown, setCountdown] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [helpModal, setHelpModal] = useState(false); 
  const [buyExpModal, setBuyExpModal] = useState(false);
  const [buyTimeModal, setBuyTimeModal] = useState(false);
  const [exchangeValue, setExchangeValue] = useState(0);
  const [vipTime, setVipTime] = useState<number>(0);
  const token = localStorage.getItem("token");
  const { Option } = Select;

  useEffect(() => {
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
    setWaitLoading(true);
    axios.get('/api/account_info', { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => {
        setAccountInfo(response.data);
        setWaitLoading(false);
      })
      .catch((error) => {
        message.error(error);
        console.error(error);
        setWaitLoading(false);
      });
  };
  const buyExperience = () => {
    axios
      .post(
        "/api/exp",
        { points: exchangeValue },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {
        setAccountInfo(response.data);
        setBuyExpModal(false);
        message.success("经验购买成功");
      })
      .catch((error) => {
        console.error(error);
      });
      fetchAccountInfo();
  };

  const buyVipTime = () => {
    Modal.confirm({
      title: "确认购买",
      content: `确定要购买 ${vipTime}s 流量包吗？`,
      onOk: handleConfirmedBuyVipTime,
      onCancel: () => {
        Modal.destroyAll(); // 关闭所有弹窗
      },
    });
  };
  const handleConfirmedBuyVipTime = () => {
    if(vipTime <= 0 || !(vipTime === 15 || vipTime === 30 || vipTime === 60)) {
      message.error(`不合法的流量包时长: ${vipTime}s`);
      return;
    }
    setWaitLoading(true);
    axios.post('/api/membership', {vip_time: vipTime}, { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => {
        setVipExpiry(response.data.ddl_time);
        setBuyTimeModal(false);
        setWaitLoading(false);
        message.success(`成功购买 ${vipTime}s 流量包`);
      })
      .catch((error) => {
        message.error(error);
        console.error(error);
        setWaitLoading(false);
      });
      fetchAccountInfo();
  };

  const getLevelProgress = (level: string) => {
    return (accountInfo.exp / mapLevel2Exp[level]) * 100;
  };

  // if(Loading){
  //   return <Spin tip="Loading..."/>;
  // }
  return (
    <div>
      <Tooltip title={vipExpiry ? countdown : <Spin size="small" tip="Loading..."/>}>
        <Button
          type="text"
          icon={(accountInfo.level === 'diamond') ? <SketchOutlined /> : <CrownOutlined />}
          onClick={() => (setShowModal(true), fetchAccountInfo())}
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
          <h2>{accountInfo.username}</h2>
          <Tag color={mapLevel2Zh[accountInfo.level].color}>
            会员等级: {mapLevel2Zh[accountInfo.level].name}
          </Tag>
          <p>点数: {accountInfo.points}</p>
          <p>经验: <Progress size="small" percent={getLevelProgress(accountInfo.level)} type="circle" /></p>
          <Space >
            <Button disabled={accountInfo && (accountInfo.points <= 0 || accountInfo.level === "Diamond")} onClick={() => setBuyExpModal(true)}>购买经验</Button>
            <Button disabled={accountInfo && (accountInfo.points <= 0 || accountInfo.level === "Diamond")} onClick={() => setBuyTimeModal(true)}>购买流量包</Button>
          </Space>
        </Modal>
      )}

      { buyExpModal && (
        <Modal onCancel={() => setBuyExpModal(false)} onOk={buyExperience} open={buyExpModal} title="购买经验">
          <InputNumber min={1} max={accountInfo && accountInfo.points} onChange={value => setExchangeValue(value || 0)} />
        </Modal>
      )}
      { helpModal && buyTimeModal && (
        <Modal onCancel={() => setHelpModal(false)} onOk={() => setHelpModal(false)} open={helpModal}>
          <Divider children={"流量包"}/>
          <p>
            不同的会员等级对应不同的流量限制，低等级会员购买流量包可以<b>暂时</b>获得<span style={{ color: "red" }}>钻石级别</span>流量限制
          </p>
          <p>
            目前提供三种时长的流量包: <b>15s</b>, <b>30s</b>, <b>60s</b>, 分别需要消耗 <b>5</b>, <b>9</b>, <b>15</b> 点数
          </p>
        </Modal>
      )}

      { buyTimeModal && (
        <Modal onCancel={() => setBuyTimeModal(false)} onOk={buyVipTime} open={buyTimeModal}>
          <Divider children={"购买流量包"}/>
          <Tooltip title="什么是流量包">
            <Button
              type="text"
              size="small"
              onClick={() => {
                setHelpModal(true);
              }}
              icon={<QuestionCircleOutlined />}
            />
          </Tooltip>
          {(waitLoading) ? <Spin tip="Waitng..."/> :
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
          </Select>}
        </Modal>
      )}
    </div>
  );
};

export default MemberComponent;
