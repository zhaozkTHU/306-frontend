import React, { useState, useEffect, useRef } from "react";
import { Button, Modal, Progress, message, InputNumber, Tag, Space, Tooltip, Spin, Select, Divider } from 'antd';
import { 
  SketchOutlined,
  SketchCircleFilled,
  ClockCircleFilled,
  CrownOutlined,
  QuestionCircleOutlined
} from "@ant-design/icons";
import styles from './vip.module.css';
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
      username: "名字五个字",
      level: "bronze",
      exp: 0,
      points: 0,
    };
  });
  const [waitLoading, setWaitLoading] = useState(false);
  const [vipExpiry, setVipExpiry] = useState<number>(Date.now());
  const [timer, setTimer] = useState<string>("");
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null); // Using ref to hold the intervalId

  const [showModal, setShowModal] = useState(false);
  const [helpModal, setHelpModal] = useState(false); 
  const [buyExpModal, setBuyExpModal] = useState(false);
  const [buyTimeModal, setBuyTimeModal] = useState(false);
  const [exchangeValue, setExchangeValue] = useState(0);
  const [vipTime, setVipTime] = useState<number>(15);
  const token = localStorage.getItem("token");
  const { Option } = Select;

  useEffect(() => {
    fetchAccountInfo();
  }, []);
  useEffect(() => {
    if (vipExpiry > 0) {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }

      intervalIdRef.current = setInterval(() => {
        const now = Date.now();
        const diffSec = Math.floor((vipExpiry - now) / 1000);
        console.log('ddl:',new Date(vipExpiry));
        console.log('Now:', new Date(Date.now()))
        console.log(`Time difference in seconds: ${diffSec}`); // 打印时间差，单位为秒
        if (now >= vipExpiry) {
          setTimer("流量包已不可用");
          message.warning("流量包已过期");
          clearInterval(intervalIdRef.current as NodeJS.Timeout); // stop the interval
        } else {
          const diffSec = Math.floor((vipExpiry - now) / 1000);
          const hours = Math.floor(diffSec / 3600);
          const minutes = Math.floor((diffSec % 3600) / 60);
          const seconds = diffSec % 60;
          setTimer(`${hours}h ${minutes}m ${seconds}s`);
        }
      }, 1000);
    }
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, [vipExpiry]);

  const fetchAccountInfo = () => {
    setWaitLoading(true);
    axios.get('/api/account_info', { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => {
        setAccountInfo(response.data);
        setVipExpiry(response.data.ddl_time * 1000+(8 * 60 * 60 * 1000-12000));
        console.log('ddl:',new Date(response.data.ddl_time * 1000+(8 * 60 * 60 * 1000-12000)));
        setWaitLoading(false);
      })
      .catch((error) => {
        message.error("获取账户信息失败");
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
        fetchAccountInfo();
        message.success("经验购买成功");
      })
      .catch((error) => {
        console.error(error);
      });
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
        setVipExpiry(response.data.ddl_time * 1000+(8 * 60 * 60 * 1000-12000));
        console.log('ddl:',new Date(response.data.ddl_time * 1000+(8 * 60 * 60 * 1000-12000)));
        setBuyTimeModal(false);
        setWaitLoading(false);
        message.success(`成功购买 ${vipTime}s 流量包`);
        fetchAccountInfo();
      })
      .catch((error) => {
        message.error(`购买失败: ${error.message}`);
        console.error(error);
        setWaitLoading(false);
      });
  };

  const getLevelProgress = (level: string) => {
    return (accountInfo.exp / mapLevel2Exp[level]) * 100;
  };
  const getColor = (level: string) => {
    switch (level) {
      case "bronze" || "silver":
        return "#C0C0C0"; // 银色
      case "gold":
        return "#FFD700"; // 金色
      default:
        return "#000000"; // 默认颜色
    }
  };
  
  return (
    <div>
      <Tooltip title={
        <span>
          <ClockCircleFilled /> {timer}
        </span>
      }>
        <Button
          type="text"
          icon={(accountInfo.level === "diamond" || vipExpiry-Date.now()>=0) ? (
            <SketchOutlined className={styles.rainbow} />
          ) : (
            <CrownOutlined style={{ color: getColor(accountInfo.level) }} />
          )}
          onClick={() => (setShowModal(true), fetchAccountInfo())}
          style={{
            fontSize: "20px",
            width: "80",
            height: "12vh",
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
        <Modal onCancel={() => setHelpModal(false)} onOk={() => setHelpModal(false)} open={helpModal} title={"流量包"}>
          <p>
            不同的会员等级对应不同的流量限制，低等级会员购买流量包可以<b>暂时</b>获得<span style={{ color: "red" }}>钻石级别</span>流量限制
          </p>
          <p>
            您当前的等级是: <b>{mapLevel2Zh[accountInfo.level].name}</b>
          </p>
          <p>
            目前提供三种时长的流量包: <b>15s</b>, <b>30s</b>, <b>60s</b>, 分别需要消耗 <b>5</b>, <b>9</b>, <b>15</b> 点数
          </p>
        </Modal>
      )}

      { buyTimeModal && (
        <Modal onCancel={() => setBuyTimeModal(false)} onOk={buyVipTime} open={buyTimeModal} title={"购买流量包"}>
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
            value={vipTime}
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
