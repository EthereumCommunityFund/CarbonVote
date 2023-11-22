import { NextApiHandler } from "next";
import { NextApiRequest, NextApiResponse } from "next";
import withAuthorization from "../middlware/withAuthorization";



const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    console.log('reached handler')
}


export default withAuthorization(handler);






