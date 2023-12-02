import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

import {
    SemaphoreGroupPCDPackage,
} from "@pcd/semaphore-group-pcd";


async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { verify } = SemaphoreGroupPCDPackage
    const pcd = req.body.pcd;
    const isValid = await verify(pcd);
    if (isValid) {
        const token = jwt.sign({ sessionData: 'sign_in_token' }, process.env.JWT_SECRET || 'default_secret', { expiresIn: '10h' });
        res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=${10 * 60 * 60}`);
        res.status(200).json({ message: 'Proof verified, session created.' });
    } else {
        res.status(401).json({ error: 'Invalid proof' });
    }
}

export default handler;
