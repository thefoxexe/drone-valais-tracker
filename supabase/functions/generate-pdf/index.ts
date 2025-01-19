import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { PDFDocument, rgb, StandardFonts } from 'https://cdn.skypack.dev/pdf-lib'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const data = await req.json()
    const {
      invoice_number,
      client_name,
      amount,
      invoice_date,
      description,
      rate_details,
    } = data

    // Créer un nouveau document PDF
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage()
    const { height, width } = page.getSize()
    
    // Charger la police
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const fontSize = 12
    
    // Fonction helper pour ajouter du texte
    const addText = (text: string, y: number, size = fontSize) => {
      page.drawText(text, {
        x: 50,
        y: height - y,
        size: size,
        font: font,
        color: rgb(0, 0, 0),
      })
    }

    // En-tête
    addText('DEVIS', 50, 20)
    
    // Informations du devis
    addText(`Numéro de devis: ${invoice_number}`, 100)
    addText(`Client: ${client_name}`, 120)
    addText(`Date: ${new Date(invoice_date).toLocaleDateString('fr-CH')}`, 140)
    
    // Description
    if (description) {
      addText('Description:', 180, 14)
      const descriptionLines = description.split('\n')
      let yPos = 200
      for (const line of descriptionLines) {
        addText(line, yPos)
        yPos += 20
      }
    }

    // Détails du tarif
    if (rate_details) {
      addText('Détails du tarif:', 300, 14)
      const rateLines = rate_details.split('\n')
      let yPos = 320
      for (const line of rateLines) {
        addText(line, yPos)
        yPos += 20
      }
    }

    // Montant total
    addText('Montant total:', 400, 14)
    addText(`${amount.toLocaleString('fr-CH')} CHF`, 420)

    // Générer le PDF
    const pdfBytes = await pdfDoc.save()

    return new Response(
      pdfBytes,
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="devis_${invoice_number}.pdf"`
        }
      }
    )

  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error)
    return new Response(
      JSON.stringify({ error: 'Erreur lors de la génération du PDF', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})