# Tabolator Case Study - Separated Backend & Frontend

A full-stack web application demonstrating CRUD operations with a PHP REST API backend and React frontend.

## Project Structure

```
Tabolator_Casestudy/
├── backend/                    # PHP API Backend
│   ├── api/
│   │   └── user.php          # User API endpoints
│   ├── config/
│   │   ├── autoload.php      # Composer autoloader
│   │   └── bootstrap.php     # Application bootstrap
│   ├── src/
│   │   └── Models/
│   │       └── User.php      # User model with CRUD operations
│   ├── vendor/               # PHP dependencies
│   ├── .htaccess            # URL rewriting configuration
│   ├── composer.json        # PHP dependency management
│   └── index.php            # API router and entry point
├── frontend/                  # React Frontend
│   ├── public/
│   │   └── index.html       # HTML template
│   ├── src/
│   │   ├── components/
│   │   │   ├── UserForm.js  # User creation/editing form
│   │   │   ├── UserForm.css
│   │   │   ├── UserList.js  # User list display
│   │   │   └── UserList.css
│   │   ├── services/
│   │   │   └── UserService.js # API service layer
│   │   ├── App.js           # Main application component
│   │   ├── App.css
│   │   ├── index.js         # React entry point
│   │   └── index.css        # Global styles
│   ├── node_modules/        # Node.js dependencies
│   ├── package.json         # Node.js dependency management
│   └── package-lock.json    # Dependency lock file
├── .gitignore               # Git ignore rules
└── README.md               # This file
```

## Features

- **CRUD Operations**: Complete Create, Read, Update, Delete functionality for users
- **RESTful API**: PHP backend with proper HTTP methods and status codes
- **Modern UI**: React frontend with responsive design and modal feedback
- **Data Persistence**: File-based JSON storage for user data
- **Real-time Updates**: Frontend automatically refreshes after CRUD operations
- **CORS Enabled**: Backend configured for cross-origin requests
- **Error Handling**: Comprehensive error handling and user feedback

## Backend Setup (PHP)

### Prerequisites
- PHP 7.4 or higher
- Web server (Apache/Nginx)
- Composer (for dependency management)

### Installation
1. Navigate to the `backend/` directory
2. Install dependencies:
   ```bash
   composer install
   ```
3. Ensure the web server can write to the `data/` directory (created automatically)

### API Endpoints
- `GET /api/user` - Get all users
- `GET /api/user/{id}` - Get specific user
- `POST /api/user` - Create new user
- `PUT /api/user/{id}` - Update user
- `DELETE /api/user/{id}` - Delete user

### Request/Response Examples

**Create User (POST):**
```json
{
  "name": "John Doe",
  "age": 30
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 4,
    "name": "John Doe",
    "age": 30
  },
  "message": "User created successfully"
}
```

## Frontend Setup (React)

### Prerequisites
- Node.js 14 or higher
- npm or yarn

### Installation
1. Navigate to the `frontend/` directory
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
4. Open http://localhost:3000 in your browser

### Features
- **User Form**: Add new users with name and age
- **User List**: Display all users with edit and delete options
- **Modal Feedback**: Success and error modals for user actions
- **Responsive Design**: Mobile-friendly interface

## Development Notes

### Backend
- Uses file-based JSON storage for user data
- Implements proper RESTful API design
- CORS configured to allow requests from any origin
- Error logging for debugging

### Frontend
- Built with React functional components and hooks
- Uses axios for HTTP requests
- Implements proper loading and error states
- Modal-based user feedback system

## Running the Full Application

1. **Start Backend**: Ensure your web server is running and serving the `backend/` directory
2. **Start Frontend**: 
   ```bash
   cd frontend
   npm start
   ```
3. **Access Application**: http://localhost:3000

## API Testing

You can test the backend API directly using tools like Postman or curl:

```bash
# Get all users
curl http://localhost/Tabolator_Casestudy/backend/api/user

# Create new user
curl -X POST http://localhost/Tabolator_Casestudy/backend/api/user \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","age":25}'
```

## Technologies Used

### Backend
- **PHP**: Server-side scripting
- **JSON**: Data storage format
- **REST API**: Architectural style
- **Composer**: Dependency management

### Frontend
- **React**: UI library
- **JavaScript ES6+**: Programming language
- **CSS3**: Styling
- **Axios**: HTTP client
- **HTML5**: Markup

## Future Enhancements

- Database integration (MySQL/PostgreSQL)
- User authentication and authorization
- Input validation and sanitization
- Pagination for large datasets
- Advanced filtering and sorting
- Unit and integration tests
- Docker containerization
