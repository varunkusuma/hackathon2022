const express = require("express");
const path = require("path");
const { get } = require("request");
const mysql = require("mysql");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const viewsDir = path.join(__dirname, "views");
app.use(express.static(viewsDir));
app.use(express.static(path.join(__dirname, "./public")));
app.use(express.static(path.join(__dirname, "../images")));
app.use(express.static(path.join(__dirname, "../media")));
app.use(express.static(path.join(__dirname, "../../weights")));
app.use(express.static(path.join(__dirname, "../../dist")));

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  port: 3306,
  database: "hackathon2022",
});

// // Connecting MYSQL
db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("MSQL CONNECTED ");
});

app.get("/", (req, res) => res.redirect("/eyeblinking"));
app.get("/eyeblinking", (req, res) =>
  res.sendFile(path.join(viewsDir, "index.html"))
);

function insertRecordOnBlink(blinkCount) {
  let URL = "/eye_blink_detection";
  let req = new XMLHttpRequest();
  req.onreadystatechange = function () {
    if (this.readyState === XMLHttpRequest.DONE && this.status === 201) {
      const sql =
        "Insert into eye_blink_detection SET dateTimeRecordOnBlink = NOW()";
      db.query(sql, (err) => {
        if (err) {
          throw err;
        }
        console.log(res);

        res.send("Record Inserted inside table");
      });
    }
  };
  req.open("POST", URL);
  req.setRequestHeader("Content-Type", "application/json");

  req.send(JSON.stringify(product));
}

app.get("/eye_blink_detection", (req, res) => {
  // const post = {
  //   dateTimeRecordOnBlink: curdate(),
  // };
  const sql =
    "Insert into eye_blink_detection SET dateTimeRecordOnBlink = NOW()";
  db.query(sql, (err) => {
    if (err) {
      throw err;
    }
    console.log(res);

    res.send("Record Inserted inside table");
  });
});

app.get("/eye_blink_frequency", (req, res) => {
  // const post = {
  //   dateTimeRecordOnBlink: curdate(),
  // };
  const sql = "CALL sp3()";
  db.query(sql, (err, results) => {
    if (err) {
      throw err;
    }
    console.log(results);

    res.send(results[3][0]);
  });
});

app.post("/fetch_external_image", async (req, res) => {
  const { imageUrl } = req.body;
  if (!imageUrl) {
    return res.status(400).send("imageUrl param required");
  }
  try {
    const externalResponse = await request(imageUrl);
    res.set("content-type", externalResponse.headers["content-type"]);
    return res.status(202).send(Buffer.from(externalResponse.body));
  } catch (err) {
    return res.status(404).send(err.toString());
  }
});

app.listen(3000, () => console.log("Listening on port 3000!"));

function request(url, returnBuffer = true, timeout = 10000) {
  return new Promise(function (resolve, reject) {
    const options = Object.assign(
      {},
      {
        url,
        isBuffer: true,
        timeout,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36",
        },
      },
      returnBuffer ? { encoding: null } : {}
    );

    get(options, function (err, res) {
      if (err) return reject(err);
      return resolve(res);
    });
  });
}
