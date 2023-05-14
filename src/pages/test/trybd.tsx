import TripleAnnotation from "../../components/task_label/Triple_tag";
const Try_BD = () => {
  return (
  <p>
    <TripleAnnotation
      title="test"
      create_at={0}
      deadline={100000}
      template="TextClassification"
      reward={1}
      time={1}
      labeler_number={1}
      task_id={1}
      task_data={
        [
          {
            description: "string1",
            text: "string1",
          },
          {
            description: "string2",
            text: "string2",
          },
          {
            description: "string3",
            text: "string3",
          },
        ]
      }
      batch={false}
      type="sentiment"
      distribute="system"
    />
  </p>
  );
};

export default Try_BD;
