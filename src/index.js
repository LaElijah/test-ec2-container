const express = require('express');
const app = express();
require('dotenv').config()

const port = process.env.PORT || 4000
 




app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html")
})


app.listen(port, () => {
    console.log(`Server is running at ${port}`)
})

