import { useState } from 'react'
import PostsTable from '../components/post/PostsTable'
import Sidebar from '../components/Sidebar'
import './styles/Home.scss'
import { List } from 'lucide-react'
import Profile from '../components/profile/Profile'
export type OpeningTabKey = 'posts' | 'profile'

const Home = () => {
  const [isOpenSidebar, setIsOpenSidebar] = useState(true)
  const [openingTab, setOpeningTab] = useState<OpeningTabKey>('posts')

  return (
    <div className="home-container">
      {!isOpenSidebar && (
        <List size={20} className="toggle-icon" onClick={() => setIsOpenSidebar(!isOpenSidebar)} />
      )}
      <div className={`content ${isOpenSidebar ? 'open' : 'closed'}`}>
        <Sidebar
          isOpen={isOpenSidebar}
          toggleSidebar={() => setIsOpenSidebar(!isOpenSidebar)}
          setOpeningTab={setOpeningTab}
        />
        <div className="tab-container">
          {openingTab === 'posts' && <PostsTable />}
          {openingTab === 'profile' && <Profile />}
        </div>
      </div>
    </div>
  )
}

export default Home
