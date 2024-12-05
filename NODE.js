// Load environment variables
// App

// App problems
// user data (password) validation is poor
// backend and front-end are poorly connected

// done
// jwt authentication on swagger doc works as well
// user registration works as well
// geting shorturlid is okay on swagger
const env = require('dotenv').config({ path: './.env' });
const express = require('express');
const { expressjwt: expressJWT } = require('express-jwt');
const jwt = require('jsonwebtoken');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');
const bcrypt = require('bcrypt');
const mysql2 = require('mysql2');
const debug = require('debug')("app:startup");
const { validateUserdata } = require('./validation');

const PORT = env.parsed.PORT || 3000;
const app = express();

// Middleware
app.use(express.json());
app.use(express.static(__dirname));
app.use(express.static('public'));

// JWT Middleware to check for token validity
const jwtMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Get token from 'Bearer <token>'
  if (!token) {
    return res.status(401).json({ error: "Token not provided" });
  }

  jwt.verify(token, env.parsed.secret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Invalid token" });
    }
    req.userId = decoded.userId;
    next();
  });
};

// Swagger setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Database connection
const conn = mysql2.createConnection({
  host: env.parsed.host,
  user: env.parsed.user,
  password: env.parsed.password,
  database: env.parsed.database
});

conn.connect(err => {
  if (err) {
    console.log('Error connecting to database:', err);
    return;
  }
  console.log('Connected to database!');
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + "/INDEX.html");
});

app.post("/api/create-short-url", jwtMiddleware, (req, res) => {
  const sql = 'INSERT INTO links (longurl, shorturlid) VALUES (?, ?)';
  console.log(req.body)

  conn.query(sql, [req.body.longurl, null], (error, result) => {
    if (error) {
      console.error('Error creating short URL:', error);
      return res.status(500).json({ error: "Error creating short URL" });
    }

    const uniqueID = (Math.random() + result.insertId).toString(36).substring(2, 10);
    const updatedSql = 'UPDATE links SET shorturlid = ? WHERE id = ?';

    conn.query(updatedSql, [uniqueID, result.insertId], (updateError) => {
      if (updateError) {
        console.error('Error updating short URL:', updateError);
        return res.status(500).json({ error: "Error updating short URL" });
      }
      res.status(200).json({ status: "OK", shorturlid: uniqueID });
    });
  });
});

app.get('/api/get-all-short-urls', (req, res) => {
  const sql = "SELECT * FROM links";

  conn.query(sql, (error, result) => {
    if (error) {
      console.error('Error fetching short URLs:', error);
      return res.status(500).json({ error: "Failed to get short URLs" });
    }

    if (result.length === 0) {
      return res.status(204).json({ message: "No short URLs found" });
    }

    res.status(200).json(result);
  });
});

app.get('/getshorturl/:shorturlid', (req, res) => {
  const shorturlid = req.params.shorturlid;
  console.log(req.params.shorturlid)
  const sql = "SELECT * FROM links WHERE shorturlid = ? LIMIT 1";

  conn.query(sql, [shorturlid], (error, result) => {
    if (error) {
      console.error('Error fetching short URL:', error);
      return res.status(500).json({ error: "Something went wrong" });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: "Short URL not found" });
    }

    const updateSql = "UPDATE links SET count = count + 1 WHERE id = ?";
    conn.query(updateSql, [result[0].id], (updateError) => {
      if (updateError) {
        console.error('Error updating short URL count:', updateError);
        return res.status(500).json({ error: "Something went wrong" });
      }

      // console.log("Long url"+ result[0].longurl)
      res.status(201).json(result[0].longurl);
      // res.redirect(result[0].longurl);
    });
  });
});

app.post('/Register', (req, res) => {
  // console.log(req.body)
  const { error, value } = validateUserdata(req.body);
  if (error) {
    return res.status(400).json({ error: "Invalid data provided" });
  }

  const { firstname, lastname, password } = value;

  bcrypt.hash(password, 10, (hashError, hashedPassword) => {
    if (hashError) {
      console.error("Error hashing password:", hashError);
      return res.status(500).json({ error: "Error registering user" });
    }

    const sql = "INSERT INTO users(firstname, lastname, password) VALUES (?, ?, ?)";
    conn.query(sql, [firstname, lastname, hashedPassword], (queryError, result) => {
      if (queryError) {
        console.error("Error registering user:", queryError);
        return res.status(500).json({ error: "Error registering user" });
      }

      const token = jwt.sign({ userId: result.insertId }, env.parsed.secret, { expiresIn: env.parsed.jwtExpiration });
      res.status(201).json({ token });
    });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});