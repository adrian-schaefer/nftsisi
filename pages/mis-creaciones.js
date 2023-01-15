/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */

import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'

import {
  direccionMercado
} from '../config'

import Mercado from '../artifacts/contracts/Mercado.sol/Mercado.json'

export default function MisCreaciones() {
  const [nfts, establecerNfts] = useState([])
  const [estadoCarga, establecerEstadoCarga] = useState('no-cargado')
  useEffect(() => {
    mostrarMisCreaciones()
  }, [])
  async function mostrarMisCreaciones() {
    const web3Modal = new Web3Modal({
      network: 'mainnet',
      cacheProvider: true,
    })
    const conexion = await web3Modal.connect()
    const proveedor = new ethers.providers.Web3Provider(conexion)
    const signatario = proveedor.getSigner()

    const contrato = new ethers.Contract(direccionMercado, Mercado.abi, signatario)
    const datos = await contrato.mostrarMisCreaciones()

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
      }
      return articulo
    }))

    establecerNfts(articulos)
    establecerEstadoCarga('cargado') 
  }
  if (estadoCarga === 'cargado' && !nfts.length) return (<h1 className="py-10 px-20 text-3xl">No ha creado ningún artículo</h1>)
  return (
    <div>
      <div className="p-4">
        <h2 className="text-2xl py-2">Lista de artículos creados por ti</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {
            nfts.map((nft, i) => (
              <div key={i} className="border shadow rounded-xl overflow-hidden">
                <img src={nft.image} className="rounded" />
                <div className="p-4 bg-black">
                  <p className="text-2xl font-bold text-white">Precio - {nft.precio} MATIC</p>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}