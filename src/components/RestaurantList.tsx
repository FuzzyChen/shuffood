import { Box, List, ListItem, ListItemButton, Typography, Paper } from '@mui/material'
import type { Restaurant } from '../utils/api'

interface RestaurantListProps {
  restaurants: Restaurant[]
  selectedRestaurant: Restaurant | null
  onSelect: (restaurant: Restaurant) => void
}

export function RestaurantList({ restaurants, selectedRestaurant, onSelect }: RestaurantListProps) {
  if (restaurants.length === 0) {
    return null
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 500, mt: 2 }}>
      <Typography variant="h6" sx={{ color: 'white', textAlign: 'center', mb: 1 }}>
        📋 Available Restaurants
      </Typography>
      <Paper
        sx={{
          maxHeight: 400,
          overflowY: 'auto',
          p: 1,
          borderRadius: 4,
          backgroundColor: '#FFF8F0',
        }}
      >
        <List sx={{ p: 0 }}>
          {restaurants.map((restaurant, index) => (
            <ListItem key={restaurant.place_id} sx={{ p: 0 }}>
              <ListItemButton
                onClick={() => onSelect(restaurant)}
                selected={selectedRestaurant?.place_id === restaurant.place_id}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  backgroundColor:
                    selectedRestaurant?.place_id === restaurant.place_id
                      ? 'rgba(255, 126, 71, 0.2)'
                      : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 126, 71, 0.1)',
                  },
                  '&.Mui-selected': {
                    background: 'linear-gradient(135deg, #FF7E47 0%, #FF9A56 100%)',
                    color: 'white',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                  <Box
                    sx={{
                      background: 'linear-gradient(135deg, #FF7E47 0%, #FF9A56 100%)',
                      color: 'white',
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.85rem',
                      fontWeight: 'bold',
                      flexShrink: 0,
                    }}
                  >
                    {index + 1}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: selectedRestaurant?.place_id === restaurant.place_id ? 'white' : '#333',
                      }}
                    >
                      {restaurant.name}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', flexShrink: 0 }}>
                    {restaurant.distance && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: selectedRestaurant?.place_id === restaurant.place_id ? 'white' : '#FF7E47',
                          fontWeight: 600,
                        }}
                      >
                        {restaurant.distance.toFixed(1)} mi
                      </Typography>
                    )}
                    {restaurant.rating > 0 && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: selectedRestaurant?.place_id === restaurant.place_id ? 'white' : '#FF9A56',
                        }}
                      >
                        ⭐ {restaurant.rating.toFixed(1)}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  )
}
