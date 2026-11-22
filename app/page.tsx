"use client";

import { useState } from "react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setStatus("Adding job to RabbitMQ...");

    const response = await fetch("/api/jobs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      setStatus(data.error || "Something went wrong.");
      return;
    }

    setStatus(`Success: job queued for ${data.job.email}`);
    setEmail("");
  }

  return (
    <main
      style={{
        maxWidth: "600px",
        margin: "80px auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>RabbitMQ + Next.js</h1>

      <p>
        Enter an email. Next.js will add a job to RabbitMQ, then a worker
        will process it.
      </p>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          style={{ padding: "10px", width: "65%" }}
        />

        <button
          type="submit"
          style={{ padding: "10px", marginLeft: "8px" }}
        >
          Queue job
        </button>
      </form>

      <p>{status}</p>
    </main>
  );
}