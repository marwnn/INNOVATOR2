# Parent's Portal – Fullstack Web App


---

## Setup Instructions

### 1. Requirements
- Node.js & npm
- MySQL Server / phpMyAdmin

---

### 2. Backend Setup (Server)

```bash
cd server
npm install

Create a .env file inside the server/ folder and add:

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=parents_portal
JWT_SECRET=your_jwt_secret
PORT=5000

start the server:
```bash
node server.js

### 3. Frontend Setup (Client)
```bash
cd client
npm install
npm start


### 4. Database setup
Open phpMyAdmin or MySQL CLI.



