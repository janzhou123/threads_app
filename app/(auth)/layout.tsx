import { ClerkProvider } from "@clerk/nextjs"
import { Inter } from "next/font/google"

import '../globals.css'

export const metadata = {
  title: 'Threads',
  description: 'A Next.js 13 Meta Threads Application'

}
const inter = Inter({ subsets: ["latin"] })

function Rootlayout(
  { children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className} bg-dark-1`}>
          <div className="w-full flex justify-center mt-10">
            {children}
          </div>
        </body>
      </html>
    </ClerkProvider>
  )
}

export default Rootlayout;