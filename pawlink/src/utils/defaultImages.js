const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

export const DEFAULT_ANIMAL_IMAGES = {
  dog: '/images/dog.jpg',
  cat: '/images/cat.png',
  bird: '/images/parrot.jpg',
  other: '/images/dog.jpg'
}

export const DEFAULT_SHELTER_IMAGE = '/images/shelter.png'

export const resolveAssetUrl = (url) => {
  if (!url) return null

  if (
    url.startsWith('http') ||
    url.startsWith('data:') ||
    url.startsWith('blob:') ||
    url.startsWith('/images/')
  ) {
    return url
  }

  if (url.startsWith('/')) return `${API_BASE}${url}`
  return `${API_BASE}/${url}`
}

export const getDefaultAnimalImage = (type) => (
  DEFAULT_ANIMAL_IMAGES[String(type || '').toLowerCase()] || DEFAULT_ANIMAL_IMAGES.other
)

export const getAnimalImage = (imageUrl, type) => (
  resolveAssetUrl(imageUrl) || getDefaultAnimalImage(type)
)

export const getShelterImage = (imageUrl) => (
  resolveAssetUrl(imageUrl) || DEFAULT_SHELTER_IMAGE
)
