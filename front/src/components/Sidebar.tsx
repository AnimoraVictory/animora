import { useNavigate } from 'react-router-dom'
import { LogOut, User, List, Home } from 'lucide-react'
import './styles/Sidebar.scss'
import { useAuth } from '../hooks/auth/useAuth'
import { OpeningTabKey } from '../pages/Home'

const OpeningTabList: { key: OpeningTabKey; label: string; icon: JSX.Element }[] = [
  { key: 'posts', label: '投稿一覧', icon: <Home size={20} /> },
]

interface SidebarProps {
  isOpen: boolean
  toggleSidebar: () => void
  setOpeningTab: (tab: OpeningTabKey) => void
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar, setOpeningTab }) => {
  const navigate = useNavigate()
  const { signOut } = useAuth()

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <List size={20} className="toggle-icon" onClick={toggleSidebar} />
      <ul>
        {OpeningTabList.map((tab) => (
          <li key={tab.key} onClick={() => setOpeningTab(tab.key)}>
            {tab.icon} <span>{tab.label}</span>
          </li>
        ))}
      </ul>

      <div className="sidebar-footer">
        <div
          className="logout-button"
          onClick={async () => {
            await signOut()
            navigate('/')
          }}
        >
          <LogOut size={20} />
          <span>ログアウト</span>
        </div>
        <div className="profile-icon" onClick={() => setOpeningTab('profile')}>
          <User size={20} />
          <span>プロフィール</span>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
