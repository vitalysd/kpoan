import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    try {
        const formData = await request.formData();

        const name = formData.get('name') as string;
        const company = formData.get('company') as string;
        const phone = formData.get('phone') as string;
        const email = formData.get('email') as string;
        const message = formData.get('message') as string;
        const file = formData.get('file') as File | null;

        if (!name || !company || !phone || !email) {
            return NextResponse.json({ error: 'Заполните обязательные поля' }, { status: 400 });
        }

        // Подготавливаем вложение, если есть файл
        const attachments = file
            ? [
                {
                    filename: file.name,
                    content: Buffer.from(await file.arrayBuffer()),
                },
            ]
            : undefined;

        await resend.emails.send({
            from: 'Сайт <info@kpoan.ru>', // Можно изменить на свой домен после верификации в Resend
            to: ['info@kpoan.ru'], // Замени на свой email, куда приходят заявки
            subject: `Новая заявка от ${name} (${company})`,
            html: `
        <h2>Новая заявка с сайта</h2>
        <p><strong>Имя:</strong> ${name}</p>
        <p><strong>Компания:</strong> ${company}</p>
        <p><strong>Телефон:</strong> ${phone}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Сообщение:</strong><br>${message || '—'}</p>
        ${file ? `<p><strong>Прикреплен файл:</strong> ${file.name}</p>` : ''}
      `,
            attachments,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Ошибка отправки email:', error);
        return NextResponse.json({ error: 'Ошибка отправки. Попробуйте позже.' }, { status: 500 });
    }
}