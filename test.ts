import { getConversationsWithCounts } from "./src/actions/messages";

async function run() {
    try {
        const res = await getConversationsWithCounts();
        console.log("Success:", res);
    } catch (err) {
        console.error("Error:", err);
    }
}
run();
