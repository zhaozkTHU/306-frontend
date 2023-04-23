import { Card, Checkbox, Divider, Image } from "antd";
import MyImage from "../my-img";

interface ProbelmProps {
  problem: any;
  index: number;
  template: string;
  showto: string;
}

const Problem = (props: ProbelmProps) => {
  let problemContent;
  if (props.template == "TextClassification") {
    problemContent = props.problem.options.map((option: string, index: number) => (
      <div key={index}>
        <Checkbox
          defaultChecked={props.showto == "demander" ? props.problem.chosen[index] : false}
          disabled={true}
        >
          {option}
        </Checkbox>
      </div>
    ));
  } else if (props.template == "ImagesClassification") {
    problemContent = (
      <Image.PreviewGroup>
        {props.problem.options.map((option: string, index: number) => (
          <div key={index}>
            <Checkbox
              defaultChecked={props.showto == "demander" ? props.problem.chosen[index] : false}
              disabled={true}
            >
              <MyImage url={`${option}`} />
            </Checkbox>
            <Divider />
          </div>
        ))}
      </Image.PreviewGroup>
    );
  } else if (props.template == "FaceTag") {
    problemContent = <MyImage url={`${props.problem.url}`} />;
  } else if (props.template == "ImageFrame") {
  } else if (props.template == "SoundTag") {
  } else if (props.template == "VideoTag") {
  }
  return (
    <Card title={`题目${props.index + 1}`}>
      <h1>{props.problem.description}</h1>
      {problemContent}
    </Card>
  );
};

export default Problem;
