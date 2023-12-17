import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../utils/supabaseClient";

const viewAllPolls = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  try {
    // Fetch all polls
    let { data: polls, error: pollsError } = await supabase
      .from("polls")
      .select("*");

    if (pollsError) throw pollsError;

    // Fetch options and credentials for each poll
    for (let poll of polls) {
      let { data: options, error: optionsError } = await supabase
        .from("options")
        .select("*")
        .eq("poll_id", poll.id);

      if (optionsError) throw optionsError;

      let { data: credentials, error: credentialsError } = await supabase
        .from("pollcredentials")
        .select("credential_id")
        .eq("poll_id", poll.id);

      if (credentialsError) throw credentialsError;

      // Merge options and credentials into the poll object
      poll.options = options;
      poll.credentials = credentials.map((cred) => cred.credential_id);
    }

    // Send response with all polls and their associated data
    res.status(200).json(polls);
  } catch (error: any) {
    // Handle errors
    res
      .status(500)
      .json({ error: error.message || "An unexpected error occurred" });
  }
};

export default viewAllPolls;
