export interface User {
  username: string;
  password: string;
}

export interface Problem {
  description: string;
}

export interface TextClassificationProblem extends Problem {
  options: string[];
  chosen?: boolean[];
}

export interface ImagesClassificationProblem extends Problem {
  /** 图片url */
  options: string[];
  chosen?: boolean[];
}

export interface FaceTagProblem extends Problem {
  url: string;
  /** 点坐标数组 */
  data?: {
    x: number;
    y: number;
  }[];
}

export interface ImageFrameProblem extends Problem {
  url: string;
  /** 图片框选矩形，左下和右上确定矩形 */
  data?: {
    x: number; // leftup x
    y: number;
    width: number;
    height: number;
  }[];
}

export interface TagProblem extends Problem {
  url: string;
  /** 有些选项需要标注方填写 */
  choice: {
    text: string;
    needInput: boolean;
  }[];
  data?: {
    choiceIndex: number;
    input?: string;
  };
}

export interface TextReviewProblem extends Problem {
  content: string;
  data?: boolean;
}

export interface FileReviewProblem extends Problem {
  url: string;
  data?: boolean;
}

export interface PointsCloud {
  description: string;
}

export interface TaskInfo {
  task_id?: number;
  title: string;
  create_at: number;
  deadline: number;
  template:
    | "TextClassification"
    | "ImagesClassification"
    | "FaceTag"
    | "ImageFrame"
    | "SoundTag"
    | "VideoTag"
    | "TextReview"
    | "ImageReview"
    | "VideoReview"
    | "AudioReview"
    | "Custom";
  /** 仅在`template`为`Custom`时非空 */
  templates?: string[];
  reward: number;
  time: number;
  labeler_number: number;
  demander_id?: number;
  batch: boolean;
  task_data?:
    | TextClassificationProblem[]
    | ImagesClassificationProblem[]
    | FaceTagProblem[]
    | ImageFrameProblem[]
    | TagProblem[]
    | TextReviewProblem[]
    | FileReviewProblem[]
    | Problem[];
  batch_file?: string;
}

export interface TextClassificationData {
  label_data: boolean[][];
}

export function isFaceTagProblem(data: any): data is FaceTagProblem {
  return (
    typeof data.description === "string" &&
    typeof data.url === "string" &&
    (data.data === undefined ||
      (Array.isArray(data.data) &&
        data.data.every(
          (point: any) =>
            Array.isArray(point) &&
            point.length === 2 &&
            typeof point[0] === "number" &&
            typeof point[1] === "number"
        )))
  );
}

export function isImageFrameProblem(data: any): data is ImageFrameProblem {
  return (
    typeof data.description === "string" &&
    typeof data.url === "string" &&
    (data.data === undefined ||
      (Array.isArray(data.data) &&
        data.data.every((rect: any) => {
          return (
            typeof rect.leftdown === "object" &&
            Array.isArray(rect.leftdown) &&
            rect.leftdown.length === 2 &&
            typeof rect.leftdown[0] === "number" &&
            typeof rect.leftdown[1] === "number" &&
            typeof rect.rightup === "object" &&
            Array.isArray(rect.rightup) &&
            rect.rightup.length === 2 &&
            typeof rect.rightup[0] === "number" &&
            typeof rect.rightup[1] === "number"
          );
        })))
  );
}

export function isClassificationProblem(data: any): data is TextClassificationProblem {
  return (
    typeof data.description === "string" &&
    Array.isArray(data.options) &&
    (data.chosen === undefined || Array.isArray(data.chosen))
  );
}
export function isTextClassificationProblem(data: any): data is TextClassificationProblem {
  return (
    typeof data.description === "string" &&
    Array.isArray(data.options) &&
    (data.chosen === undefined || Array.isArray(data.chosen))
  );
}
export function isImagesClassificationProblem(data: any): data is TextClassificationProblem {
  return (
    typeof data.description === "string" &&
    Array.isArray(data.options) &&
    (data.chosen === undefined || Array.isArray(data.chosen))
  );
}
export function isTagProblem(data: any): data is TagProblem {
  return (
    typeof data.description === "string" &&
    typeof data.url === "string" &&
    Array.isArray(data.choice) &&
    data.choice.every((c: any) => {
      return typeof c.text === "string" && typeof c.needInput === "boolean";
    }) &&
    (data.data === undefined ||
      (typeof data.data.choiceIndex === "number" &&
        (data.data.input === undefined || typeof data.data.input === "string")))
  );
}

type StateColor = {
  color: string;
  description: string;
};

type StateColors = {
  [state: string]: StateColor;
};

export const mapState2ColorChinese: StateColors = {
  designated: { color: "rgb(160, 227, 109)", description: "已分发" },
  labeling: { color: "rgb(33, 198, 198)", description: "标注中" },
  rejected: { color: "rgb(203, 8, 21)", description: "已拒绝" },
  checking: { color: "#c8c027", description: "待审核" },
  completed: { color: "rgb(33, 198, 39)", description: "已完成" },
  failed: { color: "rgb(252, 61, 14)", description: "不合格" },
};

type EnEntemplateZhtemplate = {
  [state: string]: string;
};

export const mapEntemplate2Zhtemplate: EnEntemplateZhtemplate = {
  TextClassification: "文本分类",
  ImagesClassification: "图片分类",
  FaceTag: "骨骼打点",
  ImageFrame: "图片框选",
  SoundTag: "音频标注",
  VideoTag: "视频标注",
};
