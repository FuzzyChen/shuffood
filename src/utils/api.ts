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
  { label: 'Mexican', value: 'mexican' },
  { label: 'Chinese', value: 'chinese' },
  { label: 'Italian', value: 'italian' },
  { label: 'Japanese', value: 'japanese' },
  { label: 'Indian', value: 'indian' },
  { label: 'Thai', value: 'thai' },
  { label: 'Korean', value: 'korean' },
  { label: 'Vietnamese', value: 'vietnamese' },
  { label: 'Spanish', value: 'spanish' },
  { label: 'French', value: 'french' },
  { label: 'American', value: 'american' },
  { label: 'Middle Eastern', value: 'middle_eastern' },
]

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

const CUISINE_KEYWORDS: Record<string, string[]> = {
  mexican: ['mexican', 'taco', 'taqueria', 'burrito', 'qdoba', 'chipotle'],
  chinese: ['chinese', 'peking', 'szechuan', 'sichuan', 'dim sum', 'wok'],
  italian: ['italian', 'pizza', 'pasta', 'trattoria', 'pizzeria'],
  japanese: ['japanese', 'sushi', 'ramen', 'tempura', 'tonkatsu'],
  indian: ['indian', 'curry', 'tandoor', 'naan', 'pakora'],
  thai: ['thai', 'pad thai'],
  korean: ['korean', 'bbq', 'kimchi'],
  vietnamese: ['vietnamese', 'pho', 'banh mi'],
  spanish: ['spanish', 'tapas', 'paella'],
  french: ['french', 'bistro', 'brasserie'],
  american: ['american', 'burger', 'steakhouse', 'bbq', 'grille'],
  middle_eastern: ['middle eastern', 'mediterranean', 'kebab', 'hummus', 'falafel'],
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
          excludedTypes: [
            'primary_school',
            'secondary_school',
            'movie_theater',
            'shopping_mall',
            'grocery_store',
          ],
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

        // Filter by excluded cuisines
        if (excludedCuisines.length > 0) {
          const restaurantNameLower = restaurant.name.toLowerCase()
          // EXCLUDE restaurants that match any of the selected cuisines
          if (
            excludedCuisines.some((cuisine) =>
              (CUISINE_KEYWORDS[cuisine] || []).some((keyword) => restaurantNameLower.includes(keyword))
            )
          ) {
            return false
          }
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
 * Filter restaurants by cuisine type to EXCLUDE
 * Removes restaurants that match the selected cuisine keywords
 */
export function filterByCuisine(restaurants: Restaurant[], excludedCuisines: string[]): Restaurant[] {
  if (excludedCuisines.length === 0) return restaurants

  return restaurants.filter((restaurant) => {
    const restaurantNameLower = restaurant.name.toLowerCase()
    // EXCLUDE restaurants that match any of the selected cuisines
    return !excludedCuisines.some((cuisine) =>
      (CUISINE_KEYWORDS[cuisine] || []).some((keyword) => restaurantNameLower.includes(keyword))
    )
  })
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
