import { Button, Upload, UploadFile, UploadProps, message } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import { UploadOutlined } from "@ant-design/icons";
import { RcFile } from "antd/es/upload";

interface FileUploaderProps {
  urls: string[];
  onUrlListChange: (newUrlList: string[]) => void;
  maxCount?: number;
  accept?: string;
}

/**
 * 文件上传子组件
 * @param props.urls 上传文件的url列表
 * @param props.onUrlListChange 上传文件url列表改变时的回调函数
 * @returns   上传文件组件
 * @private
 * @deprecated 使用`Form.Item`与`Upload`组件代替
 */
const FileUploader: React.FC<FileUploaderProps> = (props) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    const initFileList: UploadFile[] = props.urls.map((url, index) => ({
      uid: crypto.randomUUID(),
      name: url.substring(url.lastIndexOf("/") + 1),
      status: "done",
      url,
    }));
    setFileList(initFileList);
  }, [props.urls]);

  useEffect(() => {
    console.log(fileList);
    const urls = fileList.map((value) => value.url as string);
    props.onUrlListChange(urls);
  }, [fileList, props]);

  const customRequest: UploadProps["customRequest"] = (options) => {
    console.log(options);
    const formData = new FormData();
    formData.append("upload_image", options.file);
    let url = "";
    axios
      .post("/api/image", formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((value) => {
        if (value.data.code === 0) url = value.data.url;
        else {
          message.error(`${value.data?.message}`);
          return;
        }
      })
      .catch((reason) => {
        console.log(reason);
        message.error(`${reason?.response?.data?.url}`);
        return;
      });
    setFileList((fileList) => {
      let newFileList: UploadFile[] = [
        ...fileList,
        {
          name: (options.file as RcFile).name as string,
          status: "done",
          uid: crypto.randomUUID(),
          url,
        },
      ];
      if (props.maxCount) {
        newFileList = newFileList.slice(-props.maxCount);
      }
      return newFileList;
    });
  };

  /**
   * @param url 上传文件的url
   * @description 删除文件的回调函数
   */
  const handleRemove = async (url: string) => {
    axios
      .delete("/api/image", {
        params: { url: url },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((value) => {
        if (value.data.code === 0) {
          message.success("删除成功");
        } else if (value.status === 404) {
          message.warning("图片不存在");
          return;
        }
      })
      .catch((reason) => {
        console.log(reason);
        message.error(`网络错误 ${reason?.response?.data?.message}`);
        return;
      });
    const newFileList: UploadFile[] = fileList.filter((value) => value.url !== url);
    setFileList(newFileList);
  };

  const uploadProps: UploadProps = {
    fileList,
    accept: props.accept,
    customRequest,
    beforeUpload: (file) => {
      // 限制文件大小
      if (file.size > 1024 * 1024 * 2) {
        message.error("文件超过2MB");
        return false;
      }
      if (props.maxCount && fileList.length >= props.maxCount) {
        message.error(`最多只能上传${props.maxCount}个文件`);
        return false;
      }
      return true;
    },
    onRemove: (file: UploadFile) => {
      handleRemove(file.url as string);
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
