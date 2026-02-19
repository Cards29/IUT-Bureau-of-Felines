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
root/
  client/        # Frontend application
  server/        # Backend API
  shared/        # Shared types/utilities
```

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
