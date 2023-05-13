import { mapEntemplate2Zhtemplate } from "@/const/interface";
import store from "@/store";
import { request } from "@/utils/network";
import {
  Button,
  Carousel,
  Divider,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Row,
  Table,
  Tooltip,
  Upload,
  UploadFile,
  UploadProps,
  message,
} from "antd";
import { ColumnsType } from "antd/es/table";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { add } from "../task_manage/deleteList";
import { RcFile } from "antd/es/upload";
import Typography from "@mui/material/Typography";
import { PlusOutlined } from "@ant-design/icons";
import TextField from "@mui/material/TextField";
import Problem from "../demander_problem/problem";
import Grid from "@mui/material/Grid";

interface LabelerTaskListProps {
  state: string;
}

interface LabelerTask {
  demander_id: number;
  task_id: number;
  title: string;
  template: string;
  reward: number;
  task_data: any[];
}

const { Search } = Input;

const LabelerTaskList = (props: LabelerTaskListProps) => {
  const [pageNumber, setPageNumber] = useState<number | null>(null);
  const [taskLists, setTaskLists] = useState<LabelerTask[]>([]);
  const [problemsModalOpen, setProblemsModalOpen] = useState<boolean>(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [detail, setDetail] = useState<LabelerTask>({
    title: "",
    template: "TextClassification",
    reward: 0,
    task_data: [],
    task_id: 0,
    demander_id: 0,
  });
  const [refreshing, setRefreshing] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [reportModalOpen, setReportModalOpen] = useState<boolean>(false);
  const CarouselRef = useRef<any>(null);

  useEffect(() => {
    request(`/api/${props.state}`, "GET")
      .then((response) => {
        setTaskLists(response.data.data);
      })
      .catch((error) => {
        if (error.response) {
          message.error(`获取任务列表失败，${error.response.data.message}`);
        } else {
          message.error("获取任务列表失败，网络错误");
        }
      })
      .finally(() => {
        setRefreshing(false);
      });
  }, [refreshing]);

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
  const postReport = async (
    task_id: number,
    user_id: number,
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
  const columns: ColumnsType<any> = [
    {
      title: "任务标题",
      dataIndex: "title",
      key: "title",
      align: "center",
      width: "25%",
      render: (username, record) => <Button type="link">{username}</Button>,
    },
    {
      title: "任务模板",
      dataIndex: "template",
      key: "template",
      align: "center",
      width: "25%",
      render: (template) => mapEntemplate2Zhtemplate[template],
    },
    {
      title: "单题奖励",
      dataIndex: "reward",
      key: "reward",
      align: "center",
      width: "20%",
    },
    {
      title: "操作",
      dataIndex: "operation",
      key: "operation",
      align: "center",
      render: (_, record) => (
        <>
          <Button
            type="link"
            onClick={() => {
              setDetail(record);
              setReportModalOpen(true);
            }}
          >
            举报
          </Button>
          <Button
            type="link"
            onClick={() => {
              setDetail({ ...record, task_data: record.task_data });
              setProblemsModalOpen(true);
            }}
          >
            查看
          </Button>
        </>
      ),
    },
  ];

  return (
    <>
      <Modal
        open={problemsModalOpen}
        onCancel={() => {
          setProblemsModalOpen(false);
        }}
        footer={null}
        destroyOnClose
      >
        <Typography component="h1" variant="h5" style={{ textAlign: "center" }}>
          题目详情
        </Typography>
        <Divider></Divider>
        <Carousel dots={false} ref={CarouselRef}>
          <div>
            {detail.task_data.map((problem: any, idx: number) => (
              <>
                <Problem problem={problem} index={idx} total={detail.task_data.length} />
                <Divider />
                <Grid container>
                  <Grid item xs>
                    <Tooltip title={idx === 0 ? "已经是第一题了" : undefined}>
                      <Button
                        disabled={idx === 0}
                        onClick={() => {
                          CarouselRef.current?.goTo(idx + 1, true);
                        }}
                      >
                        上一题
                      </Button>
                    </Tooltip>
                    <Divider type="vertical" />
                    <Tooltip
                      title={idx === detail.task_data.length - 1 ? "已经是最后一题了" : undefined}
                    >
                      <Button
                        disabled={idx === detail.task_data.length - 1}
                        onClick={() => {
                          CarouselRef.current?.goTo(idx - 1, true);
                        }}
                      >
                        下一题
                      </Button>
                    </Tooltip>
                    <Divider type="vertical" />
                  </Grid>
                  <Grid>
                    <InputNumber
                      size="small"
                      placeholder={`跳转至`}
                      value={pageNumber}
                      onChange={(e) => {
                        setPageNumber(e);
                      }}
                    />
                    <Button
                      type="link"
                      onClick={() => {
                        if (pageNumber !== null) {
                          if (pageNumber <= detail.task_data.length && pageNumber >= 1) {
                            CarouselRef.current?.goTo(pageNumber - 1, true);
                          } else {
                            message.warning(`请输入正确的题目序号1~${detail.task_data.length}`);
                          }
                        }
                      }}
                    >
                      跳转至
                    </Button>
                  </Grid>
                </Grid>
              </>
            ))}
          </div>
        </Carousel>
      </Modal>
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
            const image_url = values.image_description.map((image: any) => image.response?.url);
            postReport(detail.task_id, detail.demander_id, values.description, image_url);
            setReportModalOpen(false);
          }}
          autoComplete="off"
        >
          <p>如果您认为该需求方有恶意审核等行为，欢迎您对该需求方进行举报。</p>
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
      <Table columns={columns} loading={refreshing || loading} dataSource={taskLists} />
    </>
  );
};

export default LabelerTaskList;
