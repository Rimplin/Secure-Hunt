import { useState, useEffect, useContext } from 'react'
import { MessageSquare, Plus, X, Send, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { AuthContext } from '../context/AuthContext_helper'
import '../styles/Forum.css'
import { Link } from 'react-router-dom'
const BASE = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL

function Avatar({ email, size = 32 }) {
  return (
    <div className="forum-avatar" style={{ width: size, height: size, fontSize: size * 0.4 }}>
      {email?.charAt(0).toUpperCase() || '?'}
    </div>
  )
}

export default function Forum() {
  const { user } = useContext(AuthContext)
  const [posts, setPosts] = useState([])
  const [expandedPost, setExpandedPost] = useState(null)
  const [showNewPost, setShowNewPost] = useState(false)
  const [commentInputs, setCommentInputs] = useState({})
  const [submittingComment, setSubmittingComment] = useState({})
  const [newPost, setNewPost] = useState({ title: '', content: '' })
  const [submittingPost, setSubmittingPost] = useState(false)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const res = await fetch(`${BASE}/api/forum`, { credentials: 'include' })
      const data = await res.json()
      setPosts(data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleSubmitPost = async (e) => {
    e.preventDefault()
    setSubmittingPost(true)
    try {
      const res = await fetch(`${BASE}/api/forum`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newPost),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setPosts(prev => [data, ...prev])
      setNewPost({ title: '', content: '' })
      setShowNewPost(false)
    } catch (err) {
      alert('Error: ' + err.message)
    } finally {
      setSubmittingPost(false)
    }
  }

  const handleSubmitComment = async (postId) => {
    const content = commentInputs[postId]?.trim()
    if (!content) return
    setSubmittingComment(prev => ({ ...prev, [postId]: true }))
    try {
      const res = await fetch(`${BASE}/api/forum/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setPosts(prev => prev.map(p =>
        p._id === postId ? { ...p, comments: [...p.comments, data] } : p
      ))
      setCommentInputs(prev => ({ ...prev, [postId]: '' }))
    } catch (err) {
      alert('Error: ' + err.message)
    } finally {
      setSubmittingComment(prev => ({ ...prev, [postId]: false }))
    }
  }

  const handleDeletePost = async (postId) => {
    if (!confirm('Delete this post?')) return
    try {
      await fetch(`${BASE}/api/forum/${postId}`, { method: 'DELETE', credentials: 'include' })
      setPosts(prev => prev.filter(p => p._id !== postId))
      if (expandedPost === postId) setExpandedPost(null)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="forum-container">

      <div className="forum-header">
        <div className="forum-header-left">
          <MessageSquare size={28} className="forum-header-icon" />
          <div>
            <h1>Community Forum</h1>
            <p>Share insights, ask questions, collaborate with researchers</p>
          </div>
        </div>
        <button className="forum-new-btn" onClick={() => setShowNewPost(true)}>
          <Plus size={16} />
          New Post
        </button>
      </div>

      {showNewPost && (
        <div className="forum-modal-overlay" onClick={() => setShowNewPost(false)}>
          <div className="forum-modal" onClick={e => e.stopPropagation()}>
            <div className="forum-modal-header">
              <h2>Create New Post</h2>
              <button className="forum-modal-close" onClick={() => setShowNewPost(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmitPost} className="forum-form">
              <div className="forum-form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={e => setNewPost(p => ({ ...p, title: e.target.value }))}
                  placeholder="What's your post about?"
                  required
                />
              </div>
              <div className="forum-form-group">
                <label>Content *</label>
                <textarea
                  value={newPost.content}
                  onChange={e => setNewPost(p => ({ ...p, content: e.target.value }))}
                  placeholder="Share your knowledge, ask a question, or start a discussion..."
                  rows={6}
                  required
                />
              </div>
              <div className="forum-form-actions">
                <button type="button" className="forum-cancel-btn" onClick={() => setShowNewPost(false)}>
                  Cancel
                </button>
                <button type="submit" className="forum-submit-btn" disabled={submittingPost}>
                  <Send size={15} />
                  Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {posts.length === 0 ? (
        <div className="forum-empty">
          <MessageSquare size={40} />
          <p>No posts yet. Be the first to start a discussion!</p>
        </div>
      ) : (
        <div className="forum-posts">
          {posts.map(post => {
            const isExpanded = expandedPost === post._id
            const isAuthor = user?._id === post.author?._id
            const isAdmin = user?.role === 'administrator'

            return (
              <div key={post._id} className={`forum-post ${isExpanded ? 'expanded' : ''}`}>

        
                <div className="forum-post-header">
                {post.author?._id ? (
               <Link to={`/profile/${post.author._id}`} className="forum-author-link">
               <Avatar email={post.author?.email} />
               </Link>
              ) : (
               <Avatar email={post.author?.email} />
              )}

               <div className="forum-post-meta">
               {post.author?._id ? (
                <Link to={`/profile/${post.author._id}`} className="forum-author-link forum-post-author">
                 {post.author?.email}
               </Link>
               ) : (
               <span className="forum-post-author">{post.author?.email}</span>
               )}

               <span className="forum-post-date">
              {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
               </span>
             </div>
                  {(isAuthor || isAdmin) && (
                    <button className="forum-delete-btn" onClick={() => handleDeletePost(post._id)}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <h3 className="forum-post-title">{post.title}</h3>

                <p className={`forum-post-content ${isExpanded ? 'expanded' : ''}`}>
                  {post.content}
                </p>

                <div className="forum-post-footer">
                  <button
                    className="forum-comments-btn"
                    onClick={() => setExpandedPost(isExpanded ? null : post._id)}
                  >
                    <MessageSquare size={14} />
                    {post.comments?.length || 0} comments
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>

                {isExpanded && (
                  <div className="forum-comments">
                    {post.comments?.length === 0 && (
                      <p className="forum-no-comments">No comments yet. Be the first!</p>
                    )}
                    {post.comments?.map(comment => (
                    <div key={comment._id} className="forum-comment">
                    {comment.author?._id ? (
                    <Link to={`/profile/${comment.author._id}`} className="forum-author-link">
                    <Avatar email={comment.author?.email} size={26} />
                   </Link>
                    ) : (
                  <Avatar email={comment.author?.email} size={26} />
                  )}

                  <div className="forum-comment-body">
                  <div className="forum-comment-meta">
                   {comment.author?._id ? (
                  <Link to={`/profile/${comment.author._id}`} className="forum-author-link forum-comment-author">
                   {comment.author?.email}
                 </Link>
                  ) : (
                  <span className="forum-comment-author">{comment.author?.email}</span>
                  )}

                  <span className="forum-comment-date">
                 {new Date(comment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                   </span>
                   </div>
                    <p className="forum-comment-content">{comment.content}</p>
                   </div>
                </div>
                 ))}

                  

                    <div className="forum-comment-input">
                      <Avatar email={user?.email} size={26} />
                      <div className="forum-comment-input-wrap">
                        <textarea
                          placeholder="Write a comment..."
                          value={commentInputs[post._id] || ''}
                          onChange={e => setCommentInputs(prev => ({ ...prev, [post._id]: e.target.value }))}
                          rows={2}
                          onKeyDown={e => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault()
                              handleSubmitComment(post._id)
                            }
                          }}
                        />
                        <button
                          className="forum-comment-send"
                          onClick={() => handleSubmitComment(post._id)}
                          disabled={submittingComment[post._id]}
                        >
                          <Send size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
