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

let terminalRpc = process.env.NEXT_PUBLIC_TERMINAL_RPC

export default function Inicio() {
  const [nfts, establecerNfts] = useState([])
  const [estadoCarga, establecerEstadoCarga] = useState('no-cargado')
  useEffect(() => {
    mostrarNfts()
  }, [])
  async function mostrarNfts() {
    /* Creamos un proveedor genérico y consultamos los artículos del mercado disponibles */
    const proveedor = new ethers.providers.JsonRpcProvider(terminalRpc)
    const contrato = new ethers.Contract(direccionMercado, Mercado.abi, proveedor)
    const datos = await contrato.mostrarArticulosMercado()

    /*
    *  Mapear los articulos devueltos por el contrato inteligente y formatearlos,
    *  así como obtener los metadatos del token
    */
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
        nombre: metadatos.data.nombre,
        descripcion: metadatos.data.descripcion,
      }
      return articulo
    }))
    establecerNfts(articulos)
    establecerEstadoCarga('cargado') 
  }
  async function comprarNft(nft) {
    /* Necesita que el usuario firme la transaccion, asi que usaremos Web3Provider para firmarla */
    const web3Modal = new Web3Modal()
    const conexion = await web3Modal.connect()
    const proveedor = new ethers.providers.Web3Provider(conexion)
    const signatario = proveedor.getSigner()
    const contrato = new ethers.Contract(direccionMercado, Mercado.abi, signatario)

    /* El usuario deberá pagar el precio solicitado para completar la transacción */
    const precio = ethers.utils.parseUnits(nft.precio.toString(), 'ether')   
    const transaccion = await contrato.crearVentaMercado(nft.idToken, {
      value: precio
    })
    await transaccion.wait()
    mostrarNfts()
  }
  if (estadoCarga === 'cargado' && !nfts.length) return (<h1 className="px-20 py-10 text-3xl">No hay artículos disponibles en el mercado</h1>)
  return (
    <div className="flex justify-center">
      <div className="px-4" style={{ maxWidth: '1600px' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {
            nfts.map((nft, i) => (
              <div key={i} className="border shadow rounded-xl overflow-hidden">
                <img src={nft.image} />
                <div className="p-4">
                  <p style={{ height: '64px' }} className="text-2xl font-semibold">{nft.nombre}</p>
                  <div style={{ height: '70px', overflow: 'hidden' }}>
                    <p className="text-gray-400">{nft.descripcion}</p>
                  </div>
                </div>
                <div className="p-4 bg-black">
                  <p className="text-2xl font-bold text-white">{nft.precio} MATIC</p>
                  <button className="mt-4 w-full bg-green-500 text-white font-bold py-2 px-12 rounded" onClick={() => comprarNft(nft)}>Comprar</button>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}