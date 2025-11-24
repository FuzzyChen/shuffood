import { useState, useCallback, useEffect, useRef } from 'react'
import { Box, Container, Paper } from '@mui/material'
import { searchNearbyRestaurants, shuffleArray, filterByDistance, filterByCuisine, filterByRating } from './utils/api'
import type { Restaurant } from './utils/api'
import { MapDisplay } from './components/MapDisplay'
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

  const handleSearchRestaurants = useCallback(async () => {
    if (!latitude || !longitude) {
      setError('Location not available')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const results = await searchNearbyRestaurants(latitude, longitude, distanceRange)
      setRestaurants(results)
      let filtered = filterByDistance(results, distanceRange)
      // Apply rating filter
      if (minRating > 0) {
        filtered = filterByRating(filtered, minRating)
      }
      // Apply cuisine exclusion filter if selected
      if (selectedCuisines.length > 0) {
        filtered = filterByCuisine(filtered, selectedCuisines)
      }
      setFilteredRestaurants(filtered)
      setSelectedRestaurant(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search restaurants')
    } finally {
      setLoading(false)
    }
  }, [latitude, longitude, distanceRange, selectedCuisines, minRating])

  const handleDistanceChange = useCallback(
    (newDistance: number) => {
      setDistanceRange(newDistance)
      let filtered = filterByDistance(restaurants, newDistance)
      // Apply rating filter
      if (minRating > 0) {
        filtered = filterByRating(filtered, minRating)
      }
      // Apply cuisine exclusion filter if selected
      if (selectedCuisines.length > 0) {
        filtered = filterByCuisine(filtered, selectedCuisines)
      }
      setFilteredRestaurants(filtered)
      setSelectedRestaurant(null)
    },
    [restaurants, selectedCuisines, minRating]
  )

  const handleCuisineToggle = useCallback(
    (cuisine: string) => {
      setSelectedCuisines((prev) => {
        const updated = prev.includes(cuisine) ? prev.filter((c) => c !== cuisine) : [...prev, cuisine]
        // Update filtered results immediately
        let filtered = filterByDistance(restaurants, distanceRange)
        // Apply rating filter
        if (minRating > 0) {
          filtered = filterByRating(filtered, minRating)
        }
        // Apply cuisine exclusion filter if selected
        if (updated.length > 0) {
          filtered = filterByCuisine(filtered, updated)
        }
        setFilteredRestaurants(filtered)
        setSelectedRestaurant(null)
        return updated
      })
    },
    [restaurants, distanceRange, minRating]
  )

  const handleRatingChange = useCallback(
    (newRating: number) => {
      setMinRating(newRating)
      let filtered = filterByDistance(restaurants, distanceRange)
      // Apply rating filter
      if (newRating > 0) {
        filtered = filterByRating(filtered, newRating)
      }
      // Apply cuisine exclusion filter if selected
      if (selectedCuisines.length > 0) {
        filtered = filterByCuisine(filtered, selectedCuisines)
      }
      setFilteredRestaurants(filtered)
      setSelectedRestaurant(null)
    },
    [restaurants, distanceRange, selectedCuisines]
  )

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

  const handleNewShuffle = useCallback(() => {
    if (filteredRestaurants.length > 0) {
      handleShuffle()
    }
  }, [filteredRestaurants, handleShuffle])

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 3,
          textAlign: 'center',
          boxShadow: 2,
          mb: 3,
        }}
      >
        <Box component="h1" sx={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold' }}>
          🍽️ Shuffood
        </Box>
        <Box component="p" sx={{ margin: '0.5rem 0 0 0', fontSize: '1.1rem', opacity: 0.9 }}>
          Can't decide what to eat? Let's shuffle!
        </Box>
      </Box>

      {/* Main Content */}
      <Container maxWidth="sm" sx={{ pb: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Error Display */}
          <Box>
            <ErrorDisplay error={error} />
          </Box>

          {/* Map */}
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <MapDisplay latitude={latitude} longitude={longitude} apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} />
          </Box>

          {/* Filters */}
          <Box>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <DistanceFilter value={distanceRange} onChange={handleDistanceChange} />
              <RatingFilter value={minRating} onChange={handleRatingChange} />
              <CuisineFilter selectedCuisines={selectedCuisines} onToggle={handleCuisineToggle} />
            </Paper>
          </Box>

          {/* Control Buttons */}
          <Box>
            <ControlButtons
              restaurantsCount={filteredRestaurants.length}
              totalCount={restaurants.length}
              loading={loading}
              isShuffling={isShuffling}
              onSearch={handleSearchRestaurants}
              onShuffle={handleNewShuffle}
            />
          </Box>

          {/* Restaurant Card */}
          {selectedRestaurant && (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <RestaurantCard
                restaurant={selectedRestaurant}
                isShuffling={isShuffling}
                onShuffle={handleNewShuffle}
              />
            </Box>
          )}

          {/* Restaurant List */}
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
