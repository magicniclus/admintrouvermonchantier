import { NextRequest, NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function GET() {
  try {
    console.log('=== TEST EMAIL SENDGRID ===');
    console.log('SENDGRID_API_KEY présente:', !!process.env.SENDGRID_API_KEY);
    console.log('SENDGRID_API_KEY length:', process.env.SENDGRID_API_KEY?.length);
    
    const testEmail = {
      to: 'casteranicolas.contact@gmail.com', // Email de test
      from: 'service@trouver-mon-chantier.fr',
      subject: 'Test SendGrid - Trouver Mon Chantier',
      html: `
        <h1>Test d'envoi SendGrid</h1>
        <p>Si vous recevez cet email, SendGrid fonctionne correctement.</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
      `,
    };

    console.log('Tentative d\'envoi vers:', testEmail.to);
    
    await sgMail.send(testEmail);
    
    console.log('✅ Email de test envoyé avec succès');
    
    return NextResponse.json({
      success: true,
      message: 'Email de test envoyé avec succès',
      timestamp: new Date().toISOString(),
      apiKeyPresent: !!process.env.SENDGRID_API_KEY
    });
    
  } catch (error: any) {
    console.error('❌ Erreur lors du test SendGrid:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      response: error.response?.body
    });
    
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error.response?.body || error,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
