const CLOUD_NAME    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

export async function uploadMedia(file, onProgress) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    const resourceType = file.type.startsWith('video/') ? 'video' : 'image'
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`)
    xhr.upload.onprogress = e => { if (e.lengthComputable && onProgress) onProgress(Math.round(e.loaded/e.total*100)) }
    xhr.onload = () => {
      const res = JSON.parse(xhr.responseText)
      if (xhr.status === 200) resolve({ url: res.secure_url, publicId: res.public_id, resourceType: res.resource_type, width: res.width, height: res.height, duration: res.duration||null })
      else reject(new Error(res.error?.message || 'Upload failed'))
    }
    xhr.onerror = () => reject(new Error('Network error'))
    xhr.send(formData)
  })
}

export async function uploadAvatar(file, onProgress) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)
  formData.append('folder', 'avatars')
  formData.append('transformation', 'w_200,h_200,c_fill,g_face,r_max')
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`)
    xhr.upload.onprogress = e => { if (e.lengthComputable && onProgress) onProgress(Math.round(e.loaded/e.total*100)) }
    xhr.onload = () => {
      const res = JSON.parse(xhr.responseText)
      if (xhr.status === 200) resolve(res.secure_url)
      else reject(new Error(res.error?.message || 'Upload failed'))
    }
    xhr.onerror = () => reject(new Error('Network error'))
    xhr.send(formData)
  })
}
