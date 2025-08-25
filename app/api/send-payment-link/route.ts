import { NextRequest, NextResponse } from 'next/server'
import sgMail from '@sendgrid/mail'

// Configuration SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { email, firstName, lastName, offerType, clientId } = await request.json()

    // Définir les liens selon l'offre
    const paymentLinks = {
      '90j-offert': 'https://buy.stripe.com/fZu00j78U0qDg4JgbHa7C02',
      'classique': 'https://buy.stripe.com/6oU5kD0KwddpcSxgbHa7C03'
    }

    const paymentLink = paymentLinks[offerType as keyof typeof paymentLinks]
    
    if (!paymentLink) {
      return NextResponse.json({ error: 'Type d\'offre invalide' }, { status: 400 })
    }

    // Template HTML de l'email
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Votre lien de paiement - Trouver Mon Chantier</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; line-height: 1.6;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            
            <!-- Header avec logo -->
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 40px 30px; text-align: center;">
                <img src="https://firebasestorage.googleapis.com/v0/b/trouvermonchantier.firebasestorage.app/o/logo.png?alt=media&token=becd91c3-7d25-4ac2-80a9-6a6c796bd021" alt="Trouver Mon Chantier" style="height: 60px; width: auto; margin-bottom: 20px;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
                    Finalisez votre abonnement
                </h1>
                <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">
                    Votre lien de paiement sécurisé est prêt
                </p>
            </div>

            <!-- Contenu principal -->
            <div style="padding: 40px 30px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <div style="display: inline-block; background-color: #f0f9ff; padding: 15px; border-radius: 50%; margin-bottom: 20px;">
                        <div style="width: 40px; height: 40px; background-color: #3b82f6; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                            <span style="color: white; font-size: 20px; font-weight: bold;">✓</span>
                        </div>
                    </div>
                </div>

                <h2 style="color: #1f2937; text-align: center; margin-bottom: 20px; font-size: 24px;">
                    Bonjour ${firstName} ${lastName} ! 👋
                </h2>

                <p style="color: #4b5563; font-size: 16px; margin-bottom: 25px; text-align: center;">
                    Nous sommes ravis de vous accompagner dans le développement de votre activité. 
                    Votre lien de paiement sécurisé est maintenant disponible.
                </p>

                <!-- Offre sélectionnée -->
                <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 2px solid #3b82f6; border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center;">
                    <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 20px;">
                        ${offerType === '90j-offert' ? '🎉 Offre Spéciale - 90 jours offerts' : '🚀 Votre abonnement'}
                    </h3>
                    <p style="color: #1f2937; font-size: 16px; margin: 0;">
                        ${offerType === '90j-offert' 
                          ? 'Profitez de 3 mois gratuits pour découvrir tous nos services !' 
                          : 'Accédez immédiatement à tous nos outils professionnels.'}
                    </p>
                </div>

                <!-- Bouton de paiement -->
                <div style="text-align: center; margin: 35px 0;">
                    <a href="${paymentLink}" 
                       style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 18px 40px; border-radius: 8px; font-weight: 600; font-size: 18px; box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.3); transition: all 0.3s ease;">
                        🔒 Procéder au paiement sécurisé
                    </a>
                </div>

                <!-- Avantages -->
                <div style="background-color: #f9fafb; border-radius: 8px; padding: 25px; margin: 30px 0;">
                    <h4 style="color: #1f2937; margin: 0 0 20px 0; font-size: 18px; text-align: center;">
                        ✨ Ce qui vous attend :
                    </h4>
                    <ul style="color: #4b5563; margin: 0; padding: 0; list-style: none;">
                        <li style="margin-bottom: 12px; display: flex; align-items: center;">
                            <span style="color: #10b981; margin-right: 10px; font-weight: bold;">✓</span>
                            Site web professionnel personnalisé
                        </li>
                        <li style="margin-bottom: 12px; display: flex; align-items: center;">
                            <span style="color: #10b981; margin-right: 10px; font-weight: bold;">✓</span>
                            Génération automatique de leads qualifiés
                        </li>
                        <li style="margin-bottom: 12px; display: flex; align-items: center;">
                            <span style="color: #10b981; margin-right: 10px; font-weight: bold;">✓</span>
                            Outils de gestion client intégrés
                        </li>
                        <li style="margin-bottom: 0; display: flex; align-items: center;">
                            <span style="color: #10b981; margin-right: 10px; font-weight: bold;">✓</span>
                            Support client dédié 7j/7
                        </li>
                    </ul>
                </div>

                <!-- Sécurité -->
                <div style="text-align: center; margin: 30px 0;">
                    <p style="color: #6b7280; font-size: 14px; margin: 0;">
                        🔐 Paiement 100% sécurisé par Stripe • Données cryptées • Sans engagement
                    </p>
                </div>

                <!-- Support -->
                <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 25px 0;">
                    <p style="color: #92400e; margin: 0; font-size: 15px;">
                        <strong>💬 Besoin d'aide ?</strong><br>
                        Notre équipe est là pour vous accompagner. Répondez simplement à cet email ou contactez-nous au support.
                    </p>
                </div>
            </div>

            <!-- Footer -->
            <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;">
                    Cordialement,<br>
                    <strong style="color: #1f2937;">L'équipe Trouver Mon Chantier</strong>
                </p>
                <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                    service@trouver-mon-chantier.fr • www.trouver-mon-chantier.fr
                </p>
            </div>
        </div>
    </body>
    </html>
    `

    // Configuration de l'email
    const msg = {
      to: email,
      from: {
        email: 'service@trouver-mon-chantier.fr',
        name: 'Trouver Mon Chantier'
      },
      subject: `${firstName}, votre lien de paiement est prêt ! 🚀`,
      html: htmlContent,
      text: `
Bonjour ${firstName} ${lastName},

Nous sommes ravis de vous accompagner dans le développement de votre activité !

${offerType === '90j-offert' ? 'OFFRE SPÉCIALE - 90 jours offerts' : 'VOTRE ABONNEMENT'}
${offerType === '90j-offert' 
  ? 'Profitez de 3 mois gratuits pour découvrir tous nos services !' 
  : 'Accédez immédiatement à tous nos outils professionnels.'}

Votre lien de paiement sécurisé : ${paymentLink}

Ce qui vous attend :
✓ Site web professionnel personnalisé
✓ Génération automatique de leads qualifiés  
✓ Outils de gestion client intégrés
✓ Support client dédié 7j/7

Paiement 100% sécurisé par Stripe.

Besoin d'aide ? Répondez à cet email ou contactez notre support.

Cordialement,
L'équipe Trouver Mon Chantier
service@trouver-mon-chantier.fr
      `.trim()
    }

    // Envoi de l'email
    await sgMail.send(msg)

    return NextResponse.json({ 
      success: true, 
      message: 'Email de lien de paiement envoyé avec succès' 
    })

  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de paiement:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi de l\'email' },
      { status: 500 }
    )
  }
}
