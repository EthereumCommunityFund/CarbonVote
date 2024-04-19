export const generateMessage = (
  poll_id: string,
  option_id: string,
  voter_identifier: string
) => {
  try {
    const message = { poll_id, option_id, voter_identifier };
    return message;
  } catch (error: any) {
    console.error(error);
    return error;
  }
};
