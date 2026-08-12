import { NextResponse } from "next/server";
import { Resend } from "resend";
import { site } from "@/lib/site";

type QuoteBody = {
  type?: string;
  name?: string;
  email?: string;
  company?: string;
  phone?: string;
  region?: string;
  eventDate?: string;
  message?: string;
  productType?: string;
  printLocations?: string;
  printSizes?: string;
  estimatedTotal?: string;
  estimatedTotalCents?: number;
  quantity?: number;
  lines?: Array<{
    variantId?: string | number;
    variantTitle?: string;
    quantity?: number;
    priceCents?: number;
  }>;
  designUrls?: string[];
  mockupUrl?: string;
  lifestyleUrls?: string[];
  staffNote?: string;
  surchargeDetails?: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildHtml(body: QuoteBody) {
  const lines = (body.lines || [])
    .map(
      (line) =>
        `<li>${escapeHtml(String(line.variantTitle || line.variantId || "Item"))} × ${escapeHtml(
          String(line.quantity || 0),
        )}</li>`,
    )
    .join("");

  const images = [
    body.mockupUrl,
    ...(body.designUrls || []),
    ...(body.lifestyleUrls || []),
  ]
    .filter(Boolean)
    .map((url) => `<li><a href="${escapeHtml(String(url))}">${escapeHtml(String(url))}</a></li>`)
    .join("");

  return `
    <h1>${body.type === "contact" ? "Contact request" : "Merch quote request"}</h1>
    <p><strong>Name:</strong> ${escapeHtml(body.name || "")}</p>
    <p><strong>Email:</strong> ${escapeHtml(body.email || "")}</p>
    <p><strong>Company / event:</strong> ${escapeHtml(body.company || "")}</p>
    <p><strong>Phone:</strong> ${escapeHtml(body.phone || "")}</p>
    <p><strong>Region:</strong> ${escapeHtml(body.region || "")}</p>
    <p><strong>Needed by:</strong> ${escapeHtml(body.eventDate || "")}</p>
    <p><strong>Message:</strong> ${escapeHtml(body.message || "")}</p>
    <hr />
    <p><strong>Product:</strong> ${escapeHtml(body.productType || "")}</p>
    <p><strong>Print locations:</strong> ${escapeHtml(body.printLocations || "")}</p>
    <p><strong>Print sizes:</strong> ${escapeHtml(body.printSizes || "")}</p>
    <p><strong>Quantity:</strong> ${escapeHtml(String(body.quantity || ""))}</p>
    <p><strong>Estimated total:</strong> ${escapeHtml(body.estimatedTotal || "")}</p>
    <p><strong>Surcharges:</strong> ${escapeHtml(body.surchargeDetails || "")}</p>
    <p><strong>Staff note:</strong> ${escapeHtml(body.staffNote || "")}</p>
    <p><strong>Lines:</strong></p>
    <ul>${lines || "<li>None</li>"}</ul>
    <p><strong>Images:</strong></p>
    <ul>${images || "<li>None</li>"}</ul>
  `;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as QuoteBody;
    if (!body.email || !body.name) {
      return NextResponse.json(
        { error: "Name and email are required." },
        { status: 400 },
      );
    }

    const to = process.env.QUOTE_TO_EMAIL || site.email;
    const subject =
      body.type === "contact"
        ? `[Contact] ${body.name} — ${body.company || "Formulated Apparel"}`
        : `[Quote] ${body.name} — ${body.productType || "Merch"} (${body.quantity || "?"} pcs)`;

    const text = [
      `Name: ${body.name}`,
      `Email: ${body.email}`,
      `Company: ${body.company || ""}`,
      `Phone: ${body.phone || ""}`,
      `Region: ${body.region || ""}`,
      `Needed by: ${body.eventDate || ""}`,
      `Message: ${body.message || ""}`,
      `Product: ${body.productType || ""}`,
      `Locations: ${body.printLocations || ""}`,
      `Sizes: ${body.printSizes || ""}`,
      `Qty: ${body.quantity || ""}`,
      `Estimate: ${body.estimatedTotal || ""}`,
      `Mockup: ${body.mockupUrl || ""}`,
      `Designs: ${(body.designUrls || []).join(", ")}`,
      `Lifestyle: ${(body.lifestyleUrls || []).join(", ")}`,
    ].join("\n");

    if (!process.env.RESEND_API_KEY) {
      console.log("[quote] RESEND_API_KEY missing — logging quote instead");
      console.log(subject);
      console.log(text);
      return NextResponse.json({
        ok: true,
        delivered: false,
        message: "Quote logged (email provider not configured).",
      });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const from =
      process.env.QUOTE_FROM_EMAIL || "Formulated Apparel <onboarding@resend.dev>";

    const { error } = await resend.emails.send({
      from,
      to: [to],
      replyTo: body.email,
      subject,
      text,
      html: buildHtml(body),
    });

    if (error) {
      console.error("[quote] Resend error", error);
      return NextResponse.json(
        { error: error.message || "Email failed" },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, delivered: true });
  } catch (error) {
    console.error("[quote] error", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
