import {
  FaceTagProblem,
  ImageFramePromblem,
  ImagesClassificationProblem,
  TagProblem,
  TaskInfo,
} from "@/const/interface";
import {
  Form,
  message,
  Input,
  Radio,
  InputNumber,
  DatePicker,
  Row,
  Col,
  Button,
  Divider,
  ConfigProvider,
  UploadFile,
  Image,
} from "antd";
import dayjs from "dayjs";
import React, { useMemo, useState } from "react";
import locale from "antd/locale/zh_CN";
import {
  FaceTagDataForm,
  ImageFrameDataForm,
  ImagesClassificationDataForm,
  SoundTagDataForm,
  TextClassificationDataForm,
  VideoTagDataForm,
} from "./task-data-form";
import { randomUUID } from "crypto";
import type { RcFile } from "antd/es/upload";
import { Modal } from "antd/lib";
import axios from "axios";

const getBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

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
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [form] = Form.useForm<TaskInfo>();
  const initialValues: TaskInfo | undefined = useMemo(() => {
    if (props.taskInfo === undefined) return undefined;
    const value = { ...props.taskInfo };
    value.deadline = dayjs(value.deadline) as any;
    if (value.template === "ImagesClassification")
      (value.task_data as ImagesClassificationProblem[]).map((v) => ({
        ...v,
        options: v.options.map(
          (url): UploadFile => ({
            uid: randomUUID(),
            name: url.substring(url.lastIndexOf("/")),
            status: "done",
            url: url,
          })
        ),
      }));
    if (
      value.template === "ImageFrame" ||
      value.template === "FaceTag" ||
      value.template === "SoundTag" ||
      value.template === "VideoTag"
    )
      (value.task_data as ImageFramePromblem[]).map((v) => ({
        ...v,
        url: [
          {
            uid: randomUUID(),
            name: v.url.substring(v.url.lastIndexOf("/")),
            status: "done",
            url: v.url,
          },
        ] as UploadFile[],
      }));
    return value;
  }, [props.taskInfo]);
  if (props.taskInfo !== undefined) {
    form.setFieldsValue(props.taskInfo);
    form.setFieldValue("deadline", dayjs(props.taskInfo.deadline));
  }

  const onFinish = () => {
    setLoading(true);
    const value = form.getFieldsValue();
    console.log(value);
    const deadline = (value.deadline as unknown as dayjs.Dayjs).valueOf();
    let task_data: typeof value.task_data;
    switch (value.template) {
      case "ImagesClassification": {
        task_data = (value.task_data as ImagesClassificationProblem[]).map((v) => ({
          ...v,
          options: v.options.map((x: any) => x?.response?.url),
        }));
        break;
      }
      case "FaceTag": {
        task_data = (value.task_data as FaceTagProblem[]).map((v) => ({
          ...v,
          url: (v.url[0] as any)?.response?.url,
        }));
        break;
      }
      case "ImageFrame": {
        task_data = (value.task_data as ImageFramePromblem[]).map((v) => ({
          ...v,
          url: (v.url[0] as any)?.response?.url,
        }));
        break;
      }
      case "TextClassification": {
        task_data = value.task_data;
        break;
      }
      case "SoundTag": {
        task_data = (value.task_data as TagProblem[]).map((v) => ({
          ...v,
          url: (v.url[0] as any)?.response?.url,
        }));
        break;
      }
      case "VideoTag": {
        task_data = (value.task_data as TagProblem[]).map((v) => ({
          ...v,
          url: (v.url[0] as any)?.response?.url,
        }));
        break;
      }
    }
    props.onFinish({ ...value, deadline, task_data });
    setLoading(false);
  };

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as RcFile);
    }
    if (file.url && !file.preview) {
      file.preview = await getBase64(
        (
          (
            await axios.get("/api/file", {
              responseType: "arraybuffer",
              params: { url: file.url },
              headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            })
          ).data as FormData
        ).get("file") as File
      );
    }
    setPreviewImage(file.url || (file.preview as string));
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
        initialValues={initialValues}
      >
        <Form.Item
          label="任务标题"
          name="title"
          rules={[{ required: true, message: "请输入任务标题" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="任务模板"
          name="template"
          rules={[{ required: true, message: "请选择任务模板" }]}
        >
          <Radio.Group
            size="small"
            onChange={(_) => {
              form.setFieldsValue({ ...form.getFieldsValue(), task_data: [] });
            }}
          >
            <Radio.Button value="TextClassification">文字分类</Radio.Button>
            <Radio.Button value="ImagesClassification">图片分类</Radio.Button>
            <Radio.Button value="FaceTag">人脸骨骼打点</Radio.Button>
            <Radio.Button value="ImageFrame">图片框选</Radio.Button>
            <Radio.Button value="SoundTag">语音标注</Radio.Button>
            <Radio.Button value="VideoTag">视频标注</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          label="任务奖励"
          name="reward"
          rules={[{ required: true, message: "请输入任务奖励" }]}
        >
          <InputNumber min={0} />
        </Form.Item>
        <Form.Item
          label="标注方人数"
          name="labeler_number"
          rules={[{ required: true, message: "请输入标注方人数" }]}
        >
          <InputNumber min={0} />
        </Form.Item>
        <Form.Item
          label="单题限时"
          name="time"
          rules={[{ required: true, message: "请输入单题限时" }]}
        >
          <InputNumber min={0} addonAfter="秒" />
        </Form.Item>
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
        <Form.Item label="任务数据" rules={[{ required: true, message: "请输入任务数据" }]}>
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
                  </div>
                ))}
              </>
            )}
          </Form.List>
        </Form.Item>
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
