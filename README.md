# 🌳 BranchGPT

> A Git-like chat interface where conversations are trees, not lists.

Standard chat apps are linear linked lists. BranchGPT is a **Directed Acyclic Graph**. Fork conversations at any message to explore different directions without polluting your main context.

## ✨ Features

- **🔀 Fork Any Message** – Click "Fork" on any message to create a new branch
- **🧭 Branch Navigation** – Navigate between parallel conversation branches  
- **🌊 AI Streaming** – Real-time response streaming with OpenAI
- **🌙 Dark Mode** – Beautiful dark UI by default
- **🗄️ Persistent History** – PostgreSQL-backed conversation storage

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp env.example .env

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📦 Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL (Neon/Supabase) |
| ORM | Drizzle ORM |
| UI | Tailwind CSS + Shadcn UI |
| AI | Vercel AI SDK + Groq (Llama 3.3) |

## 🔧 Environment Variables

Create a `.env` file:

```env
DATABASE_URL=postgresql://user:pass@host.neon.tech/neondb?sslmode=require
GROQ_API_KEY=gsk_your_key_here
GROQ_API_KEY=gsk_your-groq-api-key
```

## 🗃️ Database Setup

```bash
# Push schema to database
npx drizzle-kit push

# Or generate migrations
npx drizzle-kit generate
npx drizzle-kit migrate
```

## 📁 Project Structure

```
src/
├── app/                # Next.js App Router
├── components/chat/    # Chat UI components
├── db/                 # Drizzle schema & connection
├── actions/            # Server actions (tree traversal)
└── lib/               # Utilities
```

## 🎯 Key Concepts

### Tree Structure
Messages form a tree via `parentId` references. Each message points to its parent, enabling:
- Recursive history traversal
- Multiple children (branches) per message
- Sibling navigation

### Context Building
`getConversationHistory(nodeId)` walks up the tree to root, then reverses for chronological LLM context.

## 📄 License

MIT
