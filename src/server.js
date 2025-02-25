import 'dotenv/config'
import express from 'express'
import { createConnection } from 'mysql2'
import path from 'path'
import { fileURLToPath } from 'url'

const app = express()
app.use(express.json())

const database = process.env.DB
const PORT = process.env.PORT || 3000
const DB_USER = process.env.DB_USER
const DB_HOST = process.env.DB_HOST
const DB_PASSWORD = process.env.DB_PASSWORD
const URL = `http://localhost:${PORT}`

const conn = createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: database
})

conn.connect((err) => {
    if (err) {
        // console.log(`Error connecting to database ${database} mysql DB: ${err}`)
        process.exit(1)
        return
    }
    // console.log(`Connected to ${database} mysql database!`)
})

// Define __dirname manually for ES module
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.post("/create-short-url", (req, res) => {
    // console.log("Reached create short url API")

    function generateUniqueID() {
        return Math.random().toString(36).substring(2, 10)
    }

    function insertURL() {
        const uniqueID = generateUniqueID()
        let sqlCheck = "SELECT COUNT(*) AS count FROM links where shorturlid = ?"

        conn.query(sqlCheck, [uniqueID], (error, result) => {
            if (error) {
                console.error("Database error:", error)
                return res.status(500).json({ message:error.message })
            }

            if (result[0].count > 0) {
                // If the ID already exists, generate a new one
                insertURL()
            } else {
                let sqlInsert = 'INSERT INTO links (longurl, shorturlid) VALUES (?, ?)'
                conn.query(sqlInsert, [req.body.longurl, uniqueID], (error, insertResult) => {
                    if (error) {
                        console.error("Error inserting short URL:", error)
                        return res.status(500).json({ error: "Error creating short URL" })
                    }

                    res.status(200).json({ status: "OK", shorturlid: uniqueID })
                })
            }
        })
    }

    insertURL()
})

app.get('/get-all-short-urls', (req, res) => {
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


app.get('/short.url/:shorturlid', async (req, res) => {
    try {
        const { shorturlid } = req.params

        let sql = "SELECT * FROM links WHERE shorturlid = ? LIMIT 1"
        let values = [shorturlid]
        // console.log("values:", values)

        const [result] = await new Promise((resolve, reject) => {
            conn.query(sql, values, (error, result) => {
                if (error) {
                    console.error('Error fetching short URL:', error)
                    return reject({ status: 500, error: "Something went wrong" })
                }

                if (result.length === 0) {
                    return reject({ status: 404, error: "Short URL not found" })
                }
                resolve(result)
            })
        })

        // console.log("QueryResult:", result)

        const { id, longurl } = result
        // console.log("ID:", id)

        let updateSql = "UPDATE links SET count = count + 1 WHERE id = ?"
        await new Promise((resolve, reject) => {
            conn.query(updateSql, [id], (updateError, updateResult) => {
                if (updateError) {
                    console.error('Error updating short URL count:', updateError)
                    return reject({ status: 500, error: "Something went wrong" })
                }

                resolve(updateResult)
            })
        })

        if (!longurl) {
            return res.status(500).json({ error: "Long URL not found" })
        }

        res.json({ longurl })
    } catch (error) {
        res.status(error.status || 500).json({ error: error.error || "Internal Server Error" })
    }
})


app.listen(PORT, () => {
    if(app.get('env') == 'development'){
    console.log(`Server is running on port ${PORT}`)
    }
})
