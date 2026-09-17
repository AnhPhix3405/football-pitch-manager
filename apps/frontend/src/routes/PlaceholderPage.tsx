import { Empty } from 'antd'
import { useLocation } from 'react-router-dom'

export function PlaceholderPage() {
  const location = useLocation()
  return <section className="placeholder-panel"><span className="eyebrow">MODULE QUEUED</span><h1>{location.pathname === '/app' ? 'Trung tâm điều hành' : 'Không gian chức năng'}</h1><Empty description="Màn hình này sẽ được triển khai trong tác vụ tiếp theo." /></section>
}
