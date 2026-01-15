# AI Tools Chatbot

<div align="center">
  <img src="https://img.shields.io/badge/Status-Production%20Ready-green" alt="Status" />
  <img src="https://img.shields.io/badge/React-18-blue" alt="React" />
  <img src="https://img.shields.io/badge/Powered%20By-LM%20Studio-orange" alt="LM Studio" />
</div>

A modern, responsive, and engaging chat interface designed for **LM Studio**. This web application connects to your local LLMs (Large Language Models) to provide a seamless chat experience with support for **markdown rendering**, **code highlighting**, **tables**, and **image generation**.

## ✨ Features

- **⚡ Real-Fast Local Intelligence**: Connects directly to LM Studio's local server. No data leaves your machine unless you use external tools.
- **👁️ Model Status Display**: Shows the currently loaded model name in the sidebar status area.
- **📊 Rich Content Support**:
  - Full Markdown support (Headers, lists, tables).
  - Syntax highlighting for code blocks.
  - GitHub Flavored Markdown (strikethrough, tables, tasks).
- **📱 Fully Responsive**: Optimized for both Desktop and Mobile devices with a smooth, collapsible sidebar drawer.
- **💾 Smart Session Management**:
  - Auto-saves chat history to `localStorage`.
  - **Auto-Titles**: Uses the LLM to generate concise titles for new chats automatically.
  - Create new chats and delete old ones easily.
- **💨 Smooth Streaming**: Simulates a smooth typing effect for AI responses, creating a natural reading experience.
- **⚙️ Configurable**: Easily change the LM Studio Base URL from the settings.

## 🚀 Getting Started

### Prerequisites

1.  **Node.js**: Ensure you have Node.js installed (v16+).
2.  **LM Studio**: Download and install [LM Studio](https://lmstudio.ai/).
    - Load a model (e.g., Llama 3, Mistral, etc.).
    - Go to the "Local Server" tab (`<->` icon).
    - **Start the Server**. Ensure Cross-Origin-Resource-Sharing (CORS) is enabled (usually on by default).

### Installation

1.  **Clone the repository**:

    ```bash
    git clone <repository-url>
    cd lm-test
    ```

2.  **Install Dependencies**:

    ```bash
    npm install
    # or
    pnpm install
    # or
    yarn install
    ```

3.  **Run Development Server**:

    ```bash
    npm run dev
    ```

4.  **Open in Browser**:
    Navigate to `http://localhost:5173` (or the URL shown in your terminal).

## 💡 How to Use

1.  **Chatting**: Type your query in the input box and hit Enter or click Send.
2.  **New Chat**: Click "New Chat" in the sidebar to start fresh. The AI will automatically name it after your first message.
3.  **Settings**: Click "Settings" in the sidebar to change the LM Studio connection URL (Default: `ws://localhost:1234` or `http://localhost:1234`).
4.  **Model Info**: Hover over the model name in the sidebar status bar to see the full path of the loaded model.

## 🛠️ Technology Stack

- **Frontend**: React.js, Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Markdown**: React Markdown, Remark GFM
- **AI Integration**: `@lmstudio/sdk`

## 📦 Project Structure

```
src/
├── components/
│   ├── Sidebar.jsx       # Side navigation & history
│   ├── ChatMessages.jsx  # Message list & rendering
│   └── ChatInput.jsx     # Input area with image toggle
├── hooks/
│   └── useLMStudio.js    # Hook for LM Studio connection
├── App.jsx               # Main application layout
└── main.jsx             # Entry point
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

_Built with ❤️ for the AI Community._
