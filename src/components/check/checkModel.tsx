import { Button, Carousel, Col, Divider, Radio, RadioChangeEvent, Row, Spin } from "antd";
import { message } from "antd/lib";
import axios from "axios";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import Problem from "../demander_problem/problem";

interface CheckModelProps {
  task_id: number;
  labeler_index: number;
  is_sample: boolean;
  template: string;
  rate: number;
  setIsLabelerList: Dispatch<SetStateAction<boolean>>;
}

/**
 * A checking model for checking interface
 *
 */
const CheckModel = (props: CheckModelProps) => {
  const [refreshing, setRefreshing] = useState<boolean>(true);
  const [passedNumber, setPassedNumber] = useState<number>(0);
  // const [problems, setProblems] = useState<any[]>([]);
  const [result, setResult] = useState<any[]>([]);
  const [checkedNumber, setCheckedNumber] = useState<number>(0);
  const router = useRouter();
  const CarouselRef = useRef<any>(null);
  // let result: any[] = [];
  /**
   * Request for the labeled data
   *
   */
  useEffect(() => {
    axios
      .get(`/api/task/checking?task_id=${props.task_id}&labeler_index=${props.labeler_index}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        const newProblems: any[] = JSON.parse(response.data.label_data);
        const totalNumber = newProblems.length;
        setCheckedNumber(Math.ceil((totalNumber * props.rate) / 100));
        setResult(newProblems);
        if (props.is_sample) {
          for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newProblems[i], newProblems[j]] = [newProblems[j], newProblems[i]];
          }
          setResult(newProblems.slice(0, Math.ceil((totalNumber * props.rate) / 100)));
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setRefreshing(false);
        // props.setRefreshing(true);
      });
  }, [router, props.labeler_index, props.task_id]);

  // useEffect(() => {
  //   result = problems.slice();
  //   const totalNumber = problems.length;
  //   if (props.is_sample) {
  //     for (let i = result.length - 1; i > 0; i--) {
  //       const j = Math.floor(Math.random() * (i + 1));
  //       [result[i], result[j]] = [result[j], result[i]];
  //     }
  //     result = result.slice(0, Math.ceil(totalNumber * props.rate / 100));
  //   }
  //   checkedNumber = result.length;
  // }, [problems]);

  const postCheck = async (is_passed: boolean) => {
    axios
      .post(
        "/api/checking",
        {
          task_id: props.task_id,
          labeler_id: props.labeler_index,
          is_passed: is_passed,
          correct_number: props.is_sample ? undefined : passedNumber,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then(() => {
        message.success("审核结果提交成功");
        // props.setIsCheckModalOpen(false);
      })
      .catch((error) => {
        if (error.response) {
          message.error(`审核结果提交失败，${error.response.data.message}`);
        } else {
          message.error("网络失败，请稍后再试");
        }
      })
      .finally(() => {
        setRefreshing(false);
        // props.setRefreshing(true);
      });
  };
  /**
   *
   * Deal with the all checking or sampling checking
   */
  return (
    <Spin spinning={refreshing}>
      <Row>
        <Col span={8}>审核题目数量: {checkedNumber}</Col>
        <Col span={8}>通过题目数量: {passedNumber}</Col>
        <Col span={8}>当前通过率: {(passedNumber / checkedNumber).toFixed(2)}</Col>
      </Row>
      <br />
      {refreshing ? (
        <p>Loading...</p>
      ) : (
        <Carousel dots={false} ref={CarouselRef}>
          {result.map((items, index) => (
            <div key={index}>
              <Problem
                problem={items}
                index={index}
                template={`${props.template}`}
                showto="demander"
              />
              <Divider />
              <Row>
                <Col span={14}>
                  <Radio.Group
                    defaultValue="fail"
                    onChange={(e: RadioChangeEvent) => {
                      if (e.target.value === "pass") {
                        setPassedNumber((b) => b + 1);
                      } else if (e.target.value === "fail") {
                        setPassedNumber((b) => b - 1);
                      }
                    }}
                  >
                    <Radio value="pass">合格</Radio>
                    <Radio value="fail">不合格</Radio>
                  </Radio.Group>
                </Col>
                <Col span={6}>
                  <Button
                    disabled={index === 0}
                    onClick={() => {
                      CarouselRef.current?.goTo(index - 1, true);
                    }}
                  >
                    上一题
                  </Button>
                </Col>
                <Col span={4}>
                  <Button
                    disabled={index === result.length - 1}
                    onClick={() => {
                      CarouselRef.current?.goTo(index + 1, true);
                    }}
                  >
                    下一题
                  </Button>
                </Col>
              </Row>
              <Divider />
            </div>
          ))}
        </Carousel>
      )}
      <Row>
        <Col span={20}>
          <Button
            size="large"
            onClick={() => {
              setRefreshing(true);
              postCheck(true);
            }}
            style={{
              backgroundColor: "#3b5999",
              color: "white",
            }}
          >
            合格
          </Button>
          <Divider type="vertical" />
          <Button
            size="large"
            style={{
              backgroundColor: "#3b5999",
              color: "white",
            }}
            onClick={() => {
              setRefreshing(true);
              postCheck(false);
            }}
          >
            不合格
          </Button>
        </Col>
        <Col>
          <Button
            size="large"
            style={{
              backgroundColor: "#3b5999",
              color: "white",
            }}
            onClick={() => {
              props.setIsLabelerList(true);
            }}
          >
            退出审核
          </Button>
        </Col>
      </Row>
    </Spin>
  );
};

export default CheckModel;
