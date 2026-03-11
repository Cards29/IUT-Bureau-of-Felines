# IUT Bureau of Felines

A full‑stack social platform built around cats, community, and campus vibes. Users can authenticate with Google, share posts, browse cat profiles, and interact through votes and comments — all wrapped in a responsive, modern UI.

---

## ✨ Overview

IUT Bureau of Felines is designed as a playful but production‑style web application demonstrating authentication, infinite feeds, media uploads, and user interaction patterns commonly found in social platforms.

The project is split into a frontend client and backend server with environment‑based configuration.

---

## 🚀 Features

### Authentication

- Google OAuth login
- Secure session cookie handling
- Persistent login sessions

### Feeds

- Global newsfeed
- Cat‑focused feed
- User feed
- “My posts” feed
- Infinite scrolling

### Posting System

- Floating compose button
- Gmail‑style modal composer
- Rich text + media support
- Post detail view

### Social Interaction

- Comment threads
- Upvote/downvote system
- Real‑time UI feedback

### Cats Module

- Cat directory
- Search cats
- Create cat profiles
- Photo upload support

### Users Module

- User directory
- Profile pages
- Search functionality

### UI/UX

- Dark / Light mode toggle
- Responsive layout
- Smooth animations

---

## 🧱 Tech Stack

Frontend:

- Modern JavaScript framework
- Component‑based architecture
- API‑driven data fetching

Backend:

- REST API server
- OAuth integration
- Session management

Storage:

- Persistent database layer
- Media handling

---

## 📁 Project Structure

```
IUT-Bureau-of-Felines/
├── client/                              # Frontend React application
│   ├── src/
│   │   ├── App.jsx                     # Main application component
│   │   ├── main.jsx                    # Application entry point
│   │   ├── styles.css                  # Global styles and theme variables
│   │   ├── components/                 # Reusable UI components
│   │   │   ├── AuthModal.jsx           # Login/registration modal
│   │   │   ├── Comment.jsx             # Individual comment display
│   │   │   ├── CommentsModal.jsx       # Comments thread modal
│   │   │   ├── ConfirmModal.jsx        # Confirmation dialog component
│   │   │   ├── Fab.jsx                 # Floating action button
│   │   │   ├── InfiniteSentinel.jsx    # Infinite scroll trigger
│   │   │   ├── Modal.jsx               # Generic modal wrapper
│   │   │   ├── PostCard.jsx            # Post display component
│   │   │   ├── Sidebar.jsx             # Navigation sidebar
│   │   │   ├── Topbar.jsx              # Top navigation bar
│   │   │   ├── VoteButtons.jsx         # Upvote/downvote controls
│   │   │   └── VoteModal.jsx           # Vote interaction modal
│   │   ├── hooks/
│   │   │   └── useInfiniteFeed.js      # Custom hook for infinite scrolling
│   │   ├── pages/                      # Page-level components
│   │   │   ├── Admin.jsx               # Admin dashboard
│   │   │   ├── CatProfile.jsx          # Individual cat profile page
│   │   │   ├── Cats.jsx                # Cat directory
│   │   │   ├── MyCats.jsx              # User's own cats
│   │   │   ├── MyProfile.jsx           # Logged-in user's profile
│   │   │   ├── Newsfeed.jsx            # Main social feed
│   │   │   ├── PostDetail.jsx          # Detailed post view
│   │   │   ├── UserProfile.jsx         # Other users' profiles
│   │   │   ├── Users.jsx               # User directory
│   │   │   └── _parts/                 # Page component sub-parts
│   │   │       ├── CreateCatForm.jsx   # Cat creation form
│   │   │       └── CreatePostForm.jsx  # Post creation form
│   │   ├── state/                      # State management
│   │   │   ├── auth.jsx                # Authentication context
│   │   │   └── theme.jsx               # Theme context for dark/light mode
│   │   └── utils/
│   │       └── api.js                  # API client utility functions
│   ├── index.html                      # HTML entry point
│   ├── package.json                    # Frontend dependencies
│   └── vite.config.js                  # Vite build configuration
│
├── server/                              # Backend Express application
│   ├── src/
│   │   ├── server.js                   # Express app initialization
│   │   ├── middleware/                 # Custom middleware functions
│   │   │   ├── auth.js                 # Authentication middleware
│   │   │   └── errors.js               # Error handling middleware
│   │   ├── models/                     # Mongoose data models
│   │   │   ├── User.js                 # User schema and methods
│   │   │   ├── Post.js                 # Post schema and methods
│   │   │   ├── Comment.js              # Comment schema and methods
│   │   │   ├── Cat.js                  # Cat schema and methods
│   │   │   └── Vote.js                 # Vote/rating schema
│   │   ├── routes/                     # REST API route handlers
│   │   │   ├── auth.routes.js          # Authentication endpoints
│   │   │   ├── user.routes.js          # User management endpoints
│   │   │   ├── cat.routes.js           # Cat CRUD endpoints
│   │   │   └── post.routes.js          # Post and comment endpoints
│   │   ├── utils/                      # Utility functions
│   │   │   ├── cloudinary.js           # Image upload configuration
│   │   │   ├── connectDb.js            # MongoDB connection
│   │   │   ├── passport.js             # OAuth configuration
│   │   │   ├── session.js              # Session middleware setup
│   │   │   └── upload.js               # File upload handling
│   │   └── validation/
│   │       └── schemas.js              # Input validation schemas
│   ├── package.json                    # Backend dependencies
│   ├── .env.example                    # Example environment variables
│   └── src/ (build output)             # Compiled code
│
├── package.json                        # Root package configuration
├── README.md                           # This file
└── .gitignore                          # Git ignore rules
```

### Frontend Structure Details

**Components/**: Reusable UI building blocks
- Modal components for user interactions
- Card components for content display
- Navigation components (Sidebar, Topbar)
- Form components (AuthModal, etc.)

**Pages/**: Full page components with routing
- Feed pages (Newsfeed, PostDetail)
- User pages (UserProfile, Users)
- Cat pages (Cats, CatProfile)
- Admin and user management pages

**Hooks/**: Custom React hooks
- `useInfiniteFeed`: Manages pagination and infinite scroll logic

**State/**: Global state management with Context API
- Auth context: User authentication and session state
- Theme context: Dark/light mode preferences

**Utils/**: Helper functions and utilities
- API client for making requests to backend

### Backend Structure Details

**Models/**: MongoDB Mongoose schemas
- User: Authentication and profile data
- Post: User posts with metadata
- Comment: Comments on posts
- Cat: Cat profiles and information
- Vote: User voting history

**Routes/**: Express route handlers
- Auth routes: OAuth login, logout, session
- User routes: Profile management and user directory
- Cat routes: Cat CRUD operations
- Post routes: Posts, comments, and voting

**Middleware/**: Express middleware functions
- Authentication checks on protected routes
- Error handling and formatting
- CORS and session management

**Utils/**: Helper functions for the backend
- Database connection setup
- OAuth and Passport configuration
- File upload and Cloudinary integration
- Session management setup

Each directory is independently configurable through environment files.

---

## 🔐 Environment Configuration

Secrets are intentionally excluded from version control.

Copy example files before running:

```
server/.env.example → server/.env
client/.env.example → client/.env
```

Fill in required values such as:

- OAuth credentials
- Session secrets
- API endpoints
- Database connection

---

## 📦 Installation

Install root dependencies:

```
npm install
npm run install:all
```

This installs client and server packages.

---

## ▶ Running the Frontend Only

```
cd client
npm run dev
```

Useful for UI development or styling work.

---

## ▶ Running the Full Application

After configuring environment variables:

```
npm run dev
```

This launches:

- Backend API server
- Frontend development server

---

## 🔄 Development Workflow

1. Create feature branch
2. Implement feature
3. Test locally
4. Submit pull request

Keep commits small and descriptive.

---

## 🧪 Testing Strategy

- Manual UI testing
- Endpoint verification
- OAuth flow validation

Future improvements may include automated tests.

---

## 🎨 UI Guidelines

- Prefer reusable components
- Maintain spacing consistency
- Respect dark/light themes

Avoid layout shifts and blocking operations.

---

## 📡 API Design Principles

- RESTful endpoints
- Predictable responses
- Clear error messages

All API calls should handle failure states gracefully.

---

## 📷 Media Handling

- Image upload validation
- Size restrictions
- Safe storage practices

Never trust client‑side validation alone.

---

## 🔒 Security Notes

- Session cookies only
- OAuth token isolation
- Input sanitization

Always validate user input on the server.

---

## ⚡ Performance Considerations

- Infinite scroll batching
- Lazy loading
- Optimized API calls

Avoid over‑fetching data.

---

## 🛠 Customization

You may extend:

- Feed algorithms
- UI themes
- Profile features

Maintain separation between client and server logic.

---

## 🧭 Roadmap Ideas

- Notifications system
- Real‑time updates
- Advanced moderation tools
- Mobile optimizations

---

## 🤝 Contribution Guidelines

- Follow coding standards
- Write clear commit messages
- Document major changes

Be respectful in discussions.

---

## 🧰 Troubleshooting

Common issues:

- OAuth misconfiguration
- Missing environment variables
- Port conflicts

Always verify `.env` setup first.

---

## 📚 Learning Goals

This project demonstrates:

- OAuth integration
- Infinite scrolling patterns
- Modular frontend architecture
- Backend session handling

---

## 🧹 Code Style

- Consistent formatting
- Meaningful variable names
- Minimal side effects

Keep functions focused and readable.

---

## 🔁 Deployment Notes

Prepare production configs:

- Secure secrets
- HTTPS enforcement
- Optimized builds

Never deploy development credentials.

---

## 🐾 Philosophy

Fun projects can still teach real engineering practices.

Build clean. Ship thoughtfully. Iterate often.

---

## 📄 License

Add your preferred license here.

---

## ❤️ Acknowledgements

Thanks to everyone experimenting, learning, and building cool things.

---

## 📬 Feedback

Suggestions and improvements are welcome.

Open an issue or start a discussion.

---

Happy hacking and enjoy the cats.
``
