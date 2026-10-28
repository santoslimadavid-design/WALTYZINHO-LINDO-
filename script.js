
/* ==========================================
   DESAFIO DO DESENVOLVEDOR
   Computadores, Windows e Inteligência Artificial
========================================== */

const personagem = document.getElementById("personagem");
const jogo = document.getElementById("jogo");
const pontosTexto = document.getElementById("pontos");
const faseTexto = document.getElementById("fase");
const vidasTexto = document.getElementById("vidas");
const nomeJogador = document.getElementById("nomeJogador");
const mensagem = document.getElementById("mensagem");
const moedas = [...document.querySelectorAll(".moeda")];
const obstaculos = [...document.querySelectorAll(".obstaculo")];
const saida = document.getElementById("saida");

const TOTAL_FASES = 5;
const VELOCIDADE = 220;
const VIDAS_INICIAIS = 3;

let x = 30;
let y = 55;
let pontos = 0;
let fase = 1;
let vidas = VIDAS_INICIAIS;
let nome = "";
let jogoIniciado = false;
let perguntaAberta = false;
let finalizado = false;
let ultimaColisao = 0;
let ultimaAtualizacao = 0;

const teclas = new Set();
const moedasColetadas = new Set();


// ==========================================
// PERGUNTAS DO JOGO
// ==========================================

const perguntas = [
    {
        pergunta: "Qual foi um dos primeiros computadores eletrônicos de grande porte?",
        opcoes: ["ENIAC", "Windows", "Android", "PlayStation"],
        resposta: 0
    },
    {
        pergunta: "Qual empresa desenvolveu o sistema operacional Windows?",
        opcoes: ["Google", "Microsoft", "Samsung", "Intel"],
        resposta: 1
    },
    {
        pergunta: "O que significa a sigla IA?",
        opcoes: [
            "Internet Automática",
            "Informação Avançada",
            "Inteligência Artificial",
            "Instalação de Aplicativos"
        ],
        resposta: 2
    },
    {
        pergunta: "Para que serve o Windows?",
        opcoes: [
            "Gerenciar o computador e executar programas",
            "Somente assistir vídeos",
            "Apenas editar fotos",
            "Substituir as peças do computador"
        ],
        resposta: 0
    },
    {
        pergunta: "O que a inteligência artificial pode fazer?",
        opcoes: [
            "Aprender padrões e responder perguntas",
            "Funcionar sem energia",
            "Substituir todos os computadores",
            "Servir apenas como calculadora"
        ],
        resposta: 0
    }
];


// ==========================================
// PAINEL E MENSAGENS
// ==========================================

function atualizarPainel() {
    pontosTexto.textContent = pontos;
    faseTexto.textContent = fase;
    vidasTexto.textContent = vidas;
    nomeJogador.textContent = nome || "---";
}

function escaparHTML(texto) {
    return String(texto).replace(/[&<>"']/g, caractere => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[caractere]);
}

function mostrarMensagem(titulo, texto, botao = "") {
    mensagem.innerHTML = `
        <h2>${titulo}</h2>
        <p>${texto}</p>
        ${botao}
    `;
    mensagem.style.display = "block";
}

function pausarJogo() {
    jogoIniciado = false;
    teclas.clear();
}


// ==========================================
// INICIAR COM BOTÃO OU ENTER
// ==========================================

mensagem.addEventListener("click", event => {
    const botao = event.target.closest("button");
    if (!botao) return;

    if (botao.id === "iniciar") {
        iniciarJogo();
    } else if (botao.id === "continuar") {
        continuarJogo();
    } else if (botao.id === "reiniciar") {
        reiniciarJogo();
    } else if (botao.dataset.resposta !== undefined) {
        responderPergunta(Number(botao.dataset.resposta));
    }
});

document.addEventListener("keydown", event => {
    const campoNome = document.getElementById("nome");

    if (
        event.key === "Enter" &&
        campoNome &&
        event.target === campoNome &&
        mensagem.style.display !== "none"
    ) {
        event.preventDefault();
        iniciarJogo();
        return;
    }

    if (!jogoIniciado || perguntaAberta || finalizado) return;

    const tecla = event.key.toLowerCase();
    const controles = [
        "arrowup", "arrowdown", "arrowleft", "arrowright",
        "w", "a", "s", "d"
    ];

    if (controles.includes(tecla)) {
        event.preventDefault();
        teclas.add(tecla);
    }
});

document.addEventListener("keyup", event => {
    teclas.delete(event.key.toLowerCase());
});

window.addEventListener("blur", () => teclas.clear());

function iniciarJogo() {
    const campoNome = document.getElementById("nome");
    if (!campoNome || jogoIniciado || finalizado) return;

    const digitado = campoNome.value.trim();

    if (!digitado) {
        campoNome.placeholder = "Digite seu nome primeiro!";
        campoNome.focus();
        return;
    }

    nome = digitado.slice(0, 20);
    jogoIniciado = true;
    perguntaAberta = false;

    resetarPersonagem();
    atualizarPainel();
    mensagem.style.display = "none";
}


// ==========================================
// MOVIMENTAÇÃO
// ==========================================

function atualizarMovimento(delta) {
    if (!jogoIniciado || perguntaAberta || finalizado) return;

    let dx = 0;
    let dy = 0;

    if (teclas.has("arrowup") || teclas.has("w")) dy--;
    if (teclas.has("arrowdown") || teclas.has("s")) dy++;
    if (teclas.has("arrowleft") || teclas.has("a")) dx--;
    if (teclas.has("arrowright") || teclas.has("d")) dx++;

    if (dx === 0 && dy === 0) return;

    const tamanho = Math.hypot(dx, dy);
    dx = dx / tamanho * VELOCIDADE * delta;
    dy = dy / tamanho * VELOCIDADE * delta;

    moverPersonagem(dx, dy);
}

function moverPersonagem(dx, dy) {
    const largura = personagem.offsetWidth;
    const altura = personagem.offsetHeight;

    const maxX = jogo.clientWidth - largura;
    const maxY = jogo.clientHeight - altura;

    const novoX = Math.max(0, Math.min(maxX, x + dx));
    const novoY = Math.max(0, Math.min(maxY, y + dy));

    let bloqueado = false;

    if (!colideComObstaculo(novoX, y, largura, altura)) {
        x = novoX;
    } else if (dx !== 0) {
        bloqueado = true;
    }

    if (!colideComObstaculo(x, novoY, largura, altura)) {
        y = novoY;
    } else if (dy !== 0) {
        bloqueado = true;
    }

    posicionarPersonagem();

    if (bloqueado) perderVidaPorColisao();
    if (!jogoIniciado) return;

    verificarMoedas();
    verificarSaida();
}

function colideComObstaculo(px, py, largura, altura) {
    return obstaculos.some(obstaculo => {
        const ox = obstaculo.offsetLeft;
        const oy = obstaculo.offsetTop;

        return (
            px < ox + obstaculo.offsetWidth &&
            px + largura > ox &&
            py < oy + obstaculo.offsetHeight &&
            py + altura > oy
        );
    });
}

function posicionarPersonagem() {
    personagem.style.left = `${x}px`;
    personagem.style.top = `${y}px`;
}

function resetarPersonagem() {
    teclas.clear();
    x = 30;
    y = 55;
    posicionarPersonagem();
}


// ==========================================
// COLETAR ESTRELAS
// ==========================================

function verificarMoedas() {
    const jogador = personagem.getBoundingClientRect();

    moedas.forEach((moeda, indice) => {
        if (moedasColetadas.has(indice)) return;

        const estrela = moeda.getBoundingClientRect();

        const coletou =
            jogador.right > estrela.left &&
            jogador.left < estrela.right &&
            jogador.bottom > estrela.top &&
            jogador.top < estrela.bottom;

        if (coletou) {
            moedasColetadas.add(indice);
            moeda.style.display = "none";
            pontos += 10;
            atualizarPainel();
        }
    });
}

function resetarMoedas() {
    moedasColetadas.clear();
    moedas.forEach(moeda => moeda.style.display = "");
}


// ==========================================
// PORTA E PERGUNTAS
// ==========================================

function verificarSaida() {
    if (perguntaAberta || finalizado) return;

    const jogador = personagem.getBoundingClientRect();
    const porta = saida.getBoundingClientRect();

    if (
        jogador.right > porta.left &&
        jogador.left < porta.right &&
        jogador.bottom > porta.top &&
        jogador.top < porta.bottom
    ) {
        abrirPergunta();
    }
}

function abrirPergunta() {
    if (perguntaAberta || finalizado) return;

    pausarJogo();
    perguntaAberta = true;

    const atual = perguntas[fase - 1];

    const opcoesHTML = atual.opcoes.map((opcao, indice) => `
        <button type="button" data-resposta="${indice}">
            ${String.fromCharCode(65 + indice)}. ${escaparHTML(opcao)}
        </button>
    `).join("");

    mensagem.innerHTML = `
        <h2>🧠 Desafio da Fase ${fase}</h2>
        <p>${escaparHTML(atual.pergunta)}</p>
        <div class="opcoes">${opcoesHTML}</div>
    `;

    mensagem.style.display = "block";
}

function responderPergunta(escolhida) {
    if (!perguntaAberta || finalizado) return;

    const atual = perguntas[fase - 1];

    if (escolhida === atual.resposta) {
        perguntaAberta = false;
        pontos += 50;

        if (fase < TOTAL_FASES) {
            fase++;
            atualizarPainel();
            resetarMoedas();
            resetarPersonagem();
            aplicarDificuldade();

            mostrarMensagem(
                "✅ Resposta correta!",
                `Parabéns, ${escaparHTML(nome)}! Você avançou para a fase ${fase}.`,
                '<button type="button" id="continuar">🚀 Próxima fase</button>'
            );
        } else {
            finalizarJogo();
        }
    } else {
        vidas--;
        atualizarPainel();

        if (vidas <= 0) {
            gameOver();
            return;
        }

        mostrarMensagem(
            "❌ Resposta incorreta!",
            `Você perdeu uma vida. Restam ${vidas}. Tente novamente!`,
            '<button type="button" id="continuar">🧠 Tentar novamente</button>'
        );

        perguntaAberta = true;
    }
}

function continuarJogo() {
    if (finalizado) return;

    mensagem.style.display = "none";
    teclas.clear();

    if (perguntaAberta) {
        perguntaAberta = false;
        abrirPergunta();
    } else {
        jogoIniciado = true;
    }
}


// ==========================================
// DIFICULDADE POR FASE
// ==========================================

function aplicarDificuldade() {
    const largura = jogo.clientWidth;
    const altura = jogo.clientHeight;

    const configuracoes = {
        1: [180, 0.25, 150, 0.58],
        2: [195, 0.27, 165, 0.62],
        3: [210, 0.22, 180, 0.57],
        4: [225, 0.18, 190, 0.52],
        5: [240, 0.15, 200, 0.48]
    };

    const [w1, p1, h2, p2] = configuracoes[fase];

    obstaculos[0].style.width =
        `${Math.min(w1, largura * 0.4)}px`;

    obstaculos[0].style.left =
        `${Math.min(p1 * largura, largura - obstaculos[0].offsetWidth)}px`;

    obstaculos[1].style.height =
        `${Math.min(h2, altura * 0.45)}px`;

    obstaculos[1].style.left =
        `${Math.min(p2 * largura, largura - obstaculos[1].offsetWidth)}px`;

    obstaculos[1].style.top =
        `${Math.max(150, altura - obstaculos[1].offsetHeight - 35)}px`;
}


// ==========================================
// VIDAS
// ==========================================

function perderVidaPorColisao() {
    const agora = performance.now();

    if (agora - ultimaColisao < 1000) return;

    ultimaColisao = agora;
    vidas--;
    atualizarPainel();

    if (vidas <= 0) gameOver();
}


// ==========================================
// FIM DE JOGO E VITÓRIA
// ==========================================

function gameOver() {
    pausarJogo();
    perguntaAberta = false;
    finalizado = true;

    mostrarMensagem(
        "💥 Fim de jogo!",
        `${escaparHTML(nome)}, suas vidas acabaram.<br><br>
        ⭐ Pontuação final: <strong>${pontos}</strong>`,
        '<button type="button" id="reiniciar">🔄 Jogar novamente</button>'
    );
}

function finalizarJogo() {
    pausarJogo();
    perguntaAberta = false;
    finalizado = true;

    pontos += 100;
    atualizarPainel();

    mostrarMensagem(
        `🏆 Parabéns, ${escaparHTML(nome)}!`,
        `Você completou todas as cinco fases sobre computadores, Windows e inteligência artificial!<br><br>
        ⭐ Pontuação final: <strong>${pontos}</strong><br><br>
        🎓 Desafio concluído!`,
        '<button type="button" id="reiniciar">🔄 Jogar novamente</button>'
    );
}


// ==========================================
// REINICIAR
// ==========================================

function reiniciarJogo() {
    pontos = 0;
    fase = 1;
    vidas = VIDAS_INICIAIS;
    nome = "";

    jogoIniciado = false;
    perguntaAberta = false;
    finalizado = false;
    ultimaColisao = 0;

    teclas.clear();
    resetarMoedas();
    resetarPersonagem();
    restaurarObstaculos();
    atualizarPainel();

    mensagem.innerHTML = `
        <h2>🎮 Bem-vindo novamente!</h2>
        <p>Aprenda sobre computadores, Windows e inteligência artificial.</p>
        <input
            type="text"
            id="nome"
            placeholder="Digite seu nome"
            maxlength="20"
        >
        <button type="button" id="iniciar">🚀 Iniciar jogo</button>
    `;

    mensagem.style.display = "block";
    document.getElementById("nome").focus();
}

function restaurarObstaculos() {
    obstaculos[0].style.width = "180px";
    obstaculos[0].style.height = "35px";
    obstaculos[0].style.left = "250px";
    obstaculos[0].style.top = "80px";

    obstaculos[1].style.width = "40px";
    obstaculos[1].style.height = "180px";
    obstaculos[1].style.left = "580px";
    obstaculos[1].style.top = "250px";
}


// ==========================================
// LOOP PRINCIPAL
// ==========================================

function loopJogo(tempo) {
    if (!ultimaAtualizacao) ultimaAtualizacao = tempo;

    const delta = Math.min(
        (tempo - ultimaAtualizacao) / 1000,
        0.035
    );

    ultimaAtualizacao = tempo;

    atualizarMovimento(delta);
    requestAnimationFrame(loopJogo);
}


// ==========================================
// INICIALIZAÇÃO
// ==========================================

atualizarPainel();
restaurarObstaculos();
resetarPersonagem();

requestAnimationFrame(loopJogo);

window.addEventListener("resize", () => {
    if (fase > 1 && !finalizado) aplicarDificuldade();

    x = Math.max(0, Math.min(x, jogo.clientWidth - personagem.offsetWidth));
    y = Math.max(0, Math.min(y, jogo.clientHeight - personagem.offsetHeight));

    posicionarPersonagem();
});
