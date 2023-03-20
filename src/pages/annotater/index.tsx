import React, { useState } from 'react';
import {
    QuestionCircleOutlined,
    UserOutlined,
    CarryOutOutlined,
    SettingOutlined,
    MonitorOutlined,
    OrderedListOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Layout, Menu, theme } from 'antd';
import AnnotaterContent from '@/components/AnnotaterContent';

const { Header, Content, Footer, Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
    label: React.ReactNode,
    key: React.Key,
    icon?: React.ReactNode,
    children?: MenuItem[],
): MenuItem {
    return {
        key,
        icon,
        children,
        label,
    } as MenuItem;
}

const items: MenuItem[] = [
    getItem('新任务', '1', <OrderedListOutlined />),
    getItem('待标注', '2', <MonitorOutlined />),
    getItem('审核中', '3', <QuestionCircleOutlined />),
    getItem('已完成', '4', <CarryOutOutlined />),
    getItem('用户信息', '5', <UserOutlined />),
    getItem('设置', '6', <SettingOutlined />)
];

const App: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [AnnotaterItem, setAnnotaterItem] = useState("1")
    const {
        token: { colorBgContainer },
    } = theme.useToken();

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
                <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)' }} />
                <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline" items={items}
                onSelect={(e) =>{
                    setAnnotaterItem(e.key)
                }}
                 />
            </Sider>
            <Layout className="site-layout">
                <Header style={{ padding: 0, background: colorBgContainer }} />
                <Content style={{ margin: '0 16px' }}>
                    <AnnotaterContent index={AnnotaterItem}/>
                    {/* <Breadcrumb style={{ margin: '16px 0' }}>
                        <Breadcrumb.Item>User</Breadcrumb.Item>
                        <Breadcrumb.Item>Bill</Breadcrumb.Item>
                    </Breadcrumb> */}
                    {/* <div style={{ padding: 24, minHeight: 360, background: colorBgContainer }}>
                        Bill is a cat.
                    </div> */}
                </Content>
                {/* <Footer style={{ textAlign: 'center' }}>Ant Design ©2023 Created by Ant UED</Footer> */}
            </Layout>
        </Layout>
    );
};

export default App;