# Tabolator Case Study - Separated Backend & Frontend

This project has been restructured to separate the PHP backend and React frontend.

## Project Structure

```
Tabolator_Casestudy/
├── backend/                 # PHP API Backend
│   ├── api/
│   │   └── user.php        # User API endpoints
│   ├── models/
│   │   └── User.php        # User model class
│   ├── index.php           # API router
│   └── .htaccess           # URL rewriting
├── frontend/               # React Frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── UserList.js
│   │   │   ├── UserForm.js
│   │   │   ├── UserList.css
│   │   │   └── UserForm.css
│   │   ├── services/
│   │   │   └── UserService.js
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
└── README.md
```

## Backend Setup (PHP)

1. Make sure you have a web server with PHP installed (XAMPP, WAMP, etc.)
2. The backend is located in the `backend/` directory
3. The API endpoints are available at:
   - `GET /api/user` - Get all users
   - `GET /api/user/{id}` - Get specific user
   - `POST /api/user` - Create new user
   - `PUT /api/user/{id}` - Update user
   - `DELETE /api/user/{id}` - Delete user

## Frontend Setup (React)

1. Navigate to the `frontend/` directory
2. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
4. Open http://localhost:3000 in your browser

## Features

- **CRUD Operations**: Create, Read, Update, Delete users
- **RESTful API**: PHP backend with proper HTTP methods
- **Modern UI**: React frontend with responsive design
- **Real-time Updates**: Frontend automatically refreshes after CRUD operations
- **CORS Enabled**: Backend configured for cross-origin requests

## API Endpoints

### Users
- `GET /api/user` - Returns all users
- `GET /api/user/1` - Returns user with ID 1
- `POST /api/user` - Creates a new user
  ```json
  {
    "name": "John Doe",
    "age": 30
  }
  ```
- `PUT /api/user/1` - Updates user with ID 1
  ```json
  {
    "name": "John Updated",
    "age": 31
  }
  ```
- `DELETE /api/user/1` - Deletes user with ID 1

## Development Notes

- The backend uses in-memory data storage for demonstration
- CORS is configured to allow requests from any origin
- The frontend uses axios for HTTP requests
- The React app is configured to proxy API requests to the backend
- Both applications include proper error handling and loading states
