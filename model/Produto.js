export class Produto {
    constructor(nome, quantidade, preco, produtor, local, excedente, imagens = []) {
        this.produto = nome;
        this.quantidade = quantidade;
        this.preco = preco;
        this.produtor = produtor;
        this.local = local;
        this.excedente = excedente;
        this.imagens = Array.isArray(imagens) ? imagens : [];
    }
}
