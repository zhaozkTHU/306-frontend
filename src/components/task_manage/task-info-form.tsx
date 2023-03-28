import { TaskInfo } from "@/const/interface";
import { Form, message, Input, Radio, InputNumber, DatePicker, Row, Col, Button, Divider } from "antd";
import dayjs from "dayjs";
import React, { useState } from "react";

// task_manage内部使用
const TaskInfoForm: React.FC<{
  taskInfo?: TaskInfo,
  onFinish: (info: TaskInfo) => void;
}> = (props) => {
  const [form] = Form.useForm<TaskInfo>();
  props.taskInfo && form.setFieldsValue(props.taskInfo);

  const onFinish = () => {
    const value = form.getFieldsValue();
    value.deadline = dayjs(value.deadline).valueOf();
    console.log("value", value);
    props.onFinish(value);
  };

  return (
    <Form
      form={form}
      onFinishFailed={() => { message.error("请检查表单是否填写完整"); }}
      onFinish={onFinish}
    >
      <Form.Item label="任务标题" name="title" rules={[{ required: true, message: "请输入任务标题" }]}>
        <Input />
      </Form.Item>      <Form.Item label="任务模板" name="template" rules={[{ required: true, message: "请选择任务模板" }]} >
        <Radio.Group onChange={(_) => { form.setFieldsValue({ ...form.getFieldsValue(), task_data: [] }); }}>
          <Radio value="TextClassification">文字分类</Radio>
          <Radio value="ImagesClassification">图片分类</Radio>
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
      <Form.Item label="任务数据" rules={[{ required: true, message: "请输入任务数据" }]}>
        <Form.List name="task_data">
          {(dataFields, { add: dataAdd, remove: dataRemove }) => {
            return (
              <>
                <Button onClick={() => dataAdd()} type="primary">添加题目</Button>
                {
                  dataFields.map((dataField, index) => (
                    <div key={index}>
                      <Divider orientation="left">{`题目${index + 1}`}</Divider>
                      <Row>
                        <Col>
                          <Form.Item key={dataField.key} name={[dataField.name, "description"]} rules={[{ required: true, message: "请输入描述" }]}>
                            <Input addonBefore="题目描述" />
                          </Form.Item>
                        </Col>
                        <Col>
                          <Button onClick={() => dataRemove(index)} type="primary" danger>删除题目</Button>
                        </Col>
                      </Row>
                      <Form.List name={[dataField.name, "options"]}>
                        {(optFields, { add: optAdd, remove: optRemove }) => {
                          return (
                            <>
                              <Button onClick={() => optAdd()}>添加选项</Button>
                              {optFields.map((optField, optIndex) => (
                                <div key={optIndex}>
                                  <Row>
                                    <Col>
                                      <Form.Item {...optField} rules={[{ required: true, message: "请输入选项" }]}>
                                        <Input addonBefore={`选项${optIndex + 1}`} />
                                      </Form.Item>
                                    </Col>
                                    <Col>
                                      <Button onClick={() => optRemove(optIndex)} danger>-</Button>
                                    </Col>
                                  </Row>
                                </div>
                              ))}
                            </>
                          );
                        }}
                      </Form.List>
                    </div>
                  ))
                }
              </>
            );
          }}
        </Form.List>

      </Form.Item>
      <Button type="primary" onClick={() => { form.submit(); }}>submit</Button>
    </Form >
  );
};

export default TaskInfoForm;