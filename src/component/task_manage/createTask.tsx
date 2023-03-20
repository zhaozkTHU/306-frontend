import React from "react";
import { Form, Input, Button, Select, DatePicker, InputNumber, message } from "antd";
import { TaskInfo, Words3Choose1Data, WordsDescribeData } from "@/const/interface";


const Words3ChooseDataForm: React.FC<{
  setData: (data: Words3Choose1Data) => void,
  onFinishFailed: (errorInfo: any) => void,
  onFinish: () => void,
}> = (props) => {
  const [form] = Form.useForm<Words3Choose1Data>();
  form.setFieldsValue({
    options: ["", "", ""],
  });
  return (
    <Form form={form} onFinish={() => { props.setData(form.getFieldsValue()); props.onFinish() }} onFinishFailed={props.onFinishFailed}>
      <Form.Item
        label="任务描述"
        name="description"
        rules={[{ required: true, message: "请输入任务描述" }]}
      >
        <Input />
      </Form.Item>
      <Form.List name="options">
        {(fields, key) =>
          fields.map((field, index) => (
            <div key={index}>
              <Form.Item {...field} label={`选项${index}`} required>
                <Input />
              </Form.Item>
            </div>
          ))
        }
      </Form.List>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          确认
        </Button>
      </Form.Item>
    </Form>
  );
};

const WordsDescribeDataForm: React.FC<{
  setData: (data: WordsDescribeData) => void,
  onFinishFailed: (errorInfo: any) => void,
  onFinish: () => void,
}> = (props) => {
  const [form] = Form.useForm<WordsDescribeData>();
  return (
    <Form form={form} onFinish={() => props.setData(form.getFieldsValue())} onFinishFailed={props.onFinishFailed}>
      <Form.Item
        label="任务描述"
        name="description"
        rules={[{ required: true, message: "请输入任务描述" }]}
      >
        <Input.TextArea showCount maxLength={100} />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          确认
        </Button>
      </Form.Item>
    </Form>
  );
};

const CreateTaskForm: React.FC = () => {
  const [finishFirstPart, setFinishFirstPart] = React.useState<boolean>(false);
  const [taskInfo, setTaskInfo] = React.useState<TaskInfo>({} as TaskInfo);
  const [form] = Form.useForm<TaskInfo>();
  form.setFieldsValue({
    demander_id: 1, // TODO: 接口获取发布者id
  });

  const onFinishFirstPart = (values: TaskInfo) => {
    message.success("请填写任务信息");
    setFinishFirstPart(true);
    setTaskInfo(values);
    console.log("Success:", values);
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
    message.error("创建任务失败，请检查填写内容");
  };

  const onAllFinish = () => {
    console.log("All Finish:", taskInfo);
    // TODO: 发送请求
    message.success("创建任务成功");
    // TODO: 路由跳转
  };

  return (
    <>
      <Form form={form} onFinish={onFinishFirstPart} onFinishFailed={onFinishFailed}>
        <Form.Item
          label="任务标题"
          name="title"
          style={{ width: "20%" }}
          rules={[{ required: true, message: "请输入任务标题" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="任务ID"
          name="task_id"
          rules={[{ required: true, message: "请输入任务ID" }]}
        >
          <InputNumber min={0} />
        </Form.Item>
        <Form.Item
          label="任务模板"
          name="template"
          style={{ width: "20%" }}
          rules={[{ required: true, message: "请选择任务模板" }]}
        >
          <Select>
            <Select.Option value="words">文字类</Select.Option>
            <Select.Option value="images">图片类</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          label="任务风格"
          name="style"
          style={{ width: "20%" }}
          rules={[{ required: true, message: "请选择任务风格" }]}
        >
          <Select>
            <Select.Option value="3choose1">三选一</Select.Option>
            <Select.Option value="describe">描述</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          label="任务奖励"
          name="reward"
          rules={[{ required: true, message: "请输入任务奖励" }]}
        >
          <InputNumber min={0} />
        </Form.Item>
        <Form.Item
          label="单项任务时间"
          name="time"
          rules={[{ required: true, message: "请输入单项任务时间" }]}
        >
          <InputNumber min={0} />
        </Form.Item>
        <Form.Item
          label="总时间"
          name="total_time"
          rules={[{ required: true, message: "请输入总时间" }]}
        >
          <InputNumber min={0} />
        </Form.Item>
        <Form.Item
          label="标注方数量"
          name="worker_num"
          rules={[{ required: true, message: "请输入标注方数量" }]}
        >
          <InputNumber min={0} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" disabled={finishFirstPart}>
            确认
          </Button>
        </Form.Item>
      </Form>
      {taskInfo.template === "words" && taskInfo.style === "3choose1" && (
        <Words3ChooseDataForm
          onFinish={() => onAllFinish()}
          setData={(data: Words3Choose1Data) => setTaskInfo((value) => { return { ...value, data: data } })}
          onFinishFailed={(errorInfo) => onFinishFailed(errorInfo)}
        />
      )}
      {taskInfo.template === "words" && taskInfo.style === "describe" && (
        <WordsDescribeDataForm
          onFinish={() => onAllFinish()}
          setData={(data: WordsDescribeData) => setTaskInfo((value) => { return { ...value, data: data } })}
          onFinishFailed={(errorInfo) => onFinishFailed(errorInfo)}
        />
      )}
    </>
  );
}

export default CreateTaskForm;
