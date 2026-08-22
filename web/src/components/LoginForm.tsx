import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faUser,
  faLock,
  faRightToBracket,
  faUsersGear,
  faShieldHalved,
  faChartLine,
  faGlobe,
} from '@fortawesome/free-solid-svg-icons'
import { useAuth } from '../context/AuthContext'
import { OtpVerifyForm } from './OtpVerifyForm'
import logo from '../assets/logo.svg'

export function LoginForm() {
  const { t, i18n } = useTranslation()
  const { t: tOtp } = useTranslation('otp')
  const { login, loading, error, otpRequired } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    try {
      await login(username, password)
    } catch {
      // error state is already surfaced via useAuth().error
    }
  }

  const changeLanguage = (lng: 'ar' | 'en') => {
    i18n.changeLanguage(lng)
  }

  return (
    <div className="login-page">
      <div className="login-lang-switch">
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
      </div>

      <section className="login-showcase">
        <div className="login-showcase-badge">
          <img src={logo} alt="" />
        </div>
        <h1>{t('appTitle')}</h1>
        <p>{t('auth.showcase.description')}</p>
        <ul className="login-showcase-points">
          <li>
            <FontAwesomeIcon icon={faUsersGear} />
            {t('auth.showcase.point1')}
          </li>
          <li>
            <FontAwesomeIcon icon={faShieldHalved} />
            {t('auth.showcase.point2')}
          </li>
          <li>
            <FontAwesomeIcon icon={faChartLine} />
            {t('auth.showcase.point3')}
          </li>
        </ul>
      </section>

      <section className="login-panel">
        <div className="login-card">
          <div className="login-card-header">
            <h2>{otpRequired ? tOtp('login.title') : t('auth.signIn')}</h2>
            <p>{otpRequired ? tOtp('login.subtitle') : t('auth.cardSubtitle')}</p>
          </div>

          {otpRequired ? (
            <OtpVerifyForm />
          ) : (
            <form className="crispy-form" onSubmit={handleSubmit}>
              {error && (
                <div className="crispy-form-errors">
                  <ul>
                    <li>{t(`auth.errors.${error}`)}</li>
                  </ul>
                </div>
              )}

              <div className="crispy-field">
                <label className="crispy-label" htmlFor="login-username">
                  {t('auth.username')}
                </label>
                <div className="crispy-input-group">
                  <FontAwesomeIcon icon={faUser} className="crispy-input-icon" />
                  <input
                    id="login-username"
                    className="crispy-input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div className="crispy-field">
                <label className="crispy-label" htmlFor="login-password">
                  {t('auth.password')}
                </label>
                <div className="crispy-input-group">
                  <FontAwesomeIcon icon={faLock} className="crispy-input-icon" />
                  <input
                    id="login-password"
                    type="password"
                    className="crispy-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </div>
              </div>

              <div className="crispy-actions">
                <button type="submit" className="crispy-submit" disabled={loading}>
                  <FontAwesomeIcon icon={faRightToBracket} />
                  {loading ? t('auth.signingIn') : t('auth.signIn')}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  )
}
