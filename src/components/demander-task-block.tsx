import { Card, Button, Dropdown, Modal, Space } from 'antd'
import type { MenuProps } from 'antd';
import { transTime } from '../utils/valid'
import { DownloadOutlined} from '@ant-design/icons';
import { useState } from 'react';
import CheckModel from './check/checkModel'
export interface DemanderTaskBlockProps {
  task_id: number
  creat_at: number
  deadline: number
  title: string
  state: string
  labeler_number: number
  labeler_id: number[]
  template: string
  isDone: boolean[] // 对应ID的标注方是否完成标注
}

const DemanderTaskBlock = (props: DemanderTaskBlockProps) => {
  const [isModalOpen, setIsMoalOpen] = useState<boolean>(false)
  const [labelerId, setLabelerId] = useState<number>(-1)
  const [isShow, setIsShow] = useState<boolean>(false)
  const items: MenuProps['items'] = [
    {
      key: 'allCheck',
      label: '全量审核',
      children: Array.from(Array(props.labeler_number).keys(), n => n + 1).map((index, idx) => {
        return {
          key: idx,
          label: `标注者${index}号`,
          disabled: props.isDone[idx]
        }
      })
    },
    {
      key: 'sampleCheck',
      label: '抽样审核',
      children: Array.from(Array(props.labeler_number).keys(), n => n + 1).map((index, idx) => {
        return {
          key: idx,
          label: `标注者${index}号`,
          disabled: !props.isDone[idx]
        }
      })
    }
  ]
  return (
    <>
    <Modal 
      open={isModalOpen}
      onOk={() => {
        setIsMoalOpen(false)
      }}
      onCancel={() => {
        setIsMoalOpen(false)
      }}
    >
      <CheckModel task_id={props.task_id} labeler_id={labelerId} template={props.template} isShow={isShow}/>
    </Modal>
    <Card
      title={props.title}
      extra={<a onClick={() => { alert("查看详情") }}>查看详情</a>}
    >
      <>
        <p>创建时间: {transTime(props.creat_at)}</p>
        <p>截止时间: {transTime(props.deadline)}</p>
        <p>任务状态: {props.state}</p>
        <Space wrap>
        <Dropdown.Button menu={{ 
          items:items,
          onClick: ({key}) => {
            setIsShow(true)
            setIsMoalOpen(true)
            setLabelerId(props.labeler_id[parseInt(key)])
          }
        }}
        >
          审核
        </Dropdown.Button>
        <Button>
          修改任务
        </Button>
        <Button
          icon={<DownloadOutlined />}
        >
          导出数据
        </Button>
        </Space>
      </>
    </Card>
    </>
  )
}
export default DemanderTaskBlock