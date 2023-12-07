import { ethers } from 'ethers';
import { NextApiRequest, NextApiResponse } from 'next';


function signMessage(privateKey: string, message: string) {
    const wallet = new ethers.Wallet(privateKey);
    console.log(hash_message(message))
    return wallet.signMessage(ethers.getBytes(hash_message(message)));
}

function hash_message(message: string) {
    console.log(ethers.keccak256(ethers.toUtf8Bytes(message)))
    return ethers.keccak256(ethers.toUtf8Bytes(message))
}

function prefixedHash(message: string) {
    let messageHash = ethers.keccak256(ethers.toUtf8Bytes(message));
    return ethers.keccak256(ethers.toUtf8Bytes("\x19Ethereum Signed Message:\n32", messageHash));
    // keccak256(
    //     abi.encodePacked(
    //         "\x19Ethereum Signed Message:\n32",
    //         messageHash
    //     )
    // );
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
    let privateKey = process.env.PRIVATE_KEY as string;
    let signed_message = await signMessage(privateKey, "message");
    console.log(signed_message);
    res.status(200).send({ data: signed_message });
}

export default handler;
