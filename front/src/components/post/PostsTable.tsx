import { useEffect, useState } from 'react'
import './styles/PostsTable.scss'
import PostPanel from './PostPanel'

type Post = {
  id: string
  title: string
  content: string
  createdAt: string
}

const PostsTable = () => {
  const [posts, setPosts] = useState<Post[]>([])

  useEffect(() => {
    fetch('http://localhost:3000/posts')
      .then((res) => res.json())
      .then((data) => setPosts(data.posts))
      .catch((err) => console.error('投稿の取得に失敗しました:', err))
  }, [])

  return (
    <div className="posts-table">
      <h2>投稿一覧</h2>
      {posts.length > 0 && (
        <div className="posts-grid">
          {posts.map((post) => (
            <PostPanel key={post.id} {...post} />
          ))}
        </div>
      )}
    </div>
  )
}

export default PostsTable
