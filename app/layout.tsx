import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {title:"PC Hub · Marketing Workspace",description:"A shared content calendar, posting monitor, social analytics and team KPI workspace for PC Hub.",icons:{icon:"/favicon.svg"}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
