import { useState } from "react";
import "./styles/Profile.scss";
import defaultIcon from "../../assets/img/defaulticon.jpg"
import { useAuth } from "../../hooks/auth/useAuth";
import PetRegistrationModal from "./PetRegistrationModal";

const Profile = () => {
  const {user} = useAuth()
  const [activeTab, setActiveTab] = useState<"posts" | "mypets">("posts");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

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
          className={`tab ${activeTab === "posts" ? "active" : ""}`} 
          onClick={() => setActiveTab("posts")}
        >
          投稿
        </button>
        <button 
          className={`tab ${activeTab === "mypets" ? "active" : ""}`} 
          onClick={() => setActiveTab("mypets")}
        >
          マイペット
        </button>
      </div>

      {/* コンテンツ */}
      <div className="profile-content">
        {activeTab === "posts" ? (
          <div className="posts">
            <p></p>
          </div>
        ) : (
          <div className="mypets">
            <p></p>
          </div>
        )}
      </div>
      {isModalOpen && <PetRegistrationModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};

export default Profile;
