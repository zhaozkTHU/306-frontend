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
import { UploadOutlined } from "@ant-design/icons";
import type { RcFile } from "antd/es/upload";
import { Modal } from "antd/lib";
import axios from "axios";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { clear } from "./deleteList";

const getBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const downloadTemplate = (type: TaskInfo["template"], templates: TaskInfo["templates"]) => {
  if (type === undefined) {
    message.error("请先选择模板");
    return;
  }
  templates?.forEach((value) => {
    const link = document.createElement("a");
    link.href = `/template/${value}.xlsx`;
    link.download = `${value}.xlsx`;
    link.click();
  });
  const link = document.createElement("a");
  link.href = `/template/${type}.xlsx`;
  link.download = `${type}.xlsx`;
  link.click();
};

const selectOptions: SelectProps["options"] = [
  { value: "TextClassification", label: "文字分类" },
  { value: "ImagesClassification", label: "图片分类" },
  { value: "FaceTag", label: "人脸骨骼打点" },
  { value: "ImageFrame", label: "图片框选" },
  { value: "SoundTag", label: "语音标注" },
  { value: "VideoTag", label: "视频标注" },
  { value: "Custom", label: "自定义组合模板(仅支持批量上传)" },
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

/**
 * 任务信息表单组件
 * @param props.taskInfo 任务信息
 * @param props.onFinish 表单提交时的回调函数
 * @returns 任务信息表单组件
 * @private
 */
const TaskInfoForm: React.FC<{
  taskInfo?: TaskInfo;
  onFinish: (info: TaskInfo) => void;
}> = (props) => {
  const deleteList = useAppSelector((state) => state.deleteList.value);
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [agentList, setAgentList] = useState<string[]>([]);
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
    axios.get("/api/get_agent", {headers: {Authorization: `Bearer ${localStorage.getItem("token")}`}})
      .then((value) => setAgentList(value.data.data))
      .catch((reason) => message.error(`获取中介失败 ${reason.message}`));
  }, []);

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
    props.onFinish({ ...value, deadline, task_data, batch });
    deleteList.forEach((url) => {
      axios.delete("/api/file", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        params: { url },
      });
    });
    dispatch(clear());
    setLoading(false);
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
        <Row>
          <Col span={6}>
            <Form.Item
              label="任务标题"
              name="title"
              rules={[{ required: true, message: "请输入任务标题" }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="任务模板"
              name="template"
              rules={[{ required: true, message: "请选择任务模板" }]}
            >
              <Select
                onChange={(v) => {
                  form.setFieldValue("task_data", []);
                  console.log(v);
                  console.log(form.getFieldsValue());
                }}
                options={selectOptions}
              />
            </Form.Item>
          </Col>
        </Row>
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
        <Row>
          <Col span={4}>
            <Form.Item
              label="任务奖励"
              name="reward"
              rules={[{ required: true, message: "请输入任务奖励" }]}
            >
              <InputNumber min={0} />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item
              label="标注方人数"
              name="labeler_number"
              rules={[{ required: true, message: "请输入标注方人数" }]}
            >
              <InputNumber min={0} />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item
              label="单题限时"
              name="time"
              rules={[{ required: true, message: "请输入单题限时" }]}
            >
              <InputNumber min={0} addonAfter="秒" />
            </Form.Item>
          </Col>
        </Row>
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
            <Select options={agentList.map((name) => ({value: name, label: name}))} />
          </Form.Item>
        )}
        <Row>
          <Space>
            <Col>
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
            </Col>
            <Col>
              <Form.Item
                label="是否使用批量上传"
                name="batch"
                initialValue={false}
                rules={[{ required: true, message: "" }]}
              >
                <Switch />
              </Form.Item>
            </Col>
          </Space>
        </Row>
        {template === "Custom" && (
          <Form.Item
            label="模板组合"
            name="templates"
            rules={[{ required: true, message: "请选择模板组合" }]}
          >
            <Select
              mode="multiple"
              allowClear
              placeholder="选择模板组合"
              options={selectOptions}
              onChange={(v) => console.log(v)}
            />
          </Form.Item>
        )}
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
            <Alert
              message={
                <>
                  请
                  <Button
                    type="link"
                    onClick={() => downloadTemplate(template, form.getFieldValue("templates"))}
                  >
                    下载
                  </Button>
                  模板并按规范提交
                </>
              }
              type="info"
              showIcon
            />
            <br />
            <Form.Item
              label="上传压缩包"
              name="batch_file"
              valuePropName="fileList"
              getValueFromEvent={(e) => e?.fileList}
              rules={[{ required: true, message: "请上传压缩包" }]}
            >
              <Upload
                action="/api/file"
                headers={{ Authorization: `Bearer ${localStorage.getItem("token")}` }}
                maxCount={1}
              >
                <Button icon={<UploadOutlined />}>上传压缩包</Button>
              </Upload>
            </Form.Item>
          </>
        )}
        <Button
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
