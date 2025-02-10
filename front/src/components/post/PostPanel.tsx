import "./styles/PostPanel.scss"

type PostProps = {
  id: string
  title: string
  content: string
  createdAt: string
}

const PostPanel = ({ title, content, createdAt }: PostProps) => {
  return (
    <div className="post-panel">
      <h3 className="post-title">{title}</h3>
      <p className="post-content">{content}</p>
      <div className="post-footer">
        <span className="post-date">{new Date(createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  )
}

export default PostPanel
