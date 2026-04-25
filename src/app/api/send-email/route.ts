import { Resend } from 'resend';
import { NextResponse } from 'next/server';

// --- Rate limiting (in-memory, простой счётчик по IP) ---
// Для production рекомендуется использовать Redis/Upstash
type RateLimitEntry = { count: number; resetAt: number };
const rateLimitMap = new Map<string, RateLimitEntry>();

const RATE_LIMIT_MAX = 5; // максимум запросов
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 час

function getIpFromRequest(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  );
}

function isAllowedOrigin(origin: string, host: string): boolean {
  try {
    const originUrl = new URL(origin);
    return originUrl.host === host;
  } catch {
    return false;
  }
}

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }

  entry.count += 1;
  if (entry.count > RATE_LIMIT_MAX) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  return { allowed: true };
}

// Очистка старых записей каждые 10 минут
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap.entries()) {
    if (now > entry.resetAt) rateLimitMap.delete(ip);
  }
}, 10 * 60 * 1000);

// --- HTML-экранирование для защиты от XSS ---
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// --- Валидация файла по расширению и размеру ---
const ALLOWED_EXTENSIONS = new Set([
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png', '.webp',
]);
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

function getFileExtension(filename: string): string {
  const dotIndex = filename.lastIndexOf('.');
  return dotIndex >= 0 ? filename.substring(dotIndex).toLowerCase() : '';
}

function validateFile(file: File): string | null {
  // Проверяем расширение, а не клиентский MIME-тип
  const ext = getFileExtension(file.name);
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return `Недопустимый тип файла: ${ext || 'без расширения'}. Разрешены: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, WEBP.`;
  }
  if (file.size > MAX_FILE_SIZE) {
    return `Файл слишком большой (${(file.size / 1024 / 1024).toFixed(1)} МБ). Максимум 10 МБ.`;
  }
  return null;
}

// --- Инициализация Resend ---
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    // Origin check — простая защита от CSRF
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    if (origin && host && !isAllowedOrigin(origin, host)) {
      return NextResponse.json(
        { error: 'Запрос отклонён (origin mismatch)' },
        { status: 403 },
      );
    }

    // Rate limiting
    const ip = getIpFromRequest(request);
    const limitCheck = checkRateLimit(ip);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { error: `Слишком много запросов. Попробуйте через ${limitCheck.retryAfter} сек.` },
        { status: 429 },
      );
    }

    const formData = await request.formData();

    const name = formData.get('name') as string | null;
    const company = formData.get('company') as string | null;
    const phone = formData.get('phone') as string | null;
    const email = formData.get('email') as string | null;
    const message = formData.get('message') as string | null;
    const file = formData.get('file') as File | null;

    // Валидация обязательных полей
    if (!name || !company || !phone || !email) {
      return NextResponse.json(
        { error: 'Заполните обязательные поля' },
        { status: 400 },
      );
    }

    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Некорректный email адрес' },
        { status: 400 },
      );
    }

    // Honeypot — CSRF-защита (скрытое поле)
    const honeypot = formData.get('website') as string | null;
    if (honeypot) {
      return NextResponse.json({ success: true });
    }

    // Валидация файла на сервере
    if (file && file.size > 0) {
      const fileError = validateFile(file);
      if (fileError) {
        return NextResponse.json({ error: fileError }, { status: 400 });
      }
    }

    // HTML-экранирование всех пользовательских данных
    const safeName = escapeHtml(name);
    const safeCompany = escapeHtml(company);
    const safePhone = escapeHtml(phone);
    const safeEmail = escapeHtml(email);
    const safeMessage = message ? escapeHtml(message) : '—';
    const safeFileName = file?.name ? escapeHtml(file.name) : null;

    // Экранирование subject (на случай если email-провайдер рендерит HTML)
    const safeSubjectName = escapeHtml(name);
    const safeSubjectCompany = escapeHtml(company);

    const attachments =
      file && file.size > 0
        ? [
            {
              filename: file.name,
              content: Buffer.from(await file.arrayBuffer()),
            },
          ]
        : undefined;

    await resend.emails.send({
      from: 'Сайт <info@kpoan.ru>',
      to: ['info@kpoan.ru'],
      subject: `Новая заявка от ${safeSubjectName} (${safeSubjectCompany})`,
      html: `
        <h2>Новая заявка с сайта</h2>
        <p><strong>Имя:</strong> ${safeName}</p>
        <p><strong>Компания:</strong> ${safeCompany}</p>
        <p><strong>Телефон:</strong> ${safePhone}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Сообщение:</strong><br>${safeMessage}</p>
        ${safeFileName ? `<p><strong>Прикреплён файл:</strong> ${safeFileName}</p>` : ''}
      `,
      attachments,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Ошибка отправки email:', error);
    }
    return NextResponse.json(
      { error: 'Ошибка отправки. Попробуйте позже.' },
      { status: 500 },
    );
  }
}
