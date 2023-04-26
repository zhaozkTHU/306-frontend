import { Card, Checkbox, Divider, Image, Radio } from "antd";
import CanvasImage from "../canvas_image/canvas-image";
import ImageFormatter from "../image-formatter";
import MyAudio from "../my-audio";
import MyImage from "../my-img";
import MyVideo from "../my-video";

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
                  height="100%"
                  width="100%"
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
      <CanvasImage data={props.problem.data ? props.problem.data : []} src={props.problem.url} type="point" />
    );
  } else if (props.template == "ImageFrame") {
    problemContent = (
      <CanvasImage data={props.problem.data ? props.problem.data : []} src={props.problem.url} type="rectangle" />
    )
  } else if (props.template == "SoundTag") {
    problemContent = (
      <>
        <MyAudio url={props.problem.url} />
        <Radio.Group value={props.problem.data ? props.problem.data.choiceIndex : null} disabled={true}>
          {props.problem.choice.map((ch: any, idx: number) =>
            <Radio value={idx} key={idx}>
              <p>{`${ch.text}    ${ch.needInput ? "(该选项需要输入)" : "(该选项无需输入)"}`}</p>
              <p>{ch.needInput && props.problem.data && props.problem.data.choiceIndex === idx ? `标注方输入: ${props.problem.data.input}` : "无输入"}</p>
            </Radio>
          )}
        </Radio.Group>
      </>
    )
  } else if (props.template == "VideoTag") {
    problemContent = (
      <>
        <MyVideo url={props.problem.url}
          style={{
            width: "300px",
            height: "200px",
          }}
        />
        <Divider />
        <Radio.Group value={props.problem.data ? props.problem.data.choiceIndex : null} disabled={true}>
          {props.problem.choice.map((ch: any, idx: number) =>
            <Radio value={idx} key={idx}>
              <p>{`${ch.text}    ${ch.needInput ? "(该选项需要输入)" : "(该选项无需输入)"}`}</p>
              <p>{ch.needInput && props.problem.data && props.problem.data.choiceIndex === idx ? `标注方输入: ${props.problem.data.input}` : "无输入"}</p>
            </Radio>
          )}
        </Radio.Group>
      </>
    )
  }
  return (
    <Card title={`题目${props.index + 1}`}>
      <h1>{props.problem.description}</h1>
      {problemContent}
    </Card>
  );
};

export default Problem;
