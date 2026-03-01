import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  let body: { name?: string; message: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, message } = body;
  if (typeof message !== "string" || !message.trim()) {
    return NextResponse.json(
      { error: "Message is required" },
      { status: 400 }
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.GAME_REQUEST_TO_EMAIL;
  if (!apiKey || !toEmail) {
    return NextResponse.json(
      { error: "Email not configured (RESEND_API_KEY, GAME_REQUEST_TO_EMAIL)" },
      { status: 500 }
    );
  }

  const from = process.env.RESEND_FROM_EMAIL ?? "Games <onboarding@resend.dev>";
  const senderName = name?.trim() || "Anonymous";

  const { error } = await resend.emails.send({
    from,
    to: [toEmail],
    subject: `Game request from ${senderName}`,
    html: `
      <p><strong>From:</strong> ${escapeHtml(senderName)}</p>
      <p><strong>Message:</strong></p>
      <p>${escapeHtml(message.trim())}</p>
    `,
  });

  if (error) {
    console.error("[Game request] Resend error:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
