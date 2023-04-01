import { TaskInfo } from "@/const/interface";
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
  Upload,
  UploadProps,
  UploadFile,
} from "antd";
import ConfigProvider from "antd/lib/config-provider";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import locale from "antd/locale/zh_CN";
import axios from "axios";
import { UploadOutlined } from "@ant-design/icons";

interface FileUploaderProps {
  urls: string[];
  onUrlListChange: (newUrlList: string[]) => void;
}

/**
 * @todo
 */
const FileUploader: React.FC<FileUploaderProps> = (props) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    const initFileList: UploadFile[] = props.urls.map((url, index) => ({
      uid: `-${index + 1}`,
      name: url.substring(url.lastIndexOf("/") + 1),
      status: "done",
      url,
    }));
    setFileList(initFileList);
  }, [props.urls]);

  const handleUpload = async ({ file }: any) => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await axios.post("/api/image", formData);
    const newFileList: UploadFile[] = [
      ...fileList,
      {
        uid: file.uid,
        name: file.name,
        status: "done",
        url: data.url,
      },
    ];
    const newUrlList: string[] = [...props.urls, data.url];
    setFileList(newFileList);
    props.onUrlListChange(newUrlList);
  };

  const handleRemove = async ({ url }: UploadFile) => {
    const { data } = await axios.post("/api/delete", { url });
    const newFileList: UploadFile[] = fileList.filter(
      (value) => value.url !== url
    );
    const newUrlList: string[] = props.urls.filter(
      (value) => value !== data.url
    );
    setFileList(newFileList);
    props.onUrlListChange(newUrlList);
  };

  const uploadProps: UploadProps = {
    action: "/api/image",
    fileList,
    beforeUpload: (file) => {
      handleUpload({ file });
      return false;
    },
    onRemove: (file: UploadFile) => {
      handleRemove({ url: file.url } as UploadFile);
    },
  };

  return (
    <Upload {...uploadProps}>
      <Button icon={<UploadOutlined />} type="primary">
        提交文件
      </Button>
    </Upload>
  );
};

// task_manage内部使用
const TaskInfoForm: React.FC<{
  taskInfo?: TaskInfo;
  onFinish: (info: TaskInfo) => void;
}> = (props) => {
  const [form] = Form.useForm<TaskInfo>();

  const [template, setTemplate] = useState<TaskInfo["template"] | undefined>();

  const onFinish = () => {
    const value = form.getFieldsValue();
    const deadline = (value.deadline as unknown as dayjs.Dayjs).valueOf();
    props.onFinish({ ...value, deadline: deadline });
  };

  return (
    <ConfigProvider locale={locale}>
      <Form
        form={form}
        onFinishFailed={() => {
          message.error("请检查表单是否填写完整");
        }}
        onFinish={onFinish}
        initialValues={
          props.taskInfo && {
            ...props.taskInfo,
            deadline: dayjs(props.taskInfo?.deadline),
          }
        }
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
            onChange={(e) => {
              form.setFieldsValue({ ...form.getFieldsValue(), task_data: [] });
              setTemplate(e.target.value);
            }}
          >
            <Radio value="TextClassification">文字分类</Radio>
            <Radio value="ImagesClassification">图片分类</Radio>
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
        <Form.Item
          label="任务数据"
          rules={[{ required: true, message: "请输入任务数据" }]}
        >
          <Form.List name="task_data">
            {(dataFields, { add: dataAdd, remove: dataRemove }) => {
              if (template === "TextClassification")
                return (
                  <>
                    <Button onClick={() => dataAdd()} type="primary">
                      添加题目
                    </Button>
                    {dataFields.map((dataField, index) => (
                      <div key={index}>
                        <Divider orientation="left">{`题目${
                          index + 1
                        }`}</Divider>
                        <Row>
                          <Col>
                            <Form.Item
                              key={dataField.key}
                              name={[dataField.name, "description"]}
                              rules={[
                                { required: true, message: "请输入描述" },
                              ]}
                            >
                              <Input addonBefore="题目描述" />
                            </Form.Item>
                          </Col>
                          <Col>
                            <Button
                              onClick={() => dataRemove(index)}
                              type="primary"
                              danger
                            >
                              删除题目
                            </Button>
                          </Col>
                        </Row>
                        <Form.List name={[dataField.name, "options"]}>
                          {(optFields, { add: optAdd, remove: optRemove }) => {
                            return (
                              <>
                                <Button onClick={() => optAdd()}>
                                  添加选项
                                </Button>
                                {optFields.map((optField, optIndex) => (
                                  <div key={optIndex}>
                                    <Row>
                                      <Col>
                                        <Form.Item
                                          {...optField}
                                          rules={[
                                            {
                                              required: true,
                                              message: "请输入选项",
                                            },
                                          ]}
                                        >
                                          <Input
                                            addonBefore={`选项${optIndex + 1}`}
                                          />
                                        </Form.Item>
                                      </Col>
                                      <Col>
                                        <Button
                                          onClick={() => optRemove(optIndex)}
                                          danger
                                        >
                                          -
                                        </Button>
                                      </Col>
                                    </Row>
                                  </div>
                                ))}
                              </>
                            );
                          }}
                        </Form.List>
                      </div>
                    ))}
                  </>
                );
              else if (template === "ImagesClassification")
                return (
                  <>
                    <Button onClick={() => dataAdd()} type="primary">
                      添加题目
                    </Button>
                    {dataFields.map((dataField, index) => (
                      <div key={index}>
                        <Divider orientation="left">{`题目${
                          index + 1
                        }`}</Divider>
                        <Row>
                          <Col>
                            <Form.Item
                              key={dataField.key}
                              name={[dataField.name, "description"]}
                              rules={[
                                { required: true, message: "请输入描述" },
                              ]}
                            >
                              <Input addonBefore="题目描述" />
                            </Form.Item>
                          </Col>
                          <Col>
                            <Button
                              onClick={() => dataRemove(index)}
                              type="primary"
                              danger
                            >
                              删除题目
                            </Button>
                          </Col>
                        </Row>
                        <FileUploader
                          urls={form.getFieldValue([
                            "task_data",
                            index,
                            "options",
                          ])}
                          onUrlListChange={(newUrlList) => {
                            form.setFieldValue(
                              ["task_data", index, "options"],
                              newUrlList
                            );
                          }}
                        />
                      </div>
                    ))}
                  </>
                );
            }}
          </Form.List>
        </Form.Item>
        <Button
          type="primary"
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
