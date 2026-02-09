# IUT Bureau of Felines

Implemented:

- Google OAuth login (session-cookie)
- Newsfeed + Cat feed + User feed + My posts feed (infinite scroll)
- Floating compose button (Gmail-style) opens Create Post modal
- Cats list/search/create (with photo)
- Users list/search + profile
- Post detail + comments
- Upvote/downvote
- Dark/Light mode toggle

Secrets are not included; fill `.env` files from `.env.example`.

## Install

```bash
npm install
npm run install:all
```

## Run (frontend only)

```bash
cd client
npm run dev
```

## Run full app

Create `server/.env` from `server/.env.example`, and `client/.env` from `client/.env.example`.
Then from project root:

```bash
npm run dev
```
