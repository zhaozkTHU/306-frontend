export interface User {
  username: string;
  password: string;
}

// export interface ThreeChooseOneData {
//   description: string;
//   options: string[];
// }

// export interface DescribeData {
//   description: string;
//   content: string;
// }

export interface TextClassificationProblem {
  description: string;
  options: string[];
  chosen?: boolean[];
}

export interface TaskInfo {
  task_id?: number;
  title: string;
  create_at: number;
  deadline: number;
  template: "TextClassification" | "ImagesClassification";
  reward: number;
  time: number;
  labeler_num: number;
  demander_id: number;
  task_data: TextClassificationProblem[];
}
