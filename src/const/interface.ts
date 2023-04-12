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
  faceImageUrl: string;
  /** 点坐标数组 */
  data?: [number, number][];
}

export interface ImageFramePromblem {
  description: string;
  imageUrl: string;
  /** 图片框选矩形，左下和右上确定矩形 */
  data?: {
    leftdown: [number, number];
    rightup: [number, number];
  }[];
}

/**
 * @see 文档中标注示例
 */
export interface SoundTagProblem {
  description: string;
  soundUrl: string;
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

/**
 * @interface 修改自`SoundTagProblem`，将`soundUrl`改为`videoUrl`
 * @see `SoundTagProblem`
 */
export interface VideoTagProblem extends Omit<SoundTagProblem, "soundUrl"> {
  description: string;
  videoUrl: string;
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
    | SoundTagProblem[]
    | VideoTagProblem[];
}

export interface TextClassificationData {
  label_data: boolean[][];
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
export function isSoundTagProblem(data: any): data is SoundTagProblem {
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
export function isVideoTagProblem(data: any): data is VideoTagProblem {
  return (
    typeof data.videoUrl === "string" &&
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
