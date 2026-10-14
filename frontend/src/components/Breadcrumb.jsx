import { Breadcrumb as ChakraBreadcrumb } from '@chakra-ui/react'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import React from 'react'

// console.log('ChakraBreadcrumb:', ChakraBreadcrumb)
// console.log('Root:', ChakraBreadcrumb?.Root)
// console.log('List:', ChakraBreadcrumb?.List)
// console.log('Item:', ChakraBreadcrumb?.Item)
// console.log('Link:', ChakraBreadcrumb?.Link)
// console.log('Separator:', ChakraBreadcrumb?.Separator)
// console.log('CurrentLink:', ChakraBreadcrumb?.CurrentLink)

const routeLabels = {
    dashboard: 'Dashboard',
    requests: 'Requests',
    new: 'New Request',
}

export default function Breadcrumbs() {
    const { pathname } = useLocation()
    const segments = pathname.split('/').filter(Boolean)

    if (!segments.length) return null

    const items = segments.map((segment, index) => ({
        href: '/' + segments.slice(0, index + 1).join('/'),
        label:
            routeLabels[segment] ||
            (segments[index - 1] === 'requests'
                ? `Request ${segment}`
                : segment.charAt(0).toUpperCase() + segment.slice(1)),
        isLast: index === segments.length - 1,
    }))

    return (
        <ChakraBreadcrumb.Root>
            <ChakraBreadcrumb.List>
                {items.map((item, index) => (
                    <React.Fragment key={item.href}>
                        {index > 0 && <ChakraBreadcrumb.Separator />}

                        <ChakraBreadcrumb.Item>
                            {item.isLast ? (
                                <ChakraBreadcrumb.CurrentLink>
                                    {item.label}
                                </ChakraBreadcrumb.CurrentLink>
                            ) : (
                                <ChakraBreadcrumb.Link asChild>
                                    <RouterLink to={item.href}>
                                        {item.label}
                                    </RouterLink>
                                </ChakraBreadcrumb.Link>
                            )}
                        </ChakraBreadcrumb.Item>
                    </React.Fragment>
                ))}
            </ChakraBreadcrumb.List>
        </ChakraBreadcrumb.Root>
    )
}