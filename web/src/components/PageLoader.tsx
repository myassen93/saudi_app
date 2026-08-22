import { useTranslation } from 'react-i18next'
import logo from '../assets/logo.svg'

export function PageLoader({ active }: { active: boolean }) {
  const { t } = useTranslation()

  return (
    <div id="page-loader" className={active ? 'is-active' : ''} aria-hidden={!active}>
      <div className="loader-badge">
        <div className="loader-ring" />
        <img src={logo} alt="" />
      </div>
      <span className="loader-label">{t('loading')}</span>
    </div>
  )
}
