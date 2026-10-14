import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Box, Button, Field, Input, NativeSelect, Heading, Stack, Text, Link as ChakraLink, Alert,
} from '@chakra-ui/react'
import { CircleAlert } from 'lucide-react'
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
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.50" px={4} py={8}>
      <Box bg="white" p={8} borderRadius="lg" boxShadow="md" w="full" maxW="420px">
        <Heading size="lg" mb={6} textAlign="center">Create account</Heading>
        {apiError && (
          <Alert.Root status="error" mb={4} borderRadius="md">
            <Alert.Indicator><CircleAlert size={18} /></Alert.Indicator>
            <Alert.Content>
              <Alert.Description>{apiError}</Alert.Description>
            </Alert.Content>
          </Alert.Root>
        )}
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Stack gap={4}>
            <Field.Root invalid={!!errors.name}>
              <Field.Label>Name</Field.Label>
              <Input autoComplete="name" {...register('name')} />
              {errors.name && <Field.ErrorText>{errors.name.message}</Field.ErrorText>}
            </Field.Root>
            <Field.Root invalid={!!errors.email}>
              <Field.Label>Email</Field.Label>
              <Input type="email" autoComplete="email" {...register('email')} />
              {errors.email && <Field.ErrorText>{errors.email.message}</Field.ErrorText>}
            </Field.Root>
            <Field.Root invalid={!!errors.password}>
              <Field.Label>Password</Field.Label>
              <Input type="password" autoComplete="new-password" {...register('password')} />
              {errors.password && <Field.ErrorText>{errors.password.message}</Field.ErrorText>}
            </Field.Root>
            <Field.Root invalid={!!errors.role}>
              <Field.Label>Role</Field.Label>
              <NativeSelect.Root>
                <NativeSelect.Field {...register('role')} defaultValue="" aria-label="Role">
                  <option value="" disabled>Select role</option>
                  <option value="tenant">Tenant</option>
                  <option value="manager">Manager</option>
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
              {errors.role && <Field.ErrorText>{errors.role.message}</Field.ErrorText>}
            </Field.Root>
            {role === 'tenant' && (
              <Field.Root>
                <Field.Label>Unit number</Field.Label>
                <Input {...register('unit_number')} />
              </Field.Root>
            )}
            <Button type="submit" colorPalette="blue" w="full" loading={loading} disabled={loading}>
              Register
            </Button>
          </Stack>
        </form>
        <Text mt={4} fontSize="sm" textAlign="center">
          Already have an account?{' '}
          <ChakraLink as={RouterLink} to="/login" color="blue.500">Log in</ChakraLink>
        </Text>
      </Box>
    </Box>
  )
}