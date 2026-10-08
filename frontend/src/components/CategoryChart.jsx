import { Box, Heading } from '@chakra-ui/react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function CategoryChart({ requests }) {
  const counts = { Plumbing: 0, Electrical: 0, AC: 0, Other: 0 }
  requests.forEach((r) => { counts[r.category] = (counts[r.category] || 0) + 1 })
  const data = Object.entries(counts).map(([name, value]) => ({ name, value }))

  return (
    <Box bg="white" borderRadius="lg" borderWidth="1px" p={4} height="280px">
      <Heading size="sm" mb={2}>Requests by Category</Heading>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" fontSize={12} />
          <YAxis allowDecimals={false} fontSize={12} />
          <Tooltip />
          <Bar dataKey="value" fill="#4C51BF" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  )
}
