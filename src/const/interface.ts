export interface User {
  username: string;
  password: string;
}

export interface TextClassificationProblem {
  description: string;
  options: string[];
  chosen?: boolean[];
}

export interface ImagesClassificationProblem {
  description: string;
  /** 图片url */
  options: string[];
  chosen?: boolean[];
}

export interface FaceTagProblem {
  description: string;
  url: string;
  /** 点坐标数组 */
  data?: [number, number][];
}

export interface ImageFramePromblem {
  description: string;
  url: string;
  /** 图片框选矩形，左下和右上确定矩形 */
  data?: {
    leftdown: [number, number];
    rightup: [number, number];
  }[];
}

/**
 * @see 文档中标注示例
 */
export interface TagProblem {
  description: string;
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
    | "VideoTag";
  reward: number;
  time: number;
  labeler_number: number;
  demander_id?: number;
  task_data:
    | TextClassificationProblem[]
    | ImagesClassificationProblem[]
    | FaceTagProblem[]
    | ImageFramePromblem[]
    | TagProblem[];
}

export interface TextClassificationData {
  label_data: boolean[][];
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
    typeof data.soundUrl === "string" &&
    typeof data.description === "string" &&
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
