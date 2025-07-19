import React from 'react'
import Navbar from '../components/navbar'
import Admintaskslist from '../components/admintaskslist'

export default function AdminTasks() {
  return (
    <div>
            <Navbar adminUser={true} />
            <Admintaskslist />
    </div>
  )
}
