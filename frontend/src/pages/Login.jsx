import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Box, Button, FormControl, FormLabel, Input, FormErrorMessage,
  Heading, VStack, Text, Link as ChakraLink, Alert, AlertIcon,
} from '@chakra-ui/react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { loginRequest } from '../api/auth'
import { useAuth } from '../auth/AuthContext'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) })
  const { login } = useAuth()
  const navigate = useNavigate()
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (values) => {
    setApiError('')
    setLoading(true)
    try {
      const data = await loginRequest(values)
      login(data.token, data.user)
      navigate('/dashboard')
    } catch (err) {
      setApiError(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.50">
      <Box bg="white" p={8} borderRadius="lg" boxShadow="md" w="full" maxW="400px">
        <Heading size="lg" mb={6} textAlign="center">Sign in</Heading>
        {apiError && (
          <Alert status="error" mb={4} borderRadius="md">
            <AlertIcon />
            {apiError}
          </Alert>
        )}
        <form onSubmit={handleSubmit(onSubmit)}>
          <VStack spacing={4}>
            <FormControl isInvalid={!!errors.email}>
              <FormLabel>Email</FormLabel>
              <Input type="email" {...register('email')} />
              <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={!!errors.password}>
              <FormLabel>Password</FormLabel>
              <Input type="password" {...register('password')} />
              <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
            </FormControl>
            <Button type="submit" colorScheme="blue" w="full" isLoading={loading}>
              Log in
            </Button>
          </VStack>
        </form>
        <Text mt={4} fontSize="sm" textAlign="center">
          No account? <ChakraLink as={RouterLink} to="/register" color="blue.500">Register</ChakraLink>
        </Text>
        <Text mt={2} fontSize="xs" color="gray.500" textAlign="center">
          Demo: manager@example.com / tenant@example.com — password123
        </Text>
      </Box>
    </Box>
  )
}
