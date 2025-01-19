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
      rate_details,
      status,
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
    addText(status === 'approved' ? 'FACTURE' : 'DEVIS', 50, 20)
    
    // Informations du document
    addText(`Numéro: ${invoice_number}`, 100)
    addText(`Client: ${client_name}`, 120)
    addText(`Date: ${new Date(invoice_date).toLocaleDateString('fr-CH')}`, 140)
    
    // Détails des services
    if (rate_details && rate_details.length > 0) {
      addText('Services:', 180, 14)
      let yPos = 200
      
      // En-tête du tableau
      addText('Description', yPos)
      addText('Montant CHF', yPos, fontSize, width - 150)
      yPos += 20

      // Liste des services
      let subtotal = 0
      for (const service of rate_details) {
        addText(service.description, yPos)
        addText(service.amount.toFixed(2), yPos, fontSize, width - 150)
        subtotal += service.amount
        yPos += 20
      }

      // Calculs
      yPos += 20
      const tva = subtotal * 0.082
      const total = subtotal + tva

      addText('Sous-total:', yPos)
      addText(subtotal.toFixed(2), yPos, fontSize, width - 150)
      yPos += 20

      addText('TVA (8.2%):', yPos)
      addText(tva.toFixed(2), yPos, fontSize, width - 150)
      yPos += 20

      addText('Total CHF:', yPos, 14)
      addText(total.toFixed(2), yPos, 14, width - 150)
    }

    // Générer le PDF
    const pdfBytes = await pdfDoc.save()

    return new Response(
      pdfBytes,
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${status === 'approved' ? 'facture' : 'devis'}_${invoice_number}.pdf"`
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