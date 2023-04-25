import { Card, Checkbox, Divider, Image } from "antd";
import { CompositionImage, ImageProps } from "antd/es/image";
import CanvasImage from "../canvas_image/canvas-image";
import ImageFormatter from "../image-formatter";
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
    const selected: string[] = [];
    if (props.showto == "demander") {
      for (let i = 0; i < props.problem.options.length; i++) {
        if (props.problem.chosen[i]) {
          selected.push(props.problem.options[i]);
        }
      }
    }
    problemContent = (
      <Checkbox.Group options={props.problem.options} defaultValue={selected} disabled={true} />
    )
  } else if (props.template == "ImagesClassification") {
    problemContent = (
      <Image.PreviewGroup>
        {props.problem.options.map((option: string, index: number) => (
          <div key={index}>
            <Checkbox
              defaultChecked={props.showto == "demander" ? props.problem.chosen[index] : false}
              disabled={true}
            >
              <ImageFormatter>
                <MyImage url={`${option}`} 
                  style={{
                    objectFit: "contain",
                    objectPosition: "center center"
                  }}
                  alt="图片加载失败"
                />
              </ImageFormatter>
            </Checkbox>
            <Divider />
          </div>
        ))}
      </Image.PreviewGroup>
    );
  } else if (props.template == "FaceTag") {
    problemContent = (
      <CanvasImage data={props.problem.data} src={props.problem.url} type="point" />
    );
  } else if (props.template == "ImageFrame") {
    problemContent = (
      <CanvasImage data={props.problem.data} src={props.problem.url} type="rectangle" />
    )
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
