import "dotenv/config";
import express from "express";
import multer from "multer";
import { fileTypeFromBuffer } from "file-type";
import { fileURLToPath } from "node:url";
import path from "node:path";

const app = express();
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = Number(process.env.PORT) || 3000;
const productsUrl = process.env.NOSQL_PRODUCTS_URL
    || "https://psel-api.vercel.app/api/MadrugaTech/produtos";
const allowedOrigins = new Set(
    (process.env.FRONTEND_ORIGINS
        || "http://localhost:3000,http://127.0.0.1:5500")
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
);
const maxFileSize = 32 * 1024 * 1024;
const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const imageFields = [
    { name: "imagem1", maxCount: 1 },
    { name: "imagem2", maxCount: 1 },
];

class HttpError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxFileSize, files: 2, fields: 20, parts: 22 },
    fileFilter(_req, file, callback) {
        if (!allowedImageTypes.has(file.mimetype)) {
            callback(new HttpError(400, "Use imagens JPG, PNG ou WEBP."));
            return;
        }
        callback(null, true);
    },
});

app.use((req, res, next) => {
    const origin = req.get("origin");
    const origemPermitida = origin && allowedOrigins.has(origin);

    if (origemPermitida) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Vary", "Origin");
        res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    }

    if (req.method === "OPTIONS" && req.path === "/api/produtos") {
        res.sendStatus(origemPermitida ? 204 : 403);
        return;
    }
    next();
});

function validarProduto(body) {
    const textoObrigatorio = (campo) => {
        if (typeof body[campo] !== "string" || !body[campo].trim()) {
            throw new HttpError(400, `Preencha o campo ${campo}.`);
        }
        return body[campo].trim();
    };
    const nome = textoObrigatorio("nome");
    const produtor = textoObrigatorio("produtor");
    const local = textoObrigatorio("local");
    const produtorId = textoObrigatorio("produtorId");
    const precoInformado = textoObrigatorio("preco");
    const estoqueInformado = textoObrigatorio("estoque");
    const preco = Number(precoInformado);
    const estoque = Number(estoqueInformado);
    const excedente = body.excedente;
    const requestId = typeof body.requestId === "string" ? body.requestId.trim() : "";

    if (typeof body.categoria !== "string" || !["Fruta", "Verdura", "Legume"].includes(body.categoria)) {
        throw new HttpError(400, "Selecione uma categoria válida.");
    }
    if (requestId && !/^[\da-f]{8}-[\da-f]{4}-[1-8][\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i.test(requestId)) {
        throw new HttpError(400, "Identificador de cadastro inválido.");
    }
    if (!Number.isFinite(preco) || preco < 0 || !Number.isFinite(estoque) || estoque < 0) {
        throw new HttpError(400, "Preço e quantidade devem ser números válidos e não negativos.");
    }
    if (!["kg", "un"].includes(body.unidade)) {
        throw new HttpError(400, "Selecione uma unidade de venda válida.");
    }
    if (!["true", "false", "sim", "nao"].includes(String(excedente).toLowerCase())) {
        throw new HttpError(400, "Informe se o produto é excedente.");
    }

    return {
        nome,
        categoria: body.categoria,
        preco,
        estoque,
        unidade: body.unidade,
        excedente: ["true", "sim"].includes(String(excedente).toLowerCase()),
        produtor,
        produtorId,
        local,
        descricao: typeof body.descricao === "string" ? body.descricao.trim() : "",
        ativo: true,
        ...(requestId ? { requestId } : {}),
    };
}

async function validarTipoReal(arquivo) {
    const tipoDetectado = await fileTypeFromBuffer(arquivo.buffer);
    if (!tipoDetectado || !allowedImageTypes.has(tipoDetectado.mime)) {
        throw new HttpError(400, "Um dos arquivos não é uma imagem JPG, PNG ou WEBP válida.");
    }
    return tipoDetectado;
}

async function enviarParaImgBB(arquivo, tipo) {
    const apiKey = process.env.IMGBB_API_KEY;
    if (!apiKey) {
        throw new HttpError(503, "O servidor não está configurado com a chave do ImgBB.");
    }

    const corpo = new FormData();
    corpo.append("image", new Blob([arquivo.buffer], { type: tipo.mime }), `imagem.${tipo.ext}`);

    let resposta;
    try {
        resposta = await fetch(`https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`, {
            method: "POST",
            body: corpo,
            signal: AbortSignal.timeout(30_000),
        });
    } catch {
        throw new HttpError(502, "Não foi possível conectar ao ImgBB. Tente novamente.");
    }

    let resultado;
    try {
        resultado = await resposta.json();
    } catch {
        throw new HttpError(502, "O ImgBB retornou uma resposta inválida.");
    }

    const url = resultado?.data?.url;
    let urlSegura = false;
    if (typeof url === "string") {
        try {
            urlSegura = new URL(url).protocol === "https:";
        } catch {
            urlSegura = false;
        }
    }
    if (!resposta.ok || !urlSegura) {
        throw new HttpError(502, "O ImgBB não conseguiu armazenar uma das imagens.");
    }
    return url;
}

async function salvarProduto(produto) {
    let resposta;
    try {
        resposta = await fetch(productsUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(produto),
            signal: AbortSignal.timeout(15_000),
        });
    } catch {
        throw new HttpError(502, "Não foi possível conectar ao banco de dados. O produto não foi salvo.");
    }

    const texto = await resposta.text();
    if (!resposta.ok) {
        throw new HttpError(502, "O banco de dados recusou o cadastro. O produto não foi salvo.");
    }
    if (!texto) {
        return null;
    }
    try {
        return JSON.parse(texto);
    } catch {
        throw new HttpError(502, "O banco de dados retornou uma resposta inválida.");
    }
}

app.post("/api/produtos", (req, res, next) => {
    upload.fields(imageFields)(req, res, async (erroUpload) => {
        if (erroUpload) {
            next(erroUpload);
            return;
        }

        try {
            const produto = validarProduto(req.body);
            const arquivos = [
                ...(req.files?.imagem1 || []),
                ...(req.files?.imagem2 || []),
            ];
            const urls = [];

            for (const arquivo of arquivos) {
                const tipo = await validarTipoReal(arquivo);
                urls.push(await enviarParaImgBB(arquivo, tipo));
            }

            produto.imagens = urls;
            const registro = await salvarProduto(produto);
            res.status(201).json({ produto: registro, imagens: urls });
        } catch (erro) {
            next(erro);
        }
    });
});

app.get("/", (_req, res) => {
    res.sendFile(path.join(projectRoot, "index.html"));
});

for (const diretorio of ["view", "controller", "css", "images", "model"]) {
    app.use(`/${diretorio}`, express.static(path.join(projectRoot, diretorio), { dotfiles: "deny" }));
}

app.use((erro, _req, res, _next) => {
    if (erro instanceof multer.MulterError) {
        const status = erro.code === "LIMIT_FILE_SIZE" ? 413 : 400;
        const mensagem = erro.code === "LIMIT_FILE_SIZE"
            ? "Cada imagem pode ter no máximo 32 MB."
            : "Envie no máximo duas imagens, uma por campo.";
        res.status(status).json({ error: mensagem });
        return;
    }
    if (erro instanceof HttpError) {
        res.status(erro.status).json({ error: erro.message });
        return;
    }
    console.error("Erro inesperado no servidor:", erro);
    res.status(500).json({ error: "Ocorreu um erro interno ao cadastrar o produto." });
});

app.listen(port, () => {
    console.log(`Broto disponível em http://localhost:${port}`);
});
