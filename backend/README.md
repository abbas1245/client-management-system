# SalesForge CRM Backend

A robust Node.js/Express backend API for the SalesForge CRM system with MongoDB Atlas integration.

## 🚀 Features

- **RESTful API** with comprehensive CRUD operations
- **MongoDB Atlas** integration with Mongoose ODM
- **Input validation** using express-validator
- **Error handling** middleware
- **Security** with helmet, CORS, and rate limiting
- **Logging** with Morgan
- **Compression** for better performance

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account
- npm or yarn package manager

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   ```bash
   # Copy the example environment file
   cp env.example .env
   
   # Edit .env with your configuration
   nano .env
   ```

4. **Configure MongoDB Atlas**
   - Create a MongoDB Atlas account
   - Create a new cluster
   - Get your connection string
   - Update `MONGODB_URI` in your `.env` file

## ⚙️ Environment Variables

Create a `.env` file in the backend directory:

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

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
# or
yarn dev
```

### Production Mode
```bash
npm start
# or
yarn start
```

The server will start on `http://localhost:5000`

## 📚 API Endpoints

### Clients
- `GET /api/clients` - Get all clients with filtering and pagination
- `GET /api/clients/:id` - Get single client
- `POST /api/clients` - Create new client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client
- `PATCH /api/clients/:id/status` - Update client status
- `GET /api/clients/stats/overview` - Get client statistics

### Meetings
- `GET /api/meetings` - Get all meetings with filtering
- `GET /api/meetings/:id` - Get single meeting
- `POST /api/meetings` - Schedule new meeting
- `PUT /api/meetings/:id` - Update meeting
- `DELETE /api/meetings/:id` - Delete meeting
- `PATCH /api/meetings/:id/status` - Update meeting status
- `PATCH /api/meetings/:id/reschedule` - Reschedule meeting
- `GET /api/meetings/upcoming/list` - Get upcoming meetings
- `GET /api/meetings/client/:clientId` - Get meetings by client
- `GET /api/meetings/stats/overview` - Get meeting statistics

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard overview
- `GET /api/health` - Health check endpoint

## 🗄️ Database Models

### Client Schema
- Basic info (name, email, phone, business details)
- Pitch status tracking
- Source and priority classification
- Estimated deal value
- Notes and tags

### Meeting Schema
- Meeting details (title, date, time, duration)
- Client association
- Status tracking
- Agenda and attendees
- Reminder settings
- Follow-up tracking

## 🔒 Security Features

- **Input Validation** - All inputs are validated using express-validator
- **CORS Protection** - Configurable CORS settings
- **Helmet** - Security headers
- **Rate Limiting** - API rate limiting (can be added)
- **Data Sanitization** - Input sanitization

## 📊 Performance Features

- **Database Indexing** - Optimized queries with proper indexes
- **Compression** - Response compression for better performance
- **Pagination** - Efficient data pagination
- **Lean Queries** - Optimized MongoDB queries

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test
```

## 📝 API Response Format

### Success Response
```json
{
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": [ ... ]
}
```

### Pagination Response
```json
{
  "data": [ ... ],
  "pagination": {
    "current": 1,
    "total": 5,
    "totalRecords": 100,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## 🔧 Development

### Project Structure
```
backend/
├── models/          # Database models
├── routes/          # API routes
├── middleware/      # Custom middleware
├── utils/           # Utility functions
├── server.js        # Main server file
├── package.json     # Dependencies
└── .env            # Environment variables
```

### Adding New Routes
1. Create route file in `routes/` directory
2. Define validation middleware
3. Implement CRUD operations
4. Add to `server.js`

### Database Changes
1. Update model schema
2. Create migration if needed
3. Update validation rules
4. Test API endpoints

## 🚀 Deployment

### Environment Variables
- Set `NODE_ENV=production`
- Use strong `JWT_SECRET`
- Configure production `MONGODB_URI`
- Set appropriate `CORS_ORIGIN`

### PM2 (Recommended)
```bash
npm install -g pm2
pm2 start server.js --name "salesforge-backend"
pm2 startup
pm2 save
```

### Docker (Alternative)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Check the API documentation
- Review the error logs

## 📄 License

This project is licensed under the MIT License.
