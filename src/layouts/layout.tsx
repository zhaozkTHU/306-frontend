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
  BellFilled,
  ClockCircleOutlined,
  PartitionOutlined,
  SearchOutlined
} from "@ant-design/icons";
import { Col, MenuProps, Modal, Row, Spin } from "antd";
import { Layout, Menu as AntMenu, theme, Result, Button, Avatar, Image } from "antd";
import Menu from "@mui/material/Menu";
import { MenuItem } from "@mui/material";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import Logout from "@mui/icons-material/Logout";
import { mapRole2En } from "@/const/interface";
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import MemberComponent from "@/components/user_vip";
import CameraButton from "@/components/CameraVideo";

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
  getItem("中介列表", "/demander/agent_list", <TeamOutlined />),
  getItem("待管理员审核", "/demander/admin_checking", <HighlightOutlined />),
  getItem("分发中", "/demander/distributing", <PartitionOutlined />),
  getItem("标注中", "/demander/labeling", <MonitorOutlined />),
  getItem("待审核", "/demander/checking", <QuestionCircleOutlined />),
  getItem("已完成", "/demander/completed", <CarryOutOutlined />),
  getItem("已过期", "/demander/overdue", <ClockCircleOutlined />),
  getItem("用户信息", "/demander/info", <UserOutlined />),
];

const labelerItems: MenuItem[] = [
  getItem("我的任务", "/labeler/my_task", <EditOutlined />),
  getItem("审核中", "/labeler/checking", <QuestionCircleOutlined />),
  getItem("审核未通过", "/labeler/failed", <ExclamationCircleOutlined />),
  getItem("已完成", "/labeler/completed", <CarryOutOutlined />),
  getItem("已过期", "/labeler/overdue", <ClockCircleOutlined />),
  getItem("用户信息", "/labeler/info", <UserOutlined />),
];

const administratorItems: MenuItem[] = [
  getItem("审核需求方权限", "/administrator/check_demander", <TeamOutlined />),
  getItem("审核发布任务", "/administrator/check_task", <QuestionCircleOutlined />),
  getItem("用户账号管理", "/administrator/account", <ReconciliationOutlined />),
  getItem("任务与标注查询", "/administrator/query", <SearchOutlined />),
  getItem("举报管理", "/administrator/report", <ExclamationCircleOutlined />),
  getItem("个人信息", "/administrator/info", <UserOutlined />),
];

const agentItems: MenuItem[] = [
  getItem("可配发任务", "/agent/available_task", <MonitorOutlined />),
  getItem("可配发标注者", "/agent/available_labeler", <TeamOutlined />),
  getItem("已配发任务", "/agent/distributed_task", <CarryOutOutlined />),
  getItem("个人信息", "/agent/info", <UserOutlined />),
];

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
  const [faceModal, setFaceModal] = useState<boolean>(false);
  const [faceModalLoading, setFaceModalLoading] = useState<boolean>(false);
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
    <Spin spinning={!router.isReady}>
      <Layout style={{ minHeight: "100vh" }}>
        {/* 
        Sider that take up the room so that the Content
        can collapse or not with Sider
      */}
        <Sider
          collapsed={collapsed}
          style={{
            height: "100vh",
            zIndex: 9,
          }}
          theme="light"
          width={"17%"}
        />
        <Sider
          collapsed={collapsed}
          style={{
            overflow: "auto",
            position: "fixed",
            height: "100vh",
            boxShadow: "3px 3px 10px #00000038",
            zIndex: 10,
          }}
          width={"17%"}
          theme="light"
        // collapsedWidth="0"
        >
          <div
            style={{
              height: 70,
              background: "rgba(255, 255, 255, 0.2)",
              marginTop: "5px",
            }}
          >
            <img src={"/logo/logo.png"} alt={"logo加载失败"} width={"100%"} height={"auto"} />
          </div>
          <div style={{ height: "5%" }} />

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
        <Layout className="site-layout" style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh"
        }}>
          <Header
            style={{
              padding: 0,
              background: "#3b5999",
              height: "12vh",
              minHeight: "64px",
              width: "100%",
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
                    height: "12vh",
                    color: "white",
                  }}
                />
              </Col>
              <Col span={12}></Col>
              <Col span={2}>
                <MemberComponent/>
              </Col>
              <Col span={2}>
                <Button
                  type="text"
                  onClick={(event) => {
                    setAnchorEl(event.currentTarget);
                  }}
                  style={{
                    fontSize: "25px",
                    height: "12vh",
                  }}
                  size="large"
                  aria-controls={open ? "account-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? "true" : undefined}
                >
                  <Avatar
                    size="large"
                    style={{
                      backgroundColor: "rgb(33, 204, 73)",
                    }}
                    shape="square"
                  >
                    {mapRole2En[props.role]}
                  </Avatar>
                </Button>
                <Menu
                  open={open}
                  anchorEl={anchorEl}
                  id="account-menu"
                  onClose={() => {
                    setAnchorEl(null);
                  }}
                  onClick={() => {
                    setAnchorEl(null);
                  }}
                  transformOrigin={{ horizontal: "left", vertical: "top" }}
                  anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
                  PaperProps={{
                    elevation: 0,
                    sx: {
                      overflow: "visible",
                      filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                      mt: 1.5,
                      "& .MuiAvatar-root": {
                        width: 32,
                        height: 32,
                        ml: -0.5,
                        mr: 1,
                      },
                      "&:before": {
                        content: '""',
                        display: "block",
                        position: "absolute",
                        top: 0,
                        right: 14,
                        width: 10,
                        height: 10,
                        bgcolor: "background.paper",
                        transform: "translateY(-50%) rotate(45deg)",
                        zIndex: 0,
                      },
                    },
                  }}
                >
                  <MenuItem
                    onClick={() => {
                      localStorage.removeItem("token");
                      localStorage.removeItem("role")
                      router.push("/");
                    }}
                  >
                    <Logout />
                    退出登录
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      router.push(`/${props.role}/info`);
                    }}
                  >
                    <PersonOutlineOutlinedIcon />
                    查看信息
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setFaceModal(true);
                    }}
                  >
                    <SentimentSatisfiedAltIcon />
                    上传人脸
                  </MenuItem>
                </Menu>
              </Col>
            </Row>
          </Header>
          <Content
            style={{
              backgroundColor: "#ffffff",
              flex: 1,
            }}
          >
            <div
              style={{
                padding: "20px",
                borderRadius: "10px",
                position: "relative",
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
          <Modal open={faceModal} onCancel={() => setFaceModal(false)} footer={null}>
            <Spin spinning={faceModalLoading}>
              <CameraButton
                fileName="face.jpg"
                onFinish={(faceImg) => {
                  // setFaceModalLoading(true);
                  // alert("vrf")
                  //   .then(() => setFaceModal(false))
                  //   .finally(() => setFaceModalLoading(false));
                }}
              />
            </Spin>
          </Modal>
          <Footer style={{ textAlign: "center", height: "8vh" }}>306众包平台 ©2023 Created by 306 wins</Footer>
        </Layout>
      </Layout>
    </Spin>
  );
};

export default MyLayout;
