# Database Setup Instructions

## Overview
The Tabulator System uses a MySQL/MariaDB database to store all competition data. The database is automatically created and populated with sample data when you run the setup script.

## Database Structure

### Tables Created:
1. **categories** - Competition categories (Talent, Beauty, Intelligence, Poise)
2. **criteria** - Scoring criteria for each category
3. **judges** - Judge information with PIN codes
4. **contestants** - Contestant data and status
5. **scores** - Judge scores for contestants (for future scoring functionality)

### Database Configuration
- **Database Name**: `tabulator_db`
- **Host**: `localhost`
- **Username**: `root`
- **Password**: (empty for XAMPP default)
- **Charset**: `utf8mb4`

## Setup Instructions

### 1. Start XAMPP Services
Make sure Apache and MySQL are running in XAMPP Control Panel.

### 2. Run Database Setup
Open your browser and navigate to:
```
http://localhost/Tabolator_Casestudy/backend/setup.php
```

Or run via command line:
```bash
cd c:/xampp/htdocs/Tabolator_Casestudy/backend
php setup.php
```

### 3. Verify Setup
The setup script will:
- ✅ Create the `tabulator_db` database
- ✅ Create all necessary tables
- ✅ Insert sample data for testing
- ✅ Set up foreign key relationships

## Sample Data Included

### Categories:
- Talent
- Beauty  
- Intelligence
- Poise

### Criteria:
- **Talent**: Performance Quality (40%), Originality (30%), Stage Presence (30%)
- **Beauty**: Facial Features (35%), Skin Complexion (30%), Body Proportion (35%)

### Judges:
- Dr. Maria Santos (PIN: 2847)
- Prof. John Reyes (PIN: 9156)
- Ms. Anna Cruz (PIN: 3729)
- Mr. David Lee (PIN: 6481)

### Contestants:
- Sarah Martinez (Active)
- Jessica Chen (Active)
- Emily Rodriguez (Eliminated)
- Amanda Thompson (Active)
- Rachel Kim (Disqualified)
- Michelle Garcia (Active)

## API Endpoints

After setup, the following API endpoints are available:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | Get all categories |
| POST | `/api/categories` | Add new category |
| PUT | `/api/categories` | Update category |
| DELETE | `/api/categories` | Delete category |

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/criteria` | Get all criteria (or by category) |
| POST | `/api/criteria` | Add new criterion |
| PUT | `/api/criteria` | Update criterion |
| DELETE | `/api/criteria` | Delete criterion |

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/judges` | Get all judges |
| POST | `/api/judges` | Add new judge (auto-generates PIN) |
| PUT | `/api/judges` | Update judge |
| DELETE | `/api/judges` | Delete judge |

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/contestants` | Get all contestants |
| POST | `/api/contestants` | Add new contestant |
| PUT | `/api/contestants` | Update contestant/status |
| DELETE | `/api/contestants` | Delete contestant |

## Troubleshooting

### Common Issues:

1. **Connection Failed**: 
   - Ensure MySQL is running in XAMPP
   - Check if user 'root' has privileges

2. **Database Already Exists**:
   - The setup script uses `CREATE DATABASE IF NOT EXISTS`
   - Sample data uses `INSERT IGNORE` to avoid duplicates

3. **Permission Issues**:
   - Make sure PHP has write permissions if needed
   - Check XAMPP MySQL configuration

### Manual Setup:
If the automatic setup fails, you can manually execute the SQL commands in phpMyAdmin:

1. Open phpMyAdmin (`http://localhost/phpmyadmin`)
2. Create database `tabulator_db`
3. Import the SQL from the `createTables()` method in `config/database.php`

## Security Notes

- In production, change the default MySQL credentials
- Consider using environment variables for database config
- Add proper authentication to API endpoints
- Implement input validation and sanitization

## Next Steps

1. Test the API endpoints with tools like Postman
2. Connect the frontend React app to the new database backend
3. Implement the scoring functionality using the `scores` table
4. Add authentication and authorization features
