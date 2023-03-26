import { TaskInfo } from "@/const/interface";
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

  const addData = (template: "TextClassification" | "ImagesClassification") => {
    setInfo((info) => {
      const newInfo = { ...info };
      if (newInfo.task_data !== undefined) {
        if (template === "TextClassification") {
          newInfo.task_data = [...newInfo.task_data, { description: "", options: [] }];
        } else {
          // TODO
        }
      } else if (template === "TextClassification") {
        newInfo.task_data = [{ description: "", options: [] }];
      }
      return newInfo;
    });
    console.log(info);
    form.setFieldsValue(info);
  };

  const delData = (index: number) => {
    form.setFieldsValue({
      ...form.getFieldsValue(),
      task_data: [
        ...form.getFieldsValue().task_data.slice(0, index),
        ...form.getFieldsValue().task_data.slice(index + 1)
      ]
    });
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
      {/* <Row>
        <Col>
          <Button type="dashed" onClick={() => { addData(info.template); }} disabled={info.template === undefined}>+</Button>
        </Col>
        <Col> */}
      <Form.Item label="任务数据" rules={[{ required: true, message: "请输入任务数据" }]}>
        {info.task_data && (
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
                            <Form.Item key={dataField.key} name={[dataField.name, "description"]} rules={[{required: true, message: "请输入描述"}]}>
                              <Input addonBefore="题目描述"/>
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
                                        <Form.Item {...optField} rules={[{required: true, message: "请输入选项"}]}>
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
        )}
        {/* {info.task_data && info.task_data.map((data, index) => {
              if (info.template === "TextClassification")
                return (
                  <div key={index}>
                    <Row>
                      <Col>
                        <Form.Item
                          rules={[{ required: true, message: "请输入任务描述" }]}
                          initialValue={data.description} label="任务描述"
                          name={["task_data", index, "description"]}
                        >
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col><Button onClick={() => delData(index)} danger>-</Button></Col>
                    </Row>
                    <Form.List name={["task_data", index, "options"]}>
                      {(optiosnFields, { add: optionsAdd, remove: optionsRemove }) => {
                        return (
                          <>
                            {
                              optiosnFields.map((value, index) => (
                                <div key={index}>
                                  <Row>
                                    <Col>
                                      <Form.Item
                                        {...value}
                                        label={`选项${index + 1}`}
                                        rules={[{ required: true, message: "请填写任务选项" }]}
                                      >
                                        <Input />
                                      </Form.Item>
                                    </Col>
                                    <Col>
                                      <Button
                                        onClick={() => optionsRemove(index)}
                                        danger
                                      >
                                        -
                                      </Button>
                                    </Col>
                                  </Row>
                                </div>
                              ))
                            }
                            <Button onClick={() => optionsAdd()}>+</Button>
                          </>
                        );
                      }}
                    </Form.List>
                  </div>
                );
              return (<p key={index}>TODO</p>);
            })} */}
      </Form.Item>
      {/* </Col>
      </Row> */}
      <Button type="primary" onClick={() => { form.submit(); console.log(form.getFieldsValue()); }}>submit</Button>
    </Form>
  );
};

export default TaskInfoForm;