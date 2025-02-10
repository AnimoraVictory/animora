import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Opening from './pages/Opening'
import SignUp from './pages/SignUp'
import VerifyEmail from './pages/VerifyEmail'
import SignIn from './pages/SignIn'
import Home from './pages/Home'

const App = () => {
  return (
    <Router>
      <Routes>
          <Route path="/" element={<Opening />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/home" element={<Home />} />
      </Routes>
    </Router>
  )
}

export default App
