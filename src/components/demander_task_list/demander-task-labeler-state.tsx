import { Tag } from "antd";
import React from "react";

interface LabelerStateTagProps {
    type: string
}

const LabelerStateTag = (props: LabelerStateTagProps) => {
    if(props.type==="designated") {
        return <Tag color="rgb(160, 227, 109)">已分发</Tag>
    }
    if(props.type==="labeling") {
        return <Tag color="rgb(33, 198, 198)">标注中</Tag>
    }
    if(props.type==="rejected") {
        return <Tag color="rgb(203, 8, 21)">已拒绝</Tag>
    }
    if(props.type==="checking") {
        return <Tag color="rgb(227, 168, 50)">待审核</Tag>
    }
    if(props.type==="completed") {
        return <Tag color="rgb(33, 198, 39)">已完成</Tag>
    }
    if(props.type==="failed") {
        return <Tag color="rgb(252, 61, 14)">不合格</Tag>
    }
    return <p>Error</p>
}

export default LabelerStateTag;