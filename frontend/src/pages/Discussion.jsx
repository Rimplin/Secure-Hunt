import { MessageSquare, Users, Heart, MessageCircle } from 'lucide-react'
import '../styles/Discussion.css'

function Discussion() {
  const discussions = [
  ]

  return (
    <div className="discussion-container">
      <div className="discussion-header">
        <MessageSquare size={40} className="discussion-icon" />
        <h2>Community Discussion Forum</h2>
        <p>Share insights, ask questions, and collaborate with security hunters</p>
      </div>

      <div className="discussion-content">
        <div className="discussion-controls">
          <input 
            type="text" 
            placeholder="Search discussions..." 
            className="search-box"
          />
          <button className="new-thread-btn">
            <MessageCircle size={18} />
            Start Discussion
          </button>
        </div>

        <div className="discussions-list">
          {discussions.map((discussion) => (
            <div key={discussion.id} className="discussion-thread">
              <div className="thread-content">
                <div className="thread-header">
                  <h3>{discussion.title}</h3>
                  <span className="category-badge">{discussion.category}</span>
                </div>
                <p className="thread-meta">by <strong>{discussion.author}</strong></p>
              </div>
              
              <div className="thread-stats">
                <div className="stat">
                  <MessageSquare size={16} />
                  <span>{discussion.replies}</span>
                </div>
                <div className="stat">
                  <Heart size={16} />
                  <span>{discussion.likes}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="feature-notice">
          <p>💬 Full discussion forum with real-time updates launching in upcoming Sprints </p>
        </div>
      </div>
    </div>
  )
}

export default Discussion
