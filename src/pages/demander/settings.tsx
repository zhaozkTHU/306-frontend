import { Button } from "antd";
import { useRouter } from "next/router";
const DemanderSettings = () => {
  const router = useRouter();
  return (
    <Button
      onClick={() => {
        localStorage.clear();
        router.push("/");
      }}
    >
      退出登录
    </Button>
  );
};

export default DemanderSettings;
