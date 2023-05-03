declare module "react-image-annotate" {
  import { Component } from "react";

  export interface AnnotatorProps {
    selectedImage: string;
    onExit?: (annotations: any) => void;
    onChange?: (annotations: any) => void;
    enabledTools?: string[];
    loadImage?: (img: string) => Promise<string>;
    // 根据需要添加其他属性类型定义
  }

  export class Annotator extends Component<AnnotatorProps> {}
}
