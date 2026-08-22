import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUsers, faUser, faLock, faVenusMars, faUserPlus, faXmark } from '@fortawesome/free-solid-svg-icons'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { createUser, fetchUsers } from '../store/slices/usersSlice'
import { UserRow } from './UserRow'
import { Modal } from './Modal'
import type { Gender } from '../api/types'

export function UsersPanel() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { items, loading, error } = useAppSelector((state) => state.users)
  const [forbidden, setForbidden] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newGender, setNewGender] = useState<Gender>('')
  const [newIsStaff, setNewIsStaff] = useState(false)
  const [newIsActive, setNewIsActive] = useState(true)
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; title: string; message: string } | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  const notify = (type: 'success' | 'error', title: string, message: string) => setAlert({ type, title, message })

  useEffect(() => {
    dispatch(fetchUsers())
      .unwrap()
      .catch((err: unknown) => {
        if (err && typeof err === 'object' && 'status' in err && err.status === 403) setForbidden(true)
      })
  }, [dispatch])

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault()
    try {
      await dispatch(
        createUser({
          username: newUsername,
          password: newPassword,
          gender: newGender,
          is_staff: newIsStaff,
          is_active: newIsActive,
        }),
      ).unwrap()
      setAlert({
        type: 'success',
        title: t('users.createSuccessTitle'),
        message: t('users.createSuccessMessage', { username: newUsername }),
      })
      setNewUsername('')
      setNewPassword('')
      setNewGender('')
      setNewIsStaff(false)
      setNewIsActive(true)
      setShowAddModal(false)
    } catch (err) {
      setAlert({
        type: 'error',
        title: t('users.errorTitle'),
        message: typeof err === 'string' ? err : t('users.errorTitle'),
      })
    }
  }

  if (forbidden) {
    return null
  }

  return (
    <section className="users-panel">
      <div className="section-header">
        <h2>
          <FontAwesomeIcon icon={faUsers} />
          {t('users.title')}
        </h2>
        <button type="button" className="modal-ok-button" onClick={() => setShowAddModal(true)}>
          <FontAwesomeIcon icon={faUserPlus} />
          {t('actions.addUser')}
        </button>
      </div>

      {loading && <p className="panel-note">…</p>}
      {error && <p className="form-error">{error}</p>}
      {!loading && items.length === 0 && <p className="panel-note">{t('users.empty')}</p>}

      {items.length > 0 && (
        <table className="users-table">
          <thead>
            <tr>
              <th>{t('users.username')}</th>
              <th>{t('users.gender')}</th>
              <th>{t('users.staff')}</th>
              <th>{t('users.active')}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((user) => (
              <UserRow key={user.id} user={user} onNotify={notify} />
            ))}
          </tbody>
        </table>
      )}

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title={t('actions.addUser')}>
        <form className="add-user-form" onSubmit={handleCreate}>
          <div className="input-with-icon">
            <FontAwesomeIcon icon={faUser} />
            <input
              placeholder={t('users.newUsername')}
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              required
            />
          </div>
          <div className="input-with-icon">
            <FontAwesomeIcon icon={faLock} />
            <input
              type="password"
              placeholder={t('users.newPassword')}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="input-with-icon">
            <FontAwesomeIcon icon={faVenusMars} />
            <select value={newGender} onChange={(e) => setNewGender(e.target.value as Gender)}>
              <option value="">{t('users.selectGender')}</option>
              <option value="male">{t('users.male')}</option>
              <option value="female">{t('users.female')}</option>
            </select>
          </div>
          <label className="checkbox-field">
            <input type="checkbox" checked={newIsStaff} onChange={(e) => setNewIsStaff(e.target.checked)} />
            {t('users.staff')}
          </label>
          <label className="checkbox-field">
            <input type="checkbox" checked={newIsActive} onChange={(e) => setNewIsActive(e.target.checked)} />
            {t('users.active')}
          </label>
          <div className="add-user-form-actions">
            <button type="button" className="link-button" onClick={() => setShowAddModal(false)}>
              <FontAwesomeIcon icon={faXmark} />
              {t('actions.cancel')}
            </button>
            <button type="submit" className="modal-ok-button">
              <FontAwesomeIcon icon={faUserPlus} />
              {t('actions.addUser')}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={alert !== null}
        onClose={() => setAlert(null)}
        title={alert?.title ?? ''}
        footer={
          <button type="button" className="modal-ok-button" onClick={() => setAlert(null)}>
            {t('actions.ok')}
          </button>
        }
      >
        <p className={alert?.type === 'error' ? 'modal-message-error' : 'modal-message-success'}>{alert?.message}</p>
      </Modal>
    </section>
  )
}
