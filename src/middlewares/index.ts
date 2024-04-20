import express from 'express';
import { get, merge } from 'lodash';

import { getUserBySessionToken } from '../db/users';

export const isAuthenticated = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => {
    try {
        const token = req.cookies['authToken'];

        if (!token) {
            return res
                .status(403)
                .send({ status: false, msg: 'Please login again.' });
        }

        const existingUser = await getUserBySessionToken(token);

        if (!existingUser) {
            return res
                .status(403)
                .send({ status: false, msg: 'Please login again.' });
        }

        merge(req, { identity: existingUser });

        return next();
    } catch (e) {
        console.log(e);
        return res.sendStatus(400);
    }
};

export const isOwner = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => {
    try {
        const { id } = req.params;
        const currentUserId = get(req, 'identity._id') as string;

        if (!currentUserId || currentUserId.toString() !== id) {
            return res.status(403).send({ status: false, msg: 'error' });
        }

        next();
    } catch (e) {
        console.log(e);
        return res.sendStatus(400);
    }
};
