import CheckTextClassificationTask from "./checkTextClassificationTask";

interface CheckModelProps {
  task_id: number;
  labeler_id: number;
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
        labeler_id={props.labeler_id}
      />
    );
  }
  return <p>error</p>;
};

export default CheckModel;
