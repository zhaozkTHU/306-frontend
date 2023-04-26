import Problem from '@/components/demander_problem/problem';

import React from 'react';
const AdministratorInfo = () => {
  return (
    <>
    <Problem problem={{
      description: "测试",
      url:"/test.mp4",
      choice: [{text: "选项1", needInput: true}, {text: "选项2", needInput: false}],
      data: {
        choiceIndex: 0,
        input: "好好好",
      }
    }} index={0} template={'VideoTag'} showto={'demander'}/>
    <Problem problem={{
      description: "测试",
      url:"/BGM_1.mp3",
      choice: [{text: "选项1", needInput: true}, {text: "选项2", needInput: false}],
      data: {
        choiceIndex: 0,
        input: "好好好",
      }
    }} index={0} template={'SoundTag'} showto={'demander'}/>
    </>
  )
}

export default AdministratorInfo;