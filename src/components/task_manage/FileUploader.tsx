import { Button, Upload, UploadFile, UploadProps } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import { UploadOutlined } from "@ant-design/icons";

interface FileUploaderProps {
  urls: string[];
  onUrlListChange: (newUrlList: string[]) => void;
}

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
    const newFileList: UploadFile[] = fileList.filter((value) => value.url !== url);
    const newUrlList: string[] = props.urls.filter((value) => value !== data.url);
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

export default FileUploader;
