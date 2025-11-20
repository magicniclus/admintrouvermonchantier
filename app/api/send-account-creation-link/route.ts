import { NextRequest, NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    console.log('API SendGrid appelée pour lien création de compte');
    console.log('SENDGRID_API_KEY présente:', !!process.env.SENDGRID_API_KEY);
    
    const { email, firstName, lastName, clientId } = await request.json();
    console.log('Données reçues:', { email, firstName, lastName, clientId });

    if (!email || !firstName || !clientId) {
      console.log('Données manquantes');
      return NextResponse.json(
        { error: 'Email, prénom et clientId sont requis' },
        { status: 400 }
      );
    }

    const msg = {
      to: email,
      from: 'service@trouver-mon-chantier.fr',
      subject: 'Créez votre compte - Trouver Mon Chantier 🔐',
      html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Créez votre compte - Trouver Mon Chantier</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              background-color: #f8fafc;
              color: #334155;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
              padding: 40px 30px;
              text-align: center;
            }
            .logo {
              color: white;
              font-size: 28px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .header-subtitle {
              color: #e0e7ff;
              font-size: 16px;
            }
            .content {
              padding: 40px 30px;
            }
            .greeting {
              font-size: 24px;
              font-weight: 600;
              color: #1e293b;
              margin-bottom: 20px;
            }
            .message {
              font-size: 16px;
              line-height: 1.6;
              color: #475569;
              margin-bottom: 30px;
            }
            .cta-button {
              display: inline-block;
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              color: white;
              text-decoration: none;
              padding: 16px 32px;
              border-radius: 8px;
              font-weight: 600;
              font-size: 16px;
              text-align: center;
              transition: transform 0.2s;
            }
            .cta-button:hover {
              transform: translateY(-2px);
            }
            .reminder-box {
              margin: 30px 0;
              padding: 20px;
              background-color: #fef3c7;
              border-left: 4px solid #f59e0b;
              border-radius: 8px;
            }
            .reminder-title {
              font-weight: 600;
              color: #92400e;
              margin-bottom: 8px;
            }
            .reminder-text {
              color: #92400e;
              font-size: 14px;
            }
            .footer {
              background-color: #f1f5f9;
              padding: 30px;
              text-align: center;
              border-top: 1px solid #e2e8f0;
            }
            .footer-text {
              font-size: 14px;
              color: #64748b;
              margin-bottom: 10px;
            }
            .social-links {
              margin-top: 20px;
            }
            .social-link {
              display: inline-block;
              margin: 0 10px;
              color: #3b82f6;
              text-decoration: none;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">
                <img src="https://app.trouver-mon-chantier.fr/logo.png" alt="Trouver Mon Chantier" style="height: 40px; vertical-align: middle; margin-right: 10px;">
                Trouver Mon Chantier
              </div>
              <div class="header-subtitle">Finalisez la création de votre compte</div>
            </div>
            
            <div class="content">
              <div class="greeting">Bonjour ${firstName} ${lastName || ''} ! 👋</div>
              
              <div class="message">
                Vous avez terminé votre onboarding avec succès, mais vous n'avez pas encore créé votre compte d'accès.
                <br><br>
                Pour accéder à votre espace personnel et commencer à recevoir des leads, vous devez finaliser la création de votre compte en définissant vos identifiants de connexion.
              </div>
              
              <div style="text-align: center; margin: 40px 0;">
                <a href="https://app.trouver-mon-chantier.fr/creation-de-compte?uid=${clientId}" class="cta-button">
                  🔐 Créer mon compte maintenant
                </a>
              </div>
              
              <div class="reminder-box">
                <div class="reminder-title">⚠️ Action requise</div>
                <div class="reminder-text">
                  Sans compte d'accès, vous ne pourrez pas vous connecter à votre espace personnel ni recevoir vos leads. Cette étape ne prend que 2 minutes !
                </div>
              </div>
              
              <div class="message">
                <strong>Ce que vous pourrez faire une fois votre compte créé :</strong>
                <br>
                • Accéder à votre tableau de bord personnalisé
                <br>
                • Consulter et gérer vos leads
                <br>
                • Modifier vos informations de profil
                <br>
                • Suivre vos performances et statistiques
              </div>
            </div>
            
            <div class="footer">
              <div class="footer-text">
                Vous avez des questions ? Notre équipe est là pour vous aider !
              </div>
              <div class="footer-text">
                📧 <a href="mailto:service@trouver-mon-chantier.fr" style="color: #3b82f6;">service@trouver-mon-chantier.fr</a>
              </div>
              
              <div class="social-links">
                <a href="#" class="social-link">🌐 Site web</a>
                <a href="#" class="social-link">📱 LinkedIn</a>
                <a href="#" class="social-link">📞 Support</a>
              </div>
              
              <div style="margin-top: 30px; font-size: 12px; color: #94a3b8;">
                © 2024 Trouver Mon Chantier. Tous droits réservés.
                <br>
                Vous recevez cet email car vous devez finaliser la création de votre compte.
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    console.log('Tentative d\'envoi email de création de compte vers:', email);
    await sgMail.send(msg);
    console.log('Email de création de compte envoyé avec succès');

    return NextResponse.json(
      { message: 'Email de création de compte envoyé avec succès' },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Erreur détaillée lors de l\'envoi de l\'email de création de compte:', error);
    console.error('Error response:', (error as Error & { response?: { body?: unknown } })?.response?.body);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi de l\'email de création de compte', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
