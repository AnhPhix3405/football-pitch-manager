import { useCallback, useState } from 'react'
import { createPost } from '~/features/posts/service/post.service'
import { uploadImageApi } from '~/features/chat/service/chat.service'
import type { BackendPost, CreatePostPayload } from '~/features/posts/interface/post.types'
import { compressImage } from '~/utils/image-compressor.utils'

export interface CreatePostFormFields {
  title: string
  content?: string
  playDate: string
  timeSlot: string
  skillLevelRequired: string
  maxPlayers: number
  location?: string
}

export function useCreatePost() {
  const [submitting, setSubmitting] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const selectImage = useCallback(async (file: File): Promise<string> => {
    setUploadingImage(true)
    setError(null)

    // Hiển thị preview cục bộ tức thì
    const localBlob = URL.createObjectURL(file)
    setImagePreviewUrl((prev) => {
      if (prev?.startsWith('blob:')) {
        URL.revokeObjectURL(prev)
      }
      return localBlob
    })

    try {
      let fileToUpload: File = file
      try {
        fileToUpload = await compressImage(file, { maxWidth: 1600, maxHeight: 1200, quality: 0.85 })
      } catch {
        fileToUpload = file
      }

      const uploadRes = await uploadImageApi(fileToUpload)
      setUploadedImageUrl(uploadRes.url)
      setImagePreviewUrl(uploadRes.url)
      return uploadRes.url
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Tải ảnh lên thất bại'
      setError(message)
      setImagePreviewUrl(null)
      setUploadedImageUrl(null)
      throw err
    } finally {
      setUploadingImage(false)
    }
  }, [])

  const removeImage = useCallback(() => {
    setUploadedImageUrl(null)
    setImagePreviewUrl((prev) => {
      if (prev?.startsWith('blob:')) {
        URL.revokeObjectURL(prev)
      }
      return null
    })
  }, [])

  const submitPost = useCallback(
    async (values: CreatePostFormFields): Promise<BackendPost> => {
      setSubmitting(true)
      setError(null)

      try {
        const [startTime = '', endTime = ''] = values.timeSlot.split(' - ')
        const trimmedLocation = values.location?.trim()
        const trimmedContent = values.content?.trim()

        let combinedContent: string | undefined
        if (trimmedContent && trimmedLocation) {
          combinedContent = `${trimmedContent} (Địa điểm: ${trimmedLocation})`
        } else if (trimmedLocation) {
          combinedContent = `Địa điểm: ${trimmedLocation}`
        } else {
          combinedContent = trimmedContent || undefined
        }

        const payload: CreatePostPayload = {
          title: values.title.trim(),
          content: combinedContent,
          playDate: values.playDate,
          startTime: startTime.trim(),
          endTime: endTime.trim() || undefined,
          skillLevelRequired: values.skillLevelRequired,
          maxPlayers: values.maxPlayers,
          imageUrl: uploadedImageUrl || undefined,
        }

        const created = await createPost(payload)
        return created
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Lỗi khi tạo bài đăng'
        setError(message)
        throw err
      } finally {
        setSubmitting(false)
      }
    },
    [uploadedImageUrl],
  )

  return {
    submitting,
    uploadingImage,
    uploadedImageUrl,
    imagePreviewUrl,
    error,
    selectImage,
    removeImage,
    submitPost,
  }
}
