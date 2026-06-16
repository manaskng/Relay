# Relay
**The Ultimate Collaborative Workspace for Developers.**
---
Relay unifies the fragmented workflow of modern software engineers. It combines real-time collaborative coding, AI-powered assistance, Kanban-style task tracking, and documentation management into a single, cohesive ecosystem.

###  Technical Spotlight: High-Performance Search Architecture
Unlike traditional applications that use slow database Regex queries (O(N) scanning), Relay leverages **MongoDB Atlas Search**.
* **Architecture:** Utilizes **Apache Lucene Inverted Indexes** to map content directly to documents.
* **Performance:** Achieves **<10ms latency** on searches across thousands of documents and code snippets (approx. **100x faster** than standard queries).
* **Capabilities:** Enables **Fuzzy Matching** (typo tolerance), relevance scoring, and autocomplete functionality across the entire workspace.
---
![screen-capture (13)](https://github.com/user-attachments/assets/422ad9b0-42e6-4816-8ff3-c67ba8f933f4)
---

## 🚀 Live Demo & Walkthrough
### 🌐 Deployment
| Component | URL | Status |
| :--- | :--- | :--- |
| **Frontend** | [devnexus-app.vercel.app](https://devnexus-app.vercel.app) | ![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel) |
| **Backend API** | [devnexus-api.onrender.com](https://devnexus-api.onrender.com) | ![Render](https://img.shields.io/badge/Render-Active-46E3B7?logo=render&logoColor=white) |

---
### Youtube Video workflow Live:
> **[▶️ Click here to watch the full video on YouTube](https://youtu.be/EKsHeZQpwYA)**
![Relay_gif](https://github.com/user-attachments/assets/cf0da425-dae3-449b-b988-143cb4cbaf6a)


## 🛠 Tech Stack

| Frontend          | Backend           | Database        | Real-Time & AI | Deployment & DevOps      |
| ----------------- | ----------------- | --------------- | -------------- | ------------------------ |
| ![React](https://img.shields.io/badge/-React-61DAFB?logo=react&logoColor=black) | ![Node.js](https://img.shields.io/badge/-Node.js-339933?logo=node.js&logoColor=white) | ![MongoDB](https://img.shields.io/badge/-MongoDB-47A248?logo=mongodb&logoColor=white) | ![Socket.io](https://img.shields.io/badge/-Socket.io-010101?logo=socket.io&logoColor=white) | ![Vercel](https://img.shields.io/badge/-Vercel-black?logo=vercel&logoColor=white) |
| ![Tailwind](https://img.shields.io/badge/-Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white) | ![Express.js](https://img.shields.io/badge/-Express.js-000000?logo=express&logoColor=white) |                 | ![Gemini](https://img.shields.io/badge/-Google%20Gemini-8E75B2?logo=google&logoColor=white) | ![Render](https://img.shields.io/badge/-Render-46E3B7?logo=render&logoColor=white) |
| ![Framer](https://img.shields.io/badge/-Framer_Motion-0055FF?logo=framer&logoColor=white) |                   |                 | ![JWT](https://img.shields.io/badge/-JWT-000000?logo=jsonwebtokens&logoColor=white)  | ![Docker](https://img.shields.io/badge/-Docker-2496ED?logo=docker&logoColor=white) |

---

## 💎 Key Features

### 1. Real-Time RelaySandBox (Collaboration & AI)
* **Live Coding Rooms:** Create instant rooms where multiple users can join via Room ID.
  <br/>
  <img width="100%" alt="RelaySandBox Desktop View" src="https://github.com/user-attachments/assets/b4e20100-ca54-46b8-b8df-923a68d6bce7" />

* **Socket.io Synchronization:** See active users, typing indicators, and code changes in real-time.
  *For data efficiency, we utilized MongoDB TTL indexes (24-hour expiry) for activity logs.*
  <br/>
  <p align="center">
    <img width="32%" alt="Mobile Activity Log" src="https://github.com/user-attachments/assets/2babb201-f358-495d-a0d1-b9eb0c613b7d" />
    &nbsp;
    <img width="32%" alt="Mobile View 1" src="https://github.com/user-attachments/assets/39afa9e8-4063-44a4-b614-0227b0afb5df" />
    &nbsp;
    <img width="32%" alt="Mobile View 2" src="https://github.com/user-attachments/assets/2c28fd5a-d8b4-4600-98fa-157312223fcc" />
  </p>

* **Integrated Compiler & Neural AI Engine:** Powered by **Google Gemini**, offering instant "Explain Code" and "Refactor" capabilities with Direct Save to Code Vault. Supports execution in 7+ languages (C++, Java, Python, JS, etc.).
  <br/>
  <p align="center">
    <img width="30%" alt="AI Mobile View" src="https://github.com/user-attachments/assets/abede532-cd16-4b68-94e8-c4ab17364eff" />
    &nbsp;
    <img width="65%" alt="AI Desktop View" src="https://github.com/user-attachments/assets/70e5e9ae-4a4f-4785-afe5-b2f835e10a41" />
  </p>

### 2. DevDocs Manager
* **Documentation Hub:** A dedicated space for project research and documentation with "Pin & Organize" functionality to keep critical notes at the top.
  <img width="100%" alt="DevDocs Hub" src="https://github.com/user-attachments/assets/109ba437-f477-4cd7-bb48-04ef6cf1e7b8" />

* **Advanced Editor:** Built on **TipTap**, supporting bold, italics, code blocks, lists, and links.
  <img width="1264" height="819" alt="image" src="https://github.com/user-attachments/assets/4f7ba951-766f-493a-9061-4b9a05d8d640" />
  <img alt="DevDocs Editor Dark Mode" src="https://github.com/user-attachments/assets/871ebb95-0a1a-4aeb-997b-8c1199233fdf" width="450" />
  &nbsp;
  
### 3. Secure Authentication & Recovery
* **JWT Authentication:** Stateless session management with secure HTTP headers.
* **Reliable Recovery:** Production-grade password reset flow using **Brevo (SMTP)** for high deliverability.
* **Encryption:** Sensitive data hashed using `bcryptjs`.

<br/>
<img width="1912" height="826" alt="Screenshot 2025-12-17 204753" src="https://github.com/user-attachments/assets/4e764f6f-5272-4c48-b278-fdd65ab72e7b" />
<p align="left">
  <img alt="Login Form" src="https://github.com/user-attachments/assets/69588f0b-4cae-445b-b18c-f35b2fb12fb7" width="320" />
  &nbsp; &nbsp; <img alt="Forgot Password Form" src="https://github.com/user-attachments/assets/fd300ea4-def1-4f46-8606-ba7501302ecd" width="300" />
</p>

### 4. Code Vault (Snippet Library)
<img alt="Snippet Library Light Mode" src="https://github.com/user-attachments/assets/60d00622-619b-46cb-aed9-957f162d506e" width="650" />

* **Syntax Highlighting:** Store reusable algorithms with automatic language detection using *react-syntax-highlighter*.
* **Direct Save:** Push working code from the RelaySandBox compiler directly to your Vault.
* **Smart Search:** Instantly filter snippets by tags (e.g., `#dp`, `#recursion`) or title.

<img alt="Snippet Library Dark Mode with Search" src="https://github.com/user-attachments/assets/20c45553-dd6d-48fb-8b6d-c60e473aa628" width="650" />
* **Resizable button**: to improve developer Experience
  <img width="1585" height="806" alt="image" src="https://github.com/user-attachments/assets/fbe46943-708d-41a4-a914-3532abb4d511" />

### 5. Task Command (Kanban)
* **Kanban Board:** A drag-and-drop interface for managing engineering tasks.
* **Visual States:** Distinct visual indicators for *Todo*, *In-Progress*, and *Completed* items.

<img alt="Kanban Board Dark Mode" src="https://github.com/user-attachments/assets/276a427b-df64-47f2-ae41-f9056fb5fb15" width="650" />
 
### 6. Dynamic Career Profile
* **Live Stats Aggregation:** Automatically pulls and visualizes data from **GitHub** and **LeetCode** APIs.
* **Smart Portfolio:** Generates a public, shareable link (e.g., `/u/username`) that serves as a live resume.
* **Auto-Asset Generation:** Uses OpenGraph to generate project cover images automatically.

<img alt="Profile Header View" src="https://github.com/user-attachments/assets/b1795180-5bf9-4182-89b7-9a7d4a6c1ac9" width="600" />
<img alt="Profile Skills and Projects" src="https://github.com/user-attachments/assets/954d0734-d2e7-4fe8-905f-a3167461c501" width="600" />
<img alt="Profile Achievements View" src="https://github.com/user-attachments/assets/8d8778da-0d37-4657-b845-5dd1099dda3c" width="600" />

---

## 🔌 APIs, Libraries & Integrations

Relay leverages a suite of powerful APIs to deliver a seamless experience:

### **Core Intelligence & Real-Time**
* **[Socket.io](https://socket.io):** Enables bidirectional, real-time communication for the coding environment (RelaySandBox).
* **[Google Gemini API](https://ai.google.dev):** Powers the Neural Engine for explaining code logic and refactoring suggestions.
* **[JDoodle / Compiler API](https://www.jdoodle.com/compiler-api/):** Provides the backend infrastructure for compiling and executing code in multiple languages securely.

### **External Data & Services**
* **[SkillIcons.dev](https://skillicons.dev):** Dynamically renders high-quality SVG icons for the "Tech Stack" section.
* **[GitHub Open Graph API](https://opengraph.githubassets.com):** Automatically fetches social preview images.
* **[GitHub Profile Summary Cards](https://github-profile-summary-cards.vercel.app):** Visualizes real-time GitHub stats.
* **[LeetCard API](https://leetcard.jacoblin.cool):** Fetches live LeetCode statistics.
* **[Brevo (Sendinblue)](https://www.brevo.com):** Powers the secure SMTP email delivery system.

---
##  Local Setup and Installation

Follow these steps to run the complete Relay ecosystem locally.

### 1. Clone the Repository

```bash
git clone https://github.com/manasraj/DevNexus.git
cd Relay

```

### 2. Backend Setup

```bash
cd backend
npm install

```

Create a `.env` file in the `backend` folder:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
# Email Service (Brevo)
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=your_verified_email@gmail.com
# Frontend URL for Redirects
CLIENT_URL=http://localhost:5173

```

Start the Server:

```bash
npm run dev

```

### 3. Frontend Setup

```bash
cd ../frontend
npm install

```

Create a `.env` file in the `frontend` folder:

```env
VITE_API_URL=http://localhost:3000

```

Start the Client:

```bash
npm run dev

```

---

## 🐳 Docker Support

Relay is fully dockerized. You can spin up the entire stack (Frontend + Backend + MongoDB) with a single command.

```bash
docker-compose up --build

```

---

##  API Endpoints

The backend exposes a robust REST API. Here are examples of the primary routes:

### Authentication

**POST** `/api/users/login`

```json
// Response
{
  "id": "65f2...",
  "username": "manas",
  "email": "manas@example.com",
  "token": "eyJhbGciOiJIUzI1Ni..."
}

```

### Code Snippets

**GET** `/api/snippets`

```json
[
  {
    "_id": "65f2...",
    "title": "Binary Search Template",
    "language": "C++",
    "code": "int binarySearch(vector<int>& nums, int target) { ... }",
    "tags": ["algorithm", "search"]
  }
]

```

### Tasks

**POST** `/api/tasks`

```json
// Request Body
{
  "content": "Refactor Authentication Middleware",
  "isCompleted": false
}

```

| Module | Method | Endpoint | Description |
| --- | --- | --- | --- |
| **Auth** | POST | `/api/users/register` | Register a new user |
|  | POST | `/api/users/forgot-password` | Send reset email via Brevo |
|  | POST | `/api/users/reset-password/:token` | Set new password |
| **Notes** | GET | `/api/notes` | Fetch all user notes |
|  | POST | `/api/notes` | Create rich-text note |
| **Snippets** | POST | `/api/snippets` | Save new code snippet |
| **Tasks** | PUT | `/api/tasks/:id` | Update task status |
| **Profile** | GET | `/api/user-profile` | Fetch public profile data |

---

## 📄 License

This project is distributed under the MIT License. See `LICENSE` for more information.

## 👨‍💻 Contact
**Manas Raj** - Full Stack Developer & Competitive Programmer

* **GitHub:** github.com/manaskng
* **Email:** manasraj850@gmail.com

© 2025 Relay. All rights reserved.
