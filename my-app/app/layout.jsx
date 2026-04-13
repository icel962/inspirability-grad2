import "./globals.css";
import Navbar from "../app/component/Navbar";
import Footer from "../app/component/Footer";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet"/>
      </head>

      <body>

        <Navbar />

        <main className="page-animation">
          {children}
        </main>

        <Footer />

      </body>
    </html>
  );
}