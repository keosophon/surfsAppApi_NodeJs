const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");
const sql = require("mssql");

const config = {
  user: "surfapplimited",
  password: "TatianeLailaSophon123",
  server: "surfapplimited.database.windows.net",
  database: "surfapp",
  port: 1433,
  connectionTimeout: 3000,
  parseJSON: true,
  options: {
    encrypt: true,
    enableArithAbort: true,
  },
  pool: {
    min: 0,
    idleTimeoutMillis: 3000,
  },
};

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

app.get("/", function (req, res) {
  res.send("todo api works");
});

app.get("/users", async function (req, res) {
  await poolConnect;
  try {
    const request = pool.request();
    const result = await request.query("SELECT * FROM Users");
    console.log(result);
    res.json(result.recordset);
  } catch (err) {
    console.error("SQL error", err);
    res.send(err);
  }
});

app.put("/users/:id", async function (req, res) {
  const userId = parseInt(req.params.id);
  const { FirstName, LastName, UserName, Password, Email, Phone_Number } =
    req.body;

  await poolConnect;

  try {
    const request = pool.request();
    const result = await request
      .input("id", sql.Int, userId)
      .input("firstname", sql.NVarChar(50), FirstName)
      .input("lastname", sql.NVarChar(50), LastName)
      .input("username", sql.NVarChar(50), UserName)
      .input("password", sql.NVarChar(50), Password)
      .input("email", sql.NVarChar(50), Email)
      .input("phone_number", sql.NVarChar(50), Phone_Number)
      .query(
        "UPDATE Users SET FirstName = @firstname, LastName=@lastname, UserName=@username, Password=@password, Email = @email, Phone_Number=@phone_number WHERE Id = @id"
      );

    if (result.rowsAffected[0] === 0) {
      res.status(404).send("User not found");
    } else {
      res.send("User updated successfully");
    }
  } catch (err) {
    console.error("SQL error", err);
    res.status(500).send(err);
  }
});

const hostname = "0.0.0.0";
const server = http.createServer(app);
const port = 5000;
server.listen(port, hostname);
console.debug("Server listening on port " + port);
