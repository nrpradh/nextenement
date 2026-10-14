import { HStack, Input, Select, createListCollection, Button } from '@chakra-ui/react'
import { RotateCcw } from 'lucide-react'

const statuses = createListCollection({
  items: [
    { label: 'Pending', value: 'Pending' },
    { label: 'In Progress', value: 'In Progress' },
    { label: 'Resolved', value: 'Resolved' },
  ],
})

const priorities = createListCollection({
  items: [
    { label: 'Low', value: 'Low' },
    { label: 'Medium', value: 'Medium' },
    { label: 'High', value: 'High' },
  ],
})

const categories = createListCollection({
  items: [
    { label: 'Plumbing', value: 'Plumbing' },
    { label: 'Electrical', value: 'Electrical' },
    { label: 'AC', value: 'AC' },
    { label: 'Other', value: 'Other' },
  ],
})

export default function RequestFilters({ filters, onChange }) {
  const set = (key) => (value) => {
    onChange({ ...filters, [key]: value })
  }

  const resetFilters = () => {
    onChange({
      search: '',
      status: '',
      priority: '',
      category: '',
    })
  }

  const hasFilters = Boolean(
    filters.search ||
    filters.status ||
    filters.priority ||
    filters.category
  )

  const renderSelect = (label, key, collection) => (
    <Select.Root
      collection={collection}
      value={filters[key] ? [filters[key]] : []}
      onValueChange={(details) => set(key)(details.value[0] || '')}
      width="180px"
      
    >
      <Select.HiddenSelect />
      <Select.Control >
        <Select.Trigger bg="white" className='cursor-pointer'>
          <Select.ValueText placeholder={label}  />
        </Select.Trigger>
        <Select.IndicatorGroup>
          <Select.Indicator />
        </Select.IndicatorGroup>
      </Select.Control>
      <Select.Positioner>
        <Select.Content >
          {collection.items.map((item) => (
            <Select.Item key={item.value} item={item} className='cursor-pointer'>
              {item.label}
              <Select.ItemIndicator />
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Positioner>
    </Select.Root>
  )

  return (
    <HStack gap={3} mb={4} flexWrap="wrap" align="center">
      <Input
        placeholder="Search by unit or title"
        value={filters.search || ''}
        onChange={(e) => set('search')(e.target.value)}
        maxW="260px"
        bg="white"
      />

      {renderSelect('Status', 'status', statuses)}
      {renderSelect('Priority', 'priority', priorities)}
      {renderSelect('Category', 'category', categories)}

      <Button
        variant="ghost"
        colorPalette="gray"
        size="md"
        onClick={resetFilters}
        disabled={!hasFilters}
      >
        <RotateCcw size={16} />
        Reset filters
      </Button>
    </HStack>
  )
}