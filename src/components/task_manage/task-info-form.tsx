import {
  ImageFrameProblem,
  ImagesClassificationProblem,
  TagProblem,
  TaskInfo,
} from "@/const/interface";
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
  UploadFile,
  Image,
  Select,
  Alert,
  Upload,
} from "antd";
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
import { ExclamationCircleFilled, UploadOutlined } from "@ant-design/icons";
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

const downloadTemplate = (type: TaskInfo["template"]) => {
  if (type === undefined) {
    message.error("请先选择模板");
    return;
  }
  const link = document.createElement("a");
  link.href = `/template/${type}.xlsx`;
  link.download = `${type}.xlsx`;
  link.click();
};

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
  const [form] = Form.useForm<TaskInfo>();
  const [batch, setBatch] = useState<boolean>(false);

  // init form if props.taskInfo exists
  // useEffect(() => {
  //   if (props.taskInfo === undefined) return;
  //   const value = { ...props.taskInfo };
  //   value.deadline = dayjs(value.deadline) as any;
  //   if (value.template === "ImagesClassification") {
  //     console.log("old", value.task_data);
  //     value.task_data = (value.task_data as ImagesClassificationProblem[]).map((v) => ({
  //       ...v,
  //       options: v.options.map(
  //         (url): UploadFile => ({
  //           uid: crypto.randomUUID(),
  //           name: url.substring(url.lastIndexOf("/")),
  //           status: "done",
  //           url: url,
  //         })
  //       ),
  //     })) as any;
  //     console.log("new", value.task_data);
  //   }
  //   if (
  //     value.template === "ImageFrame" ||
  //     value.template === "FaceTag" ||
  //     value.template === "SoundTag" ||
  //     value.template === "VideoTag"
  //   )
  //     (value.task_data as ImageFrameProblem[]).map((v) => ({
  //       ...v,
  //       url: [
  //         {
  //           uid: crypto.randomUUID(),
  //           name: v.url.substring(v.url.lastIndexOf("/")),
  //           status: "done",
  //           url: v.url,
  //         },
  //       ] as UploadFile[],
  //     }));
  //   console.log(value);
  //   form.setFieldsValue(value);
  // }, [form, props.taskInfo]);

  useEffect(() => {
    Modal.confirm({
      title: "是否使用批量上传",
      icon: <ExclamationCircleFilled />,
      onOk() {
        setBatch(true);
      },
      onCancel() {
        setBatch(false);
      },
    });
  }, []);

  const onFinish = () => {
    setLoading(true);
    const value = form.getFieldsValue();
    console.log(value);
    const deadline = (value.deadline as unknown as dayjs.Dayjs).valueOf();
    let task_data: typeof value.task_data = [];
    if (batch) {
      task_data = (value.task_data as unknown as UploadFile[])[0]?.response?.url;
    }
    else if (value.template === "TextClassification") {
      task_data = value.task_data;
    }
    else if (value.template === "ImagesClassification") {
      task_data = (value.task_data as ImagesClassificationProblem[]).map((v) => ({
        ...v,
        options: v.options.map((x: any) => x?.response?.url),
      }));
    }
    else if (
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
                onChange={() => form.setFieldValue("task_data", [])}
                options={[
                  { value: "TextClassification", label: "文字分类" },
                  { value: "ImagesClassification", label: "图片分类" },
                  { value: "FaceTag", label: "人脸骨骼打点" },
                  { value: "ImageFrame", label: "图片框选" },
                  { value: "SoundTag", label: "语音标注" },
                  { value: "VideoTag", label: "视频标注" },
                  {
                    label: "审核",
                    options: [
                      { label: "文字审核", value: "TextReview" },
                      { label: "图片审核", value: "ImageReview" },
                      { label: "视频审核", value: "VideoReview" },
                      { label: "音频审核", value: "AudioReview" },
                    ],
                  },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>
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
                    {form.getFieldValue("template") === "TextClassification" &&
                      TextClassificationDataForm(dataField)}
                    {form.getFieldValue("template") === "ImagesClassification" &&
                      ImagesClassificationDataForm(dataField, handlePreview)}
                    {form.getFieldValue("template") === "FaceTag" && FaceTagDataForm(dataField)}
                    {form.getFieldValue("template") === "ImageFrame" &&
                      ImageFrameDataForm(dataField)}
                    {form.getFieldValue("template") === "SoundTag" && SoundTagDataForm(dataField)}
                    {form.getFieldValue("template") === "VideoTag" && VideoTagDataForm(dataField)}
                    {form.getFieldValue("template") === "TextReview" &&
                      TextReviewDataForm(dataField)}
                    {(form.getFieldValue("template") === "ImageReview" ||
                      form.getFieldValue("template") === "VideoReview" ||
                      form.getFieldValue("template") === "AudioReview") &&
                      FileReviewDataForm(
                        dataField,
                        (form.getFieldValue("template") as string).substring(0, 5).toLowerCase()
                      )}
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
                    onClick={() => downloadTemplate(form.getFieldValue("template"))}
                  >
                    下载
                  </Button>
                  模板并按规范提交
                </>
              }
              type="info"
              showIcon
            />
            <Form.Item
              label="上传压缩包"
              name="task_data"
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
