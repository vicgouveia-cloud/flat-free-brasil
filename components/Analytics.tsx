import Script from 'next/script'
import { Analytics as VercelAnalytics } from '@vercel/analytics/next'

const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

export default function Analytics() {
  return (
    <>
      {measurementId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
            strategy="afterInteractive"
          />
          <Script id="flat-free-ga4" strategy="afterInteractive">
            {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', {
            anonymize_ip: true
          });
        `}
          </Script>
        </>
      )}
      <VercelAnalytics />
    </>
  )
}
