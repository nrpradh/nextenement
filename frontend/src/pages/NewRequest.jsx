import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Box, Button, Field, Input, NativeSelect, Textarea, Heading, Stack, Alert,
} from '@chakra-ui/react'
import { CircleAlert } from 'lucide-react'
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
        <Alert.Root status="error" mb={4} borderRadius="md">
          <Alert.Indicator><CircleAlert size={18} /></Alert.Indicator>
          <Alert.Content>
            <Alert.Description>{apiError}</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}
      <Box bg="white" p={6} borderRadius="lg" borderWidth="1px">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Stack gap={4} align="stretch">
            <Field.Root invalid={!!errors.title}>
              <Field.Label>Title</Field.Label>
              <Input {...register('title')} />
              {errors.title && <Field.ErrorText>{errors.title.message}</Field.ErrorText>}
            </Field.Root>
            <Field.Root invalid={!!errors.description}>
              <Field.Label>Description</Field.Label>
              <Textarea rows={5} {...register('description')} />
              {errors.description && <Field.ErrorText>{errors.description.message}</Field.ErrorText>}
            </Field.Root>
            <Field.Root invalid={!!errors.category}>
              <Field.Label>Category</Field.Label>
              <NativeSelect.Root>
                <NativeSelect.Field {...register('category')} defaultValue="" aria-label="Category">
                  <option value="" disabled>Select category</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Electrical">Electrical</option>
                  <option value="AC">AC</option>
                  <option value="Other">Other</option>
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
              {errors.category && <Field.ErrorText>{errors.category.message}</Field.ErrorText>}
            </Field.Root>
            <Field.Root invalid={!!errors.priority}>
              <Field.Label>Priority</Field.Label>
              <NativeSelect.Root>
                <NativeSelect.Field {...register('priority')} defaultValue="" aria-label="Priority">
                  <option value="" disabled>Select priority</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
              {errors.priority && <Field.ErrorText>{errors.priority.message}</Field.ErrorText>}
            </Field.Root>
            <Field.Root invalid={!!errors.unit_number}>
              <Field.Label>Unit number</Field.Label>
              <Input {...register('unit_number')} />
              {errors.unit_number && <Field.ErrorText>{errors.unit_number.message}</Field.ErrorText>}
            </Field.Root>
            <Button type="submit" colorPalette="blue" loading={createMutation.isPending} disabled={createMutation.isPending}>
              Submit Request
            </Button>
          </Stack>
        </form>
      </Box>
    </Box>
  )
}