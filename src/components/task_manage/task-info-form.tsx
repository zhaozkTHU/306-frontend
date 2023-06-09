import { ImagesClassificationProblem, TagProblem, TaskInfo } from "@/const/interface";
import {
  Form,
  message,
  Input,
  InputNumber,
  DatePicker,
  Row,
  Col,
  Button,
  Divider,
  ConfigProvider,
  Image,
  Space,
  Select,
  Alert,
  Upload,
  Switch,
  Radio,
  Collapse,
  Tooltip,
} from "antd";
import type { UploadFile, SelectProps } from "antd";
import dayjs from "dayjs";
import React, { useState, useEffect } from "react";
import locale from "antd/locale/zh_CN";
import {
  FaceTagDataForm,
  FileReviewDataForm,
  ImageFrameDataForm,
  ImagesClassificationDataForm,
  SoundTagDataForm,
  TextClassificationDataForm,
  TextReviewDataForm,
  VideoTagDataForm,
} from "./task-data-form";
import { DeleteOutlined, InboxOutlined, VerticalAlignBottomOutlined } from "@ant-design/icons";
import type { RcFile } from "antd/es/upload";
import { Modal } from "antd/lib";
import axios from "axios";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { clear } from "./deleteList";
import { HelpOutline } from "@mui/icons-material";

const getBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const downloadTemplate = (type: TaskInfo["template"]) => {
  console.log(type);
  if (type === undefined) {
    message.error("请先选择模板");
    return;
  }
  const link = document.createElement("a");
  link.href = `/template/${type}.xlsx`;
  link.download = `${type}.xlsx`;
  link.click();
};

const selectOptions: SelectProps<TaskInfo["template"]>["options"] = [
  { value: "TextClassification", label: "文字分类" },
  { value: "ImagesClassification", label: "图片分类" },
  { value: "FaceTag", label: "人脸骨骼打点" },
  { value: "ImageFrame", label: "图片框选" },
  { value: "SoundTag", label: "语音标注" },
  { value: "VideoTag", label: "视频标注" },
  { value: "Custom", label: "自定义组合模板(仅支持批量上传)" },
  { value: "TextTriple", label: "文字三元组" },
  {
    label: "审核",
    options: [
      { label: "文字审核", value: "TextReview" },
      { label: "图片审核", value: "ImageReview" },
      { label: "视频审核", value: "VideoReview" },
      { label: "音频审核", value: "AudioReview" },
    ],
  },
];

export interface TaskInfoFormProps {
  taskInfo?: TaskInfo;
  onFinish: (info: TaskInfo) => Promise<void>;
}

/**
 * 任务信息表单组件
 * @param props.taskInfo 任务信息
 * @param props.onFinish 表单提交时的回调函数
 * @returns 任务信息表单组件
 * @private
 */
const TaskInfoForm: React.FC<TaskInfoFormProps> = (props) => {
  const deleteList = useAppSelector((state) => state.deleteList.value);
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [agentList, setAgentList] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [infoModal, setInfoModal] = useState(false);
  const [form] = Form.useForm<TaskInfo>();
  const batch = Form.useWatch("batch", form);
  const template = Form.useWatch("template", form);
  const distribute = Form.useWatch("distribute", form);

  useEffect(() => {
    form.setFieldValue("task_data", undefined);
  }, [batch, form]);

  useEffect(() => {
    form.setFieldValue("distribute_type", undefined);
    form.setFieldValue("agent_username", undefined);
  }, [distribute, form]);

  useEffect(() => {
    axios
      .get("/api/get_agent", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((value) => setAgentList(value.data.data))
      .catch((reason) => message.error(`获取中介失败 ${reason.message}`));
  }, []);

  useEffect(() => {
    if (props.taskInfo) {
      form.setFieldsValue({
        ...props.taskInfo,
        deadline: dayjs(props.taskInfo.deadline) as any,
        batch_file: props.taskInfo.batch_file
          ? ([
            {
              uid: 1,
              name: props.taskInfo.batch_file,
              status: "done",
              url: props.taskInfo.batch_file,
            },
          ] as any)
          : undefined,
      });
    }
  }, [props.taskInfo, form]);

  const onFinish = () => {
    setLoading(true);
    const value = form.getFieldsValue();
    console.log(value);
    const deadline = (value.deadline as unknown as dayjs.Dayjs).valueOf();
    let task_data: typeof value.task_data = [];
    if (batch) {
      // task_data = (value.task_data as unknown as UploadFile[])[0]?.response?.url;
      value.batch_file = (value.batch_file as unknown as UploadFile[])[0]?.response?.url;
    } else if (value.template === "TextClassification") {
      task_data = value.task_data;
    } else if (value.template === "ImagesClassification") {
      task_data = (value.task_data as ImagesClassificationProblem[]).map((v) => ({
        ...v,
        options: v.options.map((x: any) => x?.response?.url),
      }));
    } else if (
      value.template === "ImageFrame" ||
      value.template === "FaceTag" ||
      value.template === "SoundTag" ||
      value.template === "VideoTag"
    ) {
      task_data = (value.task_data as TagProblem[]).map((v) => ({
        ...v,
        url: (v.url[0] as any)?.response?.url,
      }));
    }
    props
      .onFinish({ ...value, deadline, task_data, batch })
      .then(() => {
        deleteList.forEach((url) => {
          axios.delete("/api/file", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            params: { url },
          });
        });
        dispatch(clear());
        form.resetFields();
      })
      .finally(() => setLoading(false));
  };

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

  return (
    <ConfigProvider locale={locale}>
      <Modal
        open={previewOpen}
        title={previewTitle}
        footer={null}
        onCancel={() => setPreviewOpen(false)}
      >
        <Image alt="image" style={{ width: "100%" }} src={previewImage} />
      </Modal>
      <Form
        form={form}
        onFinishFailed={() => {
          message.error("请检查表单是否填写完整");
        }}
        onFinish={onFinish}
      >
        {/* <Row>
          <Col span={12}> */}
            <Form.Item
              label="任务标题"
              name="title"
              rules={[{ required: true, message: "请输入任务标题" }]}
            >
              <Input />
            </Form.Item>
          {/* </Col>
        </Row> */}
        {/* <Row> */}
          {/* <Col span={6}> */}
            <Form.Item
              label="任务模板"
              name="template"
              rules={[{ required: true, message: "请选择任务模板" }]}
            >
              <Select
                onChange={(v) => {
                  form.setFieldValue("task_data", []);
                }}
                options={selectOptions}
              />
            </Form.Item>
          {/* </Col> */}
          {/* <Col span={6}> */}
            <Form.Item
              label="任务内容分类标签"
              name="type"
              rules={[{ required: true, message: "请选择任务内容分类标签" }]}
            >
              <Select
                options={[
                  { value: "sentiment", label: "情感分类、分析" },
                  { value: "part-of-speech", label: "词性分类" },
                  { value: "intent", label: "意图揣测" },
                  { value: "event", label: "事件概括" },
                ]}
              />
            </Form.Item>
          {/* </Col> */}
        {/* </Row> */}
        {/* <Row> */}
          {/* <Col span={4}> */}
            <Form.Item
              label="任务奖励"
              name="reward"
              rules={[{ required: true, message: "请输入任务奖励" }]}
            >
              <InputNumber min={0} />
            </Form.Item>
          {/* </Col> */}
          {/* <Col span={4}> */}
            <Form.Item
              label="标注方人数"
              name="labeler_number"
              rules={[{ required: true, message: "请输入标注方人数" }]}
            >
              <InputNumber min={0} />
            </Form.Item>
          {/* </Col>
          <Col span={4}> */}
            <Form.Item
              label="单题限时"
              name="time"
              rules={[{ required: true, message: "请输入单题限时" }]}
            >
              <InputNumber min={0} addonAfter="秒" />
            </Form.Item>
          {/* </Col>
        </Row> */}
        <Form.Item
          label="分发方式"
          name="distribute"
          rules={[{ required: true, message: "请选择分发方式" }]}
        >
          <Radio.Group>
            <Radio.Button value="system">系统分发</Radio.Button>
            <Radio.Button value="agent">中介分发</Radio.Button>
          </Radio.Group>
        </Form.Item>
        {distribute === "system" && (
          <Form.Item
            label="系统分发方式"
            name="distribute_type"
            rules={[{ required: true, message: "请选择系统分发方式" }]}
          >
            <Radio.Group>
              <Radio.Button value="order">顺序分发</Radio.Button>
              <Radio.Button value="smart">智能分发</Radio.Button>
            </Radio.Group>
          </Form.Item>
        )}
        {distribute === "agent" && (
          <Form.Item
            label="分发中介名"
            name="agent_username"
            rules={[{ required: true, message: "请输入分发中介名" }]}
          >
            <Select
              options={agentList.map((agent) => ({ value: agent.username, label: agent.username }))}
            />
          </Form.Item>
        )}
        {/* <Row> */}
          <Space>
            {/* <Col> */}
              <Form.Item
                label="任务截止时间"
                name="deadline"
                rules={[{ required: true, message: "请选择任务截止时间" }]}
              >
                <DatePicker
                  locale={locale.DatePicker}
                  inputReadOnly
                  showTime
                  disabledDate={(date) => date.valueOf() < dayjs().valueOf()}
                />
              </Form.Item>
            {/* </Col> */}
            {/* <Col> */}
              <Form.Item
                label="是否使用批量上传"
                name="batch"
                initialValue={true}
                rules={[{ required: true, message: "" }]}
              >
                <Switch defaultChecked disabled />
              </Form.Item>
            {/* </Col> */}
          </Space>
        {/* </Row> */}
        {!batch && (
          <Form.List name="task_data">
            {(dataFields, { add: dataAdd, remove: dataRemove }) => (
              <>
                <Button
                  onClick={() => dataAdd()}
                  type="primary"
                  disabled={form.getFieldValue("template") === undefined}
                >
                  添加题目
                </Button>
                {dataFields.map((dataField, index) => (
                  <div key={index}>
                    <Divider orientation="left">{`题目${index + 1}`}</Divider>
                    <Row>
                      <Col>
                        <Form.Item
                          key={dataField.key}
                          name={[dataField.name, "description"]}
                          rules={[{ required: true, message: "请输入描述" }]}
                        >
                          <Input addonBefore="题目描述" />
                        </Form.Item>
                      </Col>
                      <Col>
                        <Button onClick={() => dataRemove(index)} type="primary" danger>
                          删除题目
                        </Button>
                      </Col>
                    </Row>
                    {template === "TextClassification" && TextClassificationDataForm(dataField)}
                    {template === "ImagesClassification" &&
                      ImagesClassificationDataForm(dataField, handlePreview)}
                    {template === "FaceTag" && FaceTagDataForm(dataField)}
                    {template === "ImageFrame" && ImageFrameDataForm(dataField)}
                    {template === "SoundTag" && SoundTagDataForm(dataField)}
                    {template === "VideoTag" && VideoTagDataForm(dataField)}
                    {template === "TextReview" && TextReviewDataForm(dataField)}
                    {(template === "ImageReview" ||
                      template === "VideoReview" ||
                      template === "AudioReview") &&
                      FileReviewDataForm(dataField, template.substring(0, 5).toLowerCase())}
                  </div>
                ))}
              </>
            )}
          </Form.List>
        )}
        {batch && (
          <>
            <Modal open={infoModal} footer={<Button onClick={() => setInfoModal(false)}>确认</Button>}>
              下载文件后，请不要修改excel文件的页的名字以及excel文件名，填入题目时，请不要出现空行。在上传时
              ，请将所有相关文件打包成一个zip文件，文件名只能包含字母数字和下划线。<br />
              请不要修改所有的sheet名或文件名，如果为自定义模板，直接删除不需要的sheet即可。
            </Modal>
            <Row>
              <Col span={12}>
                <Alert
                  message={
                    <>
                      请
                      <Button
                        type="link"
                        onClick={() => downloadTemplate(template)}
                      >
                        下载
                      </Button>
                      模板并按规范提交
                    </>
                  }
                  type="info"
                  showIcon
                />
              </Col>
              <Tooltip title="提交规范及模板使用方法">
                <Button
                  type="text"
                  size="small"
                  onClick={() => setInfoModal(true)}
                  icon={<HelpOutline />}
                />
              </Tooltip>
            </Row>
            <br />
            <Row>
              <Col span={12}>
                <Form.Item
                  label="上传压缩包"
                  name="batch_file"
                  valuePropName="fileList"
                  getValueFromEvent={(e) => e?.fileList}
                  rules={[{ required: true, message: "请上传压缩包" }]}
                >
                  <Upload.Dragger
                    action="/api/file"
                    headers={{ Authorization: `Bearer ${localStorage.getItem("token")}` }}
                    maxCount={1}
                    beforeUpload={() => {
                      setUploading(true);
                      return true;
                    }}
                    onChange={(info) => {
                      if (info.file.status === "done") {
                        setUploading(false);
                        message.success("上传成功");
                      } else if (info.file.status === "error") {
                        setUploading(false);
                        message.error("上传失败");
                      }
                    }}
                    onDownload={async (file) => {
                      const downloadFile = (
                        await axios.get("/api/file", {
                          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                          params: { url: file.url || file.response.url },
                        })
                      ).data;
                      const url = window.URL.createObjectURL(new Blob([downloadFile]));
                      const link = document.createElement("a");
                      link.style.display = "none";
                      link.href = url;
                      link.setAttribute("download", file.name);
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    showUploadList={{
                      showDownloadIcon: true,
                      downloadIcon: <VerticalAlignBottomOutlined />,
                      showRemoveIcon: true,
                      removeIcon: <DeleteOutlined />,
                    }}
                  >
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">点击或拖拽上传</p>
                  </Upload.Dragger>
                </Form.Item>
              </Col>
            </Row>
          </>
        )}
        <Button
          disabled={uploading}
          type="primary"
          loading={loading}
          onClick={() => {
            form.submit();
          }}
        >
          submit
        </Button>
      </Form>
    </ConfigProvider>
  );
};

export default TaskInfoForm;
