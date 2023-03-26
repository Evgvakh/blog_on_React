import mysql from "mysql2";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import bcrypt from "bcrypt";


export const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array());
    }

    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const dbParams = {
      host: "localhost",
      user: "root",
      database: "blog_voyages",
      password: "",
    };

    const connection = mysql.createConnection(dbParams);

    connection.connect(function (err) {
      if (err) {
        return console.error("Error: " + err.message);
      } else {
        console.log("Connected to DB");
      }
    });

    async function getUsers() {
      let res = await new Promise((res, rej) =>
        connection.execute(
          `SELECT * FROM utilisateurs WHERE login = ?`,
          [req.body.login],
          (err, results) => (err ? rej(err) : res(results))
        )
      );
      return res;
    }

    let rows = await getUsers();

    if (rows.length > 0) {
      res.end("Exists");
    } else {
      let date = new Date().toISOString().slice(0, 19).replace("T", " ");
      connection.execute(
        `INSERT INTO utilisateurs (login, email, password, created) VALUES (?, ?, ?, ?)`,
        [req.body.login, req.body.email, hashPassword, date],
        function (err, results, fields) {
          if (err) {
            res.sendStatus(400);
          } else {            
            const token = jwt.sign(
              {
                _id: results.insertId,
              },
              "secret123",
              {
                expiresIn: "30d",
              }
            );
            res.send({
              Message: `User "${req.body.login}" successfully added`,
              token: token,
            });
          }
        }
      );
    }
  } catch (error) {
    res.json(error);
  }
};

export const login = async (req, res) => {
  try {
    const connection = mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "blog_voyages",
      password: "",
    });

    connection.connect(function (err) {
      if (err) {
        return console.error("Error: " + err.message);
      } else {
        console.log("Connected to DB");
      }
    });

    async function getUser() {
      let res = await new Promise((res, rej) =>
        connection.execute(
          `SELECT * FROM utilisateurs WHERE email = ?`,
          [req.body.email],
          (err, results) => (err ? rej(err) : res(results))
        )
      );
      return res;
    }

    let user = await getUser();

    if (user.length === 0) {
      return res.status(404).json({
        message: "No such user",
      });
    }

    const isValidPass = await bcrypt.compare(
      req.body.password,
      user[0].password
    );

    if (!isValidPass) {
      return res.status(404).json({
        message: "Wrong data",
      });
    }

    const token = jwt.sign(
      {
        _id: user[0].id,
      },
      "secret123",
      {
        expiresIn: "30d",
      }
    );

    res.json({
      user: user[0].login,
      token: token,
    });
  } catch (err) {
    res.send(err);
  }
};

export const authCheck = async (req, res) => {
  try {
    const connection = mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "blog_voyages",
      password: "",
    });

    connection.connect(function (err) {
      if (err) {
        return console.error("Error: " + err.message);
      } else {
        console.log("Connected to DB");
      }
    });

    connection.execute(
      `SELECT * FROM utilisateurs WHERE id = ?`,
      [req.userId],
      (err, rows) => {
        if (rows.length > 0) {
          return res.json(rows[0]);
        } else {
          return res.json("No acess");
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};
