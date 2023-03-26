import {body} from 'express-validator';

export const postValidator = [
  body("title", "3 characters minimun").isLength({ min: 3 }),
  body("content", "50 characters minimun").isLength({ min: 50 }),
  body("id_category", "Please chose a cat").isLength({ min: 1 }),
  body("imageUrl", "Pls join a picture").optional().isString()
];