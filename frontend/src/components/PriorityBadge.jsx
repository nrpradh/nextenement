import { Badge } from '@chakra-ui/react'

const COLORS = {
  Low: 'gray',
  Medium: 'orange',
  High: 'red',
}

export default function PriorityBadge({ priority }) {
  return <Badge colorScheme={COLORS[priority] || 'gray'}>{priority}</Badge>
}
