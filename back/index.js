import express from "express";
import multer from 'multer';
import cors from 'cors';

import { UserController, PostController } from './controllers/index.js';
import { registerValidator } from "./validations/auth.js";
import { postValidator } from "./validations/post.js";
import checkAuth from "./utils/checkAuth.js";

const app = express();
const port = 8081;

app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use(cors());

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads');
    },

    filename: (_, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage });

app.get("/", (req, res) => {
    res.send("sdassasasSADdsa!");
});

app.post('/upload', checkAuth, upload.single('img'), (req, res) => {
    res.json({
        url: `uploads/${req.file.originalname}`
    })
});

app.post("/auth/login", UserController.login);
app.post("/auth/register", registerValidator, UserController.register);
app.get("/auth/me", checkAuth, UserController.authCheck);

app.get('/posts', PostController.getAll);
app.get("/posts/:id", PostController.getOne);
app.post("/posts", checkAuth, postValidator, PostController.create);
app.delete("/posts/:id", checkAuth, PostController.remove);
app.patch("/posts/:id", checkAuth, postValidator, PostController.edit);


app.listen(port, (err) => {
    if (err) {
        return console.log("SERVER DOWN");
    } else {
        return console.log("Server works");
    }
});
