import CheckImgClassificationProblem from "@/components/check/checkImgClassificationProblem";
import { useState } from "react";

const DemanderCompleted = () => {
  const [temp, setTemp] = useState<number>(0);
  const data: any[] = [
    {
      description: "题目1",
      option: [
        "https://github.githubassets.com/images/modules/site/home-campaign/footer-galaxy.jpg",
        "http://seerh5.61.com/resource/assets/ui/team/outside/team_task_defaultBg_80641b0b.png",
      ],
      chosen: [true, false],
      setPassedNumber: setTemp,
      index: 1,
    },
  ];
  return (
    <CheckImgClassificationProblem
      description={data[0].description}
      options={data[0].option}
      chosen={data[0].chosen}
      index={data[0].index}
      setPassedNumber={data[0].setPassedNumber}
    />
  );
};

export default DemanderCompleted;
