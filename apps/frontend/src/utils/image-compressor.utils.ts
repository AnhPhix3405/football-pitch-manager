export interface CompressImageOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  mimeType?: string
}

export async function compressImage(
  file: File,
  options: CompressImageOptions = {},
): Promise<File> {
  const {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.8,
    mimeType = 'image/jpeg',
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

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(file)
        return
      }

      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (!blob || blob.size >= file.size) {
            // Giữ file gốc nếu file sau nén không nhỏ hơn
            resolve(file)
            return
          }

          const originalName = file.name.replace(/\.[^/.]+$/, '')
          const extension = mimeType === 'image/webp' ? 'webp' : 'jpg'
          const compressedFile = new File([blob], `${originalName}.${extension}`, {
            type: mimeType,
            lastModified: Date.now(),
          })

          resolve(compressedFile)
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
