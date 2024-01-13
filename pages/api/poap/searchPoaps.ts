import { NextApiRequest, NextApiResponse } from 'next';
const axios = require('axios');

const poapApiKey = process.env.POAP_API_KEY;

async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {

        const searchText = req.query.searchText; // Search text
        const options = {
            method: 'GET',
            url: `https://api.poap.tech/paginated-events?name=${searchText}&id=${searchText}`,
            headers: {
                accept: 'application/json',
                'x-api-key': poapApiKey
            }
        };

        const response = await axios.request(options)
        return res.status(200).json(response.data);

    } catch (error) {
        console.error(error);
        return res.status(500).send("Server error occurred while  looking for POAPs.");
    }
}

export default handler;
