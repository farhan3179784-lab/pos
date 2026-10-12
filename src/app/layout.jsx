import './globals.css';
import { Providers } from './providers';
import { AdminLayout } from '../components/layout/AdminLayout';

export const metadata = {
  title: 'فیوژن کریانہ ہول سیل سنٹر - Fusion Kiryana POS',
  description: 'فیوژن کریانہ ہول سیل سنٹر - پوائنٹ آف سیل (POS) سسٹم، رجانہ روڈ نزد الائیڈ پیٹرولیم کھدروالا',
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export const viewport = {
  themeColor: '#4f46e5',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&family=Noto+Sans+Arabic:wght@400;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-slate-50 text-slate-900 antialiased selection:bg-indigo-500 selection:text-white" suppressHydrationWarning>
        <Providers>
          <AdminLayout>
            {children}
          </AdminLayout>
        </Providers>
      </body>
    </html>
  );
}
