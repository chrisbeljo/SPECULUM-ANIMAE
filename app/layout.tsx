import type { Metadata } from "next";
import "./globals.css";
import "./navigation.css";
import "./tarot-classic.css";
import "./oracle-sites.css";
export const metadata: Metadata={title:"Speculum Animae",description:"Espacio de orientación simbólica, Tarot, Runas, I Ching y artes oraculares."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="es"><body>{children}</body></html>}
