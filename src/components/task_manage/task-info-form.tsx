import { DescribeData, TaskInfo, ThreeChooseOneData } from "@/const/interface";
import { Form, message, Input, Radio, InputNumber, DatePicker, Row, Col, Button, Divider } from "antd";
import dayjs from "dayjs";
import React, { useState } from "react";

// task_manage内部使用
const TaskInfoForm: React.FC<{
  taskInfo?: TaskInfo,
  setTaskInfo?: (taskInfo: TaskInfo) => void,
  onFinish: () => void;
}> = (props) => {
  const [info, setInfo] = useState<TaskInfo>(props.taskInfo ? props.taskInfo : {} as TaskInfo);
  const [form] = Form.useForm<TaskInfo>();
  props.taskInfo && form.setFieldsValue(props.taskInfo);

  const onFinish = () => {
    setInfo((info) => { info.deadline = dayjs(info.deadline).valueOf(); return info; });
    props.setTaskInfo && props.setTaskInfo(info);
    props.onFinish();
  };

  const add = (style: "ThreeChooseOne" | "describe") => {
    setInfo((info) => {
      const newInfo = { ...info };
      if (newInfo.task_data) newInfo.task_data = [
        ...newInfo.task_data,
        style === "ThreeChooseOne" ? { description: "", options: ["", "", ""] } : { description: "", content: "" },
      ] as any;
      else newInfo.task_data = [{} as any];
      return newInfo;
    });
    console.log(info);
    form.setFieldsValue(info);
  };

  const del = (index: number) => {
    form.setFieldsValue({ ...form.getFieldsValue(), task_data: [...form.getFieldsValue().task_data.slice(0, index), ...form.getFieldsValue().task_data.slice(index + 1)] });
    setInfo((info) => {
      const newInfo = { ...info };
      newInfo.task_data = [...newInfo.task_data.slice(0, index), newInfo.task_data.slice(index + 1)] as any;
      return newInfo;
    });
  };

  return (
    <Form
      form={form}
      onFinishFailed={() => { message.error("请检查表单是否填写完整"); }}
      onFinish={onFinish}
    >
      <Form.Item label="任务标题" name="title" rules={[{ required: true, message: "请输入任务标题" }]}>
        <Input />
      </Form.Item>
      <Form.Item label="任务模板" name="template" rules={[{ required: true, message: "请选择任务模板" }]} >
        <Radio.Group onChange={(e) => { setInfo({ ...info, task_data: [], template: e.target.value as typeof info.template }); }}>
          <Radio value="words">文字类</Radio>
          <Radio value="images">图片类</Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item label="任务类型" name="style" rules={[{ required: true, message: "请选择任务类型" }]}>
        <Radio.Group onChange={(e) => { setInfo({ ...info, task_data: [], style: e.target.value as typeof info.style }); }}>
          <Radio value="ThreeChooseOne">三选一</Radio>
          <Radio value="describe">描述</Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item label="任务奖励" name="reward" rules={[{ required: true, message: "请输入任务奖励" }]}>
        <InputNumber min={0} />
      </Form.Item>
      <Form.Item label="标注方人数" name="labeler_num" rules={[{ required: true, message: "请输入标注方人数" }]}>
        <InputNumber min={0} />
      </Form.Item>
      <Form.Item label="任务截止时间" name="deadline" rules={[{ required: true, message: "请选择任务截止时间" }]} >
        <DatePicker />
      </Form.Item>
      <Row>
        <Col>
          <Button type="dashed" onClick={() => { add(info.style); }} disabled={info.template === undefined || info.style === undefined}>+</Button>
        </Col>
        <Col>
          <Form.Item label="任务数据" rules={[{ required: true, message: "请输入任务数据" }]}>
            {info.task_data && info.task_data.map((data, index) => {
              if (info.style === "describe")
                return (
                  <div key={index}>
                    <Row>
                      <Col>
                        <Form.Item rules={[{ required: true, message: "请输入任务描述" }]} initialValue={data.description} label="任务描述" name={['task_data', index, 'description']}><Input /></Form.Item>
                      </Col>
                      <Col>
                        <Button type="dashed" onClick={() => del(index)} danger>-</Button>
                      </Col>
                    </Row>
                    <Row>
                      <Form.Item rules={[{ required: true, message: "请输入任务内容" }]} initialValue={(data as DescribeData).content} label="任务内容" name={['task_data', index, 'content']}><Input /></Form.Item>
                    </Row>
                  </ div>
                );
              if (info.style === "ThreeChooseOne")
                return (
                  <div key={index}>
                    <Row>
                      <Col>
                        <Form.Item label="任务描述" initialValue={data.description} name={['task_data', index, 'description']} rules={[{ required: true }]}>
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col><Button type="dashed" onClick={() => del(index)} danger>-</Button></Col>
                    </Row>
                    <Row>
                      <Col>
                        <Form.Item label="选项1" initialValue={(data as ThreeChooseOneData).options[0]} name={['task_data', index, 'options', 0]} rules={[{ required: true }]}>
                          <Input />
                        </Form.Item> </Col>
                      <Col>
                        <Form.Item label="选项2" initialValue={(data as ThreeChooseOneData).options[1]} name={['task_data', index, 'options', 1]} rules={[{ required: true }]}>
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col>
                        <Form.Item label="选项3" initialValue={(data as ThreeChooseOneData).options[2]} name={['task_data', index, 'options', 2]} rules={[{ required: true }]}>
                          <Input />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Divider />
                  </div>
                );
              return (<p key={index}>TODO</p>);
            })}
          </Form.Item>
        </Col>
      </Row>
      <Button type="primary" onClick={() => { form.submit(); console.log(form.getFieldsValue()); }}>submit</Button>
    </Form>
  );
};

export default TaskInfoForm;