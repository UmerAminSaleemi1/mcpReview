# Phase 5 launch checklist

## Resend and controlled delivery

- Verify the sending domain or subdomain in Resend before using it for production mail.
- Add the exact DNS records Resend provides, then confirm the sender address is verified.
- Keep live transactional mail deferred until the owner explicitly authorizes a real send.
- Test delivery only to inboxes the owner controls. Do not send to broader public or unsolicited recipients.
- Prefer a staging or test domain with controlled recipients before production use.
- Record the final sender address used for each environment and keep the delivery logs in a monitored operational place.

## email worker and retry policy

- Keep the email worker disabled by default until valid Resend configuration is present.
- Persist submission and moderation records even when provider delivery is disabled or fails.
- Treat mail send as a bounded retry job, not as a guarantee. Do not silently mark a message as sent without a successful provider response.
- Keep retry attempts bounded and deduplicated per message identity.
- Do not send duplicate emails when a retry runs after a temporary provider error.

## Turnstile and protections

- Keep the Cloudflare Turnstile server secret in the server environment only.
- Keep the public site key in the browser bundle only.
- Maintain separate widget instances without weakening the CAPTCHA challenge or validation path.
- Reject invalid or missing CAPTCHA tokens before creating a moderation record.

## Final launch gate

Do not start Phase 5 production launch work until the owner has verified:

1. the domain used for `EMAIL_FROM` is authenticated in Resend,
2. the production or staging hostnames are allowed in Turnstile,
3. the app can send to a controlled inbox without exposing moderation details,
4. failed provider delivery does not lose the original submission and that retries stay deduplicated.
