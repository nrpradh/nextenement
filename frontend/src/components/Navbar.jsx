import { useAuth } from '../auth/AuthContext'
import { Link, useNavigate } from 'react-router-dom'

// components
import { Flex, HStack, Text, Button, Spacer, Badge, Box, VStack } from '@chakra-ui/react'
import Breadcrumbs from './Breadcrumb'

// icons
import { Building2 } from 'lucide-react'


export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <Flex as="nav" bg="white" borderBottomWidth="1px" px={6} py={3} align="center">
      <HStack spaceX={6}>
        <VStack align="stretch" spacing={3}>
          <HStack spacing={2} align="center">
            <Building2 size={16} color="#902090" />
            <Text fontWeight="bold" fontSize="lg">
              Apartment Maintenance
            </Text>
          </HStack>

          <Box >
            <Breadcrumbs />
          </Box>
        </VStack>

        <Link to="/dashboard">Dashboard</Link>
        <Link to="/requests">Requests</Link>
      </HStack>
      <Spacer />
      <HStack spacing={4}>
        <Badge colorPalette={user?.role === 'manager' ? 'purple' : 'teal'} className='capitalize'>{user?.role}</Badge>
        <Text fontSize="sm" color="gray.600">{user?.name}</Text>
        <Button size="sm" variant="outline" onClick={handleLogout}>Log out</Button>
      </HStack>
    </Flex>
  )
}
