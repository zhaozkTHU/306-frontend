import Problem from '@/components/demander_problem/problem';

import React from 'react';
const AdministratorInfo = () => {
  return (
    <>
      <Problem problem={{
        description: "测试",
        url: "/test.mp4",
        choice: [{ text: "选项1", needInput: true }, { text: "选项2", needInput: false }],
        data: {
          choiceIndex: 0,
          input: "好好好",
        }
      }} index={0} template={'VideoTag'} showto={'demander'} />
      <Problem problem={{
        description: "测试",
        url: "/BGM_1.mp3",
        choice: [{ text: "选项1", needInput: true }, { text: "选项2", needInput: false }],
        data: {
          choiceIndex: 0,
          input: "好好好",
        }
      }} index={0} template={'SoundTag'} showto={'demander'} />
      <Problem 
        problem={{
          description: "请判断下列文字是否涉及暴力",
          content: "好好好",
          data: false,
        }} 
        index={0} 
        template={'TextReview'} 
        showto={'demander'} 
      />
      <Problem 
        problem={{
          description: "请判断下列音频是否涉及暴力",
          url: "/BGM_1.mp3",
          data: false,
        }} 
        index={0} 
        template={'AudioReview'} 
        showto={'demander'} 
      />
      <Problem 
        problem={{
          description: "请判断下列图片是否涉及暴力",
          url: "/logo/306.png",
          data: false,
        }} 
        index={0} 
        template={'ImageReview'} 
        showto={'demander'} 
      />
      <Problem 
        problem={{
          description: "请判断下列视频是否涉及暴力",
          url: "/test.mp4",
          data: false,
        }} 
        index={0} 
        template={'VideoReview'} 
        showto={'demander'} 
      />
    </>
  )
}

export default AdministratorInfo;