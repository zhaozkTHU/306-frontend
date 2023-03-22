import React, { useState } from 'react';
import { useRouter } from "next/router";
import { Button, Form, Input, Select, Result } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { isValid } from '@/utils/valid';
import CryptoJS from 'crypto-js'
import axios from 'axios';

const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
};

// register interface
const RegisterScreen = () => {
    const router = useRouter();
    const { Option } = Select;

    return (
        <div style={{ position: "fixed", left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}>
            <h2 style={{ textAlign: "center" }}>注册一个 306 账号</h2>
            <Form
                name="basic"
                style={{ maxWidth: 216 }}
                initialValues={{ remember: true }}
                onFinish={(values) => {
                    // const hashedPassword = bcrypt.hashSync(values.password, 10);
                    const hashPassword = CryptoJS.SHA256(values.password).toString()
                    axios.post('api/user/register', {
                        username: values.username,
                        password: hashPassword,
                        role: values.role
                    })
                        .then((response) => {
                            console.log(response.data);
                            router.push("/register/success")
                        })
                        .catch((error) => {
                            if (error.response) {
                                alert(`注册失败，${error.response.message}`)
                            } else {
                                alert("网络错误，请稍后重试")
                            }
                        })
                }}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
            >
                <p>用户名: </p>
                <Form.Item
                    name="username"
                    rules={[
                        { required: true, message: '用户名不能为空' },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || (isValid(value)&&value.length<=50&&value.length>=3)) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('用户名只包含字母、数字、下划线且长度不超过50不小于3'));
                            },
                        }),
                    ]}
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
                    rules={[
                        { required: true, message: '密码不能为空' },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || (isValid(value)&&value.length<=50&&value.length>=5)) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('密码只包含字母、数字、下划线且长度不超过50不小于5'));
                            },
                        }),
                    ]}

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
                        <Option value="demander">需求方</Option>
                        <Option value="labeler">标注方</Option>
                    </Select>
                </Form.Item>
                <Button type="primary" htmlType="submit" block >
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

export default RegisterScreen;