import os
import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

logger = logging.getLogger("riftaffinity.email")

def send_match_emails(user1_dict: dict, user2_dict: dict):
    """
    Envoie un e-mail de notification de Match aux deux joueurs.
    Si les identifiants SMTP ne sont pas configurés dans .env, simule et journalise l'envoi.
    """
    smtp_host = os.getenv("SMTP_HOST", "")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER", "")
    smtp_password = os.getenv("SMTP_PASSWORD", "")
    sender_email = os.getenv("SENDER_EMAIL", smtp_user or "match@riftaffinity.app")

    u1_name = f"{user1_dict.get('gameName')}#{user1_dict.get('tagLine')}"
    u2_name = f"{user2_dict.get('gameName')}#{user2_dict.get('tagLine')}"

    # Contenu de l'e-mail pour l'utilisateur 1
    subject_1 = f"💖 C'est un Match sur RiftAffinity ! Vous avez matché avec {u2_name}"
    body_html_1 = f"""
    <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #080912; color: #ffffff; padding: 24px; border-radius: 16px; border: 1px solid #00f0ff;">
      <h2 style="color: #ff2a85; text-align: center;">🎉 Félicitations, c'est un Match !</h2>
      <p>Bonjour,</p>
      <p>Excellente nouvelle ! Vous et <strong>{u2_name}</strong> avez indiqué vouloir jouer ensemble sur <strong>RiftAffinity</strong>.</p>
      <div style="background-color: #121528; padding: 16px; border-radius: 12px; border-left: 4px solid #00f0ff; margin: 20px 0;">
        <h4 style="margin: 0 0 8px 0; color: #00f0ff;">Détails de votre partenaire Duo :</h4>
        <p style="margin: 4px 0;">🎮 <strong>Riot ID :</strong> {u2_name}</p>
        <p style="margin: 4px 0;">✉️ <strong>Adresse E-mail :</strong> {user2_dict.get('email')}</p>
        <p style="margin: 4px 0;">🏆 <strong>Rang Solo/Duo :</strong> {user2_dict.get('rankTier', 'UNRANKED')} {user2_dict.get('rankDivision', '')}</p>
        <p style="margin: 4px 0;">⚔️ <strong>Rôle principal :</strong> {user2_dict.get('primaryRole', 'Non spécifié')}</p>
      </div>
      <p>Connectez-vous dès maintenant dans League of Legends et ajoutez votre nouveau coéquipier en ami !</p>
      <p style="text-align: center; color: #ff2a85; font-weight: bold; margin-top: 24px;">À bientôt sur la Faille de l'Invocateur ! 💖</p>
    </div>
    """

    # Contenu de l'e-mail pour l'utilisateur 2
    subject_2 = f"💖 C'est un Match sur RiftAffinity ! Vous avez matché avec {u1_name}"
    body_html_2 = f"""
    <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #080912; color: #ffffff; padding: 24px; border-radius: 16px; border: 1px solid #ff2a85;">
      <h2 style="color: #00f0ff; text-align: center;">🎉 Félicitations, c'est un Match !</h2>
      <p>Bonjour,</p>
      <p>Excellente nouvelle ! Vous et <strong>{u1_name}</strong> avez indiqué vouloir jouer ensemble sur <strong>RiftAffinity</strong>.</p>
      <div style="background-color: #121528; padding: 16px; border-radius: 12px; border-left: 4px solid #ff2a85; margin: 20px 0;">
        <h4 style="margin: 0 0 8px 0; color: #ff2a85;">Détails de votre partenaire Duo :</h4>
        <p style="margin: 4px 0;">🎮 <strong>Riot ID :</strong> {u1_name}</p>
        <p style="margin: 4px 0;">✉️ <strong>Adresse E-mail :</strong> {user1_dict.get('email')}</p>
        <p style="margin: 4px 0;">🏆 <strong>Rang Solo/Duo :</strong> {user1_dict.get('rankTier', 'UNRANKED')} {user1_dict.get('rankDivision', '')}</p>
        <p style="margin: 4px 0;">⚔️ <strong>Rôle principal :</strong> {user1_dict.get('primaryRole', 'Non spécifié')}</p>
      </div>
      <p>Connectez-vous dès maintenant dans League of Legends et ajoutez votre nouveau coéquipier en ami !</p>
      <p style="text-align: center; color: #00f0ff; font-weight: bold; margin-top: 24px;">À bientôt sur la Faille de l'Invocateur ! 💖</p>
    </div>
    """

    if smtp_host and smtp_user and smtp_password:
        try:
            with smtplib.SMTP(smtp_host, smtp_port) as server:
                server.starttls()
                server.login(smtp_user, smtp_password)

                msg1 = MIMEMultipart("alternative")
                msg1["Subject"] = subject_1
                msg1["From"] = sender_email
                msg1["To"] = user1_dict.get("email")
                msg1.attach(MIMEText(body_html_1, "html"))
                server.sendmail(sender_email, user1_dict.get("email"), msg1.as_string())

                msg2 = MIMEMultipart("alternative")
                msg2["Subject"] = subject_2
                msg2["From"] = sender_email
                msg2["To"] = user2_dict.get("email")
                msg2.attach(MIMEText(body_html_2, "html"))
                server.sendmail(sender_email, user2_dict.get("email"), msg2.as_string())

            logger.info(f"E-mails de match envoyés avec succès à {user1_dict.get('email')} et {user2_dict.get('email')}")
        except Exception as e:
            logger.error(f"Erreur d'envoi d'email SMTP: {e}")
    else:
        logger.info(f"[SIMULATION EMAIL] Match entre {u1_name} ({user1_dict.get('email')}) et {u2_name} ({user2_dict.get('email')}) - E-mails générés avec succès.")
