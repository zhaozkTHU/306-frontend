import React, { Dispatch, SetStateAction, useRef, useState } from "react";
import Avatar from "@mui/material/Avatar";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import PersonIcon from "@mui/icons-material/Person";
import Typography from "@mui/material/Typography";
import { Form, message, Button, Spin, Modal, Divider, Input } from "antd";
import { isValid } from "@/utils/valid";
import { useRouter } from "next/router";
import CryptoJS from "crypto-js";
import Register from "@/components/register/register";
import { request } from "@/utils/network";
import FindPassword from "@/components/register/find-password";
import CameraButton from "@/components/FaceLogin";
import axios from "axios";

interface LoginScreenPorps {
  setRole: Dispatch<SetStateAction<string | null>>;
}

export default function LoginScreen(props: LoginScreenPorps) {
  const router = useRouter();
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState<boolean>(false);
  const [isFoundPassword, setIsFoundPassword] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [faceModal, setFaceModal] = useState(false);
  const [faceModalLoading, setFaceModalLoading] = useState(false);
  const CarouselRef = useRef<any>(null);

  const faceLogin = (faceImg: File): Promise<void> =>
    new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append("face_image", faceImg);
      axios
        .post("/api/user/verify", formData)
        .then((response) => {
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("role", response.data.role);
          props.setRole(response.data.role);
          router.push(`/${response.data.role}/info`);
          message.success("登录成功");
          resolve();
        })
        .catch((error) => {
          if (error.response) {
            message.error(`登录失败，${error?.response?.data?.message}`);
          } else {
            message.error("网络失败，请稍后再试");
          }
          reject();
        })
        .finally(() => {
          setRefreshing(false);
        });
    });

  const login = async (values: { username: string; hashPassword: string }) => {
    request("/api/user/login", "POST", {
      username: values.username,
      password: values.hashPassword,
    })
      .then((response) => {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("role", response.data.role);
        localStorage.setItem("user_id", response.data.user_id);
        props.setRole(response.data.role);
        router.push(`/${response.data.role}/info`);
        message.success("登录成功");
      })
      .catch((error) => {
        if (error.response) {
          message.error(`登录失败，${error.response.data.message}`);
        } else {
          message.error("网络失败，请稍后再试");
        }
      })
      .finally(() => {
        setRefreshing(false);
      });
  };
  return (
    <Spin spinning={refreshing} tip="加载中，请稍后">
      <Modal
        open={isRegisterModalOpen}
        onCancel={() => {
          if (!refreshing) {
            setIsRegisterModalOpen(false);
          }
        }}
        footer={false}
        destroyOnClose={true}
        centered
      >
        <Register setModalOpen={setIsRegisterModalOpen} CarouselRef={CarouselRef} />
      </Modal>

      <Modal open={faceModal} onCancel={() => setFaceModal(false)} footer={null}>
        <Spin spinning={faceModalLoading}>
          <CameraButton
            fileName="face.jpg"
            onFinish={(faceImg) => {
              setFaceModalLoading(true);
              faceLogin(faceImg)
                .then(() => setFaceModal(false))
                .finally(() => setFaceModalLoading(false));
            }}
          />
        </Spin>
      </Modal>

      <Modal
        open={isFoundPassword}
        onCancel={() => {
          if (!refreshing) {
            setIsFoundPassword(false);
          }
        }}
        footer={null}
        destroyOnClose
      >
        <FindPassword setrefreshing={setRefreshing} />
      </Modal>

      <Grid container component="main" sx={{ height: "100vh" }}>
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage: "url(/logo/306.png)",
            backgroundRepeat: "no-repeat",
            backgroundColor: (t) =>
              t.palette.mode === "light" ? t.palette.grey[50] : t.palette.grey[900],
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></Grid>
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
              <PersonIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              登录
            </Typography>
            <Divider />
            <Form
              name="basic"
              initialValues={{ remember: true }}
              onFinish={(values) => {
                setRefreshing(true);
                const hashPassword = CryptoJS.SHA256(values.password).toString();
                login({ username: values.username, hashPassword: hashPassword });
              }}
              // onFinishFailed={onFinishFailed}
              autoComplete="off"
            >
              <Form.Item
                name="username"
                rules={[
                  { required: true, message: "用户名不能为空" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (
                        !value ||
                        (isValid(value, true) && value.length <= 50 && value.length >= 3)
                      ) {
                        return Promise.resolve();
                      }
                      if (value && !isValid(value, true)) {
                        return Promise.reject(new Error("用户名只包含字母、数字、下划线"));
                      }
                      if (value && value.length > 50) {
                        return Promise.reject(new Error("用户名长度不超过50"));
                      }
                      if (value && value.length < 3) {
                        return Promise.reject(new Error("用户名长度不小于3"));
                      }
                    },
                  }),
                ]}
              >
                <TextField
                  margin="normal"
                  fullWidth
                  id="username"
                  label="用户名"
                  name="username"
                  autoFocus
                />
              </Form.Item>
              <Form.Item
                name="password"
                rules={[
                  { required: true, message: "密码不能为空" },
                  ({}) => ({
                    validator(_, value) {
                      if (
                        !value ||
                        (isValid(value, true) && value.length <= 50 && value.length >= 3)
                      ) {
                        return Promise.resolve();
                      }
                      if (value && !isValid(value, true)) {
                        return Promise.reject(new Error("密码只包含字母、数字、下划线"));
                      }
                      if (value && value.length > 50) {
                        return Promise.reject(new Error("密码长度不超过50"));
                      }
                      if (value && value.length < 3) {
                        return Promise.reject(new Error("密码长度不小于3"));
                      }
                    },
                  }),
                ]}
              >
                <TextField
                  margin="normal"
                  fullWidth
                  name="password"
                  label="密码"
                  type="password"
                  id="password"
                />
              </Form.Item>
              <FormControlLabel
                control={<Checkbox value="remember" color="primary" />}
                label="我已阅读并同意用户服务协议"
                required
              />
              <Button
                type="primary"
                block
                htmlType="submit"
                size="large"
                style={{
                  backgroundColor: "#3b5999",
                  marginTop: "10px",
                  marginBottom: "10px",
                }}
              >
                登录
              </Button>
              <Grid container>
                <Grid item xs>
                  <Button
                    type="link"
                    onClick={() => {
                      setIsFoundPassword(true);
                    }}
                  >
                    忘记密码?
                  </Button>
                </Grid>
                <Grid item xs>
                  <Button type="link" onClick={() => setFaceModal(true)}>
                    人脸验证登录
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    type="link"
                    onClick={() => {
                      setIsRegisterModalOpen(true);
                    }}
                  >
                    注册或验证
                  </Button>
                </Grid>
              </Grid>
            </Form>
          </Box>
        </Grid>
      </Grid>
    </Spin>
  );
}
