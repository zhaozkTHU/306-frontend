import {
  Avatar,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Modal,
  Progress,
  Row,
  Select,
  SelectProps,
  Tag,
  Tooltip,
  message,
  Space,
} from "antd";
import { ProCard } from "@ant-design/pro-components";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { HelpOutline } from "@mui/icons-material";
import { Dispatch, SetStateAction, useState } from "react";
import { mapLevel2Zh } from "@/const/interface";
import { request } from "@/utils/network";
import Grid from "@mui/material/Grid";

export interface UserInfoProps {
  username: string;
  invitecode: string;
  level: string;
  exp: number;
  points: number;
  email: string;
  credits: number;
  label_type: string[];
  setRefreshing: Dispatch<SetStateAction<boolean>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
}

const UserInfo = (props: UserInfoProps) => {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState<boolean>(false);
  const update_prefer = async (prefer: string[]) => {
    request("/api/update_prefer", "POST", {
      prefer: prefer,
    })
      .then(() => {
        message.success("更新偏好标签成功");
      })
      .catch((error) => {
        if (error.response) {
          message.error(`更新偏好失败，${error.response.data.message}`);
        } else {
          message.error("更新偏好失败，网络错误");
        }
      })
      .finally(() => {
        props.setLoading(false);
        props.setRefreshing(true);
      });
  };
  const preferTag: SelectProps["options"] = [
    {
      label: "情感分类/分析",
      value: "sentiment",
    },
    {
      label: "词性分类",
      value: "part-of-speech",
    },
    {
      label: "意图揣测",
      value: "intent",
    },
    {
      label: "事件概括",
      value: "event",
    },
  ];
  return (
    <>
      <Modal
        open={isInviteModalOpen}
        onCancel={() => {
          setIsInviteModalOpen(false);
        }}
        footer={null}
      >
        <h2 style={{ textAlign: "center" }}>邀请码</h2>
        <Divider />
        <p>
          为了<b>造福</b>广大用户，扩大306众包平台的影响力，我们为每个用户配备了邀请码。
        </p>
        <p>
          请将这个邀请码分享给您的朋友，如果他们在注册本平台账号可以填写您的邀请码，您和您的朋友将获得丰厚的
          <span style={{ color: "green" }}>点数奖励</span>，<b>邀请越多，奖励越多</b>。
        </p>
        <p>
          赶快将邀请码分享到<span style={{ color: "red" }}>QQ群、微信群</span>
          等平台赢取精美大奖吧！！！
        </p>
      </Modal>
      <ProCard split="vertical">
        <ProCard colSpan={"50%"}>
          <Card hoverable>
            <Row
              style={{
                textAlign: "center",
              }}
            >
              <Col span={24}>
                <Avatar
                  size={60}
                  style={{
                    backgroundColor: "rgb(243, 196, 41)",
                    fontSize: 35,
                  }}
                >
                  {props.username[0]}
                </Avatar>
              </Col>
            </Row>
            <Row
              style={{
                textAlign: "center",
              }}
            >
              <Col span={24}>
                <div
                  style={{
                    textAlign: "center",
                  }}
                >
                  <h2>
                    {props.username} <Divider type="vertical" />
                    <Tag color={mapLevel2Zh[props.level]["color"]}>
                      {mapLevel2Zh[props.level]["name"]}
                    </Tag>
                  </h2>
                  <span style={{ color: "#999999" }}>790772462@qq.com</span>
                </div>
              </Col>
            </Row>
            <Divider />
            <Row>
              <Col span={8}>
                经验: <Progress size="small" percent={props.exp} type="circle" />
              </Col>
              <Col span={8}>
                点数: <Progress size="small" percent={props.points} type="circle" />
              </Col>
              <Col>
                信用分:{" "}
                <Progress
                  size="small"
                  percent={props.credits}
                  type="circle"
                  format={(percent) => `${percent}分`}
                  strokeColor={
                    props.credits < 70 ? "red" : props.credits > 90 ? "rgb(33, 198, 39)" : "orange"
                  }
                />
              </Col>
            </Row>
            <Divider />
            <h3>偏好标签</h3>
            <Form
              onFinish={(values) => {
                props.setLoading(true);
                update_prefer(values.prefer);
              }}
            >
              <Row>
                <Col span={20}>
                  <Form.Item name="prefer">
                    <Select
                      mode="multiple"
                      allowClear
                      options={preferTag}
                      defaultValue={props.label_type}
                    />
                  </Form.Item>
                </Col>
                <Col span={2}>
                  <Button type="primary" htmlType="submit">
                    更新
                  </Button>
                </Col>
              </Row>
            </Form>
            <Divider />
            <Row>
              <Col span={18}>
                <b>
                  邀请码: <span id="invitecode">{props.invitecode}</span>
                </b>
              </Col>
              <Col span={2}>
                <Tooltip title="什么是邀请码">
                  <Button
                    type="text"
                    size="small"
                    onClick={() => {
                      setIsInviteModalOpen(true);
                    }}
                    icon={<HelpOutline />}
                  />
                </Tooltip>
              </Col>
              <Col>
                <Tooltip title="点击此处复制邀请码">
                  <Button
                    type="text"
                    size="small"
                    onClick={() => {
                      const invitecode = document.getElementById("invitecode");
                      const clipboardObj = navigator.clipboard;
                      clipboardObj
                        .writeText(invitecode ? invitecode.innerText : "")
                        .then(() => {
                          message.success("复制成功");
                        })
                        .catch(() => {
                          message.error("复制失败，请稍后重试");
                        });
                    }}
                    icon={<ContentCopyIcon />}
                  />
                </Tooltip>
              </Col>
            </Row>
          </Card>
        </ProCard>
        <ProCard title="积分排行榜"></ProCard>
      </ProCard>
    </>
  );
};

export default UserInfo;
