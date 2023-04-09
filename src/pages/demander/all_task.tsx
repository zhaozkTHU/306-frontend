import axios from "axios";
import { useEffect, useState } from "react";

const DemanderAllTask = () => {
  const [refreshing, setRefreshing] = useState<boolean>(true);
  useEffect(() => {
    setRefreshing(true)
    axios
      .get("/api/task", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      })
      .then((response) => {

      })
      .catch((err) => {
        console.log(err)
      })
    }
    
  )
  return (<p>DemanderAllTask</p>);
};

export default DemanderAllTask;
