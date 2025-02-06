import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'

interface YouTubeStats {
  viewCount: string
  subscriberCount: string
  videoCount: string
}

export function Footer() {
  const [stats, setStats] = useState<YouTubeStats | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchYouTubeStats = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-youtube-stats')
        if (error) throw error
        setStats(data)
      } catch (err) {
        console.error('Error fetching YouTube stats:', err)
        setError('Unable to load YouTube statistics')
      }
    }

    fetchYouTubeStats()
  }, [])

  return (
    <footer className="mt-auto py-6 text-center text-sm text-muted-foreground">
      <div className="container mx-auto px-4">
        {stats && !error && (
          <div className="mb-4 text-sm">
            <a 
              href="https://www.youtube.com/@DroneValais" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              Total des vues YouTube: {parseInt(stats.viewCount).toLocaleString('fr-CH')}
            </a>
          </div>
        )}
        <div>
          © {new Date().getFullYear()} Drone Valais Production. Tous droits réservés.
        </div>
      </div>
    </footer>
  )
}