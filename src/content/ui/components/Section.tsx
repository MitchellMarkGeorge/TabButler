import React from 'react'

interface Props {
  name: string;
  children: React.ReactNode[]
}

export default function Section(props: Props) {
  return (
    <div className='section'>
      <div className='section-name text-sm'>{props.name}</div>
      <div className='section-body'>
       {props.children} 
      </div>
    </div>
  )
}
