import { useState, useCallback, useEffect, useRef } from 'react'
import './App.css'
import { searchNearbyRestaurants, shuffleArray, filterByDistance, filterByCuisine, filterByRating, CUISINE_FILTERS } from './utils/api'
import type { Restaurant } from './utils/api'

function App() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([])
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)
  const [isShuffling, setIsShuffling] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [distanceRange, setDistanceRange] = useState<number>(10) // in miles
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([])
  const [minRating, setMinRating] = useState<number>(0)
  const [showCuisineDropdown, setShowCuisineDropdown] = useState(false)
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
    <div className="app-container">
      <header className="app-header">
        <h1>🍽️ Shuffood</h1>
        <p>Can't decide what to eat? Let's shuffle!</p>
      </header>

      <main className="app-main">
        {error && <div className="error-message">{error}</div>}

        {latitude && longitude && import.meta.env.VITE_GOOGLE_MAPS_API_KEY && (
          <div className="map-container">
            <iframe
              title="Current Location Map"
              width="100%"
              height="250"
              style={{ border: 0, borderRadius: '12px' }}
              src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&q=${latitude},${longitude}&zoom=15`}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        )}

        <div className="controls">

          <div className="filter-section filter-section-compact">
            <label htmlFor="distance-range" className="filter-label filter-label-small">
              🎯 Distance: {distanceRange} mi
            </label>
            <input
              id="distance-range"
              type="range"
              min="1"
              max="30"
              step="1"
              value={distanceRange}
              onChange={(e) => handleDistanceChange(Number(e.target.value))}
              className="distance-slider"
            />
          </div>

          <div className="filter-section filter-section-compact">
            <label htmlFor="min-rating" className="filter-label filter-label-small">
              ⭐ Min Rating: {minRating > 0 ? minRating : 'Any'}
            </label>
            <select
              id="min-rating"
              value={minRating}
              onChange={(e) => handleRatingChange(Number(e.target.value))}
              className="rating-select"
            >
              <option value="0">All ratings</option>
              <option value="3">3+ stars</option>
              <option value="3.5">3.5+ stars</option>
              <option value="4">4+ stars</option>
              <option value="4.5">4.5+ stars</option>
            </select>
          </div>

          <div className="filter-section filter-section-compact">
            <label htmlFor="cuisine-dropdown" className="filter-label filter-label-small">
              🍽️ Don't show: {selectedCuisines.length > 0 ? selectedCuisines.length : 'None'}
            </label>
            <div className="dropdown-container">
              <button
                id="cuisine-dropdown"
                onClick={() => setShowCuisineDropdown(!showCuisineDropdown)}
                className="dropdown-toggle"
              >
                {selectedCuisines.length === 0 ? 'Select cuisines to exclude' : `${selectedCuisines.length} selected`}
              </button>
              {showCuisineDropdown && (
                <div className="dropdown-menu">
                  {CUISINE_FILTERS.map((cuisine) => (
                    <label key={cuisine.value} className="dropdown-item">
                      <input
                        type="checkbox"
                        checked={selectedCuisines.includes(cuisine.value)}
                        onChange={() => handleCuisineToggle(cuisine.value)}
                      />
                      <span>{cuisine.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleSearchRestaurants}
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Searching...' : 'Find Restaurants'}
          </button>

          {filteredRestaurants.length > 0 && (
            <>
              <p className="restaurant-count">
                Found {filteredRestaurants.length} of {restaurants.length} restaurants
              </p>
              <button onClick={handleNewShuffle} disabled={isShuffling} className="btn btn-secondary">
                {isShuffling ? '🎲 Shuffling...' : '🎲 Shuffle'}
              </button>
            </>
          )}
        </div>

        {selectedRestaurant && (
          <div className="restaurant-card">
            <div className="restaurant-content">
              <h2>{selectedRestaurant.name}</h2>
              <p className="address">{selectedRestaurant.address}</p>
              <div className="restaurant-details">
                {selectedRestaurant.rating > 0 && (
                  <p className="rating">⭐ {selectedRestaurant.rating.toFixed(1)}</p>
                )}
                {selectedRestaurant.distance && (
                  <p className="distance">📍 {selectedRestaurant.distance.toFixed(1)} miles away</p>
                )}
              </div>
              <div className="actions">
                <button onClick={handleNewShuffle} disabled={isShuffling} className="btn btn-shuffle">
                  {isShuffling ? '🎲 Shuffling...' : 'Try Another'}
                </button>
              </div>
            </div>
          </div>
        )}

        {filteredRestaurants.length > 0 && !selectedRestaurant && (
          <div className="empty-state">
            <p>Click the shuffle button to pick a restaurant!</p>
          </div>
        )}

        {filteredRestaurants.length > 0 && (
          <div className="restaurant-list-section">
            <h3 className="list-title">📋 Available Restaurants</h3>
            <div className="restaurant-list">
              {filteredRestaurants.map((restaurant, index) => (
                <div
                  key={restaurant.place_id}
                  className={`restaurant-list-item ${selectedRestaurant?.place_id === restaurant.place_id ? 'active' : ''}`}
                  onClick={() => setSelectedRestaurant(restaurant)}
                >
                  <div className="list-item-header">
                    <span className="list-item-number">{index + 1}</span>
                    <h4 className="list-item-name">{restaurant.name}</h4>
                  </div>
                  <p className="list-item-distance">{restaurant.distance?.toFixed(1)} mi</p>
                  {restaurant.rating > 0 && (
                    <span className="list-item-rating">⭐ {restaurant.rating.toFixed(1)}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
