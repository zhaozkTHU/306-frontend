import CheckTextClassificationProblem from "./checkTextClassificationProblem";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { TextClassificationProblem } from "../../const/interface";
import { Button } from "antd";
import axios from "axios";

interface CheckTextClassificationTaskProps {
  task_id: number;
  labeler_index: number;
}

const CheckTextClassificationTask = (
  props: CheckTextClassificationTaskProps
) => {
  const [refreshing, setRefreshing] = useState<boolean>(true);
  const [passedNumber, setPassedNumber] = useState<number>(0);
  const [problems, setProblems] = useState<TextClassificationProblem[]>([]);
  const router = useRouter();
  useEffect(() => {
    if (!router.isReady) {
      return;
    }
    setRefreshing(true);
    axios
      .get(
        `/api/task/checking?task_id=${props.task_id}%labeler_index=${props.labeler_index}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then((response) => {
        const newProblems: TextClassificationProblem[] =
          response.data.task_list;
        setProblems(newProblems);
      })
      .catch((err) => {
        // alert("网络错误")
      });
    setRefreshing(false);
  }, [router]);

  const checkedNumber: number = problems.length;
  return (
    <>
      <p>已审核题目数量: {checkedNumber}</p>
      <p>通过题目数量: {passedNumber}</p>
      <p>当前通过率: {(passedNumber / checkedNumber).toFixed(3)}</p>
      {refreshing ? (
        <p>Loading...</p>
      ) : (
        problems.map((items, index) => (
          <CheckTextClassificationProblem
            problem={items}
            index={index}
            setPassedNumber={setPassedNumber}
            key={index}
          />
        ))
      )}
      <Button
        size="large"
        block
        onClick={() => {
          axios.post("/api/checking", {
            task_id: props.task_id,
            labeler_id: props.labeler_index,
            is_passed: true,
            correct_number: passedNumber,
          });
        }}
      >
        合格
      </Button>
      <Button
        size="large"
        block
        onClick={() => {
          axios.post("/api/checking", {
            task_id: props.task_id,
            labeler_id: props.labeler_index,
            is_passed: false,
            correct_number: passedNumber,
          });
        }}
      >
        不合格
      </Button>
    </>
  );
};

export default CheckTextClassificationTask;
