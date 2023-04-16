import { Progress, Space } from "antd";
import { useEffect, useState } from "react";

const LabelerInfo = () => {
  const [exp, setExp] = useState(0);

  useEffect(() => {
    setExp(0);
  }, []);

  return (
    <Space>
      <Progress
        percent={exp - 100 * Math.floor(exp / 100)}
        format={() => `${Math.floor(exp / 100)}级`}
        type="circle"
      />
    </Space>
  );
};

export default LabelerInfo;
