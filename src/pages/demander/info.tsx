import UserInfo, { UserInfoProps } from "@/components/user-info";
import axios from "axios";
import { useEffect, useState } from "react";

const DemanderInfo = () => {
  const [refreshing, setRefreshing] = useState<boolean>(true);
  const [username, setUsername] = useState<string>("");
  const [invitecode, setInvitecode] = useState<string>("");
  const [level, setLevel] = useState<string>("");
  const [exp, setExp] = useState<number>(0);
  const [points, setPoints] = useState<number>(0);
  useEffect(() => {
    setRefreshing(true);
    axios
      .get("/api/account_info", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        setUsername(response.data.username);
        setInvitecode(response.data.invitecode);
        setLevel(response.data.level);
        setExp(response.data.exp);
        setPoints(response.data.points);
      })
      .catch((err) => {
        console.log(err);
      });
    setRefreshing(false);
  });
  return refreshing ? (
    <p>loading</p>
  ) : (
    <div>
      <UserInfo
        username={username}
        invitecode={invitecode}
        level={level}
        exp={exp}
        points={points}
      />
    </div>
  );
};

export default DemanderInfo;
