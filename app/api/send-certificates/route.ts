import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export interface SendCertificatesRequest {
  senderEmail: string;
  senderPassword: string;
  smtpHost?: string;
  smtpPort?: number;
  testOnly?: boolean;
  subject?: string;
  bodyTemplate?: string;
  recipients?: Array<{
    name: string;
    email: string;
    course: string;
    issueDate: string;
    verifyUrl: string;
    pdfBase64?: string;
    filename?: string;
  }>;
}

function createTransporter(senderEmail: string, senderPassword: string, smtpHost?: string, smtpPort?: number) {
  const cleanEmail = senderEmail.trim();
  const cleanPassword = senderPassword.trim().replace(/\s+/g, ""); // Remove spaces (crucial for Google 4x4 app passwords)

  const isGmail =
    (smtpHost && smtpHost.toLowerCase().includes("gmail")) ||
    cleanEmail.toLowerCase().endsWith("@gmail.com") ||
    cleanEmail.toLowerCase().endsWith("@googlemail.com");

  if (isGmail) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: cleanEmail,
        pass: cleanPassword,
      },
    });
  }

  const port = Number(smtpPort) || 587;
  return nodemailer.createTransport({
    host: smtpHost || "smtp.gmail.com",
    port,
    secure: port === 465,
    auth: {
      user: cleanEmail,
      pass: cleanPassword,
    },
    tls: {
      rejectUnauthorized: false, // Prevents TLS certificate mismatch errors
    },
  });
}

function formatFriendlyError(errMessage: string, email: string): string {
  if (
    errMessage.includes("535") ||
    errMessage.includes("Invalid login") ||
    errMessage.includes("Username and Password not accepted") ||
    errMessage.includes("BadCredentials")
  ) {
    return `Login failed for ${email}. Gmail and other providers require an "App Password" rather than your regular account password. For Gmail: 1) Turn on 2-Step Verification 2) Go to myaccount.google.com/apppasswords 3) Generate an App Password for "Mail" 4) Paste the 16-character code.`;
  }
  if (errMessage.includes("ETIMEDOUT") || errMessage.includes("ECONNREFUSED")) {
    return `Connection timed out or refused. Please check your SMTP host, port, or internet connection.`;
  }
  return errMessage;
}

export async function POST(req: NextRequest) {
  try {
    const body: SendCertificatesRequest = await req.json();

    const {
      senderEmail,
      senderPassword,
      smtpHost,
      smtpPort,
      testOnly,
      subject = "Your Certificate is Ready",
      bodyTemplate = "Hi {{recipient_name}},\n\nYour certificate for {{course_name}} is ready.\n\nVerify: {{verify_url}}",
      recipients = [],
    } = body;

    if (!senderEmail || !senderPassword) {
      return NextResponse.json(
        { error: "Please enter your sender email address and password / app password." },
        { status: 400 }
      );
    }

    const transporter = createTransporter(senderEmail, senderPassword, smtpHost, smtpPort);

    // Verify SMTP credentials
    try {
      await transporter.verify();
    } catch (verifyError: any) {
      const friendly = formatFriendlyError(verifyError.message || String(verifyError), senderEmail);
      return NextResponse.json({ error: friendly }, { status: 400 });
    }

    // If only testing connection, return success right away!
    if (testOnly) {
      return NextResponse.json({
        success: true,
        message: `Connected successfully to ${senderEmail.trim()}! SMTP credentials are valid.`,
      });
    }

    // Filter valid recipients
    const validRecipients = recipients.filter(
      (r) => r.email && r.email.trim().includes("@")
    );

    if (validRecipients.length === 0) {
      return NextResponse.json(
        {
          error: "None of the selected recipients have an email address. Please make sure your CSV contains an Email column mapped in Step 2.",
        },
        { status: 400 }
      );
    }

    const results: Array<{ email: string; success: boolean; error?: string }> = [];

    for (const recipient of validRecipients) {
      const recipientName = recipient.name || "Recipient";
      const courseName = recipient.course || "Course";
      const issueDate = recipient.issueDate || new Date().toISOString().split("T")[0];
      const verifyUrl = recipient.verifyUrl || "";

      const personalizedBody = bodyTemplate
        .replace(/\{\{recipient_name\}\}/g, recipientName)
        .replace(/\{\{course_name\}\}/g, courseName)
        .replace(/\{\{verify_url\}\}/g, verifyUrl)
        .replace(/\{\{issue_date\}\}/g, issueDate);

      const personalizedSubject = subject
        .replace(/\{\{recipient_name\}\}/g, recipientName)
        .replace(/\{\{course_name\}\}/g, courseName);

      const attachments: any[] = [];
      if (recipient.pdfBase64 && recipient.pdfBase64.length > 50) {
        attachments.push({
          filename: recipient.filename || `${recipientName.replace(/[^a-z0-9]/gi, "_")}_Certificate.pdf`,
          content: Buffer.from(recipient.pdfBase64, "base64"),
          contentType: "application/pdf",
        });
      }

      try {
        await transporter.sendMail({
          from: `"Certify Studio" <${senderEmail.trim()}>`,
          to: recipient.email.trim(),
          subject: personalizedSubject,
          text: personalizedBody,
          html: `<div style="font-family: sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <p style="white-space: pre-wrap; margin: 0 0 20px 0;">${personalizedBody.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
            ${
              verifyUrl
                ? `<div style="margin: 20px 0;">
                    <a href="${verifyUrl}" style="background-color: #2563eb; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View & Verify Certificate</a>
                   </div>`
                : ""
            }
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="font-size: 11px; color: #64748b; margin: 0;">Verified and dispatched via Certify Studio</p>
          </div>`,
          attachments,
        });
        results.push({ email: recipient.email, success: true });
      } catch (sendError: any) {
        results.push({
          email: recipient.email,
          success: false,
          error: sendError.message || "Failed to deliver email",
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    return NextResponse.json({
      success: true,
      successCount,
      failCount,
      results,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "An unexpected error occurred while sending emails." },
      { status: 500 }
    );
  }
}
