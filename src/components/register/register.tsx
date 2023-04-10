import React, { Dispatch, SetStateAction } from "react";
import { useRouter } from "next/router";
import { Button, Form, Input, message, Select } from "antd";
import { LockOutlined, UserOutlined, LinkOutlined } from "@ant-design/icons";
import { isValid } from "@/utils/valid";
import CryptoJS from "crypto-js";
import axios from "axios";
import { Option } from "antd/lib/mentions";

const onFinishFailed = (errorInfo: any) => {
  console.log("Failed:", errorInfo);
};

interface RegisterProps {
  setUsername: Dispatch<SetStateAction<string>>,
  setModalOpen: Dispatch<SetStateAction<boolean>>
}

const Register = (props: RegisterProps) => {
  const [messageApi, contextHolder] = message.useMessage();
  return (
    <div>
      {contextHolder}
      <Form
        name="basic"
        style={{}}
        initialValues={{ remember: true }}
        onFinish={(values) => {
          const hashPassword = CryptoJS.SHA256(values.password).toString();
          axios
            .post("/api/user/register", {
              username: values.username,
              password: hashPassword,
              invitecode: values.invitecode,
              role: values.role,
            })
            .then((response) => {
              console.log(response.data);
              props.setUsername(values.username);
              messageApi.open({
                type: 'success',
                content: '注册成功',
              });
              props.setModalOpen(false)
            })
            .catch((error) => {
              if (error.response) {
                messageApi.open({
                  type: 'error',
                  content: `注册失败，${error.response.data.message}`,
                });
                console.log(error.response.data.message)
              } else {
                messageApi.open({
                  type: 'error',
                  content: `注册失败，网络错误`,
                });
              }
            });
        }}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <h2 style={{ textAlign: "center" }}>注册一个 306 账号</h2>
        <p>用户名: </p>
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
            prefix={<UserOutlined className="site-form-item-icon" />}
            placeholder="用户名"
          />
        </Form.Item>

        <p>密码: </p>
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

        <p>确认密码: </p>
        <Form.Item
          name="confirmPassword"
          dependencies={["password"]}
          hasFeedback
          rules={[
            { required: true, message: "请再次输入密码" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("两次输入的密码不一致"));
              },
            }),
          ]}
        >
          <Input.Password
            placeholder="确认密码"
            prefix={<LockOutlined className="site-form-item-icon" />}
          />
        </Form.Item>

        <p>选择身份: </p>
        <Form.Item name="role" rules={[{ required: true, message: "身份不能为空" }]}>
          <Select placeholder="选择身份">
            <Option value="demander">需求方</Option>
            <Option value="labeler">标注方</Option>
            <Option value="admin">管理员</Option>
          </Select>
        </Form.Item>
        <p>邀请码(选择管理员必填):</p>
        <Form.Item
          name="invitecode"
          rules={[
            { required: false},
            ({ getFieldValue }) => ({
              validator(_, value) {
                if(value&&isValid(value)) {
                  return Promise.resolve();
                }
                if (!value&&getFieldValue("role")!=="admin") {
                  return Promise.resolve();
                }
                if(value&&!isValid(value)) {
                  return Promise.reject(
                    new Error("用户名只包含字母、数字、下划线且长度不超过50不小于3")
                  );
                }
                if(!value&&getFieldValue("role")==="admin") {
                  return Promise.reject(
                    new Error("注册管理员必须包含邀请码")
                  );
                }
              },
            }),
          ]}
        >
          <Input
            prefix={<LinkOutlined className="site-form-item-icon" />}
            placeholder="邀请码"
          />
        </Form.Item>
        <Button type="primary" htmlType="submit" block>
          注册
        </Button>
      </Form>
    </div>
  )
}

export default Register