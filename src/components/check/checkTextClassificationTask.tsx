import CheckTextClassificationProblem from "./checkTextClassificationProblem"
import { useState } from "react"
import { TextClassificationProblem } from "../../const/interface"
import { Button } from 'antd'

interface CheckTextClassificationTaskProps {
    task_id: number
    user_index: number
    problems: TextClassificationProblem[]
}

const CheckTextClassificationTask = (props: CheckTextClassificationTaskProps) => {
    const checkedNumber: number = props.problems.length
    const [passedNumber, setPassedNumber] = useState<number>(0);
    return (
        <>
            <p>已审核题目数量: {checkedNumber}</p>
            <p>通过题目数量: {passedNumber}</p>
            <p>当前通过率: {(passedNumber / checkedNumber).toFixed(3)}</p>
            {props.problems.map((items, index) =>
                <CheckTextClassificationProblem
                    problem={items}
                    index={index}
                    setPassedNumber={setPassedNumber}
                    key={index}
                />
            )}
                <Button
                    size="large"
                    block
                >
                    合格
                </Button>
                <Button
                    size="large"
                    block
                >
                    不合格
                </Button>
        </>
    )
}

export default CheckTextClassificationTask