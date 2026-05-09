from django.core.mail import send_mail
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

def send_welcome_email(user):
    try:
        send_mail(
            subject="Bienvenue chez MALICHOU ",
            message=f"""
Bonjour {user.username},

Bienvenue chez MALICHOU ! Votre compte a été créé avec succès.

À bientôt,
L'équipe MALICHOU
            """,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=True,
        )
    except Exception as e:
        logger.error(f"Email error: {e}")


def send_new_user_notification(user):
    try:
        send_mail(
            subject=f"[MALICHOU] Nouvel utilisateur : {user.username}",
            message=f"""
Nouvel utilisateur : {user.username} — {user.email}
            """,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.ADMIN_EMAIL],
            fail_silently=True,
        )
    except Exception as e:
        logger.error(f"Email error: {e}")


def send_contact_email(name, email, subject, message):
    try:
        send_mail(
            subject=f"[MALICHOU Contact] {subject}",
            message=f"""
Nom : {name}
Email : {email}
Sujet : {subject}

Message :
{message}
            """,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.ADMIN_EMAIL],
            fail_silently=True,
        )
        send_mail(
            subject="[MALICHOU] Votre message a bien été reçu",
            message=f"""
Bonjour {name},

Nous avons bien reçu votre message. Notre équipe vous répondra dans les 24h.

À bientôt,
L'équipe MALICHOU
            """,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=True,
        )
    except Exception as e:
        logger.error(f"Email error: {e}")


def send_order_confirmation(order):
    try:
        items_text = "\n".join([
            f"  - {item.quantity}x {item.product.name} (Taille: {item.size}) — {item.subtotal} FCFA"
            for item in order.items.all()
        ])
        try:
            phone = order.user.profile.phone or 'Non renseigné'
        except:
            phone = 'Non renseigné'

        send_mail(
            subject=f"[MALICHOU] Confirmation commande #{order.id}",
            message=f"""
Bonjour {order.user.username},

Votre commande #{order.id} a bien été enregistrée !

Articles :
{items_text}

Total : {order.total} FCFA
Adresse : {order.address}
Téléphone : {phone}
Mode paiement : {order.get_payment_method_display()}

Merci pour votre confiance,
L'équipe MALICHOU
            """,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[order.user.email],
            fail_silently=True,
        )
    except Exception as e:
        logger.error(f"Email error: {e}")


def send_order_notification_admin(order):
    try:
        items_text = "\n".join([
            f"  - {item.quantity}x {item.product.name} (Taille: {item.size}) — {item.subtotal} FCFA"
            for item in order.items.all()
        ])
        try:
            phone = order.user.profile.phone or 'Non renseigné'
        except:
            phone = 'Non renseigné'

        send_mail(
            subject=f"[MALICHOU] Nouvelle commande #{order.id} — {order.total} FCFA",
            message=f"""
Nouvelle commande reçue !

━━━━━━━━━━━━━━━━━━━━━━
CLIENT
━━━━━━━━━━━━━━━━━━━━━━
Nom       : {order.user.username}
Email     : {order.user.email}
Téléphone : {phone}

━━━━━━━━━━━━━━━━━━━━━━
COMMANDE #{order.id}
━━━━━━━━━━━━━━━━━━━━━━
{items_text}

Total         : {order.total} FCFA
Mode paiement : {order.get_payment_method_display()}
Adresse       : {order.address}
            """,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.ADMIN_EMAIL],
            fail_silently=True,
        )
    except Exception as e:
        logger.error(f"Email error: {e}")