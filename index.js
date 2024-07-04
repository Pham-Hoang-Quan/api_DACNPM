const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const authenticateToken = require('./middleware/authenticate');


// Import routes
const userRoutes = require('./routes/user');
const campaignRoutes = require('./routes/campaign');
const universityRoutes = require('./routes/university');

const app = express();
const port = 3700;

// Parse JSON bodies (as sent by API clients)
app.use(bodyParser.json());



// MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'dacnpm'
});

connection.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL: ', err);
        return;
    }
    console.log('Connected to MySQL');
});

// Pass connection to routes
app.use((req, res, next) => {
    req.connection = connection;
    next();
});

// Use routes
app.use('/users', userRoutes);
app.use('/campaigns', campaignRoutes);
app.use('/universities', universityRoutes);


// Sample route
app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
