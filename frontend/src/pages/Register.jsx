import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Box, Button, FormControl, FormLabel, Input, Select, FormErrorMessage,
  Heading, VStack, Text, Link as ChakraLink, Alert, AlertIcon,
} from '@chakra-ui/react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { registerRequest } from '../api/auth'
import { useAuth } from '../auth/AuthContext'

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(120),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['tenant', 'manager'], { errorMap: () => ({ message: 'Choose a role' }) }),
  unit_number: z.string().optional(),
})

export default function Register() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({ resolver: zodResolver(schema) })
  const { login } = useAuth()
  const navigate = useNavigate()
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)
  const role = watch('role')

  const onSubmit = async (values) => {
    setApiError('')
    setLoading(true)
    try {
      const payload = { ...values, unit_number: values.unit_number || null }
      const data = await registerRequest(payload)
      login(data.token, data.user)
      navigate('/dashboard')
    } catch (err) {
      setApiError(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.50">
      <Box bg="white" p={8} borderRadius="lg" boxShadow="md" w="full" maxW="420px">
        <Heading size="lg" mb={6} textAlign="center">Create account</Heading>
        {apiError && (
          <Alert status="error" mb={4} borderRadius="md">
            <AlertIcon />
            {apiError}
          </Alert>
        )}
        <form onSubmit={handleSubmit(onSubmit)}>
          <VStack spacing={4}>
            <FormControl isInvalid={!!errors.name}>
              <FormLabel>Name</FormLabel>
              <Input {...register('name')} />
              <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
            </FormControl>
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
            <FormControl isInvalid={!!errors.role}>
              <FormLabel>Role</FormLabel>
              <Select placeholder="Select role" {...register('role')}>
                <option value="tenant">Tenant</option>
                <option value="manager">Manager</option>
              </Select>
              <FormErrorMessage>{errors.role?.message}</FormErrorMessage>
            </FormControl>
            {role === 'tenant' && (
              <FormControl>
                <FormLabel>Unit number</FormLabel>
                <Input {...register('unit_number')} />
              </FormControl>
            )}
            <Button type="submit" colorScheme="blue" w="full" isLoading={loading}>
              Register
            </Button>
          </VStack>
        </form>
        <Text mt={4} fontSize="sm" textAlign="center">
          Already have an account? <ChakraLink as={RouterLink} to="/login" color="blue.500">Log in</ChakraLink>
        </Text>
      </Box>
    </Box>
  )
}
