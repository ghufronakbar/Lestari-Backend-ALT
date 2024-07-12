const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const cors = require("cors");

require('dotenv').config()

//parse application json
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

//routes
const routes = require("./routes");

app.use("/v1/mob/image/animal/", express.static("upload/animals"));
app.use("/v1/mob/image/profile/", express.static("upload/profiles"));
app.use("/v1/mob/image/default/", express.static("upload/default"));
app.use("/v1/mob/data/", express.static("upload/data"));

routes(app);

app.listen(process.env.ROOT_PORT, () => {
  console.log(`Server started on port ${process.env.ROOT_PORT}`);
});
