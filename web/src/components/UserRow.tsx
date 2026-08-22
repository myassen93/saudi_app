import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faTrash, faCheck, faXmark, faVenusMars, faLock } from '@fortawesome/free-solid-svg-icons'
import { useAppDispatch } from '../store/hooks'
import { deleteUser, updateUser } from '../store/slices/usersSlice'
import { Modal } from './Modal'
import type { Gender, User } from '../api/types'

function genderLabel(gender: string, t: (key: string) => string) {
  if (gender === 'male') return t('users.male')
  if (gender === 'female') return t('users.female')
  return t('users.notSet')
}

function BooleanMark({ value }: { value: boolean }) {
  return value ? (
    <FontAwesomeIcon icon={faCheck} className="mark-icon mark-true" />
  ) : (
    <FontAwesomeIcon icon={faXmark} className="mark-icon mark-false" />
  )
}

interface UserRowProps {
  user: User
  onNotify: (type: 'success' | 'error', title: string, message: string) => void
}

// Success/error feedback is reported to the parent via onNotify rather than kept in local
// state here: a successful delete removes this row from the list immediately, which unmounts
// this component before any local "deleted!" modal state would get a chance to render.
export function UserRow({ user, onNotify }: UserRowProps) {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const [showEditModal, setShowEditModal] = useState(false)
  const [username, setUsername] = useState(user.username)
  const [gender, setGender] = useState<Gender>(user.gender)
  const [isStaff, setIsStaff] = useState(user.is_staff)
  const [isActive, setIsActive] = useState(user.is_active)
  const [password, setPassword] = useState('')
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const startEditing = () => {
    setUsername(user.username)
    setGender(user.gender)
    setIsStaff(user.is_staff)
    setIsActive(user.is_active)
    setPassword('')
    setShowEditModal(true)
  }

  const handleSave = async (event: FormEvent) => {
    event.preventDefault()
    try {
      await dispatch(
        updateUser({
          id: user.id,
          payload: {
            username,
            gender,
            is_staff: isStaff,
            is_active: isActive,
            ...(password ? { password } : {}),
          },
        }),
      ).unwrap()
      setShowEditModal(false)
      onNotify('success', t('users.updateSuccessTitle'), t('users.updateSuccessMessage', { username }))
    } catch (err) {
      onNotify('error', t('users.errorTitle'), typeof err === 'string' ? err : t('users.errorTitle'))
    }
  }

  const handleConfirmDelete = async () => {
    setDeleting(true)
    const username = user.username
    try {
      await dispatch(deleteUser(user.id)).unwrap()
      onNotify('success', t('users.deleteSuccessTitle'), t('users.deleteSuccessMessage', { username }))
    } catch (err) {
      setConfirmingDelete(false)
      setDeleting(false)
      onNotify('error', t('users.errorTitle'), typeof err === 'string' ? err : t('users.errorTitle'))
    }
  }

  return (
    <>
      <tr>
        <td>{user.username}</td>
        <td>{genderLabel(user.gender, t)}</td>
        <td>
          <BooleanMark value={user.is_staff} />
        </td>
        <td>
          <BooleanMark value={user.is_active} />
        </td>
        <td className="row-actions">
          <button type="button" className="link-button" onClick={startEditing}>
            <FontAwesomeIcon icon={faPen} />
            {t('actions.edit')}
          </button>
          <button type="button" className="link-button danger" onClick={() => setConfirmingDelete(true)}>
            <FontAwesomeIcon icon={faTrash} />
            {t('actions.delete')}
          </button>
        </td>
      </tr>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title={t('actions.edit')}>
        <form className="edit-user-form" onSubmit={handleSave}>
          <input value={username} onChange={(e) => setUsername(e.target.value)} required />
          <div className="input-with-icon">
            <FontAwesomeIcon icon={faVenusMars} />
            <select value={gender} onChange={(e) => setGender(e.target.value as Gender)}>
              <option value="">{t('users.selectGender')}</option>
              <option value="male">{t('users.male')}</option>
              <option value="female">{t('users.female')}</option>
            </select>
          </div>
          <div className="input-with-icon">
            <FontAwesomeIcon icon={faLock} />
            <input
              type="password"
              placeholder={t('users.passwordHint')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <label className="checkbox-field">
            <input type="checkbox" checked={isStaff} onChange={(e) => setIsStaff(e.target.checked)} />
            {t('users.staff')}
          </label>
          <label className="checkbox-field">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            {t('users.active')}
          </label>
          <div className="edit-user-actions">
            <button type="button" className="link-button" onClick={() => setShowEditModal(false)}>
              <FontAwesomeIcon icon={faXmark} />
              {t('actions.cancel')}
            </button>
            <button type="submit" className="modal-ok-button">
              <FontAwesomeIcon icon={faCheck} />
              {t('actions.save')}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={confirmingDelete}
        onClose={() => setConfirmingDelete(false)}
        title={t('users.confirmDeleteTitle')}
        footer={
          <>
            <button type="button" className="link-button" onClick={() => setConfirmingDelete(false)}>
              {t('actions.cancel')}
            </button>
            <button type="button" className="modal-danger-button" onClick={handleConfirmDelete} disabled={deleting}>
              <FontAwesomeIcon icon={faTrash} />
              {t('actions.delete')}
            </button>
          </>
        }
      >
        <p>{t('users.confirmDeleteMessage', { username: user.username })}</p>
      </Modal>
    </>
  )
}
