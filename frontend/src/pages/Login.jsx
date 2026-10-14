import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Box, Button, Field, Input, Heading, Stack, Text, Link as ChakraLink, Alert, } from '@chakra-ui/react'

import { CircleAlert } from 'lucide-react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { loginRequest } from '../api/auth'
import { useAuth } from '../auth/AuthContext'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  })

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
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="gray.50"
      px={4}
      py={8}
    >
      <Box
        bg="white"
        p={8}
        borderRadius="lg"
        boxShadow="md"
        w="full"
        maxW="400px"
      >
        <Heading size="lg" mb={6} textAlign="center">
          Sign in
        </Heading>

        {apiError && (
          <Alert.Root status="error" mb={4} borderRadius="md">
            <Alert.Indicator>
              <CircleAlert size={18} />
            </Alert.Indicator>
            <Alert.Content>
              <Alert.Description>{apiError}</Alert.Description>
            </Alert.Content>
          </Alert.Root>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Stack gap={4}>
            <Field.Root invalid={!!errors.email}>
              <Field.Label>Email</Field.Label>
              <Input
                type="email"
                autoComplete="email"
                placeholder="Enter your email"
                {...register('email')}
              />
              {errors.email && (
                <Field.ErrorText>
                  {errors.email.message}
                </Field.ErrorText>
              )}
            </Field.Root>

            <Field.Root invalid={!!errors.password}>
              <Field.Label>Password</Field.Label>
              <Input
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                {...register('password')}
              />
              {errors.password && (
                <Field.ErrorText>
                  {errors.password.message}
                </Field.ErrorText>
              )}
            </Field.Root>

            <Button
              type="submit"
              colorPalette="blue"
              w="full"
              loading={loading}
              disabled={loading}
            >
              Log in
            </Button>
          </Stack>
        </form>

        <Text mt={4} fontSize="sm" textAlign="center">
          No account?{' '}
          <ChakraLink
            as={RouterLink}
            to="/register"
            color="blue.500"
          >
            Register
          </ChakraLink>
        </Text>

        <Text
          mt={2}
          fontSize="xs"
          color="gray.500"
          textAlign="center"
        >
          Demo: manager@example.com / tenant@example.com
          {' — '}password123
        </Text>
      </Box>
    </Box>
  )
}