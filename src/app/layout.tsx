import "./styles/animations.css";
import "./styles/globals.css";
import "./styles/glass.css";
import "atropos/css";
import '@smastrom/react-rating/style.css'
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ToastContainer } from "react-toastify";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="fr" suppressHydrationWarning>
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
