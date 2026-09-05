import requests
from django.conf import settings
from django.core.mail.backends.base import BaseEmailBackend


class BrevoAPIBackend(BaseEmailBackend):
    """Envoie les emails via l'API HTTP de Brevo (pas SMTP) — evite les ports
    SMTP sortants souvent bloques par les hebergeurs gratuits (Render inclus)."""

    API_URL = "https://api.brevo.com/v3/smtp/email"

    def send_messages(self, email_messages):
        if not email_messages:
            return 0

        sent = 0
        for message in email_messages:
            payload = {
                "sender": {"email": message.from_email},
                "to": [{"email": addr} for addr in message.to],
                "subject": message.subject,
                "textContent": message.body,
            }

            try:
                response = requests.post(
                    self.API_URL,
                    json=payload,
                    headers={
                        "api-key": settings.BREVO_API_KEY,
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                    },
                    timeout=15,
                )
                if response.status_code in (200, 201):
                    sent += 1
                elif not self.fail_silently:
                    raise RuntimeError(
                        f"Brevo API error {response.status_code}: {response.text}"
                    )
            except Exception:
                if not self.fail_silently:
                    raise

        return sent
