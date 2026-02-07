import { Sparkles, TrendingUp, Target, Zap } from 'lucide-react'
import '../styles/AIRecommendations.css'

function AIRecommendations() {
  const recommendations = [
    {
      id: 1,
      title: "High-Value Bounties for You",
      description: "Based on your skills and history",
      icon: TrendingUp
    },
    {
      id: 2,
      title: "Personalized Targets",
      description: "Projects matching your expertise",
      icon: Target
    },
    {
      id: 3,
      title: "Trending Vulnerabilities",
      description: "Hot security research areas",
      icon: Zap
    }
  ]

  return (
    <div className="ai-container">
      <div className="ai-header">
        <Sparkles size={40} className="ai-icon" />
        <h2>AI-Powered Recommendations</h2>
        <p>Discover opportunities tailored to you</p>
      </div>

      <div className="ai-content">
        <div className="recommendations-grid">
          {recommendations.map((rec) => {
            const IconComponent = rec.icon
            return (
              <div key={rec.id} className="recommendation-card">
                <IconComponent size={32} className="card-icon" />
                <h3>{rec.title}</h3>
                <p>{rec.description}</p>
              </div>
            )
          })}
        </div>

        <div className="placeholder-section">
          <div className="placeholder-box">
            <p>Your personalized recommendations will appear here</p>
            <p className="small-text">Sign in to get started</p>
          </div>
        </div>

        <div className="feature-notice">
          <p>🤖 AI recommendation engine launching in upcoming Sprints</p>
        </div>
      </div>
    </div>
  )
}

export default AIRecommendations
