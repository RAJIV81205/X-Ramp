import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../components/auth/AuthProvider';
import { ExperienceProvider } from '../components/preferences/ExperienceProvider';
import { TransactionStatusProvider } from '../components/transaction/TransactionStatusContext';
import { TransactionStatusDisplay } from '../components/transaction/TransactionStatusDisplay';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "X-Ramp - Keyless Crypto Wallet",
  description: "ZK-powered trustless fiat on/off-ramp with keyless wallet onboarding",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ExperienceProvider>
          <AuthProvider>
            <TransactionStatusProvider>
              {children}
              <TransactionStatusDisplay />
              <Toaster
                position="bottom-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#18181b',
                    color: '#fff',
                  },
                }}
              />
            </TransactionStatusProvider>
          </AuthProvider>
        </ExperienceProvider>
      </body>
    </html>
  );
}
