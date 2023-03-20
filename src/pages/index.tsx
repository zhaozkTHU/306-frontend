import React from 'react';
import { useState } from "react";
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useRouter } from "next/router";
import { Button, Form, Input } from 'antd';

const onFinish = (values: any) => {
    console.log('Success:', values);
};

const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
};

const LoginScreen = () => {
    const router = useRouter();
    return (
        <div style={{position:"fixed", left:"50%", top: "10%", transform: "translate(-50%)"}}>
            <h2 style={{textAlign: "center"}}>登录 306</h2>
            <Form
                name="basic"
                style={{ maxWidth: 400}}
                initialValues={{ remember: true }}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
            >
                <p>用户名:</p>
                <Form.Item
                    name="username"
                    rules={[{ required: true, message: '用户名不能为空' }]}
                >
                    <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder='用户名' />
                </Form.Item>
                <p>密码:</p>
                <Form.Item
                    name="password"
                    rules={[{ required: true, message: '密码不能为空' }]}
                >
                    <Input.Password placeholder='密码' prefix={<LockOutlined className="site-form-item-icon" />}/>
                </Form.Item>
                <Button type="primary" htmlType="submit" block onClick={() => {
                    alert("登录功能尚在开发中！")
                }}>
                    登录
                </Button>
                <p style={{textAlign: "center"}}>还没有306账号?</p>
                <Button type="primary" htmlType="button" block onClick={() => router.push("/register")}>
                注册
                </Button>
            </Form>

        </div>
    )
};

export default LoginScreen;