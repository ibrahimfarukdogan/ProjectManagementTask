import Navbar from '../components/navbar'
import Userprojectlist from '../components/userprojectlist'

export default function UserProjects() {
  return (
    <div>
      <Navbar adminUser={false} />
      <Userprojectlist />
    </div>
  )
}
