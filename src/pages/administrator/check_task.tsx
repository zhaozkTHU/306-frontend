import { message } from "antd";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react"

const AdministratorCheckTask = () => {
  const [refreshing, setRefreshing] = useState<boolean>(true);
  const router = useRouter();
  useEffect(() => {
    if(!router.isReady) {
      return;
    }
    axios.get("/api/undistribute",
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    )
      .then((response) => {
        const newDemanders = response.data.data;
        
      })
      .catch((error) => {
        if (error.response) {
          message.error(`获取需求方权限申请失败，${error.response.data.message}`);
        } else {
          message.error("网络失败，请稍后再试");
        }
      })
      .finally(() => {
        setRefreshing(false);
      })
      ;
  },[router, refreshing])
  return <p>AdministratorCheckTask</p>
}

export default AdministratorCheckTask