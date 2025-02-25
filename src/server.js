import 'dotenv/config'
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { Links, Users, sequelize } from './models/mod.js'

const app = express()
app.use(express.json())

const PORT = process.env.PORT || 3000


// Define __dirname manually for ES module
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.post("/create-short-url", async (req, res) => {
    // console.log("Reached create short url API")

    function generateUniqueID() {
        return Math.random().toString(36).substring(2, 10)
    }

    async function insertURL() {
        const uniqueID = generateUniqueID()
        const result = await Links.findOne({where: { shorturlid: uniqueID }})

        if (result) {
            // If the ID already exists, generate a new one
            return insertURL()
        } else {
            const newRecord = await Links.create({ longurl: req.body.longurl, shorturlid: uniqueID })
            return newRecord.shorturlid
        }
    }

    try {
        const shorturlid = await insertURL()
        res.json({ status:"OK", shorturlid })
    } catch (error) {
        console.error("Error creating short URL:", error)
        res.status(500).json({ error: "Internal Server Error" })
    }
})

app.get('/get-all-short-urls', async (req, res) => {
    const result = await Links.findAll()
    res.json(result)
})


app.get('/short.url/:shorturlid', async (req, res) => {
    try {
        const { shorturlid } = req.params;

        // Find the short URL record
        const result = await Links.findOne({ where: { shorturlid } });

        if (!result) {
            return res.status(404).json({ error: "Short URL not found" });
        }

        // Extract long URL
        const { id, longurl } = result;

        if (!longurl) {
            return res.status(500).json({ error: "Long URL not found" });
        }

        // Increment the count
        await result.increment('count');

        res.json({ longurl });
    } catch (error) {
        console.error("Error fetching short URL:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

;(async ()=>{
    try {
        await sequelize.authenticate() // Check DB connection
        // console.log('Database connected successfully')

        await sequelize.sync() // Sync models
        // console.log('Database synced')

        app.listen(PORT, () => {
            if (app.get('env') == 'development') {
                console.log(`Server is running on port ${PORT}`)
            }
        })
    } catch (error) {
        console.error('Database sync error:', error)
        process.exit(1) // Stop the server if DB sync fails
    }
})()
