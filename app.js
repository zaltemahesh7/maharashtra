const express = require("express");
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

const db = require("./db");
const appRoutes = require("./routes");
const port = 4000;

app.use(cors());
app.use(bodyParser.json());
// Serve static files (e.g., uploads)
app.use('/uploads', express.static(path.join(__dirname, 'components/fileupload/components/uploads')));

app.use("/api", appRoutes);

(async function () {
    try {
        await db.init();
    } catch (error) {
        console.log(error);
        process.exit(0);
    }
})();

app.listen(port, () => console.log("Server started on port 4000"));
