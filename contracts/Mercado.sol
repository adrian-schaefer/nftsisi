// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "hardhat/console.sol";

contract Mercado is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _idsToken;
    Counters.Counter private _articulosVendidos;

    uint256 comisionMercado = 0.025 ether;
    address payable propietario;

    mapping(uint256 => articuloMercado) private idArticuloMercado;

    struct articuloMercado {
      uint256 idToken;
      address payable vendedor;
      address payable propietario;
      uint256 precio;
      bool vendido;
    }

    event articuloMercadoCreado (
      uint256 indexed idToken,
      address vendedor,
      address propietario,
      uint256 precio,
      bool vendido
    );

    constructor() ERC721("ETSISI Tokens", "NFTSISI") {
      propietario = payable(msg.sender);
    }

    /* Actualiza la comision de mercado del contrato */
    function actualizarComisionMercado(uint _comisionMercado) public payable {
      require(propietario == msg.sender, "Solo el propietario del mercado puede actualizar la comision de venta del mercado.");
      comisionMercado = _comisionMercado;
    }

    /* Devuelve la comision de mercado del contrato */
    function obtenerComisionMercado() public view returns (uint256) {
      return comisionMercado;
    }

    /* Mintea un token y lo muestra en el mercado */
    function crearToken(string memory uriToken, uint256 precio) public payable returns (uint) {
      _idsToken.increment();
      uint256 idTokenNuevo = _idsToken.current();

      _mint(msg.sender, idTokenNuevo);
      _setTokenURI(idTokenNuevo, uriToken);
      crearArticuloMercado(idTokenNuevo, precio);
      return idTokenNuevo;
    }

    function crearArticuloMercado(
      uint256 idToken,
      uint256 precio
    ) private {
      require(precio > 0, "El precio debe ser al menos 1 wei.");
      require(msg.value == comisionMercado, "El precio debe ser igual o mayor a la comision de venta del mercado.");

      idArticuloMercado[idToken] =  articuloMercado(
        idToken,
        payable(msg.sender),
        payable(address(this)),
        precio,
        false
      );

      _transfer(msg.sender, address(this), idToken);
      emit articuloMercadoCreado(
        idToken,
        msg.sender,
        address(this),
        precio,
        false
      );
    }

    /* Permite a un usuario revender un token que tenga en su propiedad */
    function revenderToken(uint256 idToken, uint256 precio) public payable {
      require(idArticuloMercado[idToken].propietario == msg.sender, "Solo el propietario del articulo puede realizar esta operacion.");
      require(msg.value == comisionMercado, "El precio debe ser igual o mayor a la comision de venta del mercado.");
      idArticuloMercado[idToken].vendido = false;
      idArticuloMercado[idToken].precio = precio;
      idArticuloMercado[idToken].vendedor = payable(msg.sender);
      idArticuloMercado[idToken].propietario = payable(address(this));
      _articulosVendidos.decrement();

      _transfer(msg.sender, address(this), idToken);
    }

    /* Crea la venta de un articulo en el mercado */
    /* Transfiere la propiedad del articulo así como los fondos entre las partes */
    function crearVentaMercado(
      uint256 idToken
      ) public payable {
      uint precio = idArticuloMercado[idToken].precio;
      address vendedor = idArticuloMercado[idToken].vendedor;
      require(msg.value == precio, "Porfavor envie el precio establecido por el vendedor para poder continuar con la compra.");
      idArticuloMercado[idToken].propietario = payable(msg.sender);
      idArticuloMercado[idToken].vendido = true;
      idArticuloMercado[idToken].vendedor = payable(address(0));
      _articulosVendidos.increment();
      _transfer(address(this), msg.sender, idToken);
      payable(propietario).transfer(comisionMercado);
      payable(vendedor).transfer(msg.value);
    }

    /* Devuelve todos los articulos que estan a la venta */
    function mostrarArticulosMercado() public view returns (articuloMercado[] memory) {
      uint contadorArticulos = _idsToken.current();
      uint contadorArticulosNoComprados = _idsToken.current() - _articulosVendidos.current();
      uint indiceActual = 0;

      articuloMercado[] memory articulos = new articuloMercado[](contadorArticulosNoComprados);
      for (uint i = 0; i < contadorArticulos; i++) {
        if (idArticuloMercado[i + 1].propietario == address(this)) {
          uint idActual = i + 1;
          articuloMercado storage articuloActual = idArticuloMercado[idActual];
          articulos[indiceActual] = articuloActual;
          indiceActual += 1;
        }
      }
      return articulos;
    }

    /* Devuelve solo los articulos que un usuario ha comprado */
    function mostrarMisArticulos() public view returns (articuloMercado[] memory) {
      uint cantidadTotalArticulos = _idsToken.current();
      uint contadorArticulos = 0;
      uint indiceActual = 0;

      for (uint i = 0; i < cantidadTotalArticulos; i++) {
        if (idArticuloMercado[i + 1].propietario == msg.sender) {
          contadorArticulos += 1;
        }
      }

      articuloMercado[] memory articulos = new articuloMercado[](contadorArticulos);
      for (uint i = 0; i < cantidadTotalArticulos; i++) {
        if (idArticuloMercado[i + 1].propietario == msg.sender) {
          uint idActual = i + 1;
          articuloMercado storage articuloActual = idArticuloMercado[idActual];
          articulos[indiceActual] = articuloActual;
          indiceActual += 1;
        }
      }
      return articulos;
    }

    /* Devuelve solo los articulos que un usuario haya creado */
    function mostrarMisCreaciones() public view returns (articuloMercado[] memory) {
      uint cantidadTotalArticulos = _idsToken.current();
      uint contadorArticulos = 0;
      uint indiceActual = 0;

      for (uint i = 0; i < cantidadTotalArticulos; i++) {
        if (idArticuloMercado[i + 1].vendedor == msg.sender) {
          contadorArticulos += 1;
        }
      }

      articuloMercado[] memory articulos = new articuloMercado[](contadorArticulos);
      for (uint i = 0; i < cantidadTotalArticulos; i++) {
        if (idArticuloMercado[i + 1].vendedor == msg.sender) {
          uint idActual = i + 1;
          articuloMercado storage articuloActual = idArticuloMercado[idActual];
          articulos[indiceActual] = articuloActual;
          indiceActual += 1;
        }
      }
      return articulos;
    }
}