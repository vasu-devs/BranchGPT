# 🌳 BranchGPT

> **"Conversations are trees, not lists."**

BranchGPT reimplements the chat interface as a **Directed Acyclic Graph (DAG)**. Unlike standard linear chatbots, BranchGPT allows you to **fork** any message into a new branch, explore parallel ideas, and **merge** valuable insights back into the main thread—just like Git, but for thinking.

![BranchGPT Demo](https://placehold.co/1200x600/18181b/white?text=BranchGPT+Preview)

## ✨ Key Features

### 🌿 True Branching Logic
- **Fork Anywhere**: Click the "Fork" button on *any* message to spawn a parallel reality.
- **Tree Navigation**: A visual sidebar tree lets you jump between timeline branches instantly.
- **Context Preservation**: Each branch maintains its own unique history up to the fork point.

### 🧠 Smart Merging
- **Concise Summaries**: When merging a branch back into its parent, the system generates a summarized transcript.
- **Context Awareness**: The merge logic intelligently filters out shared history, adding *only* the new messages from the branch to avoid duplication.
- **System Events**: Merges are recorded as distinct system events in the chat stream.

### ⚡️ Optimized UX
- **Auto-Focus Flow**: The input field automatically grabs focus after AI responses, allowing for seamless, keyboard-only conversation flow.
- **Markdown Everywhere**: Full support for Rich Text, Code Blocks, and Mathematical Notation (LaTeX) in all messages—user, AI, and system.
- **Adaptive Interface**: A responsive, 300px-wide sidebar that balances visibility with screen real estate.

## 📦 Tech Stack

Built with a modern, type-safe stack designed for performance and reliability.

| Layer | Technology |
|-------|------------|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router & Server Actions) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Database** | [PostgreSQL](https://neon.tech/) (via Neon Serverless) |
| **ORM** | [Drizzle ORM](https://orm.drizzle.team/) |
| **AI Engine** | [Vercel AI SDK](https://sdk.vercel.ai/) + [Groq](https://groq.com/) (Llama 3.3) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/) |

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- A [Neon](https://neon.tech) PostgreSQL database
- A [Groq](https://console.groq.com/) API Key

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/branchgpt.git
    cd branchgpt
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    Create a `.env` file in the root directory:
    ```env
    # Database (Neon/Postgres)
    DATABASE_URL="postgresql://user:pass@ep-xyz.region.aws.neon.tech/neondb?sslmode=require"

    # AI Provider
    GROQ_API_KEY="gsk_your_groq_api_key"
    ```

4.  **Initialize Database**
    Push the schema to your database:
    ```bash
    npx drizzle-kit push
    ```

5.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Visit [http://localhost:3000](http://localhost:3000) to start chatting.

## 📖 Usage Guide

### Forking a Conversation
1.  Hover over any message in the chat.
2.  Click the **Fork Icon** (Git Branch symbol).
3.  Enter a new prompt to steer the conversation in a new direction.
4.  You are now in a new branch!

### Merging a Branch
1.  Navigate to the branch you want to merge (must be a child branch).
2.  Click the **Merge Icon** (Purple Git Commit symbol) in the sidebar.
3.  Confirm the action. The branch's transcript will be appended to the parent branch.

### Deleting a Branch
1.  Click the **Trash Icon** next to any branch in the sidebar.
2.  **Warning**: This cascades and creates all sub-branches born from it.

## 🗃️ Database Schema

The core data model revolves around two tables:

- **`branches`**: Represents a timeline. Stores `parentBranchId` and `rootMessageId` to define the graph structure.
- **`messages`**: Linked list of chat nodes. Stores `parentId` to allow recursive history traversal.

## 📄 License

MIT © [Project Owner]
