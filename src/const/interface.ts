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
  faceImageUrl: string;
  /** 点坐标数组 */
  data?: [number, number][];
}

export interface ImageFramePromblem {
  imageUrl: string;
  /** 图片框选矩形，左下和右上确定矩形 */
  data?: {
    leftdowm: [number, number];
    rightup: [number, number];
  }[];
}

export interface SoundTagProblem {
  soundUrl: string;
  description: string;
  choice: {
    text: string;
    needInput: boolean;
  }[];
  data?: {
    choiceIndex: number;
    input?: string;
  };
}

// 将soundUrl 改为 videoUrl
export interface VideoTagProblem extends Omit<SoundTagProblem, "soundUrl"> {
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
    | ImageFramePromblem[];
}

export interface TextClassificationData {
  label_data: boolean[][];
}
