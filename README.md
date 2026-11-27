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

## Cadastro de produtos com imagens

O cadastro envia as imagens através de um backend Node para o ImgBB. Após todos
os uploads serem concluídos, o produto é salvo na API NoSQL com `imagens`,
contendo uma lista de URLs. Cadastros antigos sem esse campo continuam válidos,
assim como o cadastro de produtos sem imagens.

Use `npm install` e `npm start` para executar localmente. Configure
`IMGBB_API_KEY` no `.env` e acesse
`http://localhost:3000/view/cadastrar-produto.html`. O formulário aceita até
duas imagens JPG, PNG ou WEBP de até 32 MB; qualquer falha no upload cancela o
cadastro.

No GitHub Pages, o frontend envia os arquivos ao backend configurado em
`controller/config.js`. O backend pode ser publicado como Web Service no Render
com `npm install` no build e `npm start` na inicialização. Configure
`IMGBB_API_KEY`, `NOSQL_PRODUCTS_URL` e `FRONTEND_ORIGINS` nas variáveis do
serviço. A chave do ImgBB deve permanecer apenas no backend e nunca ser
publicada no frontend.

## 🔌 API

A aplicação usa a base `https://psel-api.vercel.app/api/MadrugaTech`.

| Método | Caminho | Operação |
| --- | --- | --- |
| GET | `/api/MadrugaTech/produtos` | Lista os produtos do catálogo |
| POST | `/api/MadrugaTech/produtos` | Salva um produto enviado pelo backend do Broto |
| PATCH | `/api/MadrugaTech/produtos/{id}` | Atualiza um produto |
| DELETE | `/api/MadrugaTech/produtos/{id}` | Exclui um produto |
| GET | `/api/MadrugaTech/pedidos` | Lista os pedidos |
| POST | `/api/MadrugaTech/pedidos` | Registra um pedido |
| GET | `/api/MadrugaTech/status-pedidos` | Lista os registros de status |
| POST | `/api/MadrugaTech/status-pedidos` | Registra uma etapa do pedido para um produtor |

O formulário de cadastro envia `multipart/form-data` ao endpoint
`POST /api/produtos` do backend do Broto. O backend salva o produto na API
NoSQL em JSON e inclui em `imagens` as URLs geradas para as fotos enviadas.

### Exemplo de produto salvo na API NoSQL

```json
{
  "nome": "Tomate",
  "categoria": "Legume",
  "preco": 4.0,
  "estoque": 5,
  "unidade": "kg",
  "excedente": false,
  "produtor": "Maria",
  "produtorId": "4ae6e43c-abf1-4faf-90b2-29869cd15775",
  "local": "Recife, PE",
  "descricao": "Tomates frescos.",
  "ativo": true,
  "imagens": []
}
```
