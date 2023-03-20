interface DemanderContentProps {
    index: string
}

const DemanderContent = (props: DemanderContentProps) => {
    
    switch(props.index) {
        case "1": return(<p>所有任务</p>);
        case "2": return(<p>新建任务</p>);
        case "3": return(<p>标注中</p>);
        case "4": return(<p>待审核</p>);
        case "5": return(<p>已完成</p>);
        case "6": return(<p>用户信息</p>);
        case "7": return(<p>设置</p>);
    }
    return <p>Error</p>
}


export default DemanderContent;