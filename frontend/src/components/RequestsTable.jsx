import { Table, Text } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import StatusBadge from './StatusBadge'
import PriorityBadge from './PriorityBadge'


export default function RequestsTable({ requests }) {
  const navigate = useNavigate()
  if (!requests || requests.length === 0) {
    return <Text color="gray.500" py={4}>No requests found.</Text>
  }
  return (
    <Table.ScrollArea bg="white" borderRadius="lg" borderWidth="1px">
      <Table.Root size="sm" variant="outline">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Title</Table.ColumnHeader>
            <Table.ColumnHeader>Unit</Table.ColumnHeader>
            <Table.ColumnHeader>Category</Table.ColumnHeader>
            <Table.ColumnHeader>Priority</Table.ColumnHeader>
            <Table.ColumnHeader>Status</Table.ColumnHeader>
            <Table.ColumnHeader>Created</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {requests.map((r) => (
            <Table.Row
              key={r.id}
              cursor="pointer"
              _hover={{ bg: 'gray.50' }}
              onClick={() => navigate(`/requests/${r.id}`)}
            >
              <Table.Cell fontWeight="medium">{r.title}</Table.Cell>
              <Table.Cell>{r.unit_number}</Table.Cell>
              <Table.Cell>{r.category}</Table.Cell>
              <Table.Cell><PriorityBadge priority={r.priority} /></Table.Cell>
              <Table.Cell><StatusBadge status={r.status} /></Table.Cell>
              <Table.Cell>{new Date(r.created_at).toLocaleDateString()}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Table.ScrollArea>
  )
}