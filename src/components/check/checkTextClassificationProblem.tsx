import { Card, Checkbox, Radio, RadioChangeEvent } from "antd";
import { Dispatch, SetStateAction, useState } from "react";

interface CheckTextClassificationProps {
  description: string;
  options: string[];
  chosen: boolean[];
  index: number;
  setPassedNumber: Dispatch<SetStateAction<number>>;
}

const CheckTextClassificationProblem = (props: CheckTextClassificationProps) => {
  // const [source, setSource] = useState<string>("");
  const [current, setCurrent] = useState<string>("fail");
  return (
    <Card title="问题">
      <>
        <p>{props.description}</p>
        {props.options.map((option, index) => (
          <div key={index}>
            <Checkbox
              defaultChecked={props.chosen[index]}
              disabled={true}
            >
              {option}
            </Checkbox>
          </div>
        ))}
        <Radio.Group
          defaultValue="fail"
          onChange={(e: RadioChangeEvent) => {
            const s = current;
            const c = e.target.value;
            if (s === "fail" && c === "pass") {
              props.setPassedNumber((b) => b + 1);
            } else if (s === "pass" && c === "fail") {
              props.setPassedNumber((b) => b - 1);
            }
            setCurrent(() => e.target.value);
          }}
        >
          <Radio value="pass">合格</Radio>
          <Radio value="fail">不合格</Radio>
        </Radio.Group>
      </>
    </Card>
  );
};

export default CheckTextClassificationProblem;
