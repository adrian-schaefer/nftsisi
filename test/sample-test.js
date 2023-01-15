/* test/sample-test.js */
describe("DesplegarMercadoPrueba", function() {
  it("Crea y ejecuta ventas en el mercado", async function() {
    /* Desplegar el mercado */
    const mercado = await ethers.getContractFactory("Mercado")
    const mercadoDesplegado = await mercado.deploy()
    await mercadoDesplegado.deployed()

    let comisionMercado = await mercadoDesplegado.obtenerComisionMercado()
    comisionMercado = comisionMercado.toString()

    const precioArticulo = ethers.utils.parseUnits('1', 'ether')

    /* Creamos dos tokens */
    await mercadoDesplegado.crearToken("https://www.mitoken1.com", precioArticulo, { value: comisionMercado })
    await mercadoDesplegado.crearToken("https://www.mitoken2.com", precioArticulo, { value: comisionMercado })
      
    const [_, direccionComprador] = await ethers.getSigners()
  
    /* Efectuamos la venta del token a otro usuario */
    await mercadoDesplegado.connect(direccionComprador).crearVentaMercado(1, { value: precioArticulo })

    /* Revendemos un token */
    await mercadoDesplegado.connect(direccionComprador).revenderToken(1, precioArticulo, { value: comisionMercado })

    /* Mostramos los articulos que no han sido vendidos */
    articulos = await mercadoDesplegado.mostrarArticulosMercado()
    articulos = await Promise.all(articulos.map(async i => {
      const uriToken = await mercadoDesplegado.tokenURI(i.idToken)
      let articulo = {
        precio: i.precio.toString(),
        idToken: i.idToken.toString(),
        vendedor: i.vendedor,
        propietario: i.propietario,
        uriToken
      }
      return articulo
    }))
    console.log('articulos: ', articulos)
  })
})