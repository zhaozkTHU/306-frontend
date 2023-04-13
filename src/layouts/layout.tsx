import React, { useState } from "react";
import { useRouter } from "next/router";
import {
  QuestionCircleOutlined,
  PlusOutlined,
  UserOutlined,
  CarryOutOutlined,
  SettingOutlined,
  MonitorOutlined,
  OrderedListOutlined,
  EditOutlined,
  TeamOutlined,
  ReconciliationOutlined,
  PushpinOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Layout, Menu, theme, Result, Button } from "antd";

const { Header, Content, Sider } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[]
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

const demanderItems: MenuItem[] = [
  getItem("所有任务", "all_task", <OrderedListOutlined />),
  getItem("新建任务", "new_task", <PlusOutlined />),
  getItem("标注中", "labeling", <MonitorOutlined />),
  getItem("待审核", "checking", <QuestionCircleOutlined />),
  getItem("已完成", "completed", <CarryOutOutlined />),
  getItem("用户信息", "info", <UserOutlined />),
  getItem("设置", "settings", <SettingOutlined />),
];

const labelerItems: MenuItem[] = [
  getItem("全部任务", "all_task", <OrderedListOutlined />),
  getItem("新任务", "new_task", <EditOutlined />),
  getItem("标注中", "labeling", <MonitorOutlined />),
  getItem("审核中", "checking", <QuestionCircleOutlined />),
  getItem("已完成", "completed", <CarryOutOutlined />),
  getItem("用户信息", "info", <UserOutlined />),
  getItem("设置", "settings", <SettingOutlined />),
];

const administratorItems: MenuItem[] = [
  getItem("审核需求方权限", "check_demander", <TeamOutlined />),
  getItem("审核发布任务", "check_task", <QuestionCircleOutlined />),
  getItem("需求方账号管理", "demander_account", <ReconciliationOutlined />),
  getItem("标注方账号管理", "labeler_account", <PushpinOutlined />),
  getItem("个人信息", "info", <UserOutlined />),
  getItem("设置", "settings", <SettingOutlined />),
];

const agentItems: MenuItem[] = [];

const mapRole2Menu = {
  demander: demanderItems,
  labeler: labelerItems,
  administrator: administratorItems,
  agent: agentItems,
};

export interface DemanderLayoutProps {
  children: any;
  role: string | null;
}

const MyLayout = (props: DemanderLayoutProps) => {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [recollapsed, setRecollapsed] = useState(false);
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  if (
    props.role !== "demander" &&
    props.role !== "labeler" &&
    props.role !== "administrator" &&
    props.role !== "agent"
  ) {
    return (
      <Result
        status="error"
        title={props.role ? "未知错误，请重新登录再试" : "尚未登录"}
        extra={[
          <Button
            onClick={() => {
              router.push("/");
            }}
            key="jumpToLogin"
          >
            跳转到登录界面
          </Button>,
        ]}
      />
    );
  }
  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* 
        Sider that take up the room so that the Content
        can collapse or not with Sider
      */}
      <Sider
        collapsible
        collapsed={recollapsed}
        onCollapse={(value) => {
          setCollapsed(value);
          setRecollapsed(value);
        }}
      ></Sider>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => {
          setCollapsed(value);
          setRecollapsed(value);
        }}
        style={{
          overflow: "auto",
          position: "fixed",
          height: "100vh",
        }}
      >
        <div
          style={{
            height: 32,
            margin: 16,
            background: "rgba(255, 255, 255, 0.2)",
          }}
        />
        <Menu
          style={{
            overflow: "auto",
          }}
          theme="dark"
          defaultSelectedKeys={["info"]}
          mode="inline"
          items={mapRole2Menu[props.role]}
          onSelect={(e) => {
            router.push(`/${props.role}/${e.key}`);
          }}
        />
      </Sider>
      <Layout className="site-layout">
        <Header style={{ padding: 0, background: colorBgContainer }}></Header>
        <Content style={{ margin: "0 16px" }}>
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

export default MyLayout;
