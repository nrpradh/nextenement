import { Box, Heading } from '@chakra-ui/react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = { Pending: '#ECC94B', 'In Progress': '#4299E1', Resolved: '#48BB78' }

export default function StatusChart({ requests }) {
  const counts = { Pending: 0, 'In Progress': 0, Resolved: 0 }
  requests.forEach((r) => { counts[r.status] = (counts[r.status] || 0) + 1 })
  const data = Object.entries(counts).map(([name, value]) => ({ name, value }))

  return (
    <Box bg="white" borderRadius="lg" borderWidth="1px" p={4} height="280px">
      <Heading size="sm" mb={2}>Requests by Status</Heading>
      <ResponsiveContainer width="100%" height="90%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" outerRadius={80} label>
            {data.map((entry) => (
              <Cell key={entry.name} fill={COLORS[entry.name] || '#CBD5E0'} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  )
}
