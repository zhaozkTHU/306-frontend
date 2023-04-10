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
  ConfigProvider,
  Switch,
} from "antd";
import dayjs from "dayjs";
import React from "react";
import locale from "antd/locale/zh_CN";
import FileUploader from "./FileUploader";

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
  const [form] = Form.useForm<TaskInfo>();
  if (props.taskInfo !== undefined) {
    form.setFieldsValue(props.taskInfo);
    form.setFieldValue("deadline", dayjs(props.taskInfo.deadline));
  }

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
          props.taskInfo
            ? { ...props.taskInfo, deadline: dayjs(props.taskInfo.deadline) }
            : undefined
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
                    {form.getFieldValue("template") === "TextClassification" && (
                      <Form.List name={[dataField.name, "options"]}>
                        {(optFields, { add: optAdd, remove: optRemove }) => (
                          <>
                            <Button onClick={() => optAdd()}>添加选项</Button>
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
                                      <Input addonBefore={`选项${optIndex + 1}`} />
                                    </Form.Item>
                                  </Col>
                                  <Col>
                                    <Button onClick={() => optRemove(optIndex)} danger>
                                      -
                                    </Button>
                                  </Col>
                                </Row>
                              </div>
                            ))}
                          </>
                        )}
                      </Form.List>
                    )}
                    {form.getFieldValue("template") === "ImagesClassification" && (
                      <FileUploader
                        urls={form.getFieldValue([dataField.name, "options"]) ?? []}
                        onUrlListChange={(newUrlList) => {
                          form.setFieldValue([dataField.name, "options"], newUrlList);
                        }}
                        accept="image/{jpg,png,jpeg}"
                        multiple
                      />
                    )}
                    {form.getFieldValue("template") === "FaceTag" && (
                      <FileUploader
                        urls={[form.getFieldValue([dataField.name, "faceImageUrl"])]}
                        onUrlListChange={(newUrlList) => {
                          form.setFieldValue([dataField.name, "faceImageUrl"], newUrlList[0]);
                        }}
                        accept="image/{jpg,png,jpeg}"
                      />
                    )}
                    {form.getFieldValue("template") === "ImageFrame" && (
                      <FileUploader
                        urls={[form.getFieldValue([dataField.name, "imageUrl"])]}
                        onUrlListChange={(newUrlList) => {
                          form.setFieldValue([dataField.name, "faceImageUrl"], newUrlList[0]);
                        }}
                        accept="image/{jpg,png,jpeg}"
                      />
                    )}
                    {form.getFieldValue("template") === "SoundTag" && (
                      <>
                        <FileUploader
                          urls={[form.getFieldValue([dataField.name, "soundUrl"])]}
                          onUrlListChange={(newUrlList) => {
                            form.setFieldValue([dataField.name, "soundUrl"], newUrlList[0]);
                          }}
                          accept="audio/{mp3,wav}"
                        />
                        <Form.List name={[dataField.name, "choice"]}>
                          {(optFields, { add: optAdd, remove: optRemove }) => (
                            <>
                              <Button onClick={() => optAdd()}>添加选项</Button>
                              {optFields.map((optField, choiceIndex) => (
                                <div key={choiceIndex}>
                                  <Row>
                                    <Col>
                                      <Form.Item
                                        name={[optField.name, "text"]}
                                        key={optField.key}
                                        rules={[{ required: true, message: "请输入文字描述" }]}
                                      >
                                        <Input />
                                      </Form.Item>
                                    </Col>
                                    <Col>
                                      <Form.Item
                                        name={[optField.name, "needInput"]}
                                        key={optField.key}
                                        rules={[
                                          { required: true, message: "请选择是否需要标注方输入" },
                                        ]}
                                      >
                                        <Switch
                                          checkedChildren="需要用户输入"
                                          unCheckedChildren="不需用户输入"
                                        />
                                      </Form.Item>
                                    </Col>
                                    <Col>
                                      <Button onClick={() => optRemove(choiceIndex)} danger>
                                        -
                                      </Button>
                                    </Col>
                                  </Row>
                                </div>
                              ))}
                            </>
                          )}
                        </Form.List>
                      </>
                    )}
                    {form.getFieldValue("template") === "VideoTag" && (
                      <>
                        <FileUploader
                          urls={[form.getFieldValue([dataField.name, "soundUrl"])]}
                          onUrlListChange={(newUrlList) => {
                            form.setFieldValue([dataField.name, "soundUrl"], newUrlList[0]);
                          }}
                          accept="video/{mp4}"
                        />
                        <Form.List name={[dataField.name, "choice"]}>
                          {(optFields, { add: optAdd, remove: optRemove }) => (
                            <>
                              <Button onClick={() => optAdd()}>添加选项</Button>
                              {optFields.map((optField, choiceIndex) => (
                                <div key={choiceIndex}>
                                  <Row>
                                    <Col>
                                      <Form.Item
                                        name={[optField.name, "text"]}
                                        key={optField.key}
                                        rules={[{ required: true, message: "请输入文字描述" }]}
                                      >
                                        <Input />
                                      </Form.Item>
                                    </Col>
                                    <Col>
                                      <Form.Item
                                        name={[optField.name, "needInput"]}
                                        key={optField.key}
                                        rules={[
                                          { required: true, message: "请选择是否需要标注方输入" },
                                        ]}
                                      >
                                        <Switch
                                          checkedChildren="需要用户输入"
                                          unCheckedChildren="不需用户输入"
                                        />
                                      </Form.Item>
                                    </Col>
                                    <Col>
                                      <Button onClick={() => optRemove(choiceIndex)} danger>
                                        -
                                      </Button>
                                    </Col>
                                  </Row>
                                </div>
                              ))}
                            </>
                          )}
                        </Form.List>
                      </>
                    )}
                  </div>
                ))}
              </>
            )}
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
