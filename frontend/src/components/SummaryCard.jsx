import { Box, Stat, StatLabel, StatNumber } from '@chakra-ui/react'

export default function SummaryCard({ label, value, accentColor = 'gray.500' }) {
  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      p={4}
      bg="white"
      boxShadow="sm"
      borderTopWidth="4px"
      borderTopColor={accentColor}
    >
      <Stat>
        <StatLabel color="gray.500">{label}</StatLabel>
        <StatNumber fontSize="3xl">{value}</StatNumber>
      </Stat>
    </Box>
  )
}
