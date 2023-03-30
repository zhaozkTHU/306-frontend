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
  labeler_number: number;
  demander_id: number;
  task_data: TextClassificationProblem[] | ImagesClassificationProblem[];
}

export interface TextClassificationData {
  label_data: boolean[][];
}
