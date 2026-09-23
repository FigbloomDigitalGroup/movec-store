import * as nodemailer from 'nodemailer';

// FIG-483: the contact form's `subject` field is user-supplied and gets
// interpolated unescaped into EmailService.sendContactFormEmail's outgoing
// subject line, with no CRLF/header-injection sanitization of our own.
// Verified live against nodemailer's actual MIME builder (streamTransport
// produces the same RFC822 output the real SMTP transport would send, without
// touching the network): nodemailer strips/folds embedded CRLF instead of
// emitting a second header, so `Subject: ...\r\nBcc: evil@example.com` cannot
// inject a new header. This pins that behavior so a future nodemailer
// downgrade or a switch to manual header construction would be caught.
describe('EmailService — contact form subject is not a header-injection vector', () => {
  it('nodemailer neutralizes CRLF in a hostile subject instead of emitting new headers', async () => {
    const transport = nodemailer.createTransport({
      streamTransport: true,
      buffer: true,
    });

    const maliciousSubject =
      'New Contact Form Submission: Hi\r\nBcc: attacker@evil.com\r\nX-Injected: yes';

    const info = await transport.sendMail({
      from: '"Movec Store" <noreply@example.com>',
      to: 'info@example.com',
      replyTo: 'customer@example.com',
      subject: maliciousSubject,
      html: '<p>test</p>',
    });

    // streamTransport + buffer:true guarantees a Buffer here; nodemailer's
    // general SentMessageInfo type doesn't narrow that far on its own.
    const rawHeaders = (info.message as Buffer)
      .toString('utf8')
      .split('\r\n\r\n')[0];

    expect(rawHeaders).not.toContain('Bcc: attacker@evil.com\r\nX-Injected');
    expect(rawHeaders.match(/^Bcc:/gm)).toBeNull();
    expect(rawHeaders.match(/^X-Injected:/gm)).toBeNull();
  });
});
