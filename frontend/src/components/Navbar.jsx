import { Flex, HStack, Text, Button, Spacer, Badge } from '@chakra-ui/react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <Flex as="nav" bg="white" borderBottomWidth="1px" px={6} py={3} align="center">
      <HStack spacing={6}>
        <Text fontWeight="bold" fontSize="lg">🏢 Apartment Maintenance</Text>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/requests">Requests</Link>
      </HStack>
      <Spacer />
      <HStack spacing={4}>
        <Badge colorScheme={user?.role === 'manager' ? 'purple' : 'teal'}>{user?.role}</Badge>
        <Text fontSize="sm" color="gray.600">{user?.name}</Text>
        <Button size="sm" variant="outline" onClick={handleLogout}>Log out</Button>
      </HStack>
    </Flex>
  )
}
