
import { Link } from "react-router-dom"
import "./styles/Opening.scss"

const Opening = () => {
  return (
    <div className="opening-container">
      <div className="left-section">
        LOGO
      </div>
      <div className="right-section">
      <div className='catchphrase'>ペットとの毎日を、もっと楽しく。</div>
      {/* animaliaは暫定のアプリ名、もう少しこだわりたい */}
        <h1>Animaliaへようこそ</h1>

        <Link to="/signin">
          <button className="signin-btn">ログイン</button>
        </Link>

        <p >まだアカウントをお持ちでない方は</p>

        <Link to="/signup">
          <button className="signup-btn">アカウントを作成</button>
        </Link>
      </div>
    </div>
  )
}

export default Opening
