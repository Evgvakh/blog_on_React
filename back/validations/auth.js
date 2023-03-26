import {body} from 'express-validator';

export const registerValidator = [
    body('email', 'wrong format').isEmail(),
    body('password', '5 characters minimun').isLength({ min: 5}),
    body('login', '2 characters minimum').isLength({min: 2}),
    body('avatarUrl').optional().isURL()
];