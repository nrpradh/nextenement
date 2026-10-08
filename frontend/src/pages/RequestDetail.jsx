import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Box, Heading, Text, VStack, HStack, Button, Spinner, Flex, Select,
  FormControl, FormLabel, Input, Textarea, FormErrorMessage, Alert, AlertIcon,
  useDisclosure, AlertDialog, AlertDialogOverlay, AlertDialogContent,
  AlertDialogHeader, AlertDialogBody, AlertDialogFooter,
} from '@chakra-ui/react'
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
  const { isOpen, onOpen, onClose } = useDisclosure()
  const cancelRef = useRef(null)

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
    try {
      await deleteMutation.mutateAsync(req.id)
      navigate('/requests')
    } catch (err) {
      setApiError(err.response?.data?.error || 'Failed to cancel request')
    }
  }

  const handleStatusChange = async (e) => {
    try {
      await statusMutation.mutateAsync(e.target.value)
    } catch (err) {
      setApiError(err.response?.data?.error || 'Failed to update status')
    }
  }

  const handlePriorityChange = async (e) => {
    try {
      await priorityMutation.mutateAsync(e.target.value)
    } catch (err) {
      setApiError(err.response?.data?.error || 'Failed to update priority')
    }
  }

  const handleAssign = async () => {
    try {
      await assignMutation.mutateAsync()
    } catch (err) {
      setApiError(err.response?.data?.error || 'Failed to assign request')
    }
  }

  const handleResolve = async () => {
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
        <Alert status="error" mb={4} borderRadius="md">
          <AlertIcon />
          {apiError}
        </Alert>
      )}

      <Box bg="white" p={6} borderRadius="lg" borderWidth="1px" mb={6}>
        {!isEditing ? (
          <VStack align="stretch" spacing={3}>
            <HStack justify="space-between">
              <Heading size="md">{req.title}</Heading>
              <HStack>
                <StatusBadge status={req.status} />
                <PriorityBadge priority={req.priority} />
              </HStack>
            </HStack>
            <Text color="gray.700">{req.description}</Text>
            <HStack spacing={8} pt={2} color="gray.600" fontSize="sm" flexWrap="wrap">
              <Text><b>Category:</b> {req.category}</Text>
              <Text><b>Unit:</b> {req.unit_number}</Text>
              <Text><b>Created:</b> {new Date(req.created_at).toLocaleString()}</Text>
            </HStack>
            <HStack spacing={8} color="gray.600" fontSize="sm" flexWrap="wrap">
              <Text><b>Submitted by:</b> user #{req.submitted_by}</Text>
              <Text><b>Assigned manager:</b> {req.assigned_to ? `user #${req.assigned_to}` : 'Unassigned'}</Text>
            </HStack>
          </VStack>
        ) : (
          <form onSubmit={handleSubmit(onSaveEdit)}>
            <VStack spacing={4} align="stretch">
              <FormControl isInvalid={!!errors.title}>
                <FormLabel>Title</FormLabel>
                <Input {...register('title')} />
                <FormErrorMessage>{errors.title?.message}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!errors.description}>
                <FormLabel>Description</FormLabel>
                <Textarea rows={4} {...register('description')} />
                <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!errors.category}>
                <FormLabel>Category</FormLabel>
                <Select {...register('category')}>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Electrical">Electrical</option>
                  <option value="AC">AC</option>
                  <option value="Other">Other</option>
                </Select>
              </FormControl>
              <FormControl isInvalid={!!errors.priority}>
                <FormLabel>Priority</FormLabel>
                <Select {...register('priority')}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </Select>
              </FormControl>
              <FormControl isInvalid={!!errors.unit_number}>
                <FormLabel>Unit number</FormLabel>
                <Input {...register('unit_number')} />
                <FormErrorMessage>{errors.unit_number?.message}</FormErrorMessage>
              </FormControl>
              <HStack>
                <Button type="submit" colorScheme="blue" isLoading={updateMutation.isPending}>
                  Save
                </Button>
                <Button variant="outline" onClick={() => { setIsEditing(false); reset() }}>
                  Cancel
                </Button>
              </HStack>
            </VStack>
          </form>
        )}
      </Box>

      {!isEditing && canTenantEdit && (
        <HStack mb={6}>
          <Button colorScheme="blue" onClick={() => setIsEditing(true)}>Edit</Button>
          <Button colorScheme="red" variant="outline" onClick={onOpen}>Cancel Request</Button>
        </HStack>
      )}

      {isManager && (
        <Box bg="white" p={6} borderRadius="lg" borderWidth="1px">
          <Heading size="sm" mb={4}>Manager Actions</Heading>
          <VStack align="stretch" spacing={4} maxW="300px">
            <FormControl>
              <FormLabel fontSize="sm">Status</FormLabel>
              <Select value={req.status} onChange={handleStatusChange}>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm">Priority</FormLabel>
              <Select value={req.priority} onChange={handlePriorityChange}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </Select>
            </FormControl>
            <HStack>
              <Button
                onClick={handleAssign}
                isDisabled={req.assigned_to === user.id}
                isLoading={assignMutation.isPending}
              >
                {req.assigned_to === user.id ? 'Assigned to you' : 'Assign to me'}
              </Button>
              <Button
                colorScheme="green"
                onClick={handleResolve}
                isDisabled={req.status === 'Resolved'}
                isLoading={statusMutation.isPending}
              >
                Mark Resolved
              </Button>
            </HStack>
          </VStack>
        </Box>
      )}

      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Cancel Request</AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to cancel this request? This cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button onClick={onClose}>No, keep it</Button>
              <Button colorScheme="red" onClick={handleCancelRequest} ml={3} isLoading={deleteMutation.isPending}>
                Yes, cancel it
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  )
}
