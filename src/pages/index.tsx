import React, { useRef } from "react";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";
import { Button, Form, Input, Carousel, Divider } from "antd";
import { isValid } from "@/utils/valid";
import CryptoJS from "crypto-js";
import axios from "axios";
import { ProCard } from "@ant-design/pro-components";

const onFinishFailed = (errorInfo: any) => {
  console.log("Failed:", errorInfo);
};

interface LoginScreenPorps {
  setLoginStatus: any;
  setToken: any;
}

// const leftCtyle: React.CSSProperties = {
//   textAlign: 'center',
//   color:'rgba(35, 67, 116, 0.953)'
// }

// login interface
const LoginScreen = (props: LoginScreenPorps) => {
  const router = useRouter();
  const CarouselRef = useRef<any>(null);
  return (
    <div
      style={{
        position: "fixed",
        width: "100%",
        height: "100%",
        // backgroundImage: `url(https://pic.mac89.com/pic/202009/28094544_3a18464f9e.jpeg)`,
        // backgroundImage: `url(https://static.zhihu.com/heifetz/assets/sign_bg.47eec442.png)`,
        // backgroundImage: `url(http://seerh5.61.com/resource/assets/ui/personalInformation/outside/personalInformationOther_infoBg_c3f77d6a.png)`,
        // backgroundImage: `url(http://seerh5.61.com/resource/assets/ui/personalInformation/outside/personalInformationOther_dz1111.png)`,
        // backgroundImage: `url(http://seerh5.61.com/resource/assets/ui/common/outside/peakjihad_common_panel_bg.jpg)`,
        // backgroundImage: `url(http://seerh5.61.com/resource/assets/ui/team/outside/team_task_defaultBg_80641b0b.png)`,
        // backgroundImage: `url(https://github.githubassets.com/images/modules/site/home-campaign/footer-galaxy.jpg)`,
        backgroundSize: "100% 100%",
        backgroundColor: "rgba(199, 192, 234, 0.1)",
      }}
    >
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
              style={{ height: "100%", backgroundColor: "rgba(255, 255, 255, 0)" }}
              onClick={() => {
                CarouselRef.current?.prev?.();
              }}
            ></ProCard>
            <ProCard
              colSpan={"90%"}
              style={{ height: "100%", backgroundColor: "rgba(255, 255, 255, 0)" }}
            >
              <Carousel
                autoplay
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: "rgba(0, 0, 0, 0)",
                  // border: 'solid',
                  marginBottom: "0%",
                }}
                dotPosition={"bottom"}
                dots={false}
                arrows
                ref={CarouselRef}
              >
                <div>
                  <h1 className="loginLeft">全306最大的众包平台</h1>
                  <p className="loginLeft">我们是306最大的众包平台</p>
                  <p className="loginLeft">拥有zmh等金牌标注工</p>
                  <p className="loginLeft">标注质量连续六年全306遥遥领先</p>
                  <p className="loginLeft">任务分发、标注速度快</p>
                  <p className="loginLeft">标注价格低、平台抽成少、工人挣得多</p>
                  <p className="loginLeft">...</p>
                </div>
                <div>
                  <h1 className="loginLeft">支持多模板</h1>
                  <p className="loginLeft">文本分类</p>
                  <p className="loginLeft">图片分类</p>
                  <p className="loginLeft">内容审核</p>
                  <p className="loginLeft">音视频标注</p>
                  <p className="loginLeft">骨骼打点</p>
                  <p className="loginLeft">...</p>
                </div>
                <div>
                  <h1 className="loginLeft">顾客好评如潮</h1>
                  <p className="loginLeft">306众包平台数据标注价格低，质量高，值得信赖。 ——ztq</p>
                  <p className="loginLeft">
                    306众包平台抽成很少，操作简单，我在这上面兼职标注，挣了不少钱。 ——zmh
                  </p>
                  <p className="loginLeft">
                    306众包平台非常适合我们中介，因为这上面有很多的需求方和标注者，谈拢一单简直太容易了。
                    ——zkk
                  </p>
                </div>
              </Carousel>
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
                    props.setLoginStatus(`${response.data.role}AlreadyLogin`);
                    props.setToken(response.data.token);
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
                onClick={() => router.push("/register")}
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
