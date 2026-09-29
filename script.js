let candidatosDados = {};
let cargoAtualAtivo = '';
let qtdDigitosAtual = 0;

// Objeto para gerenciar as escolhas atuais do eleitor
let colinhaSalva = {
    deputado_federal: null,
    senador_1: null,
    senador_2: null,
    governador: null,
    presidente: null
};

document.addEventListener('DOMContentLoaded', () => {
    // Carrega a base de dados simulada de SC
    fetch('candidatos-sc.json')
        .then(res => res.json())
        .then(data => {
            candidatosDados = data;
        })
        .catch(err => console.error('Erro ao carregar JSON:', err));
});

function abrirBusca(cargo, nomeExibicao, digitos) {
    cargoAtualAtivo = cargo;
    qtdDigitosAtual = digitos;

    document.getElementById('busca-nome-cargo').textContent = nomeExibicao;
    document.getElementById('busca-digitos').textContent = `${digitos} dígitos`;
    document.getElementById('input-pesquisa').value = '';
    
    document.getElementById('tela-colinha').classList.remove('active');
    document.getElementById('tela-busca').classList.add('active');

    const container = document.getElementById('lista-resultados');
    container.innerHTML = `
        <div id="mensagem-vazia" style="text-align:center; margin-top:40px; font-family:sans-serif;">
            <p style="color:#777; font-size:0.95rem; margin-bottom:12px;">Nenhum candidato encontrado.</p>
            <a href="#" id="btn-ver-lista" style="color:#2ecc71; font-weight:bold; text-decoration:none; font-size:1.05rem;" onclick="mostrarListaCompleta(event)">Clique para ver a lista</a>
        </div>
    `;
}

function fecharBusca() {
    document.getElementById('tela-busca').classList.remove('active');
    document.getElementById('tela-colinha').classList.add('active');
}

function mostrarListaCompleta(event) {
    if(event) event.preventDefault();
    const listaCompleta = candidatosDados[cargoAtualAtivo] || [];
    renderizarLista(listaCompleta);
}

function renderizarLista(lista) {
    const container = document.getElementById('lista-resultados');
    container.innerHTML = '';

    lista.sort((a, b) => a.nome.localeCompare(b.nome));

    if (lista.length === 0) {
        container.innerHTML = `
            <div id="mensagem-vazia" style="text-align:center; margin-top:40px;">
                <p style="color:#777; font-size:0.95rem; margin-bottom:12px;">Nenhum candidato encontrado.</p>
                <a href="#" id="btn-ver-lista" style="color:#2ecc71; font-weight:bold; text-decoration:none; font-size:1.05rem;" onclick="mostrarListaCompleta(event)">Clique para ver a lista</a>
            </div>
        `;
        return;
    }

    lista.forEach(cand => {
        const card = document.createElement('div');
        card.className = 'card-resultado';
        card.onclick = () => selecionarCandidato(cand);

        card.innerHTML = `
            <img src="${cand.foto}" class="img-resultado" alt="${cand.nome}">
            <div class="info-resultado">
                <span class="nome">${cand.nome}</span>
                <span class="partido">${cand.partido}</span>
            </div>
            <div class="numero-resultado">${cand.numero}</div>
        `;
        container.appendChild(card);
    });
}

function filtrarCandidatos() {
    const termo = document.getElementById('input-pesquisa').value.toLowerCase();
    const listaCompleta = candidatosDados[cargoAtualAtivo] || [];

    if (termo.trim() === '') {
        abrirBusca(cargoAtualAtivo, document.getElementById('busca-nome-cargo').textContent, qtdDigitosAtual);
        return;
    }

    const listaFiltrada = listaCompleta.filter(cand => 
        cand.nome.toLowerCase().includes(termo) || 
        cand.partido.toLowerCase().includes(termo) || 
        cand.numero.includes(termo)
    );

    renderizarLista(listaFiltrada);
}

function selecionarCandidato(candidato) {
    if (cargoAtualAtivo === 'senador_1' && colinhaSalva.senador_2 && colinhaSalva.senador_2.numero === candidato.numero) {
        alert('Aviso: Você já selecionou este candidato para a 2ª vaga de Senador.');
        return;
    }
    if (cargoAtualAtivo === 'senador_2' && colinhaSalva.senador_1 && colinhaSalva.senador_1.numero === candidato.numero) {
        alert('Aviso: Você já selecionou este candidato para a 1ª vaga de Senador.');
        return;
    }

    colinhaSalva[cargoAtualAtivo] = candidato;
    atualizarInterfaceCargo(cargoAtualAtivo, candidato);
    fecharBusca();
}

function atualizarInterfaceCargo(cargo, candidato) {
    const txtStatus = document.getElementById(`txt-${cargo}`);
    const containerBlocos = document.getElementById(`blocos-${cargo}`);
    
    if (!containerBlocos) return;

    const qtdDigitos = cargo === 'deputado_federal' ? 4 : (cargo.startsWith('senador') ? 3 : 2);

    if (candidato) {
        txtStatus.textContent = `${candidato.nome} (${candidato.partido})`;
        txtStatus.style.color = '#0d3b66';

        containerBlocos.innerHTML = '';
        const digitosArray = candidato.numero.split('');
        for (let i = 0; i < qtdDigitos; i++) {
            const span = document.createElement('span');
            span.textContent = digitosArray[i] || '';
            containerBlocos.appendChild(span);
        }
    } else {
        txtStatus.textContent = 'Escolher Candidato';
        txtStatus.style.color = '#2ecc71';
        containerBlocos.innerHTML = '';
        for (let i = 0; i < qtdDigitos; i++) {
            const span = document.createElement('span');
            containerBlocos.appendChild(span);
        }
    }
}

function salvarColinhaDefinitivo() {
    const containerPrint = document.getElementById('lista-cargos-print');
    containerPrint.innerHTML = ''; 

    let htmlCargos = `
        <div class="item-cargo fixo">
            <img src="carlinha.png" alt="Carla Z. Pereira" class="avatar-candidato">
            <div class="cargo-detalhe">
                <span class="label-cargo">DEPUTADO ESTADUAL</span>
                <strong class="nome-fixo">Carla Z. Pereira</strong>
                <span class="partido-fixo">PODE</span>
            </div>
            <div class="blocos-numero">
                <span>2</span><span>0</span><span>0</span><span>5</span><span>5</span>
            </div>
        </div>
    `;

    const ordemCargos = [
        { chave: 'deputado_federal', label: 'DEPUTADO FEDERAL', digitos: 4 },
        { chave: 'senador_1', label: 'SENADOR (1ª VAGA)', digitos: 3 },
        { chave: 'senador_2', label: 'SENADOR (2ª VAGA)', digitos: 3 },
        { chave: 'governador', label: 'GOVERNADOR', digitos: 2 },
        { chave: 'presidente', label: 'PRESIDENTE', digitos: 2 }
    ];

    ordemCargos.forEach(cargo => {
        const escolheu = colinhaSalva[cargo.chave];
        let blocosHtml = '';
        
        const digitosArray = escolheu ? escolheu.numero.split('') : [];
        for (let i = 0; i < cargo.digitos; i++) {
            blocosHtml += `<span>${digitosArray[i] || ''}</span>`;
        }

        htmlCargos += `
            <div class="item-cargo fixo">
                <div class="${escolheu ? 'avatar-candidato' : 'avatar-placeholder'}" style="background-color: ${escolheu ? 'rgba(255, 223, 0, 0.2)' : '#edf1f4'}; border: 3px solid #009c3b;"></div>
                                <div class="cargo-detalhe">
                    <span class="label-cargo">${cargo.label}</span>
                    <!-- Reduzido o tamanho do tracejado aqui embaixo -->
                    <strong class="nome-fixo">${escolheu ? escolheu.nome : '_______________'}</strong>
                    <span class="partido-fixo">${escolheu ? escolheu.partido : ''}</span>
                </div>

                <div class="blocos-numero">
                    ${blocosHtml}
                </div>
            </div>
        `;
    });

    containerPrint.innerHTML = htmlCargos;
    document.getElementById('modal-impressao').classList.add('active');
}

function fecharModalImpressao() {
    document.getElementById('modal-impressao').classList.remove('active');
}

// 💾 FUNÇÃO RECONSTITUÍDA E SEGURA PARA DOWNLOAD DO PDF
function gerarPDFColinha() {
    const elemento = document.getElementById('area-impressao-conteudo');
    const opcoes = {
        margin:       10,
        filename:     'minha-colinha-2026.pdf',
        image:        { type: 'jpeg', quality: 1.0 },
        html2canvas:  { scale: 3, useCORS: true, letterRendering: true, scrollY: 0, scrollX: 0 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opcoes).from(elemento).save();
}

function limparColinha() {
    if (confirm("Deseja realmente limpar todos os campos selecionados?")) {
        colinhaSalva = { deputado_federal: null, senador_1: null, senador_2: null, governador: null, presidente: null };
        Object.keys(colinhaSalva).forEach(cargo => {
            atualizarInterfaceCargo(cargo, null);
        });
    }
}
