import './App.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import AdminProjects from './pages/AdminProjects'
import UserProjects from './pages/UserProjects'
import AdminUsers from './pages/AdminUsers'
import AdminTasks from './pages/AdminTasks'
import UserTasks from './pages/UserTasks'
import RequireAuth from './utils/requireauth'

function App() {

	return (
		<>
			<Router>
				<Routes>
					<Route path="/login" element={<Login />} />
					<Route element={<RequireAuth allowedRoles={['admin']} />}>
						<Route path="/" element={<AdminUsers />} />
						<Route path="/adminprojects" element={<AdminProjects />} />
						<Route path="/adminprojects/:id" element={<AdminTasks />} />
					</Route>

					<Route element={<RequireAuth allowedRoles={['user']} />}>
						<Route path="/userprojects" element={<UserProjects />} />
						<Route path="/userprojects/:id" element={<UserTasks />} />
					</Route>
				</Routes>
			</Router>
		</>
	)
}

export default App
