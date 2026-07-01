import smtplib
from email.message import EmailMessage

from cryptography.fernet import Fernet
from sqlalchemy import text
from sqlalchemy.orm import Session


class EmailService:

    @staticmethod
    def send_redemption_notification(
        db: Session,
        user_name: str,
        user_email: str,
        swag_item_name: str,
        points_spent: int,
    ):
        """
        Sends redemption notification email to HR/Operations.
        Email credentials are fetched from emailidconfiguration table.
        """

        config = db.execute(
            text("""
                SELECT
                    emailid,
                    emailhost,
                    emailport,
                    emailpasswordkey,
                    emailpasswordcode,
                    emailusetls
                FROM mm_portal.emailidconfiguration
                LIMIT 1
            """)
        ).mappings().first()

        if not config:
            raise Exception("Email configuration not found.")

        cipher_suite = Fernet(config["emailpasswordkey"].encode())
        password = cipher_suite.decrypt(
            config["emailpasswordcode"].encode()
        ).decode()

        msg = EmailMessage()

        msg["Subject"] = "New Swag Redemption Request"
        msg["From"] = config["emailid"]

        # Change this to the HR email in production
        msg["To"] = config["emailid"]

        msg.set_content(
            f"""
A new swag redemption has been placed.

User Name:
{user_name}

Email:
{user_email}

Item:
{swag_item_name}

Points Spent:
{points_spent}

Please process the redemption.
"""
        )

        server = smtplib.SMTP(
            config["emailhost"],
            config["emailport"],
        )

        if config["emailusetls"]:
            server.starttls()

        server.login(
            config["emailid"],
            password,
        )

        server.send_message(msg)

        server.quit()