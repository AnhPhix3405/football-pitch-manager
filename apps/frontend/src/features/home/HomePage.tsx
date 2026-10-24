import {
  AimOutlined,
  ArrowRightOutlined,
  ArrowUpOutlined,
  CalendarOutlined,
  RadarChartOutlined,
  SafetyCertificateOutlined,
  StarFilled,
  TeamOutlined,
} from '@ant-design/icons'
import { Button } from 'antd'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import heroPanelBg from '../../assets/hero_panel.jpg'
import { BlurCircle } from '../../components/BlurCircle'
import { FieldCard } from '../fields/components/FieldCard'
import { footballFields } from '../fields/field.data'
import { QuickReserveCard } from './components/QuickReserveCard'
import { SpotlightCard } from '../../components/SpotlightCard'

const matches = [
  {
    team: 'Neon Strikers',
    meta: 'Quận 7 · 20:00',
    level: 'Trung bình',
    status: 'ACTIVE MATCH',
    image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
    desc: 'Kèo giao lưu sân 7 người, tìm đối tác cọ xát cuối tuần, tỷ lệ chia tiền sân 5-5.',
  },
  {
    team: 'Urban Dynamics',
    meta: 'Thủ Đức · 19:30',
    level: 'Khá',
    status: 'ACTIVE MATCH',
    image: 'https://images.unsplash.com/photo-1529900245534-47fbf867b1e7?auto=format&fit=crop&w=800&q=80',
    desc: 'Đội hình trẻ, nhiệt tình, tìm đối đá tối thứ 5 hàng tuần tại cụm sân Thủ Đức.',
  },
  {
    team: 'Vortex United',
    meta: 'Bình Thạnh · 18:00',
    level: 'Tự do',
    status: 'SLOT FILLED',
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
    desc: 'Trận đấu hữu nghị rèn luyện thể lực, đã chốt đủ 2 đội tham gia thi đấu.',
  },
]

export function HomePage() {
  const { t } = useTranslation()
  const featuredPitch = footballFields.find((field) => field.featured) ?? footballFields[0]

  return (
    <div className="home-page">
      <section className="home-hero">
        <div
          className="home-hero__backdrop"
          style={{ backgroundImage: `url(${heroPanelBg})` }}
        />
        <BlurCircle variant="lime" size={520} left="-8%" top="-2%" blur={120} opacity={0.5} />
        <BlurCircle variant="amber" size={560} right="-6%" top="14%" blur={110} opacity={0.7} />
        <div className="home-hero__container">
          <div className="home-hero__content">
            <span className="eyebrow">{t('home.eyebrow')}</span>
            <h1>
              <em>{t('home.heroTitlePrefix')}</em> {t('home.heroTitleSuffix')}
            </h1>
            <p>{t('home.heroDescription')}</p>
            <div className="home-hero__actions">
              <Link to="/fields">
                <Button type="primary" size="large">
                  {t('home.findPitchesBtn')} <ArrowRightOutlined />
                </Button>
              </Link>
              <Link to="/opponents">
                <Button size="large">{t('home.findOpponentsBtn')}</Button>
              </Link>
            </div>
            <div className="home-hero__rating">
              <span className="rating-star">
                <StarFilled />
              </span>
              <strong>{t('home.heroRating')}</strong>
              <span className="rating-desc">{t('home.heroReviews')}</span>
            </div>
          </div>

          <div className="home-hero__widget">
            <QuickReserveCard field={featuredPitch} />
          </div>
        </div>
      </section>

      <section className="home-section feature-section">
        <BlurCircle variant="emerald" size={500} left="20%" top="-60px" blur={130} opacity={0.2} />

        <div className="spotlight-grid">
          <SpotlightCard className="feature-spotlight-card">
            <div className="feature-spotlight-card__header">
              <div className="feature-spotlight-card__icon">
                <AimOutlined />
              </div>
              <span className="feature-spotlight-card__tag">{t('home.f1Tag')}</span>
            </div>
            <h3>{t('home.f1Title')}</h3>
            <p>{t('home.f1Desc')}</p>
          </SpotlightCard>

          <SpotlightCard className="feature-spotlight-card">
            <div className="feature-spotlight-card__header">
              <div className="feature-spotlight-card__icon">
                <RadarChartOutlined />
              </div>
              <span className="feature-spotlight-card__tag">{t('home.f2Tag')}</span>
            </div>
            <h3>{t('home.f2Title')}</h3>
            <p>{t('home.f2Desc')}</p>
          </SpotlightCard>

          <SpotlightCard className="feature-spotlight-card">
            <div className="feature-spotlight-card__header">
              <div className="feature-spotlight-card__icon">
                <CalendarOutlined />
              </div>
              <span className="feature-spotlight-card__tag">{t('home.f3Tag')}</span>
            </div>
            <h3>{t('home.f3Title')}</h3>
            <p>{t('home.f3Desc')}</p>
          </SpotlightCard>
        </div>
      </section>

      <section className="home-section">
        <BlurCircle variant="lime" size={460} right="-8%" top="15%" blur={110} opacity={0.25} />
        <header className="section-heading">
          <div>
            <span className="eyebrow">SELECTED FACILITIES</span>
            <h2>{t('home.featuredPitches')}</h2>
          </div>
          <Link to="/fields">
            {t('common.all')} <ArrowRightOutlined />
          </Link>
        </header>
        <div className="featured-fields">
          {footballFields
            .filter((field) => field.featured)
            .slice(0, 3)
            .map((field) => (
              <FieldCard field={field} key={field.id} />
            ))}
        </div>
      </section>

      <section className="home-section opponent-section">
        <BlurCircle variant="blue" size={480} left="-6%" bottom="5%" blur={120} opacity={0.22} />
        <header className="section-heading">
          <div>
            <span className="eyebrow">LIVE NETWORK</span>
            <h2>{t('home.openMatches')}</h2>
          </div>
          <Link to="/opponents">
            {t('common.all')} <ArrowRightOutlined />
          </Link>
        </header>
        <div className="match-grid">
          {matches.map((match) => (
            <article key={match.team} className="match-card">
              <div
                className="match-card__backdrop"
                style={{ backgroundImage: `url(${match.image})` }}
              />
              <div className="match-card__gradient" />

              <div className="match-card__top">
                <span
                  className={`match-card__status ${
                    match.status === 'SLOT FILLED' ? 'match-card__status--filled' : ''
                  }`}
                >
                  <i /> {match.status === 'SLOT FILLED' ? 'Đã đủ người' : 'Đang tìm đối'}
                </span>

                <Link
                  to="/opponents"
                  className="match-card__pill-cta"
                  aria-label={`${match.team} - ${
                    match.status === 'SLOT FILLED'
                      ? t('home.detailsBtn', { defaultValue: 'Chi tiết' })
                      : t('home.challengeBtn', { defaultValue: 'Thách đấu' })
                  }`}
                >
                  <span>
                    {match.status === 'SLOT FILLED'
                      ? t('home.detailsBtn', { defaultValue: 'Chi tiết' })
                      : t('home.challengeBtn', { defaultValue: 'Thách đấu' })}
                  </span>
                  <ArrowUpOutlined style={{ transform: 'rotate(45deg)' }} />
                </Link>
              </div>

              <div className="match-card__bottom">
                <div className="match-card__badge-icon">
                  <TeamOutlined />
                </div>
                <h3 className="match-card__title">{match.team}</h3>
                <div className="match-card__meta">
                  <CalendarOutlined /> <span>{match.meta}</span>
                  <span className="match-card__dot">·</span>
                  <span>{match.level}</span>
                </div>
                <p className="match-card__desc">{match.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="home-cta">
        <BlurCircle variant="amber" size={380} right="4%" top="-40px" blur={90} opacity={0.3} />
        <SafetyCertificateOutlined />
        <div>
          <span className="eyebrow">VERIFIED NETWORK</span>
          <h2>{t('home.ctaTitle')}</h2>
          <p>{t('home.ctaDesc')}</p>
        </div>
        <Link to="/owner/register">
          <Button type="primary" size="large">
            {t('home.registerOwner')} <ArrowRightOutlined />
          </Button>
        </Link>
      </section>
    </div>
  )
}
