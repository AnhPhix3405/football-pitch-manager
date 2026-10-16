import { GlobalOutlined } from '@ant-design/icons'
import { Button, Dropdown, type MenuProps } from 'antd'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

const SUPPORTED_LANGUAGES = [
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'en', label: 'English' },
] as const

type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]['code']

const resolveLanguage = (lang?: string): SupportedLanguage => {
  return (lang || '').toLowerCase().startsWith('en') ? 'en' : 'vi'
}

export function LanguageSwitch() {
  const { i18n, t } = useTranslation()
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>(() => {
    return resolveLanguage(
      i18n.resolvedLanguage ||
        i18n.language ||
        (typeof window !== 'undefined'
          ? window.localStorage.getItem('i18nextLng') ?? undefined
          : undefined),
    )
  })

  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      setCurrentLang(resolveLanguage(lng))
    }

    i18n.on('languageChanged', handleLanguageChanged)
    return () => {
      i18n.off('languageChanged', handleLanguageChanged)
    }
  }, [i18n])

  const menuItems: MenuProps['items'] = SUPPORTED_LANGUAGES.map((item) => ({
    key: item.code,
    label: (
      <span style={{ fontWeight: item.code === currentLang ? 700 : 400 }}>
        {item.label}
      </span>
    ),
  }))

  const handleMenuClick: MenuProps['onClick'] = async ({ key }) => {
    const targetLang = resolveLanguage(key)
    setCurrentLang(targetLang)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('i18nextLng', targetLang)
      document.documentElement.lang = targetLang
    }
    await i18n.changeLanguage(targetLang)
  }

  return (
    <Dropdown
      menu={{ items: menuItems, onClick: handleMenuClick, selectedKeys: [currentLang] }}
      placement="bottomRight"
      trigger={['click']}
    >
      <Button
        type="text"
        icon={<GlobalOutlined />}
        className="language-switch-btn"
        aria-label={t('language.switch', { defaultValue: 'Chuyển ngôn ngữ' })}
      >
        <span style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em' }}>
          {currentLang.toUpperCase()}
        </span>
      </Button>
    </Dropdown>
  )
}
