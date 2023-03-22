import { Result, Button } from "antd";
import Router, { useRouter } from "next/router";

const NotFound = () => {
    const router = useRouter()
    return <Result
         status='404'
         title='没有您要找的页面'
         extra={[<Button
            onClick={() => {
                router.push("/");
            }}
        >
            跳转到登录界面
        </Button>]}
    />
}

export default NotFound