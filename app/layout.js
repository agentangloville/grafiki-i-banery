import { Funnel_Sans } from "next/font/google";

const funnelSans = Funnel_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-funnel",
});

export const metadata = {
  title: "Banner Generator",
  description: "Generator banerów newsletterowych z Cloudinary + AI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pl" className={funnelSans.variable}>
      <head>
        <script
          src="https://media-library.cloudinary.com/global/all.js"
          async
        />
      </head>
      <body style={{ margin: 0, fontFamily: "var(--font-funnel), 'Funnel Sans', sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
