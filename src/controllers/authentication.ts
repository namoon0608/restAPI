import express from 'express';
import { createUser, getUserByEmail } from '../db/users';
import { authentication, random } from '../helpers';

export const login = async (req: express.Request, res: express.Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).send({ status: false, msg: 'error' });
        }

        const user = await getUserByEmail(email).select(
            '+authentication.salt +authentication.password'
        );

        if (!user) {
            return res.status(500).send('Email is not exist.');
        }

        const expectedHash = authentication(user.authentication.salt, password);

        if (user.authentication.password !== expectedHash) {
            return res
                .status(403)
                .send({ status: false, msg: 'Password is wrong.' });
        }

        const salt = random();
        user.authentication.sessionToken = authentication(
            salt,
            user._id.toString()
        );

        await user.save();

        res.cookie('authToken', user.authentication.sessionToken, {
            domain: 'localhost',
            path: '/',
        });

        return res
            .status(200)
            .send({
                status: true,
                data: { token: user.authentication.sessionToken },
                msg: '登入成功',
            })
            .end();
    } catch (e) {
        console.log(e);
        return res.sendStatus(400);
    }
};

export const register = async (req: express.Request, res: express.Response) => {
    try {
        const { email, password, username } = req.body;

        if (!email || !password || !username) {
            return res.status(400).send({ status: false, msg: 'error' });
        }

        const existUser = await getUserByEmail(email);

        if (existUser) {
            return res
                .status(500)
                .send({ status: false, msg: 'Email has already been used.' });
        }

        const salt = random();

        const user = await createUser({
            email,
            username,
            authentication: {
                salt,
                password: authentication(salt, password),
            },
        });

        return res
            .status(200)
            .send({ status: true, data: user, msg: '取得資料成功' })
            .end();
    } catch (e) {
        console.log(e);
        return res.sendStatus(400);
    }
};
