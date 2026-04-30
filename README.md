# ⚡ TaskFlow — Team Task Manager

A full-stack web application where teams can create projects, assign tasks, and track progress with **role-based access control (Admin/Member)**.

## 🚀 Live Demo

- **Frontend:** https://affectionate-adventure-production-5dfe.up.railway.app
- **Backend API:** https://taskflow-production-5b37.up.railway.app

## 📌 Features

- 🔐 **Authentication** — Signup & Login with JWT
- 👥 **Role-Based Access** — Admin and Member roles
- 📁 **Project Management** — Create projects, add/remove members
- ✅ **Task Management** — Create, assign, update & delete tasks
- 📊 **Dashboard** — Real-time overview of To Do, In Progress, Completed & Overdue tasks
- 🔍 **Filter Tasks** — Filter by status or assigned to me
- ⏰ **Overdue Detection** — Automatically flags overdue tasks

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, React Router, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB (Atlas) |
| Auth | JWT (JSON Web Tokens) |
| Deployment | Railway |

## 📁 Project Structure

```
taskflow/
├── Backend/
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── user.js
│   │   ├── Project.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── Projects.js
│   │   ├── tasks.js
│   │   └── users.js
│   ├── .env
│   ├── package.json
│   └── server.js
└── frontend/
    ├── public/
    └── src/
        ├── components/
        │   ├── Navbar.js
        │   └── TaskModal.js
        ├── context/
        │   └── AuthContext.js
        ├── pages/
        │   ├── Dashboard.js
        │   ├── Login.js
        │   ├── Register.js
        │   ├── Projects.js
        │   └── ProjectDetail.js
        ├── services/
        │   └── api.js
        └── App.js
```

## ⚙️ Local Setup

### 1. Clone the repo
```bash
git clone https://github.com/vivekbajpai82/taskflow.git
cd taskflow
```

### 2. Backend Setup
```bash
cd Backend
npm install
```

Create a `.env` file:
```
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=5000
```

```bash
npm start
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env` file:
```
REACT_APP_API_URL=http://localhost:5000/api
```

```bash
npm start
```

## 🔑 Role-Based Access

| Feature | Admin | Member |
|---------|-------|--------|
| Create Project | ✅ | ❌ |
| Delete Project | ✅ | ❌ |
| Add Members | ✅ | ❌ |
| Create Task | ✅ | ❌ |
| Edit Task | ✅ | ❌ |
| Delete Task | ✅ | ❌ |
| View Tasks | ✅ | ✅ |
| Update Task Status | ✅ | ✅ |

## 📦 Deployment

Both Frontend and Backend are deployed on **Railway**.

- Backend root directory: `Backend`
- Frontend root directory: `frontend`

## 👨‍💻 Author

**Vivek Bajpai**
- GitHub: [@vivekbajpai82](https://github.com/vivekbajpai82)
