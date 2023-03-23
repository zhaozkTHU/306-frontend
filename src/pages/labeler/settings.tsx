import Button from "antd/lib/button"
import { useRouter } from "next/router"
import { UserIdContext } from "../_app"
import { useContext } from "react"
const LabelerSettings = () => {
  const router = useRouter()
  const user_id = useContext(UserIdContext)
  return <Button onClick={
    () => {
      localStorage.clear()
      router.push("/")
    }
  }>
    退出登录{user_id}
  </Button>
}

export default LabelerSettings