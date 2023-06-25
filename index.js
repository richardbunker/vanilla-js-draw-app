const express = require("express");
const app = express();

// Serve static files from the "public" folder
app.use(express.static("sketch"));
app.use(express.static("sketch/src/"));
app.use(express.static("sketch/src/listeners"));

// Start the server
app.listen(3000, () => {
  console.log("Server listening on port 3000");
});

/* GET index page. */
app.get("/", function (req, res, next) {
  res.sendFile("index.html", { root: __dirname });
});
