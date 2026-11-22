# 🌱 Broto — MVP

Plataforma que conecta pequenos produtores rurais a consumidores, permitindo
publicar ofertas de frutas, verduras e legumes e fazer pedidos direto de quem
planta. Com destaque para excedentes e redução de desperdício.

## 🎯 Problema

Pequenos produtores perdem parte da colheita por falta de comprador na hora
certa e acabam vendendo barato para intermediários. O Broto permite que o
produtor publique o que tem disponível e que o comprador faça o pedido direto,
com retirada ou entrega combinada.

## 💡 Solução

- **Produtor** cadastra uma oferta (produto, quantidade, preço, localização e
  se é excedente).
- **Comprador** navega pelo catálogo, filtra por produto/localização/excedente,
  escolhe uma oferta, informa a quantidade e registra o pedido com **valor total
  calculado automaticamente**.
- Ofertas marcadas como **excedente** recebem um **selo visual** para evitar
  desperdício.

## 🌍 ODS impactadas

- **ODS 2 — Fome Zero e Agricultura Sustentável:** incentivo à agricultura
  sustentável e valorização dos produtores.
- **ODS 12 — Consumo e Produção Responsáveis:** melhor aproveitamento dos
  alimentos e redução do desperdício.

## 🚀 Funcionalidades do MVP

- [ ] Cadastro de ofertas (POST na API da Seed)
- [ ] Catálogo listando ofertas (GET na API da Seed)
- [ ] Filtros por produto, localização e excedente (JavaScript no navegador)
- [ ] Registro de pedidos com cálculo automático do total
- [ ] Selo visual de excedente
- [ ] Layout responsivo
- [ ] Publicado no GitHub Pages

> Marque os itens conforme forem concluídos.

## 🔌 API

Base: `https://psel-api.vercel.app/api/grupo-5/{colecao}`

- `GET /api/grupo-5/ofertas` — lista as ofertas
- `POST /api/grupo-5/ofertas` — cria uma oferta
- `GET /api/grupo-5/pedidos` — lista os pedidos
- `POST /api/grupo-5/pedidos` — cria um pedido

### Exemplo de oferta (POST)

```json
{
  "nomeProdutor": "Maria",
  "produto": "Tomate",
  "quantidade": 5,
  "preco": 4.0,
  "localizacao": "Sorocaba",
  "excedente": false
}
