import './App.css'
import {Route, Routes,BrowserRouter} from 'react-router-dom'

import ProtectedRoute from './components/ProtectedRoute'
import Home from './components/Home'
import SkillRoadMap from './components/SkillRoadMap'
import Profile from './components/Profile'
import Login from './components/Login'
import Register from './components/Register'

const App = () => {

  return (
    <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/roadmap/:id" element={<SkillRoadMap />} />
      </Route>

    </Routes>
    </BrowserRouter>
  )
}

export default App
