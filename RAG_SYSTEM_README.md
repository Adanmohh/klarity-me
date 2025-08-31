# RAG-Powered Personalized Guidance System

## Overview

This system implements an advanced **Agentic Retrieval Augmented Generation (RAG)** service that provides deeply personalized guidance for mental training and subconscious programming. It combines wisdom from three philosophical masters with modern AI to create a powerful coaching experience.

## 🧠 Core Philosophy

The system synthesizes knowledge from:
- **Napoleon Hill** (Think and Grow Rich) - Action, desire, and success principles
- **Joseph Murphy** (Power of Your Subconscious Mind) - Subconscious programming techniques  
- **Al-Ghazali** (Alchemy of Happiness) - Spiritual wisdom and inner development

## 🚀 Key Features

### 1. **Agentic RAG Service**
- Advanced user profiling with personality traits, goals, and habits
- Vector database (ChromaDB) for semantic knowledge retrieval
- Personalized guidance generation based on user patterns
- Learning system with feedback loops for continuous improvement

### 2. **Personalized Guidance Types**
- **Daily Wisdom** - Inspirational guidance tailored to your goals
- **Habit Optimization** - AI-powered suggestions to improve your routines
- **Manifestation Insights** - Advanced techniques for subconscious programming
- **Success Prediction** - Pattern analysis and achievement forecasting
- **Custom Affirmations** - Personalized affirmations based on your profile
- **Pattern Analysis** - Deep behavioral insights and growth opportunities

### 3. **AI Coach Interface**
- Real-time chat with personalized AI coach
- Daily insights dashboard with multiple guidance types
- Interactive guidance type selector
- Actionable steps and follow-up suggestions
- Source attribution from the knowledge base

### 4. **Learning & Adaptation**
- User pattern matching for collaborative insights
- Feedback system for continuous improvement
- Success pattern analysis and prediction
- Personalization scoring for guidance quality

## 🏗️ Architecture

### Backend Components

```
backend/
├── app/
│   ├── services/
│   │   └── rag/
│   │       ├── agentic_rag_service.py     # Main RAG service
│   │       ├── gemini_client.py           # Gemini LLM client
│   │       └── knowledge_ingestion.py     # Knowledge base setup
│   └── api/
│       └── api_v1/
│           └── endpoints/
│               └── identity_rag_agentic.py # RAG API endpoints
└── test_agentic_rag.py                    # Comprehensive test suite
```

### Frontend Components

```
frontend/
├── src/
│   ├── components/
│   │   └── identity/
│   │       ├── AICoach.tsx               # Main AI Coach interface
│   │       └── IdentityEvolutionCenter.tsx # Updated with AI Coach
│   └── services/
│       └── aiGuidanceService.ts          # Frontend service layer
```

## 🛠️ Installation & Setup

### 1. Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export GOOGLE_API_KEY="your_gemini_api_key_here"

# Test the system
python test_agentic_rag.py

# Start the server
uvicorn app.main:app --reload
```

### 2. Frontend Integration

The AI Coach is already integrated into the Identity Evolution Center. Access it via the "AI Coach" tab.

### 3. Required Dependencies

**Backend:**
- `llama-index==0.10.0` - Main RAG framework
- `chromadb==0.4.0` - Vector database
- `google-generativeai==0.3.0` - Gemini API
- `llama-index-llms-gemini` - Gemini LLM integration
- `llama-index-embeddings-gemini` - Gemini embeddings
- `llama-index-vector-stores-chroma` - ChromaDB integration

## 📡 API Endpoints

### Core Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/ai-coach/health` | GET | Service health check |
| `/api/v1/ai-coach/user-profile` | POST | Create/update user profile |
| `/api/v1/ai-coach/guidance` | POST | Get personalized guidance |
| `/api/v1/ai-coach/chat` | POST | Chat with AI coach |
| `/api/v1/ai-coach/daily-insights/{user_id}` | GET | Get daily insights |
| `/api/v1/ai-coach/success-analysis/{user_id}` | GET | Analyze success patterns |

### Example API Usage

```javascript
// Create user profile
await aiGuidanceService.createOrUpdateUserProfile({
  user_id: "user123",
  goals: ["Develop discipline", "Master manifestation"],
  current_habits: [
    { name: "Morning meditation", frequency: "daily", status: "active" }
  ],
  personality_traits: {
    discipline: 0.7,
    creativity: 0.8,
    empathy: 0.6,
    analytical: 0.75,
    intuitive: 0.65
  }
});

// Get personalized guidance
const guidance = await aiGuidanceService.getPersonalizedGuidance(
  "user123", 
  "daily_wisdom"
);

// Chat with AI coach
const response = await aiGuidanceService.chatWithCoach(
  "user123",
  "How can I improve my morning routine?",
  conversationHistory
);
```

## 🧪 Testing

Run the comprehensive test suite:

```bash
python test_agentic_rag.py
```

**Test Coverage:**
- ✅ RAG service initialization
- ✅ Knowledge base ingestion (150+ spiritual/psychological documents)
- ✅ User profiling and pattern matching
- ✅ All 6 guidance types
- ✅ Daily insights generation
- ✅ Success pattern analysis
- ✅ User similarity matching
- ✅ Mock responses (for demo without API key)

## 🎯 User Experience Flow

1. **Profile Creation** - User completes personality assessment and sets goals
2. **Daily Insights** - System provides personalized morning guidance
3. **Interactive Chat** - User can ask specific questions to AI coach
4. **Habit Integration** - Guidance adapts based on completed habits
5. **Success Tracking** - System analyzes patterns and predicts outcomes
6. **Continuous Learning** - Feedback improves personalization over time

## 🔮 Advanced Features

### User Profiling
- Personality trait analysis (discipline, creativity, empathy, analytical, intuitive)
- Goal tracking and manifestation target monitoring
- Habit consistency analysis and optimization suggestions
- Success pattern recognition and prediction algorithms

### Knowledge Base
- 50+ Napoleon Hill principles from "Think and Grow Rich"
- 40+ Joseph Murphy techniques from "The Power of Your Subconscious Mind"
- 35+ Al-Ghazali insights from "The Alchemy of Happiness"
- Modern psychology and neuroscience research
- Habit formation and behavior change science
- Manifestation and visualization techniques

### Personalization Engine
- Vector similarity matching for user patterns
- Collaborative filtering based on similar user journeys
- Success probability predictions (30-day, 90-day forecasts)
- Adaptive learning based on user feedback and outcomes

## 🌟 Example Interactions

### Daily Wisdom
> "Your thoughts are the architects of your destiny, [Username]. Today, with your strong analytical nature and creativity at 0.8, focus on Napoleon Hill's principle: 'Whatever the mind can conceive and believe, it can achieve.' Your morning meditation habit shows 75% consistency - excellent foundation for manifestation work."

### Habit Optimization
> "Based on your discipline score of 0.7 and successful meditation habit, Joseph Murphy's technique suggests adding a gratitude practice before sleep. Your subconscious mind is most receptive during the transition to sleep - program it with appreciation for your business progress."

### Success Prediction
> "Analyzing your patterns: 78% probability of achieving your 30-day business goal. Key success factors: consistency (your strength) and visualization (area for growth). Al-Ghazali reminds us: 'The disciplined soul finds peace regardless of external circumstances.'"

## 📊 Metrics & Analytics

The system tracks:
- Guidance effectiveness (user feedback ratings)
- Personalization scores (how tailored the advice is)
- Success prediction accuracy
- User engagement and retention
- Knowledge source utilization
- Pattern matching quality

## 🔧 Configuration Options

### Environment Variables
- `GOOGLE_API_KEY` - Required for Gemini LLM access
- `CHROMA_PERSIST_DIR` - ChromaDB storage location (default: "./chroma_db")
- `RAG_DEBUG_MODE` - Enable detailed logging for development

### Customization
- Knowledge base can be expanded with additional sources
- Personality assessment questions can be modified
- Guidance types can be extended or specialized
- Learning algorithms can be tuned based on user feedback

## 🚀 Future Enhancements

1. **Multi-modal RAG** - Include images, audio, and video content
2. **Real-time adaptation** - Adjust guidance based on user's current emotional state
3. **Community features** - Connect users with similar goals and patterns
4. **Advanced analytics** - Deeper insights into user transformation journeys
5. **Mobile optimization** - Native mobile app with push notifications
6. **Integration APIs** - Connect with fitness trackers, calendars, and other apps

## 🤝 Contributing

The system is designed to be extensible. Key areas for contribution:
- Additional knowledge sources and philosophical traditions
- Enhanced personalization algorithms
- New guidance types and interaction modes
- Improved user interface components
- Advanced analytics and visualization

## 📄 License & Credits

This implementation combines open-source technologies with proprietary algorithms for personalized guidance generation. The knowledge base draws from public domain spiritual and psychological texts, synthesized through modern AI techniques.

---

**🎯 Ready to Transform Your Mental Training Journey with AI-Powered Personalized Guidance!**