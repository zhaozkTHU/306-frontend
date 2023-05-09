import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  Button,
  Space,
  Modal,
  Descriptions,
  Collapse,
  Tooltip,
  Popconfirm,
  message,
  Tag,
  Divider,
  Form,
  Upload,
  UploadFile,
  Image,
  Slider,
} from "antd";
import { ColumnsType } from "antd/es/table";
import { transTime } from "@/utils/valid";
import { Table, UploadProps } from "antd/lib";
import DataExportCallback from "@/components/data_export/dataExport";
import UpdateTask from "../task_manage/update-task";
import CheckModel from "../check/checkModel";
import { mapEntemplate2Zhtemplate, mapState2ColorChinese } from "@/const/interface";
import { request } from "../../utils/network";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import { TextField } from "@mui/material";
import { PlusOutlined } from "@ant-design/icons";
import { RcFile } from "antd/es/upload";
import store from "@/store";
import { add } from "../task_manage/deleteList";

export interface DemanderTaskTableEntry {
  task_id: number;
  create_at: number;
  deadline: number;
  title: string;
  state: string[];
  reward: number;
  time: number;
  labeler_number: number;
  labeler_id: number[];
  template: string;
  label_state: string[];
  pass_check: boolean;
  labeler_credits: number[];
  distribute: "system" | "agent";
  distribute_type: "order" | "smart";
  type: "sentiment" | "part-of-speech" | "intent" | "event";
  agent: string;
}

interface DemanderTaskListProps {
  type: string;
}

const DemanderTaskList = (props: DemanderTaskListProps) => {
  const router = useRouter();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [refreshing, setRefreshing] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [tasks, setTasks] = useState<DemanderTaskTableEntry[]>([]);
  const [labelerId, setLabelerId] = useState<number>(-1);
  const [isSample, setIsSample] = useState<boolean>(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isCheckModalOpen, setIsCheckModalOpen] = useState<boolean>(false);
  const [autoCheckingModalOpen, setAutoCheckingModalOpen] = useState<boolean>(false);
  const [reportModalOpen, setReportModalOpen] = useState<boolean>(false);
  const [slideValue, setSlideValue] = useState<number>(1);
  const [slideAccuracyValue, setSlideAccuracyValue] = useState<number>(1);
  const postSingleAutoChecking = async (task_id: number, labeler_id: number, accuracy: number) => {
    request("/api/demander/single_auto_check", "POST", {
      task_id: task_id,
      labeler_id: labeler_id,
      accuracy: accuracy,
    })
      .then(() => {
        message.success("自动审核请求发送成功");
      })
      .catch((error) => {
        if (error.response) {
          message.error(`自动审核请求发送失败，${error.response.data.message}`);
        } else {
          message.error("自动审核请求发送失败，网络错误");
        }
      });
    setLoading(false);
  };
  const postReport = async (
    task_id: number,
    user_id: number,
    demander_post: boolean,
    description: string,
    image_description: string[]
  ) => {
    request("/api/report", "POST", {
      task_id: task_id,
      user_id: user_id,
      description: description,
      image_description: image_description,
    })
      .then(() => {
        message.success("举报发送成功");
      })
      .catch((error) => {
        if (error.response) {
          message.error(`举报发送失败，${error.response.data.message}`);
        } else {
          message.error("举报发送失败，网络错误");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const UploadPropsByType = (fileType: "image" | "video" | "audio"): UploadProps => ({
    action: "/api/file",
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    beforeUpload: (file) => {
      console.log(file.type);
      const isValid = file.type.startsWith(fileType);
      if (!isValid) {
        message.error(`${file.name} 文件格式错误`);
        return Upload.LIST_IGNORE;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error(`${file.name} 文件大小超过2MB`);
        return Upload.LIST_IGNORE;
      }
      return true;
    },
    onRemove: async (file) => {
      console.log("file", file);
      store.dispatch(add(file.response?.url || file.url));
      return true;
    },
  });

  const getBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handlePreview = async (file: UploadFile) => {
    console.log("handlePreview");
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as RcFile);
    }
    if (file.url && !file.preview) {
      console.log(file.url);
      file.preview = await getBase64(
        (
          await axios.get("/api/file", {
            responseType: "arraybuffer",
            params: { url: file.url },
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          })
        ).data
      );
    }
    setPreviewImage(file.preview as string);
    setPreviewOpen(true);
    setPreviewTitle(file.name);
  };
  const auto_check = async (task_id: number, credits: number, accuracy: number) => {
    request("/api/get_agent", "POST", {
      task_id: task_id,
      credits: credits,
      accuracy: accuracy,
    })
      .then(() => {
        message.success("自动审核请求提交成功，请稍后查看结果");
      })
      .catch((error) => {
        if (error.response) {
          message.error(`自动审核请求提交失败，${error.response.data.message}`);
        } else {
          message.error("自动审核请求提交失败，网络错误");
        }
      });
    setLoading(false);
  };
  const delete_task = async (task_id: number) => {
    axios
      .delete(`/api/task`, {
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem("token")}`,
        },
        params: { task_id: task_id },
      })
      .then(() => {
        message.success("删除成功");
      })
      .catch((err) => {
        if (err.response) {
          message.error(`删除失败，${err.response.data.message}`);
        } else {
          message.error("删除失败，网络错误");
        }
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(true);
      });
  };
  const [detail, setDetail] = useState<DemanderTaskTableEntry>({
    task_id: -1,
    create_at: 0,
    deadline: 0,
    title: "标题五个字",
    state: [],
    labeler_number: 0,
    labeler_id: [],
    template: "模板五个字",
    label_state: [],
    pass_check: false,
    labeler_credits: [],
    reward: 0,
    time: 0,
    distribute: "agent",
    distribute_type: "order",
    type: "event",
    agent: "agent1",
  });
  const { Panel } = Collapse;
  const DemanderTaskTableColumns: ColumnsType<any> = [
    {
      title: "标题",
      dataIndex: "title",
      key: "title",
      align: "center",
      width: "25%",
      render: (text, record) => <Button type="link" onClick={() => {router.push(`/demander/${record.task_id}`)}}>{text}</Button>,
    },
    {
      title: "创建时间",
      dataIndex: "create_at",
      key: "create_at",
      align: "center",
      width: "20%",
      render: (timeStamp) => <p>{transTime(timeStamp)}</p>,
      sorter: (a, b) => a.create_at - b.create_at,
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "任务状态",
      dataIndex: "state",
      key: "state",
      align: "center",
      filterSearch: true,
      filters: [
        {
          text: "标注中",
          value: "labeling",
        },
        {
          text: "待审核",
          value: "checking",
        },
        {
          text: "已完成",
          value: "completed",
        },
      ],
      onFilter: (values, record) => record.state.indexOf(values) !== -1,
      render: (state) => {
        return (
          <Space size={[0, 8]} wrap>
            {state.map((s: string, idx: number) => (
              <Tag color={mapState2ColorChinese[s]['color']} key={idx}>
                {mapState2ColorChinese[s]['description']}
              </Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: "操作",
      dataIndex: "operation",
      key: "operation",
      align: "center",
      width: "32%",
      render: (_, record) => {
        return (
          <>
            <Button
              type="link"
              onClick={() => {
                setIsDetailModalOpen(true);
                setDetail(record);
              }}
            >
              查看
            </Button>
            <Popconfirm
              title="导出"
              okText="是"
              cancelText="否"
              description="是否归并数据后导出?"
              onConfirm={() => {
                DataExportCallback(record.task_id, true);
              }}
              onCancel={() => {
                DataExportCallback(record.task_id, false);
              }}
            >
              <Button type="link">导出</Button>
            </Popconfirm>
            <Button
              type="link"
              onClick={() => {
                setLoading(true);
                delete_task(record.task_id);
              }}
            >
              删除
            </Button>
            <Tooltip title="点击此处进行自动审核">
              <Button
                type="link"
                onClick={() => {
                  setDetail(record);
                  setAutoCheckingModalOpen(true);
                }}
              >
                自动审核
              </Button>
            </Tooltip>
          </>
        );
      },
    },
  ];

  const LabelerTableColumns: ColumnsType<any> = [
    {
      title: "标注者编号",
      dataIndex: "labeler_id",
      key: "labeler_id",
      align: "center",
    },
    {
      title: "标注者状态",
      dataIndex: "labeler_state",
      key: "labeler_state",
      align: "center",
      render: (state) => {
        return (
          <Space size={[0, 8]} wrap>
            <Tag color={mapState2ColorChinese[state].color}>
              {mapState2ColorChinese[state].description}
            </Tag>
          </Space>
        );
      },
    },
    {
      title: "操作",
      dataIndex: "labeler_detail",
      key: "labeler_detail",
      align: "center",
      render: (_, record) => {
        return (
          <>
            <Tooltip title="处于待审核状态可以审核">
              <Button
                type="link"
                disabled={record.labeler_state != "checking"}
                onClick={() => {
                  setLabelerId(record.labeler_id);
                  setIsSample(false);
                  setIsCheckModalOpen(true);
                }}
              >
                全量审核
              </Button>
            </Tooltip>
            <Tooltip title="处于待审核状态可以审核">
              <Popconfirm
                disabled={record.labeler_state != "checking"}
                placement="bottom"
                title="抽样审核"
                okText="确认"
                cancelText="取消"
                description={
                  <>
                    请选择抽样百分比（%）
                    <Slider
                      onChange={(value) => {
                        setSlideValue(value);
                      }}
                      value={slideValue}
                      min={1}
                      max={100}
                    />
                  </>
                }
                onConfirm={() => {
                  setLabelerId(record.labeler_id);
                  setIsSample(true);
                  setIsCheckModalOpen(true);
                }}
              >
                <Button type="link" disabled={record.labeler_state != "checking"}>
                  抽样审核
                </Button>
              </Popconfirm>
            </Tooltip>
            <Tooltip title="对该用户单独进行自动审核">
              <Popconfirm
                disabled={record.labeler_state != "checking"}
                placement="bottom"
                title="自动审核"
                okText="确认"
                cancelText="取消"
                description={
                  <>
                    <p>
                      该标注方的信用分为{record.labeler_credits}，
                      {record.credits < 80 ? "用户信用分较低，不建议进行自动审核" : "可以自动审核"}
                      ，确定要自动审核吗?
                    </p>
                    <p>若要自动审核，请先指定下面的正确率标准</p>
                    <Slider
                      onChange={(value) => {
                        setSlideAccuracyValue(value);
                      }}
                      value={slideAccuracyValue}
                      min={1}
                      max={100}
                    />
                  </>
                }
                onConfirm={() => {
                  setLoading(true);
                  postSingleAutoChecking(detail.task_id, record.labeler_id, slideAccuracyValue);
                }}
              >
                <Button disabled={record.labeler_state != "checking"} type="link">
                  自动审核
                </Button>
              </Popconfirm>
            </Tooltip>
            <Tooltip title="审核未通过可以举报">
              <Button
                disabled={record.labeler_state != "failed"}
                type="link"
                onClick={() => {
                  setLabelerId(record.labeler_id);
                  setReportModalOpen(true);
                }}
              >
                举报
              </Button>
            </Tooltip>
          </>
        );
      },
    },
  ];

  useEffect(() => {
    request(`/api/task${props.type}`, "GET")
      .then((response) => {
        const newTasks = response.data.demander_tasks.map((task: any) => {
          return { ...task };
        });
        setTasks(newTasks);
      })
      .catch((err) => {
        console.log(err.reponse?.data);
      });
    setRefreshing(false);
  }, [router, refreshing]);
  return (
    <>
      <Modal
        open={autoCheckingModalOpen}
        onCancel={() => {
          setAutoCheckingModalOpen(false);
        }}
        footer={null}
        destroyOnClose
      >
        <Typography component="h1" variant="h5" style={{ textAlign: "center" }}>
          自动审核
        </Typography>
        <Divider></Divider>
        <Form
          name="basic"
          initialValues={{ remember: true }}
          onFinish={(values) => {
            setLoading(true);
            auto_check(detail.task_id, values.credits, values.accuracy);
            setAutoCheckingModalOpen(false);
          }}
        >
          <p>我们将根据您创建任务时上传的带标注数据对标注方的标注进行自动审核。</p>
          <p>
            <b>注：</b>
            为了审核结果的可靠性，请您在自动审核时指定一个信用分标准，对于信用分低于此标准的标注者，我们不会进行自动审核。
          </p>
          <p>如果您不想考虑信用分，希望对所有标注方都进行自动审核，请将该标准设置为0。</p>
          <Form.Item
            name="credits"
            rules={[
              { required: true, message: "不能为空" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (value < 0) {
                    return Promise.reject(new Error("信用分标准不能为负数"));
                  }
                  if (value > 100) {
                    return Promise.reject(new Error("信用分标准不能超过100"));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <TextField
              name="credits"
              fullWidth
              id="credits"
              label="信用分标准"
              autoFocus
              type="number"
            />
          </Form.Item>
          <p>您还需要指定正确率标准，高于此标准的标注将会通过审核，否则不通过审核。</p>
          <Form.Item
            name="accuracy"
            rules={[
              { required: true, message: "不能为空" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (value < 0) {
                    return Promise.reject(new Error("正确率标准不能为负数"));
                  }
                  if (value > 100) {
                    return Promise.reject(new Error("正确率标准不能超过100"));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <TextField
              name="accuracy"
              fullWidth
              id="accuracy"
              label="正确率标准"
              autoFocus
              type="number"
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
            确认
          </Button>
        </Form>
      </Modal>
      <Modal
        open={isDetailModalOpen}
        onCancel={() => {
          setIsDetailModalOpen(false);
        }}
        footer={null}
        width={"80%"}
        destroyOnClose
        centered
      >
        <Modal
          open={reportModalOpen}
          onCancel={() => {
            setReportModalOpen(false);
          }}
          footer={null}
          destroyOnClose
        >
          <Typography component="h1" variant="h5" style={{ textAlign: "center" }}>
            举报
          </Typography>
          <Divider></Divider>
          <Form
            name="basic"
            initialValues={{ remember: true }}
            onFinish={(values) => {
              const image_url = values.image_description.map(
                (image: any) => image.response?.url
              );
              postReport(detail.task_id, labelerId, true, values.description, image_url);
            }}
            autoComplete="off"
          >
            <p>如果您认为该标注者有恶意刷题等行为，欢迎您对该标注者进行举报。</p>
            <p>
              <b>注:</b>{" "}
              请勿恶意进行举报，若管理员发现您有恶意举报行为，可能会驳回您的举报并扣除您的信用分
            </p>
            <p>
              请对被举报者的恶意行为进行<b>说明</b>，您的描述越详尽，举报成功的概率越高
            </p>
            <Form.Item name="description" rules={[{ required: true, message: "说明不能为空" }]}>
              <TextField
                name="description"
                fullWidth
                id="description"
                label="原因说明"
                autoFocus
                type="description"
                multiline
              />
            </Form.Item>
            <p>
              请提供<b>图片证据</b>，图片证据越详尽，举报成功的概率越高
            </p>
            <Form.Item
              name="image_description"
              rules={[{ required: true, message: "请上传文件" }]}
              valuePropName="fileList"
              getValueFromEvent={(e) => {
                console.log(e);
                return e?.fileList;
              }}
            >
              <Upload
                {...UploadPropsByType("image")}
                listType="picture-card"
                onPreview={handlePreview}
              >
                <PlusOutlined style={{ fontSize: "24px" }} />
              </Upload>
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
              发布举报
            </Button>
            <Modal
              open={previewOpen}
              title={previewTitle}
              footer={null}
              onCancel={() => setPreviewOpen(false)}
            >
              <Image alt="image" style={{ width: "100%" }} src={previewImage} />
            </Modal>
          </Form>
        </Modal>
        <Modal
          open={isCheckModalOpen}
          onCancel={() => {
            setIsCheckModalOpen(false);
          }}
          footer={null}
          destroyOnClose
          centered
        >
          <CheckModel
            task_id={detail.task_id}
            labeler_index={labelerId}
            is_sample={isSample}
            template={detail.template}
            rate={slideValue}
            setIsLabelerList={setLoading}
          />
        </Modal>
        {detail.pass_check ? <></> : <Alert severity="warning">该任务尚未通过管理员审核</Alert>}
        <h3>任务详情</h3>
        <Descriptions bordered column={4}>
          <Descriptions.Item label="标题" span={4}>
            {detail.title}
          </Descriptions.Item>
          <Descriptions.Item label="创建时间" span={2}>
            {transTime(detail.create_at)}
          </Descriptions.Item>
          <Descriptions.Item label="截止时间" span={2}>
            {transTime(detail.deadline)}
          </Descriptions.Item>
          <Descriptions.Item label="模板" span={2}>
            {mapEntemplate2Zhtemplate[detail.template]}
          </Descriptions.Item>
          <Descriptions.Item label="状态" span={2}>
            <Space size={[0, 8]} wrap>
              {detail.state.map((s: string, idx: number) => (
                <Tag color={mapState2ColorChinese[s].color} key={idx}>
                  {mapState2ColorChinese[s].description}
                </Tag>
              ))}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="要求标注方人数" span={1}>
            {detail.labeler_number}
          </Descriptions.Item>
          <Descriptions.Item label="单题奖励" span={1}>
            {detail.reward}
          </Descriptions.Item>
          <Descriptions.Item label="单题限时" span={1}>
            {detail.time}秒
          </Descriptions.Item>
        </Descriptions>
        <h3>标注者信息</h3>
        <Table
          columns={LabelerTableColumns}
          dataSource={detail.labeler_id.map((id, idx) => {
            return {
              labeler_id: id,
              labeler_state: detail.label_state[idx],
            };
          })}
        />
        <h3>题目详情</h3>
        <Collapse>
          <Panel key={""} header={"点击此处查看题目详情，尚未分发的任务可以更改题目内容"}>
            <UpdateTask taskId={detail.task_id} />
          </Panel>
        </Collapse>
      </Modal>
      <Table
        columns={DemanderTaskTableColumns}
        dataSource={tasks}
        loading={refreshing || loading}
        pagination={{ pageSize: 6 }}
      />
    </>
  );
};

export default DemanderTaskList;
