import { Badge } from '@chakra-ui/react'

const COLORS = {
  Pending: 'yellow',
  'In Progress': 'blue',
  Resolved: 'green',
}

export default function StatusBadge({ status }) {
  return <Badge colorScheme={COLORS[status] || 'gray'}>{status}</Badge>
}
