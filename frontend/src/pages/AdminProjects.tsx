import React from 'react'
import Navbar from '../components/navbar'
import Adminprojectslist from '../components/adminprojectslist'

export default function AdminProjects() {
    return (
      <div>
      <Navbar adminUser={true} />
      <Adminprojectslist />
      </div>
    )
}
