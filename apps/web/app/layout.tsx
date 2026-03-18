import { ClerkProvider } from "@clerk/nextjs";
import { Navbar } from "../components/Navbar";
import "./global.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider>
          <Navbar></Navbar>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
