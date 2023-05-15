import { mapEntemplate2Zhtemplate } from "@/const/interface";
import { downLoadZip, request } from "@/utils/network";
import { transTime } from "@/utils/valid";
import { ProCard } from "@ant-design/pro-components"
import { Button, Descriptions, Divider, Result, Spin, Tooltip, Upload, message } from "antd";
import { useEffect, useState } from "react"
import Label from "../../components/label";
import { InboxOutlined } from "@ant-design/icons";

const { Dragger } = Upload;
const Test = () => {
  const [refreshing, setRefreshing] = useState<boolean>(true);
  const [hasNew, setHasNew] = useState<boolean>(false);
  const [labeling, setLabeling] = useState<boolean>(false);
  const [newInfo, setNewInfo] = useState<any>({
    title: "",
    template: "TextClassification",
    time: 0,
    reward: 0,
    batch_file: ""
  });
  const [labelInfo, setLabelInfo] = useState<any>({
    title: "",
    template: "TextClassification",
    time: 0,
    reward: 0,
    batch_file: ""
  });
  const [hasLabeling, setHasLabeling] = useState<boolean>(false);
  const [Loading, setLoading] = useState<boolean>(false);
  const [problemList, setProblemList] = useState<any[]>([]);
  useEffect(() => {
    request("/api/distribute", "GET")
      .then((response) => {
        setHasNew(true);
        setNewInfo(response.data.task)
      })
      .catch((error) => {
        setHasNew(false);
      })
      .finally(() => {
        request("/api/labeling", "GET")
          .then((response) => {
            setHasLabeling(true)
            setLabelInfo(response.data.task)
            request("/api/temp_save", "GET")
              .then((res) => {
                const problems = response.data.task.task_data;
                if (res.data.answer.length !== 0) {
                  for (let i = 0; i < problems.length; i++) {
                    if (problems[i].template === "TextClassification" || problems[i].template === "ImagesClassification") {
                      problems[i].chosen = res.data.answer[i]
                    } else {
                      problems[i].data = res.data.answer[i]
                    }
                  }
                }
                setProblemList(problems);
              })
              .catch((error) => {
                message.warning("获取暂存标注失败，请刷新重试");
              })
          })
          .catch(() => {
            message.warning("标注中任务获取失败，请刷新重试");
            setHasLabeling(false);
          })
          .finally(() => {
            setRefreshing(false)
          })
      })
  }, [refreshing])
  return (
    labeling ?
      <Label setLabeling={setLabeling} problemList={problemList} task_id={labelInfo.task_id} template={labelInfo.template}
        time={labelInfo.time}
      /> :
      <>
        <Spin spinning={refreshing || Loading} tip={refreshing ? "正在获取任务，请稍后..." : "正在处理，请稍后..."}>
          <ProCard split="vertical">
            <ProCard colSpan={"50%"}>
              <h1 style={{ textAlign: "center" }}>新任务</h1>
              {hasNew ?
                <>
                  <Descriptions bordered column={4}>
                    <Descriptions.Item label="任务标题" span={4}>
                      <Tooltip title="点击此处下载题目文件">
                        <Button type="link" onClick={() => {
                          setLoading(true);
                          downLoadZip(newInfo.batch_file, setLoading)
                        }}>{newInfo.title}</Button>
                      </Tooltip>
                    </Descriptions.Item>
                    <Descriptions.Item label="任务模板" span={4}>
                      {mapEntemplate2Zhtemplate[newInfo.template]}
                    </Descriptions.Item>
                    <Descriptions.Item label="单题奖励" span={2}>
                      {newInfo.reward}
                    </Descriptions.Item>
                    <Descriptions.Item label="单题限时" span={2}>
                      {newInfo.time}
                    </Descriptions.Item>
                    <Descriptions.Item label="截至时间" span={4}>
                      {newInfo.deadline}
                    </Descriptions.Item>
                  </Descriptions>
                </>
                :
                <Result
                  status="404"
                  title="暂时没有新任务"
                />
              }
            </ProCard>
            <ProCard colSpan={"50%"}>
              <h1 style={{ textAlign: "center" }}>标注中任务</h1>
              {hasLabeling ?
                <>
                  <Descriptions bordered column={4}>
                    <Descriptions.Item label="任务标题" span={4}>
                      <Tooltip title="点击此处下载题目文件">
                        <Button type="link" onClick={() => {
                          setLoading(true);
                          downLoadZip(labelInfo.batch_file, setLoading)
                        }}>{labelInfo.title}</Button>
                      </Tooltip>
                    </Descriptions.Item>
                    <Descriptions.Item label="任务模板" span={4}>
                      {mapEntemplate2Zhtemplate[labelInfo.template]}
                    </Descriptions.Item>
                    <Descriptions.Item label="单题奖励" span={2}>
                      {labelInfo.reward}
                    </Descriptions.Item>
                    <Descriptions.Item label="单题限时" span={2}>
                      {labelInfo.time}
                    </Descriptions.Item>
                    <Descriptions.Item label="截至时间" span={4}>
                      {transTime(labelInfo.deadline)}
                    </Descriptions.Item>
                  </Descriptions>
                  <Divider />
                  <Dragger>
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">将你带标注的Excel文件在这里上传</p>
                  </Dragger>
                  <br />
                  <Button size="large" style={{
                    backgroundColor: "#3b5999",
                    color: "white"
                  }}>上传批量标注结果</Button>
                  <Divider type="vertical" />
                  <Button size="large" style={{
                    backgroundColor: "#3b5999",
                    color: "white"
                  }}
                    onClick={() => {
                      setLabeling(true)
                    }}
                  >开始逐题标注</Button>
                </>
                :
                <Result
                  status="404"
                  title="暂时没有标注中任务"
                />
              }
            </ProCard>
          </ProCard>
        </Spin>
      </>
  )
}

export default Test