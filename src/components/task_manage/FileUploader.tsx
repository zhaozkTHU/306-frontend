import { Button, Upload, UploadFile, UploadProps, message } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import { UploadOutlined } from "@ant-design/icons";
import { RcFile } from "antd/es/upload";

interface FileUploaderProps {
  urls: string[];
  onUrlListChange: (newUrlList: string[]) => void;
  multiple?: boolean;
  accept?: string;
}

/**
 * 文件上传子组件
 * @param props.urls 上传文件的url列表
 * @param props.onUrlListChange 上传文件url列表改变时的回调函数
 * @returns   上传文件组件
 * @private
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

  /**
   * @param file 上传文件，类型为`RcFile`
   * @description 上传文件的回调函数
   */
  const handleUpload = async (file: RcFile) => {
    const formData = new FormData();
    formData.append("upload_image", file);
    let url: any;
    axios
      .post("/api/image", formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((value) => {
        if (value.data.code === 0) url = value.data.url;
        else message.error(`上传失败 ${value.data.message}`);
      })
      .catch((reason) => {
        console.log(reason);
        message.error(`网络错误 ${reason?.response?.data?.message}`);
      });
    const newFileList: UploadFile[] = [
      ...fileList,
      {
        uid: file.uid,
        name: file.name,
        status: "done",
        url,
      },
    ];
    const newUrlList: string[] = [...props.urls, url];
    setFileList(newFileList);
    props.onUrlListChange(newUrlList);
  };

  /**
   * @param url 上传文件的url
   * @description 删除文件的回调函数
   */
  const handleRemove = async ({ url }: UploadFile) => {
    let data: any;
    axios
      .delete("/api/image", {
        params: { url: url },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((value) => {
        if (value.data.code === 0) {
          data = value.data;
          message.success("删除成功");
        } else if (value.status === 404) message.warning("图片不存在");
      })
      .catch((reason) => {
        console.log(reason);
        message.error(`网络错误 ${reason?.response?.data?.message}`);
      });
    const newFileList: UploadFile[] = fileList.filter((value) => value.url !== url);
    const newUrlList: string[] = props.urls.filter((value) => value !== data.url);
    setFileList(newFileList);
    props.onUrlListChange(newUrlList);
  };

  const uploadProps: UploadProps = {
    action: "/api/image",
    multiple: props.multiple,
    fileList,
    accept: props.accept,
    beforeUpload: (file) => {
      handleUpload(file);
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

export default FileUploader;
