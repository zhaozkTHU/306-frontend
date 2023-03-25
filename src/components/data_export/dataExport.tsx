import { request } from "@/utils/network";
import React, { useEffect, useState } from "react";
import { UserIdContext } from "@/pages/_app";
import { useContext } from "react";
import { TaskInfo } from "@/const/interface";
import { useRouter } from "next/router";
import { Button, Empty, List, message, Modal, Spin, Switch } from "antd";
import FileSaver from "file-saver";

const DataExportForm: React.FC = () => {
  const userId = useContext(UserIdContext);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [allTaskInfo, setAllTaskInfo] = useState<TaskInfo[]>([]);
  const [taskId, setTaskId] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [merge, setMerge] = useState(false);
  const router = useRouter();
  const query = router.query;

  useEffect(() => {
    request("/api/task", "GET", {demander_id: userId})
      .then((value) => { setAllTaskInfo(value); setLoading(false); })
      .catch((reason) => { console.log(reason); message.error("请求错误"); });
  }, [router, query, userId]);

  const handleOk = () => {
    setExportLoading(true);
    request("/api/data", "GET", { task_id: taskId })
      .then((value) => {
        // TODO: 我不清楚标注数据的内部结构，需要其他人去处理 --zzk
        if (merge) {}
        else {}
        setExportLoading(false);
        setModalOpen(false);
        // const blob = new Blob([value.map()], {type: "text/plain;charset=utf-8"});
        // FileSaver.saveAs(blob, `${taskId}.json`);
        message.success("导出成功")
      })
      .catch((reason) => { console.log(reason); message.error("请求错误"); });
  };

  return (
    loading ? <Spin tip="加载中" /> :
      <>
        {allTaskInfo.length === 0 && <Empty description="无发表任务" />}
        {allTaskInfo.length !== 0 &&
          <>
            <List
              dataSource={allTaskInfo}
              bordered
              renderItem={(item) =>
                <>
                  <List.Item>{item.title}</List.Item>
                  <List.Item>
                    <Button
                      onClick={() => { setModalOpen(true); setTaskId(item.task_id as number); }}
                    >
                      导出数据
                    </Button>
                  </List.Item>
                </>
              }
            />
            <Modal
              title="导出任务数据"
              open={modalOpen}
              onOk={handleOk}
              confirmLoading={exportLoading}
              okText="导出"
              onCancel={() => setModalOpen(false)}
            >
              {
                <>
                  <p>合并数据</p>
                  <Switch checked={merge} onChange={(checked) => setMerge(checked)} />
                </>
              }
            </Modal>
          </>
        }
      </>
  );
};


export default DataExportForm;