import { Button } from "antd";
import { message } from "antd/lib";
import axios from "axios";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import CheckImgClassificationProblem from "./checkImgClassificationProblem";
import CheckTextClassificationProblem from "./checkTextClassificationProblem";

interface CheckModelProps {
  task_id: number;
  labeler_index: number;
  is_sample: boolean;
  template: string;
  isShow: boolean;
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
    if (!router.isReady) {
      return;
    }
    setRefreshing(true);
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
        console.log(err)
      });
    setRefreshing(false);
  }, [router, props.labeler_index, props.task_id]);


  /**
   * 
   * Deal with the all checking or sampling checking
   */
  let result = problems.slice();
  const totalNumber = problems.length;
  if (props.is_sample) {
    for (let i=result.length-1;i>0;i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    result = result.slice(0, Math.ceil(totalNumber/3));
  }

  const checkedNumber: number = result.length;
  return (
    <>
      <p>审核题目数量: {checkedNumber}</p>
      <p>通过题目数量: {passedNumber}</p>
      <p>当前通过率: {(passedNumber / checkedNumber).toFixed(3)}</p>
      {refreshing ? (
        <p>Loading...</p>
      ) : (
        result.map((items, index) => {
          if (props.template==="TextClassification") {
            return (
              <CheckTextClassificationProblem
                description={items.description}
                options={items.options}
                chosen={items.chosen?items.chosen:[false]}
                index={index}
                setPassedNumber={setPassedNumber}
                key={index}
              />
            )
          } else if (props.template==="ImagesClassification") {
            return (
              <CheckImgClassificationProblem
                description={items.description}
                options={items.options}
                chosen={items.chosen?items.chosen:[false]}
                index={index}
                setPassedNumber={setPassedNumber}
                key={index}
              />
            )
          }
          
        })
      )}
      <Button
        size="large"
        block
        onClick={() => {
          axios.post(
            "/api/checking",
            {
              task_id: props.task_id,
              labeler_id: props.labeler_index,
              is_passed: true,
              correct_number: props.is_sample?undefined:passedNumber,
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          )
          .then(() => {
            message.success("审核结果提交成功")
          })
          .catch((error) => {
            if (error.response) {
              message.error(`审核结果提交失败，${error.response.data.message}`);
            } else {
              message.error("网络失败，请稍后再试");
            }
          })
          .finally(() => {
            props.setRefreshing(true)
          });
        }}
      >
        合格
      </Button>
      <Button
        size="large"
        block
        onClick={() => {
          axios.post(
            "/api/checking",
            {
              task_id: props.task_id,
              labeler_id: props.labeler_index,
              is_passed: false,
              correct_number: props.is_sample?undefined:passedNumber,
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          )
          .then(() => {
            message.success("审核结果提交成功")
          })
          .catch((error) => {
            if (error.response) {
              message.error(`审核结果提交失败，${error.response.data.message}`);
            } else {
              message.error("网络失败，请稍后再试");
            }
          })
          .finally(() => {
            props.setRefreshing(true)
          })
          ;
        }}
      >
        不合格
      </Button>
    </>
  );
};

export default CheckModel;