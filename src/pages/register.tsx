import React from 'react';
import { useRouter } from "next/router";
import { Button, Form, Input, Select } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';

const onFinish = (values: any) => {
    console.log('Success:', values);
};

const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
};

const LoginScreen = () => {
    const router = useRouter();
    const { Option } = Select;
    return (
        <div style={{ position: "fixed", left: "50%", top: "10%", transform: "translate(-50%)" }}>
            <h2 style={{ textAlign: "center" }}>注册一个 306 账号</h2>
            <Form
                name="basic"
                style={{ maxWidth: 400 }}
                initialValues={{ remember: true }}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
            >
                <p>用户名: </p>
                <Form.Item
                    name="username"
                    rules={[{ required: true, message: '用户名不能为空' }]}
                >
                    <Input
                        prefix={<UserOutlined className="site-form-item-icon" />}
                        placeholder='用户名'
                        // style={{width:"400px"}}
                    />
                </Form.Item>


                <p>密码: </p>
                <Form.Item
                    name="password"
                    rules={[{ required: true, message: '密码不能为空' }]}
                >
                    <Input.Password
                        placeholder='密码'
                        prefix={<LockOutlined className="site-form-item-icon" />}
                    />
                </Form.Item>

                <p>确认密码: </p>
                <Form.Item
                    name="confirmPassword"
                    dependencies={['password']}
                    hasFeedback
                    rules={[
                        { required: true, message: '请再次输入密码' },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('password') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('两次输入的密码不一致'));
                            },
                        }),
                    ]}
                >
                    <Input.Password
                        placeholder='确认密码'
                        prefix={<LockOutlined className="site-form-item-icon" />}
                    />
                </Form.Item>

                <p>选择身份: </p>
                <Form.Item
                    name="role"
                    rules={[{ required: true, message: '身份不能为空' }]}
                >
                    <Select placeholder="选择身份">
                        <Option value="male">需求方</Option>
                        <Option value="female">标注方</Option>
                    </Select>
                </Form.Item>

                <Button type="primary" htmlType="submit" block onClick={() => {
                    alert("注册功能尚在开发中！")
                }}>
                    注册
                </Button>
                <p style={{ textAlign: "center" }}>已经有账号?</p>
                <Button type="primary" htmlType="button" block onClick={() => router.push("/")}>
                    登录
                </Button>
            </Form>
        </div>
    )
};

export default LoginScreen;