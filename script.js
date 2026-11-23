'use strict';

const STORAGE_KEY = 'books';

function carregarLivros() {
    try {
        const dados = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        return Array.isArray(dados) ? dados : [];
    } catch (erro) {
        console.error('Não foi possível ler os livros salvos:', erro);
        return [];
    }
}

let livros = carregarLivros();

function salvarLivros() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(livros));
        return true;
    } catch (erro) {
        console.error('Não foi possível salvar os livros:', erro);
        mostrarMensagem('Não foi possível salvar os dados neste navegador.', true);
        return false;
    }
}

function mostrarMensagem(texto, erro = false) {
    const mensagem = document.querySelector('#mensagem');
    mensagem.textContent = texto;
    mensagem.classList.toggle('erro', erro);
}

function valorCampo(id) {
    return document.querySelector(`#${id}`).value.trim();
}

function addBook() {
    const titulo = valorCampo('titulo');
    const autor = valorCampo('autor');
    const genero = valorCampo('genero');
    const anoTexto = valorCampo('ano');
    const precoTexto = valorCampo('preco');
    const quantidadeTexto = valorCampo('quantidade');
    const situacao = valorCampo('situacao');

    const ano = Number(anoTexto);
    const preco = Number(precoTexto);
    const quantidade = Number(quantidadeTexto);

    if (!titulo || !autor || !genero || !anoTexto || !precoTexto ||
        !quantidadeTexto || !situacao) {
        mostrarMensagem('Preencha todos os campos.', true);
        return;
    }

    if (!Number.isInteger(ano) || ano < 1 || ano > 9999) {
        mostrarMensagem('Informe um ano válido (de 1 a 9999).', true);
        return;
    }

    if (!Number.isFinite(preco) || preco < 0) {
        mostrarMensagem('Informe um preço válido, igual ou maior que zero.', true);
        return;
    }

    if (!Number.isInteger(quantidade) || quantidade < 0) {
        mostrarMensagem('A quantidade deve ser um número inteiro igual ou maior que zero.', true);
        return;
    }

    livros.push({ titulo, autor, genero, ano, preco, quantidade, situacao });

    if (!salvarLivros()) {
        livros.pop();
        return;
    }

    document.querySelector('#titulo').value = '';
    document.querySelector('#autor').value = '';
    document.querySelector('#genero').value = '';
    document.querySelector('#ano').value = '';
    document.querySelector('#preco').value = '';
    document.querySelector('#quantidade').value = '';
    document.querySelector('#situacao').value = '';

    listarLivros(livros);
    mostrarMensagem('Livro cadastrado com sucesso.');
}

function criarTexto(tag, texto) {
    const elemento = document.createElement(tag);
    elemento.textContent = texto;
    return elemento;
}

function listarLivros(catalogoLivros = livros) {
    const catalogo = document.querySelector('#catalogo');
    catalogo.replaceChildren();

    if (catalogoLivros.length === 0) {
        catalogo.append(criarTexto('p', 'Nenhum livro para exibir.'));
        return;
    }

    catalogoLivros.forEach((livro) => {
        const indice = livros.indexOf(livro);
        const div = document.createElement('article');
        div.className = 'livro';

        div.append(criarTexto('h3', livro.titulo || 'Título não informado'));
        div.append(criarTexto('p', `Autor: ${livro.autor || '—'}`));
        div.append(criarTexto('p', `Gênero: ${livro.genero || '—'}`));
        div.append(criarTexto('p', `Ano: ${livro.ano ?? '—'}`));

        const preco = Number(livro.preco ?? 0);
        div.append(criarTexto('p', `Preço: ${Number.isFinite(preco)
            ? preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
            : 'Preço inválido'}`));

        const quantidade = Number(livro.quantidade ?? 0);
        div.append(criarTexto('p', `Qtd. disponível: ${quantidade}`));
        div.append(criarTexto('p', `Conservação: ${livro.situacao || '—'}`));

        const botaoVenda = document.createElement('button');
        botaoVenda.type = 'button';
        botaoVenda.textContent = 'Registrar venda';
        botaoVenda.disabled = !Number.isInteger(quantidade) || quantidade <= 0;
        botaoVenda.addEventListener('click', () => registrarVenda(indice));

        const botaoExcluir = document.createElement('button');
        botaoExcluir.type = 'button';
        botaoExcluir.className = 'secondary';
        botaoExcluir.textContent = 'Excluir';
        botaoExcluir.addEventListener('click', () => excluirLivro(indice));

        div.append(botaoVenda, botaoExcluir);
        catalogo.append(div);
    });
}

function buscarLivro() {
    const termo = document.querySelector('#termo-busca').value.trim().toLocaleLowerCase('pt-BR');

    if (!termo) {
        listarLivros(livros);
        mostrarMensagem('Exibindo todos os livros.');
        return;
    }

    const resultado = livros.filter((livro) => {
        const campos = [
            livro.titulo, livro.autor, livro.genero, livro.ano, livro.situacao
        ];
        return campos.some((campo) =>
            String(campo ?? '').toLocaleLowerCase('pt-BR').includes(termo)
        );
    });

    listarLivros(resultado);
    mostrarMensagem(resultado.length
        ? `${resultado.length} livro(s) encontrado(s).`
        : 'Nenhum livro encontrado.');
}

function registrarVenda(indice) {
    const livro = livros[indice];
    if (!livro) {
        mostrarMensagem('Livro não encontrado. Atualize a lista e tente novamente.', true);
        listarLivros(livros);
        return;
    }

    const estoque = Number(livro.quantidade);
    if (!Number.isInteger(estoque) || estoque <= 0) {
        mostrarMensagem('Este livro está esgotado.', true);
        return;
    }

    const resposta = prompt(`Quantos exemplares de "${livro.titulo}" foram vendidos?`);
    if (resposta === null) return;

    const quantidadeVendida = Number(resposta.trim());
    if (!resposta.trim() || !Number.isInteger(quantidadeVendida) || quantidadeVendida <= 0) {
        mostrarMensagem('Informe uma quantidade inteira válida, maior que zero.', true);
        return;
    }

    if (quantidadeVendida > estoque) {
        mostrarMensagem('Quantidade indisponível no estoque.', true);
        return;
    }

    livro.quantidade = estoque - quantidadeVendida;
    if (salvarLivros()) {
        listarLivros(livros);
        mostrarMensagem('Venda registrada e estoque atualizado.');
    }
}

function excluirLivro(indice) {
    const livro = livros[indice];
    if (!livro) {
        mostrarMensagem('Livro não encontrado.', true);
        listarLivros(livros);
        return;
    }

    if (confirm(`Deseja realmente excluir "${livro.titulo}"?`)) {
        const removido = livros.splice(indice, 1)[0];
        if (salvarLivros()) {
            listarLivros(livros);
            mostrarMensagem('Livro excluído.');
        } else {
            livros.splice(indice, 0, removido);
            listarLivros(livros);
        }
    }
}

document.querySelector('#btn-adicionar').addEventListener('click', addBook);
document.querySelector('#btn-buscar').addEventListener('click', buscarLivro);
document.querySelector('#btn-limpar-busca').addEventListener('click', () => {
    document.querySelector('#termo-busca').value = '';
    listarLivros(livros);
    mostrarMensagem('Exibindo todos os livros.');
});

document.querySelector('#termo-busca').addEventListener('keydown', (evento) => {
    if (evento.key === 'Enter') buscarLivro();
});

listarLivros(livros);
