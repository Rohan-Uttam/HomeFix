<h1 align="center">🏠 HomeFix</h1>

<p align="center">
  <b>A full-stack home services platform enabling users to book trusted professionals for home repairs, maintenance, and cleaning.</b>
</p>

<p align="center">
  🚀 <b>React + Node.js + Express + MongoDB</b>  
</p>

---

## ✨ Features

- 🔐 **User Authentication** (JWT-based login/signup)  
- 🛠️ **Book Home Services** (repairs, cleaning, plumbing, electrical, etc.)  
- 👨‍🔧 **Technician Management System**  
- ⚡ **Real-time Status Updates**  
- 📱 **Responsive UI** for all devices  
- 🧾 **Secure REST API Architecture**  
- 🛡️ **Full validation and error handling**  

---

## 🧰 Tech Stack

### 🖥️ Frontend
- ⚛️ React.js  
- 🎨 Tailwind CSS  
- 🔄 React Router  
- 🌐 Axios  
- 🗂️ Context API / Redux (if used)

### 🛠️ Backend
- 🟩 Node.js  
- 🚂 Express.js  
- 🍃 MongoDB + Mongoose  
- 🔐 JWT Authentication  
- 🔑 Bcrypt for hashing  

---

## 📦 Folder Structure

```
HomeFix/
│
├── frontend/          # React Application
│   ├── src/
│   ├── public/
│   └── package.json
│
└── backend/           # Node/Express API
    ├── controllers/
    ├── models/
    ├── routes/
    ├── config/
    └── package.json
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/Rohan-Uttam/HomeFix.git
cd HomeFix
```

---

## 🔧 Backend Setup

```bash
cd backend
npm install
npm start
```

### Backend `.env` variables:

```
PORT=
MONGO_URI=
JWT_SECRET=
```

---

## 🎨 Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Frontend `.env`:

```
VITE_API_URL=http://localhost:5000
```

---

## 🌐 API Base URL

All frontend API calls should target:

```
http://localhost:5000/api
```

---

## 🚀 Deployment

### Frontend  
- Vercel  
- Netlify  

### Backend  
- Render  
- Railway  
- AWS EC2  

Ensure all environment variables are configured on the hosting platform.

---

## 🤝 Contributing

1. Fork the repo  
2. Create a new branch  
3. Commit changes  
4. Open a Pull Request  

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 👤 Author

**Rohan Uttam**  
Full-Stack Developer  
