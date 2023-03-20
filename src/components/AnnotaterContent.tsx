interface AnnotaterContentProps {
    index: string
}

const AnnotaterContent = (props: AnnotaterContentProps) => {
    
    switch(props.index) {
        case "1": return(<p>新任务</p>);
        case "2": return(<p>待标注</p>);
        case "3": return(<p>审核中</p>);
        case "4": return(<p>已完成</p>);
        case "5": return(<p>用户信息</p>);
        case "6": return(<p>设置</p>);
    }
    return <p>Error</p>
}


export default AnnotaterContent;