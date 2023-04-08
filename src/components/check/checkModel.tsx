import CheckTextClassificationTask from "./checkTextClassificationTask";

interface CheckModelProps {
  task_id: number;
  labeler_index: number;
  is_sample: boolean;
  template: string;
  isShow: boolean;
}

const CheckModel = (props: CheckModelProps) => {
  if (!props.isShow) {
    return <p>error</p>;
  }
  if (props.template === "TextClassification") {
    return (
      <CheckTextClassificationTask
        task_id={props.task_id}
        labeler_index={props.labeler_index}
        is_sample={props.is_sample}
      />
    );
  }
  return <p>error</p>;
};

export default CheckModel;
