from django.core.mail import send_mail
from django.conf import settings


def send_welcome_email(user):
    send_mail(
        subject="Bienvenue chez MALICHOU 🎉",
        message=f"""
Bonjour {user.username},

Bienvenue chez MALICHOU ! Votre compte a été créé avec succès.

Vous pouvez maintenant :
- Parcourir notre catalogue de lingerie
- Ajouter des articles à votre panier
- Passer des commandes

À bientôt sur MALICHOU !
        """,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=True,
    )


def send_new_user_notification(user):
    send_mail(
        subject=f"[MALICHOU] Nouvel utilisateur : {user.username}",
        message=f"""
Nouvel utilisateur inscrit sur MALICHOU :

- Nom d'utilisateur : {user.username}
- Email : {user.email}
- Date : maintenant

Connectez-vous à l'admin pour voir les détails.
        """,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[settings.ADMIN_EMAIL],
        fail_silently=True,
    )


def send_contact_email(name, email, subject, message):
    send_mail(
        subject=f"[MALICHOU Contact] {subject}",
        message=f"""
Nouveau message de contact reçu :

- Nom : {name}
- Email : {email}
- Sujet : {subject}

Message :
{message}

---
Répondre directement à : {email}
        """,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[settings.ADMIN_EMAIL],
        fail_silently=True,
    )

    send_mail(
        subject="[MALICHOU] Votre message a bien été reçu",
        message=f"""
Bonjour {name},

Nous avons bien reçu votre message concernant : "{subject}"

Notre équipe vous répondra dans les 24h.

À bientôt,
L'équipe MALICHOU
        """,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
        fail_silently=True,
    )


def send_order_confirmation(order):
    items_text = "\n".join([
        f"  - {item.quantity}x {item.product.name} (Taille: {item.size}) — {item.subtotal} FCFA"
        for item in order.items.all()
    ])

    # Récupérer le téléphone
    try:
        phone = order.user.profile.phone or 'Non renseigné'
    except:
        phone = 'Non renseigné'

    send_mail(
        subject=f"[MALICHOU] Confirmation de votre commande #{order.id}",
        message=f"""
Bonjour {order.user.username},

Votre commande #{order.id} a bien été enregistrée !

Articles commandés :
{items_text}

Total : {order.total} FCFA
Adresse de livraison : {order.address}
Mode de paiement : {order.get_payment_method_display()}
Statut : En attente de traitement

Merci pour votre confiance,
L'équipe MALICHOU
        """,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[order.user.email],
        fail_silently=True,
    )


def send_order_notification_admin(order):
    items_text = "\n".join([
        f"  - {item.quantity}x {item.product.name} (Taille: {item.size}) — {item.subtotal} FCFA"
        for item in order.items.all()
    ])

    # Récupérer le téléphone
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

Total           : {order.total} FCFA
Mode paiement   : {order.get_payment_method_display()}
Adresse         : {order.address}

━━━━━━━━━━━━━━━━━━━━━━
Connectez-vous à l'admin pour traiter cette commande.
http://127.0.0.1:8000/admin/store/order/
        """,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[settings.ADMIN_EMAIL],
        fail_silently=True,
    )