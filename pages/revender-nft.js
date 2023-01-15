/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { useRouter } from 'next/router'
import axios from 'axios'
import Web3Modal from 'web3modal'

import {
  direccionMercado
} from '../config'

import Mercado from '../artifacts/contracts/Mercado.sol/Mercado.json'

export default function RevenderNft() {
  const [entradaFormulario, actualizarEntradaFormulario] = useState({ precio: '', image: '' })
  const router = useRouter()
  const { id, uriToken } = router.query
  const { image, precio } = entradaFormulario

  useEffect(() => {
    recuperarNft()
  }, [id])

  async function recuperarNft() {
    if (!uriToken) return
    const metadatos = await axios.get(uriToken)
    actualizarEntradaFormulario(state => ({ ...state, image: metadatos.data.image }))
  }

  async function tramitarReventa() {
    if (!precio) return
    const web3Modal = new Web3Modal()
    const conexion = await web3Modal.connect()
    const proveedor = new ethers.providers.Web3Provider(conexion)
    const signatario = proveedor.getSigner()

    const precioFormateado = ethers.utils.parseUnits(entradaFormulario.precio, 'ether')
    let contrato = new ethers.Contract(direccionMercado, Mercado.abi, signatario)
    let comisionMercado = await contrato.obtenerComisionMercado()

    comisionMercado = comisionMercado.toString()
    let transaccion = await contrato.revenderToken(id, precioFormateado, { value: comisionMercado })
    await transaccion.wait()
   
    router.push('/')
  }

  return (
    <div className="flex justify-center">
      <div className="w-1/2 flex flex-col pb-12">
        <input
          placeholder="Precio en MATIC"
          className="mt-2 border rounded p-4"
          onChange={e => actualizarEntradaFormulario({ ...entradaFormulario, precio: e.target.value })}
        />
        {
          image && (
            <image className="rounded mt-4" width="350" src={image} />
          )
        }
        <button onClick={tramitarReventa} className="font-bold mt-4 bg-green-500 text-white rounded p-4 shadow-lg">Revender</button>
      </div>
    </div>
  )
}