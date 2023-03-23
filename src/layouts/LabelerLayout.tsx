import React, { useState } from 'react';
import { useRouter } from "next/router";
import {
  QuestionCircleOutlined,
  UserOutlined,
  CarryOutOutlined,
  SettingOutlined,
  MonitorOutlined,
  OrderedListOutlined,
  EditOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Layout, Menu, theme, Spin, Result, Button } from 'antd';

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
  getItem('全部任务', 'all_task', <OrderedListOutlined />),
  getItem('新任务', 'new_task', <EditOutlined />),
  getItem('标注中', 'labeling', <MonitorOutlined />),
  getItem('审核中', 'checking', <QuestionCircleOutlined />),
  getItem('已完成', 'completed', <CarryOutOutlined />),
  getItem('用户信息', 'info', <UserOutlined />),
  getItem('设置', 'settings', <SettingOutlined />)
];
interface LabelerDeployprops {
  loginStatus: string
  children: any
  setLoginStatus: any
}

const LabelerDeploy = (props: LabelerDeployprops) => {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  if (props.loginStatus == "waiting") {
    return <Spin size='large' />
  } else if (props.loginStatus != "labelerAlreadyLogin") {
    return <Result
      status="error"
      title="尚未登录"
      extra={[<Button
        onClick={() => {
          router.push("/");
        }}
        key="jumpToLogin"
      >
        跳转到登录界面
      </Button>]}
    />
  }
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)' }} />
        <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline" items={items}
          onSelect={(e) => {
            router.push(`/labeler/${e.key}`)
          }}
        />
      </Sider>
      <Layout className="site-layout">
        <Header style={{ padding: 0, background: colorBgContainer }} />
        <Content style={{ margin: '0 16px' }}>
          {props.children}
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

export default LabelerDeploy;