import LabelerProblem from "@/components/demander_problem/labeler-problem"
import { request } from "@/utils/network";
import { transTime } from "@/utils/valid";
import { ClockCircleOutlined } from "@ant-design/icons";
import { ProCard } from "@ant-design/pro-components";
import Grid from "@mui/material/Grid";
import { Avatar, Button, Col, Divider, Row, Spin, Statistic, Tooltip, message } from "antd";
import { Dispatch, SetStateAction, useEffect, useState } from "react"

interface labelProps {
  setLabeling: Dispatch<SetStateAction<boolean>>;
  setRefreshing: Dispatch<SetStateAction<boolean>>;
  problemList: any[];
  task_id: number;
  template: string;
  time: number;
  deadline: number;
}

const Label = (props: labelProps) => {
  const [problemIndex, setProblemIndex] = useState<number>(0);
  const [problemList, setProblemList] = useState<any[]>(props.problemList);
  const [template, setTemplate] = useState<string>("TextClassification");
  const [time, setTime] = useState<number>(props.time);
  const [total, setTotal] = useState<number>(props.problemList.length);
  const [t, setT] = useState(() => {
    const storedTimer = localStorage.getItem(`${localStorage.getItem("user_id")}-${props.task_id}-${problemIndex}`)
    return storedTimer ? JSON.parse(storedTimer) : 0;
  });
  const [loading, setLoading] = useState<boolean>(false);
  const tr = (idx: number) => {
    const storedTimer = localStorage.getItem(`${localStorage.getItem("user_id")}-${props.task_id}-${idx}`);
    return storedTimer ? JSON.parse(storedTimer) : 0;
  }
  useEffect(() => {
    if (Date.now() > props.deadline * 1000) {
      props.setRefreshing(true);
      props.setLabeling(false);
      message.warning("截止时间已到，本次任务将被回收，请规范自己的标注行为")
    }
    localStorage.setItem(
      `${localStorage.getItem("user_id")}-${props.task_id}-${problemIndex}`,
      JSON.stringify(t)
    );
  }, [t]);

  useEffect(() => {
    const storedTimer = localStorage.getItem(`${localStorage.getItem("user_id")}-${props.task_id}-${problemIndex}`);
    const timerNUmber = storedTimer ? JSON.parse(storedTimer) : 0;
    setT(timerNUmber > time ? timerNUmber : 0);
    const interval = setInterval(() => {
      setT((prevTimer: number) => prevTimer + 1);
    }, 1000); // 每time毫秒（1秒）更新一次
    return () => {
      clearInterval(interval);
    };
  }, [problemIndex]);


  const postLabel = async (is_completed: boolean) => {
    const newProblems = [...problemList];
    for (let i = 0; i < newProblems.length; i++) {
      const timer = localStorage.getItem(`${localStorage.getItem("user_id")}-${props.task_id}-${i}`);
      const mytimer = timer ? JSON.parse(timer) : 0;
      if (mytimer < time) {
        newProblems[i].data = undefined;
        newProblems[i].chosen = undefined;
      }
    }
    request("/api/submit", "POST", {
      is_completed: is_completed,
      task_id: props.task_id,
      tag_data: {
        tag_time: Date.now(),
        tags: newProblems,
        tag_style: props.template
      }
    })
      .then(() => {
        message.success("标注上传成功")
        if (is_completed) {
          props.setLabeling(false);
          props.setRefreshing(true);
        }
      })
      .catch(() => {
        message.error("标注上传失败，请稍后重试")
      })
      .finally(() => {
        setLoading(false);
      })
  }

  return (
    <Spin spinning={loading} tip="题目数据加载中...">
      <ProCard split="vertical" style={{ height: "80vh", minHeight: "500px" }}>
        <ProCard colSpan={"70%"}>
          <Divider>
            <h3>标注(下面的虚线内为题目区)</h3>
          </Divider>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              <div style={{ overflowY: "auto", height: "50vh", padding: 10, border: "dotted rgb(221, 180, 32)"}}>
                <LabelerProblem
                  problemList={problemList}
                  total={total}
                  index={problemIndex}
                  setProblemList={setProblemList}
                  key={problemIndex}
                />
              </div>
              <Divider />
              <Grid>
                <Tooltip title={problemIndex === 0 ? "已经是第一题了" : undefined}>
                  <Button
                    disabled={problemIndex === 0}
                    onClick={() => {
                      setProblemIndex((i) => (i - 1));
                    }}
                  >
                    上一题
                  </Button>
                </Tooltip>
                <Divider type="vertical" />
                <Tooltip title={problemIndex === problemList.length - 1 ? "已经是最后一题了" : undefined}>
                  <Button
                    disabled={problemIndex === problemList.length - 1}
                    onClick={() => {
                      setProblemIndex((i) => (i + 1));
                    }}
                  >
                    下一题
                  </Button>
                </Tooltip>
                <Divider type="vertical" />
                <Tooltip title={"保存现有标注，未达到计时上限(右侧题号为红色)的无法保存"}>
                  <Button
                    onClick={() => {
                      setLoading(true)
                      postLabel(false);
                    }}
                  >
                    保存
                  </Button>
                </Tooltip>
                <Divider type="vertical" />
                <Tooltip title={"提交标注结果，未达到计时上限(右侧题号为红色)的题目无法提交，提交之后将不能再更改"}>
                  <Button
                    onClick={() => {
                      setLoading(true);
                      postLabel(true);
                    }}
                  >
                    提交
                  </Button>
                </Tooltip>
                <Divider type="vertical" />
                <Tooltip title="点击此处退出标注">
                  <Button onClick={() => {
                    props.setLabeling(false)
                    props.setRefreshing(true);
                  }}>
                    退出标注
                  </Button>
                </Tooltip>
                <Divider type="vertical" />
                <Tooltip title="点击此处点击此处撤销上一次的标注，仅对框选和打点有效">
                  <Button onClick={() => {
                    if(problemList[problemIndex].data){
                      const newProblems = [...problemList]
                      newProblems[problemIndex].data.pop();
                      setProblemList(newProblems);
                    }
                  }}>
                    撤销
                  </Button>
                </Tooltip>
                <Divider type="vertical" />
                <Tooltip title="点击此处点击此处清空标注，仅对框选和打点有效">
                  <Button onClick={() => {
                    if(problemList[problemIndex].data){
                      const newProblems = [...problemList]
                      newProblems[problemIndex].data.length=0;
                      setProblemList(newProblems);
                    }
                  }}>
                    清空
                  </Button>
                </Tooltip>
              </Grid>
            </>
          )
          }
        </ProCard>
        <ProCard colSpan={"30%"} >
          <Divider>
            时间
          </Divider>
          <Row>
            <Col span={12}>
              <Statistic value={t} title="本题耗时（秒）" prefix={<ClockCircleOutlined />} />
            </Col>
            <Col span={12}>
              <Statistic value={time} title="最低限时（秒）" prefix={<ClockCircleOutlined />} />
            </Col>
          </Row>
          <Row>
            <h3 style={{ textAlign: "center" }}>过期时限: {transTime(props.deadline)}</h3>
          </Row>
          <Divider>各题情况</Divider>
          <div style={{ overflowY: "auto", height: "40vh" }}>
            <Row>
              {problemList.map((_, idx) => (
                <Col key={idx}>
                  <Tooltip title={problemList[idx].description}>
                    <Avatar size={"large"}
                      onClick={() => {
                        setProblemIndex(idx)
                      }}
                      style={{
                        border: idx === problemIndex ? "solid rgb(32, 101, 221) 2px" : undefined,
                        backgroundColor: tr(idx) < time ? "red" : ((problemList[idx].chosen || problemList[idx].data) ? "green" : "orange"),
                        margin: 6
                      }}>
                      {idx + 1}
                    </Avatar>
                  </Tooltip>
                </Col>
              ))}
            </Row>
          </div>
        </ProCard>
      </ProCard>
    </Spin>
  )
}

export default Label