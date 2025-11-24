import { Alert } from '@mui/material'

interface ErrorDisplayProps {
  error: string | null
}

export function ErrorDisplay({ error }: ErrorDisplayProps) {
  if (!error) {
    return null
  }

  return (
    <Alert severity="error" sx={{ maxWidth: 500, mb: 2 }}>
      {error}
    </Alert>
  )
}
