import { HStack, Input, Select } from '@chakra-ui/react'

export default function RequestFilters({ filters, onChange }) {
  const set = (key) => (e) => onChange({ ...filters, [key]: e.target.value })

  return (
    <HStack spacing={3} mb={4} flexWrap="wrap">
      <Input
        placeholder="Search by unit or title"
        value={filters.search || ''}
        onChange={set('search')}
        maxW="260px"
        bg="white"
      />
      <Select placeholder="Status" value={filters.status || ''} onChange={set('status')} maxW="180px" bg="white">
        <option value="Pending">Pending</option>
        <option value="In Progress">In Progress</option>
        <option value="Resolved">Resolved</option>
      </Select>
      <Select placeholder="Priority" value={filters.priority || ''} onChange={set('priority')} maxW="180px" bg="white">
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
      </Select>
      <Select placeholder="Category" value={filters.category || ''} onChange={set('category')} maxW="180px" bg="white">
        <option value="Plumbing">Plumbing</option>
        <option value="Electrical">Electrical</option>
        <option value="AC">AC</option>
        <option value="Other">Other</option>
      </Select>
    </HStack>
  )
}
