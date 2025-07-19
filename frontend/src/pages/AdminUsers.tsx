import React from 'react'
import Navbar from '../components/navbar'
import Adminuserslist from '../components/adminuserslist'

export default function AdminUsers() {
  return (
    <div>
      <Navbar adminUser={true} />
      <Adminuserslist />
    </div>
  )
}
