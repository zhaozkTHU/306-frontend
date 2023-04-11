import { Card, Checkbox, Radio, RadioChangeEvent, Image, Divider } from "antd";
import { Dispatch, Key, SetStateAction, useState } from "react";
import MyImage from "../my-img";

interface CheckImgClassificationProps {
  description: string;
  options: string[];
  chosen: boolean[];
  index: number;
  setPassedNumber: Dispatch<SetStateAction<number>>;
}

const CheckImgClassificationProblem = (props: CheckImgClassificationProps) => {
  const [current, setCurrent] = useState<string>("fail");

  return (
    <Card title={`题目${props.index}`}>
      <>
        <h1>{props.description}</h1>
        <Image.PreviewGroup>
        {props.options.map((option, index) => (
          <div key={index}>
            <Checkbox defaultChecked={props.chosen[index]} disabled={true}>
              <MyImage url={`/api/image?url=${option}`}  />
            </Checkbox>
            <Divider />
          </div>
        ))}
        </Image.PreviewGroup>
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

export default CheckImgClassificationProblem;