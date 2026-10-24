import { useState, type ReactNode } from 'react'
import { ConfirmModal } from '../components/ConfirmModal'

export interface ConfirmOptions {
  title: ReactNode
  content?: ReactNode
  okText?: ReactNode
  cancelText?: ReactNode
  danger?: boolean
  onOk: () => void | Promise<void>
  onCancel?: () => void
}

export function useConfirmModal() {
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  const [loading, setLoading] = useState(false)

  const showConfirm = (opts: ConfirmOptions) => {
    setOptions(opts)
  }

  const handleCancel = () => {
    if (loading) return
    options?.onCancel?.()
    setOptions(null)
  }

  const handleOk = async () => {
    if (!options) return
    try {
      setLoading(true)
      await options.onOk()
      setOptions(null)
    } finally {
      setLoading(false)
    }
  }

  const ConfirmDialog = options ? (
    <ConfirmModal
      open={Boolean(options)}
      title={options.title}
      content={options.content}
      okText={options.okText}
      cancelText={options.cancelText}
      danger={options.danger}
      loading={loading}
      onOk={handleOk}
      onCancel={handleCancel}
    />
  ) : null

  return { showConfirm, ConfirmDialog }
}
