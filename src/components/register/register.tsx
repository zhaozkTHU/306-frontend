import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import Select from '@mui/material/Select';
import CryptoJS from "crypto-js";
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { Carousel, Divider, Form, Button, Input, message, Spin } from "antd";

import { isValid } from "@/utils/valid";
import axios from "axios";

const onFinishFailed = (errorInfo: any) => {
  console.log("Failed:", errorInfo);
};

interface RegisterProps {
  setModalOpen: Dispatch<SetStateAction<boolean>>;
}

const Register = (props: RegisterProps) => {
  const [email, setEamil] = useState<string>("");
  const [refrshing, setRefreshing] = useState<boolean>(false);
  const [isVerifyDisabled, setIsVerifyDisabled] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const CarouselRef = useRef<any>(null);
  useEffect(() => {
    if(!isVerifyDisabled) {
      return;
    }
    if(timeLeft==0) {
      setIsVerifyDisabled(false)
    }
    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);
    return () => clearTimeout(timer);
  },[isVerifyDisabled, timeLeft])
  const { Search } = Input;
  const register = async (values: any) => {
    setEamil(values.email)
    axios
      .post("/api/user/register", {
        username: values.username,
        password: values.hashPassword,
        invitecode: values.invitecode,
        role: values.role,
        email: values.email,
      })
      .then((response) => {
        console.log(response.data);
        message.success("注册成功");
        CarouselRef.current?.next?.();
      })
      .catch((error) => {
        if (error.response) {
          message.error(`注册失败，${error.response.data.message}`);
          console.log(error.response.data.message);
        } else {
          message.error(`注册失败，网络错误`);
        }
      })
      .finally(() => {
        setRefreshing(false)
      })
      ;
  };

  const getVeriCode = async (_email: string) => {
    axios.post("/api/captcha", {
      email: _email
    })
    .then(() => {
      message.success("验证码已发送到邮箱")
      setTimeLeft(60);
      setIsVerifyDisabled(true);
    })
    .catch((error) => {
      if (error.response) {
        message.error(`发送失败，${error.response.data.message}`);
        console.log(error.response.data.message);
      } else {
        message.error(`发送失败，网络错误`);
      }
    })
    .finally(() => {
      setRefreshing(false)
    })
  }

  const postVeriCode = async (_email: string, _vericode: number) => {
    axios.post("/api/verify", {
      email: _email,
      captcha: _vericode
    })
    .then(() => {
      message.success("验证成功")
      props.setModalOpen(false)
    })
    .catch((error) => {
      if (error.response) {
        message.error(`验证失败，${error.response.data.message}`);
        console.log(error.response.data.message);
      } else {
        message.error(`验证失败，网络错误`);
      }
    })
    .finally(() => {
      setRefreshing(false)
    })
  }

  return (
    <Spin spinning={refrshing}>
    <Container component="main" maxWidth="xs">
      <Carousel ref={CarouselRef} dots={false}>
        <div>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography component="h1" variant="h5">
              注册
            </Typography>
            <Divider></Divider>
            <Form
              name="basic"
              initialValues={{ remember: true }}
              onFinish={(values) => {
                setRefreshing(true);
                const hashPassword = CryptoJS.SHA256(values.password).toString();
                register({
                  username: values.username,
                  hashPassword: hashPassword,
                  role: values.role,
                  email: values.email,
                  invitecode: values.invitecode
                });
              }}
              onFinishFailed={onFinishFailed}
              autoComplete="off"
            >
              <Grid container spacing={2}>
                <Grid item xs={24} sm={12}>
                  <Form.Item
                    name="username"
                    rules={[
                      { required: true, message: "用户名不能为空" },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || (isValid(value, true) && value.length <= 50 && value.length >= 3)) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error("用户名只包含字母、数字、下划线且长度不超过50不小于3")
                          );
                        },
                      }),
                    ]}
                  >
                    <TextField
                      name="username"
                      fullWidth
                      id="username"
                      label="用户名"
                      autoFocus
                    />
                  </Form.Item>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Form.Item
                    name="password"
                    rules={[
                      { required: true, message: "密码不能为空" },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || (isValid(value, true) && value.length <= 50 && value.length >= 5)) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error("密码只包含字母、数字、下划线且长度不超过50不小于5")
                          );
                        },
                      }),
                    ]}
                  >
                    <TextField
                      fullWidth
                      id="password"
                      label="密码"
                      name="password"
                    />
                  </Form.Item>
                </Grid>
                <Grid item xs={12} sm={6}>
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

                    <TextField
                      fullWidth
                      id="confirm"
                      label="确认密码"
                      name="confirm"
                    />
                  </Form.Item>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Form.Item name="role" rules={[{ required: true, message: "身份不能为空" }]}>
                    {/* <FormControl fullWidth> */}
                    {/* <InputLabel id="demo-simple-select-label">身份</InputLabel> */}
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      label="身份"
                      fullWidth
                      placeholder="身份"
                    >
                      <MenuItem value="demander">需求方</MenuItem>
                      <MenuItem value="labeler">标注方</MenuItem>
                      <MenuItem value="administrator">管理员</MenuItem>
                    </Select>
                    {/* </FormControl> */}
                  </Form.Item>
                </Grid>
                <Grid item xs={12}>
                  <Form.Item
                    name="email"
                    rules={[
                      {
                        required: true,
                        type: 'email',
                        message: '邮箱格式不正确',
                      },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value && getFieldValue("role") === "demander") {
                            return Promise.reject(new Error("注册需求方必填"));
                          }
                          return Promise.resolve();
                        },
                      }),
                    ]}>
                    <TextField
                      fullWidth
                      id="email"
                      label="电子邮箱"
                      name="email"
                      autoComplete="email"
                    />
                  </Form.Item>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="invitecode"
                    label="邀请码"
                    type="invitecode"
                    id="invitecode"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Form.Item>
                  <FormControlLabel
                    required
                    control={<Checkbox value="allowExtraEmails" color="primary" />}
                    label="我已阅读并同意用户服务协议"
                  />
                  </Form.Item>
                </Grid>
              </Grid>
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                style={{
                  backgroundColor: "#3b5999",
                  marginBottom: "5px"
                }}
              >
                注册
              </Button>
            </Form>
          </Box>
        </div>
        <div>
          <Box
            sx={{
              marginTop: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography component="h1" variant="h5">
              验证邮箱
            </Typography>
            <Divider></Divider>
            <p>您要验证的电子邮箱地址为: {email}</p>
            <Form
              onFinish={(values) => {
                setRefreshing(true)
                postVeriCode(email, values.vericode)
              }}
              // onFinishFailed={onFinishFailed}
              autoComplete="off"
            >
              <Grid item xs={24}>
                <Form.Item
                  name="vericode"
                  rules={[{ required: true, message: "验证码不能为空" }]}
                >
                  <Search
                    placeholder="验证码"
                    allowClear
                    enterButton={
                      <Button type="link" disabled={isVerifyDisabled}
                      style={{width: "100%"}} 
                      onClick={() => {
                        setRefreshing(true)
                        getVeriCode(email)
                      }}>{isVerifyDisabled?`${timeLeft<10?0:""}${timeLeft}s后重发`:"发送验证码"}</Button>
                    }
                    size="large"
                  />
                </Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  size="large"
                  style={{
                    backgroundColor: "#3b5999"
                  }}
                >验证</Button>
              </Grid>
            </Form>
          </Box>
        </div>
      </Carousel>
    </Container>
    </Spin>
  );
}

export default Register;
