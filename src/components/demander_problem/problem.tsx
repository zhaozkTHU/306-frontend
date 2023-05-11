import { Checkbox, Col, Divider, Image, Radio, Row } from "antd";
import CanvasImage from "../canvas_image/canvas-image";
import ImageFormatter from "../image-formatter";
import MyAudio from "../my-audio";
import MyImage from "../my-img";
import MyVideo from "../my-video";

interface ProbelmProps {
  total: number;
  problem: any;
  index: number;
}

const Problem = (props: ProbelmProps) => {
  if (props.problem.template == "TextClassification") {
    const selected: string[] = [];
    for (let i = 0; i < props.problem.options.length; i++) {
      if (props.problem.chosen[i]) {
        selected.push(props.problem.options[i]);
      }
    }
    return (
    <>
      <h3>
        第{props.index + 1}/{props.total}题: {props.problem.description}
      </h3>
      <Checkbox.Group options={props.problem.options} value={selected} disabled={true} />
    </>
  )
  } else if (props.problem.template == "ImagesClassification") {
    return (<>
      <h3>
        第{props.index + 1}/{props.total}题: {props.problem.description}
      </h3>
      <Image.PreviewGroup>
        <Row wrap={true}>
          {props.problem.options.map((option: string, index: number) => (
            <Col key={index}>
              <Checkbox
                checked={props.problem.chosen[index]}
                disabled={true}
              >
                <ImageFormatter>
                  <MyImage
                    url={`${option}`}
                    style={{
                      objectFit: "contain",
                      objectPosition: "center center",
                    }}
                    alt="图片加载中，若长时间无反应请刷新重试"
                    height="100%"
                    width="100%"
                  />
                </ImageFormatter>
              </Checkbox>
            </Col>
          ))}
        </Row>
      </Image.PreviewGroup>
    </>)
  } else if (props.problem.template == "FaceTag") {
    return (
      <>
        <h3>
          第{props.index + 1}/{props.total}题: {props.problem.description}
        </h3>
        <CanvasImage
          data={props.problem.data}
          src={props.problem.url}
          type="point"
        />
      </>
    )
  } else if (props.problem.template == "ImageFrame") {
    return (<>
      <h3>
        第{props.index + 1}/{props.total}题: {props.problem.description}
      </h3>
      <CanvasImage
        data={props.problem.data}
        src={props.problem.url}
        type="rectangle"
      />
    </>)
  } else if (props.problem.template == "SoundTag") {
    return (<>
      <h3>
        第{props.index + 1}/{props.total}题: {props.problem.description}
      </h3>
      <>
        <MyAudio url={props.problem.url} />
        <Divider />
        <Radio.Group
          value={props.problem.data.choiceIndex}
          disabled={true}
        >
          {props.problem.choice.map((ch: any, idx: number) => (
            <Radio value={idx} key={idx}>
              <>{`${ch.text}    ${ch.needInput ? "(该选项需要输入)" : "(该选项无需输入)"}`}</>
              <Divider type="vertical" />
              <>
                {ch.needInput && props.problem.data && props.problem.data.choiceIndex === idx
                  ? `标注方输入: ${props.problem.data.input}`
                  : "无输入"}
              </>
            </Radio>
          ))}
        </Radio.Group>
      </>
    </>)
  } else if (props.problem.template == "VideoTag") {
    return (
      <>
        <h3>
          第{props.index + 1}/{props.total}题: {props.problem.description}
        </h3>
        <>
          <MyVideo
            url={props.problem.url}
            style={{
              width: "300px",
              height: "200px",
            }}
          />
          <Divider />
          <Radio.Group
            value={props.problem.data.choiceIndex}
            disabled={true}
          >
            {props.problem.choice.map((ch: any, idx: number) => (
              <Radio value={idx} key={idx}>
                <p>{`${ch.text}    ${ch.needInput ? "(该选项需要输入)" : "(该选项无需输入)"}`}</p>
                <p>
                  {ch.needInput && props.problem.data && props.problem.data.choiceIndex === idx
                    ? `标注方输入: ${props.problem.data.input}`
                    : "无输入"}
                </p>
              </Radio>
            ))}
          </Radio.Group>
        </>
      </>
    )
  } else if (props.problem.template == "TextReview") {
    return (
      <>
        <h3>
          第{props.index + 1}/{props.total}题: {props.problem.description}
        </h3>
        <>
          <p>{props.problem.content}</p>
          <Radio.Group value={props.problem.data} disabled>
            <Radio value={true}>合格</Radio>
            <Radio value={false}>不合格</Radio>
          </Radio.Group>
        </>
      </>
    )
  } else if (props.problem.template == "ImageReview") {
    return (
      <>
        <h3>
          第{props.index + 1}/{props.total}题: {props.problem.description}
        </h3>
        <>
          <ImageFormatter>
            <MyImage
              url={props.problem.url}
              style={{
                objectFit: "contain",
                objectPosition: "center center",
              }}
              alt="图片加载失败"
              height="100%"
              width="100%"
            />
          </ImageFormatter>
          <Radio.Group value={props.problem.data} disabled>
            <Radio value={true}>合格</Radio>
            <Radio value={false}>不合格</Radio>
          </Radio.Group>
        </>
      </>
    )
  } else if (props.problem.template == "VideoReview") {
    return (<>
      <h3>
        第{props.index + 1}/{props.total}题: {props.problem.description}
      </h3>
      <>
        <MyVideo
          url={props.problem.url}
          style={{
            width: "300px",
            height: "200px",
          }}
        />
        <Divider />
        <Radio.Group value={props.problem.data} disabled>
          <Radio value={true}>合格</Radio>
          <Radio value={false}>不合格</Radio>
        </Radio.Group>
      </>
    </>)
  } else if (props.problem.template == "AudioReview") {
    return (
      <>
        <h3>
          第{props.index + 1}/{props.total}题: {props.problem.description}
        </h3>
        <>
          <MyAudio url={props.problem.url} />
          <Divider />
          <Radio.Group value={props.problem.data} disabled>
            <Radio value={true}>合格</Radio>
            <Radio value={false}>不合格</Radio>
          </Radio.Group>
        </>
      </>
    )
  } else {
    return <>Error Task Template</>
  }
};

export default Problem;
