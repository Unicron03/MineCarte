"use client";

import Home from "./pages/Home";
import Welcome from "./pages/Welcome";
import Collection from "./pages/Collection";
import Combats from "./pages/Combats";
import Layout from "./components/Layout";
import "./styles/globals.css";
import "./styles/glass.css"
import { ThemeProvider } from "./components/ThemeProvider";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

export default function RootLayout() {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <Router>
                <Routes>
                    {/* <Route element={<Layout />}> */}
                        <Route path="/" element={<Welcome />} />
                        <Route path="/home" element={<Home />} />
                        <Route path="/collection" element={<Collection />} />
                        <Route path="/combats" element={<Combats />} />
                    {/* </Route> */}
                </Routes>
            </Router>
        </ThemeProvider>
    );
}
