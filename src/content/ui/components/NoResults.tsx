import React from 'react'
import { BsSearch } from 'react-icons/bs'

interface Props {
    searchQuery: string
}

export default function NoResults(props: Props) {
  return (
    <div className='empty-container'>
        <BsSearch className='empty-container-logo'/>
        <div className='text-base'>No results found matching "{props.searchQuery}"</div>
    </div>
  )
}
