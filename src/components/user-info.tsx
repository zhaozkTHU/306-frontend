import { Avatar, Descriptions, Progress, Spin } from "antd";
import Icon, { UserOutlined } from "@ant-design/icons";

export interface UserInfoProps {
  username: string;
  invitecode: string;
  level: string;
  exp: number;
  points: number;
}

const MedalSvg = (color: string) => {
  const svg = () => (
    <svg
      viewBox="0 0 1024 1024"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      p-id="2655"
      width="50"
      height="50"
      fill={color}
    >
      <path
        d="M447.5 261.5L309.24 31.08A63.994 63.994 0 0 0 254.36 0H32.06C6.16 0-9 29.14 5.84 50.36l222.54 317.92c59.44-55.54 135.04-93.66 219.12-106.78zM991.94 0H769.64c-22.48 0-43.32 11.8-54.88 31.08l-138.26 230.42c84.08 13.12 159.68 51.24 219.12 106.76L1018.16 50.36C1033 29.14 1017.84 0 991.94 0zM512 320c-194.4 0-352 157.6-352 352s157.6 352 352 352 352-157.6 352-352-157.6-352-352-352z m185.04 314.52l-75.86 73.92 17.94 104.44c3.2 18.72-16.52 33.02-33.3 24.18L512 787.76l-93.8 49.3c-16.8 8.9-36.5-5.48-33.3-24.18l17.94-104.44-75.86-73.92c-13.64-13.28-6.1-36.46 12.7-39.18l104.86-15.28 46.86-95.04c4.22-8.56 12.38-12.78 20.56-12.78 8.22 0 16.44 4.28 20.66 12.78l46.86 95.04 104.86 15.28c18.8 2.72 26.34 25.9 12.7 39.18z"
        p-id="2656"
      />
    </svg>
  );
  return svg;
};

const ModalIcon = (level: string) => {
  switch (level) {
    case "bronze":
      return (
        <Icon
          component={MedalSvg("brown")}
          style={{ color: "brown", fontSize: "10px" }}
          color="brown"
        />
      );
    default:
      return <Spin />;
  }
};

const UserInfo = (props: UserInfoProps) => {
  return (
    <>
      <Descriptions title="用户信息" bordered>
        <Descriptions.Item label="头像">
          <Avatar size="large" icon={<UserOutlined />} />
        </Descriptions.Item>
        <Descriptions.Item label="经验">
          <Progress size="small" percent={props.exp} type="circle" />
        </Descriptions.Item>
        <Descriptions.Item label="等级">{ModalIcon(props.level)}</Descriptions.Item>
        <Descriptions.Item label="用户名">{props.username}</Descriptions.Item>
        <Descriptions.Item label="点数">{props.points}</Descriptions.Item>
      </Descriptions>
    </>
  );
};

export default UserInfo;
