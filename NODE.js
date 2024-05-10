const express = require('express');
const bodyParser = require('body-parser');
const mysql2 = require('mysql2');
const config = require('./config');
const debug = require('debug');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

const { database } = config;
const conn = mysql2.createConnection({
  host: database.host,
  user: database.user,
  password: database.password,
  database: database.database,
});

conn.connect((err) => {
    if (err) {
      debug('Error connecting to database:', err);
      return;
    }
    debug('Connected to database!');
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.post("/api/create-short-url", (req, res) => {
    let uniqueID = Math.random().toString(36).substring(2, 10);
    let sql = 'INSERT INTO links (longurl, shorturlid) VALUES (?, ?)';
    const values = [req.body.longurl, uniqueID];

    conn.query(sql, values, (error, result) => {
        if (error) {
            console.error('Error creating short URL:', error);
            return res.status(500).json({ error: "Error creating short URL" });
        } else {
            res.status(200).json({ status: "OK", shorturlid: uniqueID });
        }
    });
});

app.get('/api/get-all-short-urls', (req, res) => {
    let sql = "SELECT * FROM links";
    conn.query(sql, (error, result) => {
        if (error) {
            console.error('Error fetching short URLs:', error);
            res.status(500).json({ error: "Failed to get short URLs" });
        } else {
            res.status(200).json(result);
        }
    });
});


app.get('/:shorturlid', (req, res) => {
    let shorturlid = req.params.shorturlid;
    let sql = "SELECT * FROM links WHERE shorturlid = ? LIMIT 1";
    let values = [shorturlid];

    return new Promise((resolve, reject) => {
        conn.query(sql, values, (error, result) => {
            if (error) {
                console.error('Error fetching short URL:', error);
                reject({ status: 500, error: "Something went wrong" });
            }

            if (result.length === 0) {
                reject({ status: 404, error: "Short URL not found" });
            }

            let updateSql = "UPDATE links SET count = count + 1 WHERE id = ?";
            conn.query(updateSql, [result[0].id], (updateError, updateResult) => {
                if (updateError) {
                    console.error('Error updating short URL count:', updateError);
                    reject({ status: 500, error: "Something went wrong" });
                }

                resolve({ status: 200, longurl: result[0].longurl });
            });
        });
    })
    .then((data) => {
        res.redirect(data.longurl);
    })
    .catch((error) => {
        res.status(error.status).json({ error: error.error });
    });
});



app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
});