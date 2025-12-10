import app from '@launchql/knative-job-fn';
import { send } from '@launchql/postmaster';

type SimpleEmailPayload = {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const getRequiredField = (
  payload: SimpleEmailPayload,
  field: keyof SimpleEmailPayload
) => {
  const value = payload[field];
  if (!isNonEmptyString(value)) {
    throw new Error(`Missing required field '${String(field)}'`);
  }
  return value;
};

app.post('*', async (req: any, res: any, next: any) => {
  try {
    const payload = (req.body || {}) as SimpleEmailPayload;

    const to = getRequiredField(payload, 'to');
    const subject = getRequiredField(payload, 'subject');

    const html = isNonEmptyString(payload.html) ? payload.html : undefined;
    const text = isNonEmptyString(payload.text) ? payload.text : undefined;

    if (!html && !text) {
      throw new Error("Either 'html' or 'text' must be provided");
    }

    const from = isNonEmptyString(payload.from) ? payload.from : undefined;
    const replyTo = isNonEmptyString(payload.replyTo)
      ? payload.replyTo
      : undefined;

    const { MAILGUN_API_KEY, MAILGUN_DOMAIN, MAILGUN_FROM } = process.env;

    if (!MAILGUN_API_KEY || !MAILGUN_DOMAIN || !MAILGUN_FROM) {
      // Do not fail the job if Mailgun config is missing; just log and return a marker.
      // This keeps the function safe to run in environments without Mailgun.
      // Worker will see HTTP 200 and treat the job as handled.
      // eslint-disable-next-line no-console
      console.warn(
        '[simple-email] Missing Mailgun configuration, skipping send',
        {
          hasApiKey: Boolean(MAILGUN_API_KEY),
          hasDomain: Boolean(MAILGUN_DOMAIN),
          hasFrom: Boolean(MAILGUN_FROM)
        }
      );
      return res.status(200).json({
        complete: false,
        skipped: 'missing_mailgun_env'
      });
    }

    // Log the email being sent (without full body for safety)
    // eslint-disable-next-line no-console
    console.log('[simple-email] sending email', {
      to,
      subject,
      from: from ?? MAILGUN_FROM,
      replyTo,
      hasHtml: Boolean(html),
      hasText: Boolean(text)
    });

    await send({
      to,
      subject,
      html,
      text,
      ...(from ? { from } : {}),
      ...(replyTo ? { replyTo } : {})
    });

    res.status(200).json({ complete: true });
  } catch (err) {
    next(err);
  }
});

export default app;
