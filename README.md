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

O cadastro usa um endpoint Node para enviar as imagens ao ImgBB e, só depois de
todos os uploads concluírem, salvar o produto na API NoSQL. O documento armazena
`imagens` como uma lista de URLs; imagens de cadastros antigos sem esse campo
continuam sendo aceitas.

1. Instale as dependências com `npm install`.
2. Copie `.env.example` para `.env` e preencha `IMGBB_API_KEY` com uma chave
   obtida no ImgBB. A chave fica apenas no servidor.
3. Execute `npm start` e abra `http://localhost:3000/view/cadastrar-produto.html`.
4. Preencha o formulário e escolha até duas imagens JPG, PNG ou WEBP de até
   32 MB cada. O cadastro é abortado se qualquer upload falhar.

O backend também aceita cadastro sem imagens.

### GitHub Pages + backend gratuito

O GitHub Pages continua hospedando o site principal; apenas o endpoint Node fica
em um serviço separado. Um caminho gratuito é criar um **Web Service** no
[Render](https://render.com/):

1. Conecte o repositório ao Render e crie um Web Service com plano **Free**,
   comando de build `npm install` e comando de início `npm start`.
2. No painel do serviço, configure `IMGBB_API_KEY` (use uma chave nova), `PORT`
   não precisa ser definida, e `FRONTEND_ORIGINS` com a origem do Pages
   `https://mateuspereira1.github.io`. Se o nome do usuário ou repositório for
   diferente, ajuste a origem para o domínio real do Pages. Separe origens
   adicionais por vírgula.
3. Após o deploy, copie o domínio `https://...onrender.com` do serviço e
   coloque-o como valor de `URL_BACKEND_UPLOAD` em
   `controller/config.js`, sem adicionar `/api/produtos`. Faça commit e push
   dessa configuração; ela é uma URL pública, não um segredo.
4. Publique normalmente o frontend pelo GitHub Pages. O browser enviará os
   arquivos diretamente ao endpoint do Render; a chave ImgBB permanece no
   backend.

Serviços gratuitos do Render podem dormir após inatividade e levar cerca de um
minuto para responder à primeira requisição. Isso pode deixar o primeiro envio
lento. Para desenvolvimento local, deixe `URL_BACKEND_UPLOAD` vazio e acesse o
formulário por `http://localhost:3000`.

**Segurança:** não publique nem compartilhe a chave ImgBB. Mantenha `.env` fora
do Git e cadastre a chave somente nas variáveis do serviço backend.

Exemplo de chamada multipart, com os campos obrigatórios do formulário:

```sh
curl -X POST http://localhost:3000/api/produtos \
  -F 'nome=Tomate' \
  -F 'categoria=Fruta' \
  -F 'preco=4.50' \
  -F 'estoque=5' \
  -F 'unidade=kg' \
  -F 'excedente=false' \
  -F 'produtor=Sitio Boa Vista' \
  -F 'produtorId=produtor-123' \
  -F 'local=Recife, PE' \
  -F 'imagem1=@tomate.jpg' \
  -F 'imagem2=@tomate-cortado.webp'
```

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
