import app from '@launchql/knative-job-fn';

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

    // Log the email (dry-run mode, no actual send)
    // eslint-disable-next-line no-console
    console.log('[simple-email] DRY RUN email', {
      to,
      subject,
      from,
      replyTo,
      hasHtml: Boolean(html),
      hasText: Boolean(text)
    });

    // Optionally also log the full payload (for debugging)
    // eslint-disable-next-line no-console
    console.log('[simple-email] DRY RUN payload', payload);

    res.status(200).json({ complete: true });
  } catch (err) {
    next(err);
  }
});

export default app;

// When executed directly (e.g. `node dist/index.js` in Knative),
// start an HTTP server on the provided PORT (default 8080).
if (require.main === module) {
  const port = Number(process.env.PORT ?? 8080);
  // @launchql/knative-job-fn exposes a .listen method that delegates to the underlying Express app
  (app as any).listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`[simple-email] listening on port ${port}`);
  });
}
