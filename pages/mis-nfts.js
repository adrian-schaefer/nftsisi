/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */

import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'
import { useRouter } from 'next/router'

import {
  direccionMercado
} from '../config'

import Mercado from '../artifacts/contracts/Mercado.sol/Mercado.json'

export default function MisNfts() {
  const [nfts, establecerNfts] = useState([])
  const [estadoCarga, establecerEstadoCarga] = useState('no-cargado')
  const router = useRouter()
  useEffect(() => {
    mostrarMisNfts()
  }, [])
  async function mostrarMisNfts() {
    const web3Modal = new Web3Modal({
      network: "mainnet",
      cacheProvider: true,
    })
    const conexion = await web3Modal.connect()
    const proveedor = new ethers.providers.Web3Provider(conexion)
    const signatario = proveedor.getSigner()

    const contrato = new ethers.Contract(direccionMercado, Mercado.abi, signatario)
    const datos = await contrato.mostrarMisArticulos()

    const articulos = await Promise.all(datos.map(async i => {
      const uriToken = await contrato.tokenURI(i.idToken)
      const metadatos = await axios.get(uriToken)
      let precio = ethers.utils.formatUnits(i.precio.toString(), 'ether')
      let articulo = {
        precio,
        idToken: i.idToken.toNumber(),
        vendedor: i.vendedor,
        propietario: i.propietario,
        image: metadatos.data.image,
        uriToken
      }
      return articulo
    }))
    establecerNfts(articulos)
    establecerEstadoCarga('cargado') 
  }
  function revenderNft(nft) {
    console.log('nft:', nft)
    router.push(`/revender-nft?id=${nft.idToken}&uriToken=${nft.uriToken}`)
  }
  if (estadoCarga === 'cargado' && !nfts.length) return (<h1 className="py-10 px-20 text-3xl">Usted no posee ningún artículo</h1>)
  return (
    <div className="flex justify-center">
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {
            nfts.map((nft, i) => (
              <div key={i} className="border shadow rounded-xl overflow-hidden">
                <img src={nft.image} className="rounded" />
                <div className="p-4 bg-black">
                  <p className="text-2xl font-bold text-white">Precio - {nft.precio} MATIC</p>
                  <button className="mt-4 w-full bg-green-500 text-white font-bold py-2 px-12 rounded" onClick={() => revenderNft(nft)}>Revender</button>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}