import React, { useState } from "react";
import { useRouter } from "next/router";
import {
  QuestionCircleOutlined,
  PlusOutlined,
  UserOutlined,
  CarryOutOutlined,
  MonitorOutlined,
  OrderedListOutlined,
  EditOutlined,
  TeamOutlined,
  ReconciliationOutlined,
  HighlightOutlined,
  ExclamationCircleOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  BellFilled
} from "@ant-design/icons";
import { Col, MenuProps, Row } from "antd";
import { Layout, Menu as AntMenu, theme, Result, Button, Avatar } from "antd";
import Image from "next/image";
import Menu from '@mui/material/Menu';
import { MenuItem } from "@mui/material";
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import Logout from '@mui/icons-material/Logout';


const { Header, Content, Sider, Footer } = Layout;

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
  getItem("所有任务", "/demander/all_task", <OrderedListOutlined />),
  getItem("新建任务", "/demander/new_task", <PlusOutlined />),
  getItem("标注中", "/demander/labeling", <MonitorOutlined />),
  getItem("待审核", "/demander/checking", <QuestionCircleOutlined />),
  getItem("已完成", "/demander/completed", <CarryOutOutlined />),
  getItem("管理员审核", "/demander/adminchecking", <HighlightOutlined />),
  getItem("用户信息", "/demander/info", <UserOutlined />),
];

const labelerItems: MenuItem[] = [
  getItem("全部任务", "/labeler/all_task", <OrderedListOutlined />),
  getItem("新任务", "/labeler/new_task", <EditOutlined />),
  getItem("标注中", "/labeler/labeling", <MonitorOutlined />),
  getItem("审核中", "/labeler/checking", <QuestionCircleOutlined />),
  getItem("已完成", "/labeler/completed", <CarryOutOutlined />),
  getItem("用户信息", "/labeler/info", <UserOutlined />),
];

const administratorItems: MenuItem[] = [
  getItem("审核需求方权限", "/administrator/check_demander", <TeamOutlined />),
  getItem("审核发布任务", "/administrator/check_task", <QuestionCircleOutlined />),
  getItem("用户账号管理", "/administrator/account", <ReconciliationOutlined />),
  getItem("举报管理", "/administrator/report", <ExclamationCircleOutlined />),
  getItem("个人信息", "/administrator/info", <UserOutlined />),
];

const agentItems: MenuItem[] = [];

const mapRole2Menu = {
  demander: demanderItems,
  labeler: labelerItems,
  administrator: administratorItems,
  agent: agentItems,
};

export interface MyLayoutProps {
  children: any;
  role: string | null;
}

const MyLayout = (props: MyLayoutProps) => {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [pageHead, setPageHead] = useState<string>("用户信息");
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
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
        collapsed={collapsed}
        style={{
          height: "100%",
          zIndex: 9,
        }}
        theme="light"
        collapsedWidth="0"
      />
      <Sider
        collapsed={collapsed}
        style={{
          overflow: "auto",
          position: "fixed",
          height: "100%",
          boxShadow: "3px 3px 10px #00000038",
          zIndex: 10,
        }}
        theme="light"
        collapsedWidth="0"
      >
        <div
          style={{
            height: 70,
            background: "rgba(255, 255, 255, 0.2)",
          }}
        >
          <Image src={"/logo/logo.png"} width="200" alt={"logo加载失败"} height="80" />
        </div>
        <div style={{ height: "2%" }} />
        <AntMenu
          style={{
            border: "none",
          }}
          theme="light"
          defaultSelectedKeys={[router.pathname]}
          mode="inline"
          items={mapRole2Menu[props.role]}
          onSelect={(e) => {
            router.push(`${e.key}`);
          }}
        />
      </Sider>
      <Layout className="site-layout">
        <Header
          style={{
            padding: 0,
            background: "#3b5999",
            height: "80px",
            width: "100%",
            // position: "fixed",
            position: "sticky",
            top: 0,
            zIndex: 3,
            boxShadow: "3px 3px 5px #00000038",
          }}
        >
          <Row>
            <Col span={8}>
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => {
                  setCollapsed((i) => !i);
                }}
                style={{
                  fontSize: "25px",
                  width: 80,
                  height: 80,
                  color: "white",
                }}
              />
            </Col>
            <Col span={12}>

            </Col>
            <Col span={2}>
              <Button
                type="text"
                icon={<BellFilled />}
                style={{
                  fontSize: "20px",
                  width: 80,
                  height: 80,
                  color: "white",
                }}
              />
            </Col>
            <Col span={2}>
              <Button
                type="text"
                onClick={(event) => {
                  setAnchorEl(event.currentTarget)
                }}
                style={{
                  fontSize: "25px",
                  width: 80,
                  height: 80,
                }}
                size="large"
                aria-controls={open ? 'account-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
              >
                <Avatar
                  size='large'
                  style={{
                    backgroundColor: 'rgb(33, 204, 73)'
                  }}
                  shape="square"
                >用户</Avatar>
              </Button>
              <Menu open={open}
                anchorEl={anchorEl}
                id="account-menu"
                onClose={() => {
                  setAnchorEl(null)
                }}
                onClick={() => {
                  setAnchorEl(null)
                }}
                transformOrigin={{ horizontal: 'left', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
                PaperProps={{
                  elevation: 0,
                  sx: {
                    overflow: 'visible',
                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                    mt: 1.5,
                    '& .MuiAvatar-root': {
                      width: 32,
                      height: 32,
                      ml: -0.5,
                      mr: 1,
                    },
                    '&:before': {
                      content: '""',
                      display: 'block',
                      position: 'absolute',
                      top: 0,
                      right: 14,
                      width: 10,
                      height: 10,
                      bgcolor: 'background.paper',
                      transform: 'translateY(-50%) rotate(45deg)',
                      zIndex: 0,
                    },
                  },
                }}
              >
                <MenuItem onClick={() => {
                  localStorage.clear();
                  router.push("/");
                }}>
                  <Logout />
                  退出登录
                </MenuItem>
                <MenuItem onClick={() => {
                  router.push(`/${props.role}/info`)
                }}>
                  <PersonOutlineOutlinedIcon />
                  查看信息
                </MenuItem>
              </Menu>
            </Col>
          </Row>
        </Header>
        <Content
          style={{
            backgroundColor: "#ffffff",
          }}
        >
          <div
            style={{
              padding: "16px",
              borderRadius: "10px",
            }}
          >
            {props.children}
          </div>
          {/* <Breadcrumb style={{ margin: '16px 0' }}>
                        <Breadcrumb.Item>User</Breadcrumb.Item>
                        <Breadcrumb.Item>Bill</Breadcrumb.Item>
                    </Breadcrumb>
          <div style={{ padding: 24, minHeight: 360, background: colorBgContainer }}>
                        Bill is a cat.
                    </div> */}
        </Content>
        <Footer style={{ textAlign: "center" }}>306众包平台 ©2023 Created by 306 wins</Footer>
      </Layout>
    </Layout>
  );
};

export default MyLayout;
