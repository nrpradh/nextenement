import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Box, Button, FormControl, FormLabel, Input, Select, Textarea,
  FormErrorMessage, Heading, VStack, Alert, AlertIcon,
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { useCreateRequest } from '../hooks/useRequests'
import { useAuth } from '../auth/AuthContext'

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required').max(4000),
  category: z.enum(['Plumbing', 'Electrical', 'AC', 'Other'], { errorMap: () => ({ message: 'Choose a category' }) }),
  priority: z.enum(['Low', 'Medium', 'High'], { errorMap: () => ({ message: 'Choose a priority' }) }),
  unit_number: z.string().min(1, 'Unit number is required').max(50),
})

export default function NewRequest() {
  const { user } = useAuth()
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { unit_number: user?.unit_number || '' },
  })
  const navigate = useNavigate()
  const createMutation = useCreateRequest()
  const [apiError, setApiError] = useState('')

  const onSubmit = async (values) => {
    setApiError('')
    try {
      const created = await createMutation.mutateAsync(values)
      navigate(`/requests/${created.id}`)
    } catch (err) {
      setApiError(err.response?.data?.error || 'Failed to create request')
    }
  }

  return (
    <Box maxW="600px">
      <Heading size="lg" mb={6}>New Maintenance Request</Heading>
      {apiError && (
        <Alert status="error" mb={4} borderRadius="md">
          <AlertIcon />
          {apiError}
        </Alert>
      )}
      <Box bg="white" p={6} borderRadius="lg" borderWidth="1px">
        <form onSubmit={handleSubmit(onSubmit)}>
          <VStack spacing={4} align="stretch">
            <FormControl isInvalid={!!errors.title}>
              <FormLabel>Title</FormLabel>
              <Input {...register('title')} />
              <FormErrorMessage>{errors.title?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.description}>
              <FormLabel>Description</FormLabel>
              <Textarea rows={5} {...register('description')} />
              <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.category}>
              <FormLabel>Category</FormLabel>
              <Select placeholder="Select category" {...register('category')}>
                <option value="Plumbing">Plumbing</option>
                <option value="Electrical">Electrical</option>
                <option value="AC">AC</option>
                <option value="Other">Other</option>
              </Select>
              <FormErrorMessage>{errors.category?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.priority}>
              <FormLabel>Priority</FormLabel>
              <Select placeholder="Select priority" {...register('priority')}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </Select>
              <FormErrorMessage>{errors.priority?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.unit_number}>
              <FormLabel>Unit number</FormLabel>
              <Input {...register('unit_number')} />
              <FormErrorMessage>{errors.unit_number?.message}</FormErrorMessage>
            </FormControl>

            <Button type="submit" colorScheme="blue" isLoading={createMutation.isPending}>
              Submit Request
            </Button>
          </VStack>
        </form>
      </Box>
    </Box>
  )
}
