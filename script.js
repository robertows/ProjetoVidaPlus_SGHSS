// Arrays para armazenar dados (carregados do localStorage ou iniciados vazios)
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
let leitosDisponiveis = JSON.parse(localStorage.getItem('leitosDisponiveis')) || 10;
let leitosOcupados = JSON.parse(localStorage.getItem('leitosOcupados')) || 5;
let receita = JSON.parse(localStorage.getItem('receita')) || 50000;
let despesas = JSON.parse(localStorage.getItem('despesas')) || 30000;

// Funções de validação
function validarCPF(cpf) {
    const cpfLimpo = cpf.replace(/\D/g, '');
    if (cpfLimpo.length !== 11 || !/^\d{11}$/.test(cpfLimpo)) {
        return false;
    }
    return true;
}

function validarTelefone(telefone) {
    const telefoneLimpo = telefone.replace(/\D/g, '');
    const regex = /^\d{10,11}$/;
    return regex.test(telefoneLimpo);
}

function validarCRM(crm) {
    const regex = /^[A-Za-z0-9]{5,10}$/;
    return regex.test(crm);
}

// Função para notificar o usuário
function notificar(mensagem) {
    alert(`Notificação: ${mensagem}`);
}

// Função para salvar todos os dados no localStorage
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
}

// Obtendo referências do DOM para pacientes
const formPaciente = document.getElementById('formPaciente');
const corpoTabelaPacientes = document.getElementById('corpoTabela');

// Obtendo referências do DOM para profissionais
const formProfissional = document.getElementById('formProfissional');
const corpoTabelaProf = document.getElementById('corpoTabelaProf');

// Obtendo referências do DOM para suprimentos e administração
const formSuprimento = document.getElementById('formSuprimento');
const corpoTabelaSuprimentos = document.getElementById('corpoTabelaSuprimentos');
const btnOcuparLeito = document.getElementById('ocuparLeito');
const btnLiberarLeito = document.getElementById('liberarLeito');

// Obtendo referências do DOM para segurança
const formAcesso = document.getElementById('formAcesso');
const corpoTabelaAcesso = document.getElementById('corpoTabelaAcesso');
const logAuditoria = document.getElementById('logAuditoria');
const btnLogin = document.getElementById('btnLogin');
const btnLogout = document.getElementById('btnLogout');
const loginUsuario = document.getElementById('loginUsuario');
const loginSenha = document.getElementById('loginSenha');
const usuarioLogadoSpan = document.getElementById('usuarioLogado');
const btnAnonimizar = document.getElementById('anonimizarDados');
const btnExcluirDados = document.getElementById('excluirDados');
const filtroAuditoria = document.getElementById('filtroAuditoria');

// Função para adicionar um paciente
function adicionarPaciente(nome, cpf, telefone) {
    const paciente = { nome, cpf, telefone, prontuario: "" };
    pacientes.push(paciente);
    atualizarTabelaPacientes();
    registrarAuditoria(`Paciente ${nome} adicionado por ${usuarioLogado ? usuarioLogado.usuario : 'Usuário não logado'}`);
    notificar(`Paciente ${nome} cadastrado com sucesso`);
    salvarDados();
}

// Função para atualizar a tabela de pacientes
function atualizarTabelaPacientes() {
    if (corpoTabelaPacientes) {
        corpoTabelaPacientes.innerHTML = '';
        pacientes.forEach((paciente, index) => {
            const linha = document.createElement('tr');
            linha.innerHTML = `
                <td>${paciente.nome}</td>
                <td>${paciente.cpf}</td>
                <td>${paciente.telefone}</td>
                <td><button onclick="editarProntuario(${index})">Editar Prontuário</button></td>
                <td><button class="excluir" onclick="excluirPaciente(${index})">Excluir</button></td>
            `;
            corpoTabelaPacientes.appendChild(linha);
        });
    }
}

// Função para editar prontuário
function editarProntuario(index) {
    if (!usuarioLogado) {
        alert('Faça login para editar prontuários!');
        return;
    }
    const prontuario = prompt("Digite o prontuário do paciente:", pacientes[index].prontuario);
    if (prontuario !== null) {
        pacientes[index].prontuario = prontuario;
        alert("Prontuário atualizado com sucesso!");
        registrarAuditoria(`Prontuário de ${pacientes[index].nome} editado por ${usuarioLogado.usuario}`);
        notificar(`Prontuário de ${pacientes[index].nome} atualizado`);
        salvarDados();
    }
}

// Função para excluir um paciente
function excluirPaciente(index) {
    if (!usuarioLogado) {
        alert('Faça login para excluir pacientes!');
        return;
    }
    if (index >= 0 && index < pacientes.length) {
        const nome = pacientes[index].nome;
        pacientes.splice(index, 1);
        atualizarTabelaPacientes();
        registrarAuditoria(`Paciente ${nome} excluído por ${usuarioLogado.usuario}`);
        notificar(`Paciente ${nome} excluído`);
        salvarDados();
    }
}

// Evento para o formulário de pacientes
if (formPaciente) {
    formPaciente.addEventListener('submit', (event) => {
        event.preventDefault();
        if (!usuarioLogado) {
            alert('Faça login para cadastrar pacientes!');
            return;
        }
        const nome = document.getElementById('nome').value.trim();
        const cpf = document.getElementById('cpf').value.trim();
        const telefone = document.getElementById('telefone').value.trim();

        if (!nome) {
            alert('Por favor, preencha o nome!');
            return;
        }
        if (!validarCPF(cpf)) {
            alert('CPF inválido! Deve conter 11 dígitos numéricos.');
            return;
        }
        if (!validarTelefone(telefone)) {
            alert('Telefone inválido! Use o formato (XX) XXXXX-XXXX.');
            return;
        }

        adicionarPaciente(nome, cpf, telefone);
        formPaciente.reset();
    });
}

// Função para adicionar um profissional
function adicionarProfissional(nome, especialidade, crm) {
    const profissional = { nome, especialidade, crm };
    profissionais.push(profissional);
    atualizarTabelaProfissionais();
    registrarAuditoria(`Profissional ${nome} adicionado por ${usuarioLogado ? usuarioLogado.usuario : 'Usuário não logado'}`);
    notificar(`Profissional ${nome} cadastrado`);
    salvarDados();
}

// Função para atualizar a tabela de profissionais
function atualizarTabelaProfissionais() {
    if (corpoTabelaProf) {
        corpoTabelaProf.innerHTML = '';
        profissionais.forEach((profissional, index) => {
            const linha = document.createElement('tr');
            linha.innerHTML = `
                <td>${profissional.nome}</td>
                <td>${profissional.especialidade}</td>
                <td>${profissional.crm}</td>
                <td><button class="excluir" onclick="excluirProfissional(${index})">Excluir</button></td>
            `;
            corpoTabelaProf.appendChild(linha);
        });
    }
}

// Função para excluir um profissional
function excluirProfissional(index) {
    if (!usuarioLogado) {
        alert('Faça login para excluir profissionais!');
        return;
    }
    if (index >= 0 && index < profissionais.length) {
        const nome = profissionais[index].nome;
        profissionais.splice(index, 1);
        atualizarTabelaProfissionais();
        registrarAuditoria(`Profissional ${nome} excluído por ${usuarioLogado.usuario}`);
        notificar(`Profissional ${nome} excluído`);
        salvarDados();
    }
}

// Evento para o formulário de profissionais
if (formProfissional) {
    formProfissional.addEventListener('submit', (event) => {
        event.preventDefault();
        if (!usuarioLogado) {
            alert('Faça login para cadastrar profissionais!');
            return;
        }
        const nome = document.getElementById('nomeProf').value.trim();
        const especialidade = document.getElementById('especialidade').value.trim();
        const crm = document.getElementById('crm').value.trim();

        if (!nome) {
            alert('Por favor, preencha o nome!');
            return;
        }
        if (!especialidade) {
            alert('Por favor, preencha a especialidade!');
            return;
        }
        if (!validarCRM(crm)) {
            alert('CRM/CRN inválido! Deve ter entre 5 e 10 caracteres alfanuméricos.');
            return;
        }

        adicionarProfissional(nome, especialidade, crm);
        formProfissional.reset();
    });
}

// Adicionando eventos aos botões de agendamento
const btnAgendarConsulta = document.getElementById('btnAgendarConsulta');
const btnAgendarExame = document.getElementById('btnAgendarExame');
const btnAgendarTele = document.getElementById('btnAgendarTele');

if (btnAgendarConsulta) {
    btnAgendarConsulta.addEventListener('click', agendarConsulta);
}

if (btnAgendarExame) {
    btnAgendarExame.addEventListener('click', agendarExame);
}

if (btnAgendarTele) {
    btnAgendarTele.addEventListener('click', agendarConsultaTele);
}

// Função para agendar consulta
function agendarConsulta() {
    if (!usuarioLogado) {
        alert('Faça login para agendar consultas!');
        return;
    }
    const paciente = document.getElementById('pacienteConsulta').value.trim();
    const tipo = document.getElementById('tipoConsulta').value;
    const medico = document.getElementById('medicoConsulta').value;
    const data = document.getElementById('dataConsulta').value;

    if (paciente && data) {
        const consulta = { paciente, tipo, medico, data };
        consultas.push(consulta);
        atualizarConsultas();
        registrarAuditoria(`Consulta agendada para ${paciente} por ${usuarioLogado.usuario}`);
        notificar(`Consulta agendada para ${paciente} em ${new Date(data).toLocaleString()}`);
        salvarDados();
        document.getElementById('pacienteConsulta').value = '';
        document.getElementById('dataConsulta').value = '';
    } else {
        alert('Por favor, preencha todos os campos!');
    }
}

// Função para excluir consulta
function excluirConsulta(index) {
    if (!usuarioLogado) {
        alert('Faça login para excluir consultas!');
        return;
    }
    if (index >= 0 && index < consultas.length) {
        const paciente = consultas[index].paciente;
        consultas.splice(index, 1);
        atualizarConsultas();
        registrarAuditoria(`Consulta de ${paciente} excluída por ${usuarioLogado.usuario}`);
        notificar(`Consulta de ${paciente} excluída`);
        salvarDados();
    }
}

// Função para agendar exame
function agendarExame() {
    if (!usuarioLogado) {
        alert('Faça login para agendar exames!');
        return;
    }
    const paciente = document.getElementById('pacienteExame').value.trim();
    const tipo = document.getElementById('tipoExame').value.trim();
    const data = document.getElementById('dataExame').value;

    if (paciente && tipo && data) {
        const exame = { paciente, tipo, data };
        exames.push(exame);
        atualizarExames();
        registrarAuditoria(`Exame agendado para ${paciente} por ${usuarioLogado.usuario}`);
        notificar(`Exame agendado para ${paciente} em ${new Date(data).toLocaleString()}`);
        salvarDados();
        document.getElementById('pacienteExame').value = '';
        document.getElementById('tipoExame').value = '';
        document.getElementById('dataExame').value = '';
    } else {
        alert('Por favor, preencha todos os campos!');
    }
}

// Função para excluir exame
function excluirExame(index) {
    if (!usuarioLogado) {
        alert('Faça login para excluir exames!');
        return;
    }
    if (index >= 0 && index < exames.length) {
        const paciente = exames[index].paciente;
        exames.splice(index, 1);
        atualizarExames();
        registrarAuditoria(`Exame de ${paciente} excluído por ${usuarioLogado.usuario}`);
        notificar(`Exame de ${paciente} excluído`);
        salvarDados();
    }
}

// Função para atualizar a lista de consultas
function atualizarConsultas() {
    const consultasDiv = document.getElementById('consultasAgendadas');
    if (consultasDiv) {
        consultasDiv.innerHTML = consultas.map((consulta, index) =>
            `<p>Consulta ${index + 1}: ${consulta.paciente} - ${consulta.tipo} - ${consulta.medico} - ${new Date(consulta.data).toLocaleString()}
            <button class="excluir" onclick="excluirConsulta(${index})">Excluir</button></p>`
        ).join('');
    }
}

// Função para atualizar a lista de exames
function atualizarExames() {
    const examesDiv = document.getElementById('examesAgendados');
    if (examesDiv) {
        examesDiv.innerHTML = exames.map((exame, index) =>
            `<p>Exame ${index + 1}: ${exame.paciente} - ${exame.tipo} - ${new Date(exame.data).toLocaleString()}
            <button class="excluir" onclick="excluirExame(${index})">Excluir</button></p>`
        ).join('');
    }
}

// Função para agendar consulta online (telemedicina)
function agendarConsultaTele() {
    if (!usuarioLogado) {
        alert('Faça login para agendar consultas online!');
        return;
    }
    const paciente = document.getElementById('pacienteTele').value.trim();
    const medico = document.getElementById('medicoTele').value;
    const data = document.getElementById('dataTele').value;

    if (paciente && data) {
        const consulta = { paciente, medico, data };
        consultasTele.push(consulta);
        atualizarConsultasTele();
        registrarAuditoria(`Consulta online agendada para ${paciente} por ${usuarioLogado.usuario}`);
        notificar(`Consulta online agendada para ${paciente} em ${new Date(data).toLocaleString()}`);
        salvarDados();
        document.getElementById('pacienteTele').value = '';
        document.getElementById('dataTele').value = '';
    } else {
        alert('Por favor, preencha todos os campos!');
    }
}

// Função para excluir consulta online
function excluirConsultaTele(index) {
    if (!usuarioLogado) {
        alert('Faça login para excluir consultas online!');
        return;
    }
    if (index >= 0 && index < consultasTele.length) {
        const paciente = consultasTele[index].paciente;
        consultasTele.splice(index, 1);
        atualizarConsultasTele();
        registrarAuditoria(`Consulta online de ${paciente} excluída por ${usuarioLogado.usuario}`);
        notificar(`Consulta online de ${paciente} excluída`);
        salvarDados();
    }
}

// Função para atualizar a lista de consultas online
function atualizarConsultasTele() {
    const consultasTeleDiv = document.getElementById('consultasTele');
    if (consultasTeleDiv) {
        consultasTeleDiv.innerHTML = consultasTele.map((consulta, index) =>
            `<p>Consulta ${index + 1}: ${consulta.paciente} - ${consulta.medico} - ${new Date(consulta.data).toLocaleString()}
            <button class="excluir" onclick="excluirConsultaTele(${index})">Excluir</button></p>`
        ).join('');
    }
}

// Gerenciamento de prescrições
const formPrescricao = document.getElementById('formPrescricao');
if (formPrescricao) {
    formPrescricao.addEventListener('submit', (event) => {
        event.preventDefault();
        if (!usuarioLogado) {
            alert('Faça login para registrar prescrições!');
            return;
        }
        const paciente = document.getElementById('pacientePresc').value.trim();
        const prescricao = document.getElementById('prescricao').value.trim();

        if (paciente && prescricao) {
            prescricoes.push({ paciente, prescricao });
            atualizarPrescricoes();
            registrarAuditoria(`Prescrição registrada para ${paciente} por ${usuarioLogado.usuario}`);
            notificar(`Prescrição registrada para ${paciente}`);
            salvarDados();
            formPrescricao.reset();
        } else {
            alert('Por favor, preencha todos os campos!');
        }
    });
}

// Função para excluir prescrição
function excluirPrescricao(index) {
    if (!usuarioLogado) {
        alert('Faça login para excluir prescrições!');
        return;
    }
    if (index >= 0 && index < prescricoes.length) {
        const paciente = prescricoes[index].paciente;
        prescricoes.splice(index, 1);
        atualizarPrescricoes();
        registrarAuditoria(`Prescrição de ${paciente} excluída por ${usuarioLogado.usuario}`);
        notificar(`Prescrição de ${paciente} excluída`);
        salvarDados();
    }
}

// Função para atualizar a lista de prescrições
function atualizarPrescricoes() {
    const prescricoesDiv = document.getElementById('prescricoesSalvas');
    if (prescricoesDiv) {
        prescricoesDiv.innerHTML = prescricoes.map((p, index) =>
            `<p>Prescrição ${index + 1}: ${p.paciente} - ${p.prescricao}
            <button class="excluir" onclick="excluirPrescricao(${index})">Excluir</button></p>`
        ).join('');
    }
}

// Função para adicionar um suprimento
function adicionarSuprimento(nome, quantidade) {
    const suprimento = { nome, quantidade };
    suprimentos.push(suprimento);
    atualizarTabelaSuprimentos();
    registrarAuditoria(`Suprimento ${nome} adicionado por ${usuarioLogado ? usuarioLogado.usuario : 'Usuário não logado'}`);
    notificar(`Suprimento ${nome} adicionado`);
    salvarDados();
}

// Função para atualizar a tabela de suprimentos
function atualizarTabelaSuprimentos() {
    if (corpoTabelaSuprimentos) {
        corpoTabelaSuprimentos.innerHTML = '';
        suprimentos.forEach((suprimento, index) => {
            const linha = document.createElement('tr');
            linha.innerHTML = `
                <td>${suprimento.nome}</td>
                <td>${suprimento.quantidade}</td>
                <td><button class="excluir" onclick="excluirSuprimento(${index})">Excluir</button></td>
            `;
            corpoTabelaSuprimentos.appendChild(linha);
        });
    }
}

// Função para excluir um suprimento
function excluirSuprimento(index) {
    if (!usuarioLogado) {
        alert('Faça login para excluir suprimentos!');
        return;
    }
    if (index >= 0 && index < suprimentos.length) {
        const nome = suprimentos[index].nome;
        suprimentos.splice(index, 1);
        atualizarTabelaSuprimentos();
        registrarAuditoria(`Suprimento ${nome} excluído por ${usuarioLogado.usuario}`);
        notificar(`Suprimento ${nome} excluído`);
        salvarDados();
    }
}

// Evento para o formulário de suprimentos
if (formSuprimento) {
    formSuprimento.addEventListener('submit', (event) => {
        event.preventDefault();
        if (!usuarioLogado) {
            alert('Faça login para adicionar suprimentos!');
            return;
        }
        const nome = document.getElementById('nomeSuprimento').value.trim();
        const quantidade = document.getElementById('quantidade').value;

        if (nome && quantidade) {
            adicionarSuprimento(nome, quantidade);
            formSuprimento.reset();
        } else {
            alert('Por favor, preencha todos os campos!');
        }
    });
}

// Função para atualizar leitos e financeiro
function atualizarLeitosFinanceiro() {
    if (document.getElementById('leitosDisponiveis')) {
        document.getElementById('leitosDisponiveis').textContent = leitosDisponiveis;
        document.getElementById('leitosOcupados').textContent = leitosOcupados;
        document.getElementById('receita').textContent = receita;
        document.getElementById('despesas').textContent = despesas;
    }
}

// Eventos para gerenciamento de leitos
if (btnOcuparLeito) {
    btnOcuparLeito.addEventListener('click', () => {
        if (!usuarioLogado) {
            alert('Faça login para gerenciar leitos!');
            return;
        }
        if (leitosDisponiveis > 0) {
            leitosDisponiveis--;
            leitosOcupados++;
            atualizarLeitosFinanceiro();
            registrarAuditoria(`Leito ocupado por ${usuarioLogado.usuario}`);
            notificar(`Leito ocupado`);
            salvarDados();
        } else {
            alert('Nenhum leito disponível!');
        }
    });
}

if (btnLiberarLeito) {
    btnLiberarLeito.addEventListener('click', () => {
        if (!usuarioLogado) {
            alert('Faça login para gerenciar leitos!');
            return;
        }
        if (leitosOcupados > 0) {
            leitosDisponiveis++;
            leitosOcupados--;
            atualizarLeitosFinanceiro();
            registrarAuditoria(`Leito liberado por ${usuarioLogado.usuario}`);
            notificar(`Leito liberado`);
            salvarDados();
        } else {
            alert('Nenhum leito ocupado!');
        }
    });
}

// Função para adicionar um usuário (segurança)
function adicionarUsuario(usuario, senha, permissao) {
    usuarios.push({ usuario, senha, permissao });
    atualizarTabelaAcesso();
    registrarAuditoria(`Usuário ${usuario} adicionado com permissão ${permissao} por ${usuarioLogado ? usuarioLogado.usuario : 'Usuário não logado'}`);
    notificar(`Usuário ${usuario} adicionado`);
    salvarDados();
}

// Função para atualizar a tabela de acesso
function atualizarTabelaAcesso() {
    if (corpoTabelaAcesso) {
        corpoTabelaAcesso.innerHTML = '';
        usuarios.forEach((user, index) => {
            const linha = document.createElement('tr');
            linha.innerHTML = `
                <td>${user.usuario}</td>
                <td>${user.permissao}</td>
                <td><button class="excluir" onclick="excluirUsuario(${index})">Excluir</button></td>
            `;
            corpoTabelaAcesso.appendChild(linha);
        });
    }
}

// Função para excluir um usuário
function excluirUsuario(index) {
    if (!usuarioLogado || usuarioLogado.permissao !== 'admin') {
        alert('Apenas administradores podem excluir usuários!');
        return;
    }
    if (index >= 0 && index < usuarios.length) {
        const usuario = usuarios[index].usuario;
        usuarios.splice(index, 1);
        atualizarTabelaAcesso();
        registrarAuditoria(`Usuário ${usuario} excluído por ${usuarioLogado.usuario}`);
        notificar(`Usuário ${usuario} excluído`);
        salvarDados();
    }
}

// Função para registrar auditoria
function registrarAuditoria(mensagem) {
    const data = new Date().toLocaleString();
    auditoria.push(`${data}: ${mensagem}`);
    atualizarLogAuditoria();
    salvarDados();
}

// Função para atualizar o log de auditoria com filtro
function atualizarLogAuditoria(filtro = '') {
    if (logAuditoria) {
        const logsFiltrados = auditoria.filter(log => log.toLowerCase().includes(filtro.toLowerCase()));
        logAuditoria.innerHTML = logsFiltrados.map(log => `<p>${log}</p>`).join('');
    }
}

// Login
if (btnLogin) {
    btnLogin.addEventListener('click', () => {
        const usuario = loginUsuario.value.trim();
        const senha = loginSenha.value.trim();
        const user = usuarios.find(u => u.usuario === usuario && u.senha === senha);

        if (user) {
            usuarioLogado = user;
            usuarioLogadoSpan.textContent = `${user.usuario} (${user.permissao})`;
            btnLogin.style.display = 'none';
            btnLogout.style.display = 'inline';
            loginUsuario.style.display = 'none';
            loginSenha.style.display = 'none';
            registrarAuditoria(`Login realizado por ${usuario}`);
            notificar(`Bem-vindo, ${usuario}!`);
            salvarDados();
        } else {
            alert('Usuário ou senha inválidos!');
        }
    });
}

// Logout
if (btnLogout) {
    btnLogout.addEventListener('click', () => {
        registrarAuditoria(`Logout realizado por ${usuarioLogado.usuario}`);
        notificar(`Logout realizado por ${usuarioLogado.usuario}`);
        usuarioLogado = null;
        usuarioLogadoSpan.textContent = 'Nenhum';
        btnLogin.style.display = 'inline';
        btnLogout.style.display = 'none';
        loginUsuario.style.display = 'inline';
        loginSenha.style.display = 'inline';
        loginUsuario.value = '';
        loginSenha.value = '';
        salvarDados();
    });
}

// Anonimizar CPFs (LGPD)
if (btnAnonimizar) {
    btnAnonimizar.addEventListener('click', () => {
        if (!usuarioLogado || usuarioLogado.permissao !== 'admin') {
            alert('Apenas administradores podem anonimizar dados!');
            return;
        }
        pacientes.forEach(p => {
            p.cpf = p.cpf.slice(0, 3) + 'XXX.XXX.' + p.cpf.slice(9);
        });
        atualizarTabelaPacientes();
        registrarAuditoria(`CPFs anonimizados por ${usuarioLogado.usuario}`);
        notificar(`CPFs anonimizados com sucesso`);
        salvarDados();
        alert('CPFs anonimizados com sucesso!');
    });
}

// Excluir dados pessoais (LGPD)
if (btnExcluirDados) {
    btnExcluirDados.addEventListener('click', () => {
        if (!usuarioLogado) {
            alert('Faça login para solicitar a exclusão de dados!');
            return;
        }
        if (confirm('Deseja excluir todos os seus dados pessoais? Esta ação é irreversível.')) {
            const nomeUsuario = usuarioLogado.usuario;
            pacientes = pacientes.filter(p => p.nome !== nomeUsuario);
            consultas = consultas.filter(c => c.paciente !== nomeUsuario);
            exames = exames.filter(e => e.paciente !== nomeUsuario);
            consultasTele = consultasTele.filter(c => c.paciente !== nomeUsuario);
            prescricoes = prescricoes.filter(p => p.paciente !== nomeUsuario);
            atualizarTabelaPacientes();
            atualizarConsultas();
            atualizarExames();
            atualizarConsultasTele();
            atualizarPrescricoes();
            registrarAuditoria(`Dados pessoais excluídos por ${nomeUsuario}`);
            notificar(`Dados pessoais de ${nomeUsuario} excluídos`);
            salvarDados();
            alert('Seus dados foram excluídos com sucesso!');
        }
    });
}

// Filtro de auditoria
if (filtroAuditoria) {
    filtroAuditoria.addEventListener('input', (e) => {
        atualizarLogAuditoria(e.target.value);
    });
}

// Evento para o formulário de acesso
if (formAcesso) {
    formAcesso.addEventListener('submit', (event) => {
        event.preventDefault();
        if (usuarios.length === 0 || (usuarioLogado && usuarioLogado.permissao === 'admin')) {
            const usuario = document.getElementById('usuario').value.trim();
            const senha = document.getElementById('senha').value.trim();
            const permissao = document.getElementById('permissao').value;

            if (usuario && senha) {
                adicionarUsuario(usuario, senha, permissao);
                formAcesso.reset();
            } else {
                alert('Por favor, preencha todos os campos!');
            }
        } else {
            alert('Apenas administradores podem adicionar usuários!');
        }
    });
}

// Inicializar estado do login
if (usuarioLogado && usuarioLogadoSpan) {
    usuarioLogadoSpan.textContent = `${usuarioLogado.usuario} (${usuarioLogado.permissao})`;
    btnLogin.style.display = 'none';
    btnLogout.style.display = 'inline';
    loginUsuario.style.display = 'none';
    loginSenha.style.display = 'none';
}

// Atualizar todas as tabelas e listas ao carregar a página
atualizarTabelaPacientes();
atualizarTabelaProfissionais();
atualizarConsultas();
atualizarExames();
atualizarConsultasTele();
atualizarPrescricoes();
atualizarTabelaSuprimentos();
atualizarTabelaAcesso();
atualizarLogAuditoria();
atualizarLeitosFinanceiro();