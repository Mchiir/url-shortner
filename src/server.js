import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import { createConnection } from 'mysql2'

const app = express()
app.use(express.json())

const database = process.env.DB
const PORT = process.env.PORT || 3000
const DB_USER = process.env.DB_USER
const DB_HOST = process.env.DB_HOST
const DB_PASSWORD = process.env.DB_PASSWORD

const conn = createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: database
})

conn.connect((err) => {
    if (err) {
        console.log(`Error connecting to database ${database} mysql DB: ${err}`)
        return
    }
    console.log(`Connected to ${database} mysql database!`)
})

app.post("/api/create-short-url", (req, res) => {
    console.log("Reached create short url API")

    let uniqueID = Math.random().toString(36).substring(2, 10)
    let sql = 'INSERT INTO links (longurl, shorturlid) VALUES (?, ?)'
    const values = [req.body.longurl, uniqueID]

    conn.query(sql, values, (error, result) => {
        if (error) {
            console.error('Error creating short URL:', error)
            return res.status(500).json({ error: "Error creating short URL" })
        } else {
            res.status(200).json({ status: "OK", shorturlid: uniqueID })
        }
    })
})

app.get('/api/get-all-short-urls', (req, res) => {
    let sql = "SELECT * FROM links"
    conn.query(sql, (error, result) => {
        if (error) {
            console.error('Error fetching short URLs:', error)
            res.status(500).json({ error: "Failed to get short URLs" })
        } else if (result === "") {
            res.status(201).json("Empty set")
        } else {
            res.status(200).json(result)
        }
    })
})


app.get('/:shorturlid', (req, res) => {
    let shorturlid = req.params.shorturlid
    let sql = "SELECT * FROM links WHERE shorturlid = ? LIMIT 1"
    let values = [shorturlid]

    return new Promise((resolve, reject) => {
        conn.query(sql, values, (error, result) => {
            if (error) {
                console.error('Error fetching short URL:', error)
                reject({ status: 500, error: "Something went wrong" })
            }

            if (result.length === 0) {
                reject({ status: 404, error: "Short URL not found" })
            }

            let updateSql = "UPDATE links SET count = count + 1 WHERE id = ?"
            console.log(result)
            conn.query(updateSql, [result[0].id], (updateError, updateResult) => {
                if (updateError) {
                    console.error('Error updating short URL count:', updateError)
                    reject({ status: 500, error: "Something went wrong" })
                }

                resolve({ status: 200, longurl: result[0].longurl })
            })
        })
    })
        .then((data) => {
            res.redirect(data.longurl)
        })
        .catch((error) => {
            res.status(error.status).json({ error: error.error })
        })
})



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})