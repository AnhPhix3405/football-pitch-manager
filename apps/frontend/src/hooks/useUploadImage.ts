import { useCallback, useEffect, useState } from 'react'
import { message } from 'antd'
import { useTranslation } from 'react-i18next'
import { uploadImageApi } from '~/features/chat/service/chat.service'
import { compressImage } from '~/utils/image-compressor.utils'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export function useUploadImage() {
  const { t } = useTranslation()
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return
    }

    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [file])

  const selectFile = useCallback(
    async (selectedFile: File): Promise<boolean> => {
      if (!ALLOWED_TYPES.includes(selectedFile.type)) {
        message.error(
          t('chat.invalidImageFormat', {
            defaultValue: 'Chỉ chấp nhận file ảnh (JPG, PNG, WEBP, GIF)',
          }),
        )
        return false
      }

      if (selectedFile.size > MAX_FILE_SIZE) {
        message.error(
          t('chat.imageSizeLimit', {
            defaultValue: 'Dung lượng ảnh tối đa là 10MB',
          }),
        )
        return false
      }

      try {
        const compressed = await compressImage(selectedFile)
        setFile(compressed)
      } catch {
        setFile(selectedFile)
      }
      return true
    },
    [t],
  )

  const clearFile = useCallback(() => {
    setFile(null)
  }, [])

  const upload = useCallback(async (): Promise<{ url: string; path: string } | null> => {
    if (!file) return null

    setIsUploading(true)
    try {
      const result = await uploadImageApi(file)
      clearFile()
      return result
    } catch {
      message.error(
        t('chat.imageUploadFailed', {
          defaultValue: 'Tải ảnh lên thất bại. Vui lòng thử lại.',
        }),
      )
      return null
    } finally {
      setIsUploading(false)
    }
  }, [file, clearFile, t])

  return {
    file,
    previewUrl,
    isUploading,
    selectFile,
    clearFile,
    upload,
  }
}
