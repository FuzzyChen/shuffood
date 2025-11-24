import { Box, Card, CardContent, Typography, Button } from '@mui/material'
import type { Restaurant } from '../utils/api'

interface RestaurantCardProps {
  restaurant: Restaurant
  isShuffling: boolean
  onShuffle: () => void
}

export function RestaurantCard({ restaurant, isShuffling, onShuffle }: RestaurantCardProps) {
  return (
    <Card
      sx={{
        maxWidth: 500,
        width: '100%',
        boxShadow: 4,
        animation: 'slideIn 0.5s ease',
        '@keyframes slideIn': {
          from: {
            opacity: 0,
            transform: 'translateY(20px)',
          },
          to: {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },
      }}
    >
      <CardContent>
        <Typography variant="h4" sx={{ mb: 1 }}>
          {restaurant.name}
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          {restaurant.address}
        </Typography>

        <Box
          sx={{
            backgroundColor: '#f9f9f9',
            p: 1.5,
            borderRadius: 1,
            borderLeft: '4px solid #667eea',
            mb: 2,
          }}
        >
          {restaurant.rating > 0 && (
            <Typography variant="body1" sx={{ mb: 0.5 }}>
              ⭐ {restaurant.rating.toFixed(1)}
            </Typography>
          )}
          {restaurant.distance && (
            <Typography variant="body1">📍 {restaurant.distance.toFixed(1)} miles away</Typography>
          )}
        </Box>

        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant="contained"
            onClick={onShuffle}
            disabled={isShuffling}
            sx={{
              background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
              color: 'white',
              textTransform: 'none',
              fontWeight: 'bold',
            }}
          >
            {isShuffling ? '🎲 Shuffling...' : 'Try Another'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  )
}
