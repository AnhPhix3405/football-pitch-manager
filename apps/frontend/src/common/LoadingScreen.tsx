import { Spin } from 'antd'

export function LoadingScreen() {
  return <div className="state-screen"><Spin size="large" /><p>Đang thiết lập kết nối...</p></div>
}
