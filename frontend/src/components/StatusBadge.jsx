import { Badge } from '@chakra-ui/react'

const COLORS = {
  Pending: 'yellow',
  'In Progress': 'blue',
  Resolved: 'green',
}

export default function StatusBadge({ status }) {
  return (
    <Badge colorPalette={COLORS[status] || 'gray'} variant="surface">
      {status || 'Unknown'}
    </Badge>
  )
}