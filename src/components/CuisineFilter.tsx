import { useState } from 'react'
import { Box, Button, Typography, Checkbox, FormControlLabel, Paper } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import { CUISINE_FILTERS } from '../utils/api'

interface CuisineFilterProps {
  selectedCuisines: string[]
  onToggle: (cuisine: string) => void
}

export function CuisineFilter({ selectedCuisines, onToggle }: CuisineFilterProps) {
  const [open, setOpen] = useState(false)

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, fontSize: '0.85rem' }}>
        🍽️ Don't show: {selectedCuisines.length > 0 ? selectedCuisines.length : 'None'}
      </Typography>

      <Button
        fullWidth
        variant="outlined"
        onClick={() => setOpen(!open)}
        endIcon={open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        sx={{
          justifyContent: 'space-between',
          textTransform: 'none',
          fontSize: '0.85rem',
          color: '#333',
          borderColor: '#ddd',
          '&:hover': {
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.02)',
          },
        }}
      >
        {selectedCuisines.length === 0 ? 'Select cuisines to exclude' : `${selectedCuisines.length} selected`}
      </Button>

      {open && (
        <Paper
          sx={{
            mt: 1,
            p: 2,
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 1,
          }}
        >
          {CUISINE_FILTERS.map((cuisine) => (
            <FormControlLabel
              key={cuisine.value}
              control={
                <Checkbox
                  checked={selectedCuisines.includes(cuisine.value)}
                  onChange={() => onToggle(cuisine.value)}
                  size="small"
                />
              }
              label={<Typography variant="body2">{cuisine.label}</Typography>}
            />
          ))}
        </Paper>
      )}
    </Box>
  )
}
