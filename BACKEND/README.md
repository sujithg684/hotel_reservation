# Hotel Table Booking Backend

A complete Node.js + Express.js + MongoDB backend for hotel table booking system.

## 🚀 Features

- **Complete Booking Management**: Create, retrieve, and manage table bookings
- **Validation**: Comprehensive form validation for all fields
- **MongoDB Integration**: Robust database storage with Mongoose ODM
- **RESTful API**: Clean, well-documented endpoints
- **Error Handling**: Proper error responses and logging
- **Health Monitoring**: Built-in health check endpoint

## 📋 Booking Schema

```javascript
{
  title: "Mr/Mrs/Ms/Dr",
  firstName: "string",
  lastName: "string", 
  email: "string",
  phone: "string",
  restaurant: "string",
  date: "string",
  time: "string",
  guests: "number (1-20)",
  comments: "string (optional)"
}
```

## 🛠️ Setup Instructions

### 1. Install Dependencies
```bash
cd BACKEND
npm install
```

### 2. Environment Configuration
Create a `.env` file in the BACKEND directory:
```env
PORT=5001
MONGO_URI=mongodb+srv://<USERNAME>:<PASSWORD>@<CLUSTER>.mongodb.net/<DATABASE>?retryWrites=true&w=majority
```

**Replace with your MongoDB Atlas credentials:**
- `<USERNAME>`: Your MongoDB Atlas username
- `<PASSWORD>`: Your MongoDB Atlas password  
- `<CLUSTER>`: Your cluster address
- `<DATABASE>`: Your database name

### 3. MongoDB Atlas Setup
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Add your IP address to Network Access
4. Create a database user with read/write permissions
5. Get your connection string

### 4. Run the Server
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

## 📡 API Endpoints

### POST `/api/book` - Create Booking
**Request Body:**
```json
{
  "title": "Mr",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "restaurant": "Main Restaurant",
  "date": "2024-01-15",
  "time": "19:00",
  "guests": 4,
  "comments": "Window seat preferred"
}
```

**Response:**
```json
{
  "message": "Booking saved successfully!",
  "booking": { ... },
  "bookingId": "507f1f77bcf86cd799439011"
}
```

### GET `/api/bookings` - Get All Bookings
**Response:**
```json
{
  "count": 5,
  "bookings": [ ... ]
}
```

### GET `/api/bookings/:tableNo` - Get Bookings by Table
**Example:** `/api/bookings/4`
**Response:**
```json
{
  "tableNo": 4,
  "count": 2,
  "bookings": [ ... ]
}
```

### GET `/api/booking/:id` - Get Booking by ID
**Example:** `/api/booking/507f1f77bcf86cd799439011`
**Response:**
```json
{
  "booking": { ... }
}
```

### GET `/health` - Health Check
**Response:**
```json
{
  "status": "OK",
  "message": "Hotel Booking API is running",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "mongodb": "connected"
}
```

## 🔧 Validation Rules

- **Title**: Must be one of: Mr, Mrs, Ms, Dr
- **Email**: Must be a valid email format
- **Phone**: Minimum 10 characters
- **Guests**: Number between 1-20
- **All fields**: Required except comments

## 🐛 Troubleshooting

### MongoDB Connection Issues
1. **Check your .env file** - Ensure MONGO_URI is correct
2. **Verify credentials** - Username/password are correct
3. **Network Access** - Add your IP to MongoDB Atlas
4. **Database User** - Ensure user has read/write permissions

### Common Errors
- `MongoNetworkError`: Check internet connection and URI
- `Authentication failed`: Verify username/password
- `ValidationError`: Check required fields and data types

### Test Connection
```bash
# Test the API
curl http://localhost:5001/health

# Test booking creation
curl -X POST http://localhost:5001/api/book \
  -H "Content-Type: application/json" \
  -d '{"title":"Mr","firstName":"Test","lastName":"User","email":"test@example.com","phone":"1234567890","restaurant":"Test","date":"2024-01-15","time":"19:00","guests":2}'
```

## 📁 Project Structure
```
BACKEND/
├── models/
│   └── Booking.js          # Mongoose schema
├── routes/
│   └── bookings.js         # API routes
├── server.js               # Main server file
├── package.json            # Dependencies
├── .env                    # Environment variables
└── README.md              # This file
```

## 🚀 Deployment

The server is configured to run on port 5001. For production:
1. Set NODE_ENV=production
2. Use a process manager like PM2
3. Set up proper MongoDB Atlas security
4. Configure CORS for your frontend domain 