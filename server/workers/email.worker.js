import { createWorker } from "../queues/queue.factory.js";
import { EMAIL_QUEUE_NAME } from "../queues/email.queue.js";
import { sendEmailDirect } from "../services/email.service.js";

export const emailWorker = createWorker(
    EMAIL_QUEUE_NAME,
    async (job) => {
        const { to, subject, text, html } = job.data;
        console.log(` Processing email job [${job.id}] for: ${to}`);
        await sendEmailDirect(to, subject, text, html);
    },
    {
        concurrency: 5 // Process up to 5 emails in parallel
    }
);

export default emailWorker;
