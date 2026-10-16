import {
  AimOutlined,
  ArrowRightOutlined,
  CalendarOutlined,
  RadarChartOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { Button } from 'antd'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { FieldCard } from '../fields/components/FieldCard'
import { footballFields } from '../fields/field.data'

const matches = [
  { team: 'Neon Strikers', meta: 'Quận 7 · 20:00', level: 'Trung bình', status: 'ACTIVE MATCH' },
  { team: 'Urban Dynamics', meta: 'Thủ Đức · 19:30', level: 'Khá', status: 'ACTIVE MATCH' },
  { team: 'Vortex United', meta: 'Bình Thạnh · 18:00', level: 'Tự do', status: 'SLOT FILLED' },
]

export function HomePage() {
  const { t } = useTranslation()

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero__grid" />
        <div className="home-hero__content">
          <span className="eyebrow">{t('home.eyebrow')}</span>
          <h1>
            <em>{t('home.heroTitlePrefix')}</em> {t('home.heroTitleSuffix')}
          </h1>
          <p>{t('home.heroDescription')}</p>
          <div>
            <Link to="/app/fields">
              <Button type="primary" size="large">
                {t('home.findPitchesBtn')} <ArrowRightOutlined />
              </Button>
            </Link>
            <Link to="/app/opponents">
              <Button size="large">{t('home.findOpponentsBtn')}</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="home-section feature-grid">
        <article>
          <AimOutlined />
          <div>
            <h2>{t('home.f1Title')}</h2>
            <p>{t('home.f1Desc')}</p>
          </div>
        </article>
        <article>
          <RadarChartOutlined />
          <div>
            <h2>{t('home.f2Title')}</h2>
            <p>{t('home.f2Desc')}</p>
          </div>
        </article>
        <article>
          <CalendarOutlined />
          <div>
            <h2>{t('home.f3Title')}</h2>
            <p>{t('home.f3Desc')}</p>
          </div>
        </article>
      </section>

      <section className="home-section">
        <header className="section-heading">
          <div>
            <span className="eyebrow">SELECTED FACILITIES</span>
            <h2>{t('home.featuredPitches')}</h2>
          </div>
          <Link to="/app/fields">
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
        <header className="section-heading">
          <div>
            <span className="eyebrow">LIVE NETWORK</span>
            <h2>{t('home.openMatches')}</h2>
          </div>
          <Link to="/app/opponents">
            {t('common.all')} <ArrowRightOutlined />
          </Link>
        </header>
        <div className="match-grid">
          {matches.map((match) => (
            <article key={match.team}>
              <header>
                <span>
                  <TeamOutlined />
                </span>
                <div>
                  <h3>{match.team}</h3>
                  <p>{match.level}</p>
                </div>
                <b className={match.status === 'SLOT FILLED' ? 'inactive' : ''}>
                  <i /> {match.status}
                </b>
              </header>
              <p>
                <CalendarOutlined /> {match.meta}
              </p>
              <Button disabled={match.status === 'SLOT FILLED'} block>
                {match.status === 'SLOT FILLED' ? 'Đã đủ người' : 'Gửi lời thách đấu'}
              </Button>
            </article>
          ))}
        </div>
      </section>

      <section className="home-cta">
        <SafetyCertificateOutlined />
        <div>
          <span className="eyebrow">VERIFIED NETWORK</span>
          <h2>{t('home.ctaTitle')}</h2>
          <p>{t('home.ctaDesc')}</p>
        </div>
        <Link to="/owner/register">
          <Button type="primary" size="large">
            {t('home.registerOwner')}
          </Button>
        </Link>
      </section>
    </div>
  )
}
