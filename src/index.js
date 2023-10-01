const express = require('express');
const app = express();
require('dotenv').config()

const port = process.env.PORT || 4000
 




app.get("/", (req, res) => {
    res.json({
        message: "hi"
    })
})


app.listen(port, () => {
    console.log(`Server is running at ${port}`)
})

