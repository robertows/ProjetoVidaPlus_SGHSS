// Elementos do DOM
const domElements = {
    usuarioLogadoSpan: document.getElementById('usuarioLogado'),
    btnLogin: document.getElementById('btnLogin'),
    btnLogout: document.getElementById('btnLogout'),
    loginUsuario: document.getElementById('loginUsuario'),
    loginSenha: document.getElementById('loginSenha'),
    tabelaPacientes: document.getElementById('tabelaPacientes'),
    tabelaConsultas: document.getElementById('tabelaConsultas'),
    tabelaExames: document.getElementById('tabelaExames'),
    tabelaProf: document.getElementById('tabelaProf'),
    tabelaAgenda: document.getElementById('tabelaAgenda'),
    tabelaSuprimentos: document.getElementById('tabelaSuprimentos'),
    tabelaTelemedicina: document.getElementById('tabelaTelemedicina'),
    tabelaHistoricoPrescricoes: document.getElementById('tabelaHistoricoPrescricoes'),
    tabelaAcesso: document.getElementById('tabelaAcesso'),
    tabelaFinanceiro: document.getElementById('tabelaFinanceiro'),
    logAuditoria: document.getElementById('logAuditoria'),
    selecionarPaciente: document.getElementById('selecionarPaciente'),
    selecionarProfissional: document.getElementById('selecionarProfissional'),
    especialidadeConsulta: document.getElementById('especialidadeConsulta'),
    selecionarConsultaTele: document.getElementById('selecionarConsultaTele'),
    historicoPaciente: document.getElementById('historicoPaciente'),
    leitosDisponiveisSpan: document.getElementById('leitosDisponiveis'),
    leitosOcupadosSpan: document.getElementById('leitosOcupados'),
    receitaSpan: document.getElementById('receita'),
    despesaSpan: document.getElementById('despesas'),
    saldoSpan: document.getElementById('saldo'),
    modalConfirmacao: document.getElementById('confirmacaoModal'),
    modalMensagem: document.getElementById('modalMensagem'),
};

// Dados iniciais
let pacientes = JSON.parse(localStorage.getItem('pacientes')) || [];
let consultas = JSON.parse(localStorage.getItem('consultas')) || [];
let exames = JSON.parse(localStorage.getItem('exames')) || [];
let profissionais = JSON.parse(localStorage.getItem('profissionais')) || [];
let suprimentos = JSON.parse(localStorage.getItem('suprimentos')) || [];
let consultasTele = JSON.parse(localStorage.getItem('consultasTele')) || [];
let prescricoes = JSON.parse(localStorage.getItem('prescricoes')) || [];
let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
let auditoria = JSON.parse(localStorage.getItem('auditoria')) || [];
let usuarioLogado = null;
let localStream = null;
let leitosDisponiveis = JSON.parse(localStorage.getItem('leitosDisponiveis')) || 10;
let leitosOcupados = JSON.parse(localStorage.getItem('leitosOcupados')) || 5;
let receita = JSON.parse(localStorage.getItem('receita')) || 50000;
let despesas = JSON.parse(localStorage.getItem('despesas')) || 30000;
let historicoFinanceiro = JSON.parse(localStorage.getItem('historicoFinanceiro')) || [];
let cpfsOriginais = JSON.parse(localStorage.getItem('cpfsOriginais')) || [];

// Inicializar administrador padrão, se não existir
if (!usuarios.some(u => u.usuario === 'admin')) {
    const senhaCriptografada = typeof CryptoJS !== 'undefined' ? CryptoJS.AES.encrypt('admin123', 'chave-secreta').toString() : 'admin123';
    usuarios.push({ usuario: 'admin', senha: senhaCriptografada, permissao: 'admin' });
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
}

// Função para salvar dados no localStorage
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

// Função para registrar auditoria
function registrarAuditoria(mensagem) {
    const dataHora = new Date().toLocaleString('pt-BR');
    auditoria.push(`[${dataHora}]: ${mensagem}`);
    salvarDados();
    atualizarLogAuditoria();
}

// Função para atualizar o log de auditoria
function atualizarLogAuditoria() {
    if (domElements.logAuditoria) {
        domElements.logAuditoria.innerHTML = auditoria.map(item => `<p>${item}</p>`).join('');
    }
}

// Função para notificar
function notificar(mensagem) {
    const modalMensagem = domElements.modalMensagem;
    if (modalMensagem) {
        modalMensagem.textContent = mensagem;
        modalMensagem.style.display = 'block';
        modalMensagem.style.animation = 'slideIn 0.5s ease-in-out forwards';
        setTimeout(() => {
            modalMensagem.style.animation = 'slideOut 0.5s ease-in-out forwards';
            setTimeout(() => {
                modalMensagem.style.display = 'none';
            }, 500);
        }, 3000);
    } else {
        console.log('Notificação:', mensagem);
        alert(mensagem);
    }
}

// Função para validar CPF
function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11) return false;
    let soma = 0, resto;
    for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i-1, i)) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;
    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i-1, i)) * (12 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;
    return true;
}

// Função para validar email
function validarEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Função para formatar permissões
function formatarPermissao(permissao) {
    const permissoes = {
        admin: 'Administrador',
        atendente: 'Atendente',
        profissional_saude: 'Profissional de Saúde',
        paciente: 'Paciente'
    };
    return permissoes[permissao] || permissao;
}

// Função de login
function login() {
    const usuario = domElements.loginUsuario?.value.trim();
    const senha = domElements.loginSenha?.value;
    if (!usuario || !senha) {
        alert('Preencha usuário e senha!');
        return;
    }

    const user = usuarios.find(u => u.usuario === usuario);
    if (!user) {
        alert('Usuário não encontrado!');
        return;
    }

    if (typeof CryptoJS === 'undefined') {
        alert('Biblioteca CryptoJS não está disponível!');
        return;
    }

    try {
        const decrypted = CryptoJS.AES.decrypt(user.senha, 'chave-secreta').toString(CryptoJS.enc.Utf8);
        if (decrypted === senha) {
            usuarioLogado = { usuario: user.usuario, permissao: user.permissao };
            sessionStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));
            console.log('Login bem-sucedido. usuarioLogado:', usuarioLogado);
            if (domElements.usuarioLogadoSpan) domElements.usuarioLogadoSpan.textContent = `${usuarioLogado.usuario} (${formatarPermissao(usuarioLogado.permissao)})`;
            if (domElements.btnLogin) domElements.btnLogin.style.display = 'none';
            if (domElements.btnLogout) domElements.btnLogout.style.display = 'inline';
            if (domElements.loginUsuario) domElements.loginUsuario.style.display = 'none';
            if (domElements.loginSenha) domElements.loginSenha.style.display = 'none';
            registrarAuditoria(`Login realizado por ${usuario}`);
            notificar('Login realizado com sucesso!');
            atualizarTodasTabelasESelecoes();
        } else {
            alert('Usuário ou senha incorretos!');
        }
    } catch (error) {
        console.error('Erro ao descriptografar a senha:', error);
        alert('Erro ao verificar a senha.');
    }
}

// Função de logout
function logout() {
    registrarAuditoria(`Logout realizado por ${usuarioLogado?.usuario}`);
    usuarioLogado = null;
    sessionStorage.removeItem('usuarioLogado');
    console.log('Logout realizado. usuarioLogado:', usuarioLogado);
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
    atualizarTodasTabelasESelecoes();
}

// Função para atualizar todas as tabelas e seleções
function atualizarTodasTabelasESelecoes() {
    console.log('Atualizando tabelas e seleções. usuarioLogado:', usuarioLogado);
    atualizarTabelaPacientes();
    atualizarTabelaConsultas();
    atualizarTabelaExames();
    atualizarTabelaProfissionais();
    atualizarTabelaAgenda();
    atualizarTabelaSuprimentos();
    atualizarTabelaTelemedicina();
    atualizarTabelaPrescricoes();
    atualizarTabelaAcesso();
    atualizarTabelaFinanceiro();
    atualizarLogAuditoria();
    atualizarSelecaoPacientes();
    atualizarSelecaoProfissionais();
    atualizarSelecaoEspecialidades();
    atualizarSelecaoConsultasTele();
    atualizarLeitos();
    atualizarFinancas();
}

// Funções de atualização de seleções
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
            select.innerHTML = '<option value="">Selecione um paciente</option>' +
                pacientes.map(p => `<option value="${p.cpf}">${p.nome}</option>`).join('');
        }
    });
}

function atualizarSelecaoProfissionais() {
    const selects = [
        document.getElementById('profissionalConsulta'),
        document.getElementById('profissionalTele'),
        document.getElementById('selecionarProfissional')
    ];
    selects.forEach(select => {
        if (select) {
            select.innerHTML = '<option value="">Selecione um profissional</option>' +
                profissionais.map(p => `<option value="${p.crm}">${p.nome}</option>`).join('');
        }
    });
}

function atualizarSelecaoEspecialidades() {
    if (domElements.especialidadeConsulta) {
        const especialidades = [...new Set(profissionais.map(p => p.especialidade))];
        domElements.especialidadeConsulta.innerHTML = '<option value="">Selecione uma especialidade</option>' +
            especialidades.map(e => `<option value="${e}">${e}</option>`).join('');
    }
}

function preencherEspecialidade() {
    const crm = document.getElementById('profissionalConsulta')?.value;
    const profissional = profissionais.find(p => p.crm === crm);
    if (profissional && domElements.especialidadeConsulta) {
        domElements.especialidadeConsulta.value = profissional.especialidade;
    }
}

function preencherProfissional() {
    const especialidade = domElements.especialidadeConsulta?.value;
    const selectProfissional = document.getElementById('profissionalConsulta');
    if (selectProfissional) {
        selectProfissional.innerHTML = '<option value="">Selecione um profissional</option>' +
            profissionais
                .filter(p => p.especialidade === especialidade)
                .map(p => `<option value="${p.crm}">${p.nome}</option>`).join('');
    }
}

function atualizarSelecaoConsultasTele() {
    if (domElements.selecionarConsultaTele) {
        domElements.selecionarConsultaTele.innerHTML = '<option value="">Selecione uma consulta</option>' +
            consultasTele.map((c, index) => `<option value="${index}">${c.paciente} - ${c.data} ${c.hora}</option>`).join('');
    }
    const selectPrescricao = document.getElementById('consultaTelePrescricao');
    if (selectPrescricao) {
        selectPrescricao.innerHTML = '<option value="">Selecione uma consulta</option>' +
            consultasTele.map((c, index) => `<option value="${index}">${c.paciente} - ${c.data} ${c.hora}</option>`).join('');
    }
}

// Funções de atualização de tabelas
function atualizarTabelaPacientes() {
    if (domElements.tabelaPacientes) {
        if (!usuarioLogado) {
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
            </tr>`).join('');
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
                ${corpoTabela || '<tr><td colspan="6">Nenhum paciente cadastrado</td></tr>'}
            </tbody>`;
    }
}

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
        if (crm) {
            const profissional = profissionais.find(p => p.crm === crm);
            if (profissional) {
                consultasFiltradas = consultas.filter(c => c.profissional === profissional.nome);
                teleconsultasFiltradas = consultasTele.filter(c => c.profissional === profissional.nome);
            }
        } else {
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
        // Filtrar prescrições (online e presenciais)
        const prescricoesFiltradas = prescricoes.filter(p => p.paciente === paciente.nome);
        // Filtrar exames
        const examesFiltrados = exames.filter(e => e.paciente === paciente.nome);
        // Combinar prescrições e exames
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

function atualizarLeitos() {
    if (domElements.leitosDisponiveisSpan && domElements.leitosOcupadosSpan) {
        if (!usuarioLogado) {
            domElements.leitosDisponiveisSpan.textContent = 'Faça login';
            domElements.leitosOcupadosSpan.textContent = 'Faça login';
            return;
        }
        domElements.leitosDisponiveisSpan.textContent = leitosDisponiveis;
        domElements.leitosOcupadosSpan.textContent = leitosOcupados;
    }
}

function atualizarFinancas() {
    if (domElements.receitaSpan && domElements.despesaSpan && domElements.saldoSpan) {
        if (!usuarioLogado) {
            domElements.receitaSpan.textContent = 'Faça login';
            domElements.despesaSpan.textContent = 'Faça login';
            domElements.saldoSpan.textContent = 'Faça login';
            return;
        }
        domElements.receitaSpan.textContent = receita.toFixed(2);
        domElements.despesaSpan.textContent = despesas.toFixed(2);
        domElements.saldoSpan.textContent = (receita - despesas).toFixed(2);
    }
}

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

// Funções de histórico
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
        const pacienteConsultas = consultas.filter(c => c.cpf === cpf);
        const pacienteExames = exames.filter(e => e.cpf === cpf);
        const pacienteTeleconsultas = consultasTele.filter(c => c.cpf === cpf);
        domElements.historicoPaciente.innerHTML = `
            <h3>Consultas Presenciais</h3>
            ${pacienteConsultas.map(c => `<p>${c.data} ${c.hora} - ${c.profissional} (${c.especialidade})</p>`).join('') || '<p>Nenhuma consulta</p>'}
            <h3>Exames</h3>
            ${pacienteExames.map(e => `<p>${e.data} - ${e.tipo}: ${e.resultado || 'Pendente'}</p>`).join('') || '<p>Nenhum exame</p>'}
            <h3>Teleconsultas</h3>
            ${pacienteTeleconsultas.map(c => `<p>${c.data} ${c.hora} - ${c.profissional}</p>`).join('') || '<p>Nenhuma teleconsulta</p>'}`;
    }
}

// Funções de telemedicina
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
    videoArea.style.display = 'flex';
}

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
    consulta.status = 'Em andamento';
    salvarDados();
    atualizarTabelaTelemedicina();

    // Mostrar o botão "Encerrar Videochamada" e ocultar o botão "Iniciar Videochamada"
    document.getElementById('startVideoCall').style.display = 'none';
    document.getElementById('stopVideoCall').style.display = 'inline-block';

    // Acessar a câmera e exibir o vídeo local
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        const localVideo = document.getElementById('localVideo');
        localVideo.srcObject = localStream;

        // Simular o vídeo do paciente
        const remoteVideoContainer = document.getElementById('remoteVideoContainer');
        const remoteVideo = document.getElementById('remoteVideo');
        const remoteVideoPlaceholder = document.getElementById('remoteVideoPlaceholder');
        remoteVideo.style.display = 'none';
        remoteVideoPlaceholder.style.display = 'block';
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
    consulta.status = 'Concluída';
    salvarDados();
    atualizarTabelaTelemedicina();

    // Ocultar o botão "Encerrar Videochamada" e mostrar o botão "Iniciar Videochamada"
    document.getElementById('startVideoCall').style.display = 'inline-block';
    document.getElementById('stopVideoCall').style.display = 'none';

    // Parar o stream da câmera
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
    }

    const localVideo = document.getElementById('localVideo');
    localVideo.srcObject = null;

    // Limpar a simulação do vídeo do paciente
    const remoteVideoContainer = document.getElementById('remoteVideoContainer');
    const remoteVideo = document.getElementById('remoteVideo');
    const remoteVideoPlaceholder = document.getElementById('remoteVideoPlaceholder');
    remoteVideo.style.display = 'none';
    remoteVideoPlaceholder.style.display = 'block';
    remoteVideoPlaceholder.textContent = 'Vídeo do Paciente (Simulado)';

    registrarAuditoria(`Videochamada encerrada com ${consulta.paciente} por ${usuarioLogado.usuario}`);
    notificar('Videochamada encerrada com sucesso!');
}

// Funções de adição
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

    // Verifica se todos os campos estão preenchidos
    if (!nome || !cpf || !dataNascimento || !telefone || !endereco) {
        alert('Preencha todos os campos!');
        return;
    }

    // Remove caracteres não numéricos do CPF para validação
    const cpfLimpo = cpf.replace(/[^\d]+/g, '');

    // Verifica se o CPF tem 11 dígitos
    if (cpfLimpo.length !== 11) {
        alert('CPF inválido! Deve conter 11 dígitos.');
        return;
    }

    // Valida o CPF
    if (!validarCPF(cpfLimpo)) {
        alert('CPF inválido!');
        return;
    }

    // Verifica se o CPF já está cadastrado
    if (pacientes.some(p => p.cpf === cpf)) {
        alert('CPF já cadastrado!');
        return;
    }

    // Exibir mensagem de CPF válido apenas após todas as validações
    notificar('CPF válido.');

    // Adiciona o paciente com o CPF no formato original (com pontos e traços)
    pacientes.push({ nome, cpf, dataNascimento, telefone, endereco });
    salvarDados();
    atualizarTabelaPacientes();
    atualizarSelecaoPacientes();
    registrarAuditoria(`Paciente ${nome} adicionado por ${usuarioLogado.usuario}`);
    notificar('Paciente cadastrado com sucesso.');

    // Limpa o formulário após o cadastro
    document.getElementById('nome').value = '';
    document.getElementById('cpf').value = '';
    document.getElementById('dataNascimento').value = '';
    document.getElementById('telefone').value = '';
    document.getElementById('endereco').value = '';
}

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
    despesas += quantidade * precoUnitario;
    historicoFinanceiro.push({ data: new Date().toLocaleDateString('pt-BR'), receita, despesa: despesas });
    salvarDados();
    atualizarTabelaSuprimentos();
    atualizarFinancas();
    atualizarTabelaFinanceiro();
    registrarAuditoria(`Suprimento ${nome} adicionado por ${usuarioLogado.usuario}`);
    notificar('Suprimento adicionado com sucesso.');
}

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
    const senhaCriptografada = CryptoJS.AES.encrypt(senha, 'chave-secreta').toString();
    usuarios.push({ usuario, senha: senhaCriptografada, permissao });
    salvarDados();
    atualizarTabelaAcesso();
    registrarAuditoria(`Usuário ${usuario} adicionado com permissão ${permissao} por ${usuarioLogado.usuario}`);
    notificar('Usuário adicionado com sucesso!');
}

// Funções de exclusão
function confirmarExclusao(tipo, index) {
    if (!usuarioLogado) {
        alert('Faça login para realizar esta ação!');
        return;
    }
    if (domElements.modalConfirmacao) {
        const modal = new bootstrap.Modal(domElements.modalConfirmacao);
        modal.show();
        document.getElementById('confirmarExclusao').onclick = () => executarExclusao(tipo, index, modal);
    }
}

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
            pacientes.splice(index, 1);
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
            atualizarTabelaPrescricoes(); // Atualizar o histórico clínico
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
    modal.hide();
}

// Funções de manipulação de formulários
function handleFormPaciente(event) {
    event.preventDefault();
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
    if (acao === 'adicionar' && leitosDisponiveis > 0) {
        leitosDisponiveis--;
        leitosOcupados++;
        salvarDados();
        atualizarLeitos();
        registrarAuditoria(`Leito ocupado por ${usuarioLogado.usuario}`);
        notificar('Leito ocupado com sucesso.');
    } else if (acao === 'liberar' && leitosOcupados > 0) {
        leitosDisponiveis++;
        leitosOcupados--;
        salvarDados();
        atualizarLeitos();
        registrarAuditoria(`Leito liberado por ${usuarioLogado.usuario}`);
        notificar('Leito liberado com sucesso.');
    } else {
        alert('Ação inválida ou não há leitos disponíveis!');
        return;
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
    receita += valor;
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
    despesas += valor;
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

// Funções LGPD
function anonimizarCPFs() {
    if (!usuarioLogado) {
        alert('Faça login para realizar esta ação!');
        return;
    }
    if (usuarioLogado.permissao !== 'admin') {
        alert('Você não tem permissão para anonimizar CPFs!');
        return;
    }
    // Salvar os CPFs originais antes de anonimizar
    cpfsOriginais = pacientes.map(p => ({ cpfOriginal: p.cpf, nome: p.nome }));
    localStorage.setItem('cpfsOriginais', JSON.stringify(cpfsOriginais));
    
    pacientes = pacientes.map(p => ({
        ...p,
        cpf: p.cpf.substring(0, 3) + '***.***' + p.cpf.substring(9)
    }));
    salvarDados();
    atualizarTabelaPacientes();
    registrarAuditoria('CPFs anonimizados (LGPD) por ' + usuarioLogado.usuario);
    notificar('CPFs anonimizados com sucesso!');
}

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
        return original ? { ...p, cpf: original.cpfOriginal } : p;
    });
    salvarDados();
    atualizarTabelaPacientes();
    registrarAuditoria('Anonimização de CPFs cancelada por ' + usuarioLogado.usuario);
    notificar('Anonimização de CPFs cancelada com sucesso!');
}

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

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    console.log('Página carregada. Verificando sessionStorage...');
    const usuarioLogadoStorage = sessionStorage.getItem('usuarioLogado');
    console.log('sessionStorage usuarioLogado:', usuarioLogadoStorage);
    
    if (usuarioLogadoStorage) {
        try {
            usuarioLogado = JSON.parse(usuarioLogadoStorage);
            console.log('usuarioLogado restaurado:', usuarioLogado);
            if (domElements.usuarioLogadoSpan) {
                domElements.usuarioLogadoSpan.textContent = `${usuarioLogado.usuario} (${formatarPermissao(usuarioLogado.permissao)})`;
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
    } else {
        console.log('Nenhum usuário logado encontrado no sessionStorage.');
        usuarioLogado = null;
        if (domElements.usuarioLogadoSpan) domElements.usuarioLogadoSpan.textContent = 'Nenhum';
        if (domElements.btnLogin) domElements.btnLogin.style.display = 'inline';
        if (domElements.btnLogout) domElements.btnLogout.style.display = 'none';
        if (domElements.loginUsuario) domElements.loginUsuario.style.display = 'inline';
        if (domElements.loginSenha) domElements.loginSenha.style.display = 'inline';
    }

    console.log('Estado final do usuarioLogado após inicialização:', usuarioLogado);
    atualizarTodasTabelasESelecoes();

    // Associar eventos aos formulários
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
