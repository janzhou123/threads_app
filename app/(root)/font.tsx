import { Inter as FontSans } from "next/font/google";
// Will break at build. Waiting for https://github.com/shadcn-ui/ui/issues/2377
export const inter = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});