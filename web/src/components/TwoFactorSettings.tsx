import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faShieldHalved, faCheck, faXmark } from '@fortawesome/free-solid-svg-icons'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { confirmTwoFactor, disableTwoFactor, fetchTwoFactorStatus, setupTwoFactor } from '../store/slices/securitySlice'
import { Modal } from './Modal'
import './TwoFactorSettings.css'

export function TwoFactorSettings() {
  const { t } = useTranslation('otp')
  const { t: tCommon } = useTranslation()
  const dispatch = useAppDispatch()
  const { enabled, statusLoading } = useAppSelector((state) => state.security)

  const [setupInfo, setSetupInfo] = useState<{ qrDataUri: string; secret: string } | null>(null)
  const [settingUp, setSettingUp] = useState(false)
  const [code, setCode] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [confirmingDisable, setConfirmingDisable] = useState(false)
  const [disabling, setDisabling] = useState(false)
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; title: string; message: string } | null>(null)

  useEffect(() => {
    dispatch(fetchTwoFactorStatus())
  }, [dispatch])

  const startSetup = async () => {
    setSettingUp(true)
    try {
      const info = await dispatch(setupTwoFactor()).unwrap()
      setSetupInfo(info)
    } catch (err) {
      setAlert({ type: 'error', title: t('settings.errorTitle'), message: typeof err === 'string' ? err : t('settings.errorTitle') })
      setSettingUp(false)
    }
  }

  const cancelSetup = () => {
    setSettingUp(false)
    setSetupInfo(null)
    setCode('')
  }

  const handleConfirm = async (event: FormEvent) => {
    event.preventDefault()
    setConfirming(true)
    try {
      await dispatch(confirmTwoFactor(code)).unwrap()
      cancelSetup()
      setAlert({ type: 'success', title: t('settings.enableSuccessTitle'), message: t('settings.enableSuccessMessage') })
    } catch (err) {
      setAlert({ type: 'error', title: t('settings.errorTitle'), message: typeof err === 'string' ? err : t('settings.errorTitle') })
    } finally {
      setConfirming(false)
    }
  }

  const handleDisable = async () => {
    setDisabling(true)
    try {
      await dispatch(disableTwoFactor()).unwrap()
      setConfirmingDisable(false)
      setAlert({ type: 'success', title: t('settings.disableSuccessTitle'), message: t('settings.disableSuccessMessage') })
    } catch (err) {
      setConfirmingDisable(false)
      setAlert({ type: 'error', title: t('settings.errorTitle'), message: typeof err === 'string' ? err : t('settings.errorTitle') })
    } finally {
      setDisabling(false)
    }
  }

  if (statusLoading && !enabled) {
    return null
  }

  return (
    <section className="security-panel">
      <h2>
        <FontAwesomeIcon icon={faShieldHalved} />
        {t('settings.title')}
      </h2>
      <p className="panel-note">{t('settings.description')}</p>

      <div className="security-status">
        <span className={`security-badge ${enabled ? 'security-badge-on' : 'security-badge-off'}`}>
          {enabled ? t('settings.statusEnabled') : t('settings.statusDisabled')}
        </span>

        {!enabled && !settingUp && (
          <button type="button" className="modal-ok-button" onClick={startSetup}>
            {t('settings.enableButton')}
          </button>
        )}

        {enabled && (
          <button type="button" className="modal-danger-button" onClick={() => setConfirmingDisable(true)}>
            {t('settings.disableButton')}
          </button>
        )}
      </div>

      {settingUp && setupInfo && (
        <form className="crispy-form security-setup" onSubmit={handleConfirm}>
          <p className="security-setup-title">{t('settings.scanTitle')}</p>
          <p className="panel-note">{t('settings.scanInstructions')}</p>

          <img className="security-qr" src={setupInfo.qrDataUri} alt="" />

          <p className="security-manual-label">{t('settings.manualEntryLabel')}</p>
          <code className="security-secret">{setupInfo.secret}</code>

          <div className="crispy-field">
            <label className="crispy-label" htmlFor="security-otp-code">
              {t('settings.codeLabel')}
            </label>
            <input
              id="security-otp-code"
              className="crispy-input security-code-input"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              required
            />
          </div>

          <div className="crispy-actions security-setup-actions">
            <button type="submit" className="modal-ok-button" disabled={confirming || code.length !== 6}>
              <FontAwesomeIcon icon={faCheck} />
              {confirming ? t('settings.confirming') : t('settings.confirmButton')}
            </button>
            <button type="button" className="link-button" onClick={cancelSetup}>
              <FontAwesomeIcon icon={faXmark} />
              {t('settings.cancelButton')}
            </button>
          </div>
        </form>
      )}

      <Modal
        isOpen={confirmingDisable}
        onClose={() => setConfirmingDisable(false)}
        title={t('settings.disableConfirmTitle')}
        footer={
          <>
            <button type="button" className="link-button" onClick={() => setConfirmingDisable(false)}>
              {tCommon('actions.cancel')}
            </button>
            <button type="button" className="modal-danger-button" onClick={handleDisable} disabled={disabling}>
              {t('settings.disableButton')}
            </button>
          </>
        }
      >
        <p>{t('settings.disableConfirmMessage')}</p>
      </Modal>

      <Modal
        isOpen={alert !== null}
        onClose={() => setAlert(null)}
        title={alert?.title ?? ''}
        footer={
          <button type="button" className="modal-ok-button" onClick={() => setAlert(null)}>
            {tCommon('actions.ok')}
          </button>
        }
      >
        <p className={alert?.type === 'error' ? 'modal-message-error' : 'modal-message-success'}>{alert?.message}</p>
      </Modal>
    </section>
  )
}
