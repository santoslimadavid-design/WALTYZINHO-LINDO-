// ============================================
// ELEMENTOS DO HTML
// ============================================

const personagem =
    document.getElementById("personagem");

const jogo =
    document.getElementById("jogo");

const pontosTexto =
    document.getElementById("pontos");

const faseTexto =
    document.getElementById("fase");

const vidasTexto =
    document.getElementById("vidas");

const nomeJogador =
    document.getElementById("nomeJogador");

const mensagem =
    document.getElementById("mensagem");

const iniciar =
    document.getElementById("iniciar");

const campoNome =
    document.getElementById("nome");

const moedas =
    document.querySelectorAll(".moeda");

const obstaculos =
    document.querySelectorAll(".obstaculo");

const saida =
    document.getElementById("saida");


// ============================================
// VARIÁVEIS DO JOGO
// ============================================

let x = 30;

let y = 30;

let pontos = 0;

let fase = 1;

let vidas = 3;

let nome = "";

let jogoIniciado = false;

const velocidade = 15;


// ============================================
// BANCO DE PERGUNTAS
// ============================================

const perguntas = [

    {
        fase: 1,

        pergunta:
            "O que significa a sigla HTML?",

        opcoes: [
            "HyperText Markup Language",
            "High Technology Machine Language",
            "Home Tool Markup Language",
            "Hyperlink Text Machine"
        ],

        resposta: 0
    },


    {
        fase: 2,

        pergunta:
            "Para que serve o CSS?",

        opcoes: [
            "Para criar bancos de dados",
            "Para estilizar páginas web",
            "Para instalar programas",
            "Para criar sistemas operacionais"
        ],

        resposta: 1
    },


    {
        fase: 3,

        pergunta:
            "Qual linguagem é muito utilizada para criar interações em páginas web?",

        opcoes: [
            "JavaScript",
            "HTML",
            "CSS",
            "SQL"
        ],

        resposta: 0
    },


    {
        fase: 4,

        pergunta:
            "O que é um algoritmo?",

        opcoes: [
            "Um tipo de computador",
            "Uma sequência de passos para resolver um problema",
            "Um programa de edição de imagens",
            "Um sistema operacional"
        ],

        resposta: 1
    },


    {
        fase: 5,

        pergunta:
            "O que é programação?",

        opcoes: [
            "Criar instruções para um computador executar",
            "Somente montar computadores",
            "Criar desenhos no computador",
            "Instalar aplicativos"
        ],

        resposta: 0
    }

];


// ============================================
// INICIAR O JOGO
// ============================================

iniciar.addEventListener(
    "click",
    iniciarJogo
);


function iniciarJogo() {

    nome =
        campoNome.value.trim();


    if (nome === "") {

        alert(
            "⚠️ Digite seu nome para começar!"
        );

        campoNome.focus();

        return;

    }


    nomeJogador.textContent =
        nome;


    mensagem.style.display =
        "none";


    jogoIniciado =
        true;


    resetarPersonagem();

}


// ============================================
// MOVIMENTAÇÃO
// ============================================

document.addEventListener(
    "keydown",
    function(event) {

        if (!jogoIniciado) {

            return;

        }


        let novoX = x;

        let novoY = y;


        if (event.key === "ArrowUp") {

            novoY -= velocidade;

            event.preventDefault();

        }


        if (event.key === "ArrowDown") {

            novoY += velocidade;

            event.preventDefault();

        }


        if (event.key === "ArrowLeft") {

            novoX -= velocidade;

            event.preventDefault();

        }


        if (event.key === "ArrowRight") {

            novoX += velocidade;

            event.preventDefault();

        }


        // ====================================
        // LIMITES DO MAPA
        // ====================================

        if (novoX < 0) {

            novoX = 0;

        }


        if (novoY < 0) {

            novoY = 0;

        }


        if (
            novoX >
            jogo.clientWidth -
            personagem.offsetWidth
        ) {

            novoX =
                jogo.clientWidth -
                personagem.offsetWidth;

        }


        if (
            novoY >
            jogo.clientHeight -
            personagem.offsetHeight
        ) {

            novoY =
                jogo.clientHeight -
                personagem.offsetHeight;

        }


        // ====================================
        // COLISÃO
        // ====================================

        if (
            !colideComObstaculo(
                novoX,
                novoY
            )
        ) {

            x = novoX;

            y = novoY;

            atualizarPersonagem();

            verificarMoedas();

            verificarSaida();

        }

        else {

            perderVida();

        }

    }
);


// ============================================
// ATUALIZAR PERSONAGEM
// ============================================

function atualizarPersonagem() {

    personagem.style.left =
        x + "px";

    personagem.style.top =
        y + "px";

}


// ============================================
// RESETAR PERSONAGEM
// ============================================

function resetarPersonagem() {

    x = 30;

    y = 30;

    atualizarPersonagem();

}


// ============================================
// VERIFICAR COLISÃO COM OBSTÁCULOS
// ============================================

function colideComObstaculo(
    novoX,
    novoY
) {

    const personagemRect = {

        left: novoX,

        right:
            novoX +
            personagem.offsetWidth,

        top: novoY,

        bottom:
            novoY +
            personagem.offsetHeight

    };


    for (
        let obstaculo
        of obstaculos
    ) {

        const obstaculoRect = {

            left:
                obstaculo.offsetLeft,

            right:
                obstaculo.offsetLeft +
                obstaculo.offsetWidth,

            top:
                obstaculo.offsetTop,

            bottom:
                obstaculo.offsetTop +
                obstaculo.offsetHeight

        };


        const colisao = (

            personagemRect.right >
            obstaculoRect.left &&

            personagemRect.left <
            obstaculoRect.right &&

            personagemRect.bottom >
            obstaculoRect.top &&

            personagemRect.top <
            obstaculoRect.bottom

        );


        if (colisao) {

            return true;

        }

    }


    return false;

}


// ============================================
// COLETAR MOEDAS
// ============================================

function verificarMoedas() {

    moedas.forEach(
        function(moeda) {

            if (
                moeda.style.display ===
                "none"
            ) {

                return;

            }


            const personagemRect =
                personagem.getBoundingClientRect();

            const moedaRect =
                moeda.getBoundingClientRect();


            const pegou = (

                personagemRect.right >
                moedaRect.left &&

                personagemRect.left <
                moedaRect.right &&

                personagemRect.bottom >
                moedaRect.top &&

                personagemRect.top <
                moedaRect.bottom

            );


            if (pegou) {

                moeda.style.display =
                    "none";


                pontos += 10;


                pontosTexto.textContent =
                    pontos;

            }

        }
    );

}


// ============================================
// VERIFICAR SAÍDA
// ============================================

function verificarSaida() {

    const personagemRect =
        personagem.getBoundingClientRect();

    const saidaRect =
        saida.getBoundingClientRect();


    const chegou = (

        personagemRect.right >
        saidaRect.left &&

        personagemRect.left <
        saidaRect.right &&

        personagemRect.bottom >
        saidaRect.top &&

        personagemRect.top <
        saidaRect.bottom

    );


    if (chegou) {

        abrirPergunta();

    }

}


// ============================================
// ABRIR PERGUNTA
// ============================================

function abrirPergunta() {

    jogoIniciado =
        false;


    const perguntaAtual =
        perguntas[fase - 1];


    let html = `

        <h2>
            💻 Desafio da Fase ${fase}
        </h2>

        <p>
            ${perguntaAtual.pergunta}
        </p>

        <div class="opcoes">

    `;


    perguntaAtual.opcoes.forEach(
        function(opcao, index) {

            html += `

                <button
                    onclick="
                        responderPergunta(
                            ${index},
                            ${perguntaAtual.resposta}
                        )
                    "
                >
                    ${opcao}
                </button>

            `;

        }
    );


    html += `

        </div>

    `;


    mensagem.innerHTML =
        html;


    mensagem.style.display =
        "block";

}


// ============================================
// RESPONDER PERGUNTA
// ============================================

function responderPergunta(
    respostaEscolhida,
    respostaCorreta
) {

    if (
        respostaEscolhida ===
        respostaCorreta
    ) {

        // ==============================
        // RESPOSTA CORRETA
        // ==============================

        pontos += 50;


        pontosTexto.textContent =
            pontos;


        if (fase < 5) {

            alert(
                "✅ Resposta correta!\n\n" +
                "Você avançou para a próxima fase!"
            );


            fase++;


            faseTexto.textContent =
                fase;


            resetarMoedas();

            resetarPersonagem();

            aumentarDificuldade();


            mensagem.style.display =
                "none";


            jogoIniciado =
                true;

        }

        else {

            finalizarJogo();

        }

    }

    else {

        // ==============================
        // RESPOSTA ERRADA
        // ==============================

        vidas--;


        vidasTexto.textContent =
            vidas;


        if (vidas <= 0) {

            gameOver();

        }

        else {

            alert(
                "❌ Resposta incorreta!\n\n" +
                "Você perdeu uma vida."
            );


            resetarPersonagem();


            mensagem.style.display =
                "none";


            jogoIniciado =
                true;

        }

    }

}


// ============================================
// AUMENTAR DIFICULDADE
// ============================================

function aumentarDificuldade() {

    if (fase === 2) {

        obstaculos[0].style.width =
            "230px";

        obstaculos[1].style.height =
            "210px";

    }


    if (fase === 3) {

        obstaculos[0].style.width =
            "280px";

        obstaculos[1].style.height =
            "240px";

        obstaculos[1].style.left =
            "520px";

    }


    if (fase === 4) {

        obstaculos[0].style.width =
            "320px";

        obstaculos[0].style.left =
            "200px";

        obstaculos[1].style.height =
            "280px";

        obstaculos[1].style.left =
            "480px";

    }


    if (fase === 5) {

        obstaculos[0].style.width =
            "350px";

        obstaculos[0].style.left =
            "180px";

        obstaculos[1].style.height =
            "320px";

        obstaculos[1].style.left =
            "450px";

    }

}


// ============================================
// RESETAR MOEDAS
// ============================================

function resetarMoedas() {

    moedas.forEach(
        function(moeda) {

            moeda.style.display =
                "block";

        }
    );

}


// ============================================
// PERDER VIDA
// ============================================

function perderVida() {

    vidas--;


    vidasTexto.textContent =
        vidas;


    resetarPersonagem();


    if (vidas <= 0) {

        gameOver();

    }

}


// ============================================
// GAME OVER
// ============================================

function gameOver() {

    jogoIniciado =
        false;


    mensagem.innerHTML = `

        <h2>
            💥 Fim de jogo!
        </h2>

        <p>
            ${nome}, você ficou sem vidas.
        </p>

        <p>
            Pontuação final:
            <strong>
                ${pontos}
            </strong>
        </p>

        <button
            onclick="reiniciarJogo()"
        >
            🔄 Jogar Novamente
        </button>

    `;


    mensagem.style.display =
        "block";

}


// ============================================
// FINALIZAR JOGO
// ============================================

function finalizarJogo() {

    jogoIniciado =
        false;


    pontos += 100;


    pontosTexto.textContent =
        pontos;


    mensagem.innerHTML = `

        <h2>
            🏆 PARABÉNS, ${nome.toUpperCase()}!
        </h2>

        <p>
            Você completou todas as 5 fases!
        </p>

        <p>
            Você demonstrou conhecimentos
            básicos sobre Desenvolvimento
            de Sistemas.
        </p>

        <p>
            ⭐ Pontuação final:
            <strong>
                ${pontos}
            </strong>
        </p>

        <p>
            🎓 Desafio concluído!
        </p>

        <button
            onclick="reiniciarJogo()"
        >
            🔄 Jogar Novamente
        </button>

    `;


    mensagem.style.display =
        "block";

}


// ============================================
// REINICIAR JOGO
// ============================================

function reiniciarJogo() {

    pontos = 0;

    fase = 1;

    vidas = 3;


    pontosTexto.textContent =
        pontos;

    faseTexto.textContent =
        fase;

    vidasTexto.textContent =
        vidas;


    obstaculos[0].style.width =
        "180px";

    obstaculos[0].style.left =
        "250px";


    obstaculos[1].style.height =
        "180px";

    obstaculos[1].style.left =
        "580px";


    resetarMoedas();

    resetarPersonagem();


    mensagem.innerHTML = `

        <h2>
            🎮 Bem-vindo novamente!
        </h2>

        <p>
            Digite seu nome para começar.
        </p>

        <input
            type="text"
            id="nome"
            placeholder="Digite seu nome"
            maxlength="20"
        >

        <button id="iniciar">
            🚀 Iniciar Jogo
        </button>

    `;


    mensagem.style.display =
        "block";


    jogoIniciado =
        false;


    // Recria os elementos da tela inicial

    const novoCampoNome =
        document.getElementById("nome");

    const novoBotao =
        document.getElementById("iniciar");


    novoBotao.addEventListener(
        "click",
        function() {

            const novoNome =
                novoCampoNome.value.trim();


            if (novoNome === "") {

                alert(
                    "⚠️ Digite seu nome!"
                );

                return;

            }


            nome =
                novoNome;


            nomeJogador.textContent =
                nome;


            mensagem.style.display =
                "none";


            jogoIniciado =
                true;


            resetarPersonagem();

        }
    );

}
