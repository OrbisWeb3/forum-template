import '@/styles/globals.css'
import { Orbis, OrbisProvider } from "@orbisclub/components";
import "@orbisclub/components/dist/index.modern.css";

/** Set the global forum context here (you can create categories using the dashboard by clicking on "Create a sub-context" from your main forum context) */
global.orbis_context = "kjzl6cwe1jw147eabkq3k4z6ka604w0xksr5k9ildy1glfe1ebkcfmtu8k2d94j";

/** Set the global chat context here (the chat displayed when users click on the "Community Chat" button) */
global.orbis_chat_context = "kjzl6cwe1jw147040w6bj3nkvny3ax30q76ib5ytxo6298psrx1oawa3wmme2jx";

let orbis = new Orbis({
  useLit: false,
  node: "https://node2.orbis.club",
  PINATA_GATEWAY: 'https://orbis.mypinata.cloud/ipfs/',
  PINATA_API_KEY: process.env.pinata_api_key,
  PINATA_SECRET_API_KEY: process.env.pinata_secret_api_key
});

export default function App({ Component, pageProps }) {
  return <OrbisProvider defaultOrbis={orbis}><Component {...pageProps} /></OrbisProvider>
}
