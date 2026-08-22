import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGlobe, faRightFromBracket, faUsers, faMars, faVenus } from '@fortawesome/free-solid-svg-icons'
import logo from './assets/logo.svg'
import './App.css'
import { useAuth } from './context/AuthContext'
import { useAppDispatch, useAppSelector } from './store/hooks'
import { fetchDashboardStats } from './store/slices/dashboardSlice'
import { LoginForm } from './components/LoginForm'
import { PageLoader } from './components/PageLoader'
import { TwoFactorSettings } from './components/TwoFactorSettings'
import { UsersPanel } from './components/UsersPanel'

function App() {
  const { t, i18n } = useTranslation()
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth()
  const dispatch = useAppDispatch()
  const { stats, loading: statsLoading } = useAppSelector((state) => state.dashboard)
  const usersLoading = useAppSelector((state) => state.users.loading)

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchDashboardStats())
  }, [isAuthenticated, dispatch])

  const changeLanguage = (lng: 'ar' | 'en') => {
    i18n.changeLanguage(lng)
  }

  const genderCount = (gender: string) => stats?.gender_counts.find((entry) => entry.gender === gender)?.count ?? 0

  const busy = authLoading || (isAuthenticated && (statsLoading || usersLoading))

  if (!isAuthenticated) {
    return (
      <>
        <PageLoader active={busy} />
        <LoginForm />
      </>
    )
  }

  return (
    <div className="app">
      <PageLoader active={busy} />
      <header className="topbar">
        <div className="brand">
          <img src={logo} alt={t('appTitle')} />
          <span>{t('appTitle')}</span>
        </div>

        <div className="topbar-actions">
          {user && <span className="welcome-text">{t('auth.welcome', { username: user.username })}</span>}

          <div className="lang-switch" role="group" aria-label={t('language.label')}>
            <FontAwesomeIcon icon={faGlobe} className="lang-switch-icon" />
            <button
              type="button"
              className={i18n.resolvedLanguage === 'ar' ? 'active' : ''}
              onClick={() => changeLanguage('ar')}
            >
              {t('language.ar')}
            </button>
            <button
              type="button"
              className={i18n.resolvedLanguage === 'en' ? 'active' : ''}
              onClick={() => changeLanguage('en')}
            >
              {t('language.en')}
            </button>
          </div>

          <button type="button" className="logout-button" onClick={() => logout()}>
            <FontAwesomeIcon icon={faRightFromBracket} />
            {t('actions.logout')}
          </button>
        </div>
      </header>

      <main className="content">
        <section className="stats-grid">
          <div className="stat-card">
            <FontAwesomeIcon icon={faUsers} className="stat-icon" />
            <span className="stat-value">{statsLoading ? '…' : (stats?.total_users ?? 0)}</span>
            <span className="stat-label">{t('stats.total')}</span>
          </div>
          <div className="stat-card">
            <FontAwesomeIcon icon={faMars} className="stat-icon" />
            <span className="stat-value">{statsLoading ? '…' : genderCount('male')}</span>
            <span className="stat-label">{t('stats.male')}</span>
          </div>
          <div className="stat-card">
            <FontAwesomeIcon icon={faVenus} className="stat-icon" />
            <span className="stat-value">{statsLoading ? '…' : genderCount('female')}</span>
            <span className="stat-label">{t('stats.female')}</span>
          </div>
        </section>

        <TwoFactorSettings />
        <UsersPanel />
      </main>
    </div>
  )
}

export default App
