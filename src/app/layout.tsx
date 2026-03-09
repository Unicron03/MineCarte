import "./styles/animations.css";
import "./styles/globals.css";
import "./styles/glass.css";
import "atropos/css";
import '@smastrom/react-rating/style.css'
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ToastContainer } from "react-toastify";
import { Alfa_Slab_One } from "next/font/google";

const alfaSlabOne = Alfa_Slab_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-alfa-slab-one",
});

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="fr" suppressHydrationWarning className={alfaSlabOne.variable}>
            <body>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    {children}
                    <ToastContainer />
                </ThemeProvider>
            </body>
        </html>
    );
}
