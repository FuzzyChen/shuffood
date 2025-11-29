export interface Restaurant {
  place_id: string
  name: string
  address: string
  rating: number
  photos?: string[]
  lat: number
  lng: number
  distance?: number // in miles
  cuisines?: string[] // Restaurant cuisine types
  types?: string[] // Restaurant types (e.g., 'italian_restaurant', 'sushi_restaurant')
  addressDescriptor?: {
    landmarks?: Array<{ landmark: string }>
    areaName?: string
  }
}

export const CUISINE_FILTERS = [
  { label: 'Mexican', value: 'mexican_restaurant' },
  { label: 'Chinese', value: 'chinese_restaurant' },
  { label: 'Italian', value: 'italian_restaurant' },
  { label: 'Japanese', value: 'japanese_restaurant' },
  { label: 'Indian', value: 'indian_restaurant' },
  { label: 'Thai', value: 'thai_restaurant' },
  { label: 'Korean', value: 'korean_restaurant' },
  { label: 'Vietnamese', value: 'vietnamese_restaurant' },
  { label: 'Spanish', value: 'spanish_restaurant' },
  { label: 'French', value: 'french_restaurant' },
  { label: 'American', value: 'american_restaurant' },
  { label: 'Middle Eastern', value: 'middle_eastern_restaurant' },
]

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

/**
 * Get city name from coordinates using reverse geocoding
 */
export async function getCityFromCoordinates(latitude: number, longitude: number): Promise<string> {
  console.log('getCityFromCoordinates called with:', latitude, longitude)
  console.log('API_KEY exists:', !!API_KEY)

  if (!API_KEY) {
    console.log('No API key, returning coordinates')
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${API_KEY}`
    const response = await fetch(url)

    if (!response.ok) {
      console.error('Geocoding API response not ok:', response.status)
      throw new Error('Failed to get location')
    }

    const data = await response.json()
    console.log('Geocoding API response:', data)

    if (data.results && data.results.length > 0) {
      // Try to find city (locality)
      for (const result of data.results) {
        const cityComponent = result.address_components?.find((component: any) =>
          component.types.includes('locality')
        )
        if (cityComponent) {
          console.log('Found city:', cityComponent.long_name)
          return cityComponent.long_name
        }
      }

      // Fallback to first result's formatted address (shortened)
      const formatted = data.results[0].formatted_address
      const parts = formatted.split(',')
      console.log('Using formatted address:', parts[0])
      return parts[0] || formatted
    }

    console.log('No results, returning coordinates')
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
  } catch (error) {
    console.error('Error in getCityFromCoordinates:', error)
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
  }
}

/**
 * Convert miles to meters
 */
export function milesToMeters(miles: number): number {
  return miles * 1609.34
}

/**
 * Convert meters to miles
 */
export function metersToMiles(meters: number): number {
  return meters / 1609.34
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in miles
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8 // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Search for nearby restaurants using Google Places API (New)
 * Uses the new Places API searchNearby endpoint
 * Applies cuisine exclusion and rating filters
 */
export async function searchNearbyRestaurants(
  latitude: number,
  longitude: number,
  radiusMiles: number = 10, // 10 miles radius
  excludedCuisines: string[] = [],
  minRating: number = 0
): Promise<Restaurant[]> {
  if (!API_KEY) {
    throw new Error('Google Maps API key not configured. Please set VITE_GOOGLE_MAPS_API_KEY environment variable.')
  }

  try {
    const radiusMeters = milesToMeters(radiusMiles)

    const excludedTypes = [
            'primary_school',
            'secondary_school',
            'movie_theater',
            'shopping_mall',
            'grocery_store',
            ...excludedCuisines,
          ]

    // Use the new Google Places API (v1) with searchNearby endpoint
    const response = await fetch(
      `https://places.googleapis.com/v1/places:searchNearby`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': API_KEY,
          'X-Goog-FieldMask': 'places.displayName,places.id,places.formattedAddress,places.rating,places.location,places.addressDescriptor,places.types',
        },
        body: JSON.stringify({
          locationRestriction: {
            circle: {
              center: {
                latitude,
                longitude,
              },
              radius: radiusMeters,
            },
          },
          includedTypes: ['restaurant'],
          excludedTypes: excludedTypes,
          maxResultCount: 20,
          languageCode: 'en',
          rankPreference: 'DISTANCE',
        }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`API Error: ${error.error?.message || response.statusText}`)
    }

    const data = await response.json()
    const places = data.places || []

    const restaurants: Restaurant[] = places
      .map((place: any) => {
        const distance = calculateDistance(
          latitude,
          longitude,
          place.location.latitude,
          place.location.longitude
        )
        return {
          place_id: place.id || place.name || '',
          name: place.displayName?.text || place.name || '',
          address: place.formattedAddress || '',
          rating: place.rating || 0,
          lat: place.location.latitude,
          lng: place.location.longitude,
          distance,
          photos: place.photos?.map((photo: any) => photo.name),
          types: place.types || [],
          addressDescriptor: place.addressDescriptor,
        }
      })
      .filter((restaurant: Restaurant) => {
        // Filter by minimum rating
        if (minRating > 0 && (restaurant.rating || 0) < minRating) {
          return false
        }

        return true
      })

    return restaurants
  } catch (error) {
    throw new Error(`Failed to fetch restaurants: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Filter restaurants by distance (in miles)
 */
export function filterByDistance(restaurants: Restaurant[], maxDistanceMiles: number): Restaurant[] {
  return restaurants.filter((r) => (r.distance || 0) <= maxDistanceMiles)
}


/**
 * Filter restaurants by minimum rating
 */
export function filterByRating(restaurants: Restaurant[], minRating: number): Restaurant[] {
  return restaurants.filter((r) => (r.rating || 0) >= minRating)
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Get a random restaurant from the list
 */
export function getRandomRestaurant<T>(array: T[]): T | null {
  if (array.length === 0) return null
  return array[Math.floor(Math.random() * array.length)]
}
