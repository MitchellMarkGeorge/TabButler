import { MagnifyingGlassIcon } from '@heroicons/react/24/solid'
import React from 'react'

interface Props {
    searchQuery: string
}

export default function NoResults(props: Props) {
  return (
    <div className='empty-container'>
        {/* <MagnifyingGlassIcon className='empty-container-logo'/> */}
        <span className="loader"/>
        <div className='text-base'>No results found matching "{props.searchQuery}"</div>
    </div>
  )
}
