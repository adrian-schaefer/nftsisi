/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */

import { useState } from 'react'
import { ethers } from 'ethers'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { useRouter } from 'next/router'
import Web3Modal from 'web3modal'

const idProyectoIPFS = process.env.NEXT_PUBLIC_ID_PROYECTO_IPFS
const claveSecretaIPFS = process.env.NEXT_PUBLIC_CLAVE_PRIVADA_IPFS
const authorization = "Basic " + btoa(idProyectoIPFS + ":" + claveSecretaIPFS)

const clienteIPFS = ipfsHttpClient({
  url: "https://ipfs.infura.io:5001/api/v0",
  headers:{
    authorization
  }
})

import {
  direccionMercado
} from '../config'

import Mercado from '../artifacts/contracts/Mercado.sol/Mercado.json'

export default function CrearArticulo() {
  const [urlArchivo, establecerUrlArchivo] = useState(null)
  const [entradaFormulario, actualizarEntradaFormulario] = useState({ precio: '', nombre: '', descripcion: '' })
  const router = useRouter()

  async function onChange(e) {
    const archivo = e.target.files[0]
    try {
      const ruta = await clienteIPFS.add(
        archivo,
        {
          progress: (prog) => console.log(`recibido: ${prog}`)
        }
      )
      const url = `https://nftsisi.infura-ipfs.io/ipfs/${ruta.path}`
      establecerUrlArchivo(url)
    } catch (error) {
      console.log('Error subiendo el archivo: ', error)
    }  
  }
  async function cargarEnIPFS() {
    const { nombre, descripcion, precio } = entradaFormulario
    if (!nombre || !descripcion || !precio || !urlArchivo) return
    /* Primero subimos a IPFS */
    const datos = JSON.stringify({
      nombre, descripcion, image: urlArchivo
    })
    try {
      const ruta = await clienteIPFS.add(datos)
      const url = `https://nftsisi.infura-ipfs.io/ipfs/${ruta.path}`
      /* Una vez el archivo se haya subido a IPFS devolver la url para utilizarla en la transaccion */
      return url
    } catch (error) {
      console.log('Error subiendo el archivo: ', error)
    }  
  }

  async function tramitarVenta() {
    const url = await cargarEnIPFS()
    const web3Modal = new Web3Modal()
    const conexion = await web3Modal.connect()
    const proveedor = new ethers.providers.Web3Provider(conexion)
    const signatario = proveedor.getSigner()

    /* A continuación creamos el articulo */
    const precio = ethers.utils.parseUnits(entradaFormulario.precio, 'ether')
    let contrato = new ethers.Contract(direccionMercado, Mercado.abi, signatario)
    let comisionMercado = await contrato.obtenerComisionMercado()
    comisionMercado = comisionMercado.toString()
    let transaccion = await contrato.crearToken(url, precio, { value: comisionMercado })
    await transaccion.wait()
   
    router.push('/')
  }

  return (
    <div className="flex justify-center">
      <div className="w-1/2 flex flex-col pb-12">
        <input 
          placeholder="Nombre"
          className="mt-8 border rounded p-4"
          onChange={e => actualizarEntradaFormulario({ ...entradaFormulario, nombre: e.target.value })}
        />
        <textarea
          placeholder="Descripción"
          className="mt-2 border rounded p-4"
          onChange={e => actualizarEntradaFormulario({ ...entradaFormulario, descripcion: e.target.value })}
        />
        <input
          placeholder="Precio (en MATIC)"
          className="mt-2 border rounded p-4"
          onChange={e => actualizarEntradaFormulario({ ...entradaFormulario, precio: e.target.value })}
        />
        <input
          type="file"
          nombre="Archivo"
          className="my-4"
          onChange={onChange}
        />
        {
          urlArchivo && (
            <img className="rounded mt-4" width="350" src={urlArchivo} />
          )
        }
        <button onClick={tramitarVenta} className="font-bold mt-4 bg-green-500 text-white rounded p-4 shadow-lg">Crear NFT</button>
      </div>
    </div>
  )
}