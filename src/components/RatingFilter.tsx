import { Box, Select, MenuItem, Typography } from '@mui/material'

interface RatingFilterProps {
  value: number
  onChange: (value: number) => void
}

export function RatingFilter({ value, onChange }: RatingFilterProps) {
  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, fontSize: '0.85rem' }}>
        ⭐ Min Rating: {value > 0 ? value : 'Any'}
      </Typography>
      <Select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        fullWidth
        size="small"
        sx={{
          backgroundColor: 'white',
          borderRadius: 1,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#ddd',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#667eea',
          },
        }}
      >
        <MenuItem value="0">All ratings</MenuItem>
        <MenuItem value="3">3+ stars</MenuItem>
        <MenuItem value="3.5">3.5+ stars</MenuItem>
        <MenuItem value="4">4+ stars</MenuItem>
        <MenuItem value="4.5">4.5+ stars</MenuItem>
      </Select>
    </Box>
  )
}
