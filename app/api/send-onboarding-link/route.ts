import { NextRequest, NextResponse } from 'next/server'
import sgMail from '@sendgrid/mail'

// Configuration SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { email, firstName, lastName, clientId } = await request.json()

    // Lien vers l'onboarding avec l'ID client
    const onboardingLink = `https://app.trouver-mon-chantier.fr/onboarding?clientId=${clientId}`

    // Template HTML de l'email
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Commencez votre onboarding - Trouver Mon Chantier</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; line-height: 1.6;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            
            <!-- Header avec logo -->
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
                <img src="https://firebasestorage.googleapis.com/v0/b/trouvermonchantier.firebasestorage.app/o/logo.png?alt=media&token=becd91c3-7d25-4ac2-80a9-6a6c796bd021" alt="Trouver Mon Chantier" style="height: 60px; width: auto; margin-bottom: 20px;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
                    Créons votre site ensemble !
                </h1>
                <p style="color: #d1fae5; margin: 10px 0 0 0; font-size: 16px;">
                    Votre processus d'onboarding vous attend
                </p>
            </div>

            <!-- Contenu principal -->
            <div style="padding: 40px 30px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <div style="display: inline-block; background-color: #ecfdf5; padding: 15px; border-radius: 50%; margin-bottom: 20px;">
                        <div style="width: 40px; height: 40px; background-color: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                            <span style="color: white; font-size: 20px; font-weight: bold;">🚀</span>
                        </div>
                    </div>
                </div>

                <h2 style="color: #1f2937; text-align: center; margin-bottom: 20px; font-size: 24px;">
                    Bonjour ${firstName} ${lastName} ! 👋
                </h2>

                <p style="color: #4b5563; font-size: 16px; margin-bottom: 25px; text-align: center;">
                    Félicitations ! Il est temps de créer votre site web professionnel. 
                    Notre processus d'onboarding personnalisé vous guidera étape par étape.
                </p>

                <!-- Étapes du processus -->
                <div style="background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%); border: 2px solid #10b981; border-radius: 12px; padding: 25px; margin: 30px 0;">
                    <h3 style="color: #065f46; margin: 0 0 20px 0; font-size: 20px; text-align: center;">
                        📋 Ce qui vous attend (15 minutes)
                    </h3>
                    <div style="color: #1f2937; font-size: 15px;">
                        <div style="margin-bottom: 12px; display: flex; align-items: center;">
                            <span style="color: #10b981; margin-right: 10px; font-weight: bold;">1.</span>
                            Informations sur votre entreprise
                        </div>
                        <div style="margin-bottom: 12px; display: flex; align-items: center;">
                            <span style="color: #10b981; margin-right: 10px; font-weight: bold;">2.</span>
                            Vos services et spécialités
                        </div>
                        <div style="margin-bottom: 12px; display: flex; align-items: center;">
                            <span style="color: #10b981; margin-right: 10px; font-weight: bold;">3.</span>
                            Zone d'intervention et contact
                        </div>
                        <div style="margin-bottom: 12px; display: flex; align-items: center;">
                            <span style="color: #10b981; margin-right: 10px; font-weight: bold;">4.</span>
                            Votre histoire et expertise
                        </div>
                        <div style="margin-bottom: 0; display: flex; align-items: center;">
                            <span style="color: #10b981; margin-right: 10px; font-weight: bold;">5.</span>
                            Photos et visuels de vos réalisations
                        </div>
                    </div>
                </div>

                <!-- Bouton d'onboarding -->
                <div style="text-align: center; margin: 35px 0;">
                    <a href="${onboardingLink}" 
                       style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 18px 40px; border-radius: 8px; font-weight: 600; font-size: 18px; box-shadow: 0 4px 14px 0 rgba(16, 185, 129, 0.3); transition: all 0.3s ease;">
                        🎯 Commencer mon onboarding
                    </a>
                </div>

                <!-- Avantages -->
                <div style="background-color: #f9fafb; border-radius: 8px; padding: 25px; margin: 30px 0;">
                    <h4 style="color: #1f2937; margin: 0 0 20px 0; font-size: 18px; text-align: center;">
                        ✨ Votre site sera optimisé pour :
                    </h4>
                    <ul style="color: #4b5563; margin: 0; padding: 0; list-style: none;">
                        <li style="margin-bottom: 12px; display: flex; align-items: center;">
                            <span style="color: #10b981; margin-right: 10px; font-weight: bold;">✓</span>
                            Attirer de nouveaux clients dans votre région
                        </li>
                        <li style="margin-bottom: 12px; display: flex; align-items: center;">
                            <span style="color: #10b981; margin-right: 10px; font-weight: bold;">✓</span>
                            Présenter vos réalisations et expertise
                        </li>
                        <li style="margin-bottom: 12px; display: flex; align-items: center;">
                            <span style="color: #10b981; margin-right: 10px; font-weight: bold;">✓</span>
                            Faciliter la prise de contact et devis
                        </li>
                        <li style="margin-bottom: 0; display: flex; align-items: center;">
                            <span style="color: #10b981; margin-right: 10px; font-weight: bold;">✓</span>
                            Référencement local sur Google
                        </li>
                    </ul>
                </div>

                <!-- Urgence douce -->
                <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 25px 0;">
                    <p style="color: #92400e; margin: 0; font-size: 15px;">
                        <strong>⏰ Pourquoi commencer maintenant ?</strong><br>
                        Plus tôt vous complétez votre onboarding, plus vite votre site sera en ligne et commencera à attirer de nouveaux clients !
                    </p>
                </div>

                <!-- Support -->
                <div style="text-align: center; margin: 30px 0;">
                    <p style="color: #6b7280; font-size: 14px; margin: 0;">
                        💬 Besoin d'aide ? Répondez à cet email ou contactez notre support
                    </p>
                </div>
            </div>

            <!-- Footer -->
            <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;">
                    À bientôt,<br>
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
      subject: `${firstName}, créons votre site ensemble ! 🚀`,
      html: htmlContent,
      text: `
Bonjour ${firstName} ${lastName},

Félicitations ! Il est temps de créer votre site web professionnel.

VOTRE PROCESSUS D'ONBOARDING (15 minutes)
Notre processus personnalisé vous guidera étape par étape :

1. Informations sur votre entreprise
2. Vos services et spécialités  
3. Zone d'intervention et contact
4. Votre histoire et expertise
5. Photos et visuels de vos réalisations

Commencer maintenant : ${onboardingLink}

VOTRE SITE SERA OPTIMISÉ POUR :
✓ Attirer de nouveaux clients dans votre région
✓ Présenter vos réalisations et expertise
✓ Faciliter la prise de contact et devis
✓ Référencement local sur Google

Plus tôt vous complétez votre onboarding, plus vite votre site sera en ligne !

Besoin d'aide ? Répondez à cet email ou contactez notre support.

À bientôt,
L'équipe Trouver Mon Chantier
service@trouver-mon-chantier.fr
      `.trim()
    }

    // Envoi de l'email
    await sgMail.send(msg)

    return NextResponse.json({ 
      success: true, 
      message: 'Email d\'onboarding envoyé avec succès' 
    })

  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email d\'onboarding:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi de l\'email' },
      { status: 500 }
    )
  }
}
