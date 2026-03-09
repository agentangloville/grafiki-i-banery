export const metadata = {
  title: "Banner Generator",
  description: "Generator banerów newsletterowych z Cloudinary + AI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Funnel+Sans:ital,wght@0,300..800;1,300..800&display=swap"
          rel="stylesheet"
        />
        <script
          src="https://media-library.cloudinary.com/global/all.js"
          async
        />
      </head>
      <body style={{ margin: 0, fontFamily: "'Funnel Sans', sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
