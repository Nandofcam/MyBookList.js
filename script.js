const livros = JSON.parse(localStorage.getItem('books')) || []

function salvarLivros() {
    localStorage.setItem('books', JSON.stringify(livros))
}


function addBook() {
    const titulo = document.querySelector('#titulo')
    const autor = document.querySelector('#autor')
    const genero = document.querySelector('#genero')
    const ano = document.querySelector('#ano')
    const situacao = document.querySelector('#situacao')
    const preco = document.querySelector('#preco')
    const quantidade = document.querySelector('#quantidade')

    // Verifica se os campos foram preenchidos
    if (
        !titulo.value.trim() ||
        !autor.value.trim() ||
        !genero.value.trim() ||
        !ano.value ||
        !situacao.value ||
        preco.value === '' ||
        quantidade.value === ''
    ) {
        alert('Preencha todos os campos!')
        return
    }

    const livro = {
        titulo: titulo.value, 
        autor: autor.value,
        genero: genero.value,
        ano: Number(ano.value),
        preco: Number(preco.value),
        quantidade: Number(quantidade.value),
        situacao: situacao.value
    }

    livros.push(livro)

    alert('Livro cadastrado com sucesso!')
    
    titulo.value = ''
    autor.value = ''
    genero.value = ''
    ano.value = ''
    preco.value = ''
    quantidade.value = ''
    situacao.value = ''

    listarLivros(livros)
    salvarLivros()
}

function listarLivros(catalogoLivros) {
    const catalogo = document.querySelector('#catalogo')
    catalogo.innerHTML = ''

    for (const livro of catalogoLivros) {
        const div = document.createElement('div')
        div.classList.add('livro')
        const preco = Number(livro.preco ?? 0)
        const quantidade = Number(livro.quantidade ?? 1)

        div.innerHTML = `<h3>${livro.titulo}</h3>
                        <p>Autor: ${livro.autor}</p>
                        <p>Genero: ${livro.genero}</p>
                        <p>Ano: ${livro.ano}</p>
                        <p>Preço: ${preco.toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                        })}</p>
                        <p>Qtd. disponível: ${quantidade}</p>
                        <p>Conservação: ${livro.situacao}</p>`
        catalogo.append(div)
        
        const indice = livros.indexOf(livro) //Identifica a posição do livro

        div.innerHTML += `
            <button onclick="registrarVenda(${indice})"
                ${quantidade === 0 ? 'disabled' : ''}>
                Registrar venda
            </button>
        ` //Botão para registrar as vendas, com função de desabilitar o botão quando não há mais livros
        
        div.innerHTML += `
            <button onclick="excluirLivro(${indice})">
                Excluir
            </button>
        ` //Botão para excluir o livro do catálogo
    }
}

function buscarLivro() {
    const termo = document.querySelector('#termo-busca').value.toLowerCase()

    const resultado = livros.filter(livro => livro.titulo.toLowerCase().includes(termo) || livro.autor.toLowerCase().includes(termo) || livro.genero.toLowerCase().includes(termo) || livro.ano.toString().includes(termo) || livro.situacao.toLowerCase().includes(termo))

    if (resultado.length > 0) {
        listarLivros(resultado)
    }
    else {
        alert('Livro(s) não encontrado(s)!')
        listarLivros(livros)
    }
}

listarLivros(livros)

function registrarVenda(indice) {
    const livro = livros[indice]

    if (livro.quantidade <= 0) {
        alert('Este livro está esgotado!')
        return
    }

    const quantidadeVendida = Number(
        prompt(`Quantos exemplares de "${livro.titulo}" foram vendido?`)
    )

    if (
        !Number.isInteger(quantidadeVendida) ||
        quantidadeVendida <= 0
    ) {
        alert('Informe uma quantidade válida!')
        return
    }

    if (quantidadeVendida > livro.quantidade) {
        alert('Quantidade indisponível no estoque!')
        return
    }

    livro.quantidade -= quantidadeVendida //Atualização do estoque

    salvarLivros()
    listarLivros(livros)

    alert('Venda registrada com sucesso!')
}

function excluirLivro(indice) {
    const confirmar = confirm(
        `Deseja realmente excluir "${livros[indice].titulo}"?`
    )

    if (confirmar) {
        livros.splice(indice, 1)

        salvarLivros()
        listarLivros(livros)

        alert('Livro excluído com sucesso!')
    }
}
