import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('url')
    const filename = searchParams.get('filename')

    if (!imageUrl) {
      return NextResponse.json({ error: 'URL manquante' }, { status: 400 })
    }

    // Récupérer l'image depuis Firebase Storage
    const response = await fetch(imageUrl)
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Impossible de récupérer l\'image' }, { status: 404 })
    }

    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/jpeg'
    
    // Déterminer l'extension si pas de filename fourni
    let finalFilename = filename
    if (!finalFilename) {
      const extension = contentType.split('/')[1] || 'jpg'
      finalFilename = `image.${extension}`
    }

    // Retourner l'image avec les headers de téléchargement
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${finalFilename}"`,
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    console.error('Erreur lors du téléchargement:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
