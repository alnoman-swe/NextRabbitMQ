import "dotenv/config";
import amqp from "amqplib";

const queueName = "email_jobs";

async function startWorker() {
  // Connect this separate worker program to RabbitMQ.
  const connection = await amqp.connect(process.env.RABBITMQ_URL);
  const channel = await connection.createChannel();

  // Must match the producer's queue configuration.
  await channel.assertQueue(queueName, {
    durable: true,
  });

  // This worker receives one job at a time.
  await channel.prefetch(1);

  console.log(`Worker is waiting for jobs in "${queueName}"...`);

  await channel.consume(
    queueName,
    async (message) => {
      if (!message) return;

      try {
        // Convert RabbitMQ bytes back to a JavaScript object.
        const job = JSON.parse(message.content.toString());

        console.log("Received job:", job);
        console.log(`Sending welcome email to ${job.email}...`);

        // Pretend that email sending takes 2 seconds.
        await new Promise((resolve) => setTimeout(resolve, 2000));

        console.log(`Finished sending email to ${job.email}`);

        // Tell RabbitMQ that this job succeeded.
        channel.ack(message);
      } catch (error) {
        console.error("Job failed:", error);

        // Tell RabbitMQ this job failed; do not keep retrying malformed jobs.
        channel.nack(message, false, false);
      }
    },
    {
      noAck: false,
    }
  );
}

startWorker().catch(console.error);