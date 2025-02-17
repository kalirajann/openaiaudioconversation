# Realtime API with WebRTC

## Overview
This project connects to OpenAI's **Realtime API** using **WebRTC**, enabling **real-time voice interactions**. The application:
- Captures **microphone input** and sends it to OpenAI.
- Receives **text-based responses** and displays them in a conversation UI.
- Maintains **conversation history** in the UI.
- Runs fully **hands-free** (automatic speech recognition and AI responses).

---

## Features
✅ **Real-time speech recognition** (user input without buttons).  
✅ **Text-based AI responses** displayed in a chat format.  
✅ **Conversation history** (user and AI messages).  
✅ **WebRTC-based low-latency communication**.  
✅ **Voice-controlled AI assistant**.

---

## Setup & Installation

### 1️⃣ Clone the Repository
```sh
git clone https://gitlab.com/your-repository-name.git
cd your-repository-name
```

### 2️⃣ Install Dependencies
Ensure **Node.js** and **npm** are installed.
```sh
npm install express dotenv node-fetch
```

### 3️⃣ Set Up Your OpenAI API Key
Create a **`.env`** file in the project root:
Add your OpenAI API key inside **`.env`**:
```env
OPENAI_API_KEY=your_openai_api_key_here
```

### 4️⃣ Start the Backend Server
```sh
node server.js
```
Application will run on **http://localhost:3000**.

---

## How It Works
1. **Start the session** → Click "Start Session".
2. **Speak** → AI will listen continuously.
3. **Receive AI response** → AI replies in audio  text format.
4. **Session logs** → Your conversation is displayed in history.
5. **End session** → Click "End Session".

---

## Roadmap
📌 **Enhancements Planned:**
- 🎙️ **Microphone animation** while recording.
- 📊 **Better UI** (chat-style messages).
- 🔄 **Improved session handling**.

🚀 Want to contribute? Feel free to **fork and submit a merge request!**

---

## License
This project is **MIT Licensed**. Feel free to use and modify!

📌 **GitLab Repository**: [your-repository-url]

