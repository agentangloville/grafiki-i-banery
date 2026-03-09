import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-montserrat",
});

export const metadata = {
  title: "Banner Generator",
  description: "Generator banerów newsletterowych z Cloudinary + AI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pl" className={montserrat.variable}>
      <head>
        <script
          src="https://media-library.cloudinary.com/global/all.js"
          async
        />
      </head>
      <body style={{ margin: 0, fontFamily: "var(--font-montserrat), sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
