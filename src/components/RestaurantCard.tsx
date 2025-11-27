import { Box, Card, CardContent, Typography } from '@mui/material'
import type { Restaurant } from '../utils/api'

interface RestaurantCardProps {
  restaurant: Restaurant
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  // Format restaurant types for display
  const formatTypes = (types?: string[]) => {
    if (!types || types.length === 0) return ''
    return types
      .filter((t) => !t.includes('point_of_interest'))
      .slice(0, 2)
      .map((t) => t.replace(/_/g, ' ').replace(/restaurant/i, '').trim())
      .filter((t) => t.length > 0)
      .join(' • ')
  }

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
        <Typography variant="h4" sx={{ mb: 0.5 }}>
          {restaurant.name}
        </Typography>

        {formatTypes(restaurant.types) && (
          <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1, fontStyle: 'italic' }}>
            {formatTypes(restaurant.types)}
          </Typography>
        )}

        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          {restaurant.address}
        </Typography>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#f9f9f9',
            p: 1.5,
            borderRadius: 1,
            borderLeft: '4px solid #667eea',
            mb: 2,
          }}
        >
          {restaurant.rating > 0 && (
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              ⭐ {restaurant.rating.toFixed(1)}
            </Typography>
          )}
          {restaurant.distance && (
            <Typography variant="body1">📍 {restaurant.distance.toFixed(1)} mi</Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}
