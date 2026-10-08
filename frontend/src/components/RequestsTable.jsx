import { Table, Thead, Tbody, Tr, Th, Td, TableContainer, Text } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import StatusBadge from './StatusBadge'
import PriorityBadge from './PriorityBadge'

export default function RequestsTable({ requests }) {
  const navigate = useNavigate()

  if (!requests || requests.length === 0) {
    return <Text color="gray.500" py={4}>No requests found.</Text>
  }

  return (
    <TableContainer bg="white" borderRadius="lg" borderWidth="1px">
      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            <Th>Title</Th>
            <Th>Unit</Th>
            <Th>Category</Th>
            <Th>Priority</Th>
            <Th>Status</Th>
            <Th>Created</Th>
          </Tr>
        </Thead>
        <Tbody>
          {requests.map((r) => (
            <Tr
              key={r.id}
              cursor="pointer"
              _hover={{ bg: 'gray.50' }}
              onClick={() => navigate(`/requests/${r.id}`)}
            >
              <Td fontWeight="medium">{r.title}</Td>
              <Td>{r.unit_number}</Td>
              <Td>{r.category}</Td>
              <Td><PriorityBadge priority={r.priority} /></Td>
              <Td><StatusBadge status={r.status} /></Td>
              <Td>{new Date(r.created_at).toLocaleDateString()}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  )
}
