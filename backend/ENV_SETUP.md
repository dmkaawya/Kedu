# Environment Setup

Create a `.env` file in the `backend` folder with the following content:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/school_management
JWT_SECRET=your_super_secret_jwt_key_change_in_production_12345
JWT_EXPIRE=7d
NODE_ENV=development
```

## Steps:

1. Navigate to `backend` folder
2. Create a new file named `.env`
3. Copy the content above into the file
4. Save the file

**Important:** Make sure MongoDB is running before starting the backend!
