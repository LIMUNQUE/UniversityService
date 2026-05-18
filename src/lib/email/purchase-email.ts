import { formatCurrency } from "@/lib/currency";

type PurchasedProgram = {
  code: string;
  price_cents: number;
  title: string;
};

type PurchaseEmailInput = {
  email: string;
  externalId: string;
  programs: PurchasedProgram[];
  provider: string;
  totalCents: number;
};

type EmailResult = {
  message: string;
  sent: boolean;
};

function renderProgramRows(programs: PurchasedProgram[]) {
  return programs
    .map(
      (program) => `
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
            <strong>${program.code}</strong><br />
            <span>${program.title}</span>
          </td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
            ${formatCurrency(program.price_cents)}
          </td>
        </tr>
      `
    )
    .join("");
}

export async function sendPurchaseEmail(input: PurchaseEmailInput): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL ?? "UniversityService <onboarding@resend.dev>";

  if (!apiKey) {
    return {
      sent: false,
      message: "RESEND_API_KEY no esta configurado. La compra se completo, pero no se envio correo real."
    };
  }

  const html = `
    <div style="font-family: Arial, sans-serif; color: #17211d; line-height: 1.6;">
      <h1 style="margin-bottom: 4px;">Compra completada</h1>
      <p style="margin-top: 0; color: #66716b;">Tus cursos ya fueron inscritos en el portal academico.</p>
      <p><strong>Pasarela:</strong> ${input.provider}</p>
      <p><strong>Referencia:</strong> ${input.externalId}</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tbody>${renderProgramRows(input.programs)}</tbody>
      </table>
      <p style="font-size: 18px;"><strong>Total:</strong> ${formatCurrency(input.totalCents)}</p>
      <p style="color: #66716b;">Puedes entrar a tu dashboard para acceder a los cursos inscritos.</p>
    </div>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    body: JSON.stringify({
      from,
      html,
      subject: "Confirmacion de compra de cursos",
      text: `Compra completada (${input.externalId}). Total: ${formatCurrency(input.totalCents)}.`,
      to: input.email
    }),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    method: "POST"
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    return {
      sent: false,
      message: detail || `Resend respondio HTTP ${response.status}.`
    };
  }

  return {
    sent: true,
    message: `Correo enviado a ${input.email}.`
  };
}
