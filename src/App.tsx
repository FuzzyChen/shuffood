import { useState, useCallback, useEffect, useRef } from 'react'
import { Box, Container, Paper } from '@mui/material'
import { searchNearbyRestaurants, shuffleArray, filterByDistance } from './utils/api'
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
  const [distanceRange, setDistanceRange] = useState<number>(10)
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([])
  const [minRating, setMinRating] = useState<number>(0)
  const shuffleIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude)
          setLongitude(position.coords.longitude)
        },
        () => {
          // Default to San Francisco if geolocation fails
          setLatitude(37.7749)
          setLongitude(-122.4194)
        }
      )
    }
  }, [])

  // Cleanup interval on component unmount
  useEffect(() => {
    return () => {
      if (shuffleIntervalRef.current) {
        clearInterval(shuffleIntervalRef.current)
      }
    }
  }, [])

  // Shuffle animation - defined first since other handlers depend on it
  const handleShuffle = useCallback(() => {
    if (filteredRestaurants.length === 0) {
      setError('No restaurants to shuffle')
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

  // Search restaurants when filters change
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

  // Shuffle from current filtered results (no API call)
  const handleSearchAndShuffle = useCallback(async () => {
    if (filteredRestaurants.length === 0) {
      // If no restaurants yet, do a search first
      await handleSearch()
      // After search completes, shuffle
      handleShuffle()
    } else {
      // If we already have results, just shuffle
      handleShuffle()
    }
  }, [filteredRestaurants, handleSearch, handleShuffle])

  const handleDistanceChange = useCallback(
    (newDistance: number) => {
      setDistanceRange(newDistance)
    },
    []
  )

  const handleCuisineToggle = useCallback(
    (cuisine: string) => {
      setSelectedCuisines((prev) => {
        const updated = prev.includes(cuisine) ? prev.filter((c) => c !== cuisine) : [...prev, cuisine]
        return updated
      })
    },
    []
  )

  const handleRatingChange = useCallback(
    (newRating: number) => {
      setMinRating(newRating)
    },
    []
  )



  return (
    <Box sx={{ width: '100%', minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
          {latitude && longitude && (
            <Box sx={{ color: 'white', textAlign: 'center', fontSize: '0.9rem', opacity: 0.8 }}>
              📍 Searching around your location ({latitude.toFixed(4)}, {longitude.toFixed(4)})
            </Box>
          )}

          {/* Filters */}
          <Box>
            <Paper sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
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
