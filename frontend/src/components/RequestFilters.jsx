import { HStack, Input, Select, createListCollection, Button } from '@chakra-ui/react'
import { RotateCcw } from 'lucide-react'

const statuses = (counts) =>
  createListCollection({
    items: [
      { label: `Pending (${counts.statuses?.Pending || 0})`, value: 'Pending' },
      { label: `In Progress (${counts.statuses?.['In Progress'] || 0})`, value: 'In Progress' },
      { label: `Resolved (${counts.statuses?.Resolved || 0})`, value: 'Resolved' },
    ],
  })

const priorities = (counts) =>
  createListCollection({
    items: [
      { label: `Low (${counts.priorities?.Low || 0})`, value: 'Low' },
      { label: `Medium (${counts.priorities?.Medium || 0})`, value: 'Medium' },
      { label: `High (${counts.priorities?.High || 0})`, value: 'High' },
    ],
  })

const categories = (counts) =>
  createListCollection({
    items: [
      { label: `Plumbing (${counts.categories?.Plumbing || 0})`, value: 'Plumbing' },
      { label: `Electrical (${counts.categories?.Electrical || 0})`, value: 'Electrical' },
      { label: `AC (${counts.categories?.AC || 0})`, value: 'AC' },
      { label: `Other (${counts.categories?.Other || 0})`, value: 'Other' },
    ],
  })

export default function RequestFilters({ filters, onChange, counts = {} }) {
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

  const statusOptions = statuses(counts)
  const priorityOptions = priorities(counts)
  const categoryOptions = categories(counts)

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
          <Select.ValueText placeholder={label} />
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

      {renderSelect('Status', 'status', statusOptions)}
      {renderSelect('Priority', 'priority', priorityOptions)}
      {renderSelect('Category', 'category', categoryOptions)}

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