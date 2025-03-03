import { useEffect, useState } from 'react'
import './styles/Profile.scss'
import defaultIcon from '../../assets/img/defaulticon.jpg'
import { useAuth } from '../../hooks/auth/useAuth'
import PetRegistrationModal from './PetRegistrationModal'
import { useToast } from '../../utils/toast/useToast'
import PetPanel, { Pet } from '../pet/PetPanel'

const Profile = () => {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState<'posts' | 'mypets'>('posts')
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [pets, setPets] = useState<Pet[]>([])
  const [loadingPets, setLoadingPets] = useState<boolean>(true)
  useEffect(() => {
    const fetchPets = async () => {
      if (!user || !user.id) {
        showToast('ユーザー情報が取得できません', 'error')
        setLoadingPets(false)
        return
      }
      try {
        const response = await fetch(`http://localhost:3000/pets/owner/${user.id}`, {
          credentials: 'include',
        })
        if (!response.ok) {
          throw new Error('ペット情報の取得に失敗しました')
        }
        const data = await response.json()
        setPets(data.pets || [])
      } catch (err) {
        console.error('ペット取得エラー:', err)
        showToast('ペット情報の取得に失敗しました。', 'error')
      } finally {
        setLoadingPets(false)
      }
    }

    fetchPets()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loadingPets) {
    return <p>読み込み中</p>
  }

  return (
    <div className="profile-container">
      <h1>プロフィール</h1>
      <div className="profile-header">
        <div className="profile-picture">
          {/* ユーザーアイコンを表示 */}
          <img src={defaultIcon} />
        </div>
        <div className="profile-info">
          <h2>{user?.name}</h2>
          <button className="pet-register-button" onClick={() => setIsModalOpen(true)}>
            ペット登録
          </button>
        </div>
      </div>

      {/* タブ */}
      <div className="profile-tabs">
        <button
          className={`tab ${activeTab === 'posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          投稿
        </button>
        <button
          className={`tab ${activeTab === 'mypets' ? 'active' : ''}`}
          onClick={() => setActiveTab('mypets')}
        >
          マイペット
        </button>
      </div>

      <div className="profile-content">
        {activeTab === 'posts' ? (
          <div className="posts">
            <p></p>
          </div>
        ) : (
          <div className="mypets">
            {pets.length === 0 ? (
              <p>ペットを登録しましょう！</p>
            ) : (
              pets.map((pet) => <PetPanel key={pet.id} pet={pet} />)
            )}
          </div>
        )}
      </div>
      {isModalOpen && <PetRegistrationModal onClose={() => setIsModalOpen(false)} />}
    </div>
  )
}

export default Profile
