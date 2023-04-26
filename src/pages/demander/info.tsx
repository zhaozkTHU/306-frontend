import UserInfo from "@/components/user_info/user-info";
import { Alert, Tabs, TextField, Typography } from "@mui/material";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CurrencyYuanIcon from '@mui/icons-material/CurrencyYuan';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import CryptoJS from "crypto-js";
import { Button, Card, Divider, Form, message, Modal, Spin, Statistic } from "antd";
import React from "react";
import { useEffect, useState } from "react";
import { FieldNumberOutlined } from "@ant-design/icons";
import { request } from "@/utils/network";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}


const DemanderInfo = () => {
  const [refreshing, setRefreshing] = useState<boolean>(true);
  const [username, setUsername] = useState<string>("");
  const [invitecode, setInvitecode] = useState<string>("");
  const [level, setLevel] = useState<string>("");
  const [exp, setExp] = useState<number>(0);
  const [points, setPoints] = useState<number>(0);
  const [value, setValue] = React.useState(0);
  const [isBound, setIsBound] = useState<boolean>(false);
  const [accountBalance, setAccountBalance] = useState<{ bank_account: string, balance: string }[]>([])
  const [visible, setVisible] = useState<boolean>(false);
  const [isBoundModalOpen, setIsBoundModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [activateAccountTabKey, setActivateAccountTabKey] = useState<number>(1)
  const [accountValue, setAccountValue] = useState<number>(0);
  const [isCXModalOpen, setIsCXModalOpen] = useState<boolean>(false)
  const [addScore, setAddScore] = useState<boolean>(false);

  const disbound = async (bank_account: string) => {
    request("/api/untie", "POST", {
      bank_account: bank_account
    })
      .then((response) => {
        message.success("解绑成功")
      })
      .catch((error) => {
        message.error("解绑失败")
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(true);
      })
  }
  const postBound = async (bank_account: string, hashedPassword: string) => {
    request("/api/bound", "POST", {
      bank_account: bank_account,
      password: hashedPassword
    })
      .then((response) => {
        message.success("银行卡绑定成功")
        setIsBoundModalOpen(false);
      })
      .catch((error) => {
        message.error(`银行卡绑定失败, ${error.response.data.message}`)
      })
      .finally(() => {
        setLoading(false)
        setRefreshing(true)
      })
  }

  const exchange = async (score: number, add_score: boolean, bank_account: string, hashedPassword: string) => {
    request("/api/exchange", "POST", {
      score: score,
      add_score: add_score,
      bank_account: bank_account,
      password: hashedPassword
    })
      .then((reponse) => {
        message.success((addScore ? "充值" : "提现") + "成功")
      })
      .catch((error) => {
        message.error((addScore ? "充值" : "提现") + "失败")
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(true);
      })
  }

  const getBoundAccounts = async () => {
    request("/api/bound_accounts", "GET")
      .then((response) => {
        setAccountBalance(response.data.accounts)
      })
      .catch((error) => {
        message.error(`银行卡信息获取失败, ${error.response.data.message}`)
      })
      .finally(() => {
        setRefreshing(false)
      })
  }
  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    // if (newValue === 2) {
    //   setRefreshing(true)
    //   getBoundAccounts()
    // }
    setValue(newValue);
  };
  const handleChange2 = (event: React.SyntheticEvent, newValue: number) => {
    setAccountValue(newValue)
  }
  useEffect(() => {
    request("/api/account_info", "GET")
      .then((response) => {
        setUsername(response.data.username);
        setInvitecode(response.data.invitecode);
        setLevel(response.data.level);
        setExp(response.data.exp);
        setPoints(response.data.points);
        setIsBound(response.data.is_bound);
      })
      .catch((err) => {
        console.log(err);
      });
    getBoundAccounts();
  }, [refreshing]);

  const tabList = accountBalance.map((_con, idx) => {
    return {
      key: `${idx + 1}`,
      tab: `账户${idx + 1}`
    }
  })
  return (
    <Spin spinning={refreshing}>
      <Spin spinning={loading}>
        <Modal open={isBoundModalOpen}
          onCancel={() => { setIsBoundModalOpen(false) }}
          onOk={() => { setIsBoundModalOpen(false) }}
          footer={null}
          destroyOnClose
        >
          <Typography component="h1" variant="h5" style={{ textAlign: "center" }}>
            绑定银行卡
          </Typography>
          <Divider />
          <Form
            name="basic"
            initialValues={{ remember: true }}
            onFinish={(values) => {
              setLoading(true);
              const hashPassword = CryptoJS.SHA256(values.password).toString();
              postBound(values.bank_account, hashPassword)
              setIsBoundModalOpen(false)
            }}
            autoComplete="off"
          >
            <Form.Item
              name="bank_account"
              rules={[
                {
                  required: true,
                  message: "不得为空",
                },
                ({}) => ({
                  validator(_, value) {
                    const r = /^\+?[1-9][0-9]*$/;
                    if (value && !r.test(value)) {
                      return Promise.reject(new Error("银行卡账号必须由数字组成"));
                    }
                    if (value && (value.length < 15 || value.length > 19)) {
                      return Promise.reject(new Error("银行卡账号必须为15~19位"));
                    }
                    return Promise.resolve();
                  },
                })
              ]}
            >
              <TextField
                margin="normal"
                fullWidth
                id="bank_account"
                label="银行卡账号"
                name="bank_account"
                autoFocus
              />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[
                {
                  required: true,
                  message: "不得为空",
                },
                ({}) => ({
                  validator(_, value) {
                    const r = /^\+?[1-9][0-9]*$/;
                    if (value && !r.test(value)) {
                      return Promise.reject(new Error("银行卡密码必须由数字组成"));
                    }
                    if (value && (value.length !== 6)) {
                      return Promise.reject(new Error("银行卡密码必须为6位"));
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <TextField
                type="password"
                margin="normal"
                fullWidth
                id="password"
                label="密码"
                name="password"
                autoFocus
              />
            </Form.Item>
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
              绑定
            </Button>
          </Form>
        </Modal>
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
              <Tab label="基本信息" {...a11yProps(0)} />
              <Tab label="信息修改" {...a11yProps(1)} />
              <Tab label="账户与充值" {...a11yProps(2)} />
            </Tabs>
          </Box>
          <TabPanel value={value} index={0}>
            <div>
              <UserInfo
                username={username}
                invitecode={invitecode}
                level={level}
                exp={exp}
                points={points}
              />
            </div>
          </TabPanel>
          <TabPanel value={value} index={1}>
            信息修改
          </TabPanel>
          <TabPanel value={value} index={2}>
            {
              <Alert severity={isBound ? "success" : "warning"}>该账号已绑定银行卡
                <Button type="link" size="small"
                  onClick={() => {
                    setIsBoundModalOpen(true)
                  }}
                >点击此处绑定</Button>
              </Alert>}
            <Card title={"账户信息 "}
              extra={
                <Button type="text" size="large" disabled={!isBound} onClick={() => {
                  setVisible((i) => !i)
                }}
                  icon={visible ? <VisibilityOffIcon /> : <VisibilityIcon />}
                />
              }>
              <Box sx={{ width: '100%' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Tabs value={accountValue} onChange={handleChange2} aria-label="basic tabs example">
                    {accountBalance.map((_, idx) =>
                      <Tab label={`账户${idx + 1}`} {...a11yProps(idx)} key={idx}/>
                    )}
                  </Tabs>
                </Box>
                {accountBalance.map((account, idx) =>
                  <TabPanel value={accountValue} index={idx} key={idx}>
                    <Statistic title="银行卡卡号 (No.)" value={visible ? account.bank_account : "******************"} precision={0} prefix={<FieldNumberOutlined />} />
                    <Statistic title="账户余额 (CNY)" value={visible ? account.balance : "******************"} precision={2} prefix={<CurrencyYuanIcon />} />
                    <Button onClick={() => {
                      setAddScore(true)
                      setIsCXModalOpen(true)
                    }}>充值</Button>
                    <Button onClick={() => {
                      setAddScore(false)
                      setIsCXModalOpen(true)
                    }}>提现</Button>
                    <Button onClick={() => {
                      setLoading(true)
                      disbound(account.bank_account)
                    }}>解绑</Button>
                    <Modal
                      open={isCXModalOpen}
                      onCancel={() => setIsCXModalOpen(false)}
                      footer={null}
                    >
                      <Typography component="h1" variant="h5" style={{ textAlign: "center" }}>
                        {addScore ? "充值" : "提现"}
                      </Typography>
                      <Divider />
                      <p>注: 1 元 = 10 点数</p>
                      <Form
                        name="basic"
                        initialValues={{ remember: true }}
                        onFinish={(values) => {
                          setLoading(true);
                          const hashPassword = CryptoJS.SHA256(values.password).toString();
                          exchange(values.score, addScore, account.bank_account, hashPassword)
                          setIsCXModalOpen(false);
                        }}
                        autoComplete="off"
                      >
                        <Form.Item
                          name="score"
                          rules={[
                            {
                              required: true,
                              message: "不得为空",
                            },
                            ({ }) => ({
                              validator(_, value) {
                                const r = /^\+?[1-9][0-9]*$/;
                                if (value && !r.test(value)) {
                                  return Promise.reject(new Error("请输入数字"));
                                }
                                if (value && addScore && parseInt(account.balance) * 10 < value) {
                                  return Promise.reject(new Error("余额不足"));
                                }
                                if (value && !addScore && points < value) {
                                  return Promise.reject(new Error("点数不足"));
                                }
                                return Promise.resolve();
                              },
                            })
                          ]}
                        >
                          <TextField
                            margin="normal"
                            fullWidth
                            id="score"
                            label={`${addScore ? "充值" : "提现"}点数`}
                            name="score"
                            autoFocus
                          />
                        </Form.Item>
                        <Form.Item
                          name="password"
                          rules={[
                            {
                              required: true,
                              message: "不得为空",
                            },
                            ({ getFieldValue }) => ({
                              validator(_, value) {
                                const r = /^\+?[1-9][0-9]*$/;
                                if (value && !r.test(value)) {
                                  return Promise.reject(new Error("银行卡密码必须由数字组成"));
                                }
                                if (value && (value.length !== 6)) {
                                  return Promise.reject(new Error("银行卡密码必须为6位"));
                                }
                                return Promise.resolve();
                              },
                            }),
                          ]}
                        >
                          <TextField
                            type="password"
                            margin="normal"
                            fullWidth
                            id="password"
                            label="密码"
                            name="password"
                            autoFocus
                          />
                        </Form.Item>
                        <Button
                          type="primary"
                          htmlType="submit"
                          block
                          size="large"
                          style={{
                            backgroundColor: "#3b5999",
                            marginBottom: "5px",
                          }}
                        >
                          {addScore?"充值":"提现"}
                        </Button>
                      </Form>
                    </Modal>
                  </TabPanel>
                )}
              </Box>
            </Card>
          </TabPanel>
        </Box>
      </Spin>
    </Spin>
  );
};

export default DemanderInfo;
