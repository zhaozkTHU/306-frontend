import { Button, Col, Form, Input, Row, UploadProps, message, Upload, Switch } from "antd";
import { FormListFieldData } from "antd/lib";
import { DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import axios from "axios";

const UploadPropsByType = (fileType: "image" | "video" | "audio"): UploadProps => ({
  action: "/api/image",
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  beforeUpload: (file) => {
    const isValid = file.type.startsWith(fileType);
    if (!isValid) {
      message.error(`${file.name} 文件格式错误`);
      return Upload.LIST_IGNORE;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error(`${file.name} 文件大小超过2MB`);
      return Upload.LIST_IGNORE;
    }
    return true;
  },
  onRemove: async (file) => {
    /** @bug 此处后端实现有问题 */
    await axios.delete("/api/image", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      params: { url: file.response.url },
    });
    return true;
  },
});

export const TextClassificationDataForm = (dataField: FormListFieldData) => (
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
                  <DeleteOutlined />
                </Button>
              </Col>
            </Row>
          </div>
        ))}
      </>
    )}
  </Form.List>
);

export const ImagesClassificationDataForm = (dataField: FormListFieldData) => (
  <Form.Item
    key={dataField.key}
    name={[dataField.name, "options"]}
    rules={[{ required: true, message: "请上传文件" }]}
    valuePropName="fileList"
    getValueFromEvent={(e) => {
      console.log(e);
      return e?.fileList;
    }}
  >
    <Upload {...UploadPropsByType("image")}>
      <Button icon={<UploadOutlined />}>提交文件</Button>
    </Upload>
  </Form.Item>
);

export const FaceTagDataForm = (dataField: FormListFieldData) => (
  <Form.Item
    key={dataField.key}
    name={[dataField.name, "url"]}
    rules={[{ required: true, message: "请上传文件" }]}
    valuePropName="fileList"
    getValueFromEvent={(e) => {
      return e?.fileList;
    }}
  >
    <Upload {...UploadPropsByType("image")} maxCount={1}>
      <Button icon={<UploadOutlined />}>提交文件</Button>
    </Upload>
  </Form.Item>
);

export const ImageFrameDataForm = (dataField: FormListFieldData) => (
  <Form.Item
    key={dataField.key}
    name={[dataField.name, "url"]}
    rules={[{ required: true, message: "请上传文件" }]}
    valuePropName="fileList"
    getValueFromEvent={(e) => {
      return e?.fileList;
    }}
  >
    <Upload {...UploadPropsByType("image")} maxCount={1}>
      <Button icon={<UploadOutlined />}>提交文件</Button>
    </Upload>
  </Form.Item>
);

export const SoundTagDataForm = (dataField: FormListFieldData) => (
  <>
    <Form.Item
      key={dataField.key}
      name={[dataField.name, "url"]}
      rules={[{ required: true, message: "请上传文件" }]}
      valuePropName="fileList"
      getValueFromEvent={(e) => e?.fileList}
    >
      <Upload {...UploadPropsByType("audio")} maxCount={1}>
        <Button icon={<UploadOutlined />}>提交文件</Button>
      </Upload>
    </Form.Item>
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
                    rules={[{ required: true, message: "请选择是否需要标注方输入" }]}
                  >
                    <Switch checkedChildren="需要用户输入" unCheckedChildren="不需用户输入" />
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
);

export const VideoTagDataForm = (dataField: FormListFieldData) => (
  <>
    <Form.Item
      key={dataField.key}
      name={[dataField.name, "url"]}
      rules={[{ required: true, message: "请上传文件" }]}
      valuePropName="fileList"
      getValueFromEvent={(e) => e?.fileList}
    >
      <Upload {...UploadPropsByType("audio")} maxCount={1}>
        <Button icon={<UploadOutlined />}>提交文件</Button>
      </Upload>
    </Form.Item>
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
                    rules={[{ required: true, message: "请选择是否需要标注方输入" }]}
                  >
                    <Switch checkedChildren="需要用户输入" unCheckedChildren="不需用户输入" />
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
);
