import { Box, SimpleGrid, Heading, Flex, Button, Spinner, Text } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useRequestsList } from '../hooks/useRequests'
import SummaryCard from '../components/SummaryCard'
import RequestsTable from '../components/RequestsTable'
import StatusChart from '../components/StatusChart'
import CategoryChart from '../components/CategoryChart'

export default function Dashboard() {
  const { user } = useAuth()
  const { data: requests, isLoading } = useRequestsList({})

  if (isLoading) {
    return <Flex justify="center" py={20}><Spinner size="xl" /></Flex>
  }

  const all = requests || []
  const pending = all.filter((r) => r.status === 'Pending').length
  const inProgress = all.filter((r) => r.status === 'In Progress').length
  const resolved = all.filter((r) => r.status === 'Resolved').length
  const highPriority = all.filter((r) => r.priority === 'High').length
  const recent = [...all].slice(0, 5)

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">
          {user.role === 'manager' ? 'Manager Dashboard' : 'My Dashboard'}
        </Heading>
        {user.role === 'tenant' && (
          <Button as={RouterLink} to="/requests/new" colorScheme="blue">
            + Create Request
          </Button>
        )}
      </Flex>

      <SimpleGrid columns={{ base: 2, md: user.role === 'manager' ? 5 : 4 }} spacing={4} mb={8}>
        <SummaryCard label="Total Requests" value={all.length} accentColor="gray.500" />
        <SummaryCard label="Pending" value={pending} accentColor="yellow.400" />
        <SummaryCard label="In Progress" value={inProgress} accentColor="blue.400" />
        <SummaryCard label="Resolved" value={resolved} accentColor="green.400" />
        {user.role === 'manager' && (
          <SummaryCard label="High Priority" value={highPriority} accentColor="red.400" />
        )}
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: user.role === 'manager' ? 2 : 1 }} spacing={4} mb={8}>
        <StatusChart requests={all} />
        {user.role === 'manager' && <CategoryChart requests={all} />}
      </SimpleGrid>

      <Heading size="md" mb={3}>Recent Requests</Heading>
      {recent.length === 0 ? (
        <Text color="gray.500">No requests yet.</Text>
      ) : (
        <RequestsTable requests={recent} />
      )}
    </Box>
  )
}
