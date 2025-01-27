# Question Management System

This project is a **Question Management System** built using **gRPC**, **MongoDB**, **Express.js**. It supports CRUD operations for managing questions, with a frontend for displaying and interacting with the data.

## Features

- **Frontend**:
  - View questions with pagination.
  - Can search questions
  - apply filter
  - Add, update, and delete questions.
  
- **Backend**:
  - Data seeding with bulk question import.
  - gRPC services for communication.
  
- **Database**:
  - MongoDB for storing questions with various types (e.g., Multiple Choice, Anagram).

---

## Prerequisites

Make sure you have the following installed on your system:

1. **Node.js** (v14+ recommended)
2. **MongoDB** (running locally or remotely)
3. **Git** (for cloning the repository)

---

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/question-management-system.git
cd question-management-system
```

### 2. Install Dependencies

Install dependencies for both `client` and `server`:
```bash
# Navigate to the client directory and install dependencies
cd client
npm install

# Navigate to the server directory and install dependencies
cd ../server
npm install
```

### 3. Set Up MongoDB
Ensure MongoDB is running and accessible. Update the MongoDB connection string in `server/dataSeeder.js` and `server/server.js`:
```javascript
const mongoURI = "mongodb://localhost:27017/question-management"; // Replace with your MongoDB URI
```

### 4. Seed the Database
To populate the database with sample questions, run the data seeder script:
```bash
cd server
node dataSeeder.js
```

---

## Running the Application

### 1. Start the gRPC Server
Start the gRPC server to handle API requests:
```bash
cd server
node server.js
```

### 2. Start the Client
In a new terminal, start the client application:
```bash
cd client
node index.js
```

### 3. Access the Application
Open your browser and navigate to:
```
http://localhost:3000/questions
```

---

## Project Structure

### Root Directory
- **`client`**: Contains frontend logic and routes.
- **`server`**: Contains backend logic, database models, and seeding script.
- **`questions.proto`**: gRPC protocol definitions.

### Client
- **`client.js`**: Handles gRPC communication.
- **`index.js`**: Express.js server for rendering the frontend.
- **`views/questions.ejs`**: EJS template for displaying questions.

### Server
- **`dataSeeder.js`**: Seeds MongoDB with questions from `speakx_questions.json`.
- **`Question.js`**: Defines Mongoose models for questions.
- **`server.js`**: gRPC server implementation.

---

## Available gRPC Services

### 1. `GetAll`
Fetch all questions with pagination.(Search)

### 2. `Get`
Retrieve a single question by its ID.

### 3. `Insert`
Add a new question to the database.

### 4. `Update`
Modify an existing question by ID.

### 5. `Remove`
Delete a question by ID.

---

## Environment Variables

You can use environment variables to configure the application. Create a `.env` file in the `server` directory:
```env
MONGO_URI=your nongo string
PORT=50051
```

---

## Troubleshooting

- **MongoDB Connection Issues**:
  Ensure MongoDB is running and the connection string is correct.

- **Port Conflicts**:
  Change the ports in `server/server.js` and `client/index.js` if necessary.

---

## License

This project is licensed under the MIT License. See the LICENSE file for details.

---

## Contribution

Feel free to fork this repository and submit pull requests for improvements or bug fixes. Feedback is always welcome!
