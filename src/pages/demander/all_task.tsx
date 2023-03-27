import CheckTextClassification from '../../components/check/checkTextClassificationProblem'
import { TextClassificationProblem } from '../../const/interface'
import CheckTextClassificationTask from "../../components/check/checkTextClassificationTask"

const DemanderAllTask = () => {
  const problems:TextClassificationProblem[] = [
    {
      description : "请问以下表达高兴情绪的语句是（多选）:",
      options: ["今天玩的真开心", "感觉不太好", "对你这种行为我感到很愤怒"],
      chosen: [true, true, false]
    },
    {
      description : "请问以下表达高兴情绪的语句是（多选）:",
      options: ["今天玩的真开心", "感觉不太好", "对你这种行为我感到很愤怒"],
      chosen: [true, true, false]
    },
    {
      description : "请问以下表达高兴情绪的语句是（多选）:",
      options: ["今天玩的真开心", "感觉不太好", "对你这种行为我感到很愤怒"],
      chosen: [true, true, false]
    },
    {
      description : "请问以下表达高兴情绪的语句是（多选）:",
      options: ["今天玩的真开心", "感觉不太好", "对你这种行为我感到很愤怒"],
      chosen: [true, true, false]
    },
    {
      description : "请问以下表达高兴情绪的语句是（多选）:",
      options: ["今天玩的真开心", "感觉不太好", "对你这种行为我感到很愤怒"],
      chosen: [true, true, false]
    }
  ]
  return <CheckTextClassificationTask problems={problems}/>
}

export default DemanderAllTask