import { Box } from '@mui/material'

interface MapDisplayProps {
  latitude: number | null
  longitude: number | null
  apiKey: string | undefined
}

export function MapDisplay({ latitude, longitude, apiKey }: MapDisplayProps) {
  if (!latitude || !longitude || !apiKey) {
    return null
  }

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 500,
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: 2,
        mb: 2,
      }}
    >
      <iframe
        title="Current Location Map"
        width="100%"
        height="250"
        style={{ border: 0 }}
        src={`https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${latitude},${longitude}&zoom=15`}
        allowFullScreen={true}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </Box>
  )
}
