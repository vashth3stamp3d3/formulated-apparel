"use client";

import { FormEvent, useState } from "react";
import styles from "./ContactForm.module.css";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "contact",
          name: data.name,
          email: data.email,
          company: data.company,
          phone: data.phone,
          region: data.region,
          eventDate: data.eventDate,
          message: data.message,
        }),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
      setMessage("Thanks — we’ll get back to you within one business day.");
      form.reset();
    } catch {
      setStatus("error");
      setMessage("Couldn’t send right now. Email CustomerService@FormulatedPrints.com.");
    }
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <label>
        Name
        <input name="name" required autoComplete="name" />
      </label>
      <label>
        Email
        <input name="email" type="email" required autoComplete="email" />
      </label>
      <label>
        Company / event
        <input name="company" autoComplete="organization" />
      </label>
      <label>
        Phone
        <input name="phone" type="tel" autoComplete="tel" />
      </label>
      <label>
        Region
        <select name="region" defaultValue="Alberta">
          <option>Alberta</option>
          <option>Calgary</option>
          <option>Edmonton</option>
          <option>Rest of Canada</option>
        </select>
      </label>
      <label>
        Needed by
        <input name="eventDate" type="date" />
      </label>
      <label className={styles.full}>
        How can we help?
        <textarea name="message" rows={5} required />
      </label>
      <button
        type="submit"
        className="btn btn--primary"
        disabled={status === "loading"}
      >
        {status === "loading" ? "Sending…" : "Send message"}
      </button>
      {message ? (
        <p className={status === "error" ? styles.error : styles.success} role="status">
          {message}
        </p>
      ) : null}
    </form>
  );
}
