const hre = require("hardhat");
const fs = require('fs');

async function main() {
  const mercado = await hre.ethers.getContractFactory("Mercado");
  const mercadoDesplegado = await mercado.deploy();
  await mercadoDesplegado.deployed();
  console.log("El mercado ha sido desplegado en la siguiente direccion:", mercadoDesplegado.address);

  fs.writeFileSync('./config.js', `
  export const direccionMercado = "${mercadoDesplegado.address}"
  `)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });