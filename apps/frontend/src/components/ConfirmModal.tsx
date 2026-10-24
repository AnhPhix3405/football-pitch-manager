import { ExclamationCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import { Modal } from 'antd'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

export interface ConfirmModalProps {
  open: boolean
  title: ReactNode
  content?: ReactNode
  okText?: ReactNode
  cancelText?: ReactNode
  danger?: boolean
  loading?: boolean
  onOk: () => void | Promise<void>
  onCancel: () => void
}

export function ConfirmModal({
  open,
  title,
  content,
  okText,
  cancelText,
  danger = false,
  loading = false,
  onOk,
  onCancel,
}: ConfirmModalProps) {
  const { t } = useTranslation()

  return (
    <Modal
      open={open}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {danger ? (
            <ExclamationCircleOutlined style={{ color: '#ff4d4f', fontSize: 18 }} />
          ) : (
            <QuestionCircleOutlined style={{ color: 'var(--lime)', fontSize: 18 }} />
          )}
          <span>{title}</span>
        </div>
      }
      okText={okText ?? (danger ? t('common.delete') : t('common.confirm'))}
      cancelText={cancelText ?? t('common.cancel')}
      okButtonProps={{ danger, loading }}
      cancelButtonProps={{ disabled: loading }}
      onOk={onOk}
      onCancel={onCancel}
      centered
      destroyOnClose
    >
      {content && (
        <div style={{ color: 'var(--sage)', marginTop: 10, fontSize: 13, lineHeight: 1.6 }}>
          {content}
        </div>
      )}
    </Modal>
  )
}
