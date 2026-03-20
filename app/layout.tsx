import "./globals.css";
import AuthProvider from "../components/AuthContext";
import WalletContextProvider from "../components/WalletProvider";

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