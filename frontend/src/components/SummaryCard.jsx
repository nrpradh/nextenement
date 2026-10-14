import { Box, Stat } from '@chakra-ui/react'
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
      <Stat.Root>
        <Stat.Label color="gray.500">{label}</Stat.Label>
        <Stat.ValueText fontSize="3xl">{value}</Stat.ValueText>
      </Stat.Root>
    </Box>
  )
}