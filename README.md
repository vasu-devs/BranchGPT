# 🌳 BranchGPT

> **"Conversations are trees, not lists."**

BranchGPT reimplements the chat interface as a **Directed Acyclic Graph (DAG)**. Unlike standard linear chatbots, BranchGPT allows you to **fork** any message into a new branch, explore parallel ideas, and **merge** valuable insights back into the main thread—just like Git, but for thinking.

Made with ❤️ by **[Vasu-DevS](https://vasudev.live)**

## ✨ Key Features

### 🌿 True Branching Logic
- **Fork Anywhere**: Click the "Fork" button on *any* message to spawn a parallel reality.
- **Tree Navigation**: A visual sidebar tree lets you jump between timeline branches instantly.
- **Context Preservation**: Each branch maintains its own unique history up to the fork point.

### 🧠 Smart Merging
- **Concise Summaries**: When merging a branch back into its parent, the system generates a summarized transcript using Llama 3.3.
- **Context Awareness**: The merge logic intelligently filters out shared history, adding *only* the new messages from the branch.
- **System Events**: Merges are recorded as distinct system events in the chat stream.

### ⚡️ Optimized UX
- **Auto-Focus Flow**: The input field automatically grabs focus after AI responses for seamless flow.
- **Premium Design**: A high-fidelity, glassmorphic interface with support for Dark Mode.
- **Markdown Everywhere**: Full support for Rich Text, Code Blocks, and Mathematical Notation (LaTeX).

## 📦 Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router & Server Actions) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Database** | [PostgreSQL](https://neon.tech/) (via Neon Serverless) |
| **ORM** | [Drizzle ORM](https://orm.drizzle.team/) |
| **AI Engine** | [Vercel AI SDK](https://sdk.vercel.ai/) + [Groq](https://groq.com/) (Llama 3.3) |
| **Styling** | [Vanilla CSS](https://developer.mozilla.org/en-US/docs/Web/CSS) + [Tailwind CSS v4](https://tailwindcss.com/) |

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- A [Neon](https://neon.tech) PostgreSQL database (or local Postgres)
- A [Groq](https://console.groq.com/) API Key

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/vasu-devs/branchgpt.git
    cd branchgpt
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    Create a `.env` file:
    ```env
    DATABASE_URL="postgresql://user:pass@ep-xyz.region.aws.neon.tech/neondb?sslmode=require"
    GROQ_API_KEY="gsk_your_groq_api_key"
    ```

4.  **Initialize Database**
    ```bash
    npx drizzle-kit push
    ```

5.  **Run Development**
    ```bash
    npm run dev
    ```

## 📖 Usage Guide

### Forking
Hover over any message and click the **Branch Icon**. Type your new prompt to start a new parallel conversation from that point.

### Merging
Navigate to a child branch and click the **Merge Icon** in the sidebar. The system will summarize the branch and append it to the parent conversation.

### Switching Branches
Use the **Git Tree** sidebar on the right to visualize your entire conversation graph and switch between branches instantly.

## 📄 License

MIT © [Vasu-DevS](https://vasudev.live)
