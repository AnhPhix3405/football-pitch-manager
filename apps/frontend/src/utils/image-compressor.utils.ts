export interface CompressImageOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  mimeType?: string
}

export const AVATAR_COMPRESS_OPTIONS: CompressImageOptions = {
  maxWidth: 400,
  maxHeight: 400,
  quality: 0.8,
  mimeType: 'image/webp',
}

export async function compressAvatar(file: File): Promise<File> {
  return compressImage(file, AVATAR_COMPRESS_OPTIONS)
}

export async function compressImage(
  file: File,
  options: CompressImageOptions = {},
): Promise<File> {
  const {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.8,
    mimeType = 'image/webp',
  } = options

  // Không nén ảnh GIF để giữ animation
  if (file.type === 'image/gif') {
    return file
  }

  return new Promise((resolve) => {
    const img = new Image()
    const reader = new FileReader()

    reader.onload = (e) => {
      img.src = e.target?.result as string
    }

    img.onload = () => {
      let { width, height } = img

      // Tính toán kích thước mới theo tỷ lệ
      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        } else {
          width = Math.round((width * maxHeight) / height)
          height = maxHeight
        }
      }

      const didResize = width < img.width || height < img.height

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(file)
        return
      }

      ctx.drawImage(img, 0, 0, width, height)

      const handleBlob = (blob: Blob | null, outputMime: string) => {
        if (!blob) {
          resolve(file)
          return
        }

        // Nếu không resize và file nén lại lớn hơn file gốc thì giữ file gốc
        if (!didResize && blob.size >= file.size) {
          resolve(file)
          return
        }

        const originalName = file.name.replace(/\.[^/.]+$/, '')
        const extension = outputMime === 'image/webp' ? 'webp' : outputMime === 'image/png' ? 'png' : 'jpg'
        const compressedFile = new File([blob], `${originalName}.${extension}`, {
          type: outputMime,
          lastModified: Date.now(),
        })

        resolve(compressedFile)
      }

      canvas.toBlob(
        (blob) => {
          if (!blob && mimeType === 'image/webp') {
            // Fallback sang jpeg nếu trình duyệt không hỗ trợ webp toBlob
            canvas.toBlob((fallbackBlob) => handleBlob(fallbackBlob, 'image/jpeg'), 'image/jpeg', quality)
            return
          }
          handleBlob(blob, mimeType)
        },
        mimeType,
        quality,
      )
    }

    img.onerror = () => {
      resolve(file)
    }

    reader.readAsDataURL(file)
  })
}

const urlCompressionCache = new Map<string, string>()

/**
 * Nén chất lượng và kích thước ảnh đại diện từ URL thông qua HTML Canvas,
 * chuyển thành định dạng WebP nhẹ và lưu cache trong bộ nhớ để load tức thì.
 */
export async function compressImageUrl(
  url?: string | null,
  options: CompressImageOptions = AVATAR_COMPRESS_OPTIONS,
): Promise<string> {
  if (!url || typeof url !== 'string') return ''
  if (url.startsWith('data:') || url.startsWith('blob:')) return url
  if (urlCompressionCache.has(url)) {
    return urlCompressionCache.get(url)!
  }

  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      try {
        const { maxWidth = 200, maxHeight = 200, quality = 0.75, mimeType = 'image/webp' } = options
        let { width, height } = img

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          } else {
            width = Math.round((width * maxHeight) / height)
            height = maxHeight
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          resolve(url)
          return
        }

        ctx.drawImage(img, 0, 0, width, height)
        const compressedDataUrl = canvas.toDataURL(mimeType, quality)
        urlCompressionCache.set(url, compressedDataUrl)
        resolve(compressedDataUrl)
      } catch {
        resolve(url)
      }
    }

    img.onerror = () => {
      resolve(url)
    }

    img.src = url
  })
}

