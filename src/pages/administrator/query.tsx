import { request } from "http"
import { useEffect } from "react"


const AdminQuery = () => {
    useEffect(() => {
        request("/api")
    })
    return <></>
}

export default AdminQuery