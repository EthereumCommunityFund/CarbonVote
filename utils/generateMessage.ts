export const generateMessage = (pollId: string, option_id: string, voter_identifier: string, requiredCred: string) => {
    try {
        const message = `{ poll_id: ${pollId}, option_id: ${option_id}, voter_identifier: ${voter_identifier}, requiredCred: ${requiredCred}`;
        return message;
    } catch (error: any) {
        console.error(error);
        return error;
    }
}
