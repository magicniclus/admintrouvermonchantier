import { NextRequest, NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    console.log('API SendGrid appelée');
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
      subject: 'Bienvenue sur Trouver Mon Chantier ! 🏠',
      html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bienvenue sur Trouver Mon Chantier</title>
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
              background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
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
            .features {
              margin: 40px 0;
              padding: 30px;
              background-color: #f8fafc;
              border-radius: 8px;
            }
            .feature {
              display: flex;
              align-items: center;
              margin-bottom: 20px;
            }
            .feature:last-child {
              margin-bottom: 0;
            }
            .feature-icon {
              width: 24px;
              height: 24px;
              background-color: #3b82f6;
              border-radius: 50%;
              margin-right: 15px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
            }
            .feature-text {
              font-size: 14px;
              color: #475569;
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
              <div class="header-subtitle">Votre partenaire pour tous vos projets de construction</div>
            </div>
            
            <div class="content">
              <div class="greeting">Bonjour ${firstName} ${lastName || ''} ! 👋</div>
              
              <div class="message">
                Félicitations ! Votre inscription sur <strong>Trouver Mon Chantier</strong> a été finalisée avec succès.
                <br><br>
                Nous sommes ravis de vous accueillir dans notre communauté de professionnels du bâtiment. 
                Votre profil est maintenant en cours de création et sera bientôt disponible pour vos futurs clients.
              </div>
              
              <div style="text-align: center; margin: 40px 0;">
                <a href="https://app.trouver-mon-chantier.fr/creation-de-compte?uid=${clientId}" class="cta-button">
                  🚀 Finaliser mon compte
                </a>
              </div>
              
              <div class="features">
                <h3 style="margin-top: 0; color: #1e293b; font-size: 18px;">Ce qui vous attend :</h3>
                
                <div class="feature">
                  <div class="feature-icon">✨</div>
                  <div class="feature-text">
                    <strong>Site web personnalisé</strong> - Création automatique de votre vitrine en ligne
                  </div>
                </div>
                
                <div class="feature">
                  <div class="feature-icon">🎯</div>
                  <div class="feature-text">
                    <strong>Génération de leads qualifiés</strong> - Recevez des demandes de devis ciblées
                  </div>
                </div>
                
                <div class="feature">
                  <div class="feature-icon">📊</div>
                  <div class="feature-text">
                    <strong>Tableau de bord complet</strong> - Gérez vos projets et suivez vos performances
                  </div>
                </div>
                
                <div class="feature">
                  <div class="feature-icon">🤝</div>
                  <div class="feature-text">
                    <strong>Support dédié</strong> - Notre équipe vous accompagne dans votre réussite
                  </div>
                </div>
              </div>
              
              <div class="message">
                <strong>Prochaines étapes :</strong>
                <br>
                1. Cliquez sur le bouton ci-dessus pour finaliser votre compte
                <br>
                2. Configurez vos préférences de notification
                <br>
                3. Commencez à recevoir vos premiers leads !
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
                Vous recevez cet email car vous vous êtes inscrit sur notre plateforme.
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    console.log('Tentative d\'envoi email vers:', email);
    await sgMail.send(msg);
    console.log('Email envoyé avec succès');

    return NextResponse.json(
      { message: 'Email envoyé avec succès' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Erreur détaillée lors de l\'envoi de l\'email:', error);
    console.error('Error response:', error.response?.body);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi de l\'email', details: error.message },
      { status: 500 }
    );
  }
}
