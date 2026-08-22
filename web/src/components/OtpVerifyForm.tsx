import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faShieldHalved, faRightToBracket } from '@fortawesome/free-solid-svg-icons'
import { useAuth } from '../context/AuthContext'

export function OtpVerifyForm() {
  const { t: tOtp } = useTranslation('otp')
  const { t } = useTranslation()
  const { verifyOtp, cancelOtp, loading, error } = useAuth()
  const [code, setCode] = useState('')

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    try {
      await verifyOtp(code)
    } catch {
      // error state is already surfaced via useAuth().error
    }
  }

  return (
    <form className="crispy-form" onSubmit={handleSubmit}>
      {error && (
        <div className="crispy-form-errors">
          <ul>
            <li>{t(`auth.errors.${error}`)}</li>
          </ul>
        </div>
      )}

      <div className="crispy-field">
        <label className="crispy-label" htmlFor="otp-code">
          {tOtp('login.codeLabel')}
        </label>
        <div className="crispy-input-group">
          <FontAwesomeIcon icon={faShieldHalved} className="crispy-input-icon" />
          <input
            id="otp-code"
            className="crispy-input"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            autoFocus
            required
          />
        </div>
      </div>

      <div className="crispy-actions">
        <button type="submit" className="crispy-submit" disabled={loading || code.length !== 6}>
          <FontAwesomeIcon icon={faRightToBracket} />
          {loading ? tOtp('login.verifying') : tOtp('login.verify')}
        </button>
      </div>

      <button type="button" className="link-button" onClick={cancelOtp}>
        {tOtp('login.useDifferentAccount')}
      </button>
    </form>
  )
}
