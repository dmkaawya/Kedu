# School Management System - Setup Guide

## Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file (already created for you):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/school_management
JWT_SECRET=your_super_secret_jwt_key_change_in_production_12345
JWT_EXPIRE=7d
NODE_ENV=development
```

**Start MongoDB** (if not running):
- Windows: Make sure MongoDB service is running
- Or start manually: `mongod`

**Start Backend:**
```bash
npm run dev
```

### 2. Create Super Admin

```bash
cd backend
npm run create-super-admin admin@platform.com admin123
```

**Default Super Admin Credentials:**
- Email: `admin@platform.com`
- Password: `admin123`

You can change these by providing your own:
```bash
npm run create-super-admin your-email@example.com your-password
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on: `http://localhost:3000`

## Common Issues & Solutions

### School Registration Fails

**Possible Causes:**

1. **MongoDB not running**
   - Check if MongoDB is running
   - Verify connection string in `.env`

2. **Validation errors**
   - Make sure all required fields are filled:
     - School Name *
     - School Email *
     - Admin Email *
     - Admin Password * (min 6 characters)
     - Admin First Name *
     - Admin Last Name *

3. **Email already exists**
   - School email or admin email is already registered
   - Try different emails

4. **Backend not running**
   - Make sure backend is running on port 5000
   - Check console for errors

### Check Backend Logs

When registration fails, check the backend console for detailed error messages.

### Test API Directly

You can test the registration API using curl or Postman:

```bash
POST http://localhost:5000/api/schools/register
Content-Type: application/json

{
  "name": "Test School",
  "email": "school@test.com",
  "phone": "1234567890",
  "address": {
    "street": "123 Main St",
    "city": "City",
    "state": "State",
    "zipCode": "12345",
    "country": "Country"
  },
  "adminEmail": "admin@test.com",
  "adminPassword": "password123",
  "adminProfile": {
    "firstName": "Admin",
    "lastName": "User"
  }
}
```

## Login Credentials

### Super Admin
- Email: `admin@platform.com` (or what you set)
- Password: `admin123` (or what you set)
- Access: `/super-admin` dashboard

### School Admin
- Created automatically when school registers
- Email: The admin email you provided during registration
- Password: The admin password you provided during registration
- Access: `/dashboard` (school admin dashboard)

## Troubleshooting

### MongoDB Connection Error
```
❌ MongoDB connection error
```
**Solution:** 
- Make sure MongoDB is installed and running
- Check MONGODB_URI in `.env`
- Try: `mongod` to start MongoDB manually

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:**
- Change PORT in `.env` to a different port (e.g., 5001)
- Or stop the process using port 5000

### CORS Errors
- Backend CORS is configured to allow all origins in development
- Make sure frontend is running on port 3000

## Next Steps

1. ✅ Create super admin account
2. ✅ Register your first school
3. ✅ Login as school admin
4. ✅ Create classes
5. ✅ Add students and teachers
6. ✅ Start managing attendance and payments
