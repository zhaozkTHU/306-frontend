import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  Button,
  Space,
  Spin,
  Modal,
  Descriptions,
  Collapse,
  Alert,
  Tooltip,
  Popconfirm,
  message,
  Tag,
} from "antd";
import { ColumnsType } from "antd/es/table";
import { transTime } from "@/utils/valid";
import { Table } from "antd/lib";
import DataExportCallback from "@/components/data_export/dataExport";
import UpdateTask from "../task_manage/update-task";
import CheckModel from "../check/checkModel";
import { mapState2ColorChinese } from "@/const/interface";
import { request } from "../../utils/network";

interface DemanderTaskTableEntry {
  task_id: number;
  create_at: number;
  deadline: number;
  title: string;
  state: string[];
  labeler_number: number;
  labeler_id: number[];
  template: string;
  label_state: string[];
  pass_check: boolean;
}

interface DemanderTaskListProps {
  type: string;
}

const DemanderTaskList = (props: DemanderTaskListProps) => {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [tasks, setTasks] = useState<DemanderTaskTableEntry[]>([]);
  const [labelerId, setLabelerId] = useState<number>(-1);
  const [isSample, setIsSample] = useState<boolean>(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isCheckModalOpen, setIsCheckModalOpen] = useState<boolean>(false);
  const delete_task = async (task_id: number) => {
    axios
      .delete(`/api/task`, {
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem("token")}`,
        },
        params: { task_id: task_id },
      })
      .then((response) => {
        message.success("删除成功");
      })
      .catch((err) => {
        if (err.response) {
          message.error(`删除失败，${err.response.data.message}`);
        } else {
          message.error("删除失败，网络错误");
        }
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(true);
      });
  };
  const [detail, setDetail] = useState<DemanderTaskTableEntry>({
    task_id: -1,
    create_at: 0,
    deadline: 0,
    title: "标题五个字",
    state: [],
    labeler_number: 0,
    labeler_id: [],
    template: "模板五个字",
    label_state: [],
    pass_check: false,
  });
  const { Panel } = Collapse;
  const DemanderTaskTableColumns: ColumnsType<any> = [
    {
      title: "标题",
      dataIndex: "title",
      key: "title",
      align: "center",
      width: "25%",
      render: (text) => <p>{text}</p>,
    },
    {
      title: "创建时间",
      dataIndex: "create_at",
      key: "create_at",
      align: "center",
      width: "20%",
      render: (timeStamp) => <p>{transTime(timeStamp)}</p>,
      sorter: (a, b) => a.create_at - b.create_at,
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "任务状态",
      dataIndex: "state",
      key: "state",
      align: "center",
      filterSearch: true,
      filters: [
        {
          text: "标注中",
          value: "labeling",
        },
        {
          text: "待审核",
          value: "checking",
        },
        {
          text: "已完成",
          value: "completed",
        },
      ],
      onFilter: (values, record) => record.state.indexOf(values) !== -1,
      render: (state) => {
        return (
          <Space size={[0, 8]} wrap>
            {state.map((s: string, idx: number) => (
              // <DemanderStateTag type={s} key={idx} />
              <Tag color={mapState2ColorChinese[s].color} key={idx}>
                {mapState2ColorChinese[s].description}
              </Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: "操作",
      dataIndex: "operation",
      key: "operation",
      align: "center",
      width: "32%",
      render: (_, record) => {
        return (
          <>
            <Button
              type="link"
              onClick={() => {
                setIsDetailModalOpen(true);
                setDetail(record);
              }}
            >
              查看
            </Button>
            <Popconfirm
              title="导出"
              okText="是"
              cancelText="否"
              description="是否归并数据后导出?"
              onConfirm={() => {
                DataExportCallback(record.task_id, true);
              }}
              onCancel={() => {
                DataExportCallback(record.task_id, false);
              }}
            >
              <Button type="link">导出</Button>
            </Popconfirm>
            <Button
              type="link"
              onClick={() => {
                setLoading(true);
                delete_task(record.task_id);
              }}
            >
              删除
            </Button>
          </>
        );
      },
    },
  ];

  const LabelerTableColumns: ColumnsType<any> = [
    {
      title: "标注者编号",
      dataIndex: "labeler_id",
      key: "labeler_id",
      align: "center",
    },
    {
      title: "标注者状态",
      dataIndex: "labeler_state",
      key: "labeler_state",
      align: "center",
      render: (state) => {
        return (
          <Space size={[0, 8]} wrap>
            <Tag color={mapState2ColorChinese[state].color}>
              {mapState2ColorChinese[state].description}
            </Tag>
          </Space>
        );
      },
    },
    {
      title: "操作",
      dataIndex: "labeler_detail",
      key: "labeler_detail",
      align: "center",
      render: (_, record) => {
        return (
          <>
            <Tooltip title="处于待审核状态可以审核">
              <Button
                type="link"
                disabled={record.labeler_state != "checking"}
                onClick={() => {
                  setLabelerId(record.labeler_id);
                  setIsSample(false);
                  setIsCheckModalOpen(true);
                }}
              >
                全量审核
              </Button>
            </Tooltip>
            <Tooltip title="处于待审核状态可以审核">
              <Button
                type="link"
                disabled={record.labeler_state != "checking"}
                onClick={() => {
                  setLabelerId(record.labeler_id);
                  setIsSample(true);
                  setIsCheckModalOpen(true);
                }}
              >
                抽样审核
              </Button>
            </Tooltip>
            <Tooltip title="审核未通过可以举报">
              <Button disabled={record.labeler_state != "failed"} type="link">
                举报
              </Button>
            </Tooltip>
          </>
        );
      },
    },
  ];

  useEffect(() => {
    request(`/api/task${props.type}`, "GET")
      .then((response) => {
        const newTasks = response.data.demander_tasks.map((task: any) => {
          return { ...task };
        });
        setTasks(newTasks);
      })
      .catch((err) => {
        console.log(err.reponse?.data);
      });
    setRefreshing(false);
  }, [router, refreshing]);
  return (
    <>
      <Spin spinning={refreshing} tip="任务列表加载中">
        <Spin spinning={loading} tip="Loading...">
          <Modal
            open={isDetailModalOpen}
            onCancel={() => {
              setIsDetailModalOpen(false);
            }}
            footer={null}
            width={"100%"}
            destroyOnClose={true}
            centered
          >
            <Modal
              open={isCheckModalOpen}
              onCancel={() => {
                setIsCheckModalOpen(false);
              }}
              footer={null}
              destroyOnClose={true}
              width={"100%"}
            >
              <CheckModel
                task_id={detail.task_id}
                labeler_index={labelerId}
                is_sample={isSample}
                template={detail.template}
                setIsCheckModalOpen={setIsCheckModalOpen}
              />
            </Modal>
            {detail.pass_check ? (
              <></>
            ) : (
              <Alert message="该任务尚未通过管理员审核!" type="warning" showIcon />
            )}
            <h3>任务详情</h3>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="标题" span={2}>
                {detail.title}
              </Descriptions.Item>
              <Descriptions.Item label="创建时间" span={1}>
                {transTime(detail.create_at)}
              </Descriptions.Item>
              <Descriptions.Item label="截止时间" span={1}>
                {transTime(detail.deadline)}
              </Descriptions.Item>
              <Descriptions.Item label="模板" span={1}>
                {detail.template}
              </Descriptions.Item>
              <Descriptions.Item label="状态" span={1}>
                <Space size={[0, 8]} wrap>
                  {detail.state.map((s: string, idx: number) => (
                    <Tag color={mapState2ColorChinese[s].color} key={idx}>
                      {mapState2ColorChinese[s].description}
                    </Tag>
                  ))}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="要求标注方人数" span={1}>
                {detail.labeler_number}
              </Descriptions.Item>
            </Descriptions>
            <h3>标注者信息</h3>
            <Table
              columns={LabelerTableColumns}
              dataSource={detail.labeler_id.map((id, idx) => {
                return {
                  labeler_id: id,
                  labeler_state: detail.label_state[idx],
                };
              })}
            />
            <h3>题目详情</h3>
            <Collapse>
              <Panel key={""} header={"点击此处查看题目详情，尚未分发的任务可以更改题目内容"}>
                <UpdateTask taskId={detail.task_id} />
              </Panel>
            </Collapse>
          </Modal>
          <Table columns={DemanderTaskTableColumns} dataSource={tasks} loading={refreshing}></Table>
        </Spin>
      </Spin>
    </>
  );
};

export default DemanderTaskList;
