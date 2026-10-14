import { apiClient } from './client'

export async function fetchRequests(filters = {}) {
  const params = {}
  if (filters.status) params.status = filters.status
  if (filters.priority) params.priority = filters.priority
  if (filters.category) params.category = filters.category
  if (filters.search) params.search = filters.search

  const { data } = await apiClient.get('/requests', { params })
  // console.log('FULL API RESPONSE:', JSON.stringify(data,null, 2))
  return data
}

export async function fetchRequestById(id) {
  const { data } = await apiClient.get(`/requests/${id}`)
  return data
}

export async function createRequest(payload) {
  const { data } = await apiClient.post('/requests', payload)
  return data
}

export async function updateRequest(id, payload) {
  const { data } = await apiClient.put(`/requests/${id}`, payload)
  return data
}

export async function deleteRequest(id) {
  const { data } = await apiClient.delete(`/requests/${id}`)
  return data
}

export async function updateStatus(id, status) {
  const { data } = await apiClient.patch(`/requests/${id}/status`, { status })
  return data
}

export async function updatePriority(id, priority) {
  const { data } = await apiClient.patch(`/requests/${id}/priority`, { priority })
  return data
}

export async function assignToSelf(id) {
  const { data } = await apiClient.patch(`/requests/${id}/assign`)
  return data
}
