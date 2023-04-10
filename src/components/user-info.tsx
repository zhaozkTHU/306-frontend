import { Avatar } from "antd";

export interface UserInfoProps {
  username: string;
  invitecode: string;
  level: string;
  exp: number;
  points: number;
}

const UserInfo = (props: UserInfoProps) => {
  return (
    <>
      <p>
        头像: <Avatar size={"large"}>{props.username[0]}</Avatar>
      </p>
      <p>用户名: {props.username}</p>
      <p>等级: {props.level}</p>
      <p>经验: {props.exp}</p>
      <p>点数: {props.points}</p>
    </>
  );
};

export default UserInfo;