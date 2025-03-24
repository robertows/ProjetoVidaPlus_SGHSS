// Certifique-se de incluir no HTML: <script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js"></script>
if (typeof CryptoJS === 'undefined') {
    console.error('CryptoJS não encontrado. Inclua a biblioteca no HTML.');
}

// Declaração de variáveis globais
let pacientes = JSON.parse(localStorage.getItem('pacientes')) || [];
let consultas = JSON.parse(localStorage.getItem('consultas')) || [];
let exames = JSON.parse(localStorage.getItem('exames')) || [];
let profissionais = JSON.parse(localStorage.getItem('profissionais')) || [];
let suprimentos = JSON.parse(localStorage.getItem('suprimentos')) || [];
let consultasTele = JSON.parse(localStorage.getItem('consultasTele')) || [];
let prescricoes = JSON.parse(localStorage.getItem('prescricoes')) || [];
let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
let auditoria = JSON.parse(localStorage.getItem('auditoria')) || [];
let usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado')) || null;
let leitosDisponiveis = JSON.parse(localStorage.getItem('leitosDisponiveis')) || 50;
let leitosOcupados = JSON.parse(localStorage.getItem('leitosOcupados')) || 0;
let receita = JSON.parse(localStorage.getItem('receita')) || 0;
let despesas = JSON.parse(localStorage.getItem('despesas')) || 0;
let historicoFinanceiro = JSON.parse(localStorage.getItem('historicoFinanceiro')) || [
    { data: '01/03/2025', receita: 50000, despesa: 30000 }
];

// Variáveis para controle de exclusão
let indiceParaExcluir = null;
let tipoExclusao = null;

// Usuário administrador padrão
if (usuarios.length === 0 && typeof CryptoJS !== 'undefined') {
    const senhaCriptografada = CryptoJS.AES.encrypt('admin123', 'chave-secreta').toString();
    usuarios.push({ usuario: 'admin', senha: senhaCriptografada, permissao: 'admin' });
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
}

// Referências ao DOM
const domElements = {
    formPaciente: document.getElementById('formPaciente'),
    corpoTabela: document.getElementById('corpoTabela'),
    selecionarPaciente: document.getElementById('selecionarPaciente'),
    historicoPaciente: document.getElementById('historicoPaciente'),
    formConsulta: document.getElementById('formConsulta'),
    pacienteConsulta: document.getElementById('pacienteConsulta'),
    profissionalConsulta: document.getElementById('profissionalConsulta'),
    especialidadeConsulta: document.getElementById('especialidadeConsulta'),
    corpoTabelaConsultas: document.getElementById('corpoTabelaConsultas'),
    formExame: document.getElementById('formExame'),
    pacienteExame: document.getElementById('pacienteExame'),
    corpoTabelaExames: document.getElementById('corpoTabelaExames'),
    formProfissional: document.getElementById('formProfissional'),
    corpoTabelaProf: document.getElementById('corpoTabelaProf'),
    selecionarProfissional: document.getElementById('selecionarProfissional'),
    corpoTabelaAgenda: document.getElementById('corpoTabelaAgenda'),
    formSuprimento: document.getElementById('formSuprimento'),
    corpoTabelaSuprimentos: document.getElementById('corpoTabelaSuprimentos'),
    formTelemedicina: document.getElementById('formTelemedicina'),
    pacienteTele: document.getElementById('pacienteTele'),
    profissionalTele: document.getElementById('profissionalTele'),
    corpoTabelaTelemedicina: document.getElementById('corpoTabelaTelemedicina'),
    formPrescricao: document.getElementById('formPrescricao'),
    consultaTelePrescricao: document.getElementById('consultaTelePrescricao'),
    selecionarConsultaTele: document.getElementById('selecionarConsultaTele'),
    corpoTabelaPrescricoes: document.getElementById('corpoTabelaPrescricoes'),
    formLeito: document.getElementById('formLeito'),
    formReceita: document.getElementById('formReceita'),
    formDespesa: document.getElementById('formDespesa'),
    leitosDisponiveisSpan: document.getElementById('leitosDisponiveis'),
    leitosOcupadosSpan: document.getElementById('leitosOcupados'),
    receitaSpan: document.getElementById('receita'),
    despesasSpan: document.getElementById('despesas'),
    saldoSpan: document.getElementById('saldo'),
    formAcesso: document.getElementById('formAcesso'),
    corpoTabelaAcesso: document.getElementById('corpoTabelaAcesso'),
    filtroAuditoria: document.getElementById('filtroAuditoria'),
    logAuditoria: document.getElementById('logAuditoria'),
    loginUsuario: document.getElementById('loginUsuario'),
    loginSenha: document.getElementById('loginSenha'),
    btnLogin: document.getElementById('btnLogin'),
    btnLogout: document.getElementById('btnLogout'),
    usuarioLogadoSpan: document.getElementById('usuarioLogado'),
    selecionarPacienteHistorico: document.getElementById('selecionarPacienteHistorico'),
    corpoTabelaHistoricoPrescricoes: document.getElementById('corpoTabelaHistoricoPrescricoes'),
    formPrescricaoProf: document.getElementById('formPrescricaoProf'),
    pacientePrescricao: document.getElementById('pacientePrescricao'),
    corpoTabelaFinanceiro: document.getElementById('corpoTabelaFinanceiro'),
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    console.log('Página carregada, inicializando...');
    atualizarTodasTabelasESelecoes();
    configurarEventos();
    if (usuarioLogado && domElements.usuarioLogadoSpan) {
        domElements.usuarioLogadoSpan.textContent = `${usuarioLogado.usuario} (${formatarPermissao(usuarioLogado.permissao)})`;
        if (domElements.btnLogin) domElements.btnLogin.style.display = 'none';
        if (domElements.btnLogout) domElements.btnLogout.style.display = 'inline';
        if (domElements.loginUsuario) domElements.loginUsuario.style.display = 'none';
        if (domElements.loginSenha) domElements.loginSenha.style.display = 'none';
    }
});

// Função para formatar permissões para exibição
function formatarPermissao(permissao) {
    switch (permissao) {
        case 'admin': return 'Administrador';
        case 'atendente': return 'Atendente';
        case 'profissional_saude': return 'Profissional de Saúde';
        case 'paciente': return 'Paciente';
        default: return permissao;
    }
}

// Função para atualizar todas as tabelas e seleções
function atualizarTodasTabelasESelecoes() {
    if (domElements.corpoTabela) atualizarTabelaPacientes();
    [domElements.selecionarPaciente, domElements.pacienteConsulta, domElements.pacienteExame, domElements.pacienteTele, domElements.selecionarPacienteHistorico, domElements.pacientePrescricao]
        .forEach(el => el && atualizarSelecaoPacientes(el));
    [domElements.profissionalConsulta, domElements.profissionalTele, domElements.selecionarProfissional]
        .forEach(el => el && atualizarSelecaoProfissionais(el));
    if (domElements.especialidadeConsulta) atualizarSelecaoEspecialidades(domElements.especialidadeConsulta);
    if (domElements.corpoTabelaConsultas) atualizarTabelaConsultas();
    if (domElements.corpoTabelaExames) atualizarTabelaExames();
    if (domElements.corpoTabelaProf) atualizarTabelaProfissionais();
    if (domElements.corpoTabelaAgenda) atualizarTabelaAgenda();
    if (domElements.corpoTabelaSuprimentos) atualizarTabelaSuprimentos();
    if (domElements.corpoTabelaTelemedicina) atualizarTabelaTelemedicina();
    [domElements.consultaTelePrescricao, domElements.selecionarConsultaTele]
        .forEach(el => el && atualizarSelecaoConsultasTele(el));
    if (domElements.corpoTabelaPrescricoes) atualizarTabelaPrescricoes();
    if (domElements.leitosDisponiveisSpan || domElements.leitosOcupadosSpan) atualizarLeitos();
    if (domElements.receitaSpan || domElements.despesasSpan || domElements.saldoSpan) atualizarFinancas();
    if (domElements.corpoTabelaFinanceiro) atualizarTabelaFinanceiro();
    if (domElements.corpoTabelaAcesso) atualizarTabelaAcesso();
    if (domElements.logAuditoria) atualizarLogAuditoria();
    if (domElements.corpoTabelaHistoricoPrescricoes) mostrarHistoricoPrescricoes();
}

// Função para configurar eventos
function configurarEventos() {
    if (domElements.formPaciente) domElements.formPaciente.addEventListener('submit', handleFormPaciente);
    if (domElements.formConsulta) domElements.formConsulta.addEventListener('submit', handleFormConsulta);
    if (domElements.profissionalConsulta) domElements.profissionalConsulta.addEventListener('change', preencherEspecialidade);
    if (domElements.especialidadeConsulta) domElements.especialidadeConsulta.addEventListener('change', preencherProfissional);
    if (domElements.selecionarPaciente) domElements.selecionarPaciente.addEventListener('change', mostrarHistorico);
    if (domElements.formExame) domElements.formExame.addEventListener('submit', handleFormExame);
    if (domElements.formProfissional) domElements.formProfissional.addEventListener('submit', handleFormProfissional);
    if (domElements.selecionarProfissional) domElements.selecionarProfissional.addEventListener('change', atualizarTabelaAgenda);
    if (domElements.formSuprimento) domElements.formSuprimento.addEventListener('submit', handleFormSuprimento);
    if (domElements.formTelemedicina) domElements.formTelemedicina.addEventListener('submit', handleFormTelemedicina);
    if (domElements.formPrescricao) domElements.formPrescricao.addEventListener('submit', handleFormPrescricao);
    if (domElements.formPrescricaoProf) domElements.formPrescricaoProf.addEventListener('submit', handleFormPrescricaoProf);
    if (domElements.formLeito) domElements.formLeito.addEventListener('submit', handleFormLeito);
    if (domElements.formReceita) domElements.formReceita.addEventListener('submit', handleFormReceita);
    if (domElements.formDespesa) domElements.formDespesa.addEventListener('submit', handleFormDespesa);
    if (domElements.formAcesso) domElements.formAcesso.addEventListener('submit', handleFormAcesso);
    if (domElements.filtroAuditoria) domElements.filtroAuditoria.addEventListener('input', atualizarLogAuditoria);
    if (domElements.selecionarConsultaTele) domElements.selecionarConsultaTele.addEventListener('change', carregarConsultaSelecionada);
    if (domElements.selecionarPacienteHistorico) domElements.selecionarPacienteHistorico.addEventListener('change', mostrarHistoricoPrescricoes);

    // Verificação em tempo real do CPF
    const cpfInput = document.getElementById('cpf');
    if (cpfInput) {
        cpfInput.addEventListener('input', () => {
            const cpf = cpfInput.value.trim();
            if (cpf && validarCPF(cpf)) {
                notificar('CPF válido.');
            }
        });
    }

    const confirmarExclusaoBtn = document.getElementById('confirmarExclusao');
    if (confirmarExclusaoBtn) {
        confirmarExclusaoBtn.addEventListener('click', () => {
            if (indiceParaExcluir !== null && tipoExclusao) {
                executarExclusao(indiceParaExcluir, tipoExclusao);
                fecharModal();
            }
        });
    }
}

// Funções de manipulação de formulários
function handleFormPaciente(event) {
    event.preventDefault();
    const nome = document.getElementById('nome')?.value.trim();
    const cpf = document.getElementById('cpf')?.value.trim();
    const dataNascimento = document.getElementById('dataNascimento')?.value;
    const telefone = document.getElementById('telefone')?.value.trim();
    const endereco = document.getElementById('endereco')?.value.trim();

    if (!cpf) {
        alert('Erro: O campo CPF é obrigatório!');
        return;
    }

    if (nome && validarCPF(cpf) && dataNascimento && telefone && endereco) {
        adicionarPaciente(nome, cpf, dataNascimento, telefone, endereco);
        domElements.formPaciente.reset();
    } else {
        alert('Preencha todos os campos corretamente! CPF deve ser válido.');
    }
}

function handleFormConsulta(event) {
    event.preventDefault();
    const cpfPaciente = domElements.pacienteConsulta?.value;
    const crmProfissional = domElements.profissionalConsulta?.value;
    const data = document.getElementById('dataConsulta')?.value;
    const hora = document.getElementById('horaConsulta')?.value;
    const especialidade = domElements.especialidadeConsulta?.value;
    if (cpfPaciente && crmProfissional && data && hora && especialidade) {
        adicionarConsulta(cpfPaciente, crmProfissional, data, hora, especialidade);
        domElements.formConsulta.reset();
    } else {
        alert('Preencha todos os campos!');
    }
}

function handleFormExame(event) {
    event.preventDefault();
    const cpfPaciente = domElements.pacienteExame?.value;
    const tipo = document.getElementById('tipoExame')?.value;
    const data = document.getElementById('dataExame')?.value;
    const resultado = document.getElementById('resultadoExame')?.value.trim() || 'Pendente';
    if (cpfPaciente && tipo && data) {
        adicionarExame(cpfPaciente, tipo, data, resultado);
        domElements.formExame.reset();
    } else {
        alert('Preencha todos os campos obrigatórios!');
    }
}

function handleFormProfissional(event) {
    event.preventDefault();
    const nome = document.getElementById('nomeProfissional')?.value.trim();
    const categoria = document.getElementById('categoriaProfissional')?.value;
    const especialidade = document.getElementById('especialidadeProfissional')?.value.trim();
    const crm = document.getElementById('crm')?.value.trim();
    const telefone = document.getElementById('telefoneProfissional')?.value.trim();
    const email = document.getElementById('emailProfissional')?.value.trim();
    if (nome && categoria && especialidade && crm && telefone && validarEmail(email)) {
        adicionarProfissional(nome, categoria, especialidade, crm, telefone, email);
        domElements.formProfissional.reset();
    } else {
        alert('Preencha todos os campos! Email deve ser válido.');
    }
}

function handleFormSuprimento(event) {
    event.preventDefault();
    const nome = document.getElementById('nomeSuprimento')?.value.trim();
    const quantidade = parseInt(document.getElementById('quantidadeSuprimento')?.value);
    const precoUnitario = parseFloat(document.getElementById('precoUnitario')?.value);
    if (nome && quantidade > 0 && precoUnitario > 0) {
        adicionarSuprimento(nome, quantidade, precoUnitario);
        domElements.formSuprimento.reset();
    } else {
        alert('Preencha todos os campos com valores válidos!');
    }
}

function handleFormTelemedicina(event) {
    event.preventDefault();
    const cpfPaciente = domElements.pacienteTele?.value;
    const crmProfissional = domElements.profissionalTele?.value;
    const data = document.getElementById('dataTele')?.value;
    const hora = document.getElementById('horaTele')?.value;
    if (cpfPaciente && crmProfissional && data && hora) {
        adicionarConsultaTelemedicina(cpfPaciente, crmProfissional, data, hora);
        domElements.formTelemedicina.reset();
    } else {
        alert('Preencha todos os campos!');
    }
}

function handleFormPrescricao(event) {
    event.preventDefault();
    const consultaIndex = domElements.consultaTelePrescricao?.value;
    const medicamento = document.getElementById('medicamento')?.value.trim();
    const dosagem = document.getElementById('dosagem')?.value.trim();
    const instrucoes = document.getElementById('instrucoes')?.value.trim();
    if (consultaIndex !== '' && medicamento && dosagem && instrucoes) {
        adicionarPrescricao(consultaIndex, medicamento, dosagem, instrucoes);
        domElements.formPrescricao.reset();
    } else {
        alert('Preencha todos os campos!');
    }
}

function handleFormPrescricaoProf(event) {
    event.preventDefault();
    const cpfPaciente = domElements.pacientePrescricao?.value;
    const medicamento = document.getElementById('medicamentoProf')?.value.trim();
    const dosagem = document.getElementById('dosagemProf')?.value.trim();
    const instrucoes = document.getElementById('instrucoesProf')?.value.trim();
    if (cpfPaciente && medicamento && dosagem && instrucoes) {
        // Verificar se o usuário logado tem permissão para adicionar prescrição
        if (usuarioLogado && usuarioLogado.permissao === 'profissional_saude') {
            adicionarPrescricaoProf(cpfPaciente, medicamento, dosagem, instrucoes);
            domElements.formPrescricaoProf.reset();
        } else {
            alert('Apenas profissionais de saúde podem adicionar prescrições presenciais.');
        }
    } else {
        alert('Preencha todos os campos!');
    }
}

function handleFormLeito(event) {
    event.preventDefault();
    const acao = document.getElementById('acaoLeito')?.value;
    if (acao === 'adicionar' && leitosDisponiveis > 0) {
        leitosDisponiveis--;
        leitosOcupados++;
        registrarAuditoria(`Leito ocupado por ${usuarioLogado?.usuario || 'Usuário não logado'}`);
        notificar('Leito ocupado com sucesso');
    } else if (acao === 'liberar' && leitosOcupados > 0) {
        leitosDisponiveis++;
        leitosOcupados--;
        registrarAuditoria(`Leito liberado por ${usuarioLogado?.usuario || 'Usuário não logado'}`);
        notificar('Leito liberado com sucesso');
    } else {
        alert('Ação inválida: Nenhum leito disponível para ocupar ou liberar.');
        return;
    }
    atualizarLeitos();
    salvarDados();
}

function handleFormReceita(event) {
    event.preventDefault();
    const valor = parseFloat(document.getElementById('valorReceita')?.value);
    if (valor > 0) {
        receita += valor;
        const data = new Date().toLocaleDateString();
        historicoFinanceiro.push({ data, receita: valor, despesa: 0 });
        atualizarFinancas();
        atualizarTabelaFinanceiro();
        registrarAuditoria(`Receita de R$ ${valor.toFixed(2)} adicionada por ${usuarioLogado?.usuario || 'Usuário não logado'}`);
        notificar(`Receita de R$ ${valor.toFixed(2)} adicionada`);
        salvarDados();
        domElements.formReceita.reset();
    } else {
        alert('Insira um valor válido!');
    }
}

function handleFormDespesa(event) {
    event.preventDefault();
    const valor = parseFloat(document.getElementById('valorDespesa')?.value);
    if (valor > 0) {
        despesas += valor;
        const data = new Date().toLocaleDateString();
        historicoFinanceiro.push({ data, receita: 0, despesa: valor });
        atualizarFinancas();
        atualizarTabelaFinanceiro();
        registrarAuditoria(`Despesa de R$ ${valor.toFixed(2)} adicionada por ${usuarioLogado?.usuario || 'Usuário não logado'}`);
        notificar(`Despesa de R$ ${valor.toFixed(2)} adicionada`);
        salvarDados();
        domElements.formDespesa.reset();
    } else {
        alert('Insira um valor válido!');
    }
}

function handleFormAcesso(event) {
    event.preventDefault();
    const usuario = document.getElementById('novoUsuario')?.value.trim();
    const senha = document.getElementById('novaSenha')?.value;
    const permissao = document.getElementById('permissao')?.value;
    if (usuario && senha && permissao) {
        if (usuarios.some(u => u.usuario === usuario)) {
            alert('Usuário já existe!');
        } else {
            adicionarUsuario(usuario, senha, permissao);
            domElements.formAcesso.reset();
        }
    } else {
        alert('Preencha todos os campos!');
    }
}

// Funções utilitárias
function salvarDados() {
    localStorage.setItem('pacientes', JSON.stringify(pacientes));
    localStorage.setItem('consultas', JSON.stringify(consultas));
    localStorage.setItem('exames', JSON.stringify(exames));
    localStorage.setItem('profissionais', JSON.stringify(profissionais));
    localStorage.setItem('suprimentos', JSON.stringify(suprimentos));
    localStorage.setItem('consultasTele', JSON.stringify(consultasTele));
    localStorage.setItem('prescricoes', JSON.stringify(prescricoes));
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    localStorage.setItem('auditoria', JSON.stringify(auditoria));
    localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));
    localStorage.setItem('leitosDisponiveis', JSON.stringify(leitosDisponiveis));
    localStorage.setItem('leitosOcupados', JSON.stringify(leitosOcupados));
    localStorage.setItem('receita', JSON.stringify(receita));
    localStorage.setItem('despesas', JSON.stringify(despesas));
    localStorage.setItem('historicoFinanceiro', JSON.stringify(historicoFinanceiro));
}

function registrarAuditoria(mensagem) {
    const data = new Date().toLocaleString();
    auditoria.push(`[${data}]: ${mensagem}`);
    if (domElements.logAuditoria) atualizarLogAuditoria();
    salvarDados();
}

function atualizarLogAuditoria() {
    if (domElements.logAuditoria) {
        const filtro = domElements.filtroAuditoria?.value.toLowerCase() || '';
        domElements.logAuditoria.innerHTML = auditoria
            .filter(log => log.toLowerCase().includes(filtro))
            .map(log => `<p>${log}</p>`)
            .join('');
    }
}

function notificar(mensagem) {
    console.log('Notificação:', mensagem);

    // Criar elemento de notificação
    const notificacao = document.createElement('div');
    notificacao.className = 'notificacao';
    notificacao.textContent = mensagem;

    // Adicionar ao corpo da página
    document.body.appendChild(notificacao);

    // Remover a notificação após 3 segundos
    setTimeout(() => {
        notificacao.remove();
    }, 3000);
}

function validarCPF(cpf) {
    const cpfRegex = /^\d{11}$|^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
    return cpfRegex.test(cpf);
}

function validarEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Funções de atualização de UI
function atualizarSelecaoPacientes(selectElement) {
    if (selectElement) {
        selectElement.innerHTML = '<option value="">Selecione um paciente</option>';
        pacientes.forEach(p => {
            const option = document.createElement('option');
            option.value = p.cpf;
            option.textContent = p.nome;
            selectElement.appendChild(option);
        });
    }
}

function atualizarSelecaoProfissionais(selectElement) {
    if (selectElement) {
        selectElement.innerHTML = '<option value="">Selecione um profissional</option>';
        profissionais.forEach(p => {
            const option = document.createElement('option');
            option.value = p.crm;
            option.textContent = p.nome;
            selectElement.appendChild(option);
        });
    }
}

function atualizarSelecaoEspecialidades(selectElement) {
    if (selectElement) {
        selectElement.innerHTML = '<option value="">Selecione uma especialidade</option>';
        const especialidades = [...new Set(profissionais.map(p => p.especialidade).filter(e => e))];
        especialidades.forEach(e => {
            const option = document.createElement('option');
            option.value = e;
            option.textContent = e;
            selectElement.appendChild(option);
        });
    }
}

function preencherEspecialidade() {
    const crm = domElements.profissionalConsulta?.value;
    const prof = profissionais.find(p => p.crm === crm);
    if (prof && domElements.especialidadeConsulta) {
        domElements.especialidadeConsulta.value = prof.especialidade || '';
    }
}

function preencherProfissional() {
    const especialidade = domElements.especialidadeConsulta?.value;
    const prof = profissionais.find(p => p.especialidade === especialidade);
    if (prof && domElements.profissionalConsulta) {
        domElements.profissionalConsulta.value = prof.crm || '';
    }
}

function atualizarSelecaoConsultasTele(selectElement) {
    if (selectElement) {
        selectElement.innerHTML = '<option value="">Selecione uma consulta</option>';
        consultasTele.forEach((c, i) => {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `${c.paciente} - ${c.profissional} (${c.data} ${c.hora})`;
            selectElement.appendChild(option);
        });
    }
}

function atualizarTabelaPacientes() {
    if (domElements.corpoTabela) {
        domElements.corpoTabela.innerHTML = pacientes.map((p, i) => `
            <tr>
                <td>${p.nome}</td>
                <td>${p.cpf}</td>
                <td>${p.dataNascimento}</td>
                <td>${p.telefone}</td>
                <td>${p.endereco}</td>
                <td><button class="excluir" onclick="confirmarExclusao(${i}, 'paciente')" aria-label="Excluir paciente ${p.nome}">Excluir</button></td>
            </tr>
        `).join('');
    }
}

function atualizarTabelaConsultas() {
    if (domElements.corpoTabelaConsultas) {
        domElements.corpoTabelaConsultas.innerHTML = consultas.map((c, i) => `
            <tr>
                <td>${c.paciente}</td>
                <td>${c.profissional}</td>
                <td>${c.data}</td>
                <td>${c.hora}</td>
                <td>${c.especialidade}</td>
                <td><button class="excluir" onclick="confirmarExclusao(${i}, 'consulta')" aria-label="Excluir consulta de ${c.paciente}">Excluir</button></td>
            </tr>
        `).join('');
    }
}

function atualizarTabelaExames() {
    if (domElements.corpoTabelaExames) {
        domElements.corpoTabelaExames.innerHTML = exames.map((e, i) => `
            <tr>
                <td>${e.paciente}</td>
                <td>${e.tipo}</td>
                <td>${e.data}</td>
                <td>${e.resultado}</td>
                <td><button class="excluir" onclick="confirmarExclusao(${i}, 'exame')" aria-label="Excluir exame de ${e.paciente}">Excluir</button></td>
            </tr>
        `).join('');
    }
}

function atualizarTabelaProfissionais() {
    if (domElements.corpoTabelaProf) {
        domElements.corpoTabelaProf.innerHTML = profissionais.map((p, i) => `
            <tr>
                <td>${p.nome}</td>
                <td>${p.categoria}</td>
                <td>${p.especialidade || 'N/A'}</td>
                <td>${p.crm}</td>
                <td>${p.telefone}</td>
                <td>${p.email}</td>
                <td><button class="excluir" onclick="confirmarExclusao(${i}, 'profissional')" aria-label="Excluir profissional ${p.nome}">Excluir</button></td>
            </tr>
        `).join('');
    }
}

function atualizarTabelaAgenda() {
    if (domElements.corpoTabelaAgenda && domElements.selecionarProfissional) {
        const crm = domElements.selecionarProfissional.value;
        if (crm) {
            const prof = profissionais.find(p => p.crm === crm);
            if (prof) {
                const agenda = [
                    ...consultas.filter(c => c.profissional === prof.nome).map(c => ({ ...c, tipo: 'Presencial' })),
                    ...consultasTele.filter(t => t.profissional === prof.nome).map(t => ({ ...t, tipo: 'Telemedicina' }))
                ];
                domElements.corpoTabelaAgenda.innerHTML = agenda.length ? agenda.map(a => `
                    <tr>
                        <td>${a.paciente}</td>
                        <td>${a.data}</td>
                        <td>${a.hora}</td>
                        <td>${a.especialidade || 'N/A'}</td>
                        <td>${a.tipo}</td>
                    </tr>
                `).join('') : '<tr><td colspan="5">Nenhuma consulta agendada.</td></tr>';
            }
        } else {
            domElements.corpoTabelaAgenda.innerHTML = '<tr><td colspan="5">Selecione um profissional.</td></tr>';
        }
    }
}

function atualizarTabelaSuprimentos() {
    if (domElements.corpoTabelaSuprimentos) {
        domElements.corpoTabelaSuprimentos.innerHTML = suprimentos.map((s, i) => `
            <tr>
                <td>${s.nome}</td>
                <td>${s.quantidade}</td>
                <td>R$ ${s.precoUnitario.toFixed(2)}</td>
                <td><button class="excluir" onclick="confirmarExclusao(${i}, 'suprimento')" aria-label="Excluir suprimento ${s.nome}">Excluir</button></td>
            </tr>
        `).join('');
    }
}

function atualizarTabelaTelemedicina() {
    if (domElements.corpoTabelaTelemedicina) {
        domElements.corpoTabelaTelemedicina.innerHTML = consultasTele.map((c, i) => `
            <tr>
                <td>${c.paciente}</td>
                <td>${c.profissional}</td>
                <td>${c.data}</td>
                <td>${c.hora}</td>
                <td>Telemedicina</td>
                <td><button class="excluir" onclick="confirmarExclusao(${i}, 'consultaTele')" aria-label="Excluir consulta de telemedicina de ${c.paciente}">Excluir</button></td>
            </tr>
        `).join('');
    }
}

function atualizarTabelaPrescricoes() {
    if (domElements.corpoTabelaPrescricoes) {
        domElements.corpoTabelaPrescricoes.innerHTML = prescricoes.map((p, i) => `
            <tr>
                <td>${p.consulta}</td>
                <td>${p.medicamento}</td>
                <td>${p.dosagem}</td>
                <td>${p.instrucoes}</td>
                <td>${p.tipo || 'N/A'}</td>
                <td><button class="excluir" onclick="confirmarExclusao(${i}, 'prescricao')" aria-label="Excluir prescrição de ${p.consulta}">Excluir</button></td>
            </tr>
        `).join('');
    }
}

function atualizarLeitos() {
    if (domElements.leitosDisponiveisSpan) domElements.leitosDisponiveisSpan.textContent = leitosDisponiveis;
    if (domElements.leitosOcupadosSpan) domElements.leitosOcupadosSpan.textContent = leitosOcupados;
}

function atualizarFinancas() {
    if (domElements.receitaSpan) domElements.receitaSpan.textContent = receita.toFixed(2);
    if (domElements.despesasSpan) domElements.despesasSpan.textContent = despesas.toFixed(2);
    if (domElements.saldoSpan) domElements.saldoSpan.textContent = (receita - despesas).toFixed(2);
}

function atualizarTabelaFinanceiro() {
    if (domElements.corpoTabelaFinanceiro) {
        domElements.corpoTabelaFinanceiro.innerHTML = historicoFinanceiro.map((f, i) => `
            <tr>
                <td>${f.data}</td>
                <td>R$ ${f.receita.toFixed(2)}</td>
                <td>R$ ${f.despesa.toFixed(2)}</td>
                <td><button class="excluir" onclick="confirmarExclusao(${i}, 'financeiro')" aria-label="Excluir registro financeiro de ${f.data}">Excluir</button></td>
            </tr>
        `).join('');
    }
}

function atualizarTabelaAcesso() {
    if (domElements.corpoTabelaAcesso) {
        domElements.corpoTabelaAcesso.innerHTML = usuarios.map((u, i) => `
            <tr>
                <td>${u.usuario}</td>
                <td>${formatarPermissao(u.permissao)}</td>
                <td><button class="excluir" onclick="confirmarExclusao(${i}, 'usuario')" aria-label="Excluir usuário ${u.usuario}">Excluir</button></td>
            </tr>
        `).join('');
    }
}

// Funções de manipulação de dados
function adicionarPaciente(nome, cpf, dataNascimento, telefone, endereco) {
    const paciente = { nome, cpf, dataNascimento, telefone, endereco, historico: [] };
    pacientes.push(paciente);
    atualizarTodasTabelasESelecoes();
    registrarAuditoria(`Paciente ${nome} adicionado por ${usuarioLogado?.usuario || 'Usuário não logado'}`);
    notificar('Paciente cadastrado com sucesso.');
    salvarDados();
}

function adicionarConsulta(cpfPaciente, crmProfissional, data, hora, especialidade) {
    const paciente = pacientes.find(p => p.cpf === cpfPaciente);
    const profissional = profissionais.find(p => p.crm === crmProfissional);
    if (paciente && profissional) {
        const consulta = { paciente: paciente.nome, profissional: profissional.nome, data, hora, especialidade };
        consultas.push(consulta);
        paciente.historico.push(`Consulta com ${profissional.nome} (${especialidade}) em ${data} às ${hora}`);
        atualizarTodasTabelasESelecoes();
        registrarAuditoria(`Consulta para ${paciente.nome} com ${profissional.nome} adicionada por ${usuarioLogado?.usuario || 'Usuário não logado'}`);
        notificar('Consulta presencial agendada com sucesso.');
        salvarDados();
    }
}

function adicionarExame(cpfPaciente, tipo, data, resultado) {
    const paciente = pacientes.find(p => p.cpf === cpfPaciente);
    if (paciente) {
        const exame = { paciente: paciente.nome, tipo, data, resultado };
        exames.push(exame);
        paciente.historico.push(`Exame ${tipo} agendado para ${data} - Resultado: ${resultado}`);
        atualizarTodasTabelasESelecoes();
        registrarAuditoria(`Exame ${tipo} para ${paciente.nome} adicionado por ${usuarioLogado?.usuario || 'Usuário não logado'}`);
        notificar('Exame agendado com sucesso.');
        salvarDados();
    }
}

function adicionarProfissional(nome, categoria, especialidade, crm, telefone, email) {
    const profissional = { nome, categoria, especialidade, crm, telefone, email };
    profissionais.push(profissional);
    atualizarTodasTabelasESelecoes();
    registrarAuditoria(`Profissional ${nome} adicionado por ${usuarioLogado?.usuario || 'Usuário não logado'}`);
    notificar('Profissional cadastrado com sucesso.');
    salvarDados();
}

function adicionarSuprimento(nome, quantidade, precoUnitario) {
    const suprimento = { nome, quantidade, precoUnitario };
    suprimentos.push(suprimento);
    despesas += quantidade * precoUnitario;
    historicoFinanceiro.push({ data: new Date().toLocaleDateString(), receita: 0, despesa: quantidade * precoUnitario });
    atualizarTodasTabelasESelecoes();
    registrarAuditoria(`Suprimento ${nome} adicionado por ${usuarioLogado?.usuario || 'Usuário não logado'}`);
    notificar('Suprimento adicionado com sucesso.');
    salvarDados();
}

function adicionarConsultaTelemedicina(cpfPaciente, crmProfissional, data, hora) {
    const paciente = pacientes.find(p => p.cpf === cpfPaciente);
    const profissional = profissionais.find(p => p.crm === crmProfissional);
    if (paciente && profissional) {
        const consulta = { paciente: paciente.nome, profissional: profissional.nome, data, hora, especialidade: profissional.especialidade };
        consultasTele.push(consulta);
        paciente.historico.push(`Consulta de Telemedicina com ${profissional.nome} (${profissional.especialidade}) em ${data} às ${hora}`);
        atualizarTodasTabelasESelecoes();
        registrarAuditoria(`Consulta de telemedicina para ${paciente.nome} adicionada por ${usuarioLogado?.usuario || 'Usuário não logado'}`);
        notificar('Consulta online agendada com sucesso.');
        salvarDados();
    }
}

function adicionarPrescricao(consultaIndex, medicamento, dosagem, instrucoes) {
    const consulta = consultasTele[consultaIndex];
    if (consulta) {
        const data = new Date().toLocaleString();
        const prescricao = { consulta: `${consulta.paciente} - ${consulta.data} ${consulta.hora}`, medicamento, dosagem, instrucoes, data, tipo: 'Online' };
        prescricoes.push(prescricao);
        const paciente = pacientes.find(p => p.nome === consulta.paciente);
        if (paciente) {
            paciente.historico.push(`Prescrição Online: ${medicamento} - ${dosagem} - ${instrucoes} (${data})`);
        }
        atualizarTodasTabelasESelecoes();
        registrarAuditoria(`Prescrição online para ${consulta.paciente} adicionada por ${usuarioLogado?.usuario || 'Usuário não logado'}`);
        notificar('Prescrição adicionada com sucesso.');
        salvarDados();
    }
}

function adicionarPrescricaoProf(cpfPaciente, medicamento, dosagem, instrucoes) {
    const paciente = pacientes.find(p => p.cpf === cpfPaciente);
    if (paciente) {
        const data = new Date().toLocaleString();
        const profissional = usuarioLogado?.permissao === 'profissional_saude' ? usuarioLogado.usuario : 'Profissional não identificado';
        const prescricao = { consulta: paciente.nome, medicamento, dosagem, instrucoes, data, profissional, tipo: 'Presencial' };
        prescricoes.push(prescricao);
        paciente.historico.push(`Prescrição Presencial: ${medicamento} - ${dosagem} - ${instrucoes} (${data}) por ${profissional}`);
        atualizarTodasTabelasESelecoes();
        registrarAuditoria(`Prescrição presencial para ${paciente.nome} adicionada por ${usuarioLogado?.usuario || 'Usuário não logado'}`);
        notificar('Prescrição adicionada com sucesso.');
        salvarDados();
    }
}

function adicionarUsuario(usuario, senha, permissao) {
    if (typeof CryptoJS === 'undefined') {
        console.error('CryptoJS não disponível. Usuário não adicionado.');
        return;
    }
    const senhaCriptografada = CryptoJS.AES.encrypt(senha, 'chave-secreta').toString();
    usuarios.push({ usuario, senha: senhaCriptografada, permissao });
    atualizarTodasTabelasESelecoes();
    registrarAuditoria(`Usuário ${usuario} adicionado por ${usuarioLogado?.usuario || 'Usuário não logado'}`);
    notificar(`Usuário ${usuario} adicionado`);
    salvarDados();
}

// Funções de exclusão
function confirmarExclusao(index, tipo) {
    indiceParaExcluir = index;
    tipoExclusao = tipo;
    if (typeof bootstrap !== 'undefined' && document.getElementById('confirmacaoModal')) {
        const modal = new bootstrap.Modal(document.getElementById('confirmacaoModal'));
        modal.show();
    } else {
        if (confirm('Tem certeza que deseja excluir este item?')) {
            executarExclusao(index, tipo);
        }
    }
}

function executarExclusao(index, tipo) {
    switch (tipo) {
        case 'paciente': excluirPaciente(index); break;
        case 'consulta': excluirConsulta(index); break;
        case 'exame': excluirExame(index); break;
        case 'profissional': excluirProfissional(index); break;
        case 'suprimento': excluirSuprimento(index); break;
        case 'consultaTele': excluirConsultaTelemedicina(index); break;
        case 'prescricao': excluirPrescricao(index); break;
        case 'usuario': excluirUsuario(index); break;
        case 'financeiro': excluirFinanceiro(index); break;
    }
}

function fecharModal() {
    if (typeof bootstrap !== 'undefined' && document.getElementById('confirmacaoModal')) {
        const modal = bootstrap.Modal.getInstance(document.getElementById('confirmacaoModal'));
        modal?.hide();
    }
    indiceParaExcluir = null;
    tipoExclusao = null;
}

function excluirPaciente(index) {
    const paciente = pacientes[index];
    registrarAuditoria(`Paciente ${paciente.nome} excluído por ${usuarioLogado?.usuario || 'Usuário não logado'}`);
    pacientes.splice(index, 1);
    atualizarTodasTabelasESelecoes();
    salvarDados();
}

function excluirConsulta(index) {
    const consulta = consultas[index];
    registrarAuditoria(`Consulta para ${consulta.paciente} excluída por ${usuarioLogado?.usuario || 'Usuário não logado'}`);
    consultas.splice(index, 1);
    atualizarTodasTabelasESelecoes();
    salvarDados();
}

function excluirExame(index) {
    const exame = exames[index];
    registrarAuditoria(`Exame ${exame.tipo} para ${exame.paciente} excluído por ${usuarioLogado?.usuario || 'Usuário não logado'}`);
    exames.splice(index, 1);
    atualizarTodasTabelasESelecoes();
    salvarDados();
}

function excluirProfissional(index) {
    const profissional = profissionais[index];
    registrarAuditoria(`Profissional ${profissional.nome} excluído por ${usuarioLogado?.usuario || 'Usuário não logado'}`);
    profissionais.splice(index, 1);
    atualizarTodasTabelasESelecoes();
    salvarDados();
}

function excluirSuprimento(index) {
    const suprimento = suprimentos[index];
    registrarAuditoria(`Suprimento ${suprimento.nome} excluído por ${usuarioLogado?.usuario || 'Usuário não logado'}`);
    suprimentos.splice(index, 1);
    atualizarTodasTabelasESelecoes();
    salvarDados();
}

function excluirConsultaTelemedicina(index) {
    const consulta = consultasTele[index];
    registrarAuditoria(`Consulta de telemedicina para ${consulta.paciente} excluída por ${usuarioLogado?.usuario || 'Usuário não logado'}`);
    consultasTele.splice(index, 1);
    atualizarTodasTabelasESelecoes();
    salvarDados();
}

function excluirPrescricao(index) {
    const prescricao = prescricoes[index];
    registrarAuditoria(`Prescrição para ${prescricao.consulta} excluída por ${usuarioLogado?.usuario || 'Usuário não logado'}`);
    prescricoes.splice(index, 1);
    atualizarTodasTabelasESelecoes();
    salvarDados();
}

function excluirUsuario(index) {
    const user = usuarios[index];
    if (usuarioLogado && user.usuario === usuarioLogado.usuario) {
        alert('Você não pode excluir o usuário atualmente logado!');
        return;
    }
    registrarAuditoria(`Usuário ${user.usuario} excluído por ${usuarioLogado?.usuario || 'Usuário não logado'}`);
    usuarios.splice(index, 1);
    atualizarTodasTabelasESelecoes();
    salvarDados();
}

function excluirFinanceiro(index) {
    const registro = historicoFinanceiro[index];
    receita -= registro.receita;
    despesas -= registro.despesa;
    historicoFinanceiro.splice(index, 1);
    atualizarFinancas();
    atualizarTabelaFinanceiro();
    registrarAuditoria(`Registro financeiro de ${registro.data} excluído por ${usuarioLogado?.usuario || 'Usuário não logado'}`);
    notificar(`Registro financeiro de ${registro.data} excluído`);
    salvarDados();
}

// Funções de exibição
function mostrarHistorico() {
    if (domElements.selecionarPaciente && domElements.historicoPaciente) {
        const cpf = domElements.selecionarPaciente.value;
        const paciente = pacientes.find(p => p.cpf === cpf);
        domElements.historicoPaciente.innerHTML = paciente?.historico?.length
            ? paciente.historico.map(item => `<p>${item}</p>`).join('')
            : '<p>Nenhum histórico disponível.</p>';
    }
}

function mostrarHistoricoPrescricoes() {
    if (domElements.selecionarPacienteHistorico && domElements.corpoTabelaHistoricoPrescricoes) {
        const cpf = domElements.selecionarPacienteHistorico.value;
        const paciente = pacientes.find(p => p.cpf === cpf);
        if (paciente) {
            const historico = [
                ...prescricoes.filter(p => p.consulta.includes(paciente.nome)).map(p => ({ ...p, tipo: p.tipo || 'Prescrição' })),
                ...exames.filter(e => e.paciente === paciente.nome).map(e => ({ data: e.data, profissional: 'N/A', medicamento: e.tipo, dosagem: 'N/A', instrucoes: e.resultado, tipo: 'Exame' })),
                ...consultas.filter(c => c.paciente === paciente.nome).map(c => ({ data: `${c.data} ${c.hora}`, profissional: c.profissional, medicamento: c.especialidade, dosagem: 'N/A', instrucoes: 'Consulta Presencial', tipo: 'Consulta' })),
                ...consultasTele.filter(t => t.paciente === paciente.nome).map(t => ({ data: `${t.data} ${t.hora}`, profissional: t.profissional, medicamento: t.especialidade, dosagem: 'N/A', instrucoes: 'Consulta Online', tipo: 'Telemedicina' }))
            ];
            domElements.corpoTabelaHistoricoPrescricoes.innerHTML = historico.length ? historico.map((h, i) => `
                <tr>
                    <td>${h.data}</td>
                    <td>${h.profissional || 'N/A'}</td>
                    <td>${h.medicamento}</td>
                    <td>${h.dosagem}</td>
                    <td>${h.instrucoes}</td>
                    <td>${h.tipo}</td>
                    ${h.tipo === 'Prescrição' ? `<td><button class="excluir" onclick="confirmarExclusao(${prescricoes.indexOf(prescricoes.find(p => p.data === h.data && p.medicamento === h.medicamento && p.consulta === h.consulta))}, 'prescricao')" aria-label="Excluir prescrição">Excluir</button></td>` : '<td></td>'}
                </tr>
            `).join('') : '<tr><td colspan="7">Nenhum registro encontrado.</td></tr>';
        } else {
            domElements.corpoTabelaHistoricoPrescricoes.innerHTML = '<tr><td colspan="7">Selecione um paciente.</td></tr>';
        }
    }
}

// Funções de videochamada
let localStream;
function carregarConsultaSelecionada() {
    const mensagem = document.getElementById('mensagemVideochamada');
    const videoArea = document.getElementById('videoArea');
    if (mensagem && videoArea && domElements.selecionarConsultaTele) {
        const index = domElements.selecionarConsultaTele.value;
        mensagem.textContent = index !== ''
            ? `Simulação de videochamada com ${consultasTele[index].paciente} (${consultasTele[index].data} ${consultasTele[index].hora})`
            : 'Simulação de videochamada com NENHUM paciente selecionado';
        videoArea.style.display = index !== '' ? 'block' : 'none';
    }
}

async function iniciarVideoChamada() {
    const localVideo = document.getElementById('localVideo');
    const remoteVideo = document.getElementById('remoteVideo');
    const startBtn = document.getElementById('startVideoCall');
    const stopBtn = document.getElementById('stopVideoCall');
    if (!localVideo || !remoteVideo || !startBtn || !stopBtn) return;

    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideo.srcObject = localStream;
        remoteVideo.srcObject = localStream; // Simulação
        startBtn.style.display = 'none';
        stopBtn.style.display = 'inline';
        registrarAuditoria(`Videochamada iniciada por ${usuarioLogado?.usuario || 'Usuário não logado'}`);
        notificar('Videochamada iniciada');
    } catch (error) {
        console.error('Erro ao iniciar videochamada:', error);
        registrarAuditoria(`Erro ao iniciar videochamada: ${error.message}`);
        alert('Erro ao acessar câmera/microfone. Verifique as permissões.');
    }
}

function encerrarVideoChamada() {
    const localVideo = document.getElementById('localVideo');
    const remoteVideo = document.getElementById('remoteVideo');
    const startBtn = document.getElementById('startVideoCall');
    const stopBtn = document.getElementById('stopVideoCall');
    if (!localVideo || !remoteVideo || !startBtn || !stopBtn) return;

    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localVideo.srcObject = null;
        remoteVideo.srcObject = null;
    }
    startBtn.style.display = 'inline';
    stopBtn.style.display = 'none';
    registrarAuditoria(`Videochamada encerrada por ${usuarioLogado?.usuario || 'Usuário não logado'}`);
    notificar('Videochamada encerrada');
}

// Funções de autenticação
function login() {
    const usuario = domElements.loginUsuario?.value.trim();
    const senha = domElements.loginSenha?.value;
    if (!usuario || !senha) {
        alert('Preencha usuário e senha!');
        return;
    }
    const user = usuarios.find(u => u.usuario === usuario);
    if (user && typeof CryptoJS !== 'undefined') {
        const decrypted = CryptoJS.AES.decrypt(user.senha, 'chave-secreta').toString(CryptoJS.enc.Utf8);
        if (decrypted === senha) {
            usuarioLogado = { usuario: user.usuario, permissao: user.permissao };
            localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));
            if (domElements.usuarioLogadoSpan) domElements.usuarioLogadoSpan.textContent = `${usuarioLogado.usuario} (${formatarPermissao(usuarioLogado.permissao)})`;
            if (domElements.btnLogin) domElements.btnLogin.style.display = 'none';
            if (domElements.btnLogout) domElements.btnLogout.style.display = 'inline';
            if (domElements.loginUsuario) domElements.loginUsuario.style.display = 'none';
            if (domElements.loginSenha) domElements.loginSenha.style.display = 'none';
            registrarAuditoria(`Login realizado por ${usuario}`);
            notificar('Login realizado com sucesso!');
        } else {
            alert('Usuário ou senha incorretos!');
        }
    } else {
        alert('Usuário não encontrado ou CryptoJS não disponível!');
    }
}

function logout() {
    registrarAuditoria(`Logout realizado por ${usuarioLogado?.usuario}`);
    usuarioLogado = null;
    localStorage.removeItem('usuarioLogado');
    if (domElements.usuarioLogadoSpan) domElements.usuarioLogadoSpan.textContent = 'Nenhum';
    if (domElements.btnLogin) domElements.btnLogin.style.display = 'inline';
    if (domElements.btnLogout) domElements.btnLogout.style.display = 'none';
    if (domElements.loginUsuario) {
        domElements.loginUsuario.style.display = 'inline';
        domElements.loginUsuario.value = '';
    }
    if (domElements.loginSenha) {
        domElements.loginSenha.style.display = 'inline';
        domElements.loginSenha.value = '';
    }
    notificar('Logout realizado com sucesso!');
}

// Funções LGPD
function anonimizarCPFs() {
    if (!usuarioLogado) {
        alert('Faça login para anonimizar CPFs!');
        return;
    }
    pacientes.forEach(p => {
        if (!p.cpfOriginal) p.cpfOriginal = p.cpf; // Preserva o original
        p.cpf = 'XXX.XXX.XXX-XX';
    });
    atualizarTodasTabelasESelecoes();
    registrarAuditoria(`CPFs anonimizados por ${usuarioLogado.usuario}`);
    notificar('CPFs anonimizados com sucesso!');
    salvarDados();
}

function excluirMeusDados() {
    if (!usuarioLogado) {
        alert('Faça login para excluir seus dados!');
        return;
    }
    // Verificar se o usuário logado tem permissão de "paciente"
    if (usuarioLogado.permissao === 'paciente') {
        const paciente = pacientes.find(p => p.nome === usuarioLogado.usuario);
        if (paciente) {
            pacientes = pacientes.filter(p => p !== paciente);
            consultas = consultas.filter(c => c.paciente !== paciente.nome);
            exames = exames.filter(e => e.paciente !== paciente.nome);
            consultasTele = consultasTele.filter(t => t.paciente !== paciente.nome);
            prescricoes = prescricoes.filter(pr => pr.consulta !== paciente.nome && !pr.consulta.includes(paciente.nome));
            atualizarTodasTabelasESelecoes();
            registrarAuditoria(`Dados do paciente ${paciente.nome} excluídos por ${usuarioLogado.usuario}`);
            notificar('Seus dados foram excluídos com sucesso!');
            salvarDados();
        } else {
            alert('Nenhum dado de paciente associado a este usuário encontrado!');
        }
    } else {
        alert('Apenas usuários com permissão de "Paciente" podem excluir seus próprios dados.');
    }
}
