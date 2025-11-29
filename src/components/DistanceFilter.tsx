import { Box, Slider, Typography } from '@mui/material'

interface DistanceFilterProps {
  value: number
  onChange: (value: number) => void
}

export function DistanceFilter({ value, onChange }: DistanceFilterProps) {
  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, fontSize: '0.85rem' }}>
        🎯 Distance: {value} miles
      </Typography>
      <Slider
        min={1}
        max={30}
        step={1}
        value={value}
        onChange={(_, newValue) => onChange(newValue as number)}
        sx={{
          '& .MuiSlider-thumb': {
            backgroundColor: '#FF7E47',
          },
          '& .MuiSlider-track': {
            background: 'linear-gradient(to right, #FF7E47, #FF9A56)',
          },
          '& .MuiSlider-rail': {
            backgroundColor: '#FFE4D6',
          },
        }}
      />
    </Box>
  )
}
