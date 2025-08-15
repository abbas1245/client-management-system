# 🚀 SalesForge CRM - Complete Web Application

A fully functional Customer Relationship Management (CRM) system built with React frontend and Node.js/Express backend, integrated with MongoDB Atlas.

## ✨ Features

### Frontend (React)
- **Modern UI/UX** with Tailwind CSS and shadcn/ui components
- **Responsive Design** that works on all devices
- **Real-time Updates** with toast notifications
- **Advanced Filtering** and search capabilities
- **Interactive Calendar** for meeting management
- **Beautiful Dashboard** with statistics and charts

### Backend (Node.js/Express)
- **RESTful API** with comprehensive CRUD operations
- **MongoDB Atlas** integration with Mongoose ODM
- **Input Validation** using express-validator
- **Security Features** with helmet, CORS, and rate limiting
- **Error Handling** middleware
- **Logging** with Morgan
- **Performance** with compression and indexing

### Database (MongoDB Atlas)
- **Scalable Cloud Database** with automatic backups
- **Optimized Schemas** with proper indexing
- **Data Relationships** between clients and meetings
- **Flexible Document Structure** for easy expansion

## 🛠️ Tech Stack

- **Frontend**: React 19, Tailwind CSS, shadcn/ui, Axios
- **Backend**: Node.js, Express.js, Mongoose
- **Database**: MongoDB Atlas
- **Authentication**: JWT (ready for implementation)
- **Validation**: express-validator
- **Security**: Helmet, CORS

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- MongoDB Atlas account
- Git

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd client-main
```

### 2. Backend Setup

#### Install Dependencies
```bash
cd backend
npm install
# or
yarn install
```

#### Environment Configuration
```bash
# Copy the example environment file
cp env.example .env

# Edit .env with your MongoDB Atlas credentials
nano .env
```

**Required Environment Variables:**
```env
# MongoDB Atlas Connection String
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/salesforge?retryWrites=true&w=majority

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# CORS Origin
CORS_ORIGIN=http://localhost:3000
```

#### Start Backend Server
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The backend will start on `http://localhost:5000`

### 3. Frontend Setup

#### Install Dependencies
```bash
cd ../frontend
npm install
# or
yarn install
```

#### Start Frontend Development Server
```bash
npm start
# or
yarn start
```

The frontend will start on `http://localhost:3000`

## 🗄️ MongoDB Atlas Setup

### 1. Create MongoDB Atlas Account
- Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
- Sign up for a free account

### 2. Create a Cluster
- Choose the free tier (M0)
- Select your preferred cloud provider and region
- Click "Create Cluster"

### 3. Set Up Database Access
- Go to "Database Access" in the left sidebar
- Click "Add New Database User"
- Create a username and password
- Select "Read and write to any database"
- Click "Add User"

### 4. Set Up Network Access
- Go to "Network Access" in the left sidebar
- Click "Add IP Address"
- Click "Allow Access from Anywhere" (for development)
- Click "Confirm"

### 5. Get Connection String
- Go to "Clusters" in the left sidebar
- Click "Connect"
- Choose "Connect your application"
- Copy the connection string
- Replace `<username>`, `<password>`, and `<dbname>` with your values
- Update your `.env` file

## 📱 Application Features

### Dashboard
- **Overview Statistics**: Total clients, conversion rates, upcoming meetings
- **Status Breakdown**: Visual representation of client pipeline
- **Quick Actions**: Add clients, schedule meetings

### Client Management
- **Add/Edit Clients**: Comprehensive client information forms
- **Search & Filter**: Find clients by name, email, status, or business
- **Status Tracking**: Monitor client progress through sales pipeline
- **Business Details**: Store company information, notes, and tags

### Meeting Management
- **Schedule Meetings**: Book appointments with clients
- **Calendar View**: Visual calendar interface
- **Meeting Types**: Categorize meetings (consultation, pitch, demo, etc.)
- **Reminders**: Set up notification preferences
- **Follow-up Tracking**: Manage post-meeting actions

### Advanced Features
- **Data Validation**: Input validation on both frontend and backend
- **Error Handling**: User-friendly error messages
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Updates**: Immediate feedback on actions
- **Search & Pagination**: Efficient data browsing

## 🔒 Security Features

- **Input Validation**: All user inputs are validated
- **CORS Protection**: Configurable cross-origin settings
- **Security Headers**: Helmet.js for security headers
- **Data Sanitization**: Clean and safe data storage
- **Rate Limiting**: Ready for implementation

## 📊 Performance Features

- **Database Indexing**: Optimized queries with proper indexes
- **Response Compression**: Faster data transfer
- **Pagination**: Efficient data loading
- **Lean Queries**: Optimized MongoDB operations

## 🧪 Testing the Application

### 1. Health Check
```bash
curl http://localhost:5000/api/health
```

### 2. Test API Endpoints
```bash
# Get all clients
curl http://localhost:5000/api/clients

# Get dashboard stats
curl http://localhost:5000/api/dashboard/stats

# Get upcoming meetings
curl http://localhost:5000/api/meetings/upcoming/list
```

### 3. Frontend Testing
- Open `http://localhost:3000` in your browser
- Try adding a new client
- Schedule a meeting
- Test search and filtering

## 🚀 Deployment

### Backend Deployment

#### Option 1: PM2 (Recommended)
```bash
npm install -g pm2
pm2 start server.js --name "salesforge-backend"
pm2 startup
pm2 save
```

#### Option 2: Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### Frontend Deployment

#### Build for Production
```bash
npm run build
```

#### Deploy to Netlify/Vercel
- Connect your GitHub repository
- Set build command: `npm run build`
- Set publish directory: `build`

## 📁 Project Structure

```
client-main/
├── frontend/                 # React frontend application
│   ├── public/              # Static files
│   ├── src/                 # Source code
│   │   ├── components/      # UI components
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utility functions
│   ├── package.json         # Frontend dependencies
│   └── tailwind.config.js   # Tailwind configuration
├── backend/                  # Node.js backend application
│   ├── models/              # Database models
│   ├── routes/              # API routes
│   ├── server.js            # Main server file
│   ├── package.json         # Backend dependencies
│   └── .env                 # Environment variables
└── README.md                # This file
```

## 🔧 Development

### Adding New Features
1. **Backend**: Create new routes in `backend/routes/`
2. **Frontend**: Add new components in `frontend/src/components/`
3. **Database**: Update models in `backend/models/`

### Code Style
- **Frontend**: ESLint + Prettier configuration
- **Backend**: Standard Node.js practices
- **Database**: MongoDB best practices

## 📞 Support & Troubleshooting

### Common Issues

#### Backend Won't Start
- Check MongoDB Atlas connection string
- Verify environment variables
- Check if port 5000 is available

#### Frontend Can't Connect to Backend
- Ensure backend is running on port 5000
- Check CORS configuration
- Verify API endpoints

#### Database Connection Issues
- Check MongoDB Atlas network access
- Verify username/password
- Ensure cluster is running

### Getting Help
- Check the console for error messages
- Review the API documentation
- Check MongoDB Atlas logs

## 🚀 Future Enhancements

- **User Authentication**: JWT-based login system
- **Role-based Access**: Admin, manager, and user roles
- **Email Notifications**: Automated meeting reminders
- **File Uploads**: Document management for clients
- **Advanced Analytics**: Detailed reporting and insights
- **Mobile App**: React Native mobile application
- **API Documentation**: Swagger/OpenAPI documentation

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Happy Coding! 🎉**

For questions or support, please create an issue in the repository.
