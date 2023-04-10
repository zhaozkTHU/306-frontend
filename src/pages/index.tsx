import React, { Dispatch, SetStateAction, useRef, useState } from "react";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";
import { Button, Form, Input, Carousel, Divider, Modal } from "antd";
import { isValid } from "@/utils/valid";
import CryptoJS from "crypto-js";
import axios from "axios";
import { ProCard } from "@ant-design/pro-components";
import LoginAd from "@/components/login-ad";
import Register from "@/components/register/register";

const onFinishFailed = (errorInfo: any) => {
  console.log("Failed:", errorInfo);
};

interface LoginScreenPorps {
  setRole: Dispatch<SetStateAction<string | null>>;
}

// login interface
const LoginScreen = (props: LoginScreenPorps) => {
  const router = useRouter();
  const CarouselRef = useRef<any>(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState<boolean>(false);
  const [preUsername, setPreUsername] = useState<string>("")
  return (
    <div
      style={{
        position: "fixed",
        width: "100%",
        height: "100%",
        backgroundSize: "100% 100%",
        backgroundColor: "rgba(199, 192, 234, 0.1)",
      }}
    >
      <Modal
        open={isRegisterModalOpen}
        onOk={() => {
          setIsRegisterModalOpen(false);
        }}
        onCancel={() => {
          setIsRegisterModalOpen(false);
        }}
        footer={null}
      >
        <Register setUsername={setPreUsername} setModalOpen={setIsRegisterModalOpen}/>
      </Modal>
      <h1 style={{ textAlign: "center", marginTop: "5%", color: "rgba(62, 132, 239, 0.953)" }}>
        306众包平台
      </h1>
      <div
        style={{
          zIndex: -1,
          position: "absolute",
          left: "0",
          top: "0",
          bottom: "0",
          right: "0",
          margin: "auto",
          width: "55%",
          height: "60%",
          backgroundColor: "rgba(0, 0, 0, 0)",
        }}
      >
        <ProCard
          style={{
            backgroundColor: "rgba(0, 0, 0, 0)",
            borderRadius: "100%",
            height: "100%",
            width: "100%",
          }}
          split="vertical"
        >
          <ProCard
            colSpan={"60%"}
            style={{
              height: "100%",
              boxSizing: "border-box",
              backgroundColor: "rgba(255, 255, 255, 0.5)",
              borderTopLeftRadius: "4%",
              borderBottomLeftRadius: "4%",
            }}
            hoverable
            bordered
            // hoverable={false}
          >
            <ProCard
              colSpan={"5%"}
              style={{ height: "100%", backgroundColor: "rgba(255, 255, 255, 0)"}}
              onClick={() => {
                CarouselRef.current?.prev?.();
              }}
            >
            </ProCard>
            <ProCard
              colSpan={"90%"}
              style={{ height: "100%", backgroundColor: "rgba(255, 255, 255, 0)" }}
            >
              <LoginAd ref={CarouselRef} />
            </ProCard>
            <ProCard
              colSpan={"5%"}
              style={{ height: "100%", backgroundColor: "rgba(255, 255, 255, 0)" }}
              onClick={() => {
                CarouselRef.current?.next?.();
              }}
            ></ProCard>
          </ProCard>
          <ProCard
            colSpan={"40%"}
            style={{
              backgroundColor: "rgba(129, 193, 233, 0.129)",
              height: "100%",
              borderTopRightRadius: "6%",
              borderBottomRightRadius: "6%",
            }}
            // hoverable={false}
          >
            <Form
              name="basic"
              style={{
                width: "100%",
                backgroundColor: "rgba(255, 255, 255, 0)",
              }}
              initialValues={{ remember: true }}
              onFinish={(values) => {
                const hashPassword = CryptoJS.SHA256(values.password).toString();
                axios
                  .post("api/user/login", {
                    username: values.username,
                    password: hashPassword,
                  })
                  .then((response) => {
                    localStorage.setItem("token", response.data.token);
                    localStorage.setItem("role", response.data.role);
                    props.setRole(response.data.role);
                    router.push(`/${response.data.role}/info`);
                  })
                  .catch((error) => {
                    if (error.response) {
                      alert(`登录失败，${error.response.data.message}`);
                    } else {
                      alert("网络失败，请稍后再试");
                    }
                  });
              }}
              onFinishFailed={onFinishFailed}
              autoComplete="off"
            >
              <h2 style={{ textAlign: "center", color: "rgba(62, 132, 239, 0.99)", margin: "0%" }}>
                登录
              </h2>
              <Divider />
              <p style={{ color: "rgba(62, 132, 239, 0.953)" }}>用户名:</p>
              <Form.Item
                name="username"
                rules={[
                  { required: true, message: "用户名不能为空" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || (isValid(value) && value.length <= 50 && value.length >= 3)) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("用户名只包含字母、数字、下划线且长度不超过50不小于3")
                      );
                    },
                  }),
                ]}
              >
                <Input
                  defaultValue={preUsername}
                  prefix={<UserOutlined className="site-form-item-icon" />}
                  placeholder="用户名"
                />
              </Form.Item>
              <p style={{ color: "rgba(62, 132, 239, 0.953)" }}>密码:</p>
              <Form.Item
                name="password"
                rules={[
                  { required: true, message: "密码不能为空" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || (isValid(value) && value.length <= 50 && value.length >= 5)) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("密码只包含字母、数字、下划线且长度不超过50不小于5")
                      );
                    },
                  }),
                ]}
              >
                <Input.Password
                  placeholder="密码"
                  prefix={<LockOutlined className="site-form-item-icon" />}
                />
              </Form.Item>
              <Button type="primary" htmlType="submit" block>
                登录
              </Button>
              <p style={{ textAlign: "center" }}>还没有306账号?</p>
              <Button
                type="primary"
                htmlType="button"
                block
                onClick={() => setIsRegisterModalOpen(true)}
              >
                注册
              </Button>
            </Form>
          </ProCard>
        </ProCard>
      </div>
    </div>
  );
};

export default LoginScreen;