import express from 'express';

import { deleteUserById, getUserById, getUsers } from '../db/users';

export const getAllUsers = async (
    req: express.Request,
    res: express.Response
) => {
    try {
        const users = await getUsers();

        return res
            .status(200)
            .send({ status: true, data: users, msg: '取得資料成功' });
    } catch (e) {
        console.log(e);
        return res.sendStatus(400);
    }
};

export const deleteUser = async (
    req: express.Request,
    res: express.Response
) => {
    try {
        const { id } = req.params;

        const deleteUser = await deleteUserById(id);

        return res.json(deleteUser);
    } catch (e) {
        console.log(e);
        return res.sendStatus(400);
    }
};

export const updateUser = async (
    req: express.Request,
    res: express.Response
) => {
    try {
        const { id } = req.params;
        const { username } = req.body;

        if (!username) {
            return res
                .status(400)
                .send({ status: false, msg: 'Username is empty.' });
        }

        const user = await getUserById(id);

        if (!user) {
            return res
                .status(404)
                .send({ status: false, msg: 'User not found.' });
        }

        user.username = username;

        await user.save();

        return res
            .status(200)
            .send({ status: true, data: user, msg: 'Update success' })
            .end();
    } catch (e) {
        console.log(e);
        return res.sendStatus(400);
    }
};
