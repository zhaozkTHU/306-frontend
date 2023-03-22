import { useRouter } from "next/router";
import { Result, Button } from "antd";

// jump to this interface when register successfully
const RegisterSuccess = () => {
    const router = useRouter();
    return (
        <Result
            status="success"
            title="注册成功"
            extra={[
                <Button
                    onClick={() => {
                        router.push("/");
                    }}
                >
                    跳转到登录界面
                </Button>,
                <Button
                    onClick={() => {
                        router.push("/register")
                    }}
                >
                    返回注册界面
                </Button>
            ]}
        />
    )
}

export default RegisterSuccess;