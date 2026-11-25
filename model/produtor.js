const chaveProdutor = "broto-produtor-id";

export function identificarProdutor() {
    let id = localStorage.getItem(chaveProdutor);
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem(chaveProdutor, id);
    }
    return id;
}
