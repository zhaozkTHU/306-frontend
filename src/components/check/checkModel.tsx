import { Button, Radio, RadioChangeEvent, Spin } from "antd";
import { message } from "antd/lib";
import axios from "axios";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import Problem from "../demander_problem/problem";

interface CheckModelProps {
  task_id: number;
  labeler_index: number;
  is_sample: boolean;
  template: string;
  setIsCheckModalOpen: Dispatch<SetStateAction<boolean>>;
  setRefreshing: Dispatch<SetStateAction<boolean>>;
}

/**
 * A checking model for checking interface
 *
 */
const CheckModel = (props: CheckModelProps) => {
  const [refreshing, setRefreshing] = useState<boolean>(true);
  const [passedNumber, setPassedNumber] = useState<number>(0);
  const [problems, setProblems] = useState<any[]>([]);
  const router = useRouter();
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
        setProblems(newProblems);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setRefreshing(false);
        props.setRefreshing(true);
      });
  }, [router, props.labeler_index, props.task_id]);
  useEffect(() => {
    result = problems.slice();
  }, [problems]);

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
        props.setIsCheckModalOpen(false);
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
        props.setRefreshing(true);
      });
  };
  /**
   *
   * Deal with the all checking or sampling checking
   */
  let result = problems.slice();
  const totalNumber = problems.length;
  if (props.is_sample) {
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    result = result.slice(0, Math.ceil(totalNumber / 3));
  }

  const checkedNumber: number = result.length;
  return (
    <Spin spinning={refreshing}>
      <p>审核题目数量: {checkedNumber}</p>
      <p>通过题目数量: {passedNumber}</p>
      <p>当前通过率: {(passedNumber / checkedNumber).toFixed(3)}</p>
      {refreshing ? (
        <p>Loading...</p>
      ) : (
        result.map((items, index) => (
          <>
            <Problem
              problem={items}
              index={index}
              template={`${props.template}`}
              showto="demander"
            />
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
          </>
        ))
      )}
      <Button
        size="large"
        block
        onClick={() => {
          setRefreshing(true);
          postCheck(true);
        }}
      >
        合格
      </Button>
      <Button
        size="large"
        block
        onClick={() => {
          setRefreshing(true);
          postCheck(false);
        }}
      >
        不合格
      </Button>
    </Spin>
  );
};

export default CheckModel;
