import '@/styles/globals.css'
import { Orbis, OrbisProvider } from "@orbisclub/components";
import "@orbisclub/components/dist/index.modern.css";

/** Set the global forum context here */
// global.orbis_context = "kjzl6cwe1jw147eabkq3k4z6ka604w0xksr5k9ildy1glfe1ebkcfmtu8k2d94j";
global.orbis_context = process.env.NEXT_PUBLIC_ORBIS_CONTEXT;

let orbis = new Orbis({
  useLit: false,
  node: "https://node2.orbis.club",
  PINATA_GATEWAY: 'https://orbis.mypinata.cloud/ipfs/',
  PINATA_API_KEY: process.env.PINATA_API_KEY,
  PINATA_SECRET_API_KEY: process.env.PINATA_SECRET_API_KEY
});

export default function App({ Component, pageProps }) {
  return <OrbisProvider defaultOrbis={orbis}>
    <div className='bg-emerald-700 p-2 text-center'>
      <p className='font-sans-serif text-white text-xs'>
        The Forum is in Alpha. Please report any bugs or issues on the <a target="_blank" href='https://github.com/web3-of-trust/forum/issues' className='text-emerald-100 underline'>Github issue</a> page.
      </p>
    </div>
    <Component {...pageProps} /></OrbisProvider>
}
