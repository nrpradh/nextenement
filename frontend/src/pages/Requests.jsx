import { useState } from 'react'
import { Box, Heading, Flex, Button, Spinner } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useRequestsList } from '../hooks/useRequests'
import RequestsTable from '../components/RequestsTable'
import RequestFilters from '../components/RequestFilters'

export default function Requests() {
  const { user } = useAuth()
  const [filters, setFilters] = useState({})
  const { data, isLoading } = useRequestsList(
    user.role === 'manager' ? filters : {}
  )

  const requests = Array.isArray(data)
    ? data
    : data?.requests ?? []

  const counts = Array.isArray(data)
    ? {}
    : data?.counts ?? {}

  // console.log(JSON.stringify(requests, null, 2))


  return (
    <Box>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="lg">{user.role === 'manager' ? 'All Requests' : 'My Requests'}</Heading>
        {user.role === 'tenant' && (
          <Button as={RouterLink} to="/requests/new" colorScheme="blue">
            + Create Request
          </Button>
        )}
      </Flex>

      {user.role === 'manager' && (
        <RequestFilters
          filters={filters}
          onChange={setFilters}
          counts={counts}
        />
      )}

      {isLoading ? (
        <Flex justify="center" py={20}><Spinner size="xl" /></Flex>
      ) : (
        <RequestsTable requests={requests} />
      )}
    </Box>
  )
}
