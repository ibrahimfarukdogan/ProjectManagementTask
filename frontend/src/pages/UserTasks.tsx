import React from 'react'
import Usertasklist from '../components/usertasklist'
import Navbar from '../components/navbar'

export default function UserTasks() {
  return (
    <div>
      <Navbar adminUser={false} />
      <Usertasklist />
    </div>
  )
}
