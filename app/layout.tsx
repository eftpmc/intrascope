import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/app/Providers";
import "../styles/normalize.css";
import "../styles/globals.css";
import "../styles/text-editor.css";
import "../styles/text-editor-comments.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Intrascope",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  //const session = await auth();
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
