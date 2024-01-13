import { NextApiRequest, NextApiResponse } from 'next';
import { signMessage } from 'utils/generateSignature'

async function handler(req: NextApiRequest, res: NextApiResponse) {
    let privateKey = process.env.PRIVATE_KEY as string;
    let message = req.body.message

    if (!message) return res.status(400).send("No message found in req.body")
    let signed_message = await signMessage(privateKey, req.body.message);
    console.log('message', message, signed_message)
    console.log(signed_message);
    res.status(200).send({ data: { signed_message, message } });
}

export default handler;
