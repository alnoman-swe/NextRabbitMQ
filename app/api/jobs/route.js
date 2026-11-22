import amqp from "amqplib";

const queueName = "email_jobs";

export async function POST(request) {
  // Read the email sent by the browser.
  const { email } = await request.json();

  if (!email || typeof email !== "string") {
    return Response.json(
      { error: "Please provide an email address." },
      { status: 400 }
    );
  }

  const job = { email, createdAt: new Date().toISOString() };

  // ponytail: new connection per request; share one if traffic grows.
  const connection = await amqp.connect(process.env.RABBITMQ_URL);
  try {
    const channel = await connection.createChannel();
    await channel.assertQueue(queueName, { durable: true });
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(job)), {
      persistent: true,
    });
    await channel.close();
  } finally {
    await connection.close();
  }

  return Response.json({ job });
}
