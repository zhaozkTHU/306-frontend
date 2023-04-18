import { Tag, Tooltip } from "antd";
import React from "react";

interface DemanderStateTagProps {
    type: string
}

const DemanderStateTag = (props: DemanderStateTagProps) => {
    if(props.type==="labeling") {
        return <Tag color="rgb(33, 198, 198)">标注中</Tag>
    }
    if(props.type==="checking") {
        return <Tag color="rgb(33, 198, 198)">待审核</Tag>
    }
    if(props.type==="completed") {
        return (
            <Tooltip title="当前任务已完成，可以导出数据">
                <Tag color="rgb(33, 198, 39)">已完成</Tag>
            </Tooltip>
        )
    }
    return <p>Error</p>
}

export default DemanderStateTag;