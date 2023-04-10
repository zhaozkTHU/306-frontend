import { Carousel } from "antd";

interface LoginAdProps {
  ref: React.MutableRefObject<any>;
}

const LoginAd = (props: LoginAdProps) => {
  return (
    <Carousel
      autoplay
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0)",
        marginBottom: "0%",
      }}
      dotPosition={"bottom"}
      dots={false}
      arrows
      ref={props.ref}
    >
      <div>
        <h1 className="loginLeft">全306最大的众包平台</h1>
        <p className="loginLeft">我们是306最大的众包平台</p>
        <p className="loginLeft">拥有zmh等金牌标注工</p>
        <p className="loginLeft">标注质量连续六年全306遥遥领先</p>
        <p className="loginLeft">任务分发、标注速度快</p>
        <p className="loginLeft">标注价格低、平台抽成少、工人挣得多</p>
        <p className="loginLeft">...</p>
      </div>
      <div>
        <h1 className="loginLeft">支持多模板</h1>
        <p className="loginLeft">文本分类</p>
        <p className="loginLeft">图片分类</p>
        <p className="loginLeft">内容审核</p>
        <p className="loginLeft">音视频标注</p>
        <p className="loginLeft">骨骼打点</p>
        <p className="loginLeft">...</p>
      </div>
      <div>
        <h1 className="loginLeft">顾客好评如潮</h1>
        <p className="loginLeft">306众包平台数据标注价格低，质量高，值得信赖。 ——ztq</p>
        <p className="loginLeft">
          306众包平台抽成很少，操作简单，我在这上面兼职标注，挣了不少钱。 ——zmh
        </p>
        <p className="loginLeft">
          306众包平台非常适合我们中介，因为这上面有很多的需求方和标注者，谈拢一单简直太容易了。
          ——zkk
        </p>
      </div>
    </Carousel>
  );
};

export default LoginAd;
