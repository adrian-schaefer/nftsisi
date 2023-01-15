/* pages/_app.js */

import '../styles/globals.css'
import Link from 'next/link'

function MyApp({ Component, pageProps }) {
  return (
    <div>
      <nav className="border-b p-6">
        <p className="text-4xl font-bold">NFTSISI</p>
        <div className="flex mt-4">
          <Link legacyBehavior href="/">
            <a className="mr-4 text-green-500">
              Inicio
            </a>
          </Link>
          <Link legacyBehavior href="/crear-nft">
            <a className="mr-6 text-green-500">
              Crear/Vender NFT
            </a>
          </Link>
          <Link legacyBehavior href="/mis-nfts">
            <a className="mr-6 text-green-500">
              Mis NFTs
            </a>
          </Link>
          <Link legacyBehavior href="/mis-creaciones">
            <a className="mr-6 text-green-500">
              Mis Creaciones
            </a>
          </Link>
        </div>
      </nav>
      <Component {...pageProps} />
    </div>
  )
}

export default MyApp