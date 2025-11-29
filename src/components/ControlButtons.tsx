import { Box, Button } from '@mui/material'

interface ControlButtonsProps {
  restaurantsCount: number
  totalCount: number
  loading: boolean
  isShuffling: boolean
  onSearch: () => void
  onShuffle: () => void
}

export function ControlButtons({
  loading,
  isShuffling,
  onSearch,
}: ControlButtonsProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', alignItems: 'center' }}>
      <Button
        onClick={onSearch}
        disabled={loading || isShuffling}
        variant="contained"
        fullWidth
        sx={{
          maxWidth: 300,
          background: 'linear-gradient(135deg, #FF5722 0%, #FF7043 100%)',
          color: 'white',
          textTransform: 'none',
          fontWeight: 'bold',
          py: 1.5,
          fontSize: '1rem',
          borderRadius: 4,
        }}
      >
        {loading ? '🔍 Searching...' : isShuffling ? '🎲 Shuffling...' : '🎲 Find & Shuffle'}
      </Button>

    </Box>
  )
}
