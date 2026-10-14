import { Resend } from "resend";

const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || "1293765440487217";
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || "";
const WHATSAPP_TEMPLATE_NAME = process.env.WHATSAPP_TEMPLATE_NAME || "otp";

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_key");

/**
 * Sends a WhatsApp OTP Message using Meta Cloud API v20.0
 */
export async function sendWhatsAppOtp(phone, otpCode) {
  // Format phone number to E.164 without + sign
  const formattedPhone = phone.replace(/\D/g, "");
  const recipient = formattedPhone.length === 10 ? `91${formattedPhone}` : formattedPhone;

  console.log(`[WhatsApp OTP Service] Attempting to send OTP ${otpCode} to +${recipient}`);

  if (!WHATSAPP_ACCESS_TOKEN || WHATSAPP_ACCESS_TOKEN === "YOUR_META_ACCESS_TOKEN") {
    console.warn(`[WhatsApp API Warning] WHATSAPP_ACCESS_TOKEN is not configured. Demo Mode OTP code for +${recipient} is: ${otpCode}`);
    return { success: true, mode: "demo", recipient, code: otpCode };
  }

  const endpoint = `https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

  const payload = {
    messaging_product: "whatsapp",
    to: recipient,
    type: "template",
    template: {
      name: WHATSAPP_TEMPLATE_NAME,
      language: { code: "en_US" },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: otpCode }
          ]
        },
        {
          type: "button",
          sub_type: "url",
          index: "0",
          parameters: [
            { type: "text", text: otpCode }
          ]
        }
      ]
    }
  };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[WhatsApp Meta API Error]:", data);
      // If template with button fails, retry with body parameter only
      const fallbackPayload = {
        messaging_product: "whatsapp",
        to: recipient,
        type: "template",
        template: {
          name: WHATSAPP_TEMPLATE_NAME,
          language: { code: "en_US" },
          components: [
            {
              type: "body",
              parameters: [{ type: "text", text: otpCode }]
            }
          ]
        }
      };

      const fallbackRes = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(fallbackPayload)
      });
      const fallbackData = await fallbackRes.json();
      if (!fallbackRes.ok) {
        throw new Error(fallbackData.error?.message || "Meta WhatsApp API Error");
      }
      return { success: true, data: fallbackData };
    }

    return { success: true, data };
  } catch (err) {
    console.error("[WhatsApp Send Exception]:", err.message);
    // Fallback gracefully so login flow remains functional
    return { success: true, mode: "fallback", error: err.message, code: otpCode };
  }
}

/**
 * Sends an Email OTP using Resend API
 */
export async function sendEmailOtp(email, otpCode) {
  console.log(`[Resend Email OTP Service] Attempting to send OTP ${otpCode} to ${email}`);

  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "re_demo_key") {
    console.warn(`[Resend API Warning] RESEND_API_KEY not set. Demo OTP code for ${email} is: ${otpCode}`);
    return { success: true, mode: "demo", email, code: otpCode };
  }

  try {
    const data = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "LokKart Guild <onboarding@resend.dev>",
      to: [email],
      subject: `${otpCode} is your LokKart Verification Code`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; padding: 24px; border: 1px solid #e4e4e0; border-radius: 8px;">
          <h2 style="color: #1c1e29; margin-top: 0;">LokKart Artisan Guild Authentication</h2>
          <p style="color: #8a8a86; font-size: 14px;">Your verification OTP code for logging into your seller account is:</p>
          <div style="background-color: #f3f3f0; font-size: 28px; font-weight: bold; letter-spacing: 4px; text-align: center; padding: 16px; border-radius: 6px; margin: 20px 0; color: #1c1e29;">
            ${otpCode}
          </div>
          <p style="color: #8a8a86; font-size: 12px;">This verification code is valid for 10 minutes. Do not share it with anyone.</p>
        </div>
      `,
    });
    return { success: true, data };
  } catch (err) {
    console.error("[Resend Email Error]:", err.message);
    return { success: true, mode: "fallback", error: err.message, code: otpCode };
  }
}
