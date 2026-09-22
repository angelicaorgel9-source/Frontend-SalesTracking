from django.conf import settings


def send_login_code(phone, code):
    try:
        from twilio.rest import Client
    except ImportError as error:
        raise RuntimeError('Twilio is not installed. Run .venv\\Scripts\\python.exe -m pip install -r backend\\requirements.txt.') from error
    if not settings.TWILIO_ACCOUNT_SID or not settings.TWILIO_AUTH_TOKEN or not settings.TWILIO_PHONE_NUMBER:
        raise RuntimeError('SMS is not configured. Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER to .env.')
    Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN).messages.create(
        body=f'MJ Prints verification code: {code}. It expires in 10 minutes.',
        from_=settings.TWILIO_PHONE_NUMBER,
        to=phone,
    )