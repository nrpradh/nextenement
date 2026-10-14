import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Box, Heading, Text, Stack, HStack, Button, Spinner, Flex, NativeSelect,
  Field, Input, Textarea, Alert, Dialog,
} from '@chakra-ui/react'
import { CircleAlert } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import {
  useRequestDetail, useUpdateRequest, useDeleteRequest,
  useUpdateStatus, useUpdatePriority, useAssignToSelf,
} from '../hooks/useRequests'
import StatusBadge from '../components/StatusBadge'
import PriorityBadge from '../components/PriorityBadge'
const editSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(4000),
  category: z.enum(['Plumbing', 'Electrical', 'AC', 'Other']),
  priority: z.enum(['Low', 'Medium', 'High']),
  unit_number: z.string().min(1).max(50),
})
export default function RequestDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data: req, isLoading } = useRequestDetail(id)
  const updateMutation = useUpdateRequest(id)
  const deleteMutation = useDeleteRequest()
  const statusMutation = useUpdateStatus(id)
  const priorityMutation = useUpdatePriority(id)
  const assignMutation = useAssignToSelf(id)
  const [isEditing, setIsEditing] = useState(false)
  const [apiError, setApiError] = useState('')
  const [isCancelOpen, setIsCancelOpen] = useState(false)
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(editSchema),
    values: req ? {
      title: req.title, description: req.description, category: req.category,
      priority: req.priority, unit_number: req.unit_number,
    } : undefined,
  })
  if (isLoading) {
    return <Flex justify="center" py={20}><Spinner size="xl" /></Flex>
  }
  if (!req) {
    return <Text>Request not found.</Text>
  }
  const isOwner = user.id === req.submitted_by
  const isTenant = user.role === 'tenant'
  const isManager = user.role === 'manager'
  const canTenantEdit = isTenant && isOwner && req.status === 'Pending'
  const onSaveEdit = async (values) => {
    setApiError('')
    try {
      await updateMutation.mutateAsync(values)
      setIsEditing(false)
    } catch (err) {
      setApiError(err.response?.data?.error || 'Failed to update request')
    }
  }
  const handleCancelRequest = async () => {
    setApiError('')
    try {
      await deleteMutation.mutateAsync(req.id)
      setIsCancelOpen(false)
      navigate('/requests')
    } catch (err) {
      setApiError(err.response?.data?.error || 'Failed to cancel request')
    }
  }
  const handleStatusChange = async (e) => {
    setApiError('')
    try {
      await statusMutation.mutateAsync(e.target.value)
    } catch (err) {
      setApiError(err.response?.data?.error || 'Failed to update status')
    }
  }
  const handlePriorityChange = async (e) => {
    setApiError('')
    try {
      await priorityMutation.mutateAsync(e.target.value)
    } catch (err) {
      setApiError(err.response?.data?.error || 'Failed to update priority')
    }
  }
  const handleAssign = async () => {
    setApiError('')
    try {
      await assignMutation.mutateAsync()
    } catch (err) {
      setApiError(err.response?.data?.error || 'Failed to assign request')
    }
  }
  const handleResolve = async () => {
    setApiError('')
    try {
      await statusMutation.mutateAsync('Resolved')
    } catch (err) {
      setApiError(err.response?.data?.error || 'Failed to resolve request')
    }
  }
  return (
    <Box maxW="700px">
      <Heading size="lg" mb={4}>Request #{req.id}</Heading>
      {apiError && (
        <Alert.Root status="error" mb={4} borderRadius="md">
          <Alert.Indicator><CircleAlert size={18} /></Alert.Indicator>
          <Alert.Content><Alert.Description>{apiError}</Alert.Description></Alert.Content>
        </Alert.Root>
      )}
      <Box bg="white" p={6} borderRadius="lg" borderWidth="1px" mb={6}>
        {!isEditing ? (
          <Stack align="stretch" gap={3}>
            <HStack justify="space-between" flexWrap="wrap">
              <Heading size="md">{req.title}</Heading>
              <HStack>
                <StatusBadge status={req.status} />
                <PriorityBadge priority={req.priority} />
              </HStack>
            </HStack>
            <Text color="gray.700">{req.description}</Text>
            <HStack gap={8} pt={2} color="gray.600" fontSize="sm" flexWrap="wrap">
              <Text><b>Category:</b> {req.category}</Text>
              <Text><b>Unit:</b> {req.unit_number}</Text>
              <Text><b>Created:</b> {new Date(req.created_at).toLocaleString()}</Text>
            </HStack>
            <HStack gap={8} color="gray.600" fontSize="sm" flexWrap="wrap">
              <Text><b>Submitted by:</b> user #{req.submitted_by}</Text>
              <Text><b>Assigned manager:</b> {req.assigned_to ? `user #${req.assigned_to}` : 'Unassigned'}</Text>
            </HStack>
          </Stack>
        ) : (
          <form onSubmit={handleSubmit(onSaveEdit)} noValidate>
            <Stack gap={4} align="stretch">
              <Field.Root invalid={!!errors.title}>
                <Field.Label>Title</Field.Label>
                <Input {...register('title')} />
                {errors.title && <Field.ErrorText>{errors.title.message}</Field.ErrorText>}
              </Field.Root>
              <Field.Root invalid={!!errors.description}>
                <Field.Label>Description</Field.Label>
                <Textarea rows={4} {...register('description')} />
                {errors.description && <Field.ErrorText>{errors.description.message}</Field.ErrorText>}
              </Field.Root>
              <Field.Root invalid={!!errors.category}>
                <Field.Label>Category</Field.Label>
                <NativeSelect.Root>
                  <NativeSelect.Field {...register('category')}>
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
                  <NativeSelect.Field {...register('priority')}>
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
              <HStack>
                <Button type="submit" colorPalette="blue" loading={updateMutation.isPending} disabled={updateMutation.isPending}>Save</Button>
                <Button type="button" variant="outline" onClick={() => { setIsEditing(false); reset() }}>Cancel</Button>
              </HStack>
            </Stack>
          </form>
        )}
      </Box>
      {!isEditing && canTenantEdit && (
        <HStack mb={6}>
          <Button colorPalette="blue" onClick={() => setIsEditing(true)}>Edit</Button>
          <Button colorPalette="red" variant="outline" onClick={() => setIsCancelOpen(true)}>Cancel Request</Button>
        </HStack>
      )}
      {isManager && (
        <Box bg="white" p={6} borderRadius="lg" borderWidth="1px">
          <Heading size="sm" mb={4}>Manager Actions</Heading>
          <Stack align="stretch" gap={4} maxW="300px">
            <Field.Root>
              <Field.Label fontSize="sm">Status</Field.Label>
              <NativeSelect.Root>
                <NativeSelect.Field value={req.status} onChange={handleStatusChange}>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
            </Field.Root>
            <Field.Root>
              <Field.Label fontSize="sm">Priority</Field.Label>
              <NativeSelect.Root>
                <NativeSelect.Field value={req.priority} onChange={handlePriorityChange}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
            </Field.Root>
            <HStack flexWrap="wrap">
              <Button onClick={handleAssign} disabled={req.assigned_to === user.id || assignMutation.isPending} loading={assignMutation.isPending}>
                {req.assigned_to === user.id ? 'Assigned to you' : 'Assign to me'}
              </Button>
              <Button colorPalette="green" onClick={handleResolve} disabled={req.status === 'Resolved' || statusMutation.isPending} loading={statusMutation.isPending}>
                Mark Resolved
              </Button>
            </HStack>
          </Stack>
        </Box>
      )}
      <Dialog.Root open={isCancelOpen} onOpenChange={(e) => setIsCancelOpen(e.open)} role="alertdialog">
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header><Dialog.Title>Cancel Request</Dialog.Title></Dialog.Header>
            <Dialog.Body>Are you sure you want to cancel this request? This cannot be undone.</Dialog.Body>
            <Dialog.Footer>
              <Button variant="outline" onClick={() => setIsCancelOpen(false)} disabled={deleteMutation.isPending}>No, keep it</Button>
              <Button colorPalette="red" onClick={handleCancelRequest} loading={deleteMutation.isPending} ml={3}>Yes, cancel it</Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Box>
  )
}