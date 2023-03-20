import React, { useState } from 'react';
import {
    QuestionCircleOutlined,
    PlusOutlined,
    UserOutlined,
    CarryOutOutlined,
    SettingOutlined,
    MonitorOutlined,
    OrderedListOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Layout, Menu, theme } from 'antd';
import DemanderContent from '../../components/DemanderContent'

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
    getItem('所有任务', '1', <OrderedListOutlined />),
    getItem('新建任务', '2', <PlusOutlined />),
    getItem('标注中', '3', <MonitorOutlined />),
    getItem('待审核', '4', <QuestionCircleOutlined />),
    getItem('已完成', '5', <CarryOutOutlined />),
    getItem('用户信息', '6', <UserOutlined />),
    getItem('设置', '7', <SettingOutlined />)
];

const App: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [item, setItem] = useState("1")
    const {
        token: { colorBgContainer },
    } = theme.useToken();

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
                <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)' }} />
                <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline" items={items}
                onSelect={(e) =>{
                    setItem(e.key)
                }}
                />
            </Sider>
            <Layout className="site-layout">
                <Header style={{ padding: 0, background: colorBgContainer }} />
                <Content style={{ margin: '0 16px' }}>
                    <DemanderContent index={item} />
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