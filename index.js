require("dotenv").config();
const express = require("express");
const app = express();

const apiRouter = require("./routes/api");

app.use(express.static("public"));

app.use("/api", apiRouter);

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});