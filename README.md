# 🧠 Medha (मेधा) - Ambient Virtual Assistant
> Medha (मेधा) represents intelligence and wisdom in Sanskrit, embodying sharp memory and cognitive excellence.

## 👀 Overview
Medha is the Siri that we all deserved but never got. Unlike all other virtual assistants, Medha is not reactive in nature but proactive. It has access to all your tools that you configure, and it just automatically does the right thing at the right time.

## ⚡ Problem Statement
Current virtual assistants have fundamental limitations:
- They are reactive, waiting for user commands rather than taking initiative
- They operate in isolation, lacking context about your digital ecosystem
- They require explicit commands for every action, creating cognitive overhead
- They don't learn from your patterns or anticipate your needs
- They fail to leverage the full potential of your digital tools and workflows

## 💡 Our Solution
Medha reimagines virtual assistance through ambient computing:
- **Proactive Intelligence**: Anticipates needs and takes action before being asked
- **Ambient Awareness**: Maintains continuous awareness of your digital context
- **Autonomous Workflows**: Automatically orchestrates tasks across multiple platforms
- **Contextual Learning**: Builds understanding of your work patterns and preferences
- **Seamless Integration**: 
  - Connects with your essential tools (Gmail, GCal, GDrive, etc.)
  - Manages workflows without explicit commands
  - Delivers information through natural audio interfaces
  - Adapts to your changing needs and priorities
 
## Screenshots

- Mockups/designs of any UI components
  <table>
  <tr>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/ea8a9a74-6924-4693-95ca-da0eb4d147d9" width="200"><br>
      <sub><i>Agent Inbox</i></sub>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/1fcca3b6-d797-4c15-af30-24925a48099e" width="200"><br>
      <sub><i>Workflow Steps</i></sub>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/63e7457b-c173-4ff9-be64-7bcb4f3977a1" width="200"><br>
      <sub><i>Daily Digest</i></sub>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/2c273c60-833e-4bdd-9086-e94cf9db8f5a" width="200"><br>
      <sub><i>Voice Interaction powered by Sarvam</i></sub>
    </td>

  </tr>
</table>

## n8n Workflows

![image](https://github.com/user-attachments/assets/bf18f68c-8520-4898-a436-4ed72bf50097)

Other workflows are in the repo in the json format.


## 🛠️ Tech Stack

### 📱 Mobile Application (Medha)
- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Audio Processing**: Sarvam AI
- **Notifications**: Expo Notifications with Firebase Cloud Messaging

### 🔄 AI Workflow Engine
- **Framework**: n8n

### 🖥️ Server
- **Runtime**: Node.js
- **Database**: Supabase
- **Functions**: Deno (Supabase Edge Functions)

### ✨ Key Features
- Ambient task monitoring and automation
- Proactive workflow management
- Context-aware notifications
- Intelligent audio digests - daily digest of your tasks and notifications across all your tools
- Voice reactive mode powered by Sarvam AI enabling you to talk in 11 different languages

## 📂 Project Structure

```
warpspeed2025/
├── Medha/               # Mobile application
│   ├── app/           # Main application code
│   ├── assets/        # Static assets (images, fonts, etc.)
│   └── supabase/      # Supabase configuration and functions
└── server/            # Backend server implementation
```

## 🚀 Getting Started

### 📋 Prerequisites
- Node.js (v18 or higher)
- pnpm (package manager)
- Expo CLI
- iOS Simulator or Android Emulator

### 🔧 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/warpspeed2025.git
   cd warpspeed2025
   ```

2. Install dependencies for the mobile app:
   ```bash
   cd Medha
   pnpm install
   ```

3. Install dependencies for the server:
   ```bash
   cd ../server
   npm install
   ```

4. Start the development server:
   ```bash
   cd ../Medha
   pnpm start
   ```

5. Run the backend server:
   ```bash
   cd ../server
   npm start
   ```

## 👥 Team

- [Ayush Kumar Singh](https://github.com/ayush4345)
- [Parth Mittal](https://github.com/mittal-parth)
- [Shubham Rasal](https://github.com/Shubham-Rasal)

## ⚖️ License
This project is licensed under the MIT License - see the LICENSE file for details.

