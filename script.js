'use strict';

const STORAGE_KEY = 'books';
const INDEFINIDO = 'Indefinido';

let indiceEmEdicao = null;

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

function formatarAno(ano) {
    if (ano === null || ano === undefined || ano === '') {
        return INDEFINIDO;
    }
    const numero = Number(ano);
    if (!Number.isInteger(numero) || numero === 0) {
        return INDEFINIDO;
    }
    return numero < 0 ? `${Math.abs(numero)} a.C.` : `${numero}`;
}

function formatarAutor(autor) {
    const texto = String(autor ?? '').trim();
    return texto || INDEFINIDO;
}

function valorCampo(id) {
    return document.querySelector(`#${id}`).value.trim();
}

function limparFormulario() {
    ['titulo', 'autor', 'genero', 'ano', 'preco', 'quantidade', 'situacao'].forEach((id) => {
        document.querySelector(`#${id}`).value = '';
    });
}

function lerFormulario() {
    const titulo = valorCampo('titulo');
    const autor = formatarAutor(valorCampo('autor'));
    const genero = valorCampo('genero');
    const anoTexto = valorCampo('ano');
    const precoTexto = valorCampo('preco');
    const quantidadeTexto = valorCampo('quantidade');
    const situacao = valorCampo('situacao');

    const preco = Number(precoTexto);
    const quantidade = Number(quantidadeTexto);

    // Autor e ano são opcionais; os demais campos continuam obrigatórios.
    if (!titulo || !genero || !precoTexto || !quantidadeTexto || !situacao) {
        mostrarMensagem('Preencha título, gênero, preço, quantidade e conservação.', true);
        return null;
    }

    // Ano em branco = indefinido (null). Negativo = a.C.
    let ano = null;
    if (anoTexto !== '') {
        ano = Number(anoTexto);
        if (!Number.isInteger(ano) || ano === 0 || ano < -9999 || ano > 9999) {
            mostrarMensagem('Informe um ano válido (de 1 a 9999, ou negativo para a.C., ex.: -380), ou deixe em branco.', true);
            return null;
        }
    }

    if (!Number.isFinite(preco) || preco < 0) {
        mostrarMensagem('Informe um preço válido, igual ou maior que zero.', true);
        return null;
    }

    if (!Number.isInteger(quantidade) || quantidade < 0) {
        mostrarMensagem('A quantidade deve ser um número inteiro igual ou maior que zero.', true);
        return null;
    }

    return { titulo, autor, genero, ano, preco, quantidade, situacao };
}

function addBook() {
    const dados = lerFormulario();
    if (!dados) return;

    if (indiceEmEdicao !== null) {
        salvarEdicao(dados);
        return;
    }

    livros.push(dados);

    if (!salvarLivros()) {
        livros.pop();
        return;
    }

    limparFormulario();
    listarLivros(livros);
    mostrarMensagem('Livro cadastrado com sucesso.');
}

function iniciarEdicao(indice) {
    const livro = livros[indice];
    if (!livro) {
        mostrarMensagem('Livro não encontrado. Atualize a lista e tente novamente.', true);
        listarLivros(livros);
        return;
    }

    indiceEmEdicao = indice;

    document.querySelector('#titulo').value = livro.titulo ?? '';
    document.querySelector('#autor').value =
        formatarAutor(livro.autor) === INDEFINIDO ? '' : livro.autor;
    document.querySelector('#genero').value = livro.genero ?? '';
    document.querySelector('#ano').value =
        formatarAno(livro.ano) === INDEFINIDO ? '' : livro.ano;
    document.querySelector('#preco').value = livro.preco ?? '';
    document.querySelector('#quantidade').value = livro.quantidade ?? '';
    document.querySelector('#situacao').value = livro.situacao ?? '';

    document.querySelector('#btn-adicionar').textContent = 'Salvar alterações';
    document.querySelector('#btn-cancelar-edicao').hidden = false;

    document.querySelector('.form-cadastro').scrollIntoView({ behavior: 'smooth', block: 'start' });
    mostrarMensagem(`Editando "${livro.titulo}". Altere os campos e clique em "Salvar alterações".`);
}

function sairDoModoEdicao() {
    indiceEmEdicao = null;
    limparFormulario();
    document.querySelector('#btn-adicionar').textContent = 'Adicionar';
    document.querySelector('#btn-cancelar-edicao').hidden = true;
}

function salvarEdicao(dados) {
    const anterior = livros[indiceEmEdicao];
    if (!anterior) {
        mostrarMensagem('Livro não encontrado.', true);
        sairDoModoEdicao();
        listarLivros(livros);
        return;
    }

    livros[indiceEmEdicao] = dados;

    if (!salvarLivros()) {
        livros[indiceEmEdicao] = anterior;
        return;
    }

    sairDoModoEdicao();
    listarLivros(livros);
    mostrarMensagem('Livro atualizado com sucesso.');
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
        div.append(criarTexto('p', `Autor: ${formatarAutor(livro.autor)}`));
        div.append(criarTexto('p', `Gênero: ${livro.genero || '—'}`));
        div.append(criarTexto('p', `Ano: ${formatarAno(livro.ano)}`));

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

        const botaoEditar = document.createElement('button');
        botaoEditar.type = 'button';
        botaoEditar.textContent = 'Editar';
        botaoEditar.addEventListener('click', () => iniciarEdicao(indice));

        const botaoExcluir = document.createElement('button');
        botaoExcluir.type = 'button';
        botaoExcluir.className = 'secondary';
        botaoExcluir.textContent = 'Excluir';
        botaoExcluir.addEventListener('click', () => excluirLivro(indice));

        div.append(botaoVenda, botaoEditar, botaoExcluir);
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
            livro.titulo, formatarAutor(livro.autor), livro.genero, livro.ano, formatarAno(livro.ano), livro.situacao
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
        if (indiceEmEdicao === indice) {
            document.querySelector('#quantidade').value = livro.quantidade;
        }
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
            if (indiceEmEdicao !== null) {
                sairDoModoEdicao();
            }
            listarLivros(livros);
            mostrarMensagem('Livro excluído.');
        } else {
            livros.splice(indice, 0, removido);
            listarLivros(livros);
        }
    }
}

document.querySelector('#btn-adicionar').addEventListener('click', addBook);
document.querySelector('#btn-cancelar-edicao').addEventListener('click', () => {
    sairDoModoEdicao();
    mostrarMensagem('Edição cancelada.');
});
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