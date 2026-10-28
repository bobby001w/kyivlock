// Cloudflare Pages Function: POST /api/lead — приймає заявку з форми і надсилає в Telegram (+ e-mail через Resend, опційно).
// Змінні середовища (Cloudflare Pages → Settings → Environment variables):
//   TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID — обов'язково
//   RESEND_API_KEY, LEAD_EMAIL_TO, LEAD_EMAIL_FROM — опційно, дубль заявки на e-mail
// Антиспам: honeypot-поле `website`, мінімальний час заповнення 2 с, валідація телефону, обмеження довжини полів.

interface Env { TELEGRAM_BOT_TOKEN: string; TELEGRAM_CHAT_ID: string; RESEND_API_KEY?: string; LEAD_EMAIL_TO?: string; LEAD_EMAIL_FROM?: string }

const clip = (v: FormDataEntryValue | null, n = 120) => String(v ?? '').replace(/[<>]/g, '').trim().slice(0, n);

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const wantsJson = (request.headers.get('Accept') || '').includes('application/json');
  const done = (ok: boolean, status = 200) =>
    wantsJson
      ? new Response(JSON.stringify({ ok }), { status, headers: { 'Content-Type': 'application/json' } })
      : Response.redirect(new URL(ok ? '/dyakuiemo/' : '/kontakty/', request.url).toString(), 303);

  let data: FormData;
  try { data = await request.formData(); } catch { return done(false, 400); }

  // Бот заповнив приховане поле або надіслав форму миттєво — тихо «приймаємо», нічого не надсилаючи.
  const ts = Number(data.get('ts') || 0);
  if (clip(data.get('website'))) return done(true);
  if (ts && Date.now() - ts < 2000) return done(true);

  const phone = clip(data.get('phone'), 30);
  if (phone.replace(/\D/g, '').length < 10) return done(false, 422);

  const lead = {
    phone,
    name: clip(data.get('name'), 60),
    place: clip(data.get('place'), 80),
    car: clip(data.get('car'), 80),
    situation: clip(data.get('situation'), 120),
    form: clip(data.get('form'), 20),
    page: clip(data.get('page'), 200),
  };
  const text = [
    `🔔 Нова заявка KyivLock${lead.form === 'ignition' ? ' (ключі запалювання)' : ''}`,
    `📞 ${lead.phone}`,
    lead.name && `👤 ${lead.name}`,
    lead.place && `📍 ${lead.place}`,
    lead.car && `🚗 ${lead.car}`,
    lead.situation && `❓ ${lead.situation}`,
    `🔗 ${lead.page}`,
  ].filter(Boolean).join('\n');

  const jobs: Promise<Response>[] = [
    fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text, disable_web_page_preview: true }),
    }),
  ];
  if (env.RESEND_API_KEY && env.LEAD_EMAIL_TO)
    jobs.push(fetch('https://api.resend.com/emails', {
      method: 'POST', headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: env.LEAD_EMAIL_FROM || 'KyivLock <noreply@kyivlock.com.ua>', to: env.LEAD_EMAIL_TO, subject: `Заявка: ${lead.phone}`, text }),
    }));

  const res = await Promise.allSettled(jobs);
  const ok = res.some((r) => r.status === 'fulfilled' && r.value.ok);
  return done(ok, ok ? 200 : 502);
};
