import { Button, Form, Input, Row, Col, Divider } from "antd";
import React, { useState } from 'react';
import { DescribeData, ThreeChooseOneData } from "@/const/interface";

export const DescribeDataForm: React.FC<{ setTaskData: (data: DescribeData[]) => void }> = (props) => {
  const [contacts, setContacts] = useState<DescribeData[]>([]);
  const [form] = Form.useForm();
  const submitForm = () => {
    form.validateFields()
      .then(values => {
        console.log(values);
        props.setTaskData(values);
      });
  };
  const add = () => {
    form.setFieldsValue({ "contacts": [...contacts, { description: '', content: '' }] })
    return setContacts([...contacts, { description: '', content: '' }])
  };
  const del = (index: number) => {
    form.setFieldsValue({ "contacts": [...contacts.slice(0, index), ...contacts.slice(index + 1)] })
    return setContacts([...contacts.slice(0, index), ...contacts.slice(index + 1)])
  };

  const onChange = (index: number, name: "description" | "content", event: React.ChangeEvent<HTMLInputElement>) => {
    let tempArray = [...contacts];
    if ('description' === name)
      tempArray[index] = { ...tempArray[index], description: event.target.value }
    else
      tempArray[index] = { ...tempArray[index], content: event.target.value }
    return setContacts(tempArray)
  };
  const contactsItems = contacts.map((item, index) => {
    return (
      <Row key={index}>
        <Col span={10}>
          <Form.Item label="任务描述" name={['contacts', index, 'description']}><Input onChange={(event) => onChange(index, 'description', event)} /></Form.Item>
        </Col>
        <Col span={10}>
          <Form.Item label="任务内容" name={['contacts', index, 'content']} ><Input onChange={(event) => onChange(index, "content", event)} /></Form.Item>
        </Col>
        <Col span={3} offset={1}>
          <Button type="dashed" onClick={() => del(index)} danger>-</Button>
        </Col>
      </Row>
    )
  });
  return (
    <Row>
      <Col>
        <Form form={form} layout={'horizontal'} onFinish={submitForm} initialValues={{ contacts: contacts }}>
          <Form.Item label="任务数据">
            {contactsItems}
          </Form.Item>
          <Form.Item><Button type="dashed" onClick={add}>+</Button></Form.Item>
          <Button type="primary" htmlType="submit">submit</Button>
        </Form>
      </Col>
    </Row>
  );
}

export const ThreeChooseOneDataForm: React.FC<{ setTaskData: (data: ThreeChooseOneData[]) => void }> = (props) => {
  const [contacts, setContacts] = useState<ThreeChooseOneData[]>([]);
  const [form] = Form.useForm();
  const submitForm = () => {
    form.validateFields()
      .then(values => {
        console.log(values);
        props.setTaskData(values);
      });
  };
  const add = () => {
    form.setFieldsValue({ "contacts": [...contacts, { description: "", options: ["", "", ""] }] });
    return setContacts([...contacts, { description: "", options: ["", "", ""] }]);
  };
  const del = (index: number) => {
    form.setFieldsValue({ "contacts": [...contacts.slice(0, index), ...contacts.slice(index + 1)] });
    return setContacts([...contacts.slice(0, index), ...contacts.slice(index + 1)]);
  };

  const onChange = (index: number, name: "description" | "options", event: React.ChangeEvent<HTMLInputElement>, arrayIndex?: number) => {
    let tempArray = [...contacts];
    if (name === "description")
      tempArray[index].description = event.target.value;
    // tempArray[index] = { ...tempArray[index], description: event.target.value };
    else
      tempArray[index].options[arrayIndex as number] = event.target.value;
    return setContacts(tempArray);
  };

  const contactItems = contacts.map((item, index) => {
    return (
      <>
        <Row key={index}>
          <Col>
            <Form.Item label="任务描述" name={['contacts', index, 'description']}>
              <Input onChange={(event) => onChange(index, "description", event)} />
            </Form.Item>
          </Col>
          <Col><Button type="dashed" onClick={() => del(index)} danger>-</Button></Col>
        </Row>
        <Row>
          <Col>
            <Form.Item label="选项1" name={['contacts', index, 'options', 0]}>
              <Input onChange={(event) => onChange(index, 'options', event, 0)} />
            </Form.Item> </Col>
          <Col>
            <Form.Item label="选项2" name={['contacts', index, 'options', 1]}>
              <Input onChange={(event) => onChange(index, 'options', event, 1)} />
            </Form.Item>
          </Col>
          <Col>
            <Form.Item label="选项3" name={['contacts', index, 'options', 2]}>
              <Input onChange={(event) => onChange(index, 'options', event, 2)} />
            </Form.Item>
          </Col>
        </Row>
        <Divider />
      </>
    )
  });

  return (
    <Row>
      <Col>
        <Form form={form} layout={'horizontal'} onFinish={submitForm} initialValues={{ contacts: contacts }}>
          <Form.Item label="任务数据">
            {contactItems}
          </Form.Item>
          <Form.Item><Button type="dashed" onClick={add}>+</Button></Form.Item>
          <Button type="primary" htmlType="submit">submit</Button>
        </Form>
      </Col>
    </Row>
  )
}
