import mysql from "mysql2";

export const create = (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array());
    }

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

    let date = new Date().toISOString().slice(0, 19).replace("T", " ");

    connection.execute(
      `INSERT INTO articles (titre, contenu, img, id_category, id_user, date) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        req.body.title,
        req.body.content,
        req.body.img,
        req.body.id_category,
        req.userId,
        date,
      ],
      function (err, results, fields) {
        if (err) {
          res.sendStatus(400);
        } else {
          res.send({
            Message: `Post "${req.body.title}" successfully added with id: ${results.insertId}`,
          });
        }
      }
    );
  } catch (err) {
    console.log(err);
  }
};

export const getAll = async (req, res) => {
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

    async function getPosts() {
      let res = await new Promise((res, rej) =>
        connection.execute(`SELECT * FROM articles`, (err, results) =>
          err ? rej(err) : res(results)
        )
      );
      return res;
    }

    async function getUsers() {
      let res = await new Promise((res, rej) =>
        connection.execute(`SELECT * FROM utilisateurs`, (err, results) =>
          err ? rej(err) : res(results)
        )
      );
      return res;
    }

    async function getCats() {
      let res = await new Promise((res, rej) =>
        connection.execute(`SELECT * FROM categories`, (err, results) =>
          err ? rej(err) : res(results)
        )
      );
      return res;
    }

    let articles = await getPosts();
    let users = await getUsers();
    let cats = await getCats();

    articles.map((article) => {
      let user = users.filter((el) => el.id == article.id_user);
      let cat = cats.filter((el) => el.id == article.id_category);
      article.userdata = {
        name: user[0].login,
        avatar: user[0].avatarUrl,
        email: user[0].email,
      };
      article.category = cat[0].nom;
    });

    res.json(articles);
  } catch (error) {
    console.log(error);
  }
};

export const getOne = async (req, res) => {
  try {
    const id = req.params.id;

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
      `UPDATE articles SET views = views + 1 WHERE id = ?`,
      [id],
      (err, results) => {
        if (err) {
          console.log(err);
        }
      }
    );

    async function getPost() {
      let res = await new Promise((res, rej) =>
        connection.execute(
          `SELECT * FROM articles WHERE id = ?`,
          [id],
          (err, results) => (err ? rej(err) : res(results))
        )
      );
      return res[0];
    }

    let article = await getPost();

    if (article) {
      async function getUsers() {
        let res = await new Promise((res, rej) =>
          connection.execute(`SELECT * FROM utilisateurs`, (err, results) =>
            err ? rej(err) : res(results)
          )
        );
        return res;
      }

      async function getCats() {
        let res = await new Promise((res, rej) =>
          connection.execute(`SELECT * FROM categories`, (err, results) =>
            err ? rej(err) : res(results)
          )
        );
        return res;
      }

      let users = await getUsers();
      let cats = await getCats();

      let user = users.filter((el) => el.id == article.id_user);
      let cat = cats.filter((el) => el.id == article.id_category);
      article.userdata = {
        name: user[0].login,
        avatar: user[0].avatarUrl,
        email: user[0].email,
      };
      article.category = cat[0].nom;

      res.json(article);
    } else {
      res.json("No such post");
    }
  } catch (error) {
    res.json(error);
  }
};

export const remove = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.userId;
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
      `DELETE FROM articles WHERE id = ? AND id_user = ?`,
      [id, userId],
      (err, results) => {
        if (results.affectedRows) {
          res.json(`Post ${id} succesfully removed`);
        } else {
          res.json("No such post");
        }
      }
    );
  } catch (error) {
    res.json(error);
  }
};

export const edit = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }

  const id = req.params.id;
  const userId = req.userId;

  try {
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

    let date = new Date().toISOString().slice(0, 19).replace("T", " ");

    connection.execute(
      `UPDATE articles SET titre = ?, contenu = ?, img = ?, id_category = ?, updated = ? WHERE id = ?`,
      [
        req.body.title,
        req.body.content,
        req.body.img,
        req.body.id_category,
        date,
        id,
      ],
      function (err, results, fields) {
        if (err) {
          res.sendStatus(400);
        } else {
          res.send({
            Message: `Post "${req.body.title}" successfully updated`,
          });
        }
      }
    );
  } catch (err) {
    console.log(err);
  }
};
