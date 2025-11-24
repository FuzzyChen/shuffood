import { Box, Button, Typography } from '@mui/material'

interface ControlButtonsProps {
  restaurantsCount: number
  totalCount: number
  loading: boolean
  isShuffling: boolean
  onSearch: () => void
  onShuffle: () => void
}

export function ControlButtons({
  restaurantsCount,
  totalCount,
  loading,
  isShuffling,
  onSearch,
  onShuffle,
}: ControlButtonsProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%', alignItems: 'center' }}>
      <Button
        onClick={onSearch}
        disabled={loading}
        variant="contained"
        fullWidth
        sx={{
          maxWidth: 300,
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: 'white',
          textTransform: 'none',
          fontWeight: 'bold',
          py: 1,
        }}
      >
        {loading ? 'Searching...' : 'Find Restaurants'}
      </Button>

      {restaurantsCount > 0 && (
        <>
          <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>
            Found {restaurantsCount} of {totalCount} restaurants
          </Typography>
          <Button
            onClick={onShuffle}
            disabled={isShuffling}
            variant="contained"
            fullWidth
            sx={{
              maxWidth: 300,
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white',
              textTransform: 'none',
              fontWeight: 'bold',
              py: 1,
            }}
          >
            {isShuffling ? '🎲 Shuffling...' : '🎲 Shuffle'}
          </Button>
        </>
      )}
    </Box>
  )
}
