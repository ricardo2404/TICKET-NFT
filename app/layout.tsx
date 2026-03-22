import "./globals.css";
import AuthProvider from "../components/AuthContext";
import WalletContextProvider from "../components/WalletProvider";

export const metadata = {
  title: "EventFi",
  description: "NFT Ticketing en Solana",
}

export default function RootLayout({ children }: any) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <WalletContextProvider>{children}</WalletContextProvider>
        </AuthProvider>
      </body>
    </html>
  );
}