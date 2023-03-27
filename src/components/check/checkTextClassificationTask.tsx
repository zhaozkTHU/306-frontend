import CheckTextClassificationProblem from "./checkTextClassificationProblem"
import { useEffect, useState } from "react"
import { TextClassificationProblem } from "../../const/interface"
import { Button } from 'antd'
import axios from "axios"

interface CheckTextClassificationTaskProps {
    task_id: number
    labeler_id: number
    // problems: TextClassificationProblem[]
}

const CheckTextClassificationTask = (props: CheckTextClassificationTaskProps) => {
    // const checkedNumber: number = props.problems.length
    const [passedNumber, setPassedNumber] = useState<number>(0);
    const [problems, setProblems] = useState<TextClassificationProblem[]>([])
    useEffect(() => {
        axios.get(`/task/checking?task_id=${props.task_id}%labeler_index=${props.labeler_id}`)
        .then((response) => {
                setProblems(response.data.task_list)
            }
        )
        .catch((err) => {
            // alert("网络错误")
        })
    })
   
    const checkedNumber: number = problems.length
    return (
        <>
            <p>已审核题目数量: {checkedNumber}</p>
            <p>通过题目数量: {passedNumber}</p>
            <p>当前通过率: {(passedNumber / checkedNumber).toFixed(3)}</p>
            {problems.map((items, index) =>
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
                    onClick={() => {
                        axios.post('api/checking',
                            {
                                task_id: props.task_id,
                                labeler_id: props.labeler_id,
                                is_passed: true,
                                correct_number: passedNumber
                            }
                        )
                    }}
                >
                    合格
                </Button>
                <Button
                    size="large"
                    block
                    onClick={() => {
                        axios.post('api/checking',
                            {
                                task_id: props.task_id,
                                labeler_id: props.labeler_id,
                                is_passed: false,
                                correct_number: passedNumber
                            }
                        )
                    }}
                >
                    不合格
                </Button>
        </>
    )
}

export default CheckTextClassificationTask