import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchRequests, fetchRequestById, createRequest, updateRequest,
  deleteRequest, updateStatus, updatePriority, assignToSelf,
} from '../api/requests'

export function useRequestsList(filters = {}) {
  return useQuery({
    queryKey: ['requests', filters],
    queryFn: () => fetchRequests(filters),
  })
}

export function useRequestDetail(id) {
  return useQuery({
    queryKey: ['requests', id],
    queryFn: () => fetchRequestById(id),
    enabled: !!id,
  })
}

export function useCreateRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['requests'] }),
  })
}

export function useUpdateRequest(id) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload) => updateRequest(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['requests'] }),
  })
}

export function useDeleteRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => deleteRequest(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['requests'] }),
  })
}

export function useUpdateStatus(id) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (status) => updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['requests'] }),
  })
}

export function useUpdatePriority(id) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (priority) => updatePriority(id, priority),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['requests'] }),
  })
}

export function useAssignToSelf(id) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => assignToSelf(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['requests'] }),
  })
}
