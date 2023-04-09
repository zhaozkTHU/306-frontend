import { Card, Button, Dropdown, Modal, Space } from "antd";
import type { MenuProps } from "antd";
import { transTime } from "../utils/valid";
import { DownloadOutlined } from "@ant-design/icons";
import { Dispatch, SetStateAction, useState } from "react";
import CheckModel from "./check/checkModel";
import DataExportCallback from "./data_export/dataExport";
import UpdateTask from "./task_manage/update-task";

export interface DemanderTaskBlockProps {
  task_id: number;
  create_at: number;
  deadline: number;
  title: string;
  state: string;
  labeler_number: number;
  labeler_id: number[];
  template: string;
  isDone: boolean[]; // 对应ID的标注方是否完成标注
  setRefreshing: Dispatch<SetStateAction<boolean>>;
}

const DemanderTaskBlock = (props: DemanderTaskBlockProps) => {
  const [isCheckModalOpen, setIsCheckModalOpen] = useState<boolean>(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
  const [labelerId, setLabelerId] = useState<number>(-1);
  const [isShow, setIsShow] = useState<boolean>(false);
  const [isSample, setisSample] = useState<boolean>(false);
  const items: MenuProps["items"] = [
    {
      key: "allCheck",
      label: "全量审核",
      children: Array.from(Array(props.labeler_id.length).keys(), (n) => n + 1).map(
        (index, idx) => {
          return {
            key: `{"is_sample": false, "labeler_index": ${idx}}`,
            label: `标注者${index}号`,
            disabled: !props.isDone[idx],
          };
        }
      ),
    },
    {
      key: "sampleCheck",
      label: "抽样审核",
      children: Array.from(Array(props.labeler_id.length).keys(), (n) => n + 1).map(
        (index, idx) => {
          return {
            key: `{"is_sample": true, "labeler_index": ${idx}}`,
            label: `标注者${index}号`,
            disabled: !props.isDone[idx],
          };
        }
      ),
    },
  ];
  return (
    <>
      <Modal
        open={isCheckModalOpen}
        onOk={() => {
          setIsCheckModalOpen(false);
        }}
        onCancel={() => {
          setIsCheckModalOpen(false);
        }}
      >
        <CheckModel
          is_sample={isSample}
          task_id={props.task_id}
          labeler_index={labelerId}
          template={props.template}
          isShow={isShow}
        />
      </Modal>
      <Modal
        open={isUpdateModalOpen}
        onOk={() => {
          setIsUpdateModalOpen(false);
        }}
        onCancel={() => {
          setIsUpdateModalOpen(false);
        }}
      >
        <UpdateTask taskId={props.task_id} />
      </Modal>
      <Card
        title={props.title}
        extra={
          <Button
            type="link"
            onClick={() => {
              alert("查看详情");
            }}
          >
            查看详情
          </Button>
        }
      >
        <>
          <p>创建时间: {transTime(props.create_at)}</p>
          <p>截止时间: {transTime(props.deadline)}</p>
          <p>任务状态: {props.state}</p>
          <Space wrap>
            <Dropdown.Button
              menu={{
                items: items,
                onClick: ({ key }) => {
                  const item = JSON.parse(key);
                  setisSample(item.is_sample);
                  setIsShow(true);
                  setIsCheckModalOpen(true);
                  setLabelerId(props.labeler_id[item.labeler_index]);
                },
              }}
            >
              审核
            </Dropdown.Button>
            <Dropdown.Button
              icon={<DownloadOutlined />}
              menu={{
                items: [
                  {
                    key: "merge",
                    label: "归并导出",
                  },
                  {
                    key: "notMerge",
                    label: "导出原始数据",
                  },
                ],
                onClick: ({ key }) => {
                  DataExportCallback(props.task_id, key === "merge" ? true : false);
                },
              }}
            >
              导出数据
            </Dropdown.Button>
            <Button
              onClick={() => {
                setIsUpdateModalOpen(true);
              }}
            >
              修改任务
            </Button>
          </Space>
        </>
      </Card>
    </>
  );
};
export default DemanderTaskBlock;
