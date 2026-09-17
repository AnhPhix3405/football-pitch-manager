import { AimOutlined, ArrowRightOutlined, CalendarOutlined, RadarChartOutlined, SafetyCertificateOutlined, TeamOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { Link } from 'react-router-dom'
import { FieldCard } from '../../components/fields/FieldCard'
import { footballFields } from '../fields/field.data'

const matches = [
  { team: 'Neon Strikers', meta: 'Quận 7 · 20:00', level: 'Trung bình', status: 'ACTIVE MATCH' },
  { team: 'Urban Dynamics', meta: 'Thủ Đức · 19:30', level: 'Khá', status: 'ACTIVE MATCH' },
  { team: 'Vortex United', meta: 'Bình Thạnh · 18:00', level: 'Tự do', status: 'SLOT FILLED' },
]

export function HomePage() {
  return <div className="home-page">
    <section className="home-hero"><div className="home-hero__grid" /><div className="home-hero__content"><span className="eyebrow">FOOTBALL OPERATIONS NETWORK</span><h1><em>Khai phá</em> tiềm năng sân cỏ</h1><p>Nền tảng hợp nhất giúp bạn tìm sân chất lượng, đặt lịch thi đấu và kết nối cộng đồng bóng đá chỉ trong vài thao tác.</p><div><Link to="/fields"><Button type="primary" size="large">Tìm sân ngay <ArrowRightOutlined /></Button></Link><Link to="/opponents"><Button size="large">Tìm đối thủ</Button></Link></div></div></section>
    <section className="home-section feature-grid"><article><AimOutlined /><div><h2>Bản đồ sân chính xác</h2><p>Tìm sân phù hợp qua bộ lọc kỹ thuật, vị trí và lịch trống theo thời gian thực.</p></div></article><article><RadarChartOutlined /><div><h2>Kết nối đối thủ</h2><p>Tìm đội cùng trình độ và phát tín hiệu thách đấu trong mạng lưới cộng đồng.</p></div></article><article><CalendarOutlined /><div><h2>Đặt lịch liền mạch</h2><p>Chọn giờ, tiện ích và xác nhận chi phí rõ ràng trong một luồng duy nhất.</p></div></article></section>
    <section className="home-section"><header className="section-heading"><div><span className="eyebrow">SELECTED FACILITIES</span><h2>Sân nổi bật gần bạn</h2></div><Link to="/fields">Xem tất cả <ArrowRightOutlined /></Link></header><div className="featured-fields">{footballFields.filter((field) => field.featured).slice(0, 3).map((field) => <FieldCard field={field} key={field.id} />)}</div></section>
    <section className="home-section opponent-section"><header className="section-heading"><div><span className="eyebrow">LIVE NETWORK</span><h2>Yêu cầu tìm đối gần đây</h2></div><Link to="/opponents">Xem tất cả <ArrowRightOutlined /></Link></header><div className="match-grid">{matches.map((match) => <article key={match.team}><header><span><TeamOutlined /></span><div><h3>{match.team}</h3><p>{match.level}</p></div><b className={match.status === 'SLOT FILLED' ? 'inactive' : ''}><i /> {match.status}</b></header><p><CalendarOutlined /> {match.meta}</p><Button disabled={match.status === 'SLOT FILLED'} block>{match.status === 'SLOT FILLED' ? 'Đã đủ người' : 'Gửi lời thách đấu'}</Button></article>)}</div></section>
    <section className="home-cta"><SafetyCertificateOutlined /><div><span className="eyebrow">VERIFIED NETWORK</span><h2>Sẵn sàng vào sân?</h2><p>Mỗi sân và chủ sân đều được kiểm duyệt để đảm bảo trải nghiệm an toàn.</p></div><Link to="/fields"><Button type="primary" size="large">Khám phá sân</Button></Link></section>
  </div>
}
