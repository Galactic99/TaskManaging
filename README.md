# Task Management Application

A full-stack task management application built with the MERN stack (MongoDB, Express.js, React, Node.js).

## Features

- User authentication (register, login, logout)
- Project management (create, update, delete projects)
- Task management with drag-and-drop functionality
- Real-time updates using Socket.IO
- Team collaboration with member management
- Modern UI with Chakra UI
- Dark mode support

## Tech Stack

### Frontend
- React with TypeScript
- Chakra UI for styling
- React Router for navigation
- Zustand for state management
- Socket.IO client for real-time features
- Axios for API requests
- React Query for data fetching

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- Socket.IO for real-time updates
- bcrypt for password hashing

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB installed and running locally
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/task-management-app.git
cd task-management-app
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Set up environment variables:
Create a `.env` file in the backend directory with the following:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/task-management
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

4. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

### Running the Application

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. In a new terminal, start the frontend development server:
```bash
cd frontend
npm run dev
```

The application should now be running at `http://localhost:5173` (frontend) and `http://localhost:5000` (backend).

## Project Structure

```
task-management-app/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── index.js
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── services/
    │   ├── store/
    │   ├── types/
    │   └── App.tsx
    └── package.json
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. 