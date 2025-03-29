const domElements = {
    usuarioLogadoSpan: document.getElementById('usuarioLogado'), // Span para exibir o usuário logado
    btnLogin: document.getElementById('btnLogin'), // Botão de login
    btnLogout: document.getElementById('btnLogout'), // Botão de logout
    loginUsuario: document.getElementById('loginUsuario'), // Campo de entrada do usuário
    loginSenha: document.getElementById('loginSenha'), // Campo de entrada da senha
    tabelaPacientes: document.getElementById('tabelaPacientes'), // Tabela de pacientes
    tabelaConsultas: document.getElementById('tabelaConsultas'), // Tabela de consultas
    tabelaExames: document.getElementById('tabelaExames'), // Tabela de exames
    tabelaProf: document.getElementById('tabelaProf'), // Tabela de profissionais
    tabelaAgenda: document.getElementById('tabelaAgenda'), // Tabela de agenda
    tabelaSuprimentos: document.getElementById('tabelaSuprimentos'), // Tabela de suprimentos
    tabelaTelemedicina: document.getElementById('tabelaTelemedicina'), // Tabela de telemedicina
    tabelaHistoricoPrescricoes: document.getElementById('tabelaHistoricoPrescricoes'), // Tabela de prescrições
    tabelaAcesso: document.getElementById('tabelaAcesso'), // Tabela de acesso de usuários
    tabelaFinanceiro: document.getElementById('tabelaFinanceiro'), // Tabela de histórico financeiro
    logAuditoria: document.getElementById('logAuditoria'), // Área de log de auditoria
    selecionarPaciente: document.getElementById('selecionarPaciente'), // Select para escolher paciente
    selecionarProfissional: document.getElementById('selecionarProfissional'), // Select para escolher profissional
    especialidadeConsulta: document.getElementById('especialidadeConsulta'), // Select para especialidade
    selecionarConsultaTele: document.getElementById('selecionarConsultaTele'), // Select para consultas tele
    historicoPaciente: document.getElementById('historicoPaciente'), // Área de histórico do paciente
    leitosDisponiveisSpan: document.getElementById('leitosDisponiveis'), // Span para leitos disponíveis
    leitosOcupadosSpan: document.getElementById('leitosOcupados'), // Span para leitos ocupados
    receitaSpan: document.getElementById('receita'), // Span para receita financeira
    despesaSpan: document.getElementById('despesas'), // Span para despesas financeiras
    saldoSpan: document.getElementById('saldo'), // Span para saldo financeiro
    modalConfirmacao: document.getElementById('confirmacaoModal'), // Modal de confirmação
    modalMensagem: document.getElementById('modalMensagem'), // Modal de mensagens/notificações
};

// Dados iniciais armazenados no localStorage ou inicializados como arrays vazios
let pacientes = JSON.parse(localStorage.getItem('pacientes')) || []; // Lista de pacientes
let consultas = JSON.parse(localStorage.getItem('consultas')) || []; // Lista de consultas
let exames = JSON.parse(localStorage.getItem('exames')) || []; // Lista de exames
let profissionais = JSON.parse(localStorage.getItem('profissionais')) || []; // Lista de profissionais
let suprimentos = JSON.parse(localStorage.getItem('suprimentos')) || []; // Lista de suprimentos
let consultasTele = JSON.parse(localStorage.getItem('consultasTele')) || []; // Lista de consultas tele
let prescricoes = JSON.parse(localStorage.getItem('prescricoes')) || []; // Lista de prescrições
let usuarios = JSON.parse(localStorage.getItem('usuarios')) || []; // Lista de usuários
let auditoria = JSON.parse(localStorage.getItem('auditoria')) || []; // Registro de auditoria
let usuarioLogado = null; // Armazena o usuário atualmente logado
let localStream = null; // Stream de vídeo local para telemedicina
let leitosDisponiveis = JSON.parse(localStorage.getItem('leitosDisponiveis')) || 10; // Contador de leitos disponíveis
let leitosOcupados = JSON.parse(localStorage.getItem('leitosOcupados')) || 5; // Contador de leitos ocupados
let receita = JSON.parse(localStorage.getItem('receita')) || 50000; // Valor inicial da receita
let despesas = JSON.parse(localStorage.getItem('despesas')) || 30000; // Valor inicial das despesas
let historicoFinanceiro = JSON.parse(localStorage.getItem('historicoFinanceiro')) || []; // Histórico financeiro
let cpfsOriginais = JSON.parse(localStorage.getItem('cpfsOriginais')) || []; // Backup de CPFs originais (LGPD)

// Cria um administrador padrão se não existir
if (!usuarios.some(u => u.usuario === 'admin')) {
    const senhaCriptografada = typeof CryptoJS !== 'undefined' ? CryptoJS.AES.encrypt('admin123', 'chave-secreta').toString() : 'admin123'; // Criptografa a senha padrão
    usuarios.push({ usuario: 'admin', senha: senhaCriptografada, permissao: 'admin' }); // Adiciona o admin
    localStorage.setItem('usuarios', JSON.stringify(usuarios)); // Salva no localStorage
}

// Salva todos os dados no localStorage
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
    localStorage.setItem('leitosDisponiveis', JSON.stringify(leitosDisponiveis));
    localStorage.setItem('leitosOcupados', JSON.stringify(leitosOcupados));
    localStorage.setItem('receita', JSON.stringify(receita));
    localStorage.setItem('despesas', JSON.stringify(despesas));
    localStorage.setItem('historicoFinanceiro', JSON.stringify(historicoFinanceiro));
}

// Registra uma entrada no log de auditoria
function registrarAuditoria(mensagem) {
    const dataHora = new Date().toLocaleString('pt-BR'); // Obtém data e hora atual
    auditoria.push(`[${dataHora}]: ${mensagem}`); // Adiciona a mensagem ao log
    salvarDados(); // Salva os dados atualizados
    atualizarLogAuditoria(); // Atualiza a exibição do log
}

// Atualiza a exibição do log de auditoria na interface
function atualizarLogAuditoria() {
    if (domElements.logAuditoria) {
        domElements.logAuditoria.innerHTML = auditoria.map(item => `<p>${item}</p>`).join(''); // Cria parágrafos para cada entrada
    }
}

// Exibe uma notificação temporária na interface
function notificar(mensagem) {
    const modalMensagem = domElements.modalMensagem;
    if (modalMensagem) {
        modalMensagem.textContent = mensagem; // Define o texto da notificação
        modalMensagem.style.display = 'block'; // Mostra o modal
        modalMensagem.style.animation = 'slideIn 0.5s ease-in-out forwards'; // Animação de entrada
        setTimeout(() => {
            modalMensagem.style.animation = 'slideOut 0.5s ease-in-out forwards'; // Animação de saída
            setTimeout(() => modalMensagem.style.display = 'none', 500); // Oculta após animação
        }, 3000); // Duração da exibição (3 segundos)
    } else {
        console.log('Notificação:', mensagem); // Log no console se o modal não existir
        alert(mensagem); // Alerta como fallback
    }
}

// Valida um CPF usando o algoritmo oficial brasileiro
function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, ''); // Remove caracteres não numéricos
    if (cpf.length !== 11) return false; // Verifica se tem 11 dígitos
    let soma = 0, resto;
    for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i-1, i)) * (11 - i); // Calcula primeiro dígito verificador
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;
    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i-1, i)) * (12 - i); // Calcula segundo dígito verificador
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;
    return true; // CPF válido
}

// Valida um email usando uma expressão regular simples
function validarEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Padrão básico de email
    return re.test(email); // Retorna verdadeiro se o email for válido
}

// Formata as permissões para exibição amigável
function formatarPermissao(permissao) {
    const permissoes = {
        admin: 'Administrador',
        atendente: 'Atendente',
        profissional_saude: 'Profissional de Saúde',
        paciente: 'Paciente'
    };
    return permissoes[permissao] || permissao; // Retorna o nome formatado ou o original
}

// Realiza o login do usuário
function login() {
    const usuario = domElements.loginUsuario?.value.trim(); // Obtém o usuário digitado
    const senha = domElements.loginSenha?.value; // Obtém a senha digitada
    if (!usuario || !senha) {
        alert('Preencha usuário e senha!'); // Alerta se campos estiverem vazios
        return;
    }

    const user = usuarios.find(u => u.usuario === usuario); // Busca o usuário na lista
    if (!user) {
        alert('Usuário não encontrado!'); // Alerta se usuário não existir
        return;
    }

    if (typeof CryptoJS === 'undefined') {
        alert('Biblioteca CryptoJS não está disponível!'); // Verifica se CryptoJS está carregado
        return;
    }

    try {
        const decrypted = CryptoJS.AES.decrypt(user.senha, 'chave-secreta').toString(CryptoJS.enc.Utf8); // Descriptografa a senha
        if (decrypted === senha) { // Verifica se a senha corresponde
            usuarioLogado = { usuario: user.usuario, permissao: user.permissao }; // Define o usuário logado
            sessionStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado)); // Armazena na sessão
            console.log('Login bem-sucedido. usuarioLogado:', usuarioLogado);
            if (domElements.usuarioLogadoSpan) domElements.usuarioLogadoSpan.textContent = `${usuarioLogado.usuario} (${formatarPermissao(usuarioLogado.permissao)})`; // Atualiza a interface
            if (domElements.btnLogin) domElements.btnLogin.style.display = 'none'; // Oculta botão de login
            if (domElements.btnLogout) domElements.btnLogout.style.display = 'inline'; // Mostra botão de logout
            if (domElements.loginUsuario) domElements.loginUsuario.style.display = 'none'; // Oculta campo de usuário
            if (domElements.loginSenha) domElements.loginSenha.style.display = 'none'; // Oculta campo de senha
            registrarAuditoria(`Login realizado por ${usuario}`); // Registra no log
            notificar('Login realizado com sucesso!'); // Exibe notificação
            atualizarTodasTabelasESelecoes(); // Atualiza a interface
        } else {
            alert('Usuário ou senha incorretos!'); // Alerta se a senha estiver errada
        }
    } catch (error) {
        console.error('Erro ao descriptografar a senha:', error); // Log de erro
        alert('Erro ao verificar a senha.');
    }
}

// Realiza o logout do usuário
function logout() {
    registrarAuditoria(`Logout realizado por ${usuarioLogado?.usuario}`); // Registra no log
    usuarioLogado = null; // Remove o usuário logado
    sessionStorage.removeItem('usuarioLogado'); // Limpa a sessão
    console.log('Logout realizado. usuarioLogado:', usuarioLogado);
    if (domElements.usuarioLogadoSpan) domElements.usuarioLogadoSpan.textContent = 'Nenhum'; // Atualiza a interface
    if (domElements.btnLogin) domElements.btnLogin.style.display = 'inline'; // Mostra botão de login
    if (domElements.btnLogout) domElements.btnLogout.style.display = 'none'; // Oculta botão de logout
    if (domElements.loginUsuario) {
        domElements.loginUsuario.style.display = 'inline'; // Mostra campo de usuário
        domElements.loginUsuario.value = ''; // Limpa o campo
    }
    if (domElements.loginSenha) {
        domElements.loginSenha.style.display = 'inline'; // Mostra campo de senha
        domElements.loginSenha.value = ''; // Limpa o campo
    }
    notificar('Logout realizado com sucesso!'); // Exibe notificação
    atualizarTodasTabelasESelecoes(); // Atualiza a interface
}

// Atualiza todas as tabelas e seleções da interface
function atualizarTodasTabelasESelecoes() {
    console.log('Atualizando tabelas e seleções. usuarioLogado:', usuarioLogado);
    atualizarTabelaPacientes(); // Atualiza tabela de pacientes
    atualizarTabelaConsultas(); // Atualiza tabela de consultas
    atualizarTabelaExames(); // Atualiza tabela de exames
    atualizarTabelaProfissionais(); // Atualiza tabela de profissionais
    atualizarTabelaAgenda(); // Atualiza tabela de agenda
    atualizarTabelaSuprimentos(); // Atualiza tabela de suprimentos
    atualizarTabelaTelemedicina(); // Atualiza tabela de telemedicina
    atualizarTabelaPrescricoes(); // Atualiza tabela de prescrições
    atualizarTabelaAcesso(); // Atualiza tabela de acesso
    atualizarTabelaFinanceiro(); // Atualiza tabela financeira
    atualizarLogAuditoria(); // Atualiza log de auditoria
    atualizarSelecaoPacientes(); // Atualiza seleções de pacientes
    atualizarSelecaoProfissionais(); // Atualiza seleções de profissionais
    atualizarSelecaoEspecialidades(); // Atualiza seleções de especialidades
    atualizarSelecaoConsultasTele(); // Atualiza seleções de consultas tele
    atualizarLeitos(); // Atualiza exibição de leitos
    atualizarFinancas(); // Atualiza exibição financeira
}

// Atualiza os selects de pacientes em vários formulários
function atualizarSelecaoPacientes() {
    const selects = [
        document.getElementById('pacienteConsulta'),
        document.getElementById('pacienteExame'),
        document.getElementById('pacienteTele'),
        document.getElementById('pacientePrescricao'),
        document.getElementById('selecionarPaciente'),
        document.getElementById('selecionarPacienteHistorico')
    ];
    selects.forEach(select => {
        if (select) {
            select.innerHTML = '<option value="">Selecione um paciente</option>' + // Opção padrão
                pacientes.map(p => `<option value="${p.cpf}">${p.nome}</option>`).join(''); // Lista de pacientes
        }
    });
}

// Atualiza os selects de profissionais em vários formulários
function atualizarSelecaoProfissionais() {
    const selects = [
        document.getElementById('profissionalConsulta'),
        document.getElementById('profissionalTele'),
        document.getElementById('selecionarProfissional')
    ];
    selects.forEach(select => {
        if (select) {
            select.innerHTML = '<option value="">Selecione um profissional</option>' + // Opção padrão
                profissionais.map(p => `<option value="${p.crm}">${p.nome}</option>`).join(''); // Lista de profissionais
        }
    });
}

// Atualiza o select de especialidades com base nos profissionais
function atualizarSelecaoEspecialidades() {
    if (domElements.especialidadeConsulta) {
        const especialidades = [...new Set(profissionais.map(p => p.especialidade))]; // Remove duplicatas
        domElements.especialidadeConsulta.innerHTML = '<option value="">Selecione uma especialidade</option>' + // Opção padrão
            especialidades.map(e => `<option value="${e}">${e}</option>`).join(''); // Lista de especialidades
    }
}

// Preenche automaticamente a especialidade ao selecionar um profissional
function preencherEspecialidade() {
    const crm = document.getElementById('profissionalConsulta')?.value; // Obtém o CRM selecionado
    const profissional = profissionais.find(p => p.crm === crm); // Busca o profissional
    if (profissional && domElements.especialidadeConsulta) {
        domElements.especialidadeConsulta.value = profissional.especialidade; // Define a especialidade
    }
}

// Preenche o select de profissionais com base na especialidade selecionada
function preencherProfissional() {
    const especialidade = domElements.especialidadeConsulta?.value; // Obtém a especialidade
    const selectProfissional = document.getElementById('profissionalConsulta');
    if (selectProfissional) {
        selectProfissional.innerHTML = '<option value="">Selecione um profissional</option>' + // Opção padrão
            profissionais
                .filter(p => p.especialidade === especialidade) // Filtra por especialidade
                .map(p => `<option value="${p.crm}">${p.nome}</option>`).join(''); // Lista de profissionais
    }
}

// Atualiza o select de consultas de telemedicina
function atualizarSelecaoConsultasTele() {
    if (domElements.selecionarConsultaTele) {
        domElements.selecionarConsultaTele.innerHTML = '<option value="">Selecione uma consulta</option>' + // Opção padrão
            consultasTele.map((c, index) => `<option value="${index}">${c.paciente} - ${c.data} ${c.hora}</option>`).join(''); // Lista de consultas
    }
    const selectPrescricao = document.getElementById('consultaTelePrescricao');
    if (selectPrescricao) {
        selectPrescricao.innerHTML = '<option value="">Selecione uma consulta</option>' + // Opção padrão
            consultasTele.map((c, index) => `<option value="${index}">${c.paciente} - ${c.data} ${c.hora}</option>`).join(''); // Lista de consultas
    }
}

// Atualiza a tabela de pacientes
function atualizarTabelaPacientes() {
    if (domElements.tabelaPacientes) {
        if (!usuarioLogado) { // Verifica se há usuário logado
            domElements.tabelaPacientes.innerHTML = '<tr><td colspan="6">Faça login para visualizar os dados dos pacientes</td></tr>';
            return;
        }
        const corpoTabela = pacientes.map((p, index) => `
            <tr>
                <td>${p.nome}</td>
                <td>${p.cpf}</td>
                <td>${p.dataNascimento}</td>
                <td>${p.telefone}</td>
                <td>${p.endereco}</td>
                <td><button class="excluir" onclick="confirmarExclusao('paciente', ${index})">Excluir</button></td>
            </tr>`).join(''); // Gera as linhas da tabela
        domElements.tabelaPacientes.innerHTML = `
            <thead>
                <tr>
                    <th>Nome</th>
                    <th>CPF</th>
                    <th>Data de Nascimento</th>
                    <th>Telefone</th>
                    <th>Endereço</th>
                    <th>Ação</th>
                </tr>
            </thead>
            <tbody>
                ${corpoTabela || '<tr><td colspan="6">Nenhum paciente cadastrado</td></tr>'} // Exibe mensagem se vazio
            </tbody>`;
    }
}

// Atualiza a tabela de consultas
function atualizarTabelaConsultas() {
    if (domElements.tabelaConsultas) {
        if (!usuarioLogado) {
            domElements.tabelaConsultas.innerHTML = '<tr><td colspan="6">Faça login para visualizar as consultas</td></tr>';
            return;
        }
        const corpoTabela = consultas.map((c, index) => `
            <tr>
                <td>${c.paciente}</td>
                <td>${c.profissional}</td>
                <td>${c.data}</td>
                <td>${c.hora}</td>
                <td>${c.especialidade}</td>
                <td><button class="excluir" onclick="confirmarExclusao('consulta', ${index})">Excluir</button></td>
            </tr>`).join('');
        domElements.tabelaConsultas.innerHTML = `
            <thead>
                <tr>
                    <th>Paciente</th>
                    <th>Profissional</th>
                    <th>Data</th>
                    <th>Hora</th>
                    <th>Especialidade</th>
                    <th>Ação</th>
                </tr>
            </thead>
            <tbody>
                ${corpoTabela || '<tr><td colspan="6">Nenhuma consulta agendada</td></tr>'}
            </tbody>`;
    }
}

// Atualiza a tabela de exames
function atualizarTabelaExames() {
    if (domElements.tabelaExames) {
        if (!usuarioLogado) {
            domElements.tabelaExames.innerHTML = '<tr><td colspan="5">Faça login para visualizar os exames</td></tr>';
            return;
        }
        const corpoTabela = exames.map((e, index) => `
            <tr>
                <td>${e.paciente}</td>
                <td>${e.tipo}</td>
                <td>${e.data}</td>
                <td>${e.resultado || 'Pendente'}</td>
                <td><button class="excluir" onclick="confirmarExclusao('exame', ${index})">Excluir</button></td>
            </tr>`).join('');
        domElements.tabelaExames.innerHTML = `
            <thead>
                <tr>
                    <th>Paciente</th>
                    <th>Tipo</th>
                    <th>Data</th>
                    <th>Resultado</th>
                    <th>Ação</th>
                </tr>
            </thead>
            <tbody>
                ${corpoTabela || '<tr><td colspan="5">Nenhum exame agendado</td></tr>'}
            </tbody>`;
    }
}

// Atualiza a tabela de profissionais
function atualizarTabelaProfissionais() {
    if (domElements.tabelaProf) {
        if (!usuarioLogado) {
            domElements.tabelaProf.innerHTML = '<tr><td colspan="7">Faça login para visualizar os profissionais</td></tr>';
            return;
        }
        const corpoTabela = profissionais.map((p, index) => `
            <tr>
                <td>${p.nome}</td>
                <td>${p.categoria}</td>
                <td>${p.especialidade}</td>
                <td>${p.crm}</td>
                <td>${p.telefone}</td>
                <td>${p.email}</td>
                <td><button class="excluir" onclick="confirmarExclusao('profissional', ${index})">Excluir</button></td>
            </tr>`).join('');
        domElements.tabelaProf.innerHTML = `
            <thead>
                <tr>
                    <th>Nome</th>
                    <th>Categoria</th>
                    <th>Especialidade</th>
                    <th>CRM/Registro</th>
                    <th>Telefone</th>
                    <th>Email</th>
                    <th>Ação</th>
                </tr>
            </thead>
            <tbody>
                ${corpoTabela || '<tr><td colspan="7">Nenhum profissional cadastrado</td></tr>'}
            </tbody>`;
    }
}

// Atualiza a tabela de agenda com filtros por profissional
function atualizarTabelaAgenda() {
    if (domElements.tabelaAgenda) {
        if (!usuarioLogado) {
            domElements.tabelaAgenda.innerHTML = '<tr><td colspan="5">Faça login para visualizar a agenda</td></tr>';
            return;
        }
        const selectProfissional = document.getElementById('selecionarProfissional');
        const crm = selectProfissional?.value;
        let consultasFiltradas = [];
        let teleconsultasFiltradas = [];
        if (crm) { // Filtra por profissional selecionado
            const profissional = profissionais.find(p => p.crm === crm);
            if (profissional) {
                consultasFiltradas = consultas.filter(c => c.profissional === profissional.nome);
                teleconsultasFiltradas = consultasTele.filter(c => c.profissional === profissional.nome);
            }
        } else { // Mostra todas as consultas
            consultasFiltradas = consultas;
            teleconsultasFiltradas = consultasTele;
        }
        const corpoTabela = [
            ...consultasFiltradas.map(c => `
                <tr>
                    <td>${c.paciente}</td>
                    <td>${c.data}</td>
                    <td>${c.hora}</td>
                    <td>${c.especialidade}</td>
                    <td>Presencial</td>
                </tr>`),
            ...teleconsultasFiltradas.map(c => `
                <tr>
                    <td>${c.paciente}</td>
                    <td>${c.data}</td>
                    <td>${c.hora}</td>
                    <td>${c.especialidade || 'Telemedicina'}</td>
                    <td>Online</td>
                </tr>`)
        ].join('');
        domElements.tabelaAgenda.innerHTML = `
            <thead>
                <tr>
                    <th>Paciente</th>
                    <th>Data</th>
                    <th>Hora</th>
                    <th>Especialidade/Tipo</th>
                    <th>Tipo de Consulta</th>
                </tr>
            </thead>
            <tbody>
                ${corpoTabela || '<tr><td colspan="5">Nenhuma consulta na agenda</td></tr>'}
            </tbody>`;
    }
}

// Atualiza a tabela de suprimentos
function atualizarTabelaSuprimentos() {
    if (domElements.tabelaSuprimentos) {
        if (!usuarioLogado) {
            domElements.tabelaSuprimentos.innerHTML = '<tr><td colspan="4">Faça login para visualizar os suprimentos</td></tr>';
            return;
        }
        const corpoTabela = suprimentos.map((s, index) => `
            <tr>
                <td>${s.nome}</td>
                <td>${s.quantidade}</td>
                <td>R$ ${s.precoUnitario.toFixed(2)}</td>
                <td><button class="excluir" onclick="confirmarExclusao('suprimento', ${index})">Excluir</button></td>
            </tr>`).join('');
        domElements.tabelaSuprimentos.innerHTML = `
            <thead>
                <tr>
                    <th>Nome</th>
                    <th>Quantidade</th>
                    <th>Preço Unitário</th>
                    <th>Ação</th>
                </tr>
            </thead>
            <tbody>
                ${corpoTabela || '<tr><td colspan="4">Nenhum suprimento cadastrado</td></tr>'}
            </tbody>`;
    }
}

// Atualiza a tabela de consultas de telemedicina
function atualizarTabelaTelemedicina() {
    if (domElements.tabelaTelemedicina) {
        if (!usuarioLogado) {
            domElements.tabelaTelemedicina.innerHTML = '<tr><td colspan="6">Faça login para visualizar as consultas de telemedicina</td></tr>';
            return;
        }
        const corpoTabela = consultasTele.map((c, index) => `
            <tr>
                <td>${c.paciente}</td>
                <td>${c.profissional}</td>
                <td>${c.data}</td>
                <td>${c.hora}</td>
                <td>Telemedicina</td>
                <td><button class="excluir" onclick="confirmarExclusao('consultaTele', ${index})">Excluir</button></td>
            </tr>`).join('');
        domElements.tabelaTelemedicina.innerHTML = `
            <thead>
                <tr>
                    <th>Paciente</th>
                    <th>Profissional</th>
                    <th>Data</th>
                    <th>Hora</th>
                    <th>Tipo</th>
                    <th>Ação</th>
                </tr>
            </thead>
            <tbody>
                ${corpoTabela || '<tr><td colspan="6">Nenhuma consulta de telemedicina agendada</td></tr>'}
            </tbody>`;
    }
}

// Atualiza a tabela de prescrições e exames (histórico clínico)
function atualizarTabelaPrescricoes() {
    if (domElements.tabelaHistoricoPrescricoes) {
        if (!usuarioLogado) {
            domElements.tabelaHistoricoPrescricoes.innerHTML = '<tr><td colspan="7">Faça login para visualizar as prescrições</td></tr>';
            return;
        }
        const cpf = document.getElementById('selecionarPacienteHistorico')?.value;
        if (!cpf) {
            domElements.tabelaHistoricoPrescricoes.innerHTML = '<tr><td colspan="7">Selecione um paciente</td></tr>';
            return;
        }
        const paciente = pacientes.find(p => p.cpf === cpf);
        if (!paciente) {
            domElements.tabelaHistoricoPrescricoes.innerHTML = '<tr><td colspan="7">Paciente não encontrado</td></tr>';
            return;
        }
        const prescricoesFiltradas = prescricoes.filter(p => p.paciente === paciente.nome); // Filtra prescrições
        const examesFiltrados = exames.filter(e => e.paciente === paciente.nome); // Filtra exames
        const historico = [
            ...prescricoesFiltradas.map((p, index) => ({
                tipo: 'Prescrição',
                data: p.data || new Date().toLocaleDateString('pt-BR'),
                profissional: p.profissional || 'N/A',
                medicamento: p.medicamento,
                dosagem: p.dosagem,
                instrucoes: p.instrucoes,
                index: index
            })),
            ...examesFiltrados.map((e, index) => ({
                tipo: 'Exame',
                data: e.data,
                profissional: 'N/A',
                medicamento: e.tipo,
                dosagem: '-',
                instrucoes: e.resultado || 'Pendente',
                index: index
            }))
        ];
        const corpoTabela = historico.map(item => `
            <tr>
                <td>${item.data}</td>
                <td>${item.profissional}</td>
                <td>${item.medicamento}</td>
                <td>${item.dosagem}</td>
                <td>${item.instrucoes}</td>
                <td>${item.tipo}</td>
                <td><button class="excluir" onclick="confirmarExclusao('${item.tipo.toLowerCase()}', ${item.index})">Excluir</button></td>
            </tr>`).join('');
        domElements.tabelaHistoricoPrescricoes.innerHTML = `
            <thead>
                <tr>
                    <th>Data</th>
                    <th>Profissional</th>
                    <th>Medicamento/Tipo</th>
                    <th>Dosagem</th>
                    <th>Instruções/Resultado</th>
                    <th>Tipo</th>
                    <th>Ação</th>
                </tr>
            </thead>
            <tbody>
                ${corpoTabela || '<tr><td colspan="7">Nenhuma prescrição ou exame registrado</td></tr>'}
            </tbody>`;
    }
}

// Atualiza a tabela de acesso de usuários
function atualizarTabelaAcesso() {
    if (domElements.tabelaAcesso) {
        if (!usuarioLogado) {
            domElements.tabelaAcesso.innerHTML = '<tr><td colspan="3">Faça login para visualizar os usuários</td></tr>';
            return;
        }
        const corpoTabela = usuarios.map((u, index) => `
            <tr>
                <td>${u.usuario}</td>
                <td>${formatarPermissao(u.permissao)}</td>
                <td><button class="excluir" onclick="confirmarExclusao('usuario', ${index})">Excluir</button></td>
            </tr>`).join('');
        domElements.tabelaAcesso.innerHTML = `
            <thead>
                <tr>
                    <th>Usuário</th>
                    <th>Permissão</th>
                    <th>Ação</th>
                </tr>
            </thead>
            <tbody>
                ${corpoTabela || '<tr><td colspan="3">Nenhum usuário cadastrado</td></tr>'}
            </tbody>`;
    }
}

// Atualiza a exibição de leitos disponíveis e ocupados
function atualizarLeitos() {
    if (domElements.leitosDisponiveisSpan && domElements.leitosOcupadosSpan) {
        if (!usuarioLogado) {
            domElements.leitosDisponiveisSpan.textContent = 'Faça login';
            domElements.leitosOcupadosSpan.textContent = 'Faça login';
            return;
        }
        domElements.leitosDisponiveisSpan.textContent = leitosDisponiveis; // Exibe leitos disponíveis
        domElements.leitosOcupadosSpan.textContent = leitosOcupados; // Exibe leitos ocupados
    }
}

// Atualiza a exibição financeira (receita, despesa, saldo)
function atualizarFinancas() {
    if (domElements.receitaSpan && domElements.despesaSpan && domElements.saldoSpan) {
        if (!usuarioLogado) {
            domElements.receitaSpan.textContent = 'Faça login';
            domElements.despesaSpan.textContent = 'Faça login';
            domElements.saldoSpan.textContent = 'Faça login';
            return;
        }
        domElements.receitaSpan.textContent = receita.toFixed(2); // Exibe receita
        domElements.despesaSpan.textContent = despesas.toFixed(2); // Exibe despesa
        domElements.saldoSpan.textContent = (receita - despesas).toFixed(2); // Exibe saldo
    }
}

// Atualiza a tabela de histórico financeiro
function atualizarTabelaFinanceiro() {
    if (domElements.tabelaFinanceiro) {
        if (!usuarioLogado) {
            domElements.tabelaFinanceiro.innerHTML = '<tr><td colspan="4">Faça login para visualizar o histórico financeiro</td></tr>';
            return;
        }
        const corpoTabela = historicoFinanceiro.map((h, index) => `
            <tr>
                <td>${h.data}</td>
                <td>R$ ${h.receita.toFixed(2)}</td>
                <td>R$ ${h.despesa.toFixed(2)}</td>
                <td><button class="excluir" onclick="confirmarExclusao('financeiro', ${index})">Excluir</button></td>
            </tr>`).join('');
        domElements.tabelaFinanceiro.innerHTML = `
            <thead>
                <tr>
                    <th>Data</th>
                    <th>Receita</th>
                    <th>Despesa</th>
                    <th>Ação</th>
                </tr>
            </thead>
            <tbody>
                ${corpoTabela || '<tr><td colspan="4">Nenhum registro financeiro</td></tr>'}
            </tbody>`;
    }
}

// Exibe o histórico do paciente selecionado
function mostrarHistorico() {
    if (domElements.historicoPaciente) {
        if (!usuarioLogado) {
            domElements.historicoPaciente.innerHTML = '<p>Faça login para visualizar o histórico</p>';
            return;
        }
        const cpf = domElements.selecionarPaciente?.value;
        if (!cpf) {
            domElements.historicoPaciente.innerHTML = '<p>Selecione um paciente</p>';
            return;
        }
        const pacienteConsultas = consultas.filter(c => c.cpf === cpf); // Filtra consultas
        const pacienteExames = exames.filter(e => e.cpf === cpf); // Filtra exames
        const pacienteTeleconsultas = consultasTele.filter(c => c.cpf === cpf); // Filtra teleconsultas
        domElements.historicoPaciente.innerHTML = `
            <h3>Consultas Presenciais</h3>
            ${pacienteConsultas.map(c => `<p>${c.data} ${c.hora} - ${c.profissional} (${c.especialidade})</p>`).join('') || '<p>Nenhuma consulta</p>'}
            <h3>Exames</h3>
            ${pacienteExames.map(e => `<p>${e.data} - ${e.tipo}: ${e.resultado || 'Pendente'}</p>`).join('') || '<p>Nenhum exame</p>'}
            <h3>Teleconsultas</h3>
            ${pacienteTeleconsultas.map(c => `<p>${c.data} ${c.hora} - ${c.profissional}</p>`).join('') || '<p>Nenhuma teleconsulta</p>'}`;
    }
}

// Carrega informações da consulta de telemedicina selecionada
function carregarConsultaSelecionada() {
    const videoArea = document.getElementById('videoArea');
    const mensagemVideochamada = document.getElementById('mensagemVideochamada');
    if (!usuarioLogado) {
        mensagemVideochamada.textContent = 'Faça login para iniciar uma videochamada';
        videoArea.style.display = 'none';
        return;
    }
    const index = domElements.selecionarConsultaTele?.value;
    if (index === '') {
        mensagemVideochamada.textContent = 'Selecione uma consulta para iniciar';
        videoArea.style.display = 'none';
        return;
    }
    const consulta = consultasTele[index];
    mensagemVideochamada.textContent = `Consulta com ${consulta.paciente} em ${consulta.data} às ${consulta.hora}`;
    videoArea.style.display = 'flex'; // Mostra a área de vídeo
}

// Inicia uma videochamada
async function iniciarVideoChamada() {
    if (!usuarioLogado) {
        alert('Faça login para iniciar uma videochamada!');
        return;
    }
    if (usuarioLogado.permissao !== 'admin' && usuarioLogado.permissao !== 'profissional_saude') {
        alert('Você não tem permissão para iniciar uma videochamada!');
        return;
    }

    const index = domElements.selecionarConsultaTele?.value;
    if (index === '') {
        alert('Selecione uma consulta para iniciar!');
        return;
    }

    const consulta = consultasTele[index];
    consulta.status = 'Em andamento'; // Atualiza o status
    salvarDados();
    atualizarTabelaTelemedicina();

    document.getElementById('startVideoCall').style.display = 'none'; // Oculta botão de iniciar
    document.getElementById('stopVideoCall').style.display = 'inline-block'; // Mostra botão de encerrar

    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true }); // Acessa câmera e microfone
        const localVideo = document.getElementById('localVideo');
        localVideo.srcObject = localStream; // Exibe o vídeo local

        const remoteVideoContainer = document.getElementById('remoteVideoContainer');
        const remoteVideo = document.getElementById('remoteVideo');
        const remoteVideoPlaceholder = document.getElementById('remoteVideoPlaceholder');
        remoteVideo.style.display = 'none'; // Oculta vídeo remoto real
        remoteVideoPlaceholder.style.display = 'block'; // Mostra placeholder
        remoteVideoPlaceholder.textContent = `Vídeo do Paciente: ${consulta.paciente} (Simulado)`;

        registrarAuditoria(`Videochamada iniciada com ${consulta.paciente} por ${usuarioLogado.usuario}`);
        notificar('Videochamada iniciada com sucesso!');
    } catch (error) {
        console.error('Erro ao acessar a câmera:', error);
        alert('Não foi possível acessar a câmera. Verifique as permissões e se há uma câmera disponível.');
        document.getElementById('startVideoCall').style.display = 'inline-block';
        document.getElementById('stopVideoCall').style.display = 'none';
    }
}

// Encerra uma videochamada
function encerrarVideoChamada() {
    if (!usuarioLogado) {
        alert('Faça login para encerrar uma videochamada!');
        return;
    }

    const index = domElements.selecionarConsultaTele?.value;
    if (index === '') {
        alert('Selecione uma consulta para encerrar!');
        return;
    }

    const consulta = consultasTele[index];
    consulta.status = 'Concluída'; // Atualiza o status
    salvarDados();
    atualizarTabelaTelemedicina();

    document.getElementById('startVideoCall').style.display = 'inline-block'; // Mostra botão de iniciar
    document.getElementById('stopVideoCall').style.display = 'none'; // Oculta botão de encerrar

    if (localStream) { // Para o stream de vídeo
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
    }

    const localVideo = document.getElementById('localVideo');
    localVideo.srcObject = null; // Limpa o vídeo local

    const remoteVideoContainer = document.getElementById('remoteVideoContainer');
    const remoteVideo = document.getElementById('remoteVideo');
    const remoteVideoPlaceholder = document.getElementById('remoteVideoPlaceholder');
    remoteVideo.style.display = 'none';
    remoteVideoPlaceholder.style.display = 'block';
    remoteVideoPlaceholder.textContent = 'Vídeo do Paciente (Simulado)';

    registrarAuditoria(`Videochamada encerrada com ${consulta.paciente} por ${usuarioLogado.usuario}`);
    notificar('Videochamada encerrada com sucesso!');
}

// Adiciona um novo paciente
function adicionarPaciente() {
    if (!usuarioLogado) {
        alert('Faça login para adicionar um paciente!');
        return;
    }
    if (usuarioLogado.permissao !== 'admin' && usuarioLogado.permissao !== 'atendente') {
        alert('Você não tem permissão para adicionar pacientes!');
        return;
    }

    const nome = document.getElementById('nome')?.value;
    let cpf = document.getElementById('cpf')?.value;
    const dataNascimento = document.getElementById('dataNascimento')?.value;
    const telefone = document.getElementById('telefone')?.value;
    const endereco = document.getElementById('endereco')?.value;

    if (!nome || !cpf || !dataNascimento || !telefone || !endereco) {
        alert('Preencha todos os campos!');
        return;
    }

    const cpfLimpo = cpf.replace(/[^\d]+/g, ''); // Remove caracteres não numéricos
    if (cpfLimpo.length !== 11) {
        alert('CPF inválido! Deve conter 11 dígitos.');
        return;
    }

    if (pacientes.some(p => p.cpf === cpf)) {
        alert('CPF já cadastrado!');
        return;
    }

    pacientes.push({ nome, cpf, dataNascimento, telefone, endereco }); // Adiciona o paciente
    salvarDados();
    atualizarTabelaPacientes();
    atualizarSelecaoPacientes();
    registrarAuditoria(`Paciente ${nome} adicionado por ${usuarioLogado.usuario}`);
    notificar('Paciente cadastrado com sucesso.');

    // Limpa o formulário
    document.getElementById('nome').value = '';
    document.getElementById('cpf').value = '';
    document.getElementById('dataNascimento').value = '';
    document.getElementById('telefone').value = '';
    document.getElementById('endereco').value = '';
}

// Adiciona uma nova consulta presencial
function adicionarConsulta() {
    if (!usuarioLogado) {
        alert('Faça login para adicionar uma consulta!');
        return;
    }
    if (usuarioLogado.permissao !== 'admin' && usuarioLogado.permissao !== 'atendente') {
        alert('Você não tem permissão para agendar consultas!');
        return;
    }
    const cpf = document.getElementById('pacienteConsulta')?.value;
    const crm = document.getElementById('profissionalConsulta')?.value;
    const especialidade = document.getElementById('especialidadeConsulta')?.value;
    const data = document.getElementById('dataConsulta')?.value;
    const hora = document.getElementById('horaConsulta')?.value;
    if (!cpf || !crm || !especialidade || !data || !hora) {
        alert('Preencha todos os campos!');
        return;
    }
    const paciente = pacientes.find(p => p.cpf === cpf);
    const profissional = profissionais.find(p => p.crm === crm);
    if (!paciente || !profissional) {
        alert('Paciente ou profissional não encontrado!');
        return;
    }
    consultas.push({
        cpf: paciente.cpf,
        paciente: paciente.nome,
        profissional: profissional.nome,
        especialidade,
        data,
        hora
    });
    salvarDados();
    atualizarTabelaConsultas();
    registrarAuditoria(`Consulta agendada para ${paciente.nome} com ${profissional.nome} por ${usuarioLogado.usuario}`);
    notificar('Consulta presencial agendada com sucesso.');
}

// Adiciona um novo exame
function adicionarExame() {
    if (!usuarioLogado) {
        alert('Faça login para adicionar um exame!');
        return;
    }
    if (usuarioLogado.permissao !== 'admin' && usuarioLogado.permissao !== 'atendente') {
        alert('Você não tem permissão para agendar exames!');
        return;
    }
    const cpf = document.getElementById('pacienteExame')?.value;
    const tipo = document.getElementById('tipoExame')?.value;
    const data = document.getElementById('dataExame')?.value;
    const resultado = document.getElementById('resultadoExame')?.value;
    if (!cpf || !tipo || !data) {
        alert('Preencha todos os campos obrigatórios!');
        return;
    }
    const paciente = pacientes.find(p => p.cpf === cpf);
    if (!paciente) {
        alert('Paciente não encontrado!');
        return;
    }
    exames.push({ cpf: paciente.cpf, paciente: paciente.nome, tipo, data, resultado });
    salvarDados();
    atualizarTabelaExames();
    registrarAuditoria(`Exame ${tipo} agendado para ${paciente.nome} por ${usuarioLogado.usuario}`);
    notificar('Exame agendado com sucesso.');
}

// Adiciona um novo profissional
function adicionarProfissional() {
    if (!usuarioLogado) {
        alert('Faça login para adicionar um profissional!');
        return;
    }
    if (usuarioLogado.permissao !== 'admin') {
        alert('Você não tem permissão para adicionar profissionais!');
        return;
    }
    const nome = document.getElementById('nomeProfissional')?.value;
    const categoria = document.getElementById('categoriaProfissional')?.value;
    const especialidade = document.getElementById('especialidadeProfissional')?.value;
    const crm = document.getElementById('crm')?.value;
    const telefone = document.getElementById('telefoneProfissional')?.value;
    const email = document.getElementById('emailProfissional')?.value;
    if (!nome || !categoria || !especialidade || !crm || !telefone || !email) {
        alert('Preencha todos os campos!');
        return;
    }
    if (!validarEmail(email)) {
        alert('Email inválido!');
        return;
    }
    if (profissionais.some(p => p.crm === crm)) {
        alert('CRM já cadastrado!');
        return;
    }
    profissionais.push({ nome, categoria, especialidade, crm, telefone, email });
    salvarDados();
    atualizarTabelaProfissionais();
    atualizarSelecaoProfissionais();
    atualizarSelecaoEspecialidades();
    registrarAuditoria(`Profissional ${nome} adicionado por ${usuarioLogado.usuario}`);
    notificar('Profissional cadastrado com sucesso.');
}

// Adiciona um novo suprimento
function adicionarSuprimento() {
    if (!usuarioLogado) {
        alert('Faça login para adicionar um suprimento!');
        return;
    }
    if (usuarioLogado.permissao !== 'admin') {
        alert('Você não tem permissão para adicionar suprimentos!');
        return;
    }
    const nome = document.getElementById('nomeSuprimento')?.value;
    const quantidade = parseInt(document.getElementById('quantidadeSuprimento')?.value);
    const precoUnitario = parseFloat(document.getElementById('precoUnitario')?.value);
    if (!nome || isNaN(quantidade) || isNaN(precoUnitario)) {
        alert('Preencha todos os campos corretamente!');
        return;
    }
    suprimentos.push({ nome, quantidade, precoUnitario });
    despesas += quantidade * precoUnitario; // Atualiza despesas
    historicoFinanceiro.push({ data: new Date().toLocaleDateString('pt-BR'), receita, despesa: despesas });
    salvarDados();
    atualizarTabelaSuprimentos();
    atualizarFinancas();
    atualizarTabelaFinanceiro();
    registrarAuditoria(`Suprimento ${nome} adicionado por ${usuarioLogado.usuario}`);
    notificar('Suprimento adicionado com sucesso.');
}

// Adiciona uma nova consulta de telemedicina
function adicionarConsultaTelemedicina() {
    if (!usuarioLogado) {
        alert('Faça login para adicionar uma consulta de telemedicina!');
        return;
    }
    if (usuarioLogado.permissao !== 'admin' && usuarioLogado.permissao !== 'atendente') {
        alert('Você não tem permissão para agendar teleconsultas!');
        return;
    }
    const cpf = document.getElementById('pacienteTele')?.value;
    const crm = document.getElementById('profissionalTele')?.value;
    const data = document.getElementById('dataTele')?.value;
    const hora = document.getElementById('horaTele')?.value;
    if (!cpf || !crm || !data || !hora) {
        alert('Preencha todos os campos!');
        return;
    }
    const paciente = pacientes.find(p => p.cpf === cpf);
    const profissional = profissionais.find(p => p.crm === crm);
    if (!paciente || !profissional) {
        alert('Paciente ou profissional não encontrado!');
        return;
    }
    consultasTele.push({
        cpf: paciente.cpf,
        paciente: paciente.nome,
        profissional: profissional.nome,
        especialidade: profissional.especialidade,
        data,
        hora
    });
    salvarDados();
    atualizarTabelaTelemedicina();
    atualizarSelecaoConsultasTele();
    registrarAuditoria(`Teleconsulta agendada para ${paciente.nome} com ${profissional.nome} por ${usuarioLogado.usuario}`);
    notificar('Consulta online agendada com sucesso.');
}

// Adiciona uma prescrição a partir de uma consulta de telemedicina
function adicionarPrescricao() {
    if (!usuarioLogado) {
        alert('Faça login para adicionar uma prescrição!');
        return;
    }
    if (usuarioLogado.permissao !== 'admin' && usuarioLogado.permissao !== 'profissional_saude') {
        alert('Você não tem permissão para adicionar prescrições!');
        return;
    }
    const index = document.getElementById('consultaTelePrescricao')?.value;
    const medicamento = document.getElementById('medicamento')?.value;
    const dosagem = document.getElementById('dosagem')?.value;
    const instrucoes = document.getElementById('instrucoes')?.value;
    if (index === '' || !medicamento || !dosagem || !instrucoes) {
        alert('Preencha todos os campos!');
        return;
    }
    const consulta = consultasTele[index];
    prescricoes.push({
        paciente: consulta.paciente,
        profissional: consulta.profissional,
        data: consulta.data,
        medicamento,
        dosagem,
        instrucoes
    });
    salvarDados();
    atualizarTabelaPrescricoes();
    registrarAuditoria(`Prescrição adicionada para ${consulta.paciente} por ${usuarioLogado.usuario}`);
    notificar('Prescrição adicionada com sucesso.');
}

// Adiciona uma prescrição direta por um profissional
function adicionarPrescricaoProf() {
    if (!usuarioLogado) {
        alert('Faça login para adicionar uma prescrição!');
        return;
    }
    if (usuarioLogado.permissao !== 'admin' && usuarioLogado.permissao !== 'profissional_saude') {
        alert('Você não tem permissão para adicionar prescrições!');
        return;
    }
    const cpf = document.getElementById('pacientePrescricao')?.value;
    const medicamento = document.getElementById('medicamentoProf')?.value;
    const dosagem = document.getElementById('dosagemProf')?.value;
    const instrucoes = document.getElementById('instrucoesProf')?.value;
    if (!cpf || !medicamento || !dosagem || !instrucoes) {
        alert('Preencha todos os campos!');
        return;
    }
    const paciente = pacientes.find(p => p.cpf === cpf);
    if (!paciente) {
        alert('Paciente não encontrado!');
        return;
    }
    const profissional = profissionais.find(p => p.email === usuarioLogado.usuario) || { nome: usuarioLogado.usuario };
    prescricoes.push({
        paciente: paciente.nome,
        profissional: profissional.nome,
        data: new Date().toLocaleDateString('pt-BR'),
        medicamento,
        dosagem,
        instrucoes
    });
    salvarDados();
    atualizarTabelaPrescricoes();
    registrarAuditoria(`Prescrição adicionada para ${paciente.nome} por ${usuarioLogado.usuario}`);
    notificar('Prescrição adicionada com sucesso.');
}

// Adiciona um novo usuário ao sistema
function adicionarUsuario() {
    if (!usuarioLogado) {
        alert('Faça login para adicionar um usuário!');
        return;
    }
    if (usuarioLogado.permissao !== 'admin') {
        alert('Você não tem permissão para adicionar usuários!');
        return;
    }
    const usuario = document.getElementById('novoUsuario')?.value;
    const senha = document.getElementById('novaSenha')?.value;
    const permissao = document.getElementById('permissao')?.value;
    if (!usuario || !senha || !permissao) {
        alert('Preencha todos os campos!');
        return;
    }
    if (usuarios.some(u => u.usuario === usuario)) {
        alert('Usuário já existe!');
        return;
    }
    const senhaCriptografada = CryptoJS.AES.encrypt(senha, 'chave-secreta').toString(); // Criptografa a senha
    usuarios.push({ usuario, senha: senhaCriptografada, permissao });
    salvarDados();
    atualizarTabelaAcesso();
    registrarAuditoria(`Usuário ${usuario} adicionado com permissão ${permissao} por ${usuarioLogado.usuario}`);
    notificar('Usuário adicionado com sucesso!');
}

// Exibe o modal de confirmação antes de excluir um item
function confirmarExclusao(tipo, index) {
    if (!usuarioLogado) {
        alert('Faça login para realizar esta ação!');
        return;
    }
    if (domElements.modalConfirmacao) {
        const modal = new bootstrap.Modal(domElements.modalConfirmacao); // Usa Bootstrap para o modal
        modal.show();
        document.getElementById('confirmarExclusao').onclick = () => executarExclusao(tipo, index, modal); // Associa ação de exclusão
    }
}

// Executa a exclusão de um item após confirmação
function executarExclusao(tipo, index, modal) {
    if (!usuarioLogado) {
        alert('Faça login para realizar esta ação!');
        return;
    }
    let mensagemAuditoria = '';
    switch (tipo) {
        case 'paciente':
            if (usuarioLogado.permissao !== 'admin') {
                alert('Você não tem permissão para excluir pacientes!');
                return;
            }
            mensagemAuditoria = `Paciente ${pacientes[index].nome} excluído por ${usuarioLogado.usuario}`;
            pacientes.splice(index, 1); // Remove o paciente
            atualizarTabelaPacientes();
            atualizarSelecaoPacientes();
            break;
        case 'consulta':
            if (usuarioLogado.permissao !== 'admin' && usuarioLogado.permissao !== 'atendente') {
                alert('Você não tem permissão para excluir consultas!');
                return;
            }
            mensagemAuditoria = `Consulta de ${consultas[index].paciente} excluída por ${usuarioLogado.usuario}`;
            consultas.splice(index, 1);
            atualizarTabelaConsultas();
            break;
        case 'exame':
            if (usuarioLogado.permissao !== 'admin' && usuarioLogado.permissao !== 'atendente') {
                alert('Você não tem permissão para excluir exames!');
                return;
            }
            mensagemAuditoria = `Exame de ${exames[index].paciente} excluído por ${usuarioLogado.usuario}`;
            exames.splice(index, 1);
            atualizarTabelaExames();
            atualizarTabelaPrescricoes();
            break;
        case 'profissional':
            if (usuarioLogado.permissao !== 'admin') {
                alert('Você não tem permissão para excluir profissionais!');
                return;
            }
            mensagemAuditoria = `Profissional ${profissionais[index].nome} excluído por ${usuarioLogado.usuario}`;
            profissionais.splice(index, 1);
            atualizarTabelaProfissionais();
            atualizarSelecaoProfissionais();
            atualizarSelecaoEspecialidades();
            break;
        case 'suprimento':
            if (usuarioLogado.permissao !== 'admin') {
                alert('Você não tem permissão para excluir suprimentos!');
                return;
            }
            mensagemAuditoria = `Suprimento ${suprimentos[index].nome} excluído por ${usuarioLogado.usuario}`;
            suprimentos.splice(index, 1);
            atualizarTabelaSuprimentos();
            break;
        case 'consultaTele':
            if (usuarioLogado.permissao !== 'admin' && usuarioLogado.permissao !== 'atendente') {
                alert('Você não tem permissão para excluir teleconsultas!');
                return;
            }
            mensagemAuditoria = `Teleconsulta de ${consultasTele[index].paciente} excluída por ${usuarioLogado.usuario}`;
            consultasTele.splice(index, 1);
            atualizarTabelaTelemedicina();
            atualizarSelecaoConsultasTele();
            break;
        case 'prescricao':
            if (usuarioLogado.permissao !== 'admin' && usuarioLogado.permissao !== 'profissional_saude') {
                alert('Você não tem permissão para excluir prescrições!');
                return;
            }
            mensagemAuditoria = `Prescrição de ${prescricoes[index].paciente} excluída por ${usuarioLogado.usuario}`;
            prescricoes.splice(index, 1);
            atualizarTabelaPrescricoes();
            break;
        case 'usuario':
            if (usuarioLogado.permissao !== 'admin') {
                alert('Você não tem permissão para excluir usuários!');
                return;
            }
            mensagemAuditoria = `Usuário ${usuarios[index].usuario} excluído por ${usuarioLogado.usuario}`;
            usuarios.splice(index, 1);
            atualizarTabelaAcesso();
            break;
        case 'financeiro':
            if (usuarioLogado.permissao !== 'admin') {
                alert('Você não tem permissão para excluir registros financeiros!');
                return;
            }
            mensagemAuditoria = `Registro financeiro de ${historicoFinanceiro[index].data} excluído por ${usuarioLogado.usuario}`;
            historicoFinanceiro.splice(index, 1);
            atualizarTabelaFinanceiro();
            break;
    }
    salvarDados();
    registrarAuditoria(mensagemAuditoria);
    notificar('Item excluído com sucesso!');
    modal.hide(); // Fecha o modal
}

// Funções para manipular envio de formulários
function handleFormPaciente(event) {
    event.preventDefault(); // Impede o envio padrão do formulário
    adicionarPaciente();
}

function handleFormConsulta(event) {
    event.preventDefault();
    adicionarConsulta();
}

function handleFormExame(event) {
    event.preventDefault();
    adicionarExame();
}

function handleFormProfissional(event) {
    event.preventDefault();
    adicionarProfissional();
}

function handleFormSuprimento(event) {
    event.preventDefault();
    adicionarSuprimento();
}

function handleFormTelemedicina(event) {
    event.preventDefault();
    adicionarConsultaTelemedicina();
}

function handleFormPrescricao(event) {
    event.preventDefault();
    adicionarPrescricao();
}

function handleFormPrescricaoProf(event) {
    event.preventDefault();
    adicionarPrescricaoProf();
}

function handleFormLeito(event) {
    event.preventDefault();
    if (!usuarioLogado) {
        alert('Faça login para realizar esta ação!');
        return;
    }
    if (usuarioLogado.permissao !== 'admin') {
        alert('Você não tem permissão para gerenciar leitos!');
        return;
    }
    const acao = document.getElementById('acaoLeito')?.value;
    if (acao === 'adicionar' && leitosDisponiveis > 0) { // Ocupa um leito
        leitosDisponiveis--;
        leitosOcupados++;
        salvarDados();
        atualizarLeitos();
        registrarAuditoria(`Leito ocupado por ${usuarioLogado.usuario}`);
        notificar('Leito ocupado com sucesso.');
    } else if (acao === 'liberar' && leitosOcupados > 0) { // Libera um leito
        leitosDisponiveis++;
        leitosOcupados--;
        salvarDados();
        atualizarLeitos();
        registrarAuditoria(`Leito liberado por ${usuarioLogado.usuario}`);
        notificar('Leito liberado com sucesso.');
    } else {
        alert('Ação inválida ou não há leitos disponíveis!');
    }
}

function handleFormReceita(event) {
    event.preventDefault();
    if (!usuarioLogado) {
        alert('Faça login para realizar esta ação!');
        return;
    }
    if (usuarioLogado.permissao !== 'admin') {
        alert('Você não tem permissão para adicionar receita!');
        return;
    }
    const valor = parseFloat(document.getElementById('valorReceita')?.value);
    if (isNaN(valor) || valor <= 0) {
        alert('Digite um valor válido!');
        return;
    }
    receita += valor; // Adiciona ao total de receita
    historicoFinanceiro.push({ data: new Date().toLocaleDateString('pt-BR'), receita, despesa: despesas });
    salvarDados();
    atualizarFinancas();
    atualizarTabelaFinanceiro();
    registrarAuditoria(`Receita de R$ ${valor.toFixed(2)} adicionada por ${usuarioLogado.usuario}`);
    notificar('Receita adicionada com sucesso!');
}

function handleFormDespesa(event) {
    event.preventDefault();
    if (!usuarioLogado) {
        alert('Faça login para realizar esta ação!');
        return;
    }
    if (usuarioLogado.permissao !== 'admin') {
        alert('Você não tem permissão para adicionar despesa!');
        return;
    }
    const valor = parseFloat(document.getElementById('valorDespesa')?.value);
    if (isNaN(valor) || valor <= 0) {
        alert('Digite um valor válido!');
        return;
    }
    despesas += valor; // Adiciona ao total de despesas
    historicoFinanceiro.push({ data: new Date().toLocaleDateString('pt-BR'), receita, despesa: despesas });
    salvarDados();
    atualizarFinancas();
    atualizarTabelaFinanceiro();
    registrarAuditoria(`Despesa de R$ ${valor.toFixed(2)} adicionada por ${usuarioLogado.usuario}`);
    notificar('Despesa adicionada com sucesso!');
}

function handleFormAcesso(event) {
    event.preventDefault();
    adicionarUsuario();
}

// Anonimiza os CPFs dos pacientes (conformidade com LGPD)
function anonimizarCPFs() {
    if (!usuarioLogado) {
        alert('Faça login para realizar esta ação!');
        return;
    }
    if (usuarioLogado.permissao !== 'admin') {
        alert('Você não tem permissão para anonimizar CPFs!');
        return;
    }
    cpfsOriginais = pacientes.map(p => ({ cpfOriginal: p.cpf, nome: p.nome })); // Faz backup dos CPFs
    localStorage.setItem('cpfsOriginais', JSON.stringify(cpfsOriginais));
    
    pacientes = pacientes.map(p => ({
        ...p,
        cpf: p.cpf.substring(0, 3) + '***.***' + p.cpf.substring(9) // Anonimiza o CPF
    }));
    salvarDados();
    atualizarTabelaPacientes();
    registrarAuditoria('CPFs anonimizados (LGPD) por ' + usuarioLogado.usuario);
    notificar('CPFs anonimizados com sucesso!');
}

// Cancela a anonimização dos CPFs
function cancelarAnonimizacaoCPFs() {
    if (!usuarioLogado) {
        alert('Faça login para realizar esta ação!');
        return;
    }
    if (usuarioLogado.permissao !== 'admin') {
        alert('Você não tem permissão para cancelar a anonimização de CPFs!');
        return;
    }
    if (cpfsOriginais.length === 0) {
        alert('Nenhum CPF anonimizado para restaurar!');
        return;
    }
    pacientes = pacientes.map(p => {
        const original = cpfsOriginais.find(c => c.nome === p.nome);
        return original ? { ...p, cpf: original.cpfOriginal } : p; // Restaura o CPF original
    });
    salvarDados();
    atualizarTabelaPacientes();
    registrarAuditoria('Anonimização de CPFs cancelada por ' + usuarioLogado.usuario);
    notificar('Anonimização de CPFs cancelada com sucesso!');
}

// Permite ao paciente excluir seus próprios dados (LGPD)
function excluirMeusDados() {
    if (!usuarioLogado) {
        alert('Faça login para realizar esta ação!');
        return;
    }
    const cpf = prompt('Digite o CPF para excluir seus dados:');
    if (!cpf) return;
    const index = pacientes.findIndex(p => p.cpf === cpf);
    if (index === -1) {
        alert('Paciente não encontrado!');
        return;
    }
    if (usuarioLogado.permissao !== 'admin' && usuarioLogado.permissao !== 'paciente') {
        alert('Você não tem permissão para excluir dados de pacientes!');
        return;
    }
    confirmarExclusao('paciente', index);
    registrarAuditoria(`Dados do paciente com CPF ${cpf} excluídos (LGPD) por ${usuarioLogado.usuario}`);
}

// Inicializa a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    console.log('Página carregada. Verificando sessionStorage...');
    const usuarioLogadoStorage = sessionStorage.getItem('usuarioLogado');
    console.log('sessionStorage usuarioLogado:', usuarioLogadoStorage);
    
    if (usuarioLogadoStorage) { // Restaura o usuário logado da sessão
        try {
            usuarioLogado = JSON.parse(usuarioLogadoStorage);
            console.log('usuarioLogado restaurado:', usuarioLogado);
            if (domElements.usuarioLogadoSpan) {
                domElements.usuarioLogadoSpan.textContent = `${usuarioLogado.usuario} (${formatarPermissao(usuarioLogado.permissao)})`; // Atualiza interface
            }
            if (domElements.btnLogin) domElements.btnLogin.style.display = 'none';
            if (domElements.btnLogout) domElements.btnLogout.style.display = 'inline';
            if (domElements.loginUsuario) domElements.loginUsuario.style.display = 'none';
            if (domElements.loginSenha) domElements.loginSenha.style.display = 'none';
        } catch (error) {
            console.error('Erro ao parsear usuarioLogado do sessionStorage:', error);
            usuarioLogado = null;
            sessionStorage.removeItem('usuarioLogado');
        }
    } else { // Configura interface para usuário não logado
        console.log('Nenhum usuário logado encontrado no sessionStorage.');
        usuarioLogado = null;
        if (domElements.usuarioLogadoSpan) domElements.usuarioLogadoSpan.textContent = 'Nenhum';
        if (domElements.btnLogin) domElements.btnLogin.style.display = 'inline';
        if (domElements.btnLogout) domElements.btnLogout.style.display = 'none';
        if (domElements.loginUsuario) domElements.loginUsuario.style.display = 'inline';
        if (domElements.loginSenha) domElements.loginSenha.style.display = 'inline';
    }

    console.log('Estado final do usuarioLogado após inicialização:', usuarioLogado);
    atualizarTodasTabelasESelecoes(); // Atualiza toda a interface

    // Associa eventos aos formulários
    const formPaciente = document.getElementById('formPaciente');
    const formConsulta = document.getElementById('formConsulta');
    const formExame = document.getElementById('formExame');
    const formProfissional = document.getElementById('formProfissional');
    const formSuprimento = document.getElementById('formSuprimento');
    const formTelemedicina = document.getElementById('formTelemedicina');
    const formPrescricao = document.getElementById('formPrescricao');
    const formPrescricaoProf = document.getElementById('formPrescricaoProf');
    const formLeito = document.getElementById('formLeito');
    const formReceita = document.getElementById('formReceita');
    const formDespesa = document.getElementById('formDespesa');
    const formAcesso = document.getElementById('formAcesso');

    if (formPaciente) formPaciente.addEventListener('submit', handleFormPaciente);
    if (formConsulta) formConsulta.addEventListener('submit', handleFormConsulta);
    if (formExame) formExame.addEventListener('submit', handleFormExame);
    if (formProfissional) formProfissional.addEventListener('submit', handleFormProfissional);
    if (formSuprimento) formSuprimento.addEventListener('submit', handleFormSuprimento);
    if (formTelemedicina) formTelemedicina.addEventListener('submit', handleFormTelemedicina);
    if (formPrescricao) formPrescricao.addEventListener('submit', handleFormPrescricao);
    if (formPrescricaoProf) formPrescricaoProf.addEventListener('submit', handleFormPrescricaoProf);
    if (formLeito) formLeito.addEventListener('submit', handleFormLeito);
    if (formReceita) formReceita.addEventListener('submit', handleFormReceita);
    if (formDespesa) formDespesa.addEventListener('submit', handleFormDespesa);
    if (formAcesso) formAcesso.addEventListener('submit', handleFormAcesso);
});
