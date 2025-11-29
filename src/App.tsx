import { useState, useCallback, useEffect, useRef } from 'react'
import { Box, Container, Paper } from '@mui/material'
import { searchNearbyRestaurants, shuffleArray, filterByDistance, getCityFromCoordinates } from './utils/api'
import type { Restaurant } from './utils/api'
import { DistanceFilter } from './components/DistanceFilter'
import { RatingFilter } from './components/RatingFilter'
import { CuisineFilter } from './components/CuisineFilter'
import { RestaurantCard } from './components/RestaurantCard'
import { RestaurantList } from './components/RestaurantList'
import { ErrorDisplay } from './components/ErrorDisplay'
import { ControlButtons } from './components/ControlButtons'

function App() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([])
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)
  const [isShuffling, setIsShuffling] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [cityName, setCityName] = useState<string>('')
  const [distanceRange, setDistanceRange] = useState<number>(10)
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([])
  const [minRating, setMinRating] = useState<number>(0)
  const shuffleIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const shouldShuffleAfterSearchRef = useRef(false)

  // Get user's current location
  useEffect(() => {
    const initLocation = async () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const lat = position.coords.latitude
            const lng = position.coords.longitude
            console.log('Geolocation success:', lat, lng)
            setLatitude(lat)
            setLongitude(lng)
            // Get city name
            const city = await getCityFromCoordinates(lat, lng)
            console.log('City name:', city)
            setCityName(city)
          },
          async (error) => {
            console.log('Geolocation error:', error.message)
            // Default to San Francisco if geolocation fails
            const lat = 37.7749
            const lng = -122.4194
            setLatitude(lat)
            setLongitude(lng)
            const city = await getCityFromCoordinates(lat, lng)
            console.log('Fallback city name:', city)
            setCityName(city)
          }
        )
      } else {
        console.log('Geolocation not available')
        // If geolocation is not available, default to San Francisco
        const lat = 37.7749
        const lng = -122.4194
        setLatitude(lat)
        setLongitude(lng)
        const city = await getCityFromCoordinates(lat, lng)
        console.log('No geolocation city name:', city)
        setCityName(city)
      }
    }

    initLocation()
  }, [])

  // Cleanup interval on component unmount
  useEffect(() => {
    return () => {
      if (shuffleIntervalRef.current) {
        clearInterval(shuffleIntervalRef.current)
      }
    }
  }, [])

  // Shuffle animation
  const handleShuffle = useCallback(() => {
    if (filteredRestaurants.length === 0) {
      return
    }

    // Clear any existing interval
    if (shuffleIntervalRef.current) {
      clearInterval(shuffleIntervalRef.current)
    }

    // Start shuffling animation for 3 seconds
    setIsShuffling(true)
    let count = 0
    const totalCycles = 30 // 3 seconds / 100ms = 30 cycles

    shuffleIntervalRef.current = setInterval(() => {
      // Randomly select a restaurant to display
      const randomIndex = Math.floor(Math.random() * filteredRestaurants.length)
      setSelectedRestaurant(filteredRestaurants[randomIndex])
      count++

      // Stop after 3 seconds and show final result
      if (count >= totalCycles) {
        clearInterval(shuffleIntervalRef.current!)
        shuffleIntervalRef.current = null
        // Final shuffle to get the ultimate selection
        const shuffled = shuffleArray([...filteredRestaurants])
        setSelectedRestaurant(shuffled[0])
        setIsShuffling(false)
      }
    }, 100) // Update every 100ms for smooth animation
  }, [filteredRestaurants])

  // Search restaurants
  const handleSearch = useCallback(async () => {
    if (!latitude || !longitude) {
      setError('Location not available')
      return
    }

    setLoading(true)
    setError(null)
    try {
      // Pass filters directly to the API
      const results = await searchNearbyRestaurants(latitude, longitude, distanceRange, selectedCuisines, minRating)
      setRestaurants(results)
      // Distance filtering is still applied client-side for real-time adjustments
      const filtered = filterByDistance(results, distanceRange)
      setFilteredRestaurants(filtered)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search restaurants')
    } finally {
      setLoading(false)
    }
  }, [latitude, longitude, distanceRange, selectedCuisines, minRating])

  // Button click handler: Search if empty, then shuffle. Otherwise just shuffle.
  const handleSearchAndShuffle = useCallback(async () => {
    if (filteredRestaurants.length === 0) {
      // First time or after filter change - search then shuffle
      shouldShuffleAfterSearchRef.current = true
      await handleSearch()
    } else {
      // Already have results - just shuffle
      handleShuffle()
    }
  }, [filteredRestaurants.length, handleSearch, handleShuffle])

  // Auto-shuffle after search completes
  useEffect(() => {
    if (shouldShuffleAfterSearchRef.current && filteredRestaurants.length > 0 && !loading) {
      shouldShuffleAfterSearchRef.current = false
      handleShuffle()
    }
  }, [filteredRestaurants, loading, handleShuffle])



  // Clear restaurants when filters change
  const handleDistanceChange = useCallback(
    (newDistance: number) => {
      setDistanceRange(newDistance)
      setRestaurants([])
      setFilteredRestaurants([])
      setSelectedRestaurant(null)
    },
    []
  )

  const handleCuisineToggle = useCallback(
    (cuisine: string) => {
      setSelectedCuisines((prev) => {
        const updated = prev.includes(cuisine) ? prev.filter((c) => c !== cuisine) : [...prev, cuisine]
        return updated
      })
      setRestaurants([])
      setFilteredRestaurants([])
      setSelectedRestaurant(null)
    },
    []
  )

  const handleRatingChange = useCallback(
    (newRating: number) => {
      setMinRating(newRating)
      setRestaurants([])
      setFilteredRestaurants([])
      setSelectedRestaurant(null)
    },
    []
  )



  return (
    <Box sx={{ width: '100%', minHeight: '100vh', background: 'linear-gradient(to bottom right, #FF7E47 0%, #FF9A56 50%, #FFB347 100%)' }}>
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(to bottom right, #FF7E47 0%, #FF9A56 50%, #FFB347 100%)',
          color: 'white',
          py: 1.5,
          textAlign: 'center',
          boxShadow: 2,
          mb: 2,
        }}
      >
        <Box component="h1" sx={{ margin: 0, fontSize: '1.8rem', fontWeight: 'bold' }}>
          🍽️ Shuffood
        </Box>
        <Box component="p" sx={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', opacity: 0.9 }}>
          Can't decide? Shuffle!
        </Box>
      </Box>

      {/* Main Content */}
      <Container maxWidth="sm" sx={{ pb: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Error Display */}
          <Box>
            <ErrorDisplay error={error} />
          </Box>

          {/* Location Info */}
          {cityName && (
            <Box sx={{ color: 'white', textAlign: 'center', fontSize: '0.9rem', opacity: 0.8 }}>
              📍 {cityName}
            </Box>
          )}

          {/* Filters */}
          <Box>
            <Paper sx={{ p: 2.5, borderRadius: 4, backgroundColor: '#FFF8F0', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <DistanceFilter value={distanceRange} onChange={handleDistanceChange} />
              <RatingFilter value={minRating} onChange={handleRatingChange} />
              <CuisineFilter selectedCuisines={selectedCuisines} onToggle={handleCuisineToggle} />
            </Paper>
          </Box>

          {/* Control Buttons - Sticky to keep visible */}
          <Box sx={{ position: 'sticky', top: 20, zIndex: 10 }}>
            <ControlButtons
              restaurantsCount={filteredRestaurants.length}
              totalCount={restaurants.length}
              loading={loading}
              isShuffling={isShuffling}
              onSearch={handleSearchAndShuffle}
              onShuffle={handleShuffle}
            />
          </Box>

          {/* Restaurant Card */}
          {selectedRestaurant && (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <RestaurantCard restaurant={selectedRestaurant} />
            </Box>
          )}

          {/* Restaurant List - Enlarged */}
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <RestaurantList
              restaurants={filteredRestaurants}
              selectedRestaurant={selectedRestaurant}
              onSelect={setSelectedRestaurant}
            />
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

export default App
