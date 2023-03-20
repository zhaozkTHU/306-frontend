export interface User {
  username: string;
  password: string;
}

export interface Words3Choose1Data {
  description: string;
  options: string[];
}

export interface WordsDescribeData {
  description: string;
}

export interface TaskInfo {
  task_id: number;
  title: string;
  template: "words" | "images";
  style: "3choose1" | "describe";
  reward: number;
  time: number;
  total_time: number;
  worker_num: number;
  demander_id: number;
  task_data: Words3Choose1Data | WordsDescribeData;
}
