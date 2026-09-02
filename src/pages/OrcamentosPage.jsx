import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Send, 
  ShoppingCart, 
  ArrowRightCircle, 
  Printer, 
  Building2, 
  AlertCircle, 
  Clock, 
  CheckCheck, 
  MessageSquare, 
  Mail, 
  Share2, 
  Edit3, 
  Search,
  MapPin,
  User,
  Calendar,
  FileText,
  Truck,
  History,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Info,
  DollarSign,
  PackageCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../services/storage';
import { Modal } from '../components/Modal';

export const OrcamentosPage = ({ showToast }) => {
  const { empresa, user } = useAuth();

  // Modals state
  const [isNovoModal, setIsNovoModal] = useState(false);
  const [editingOrcamentoId, setEditingOrcamentoId] = useState(null);
  const [activeFormTab, setActiveFormTab] = useState('cabecalho'); // 'cabecalho' | 'itens' | 'fechamento'

  const [detalhesModal, setDetalhesModal] = useState(null);
  const [pdfModal, setPdfModal] = useState(null);
  const [envioModal, setEnvioModal] = useState(null); // { orcamento, canal: 'WhatsApp' | 'Email' }
  const [rejeicaoModal, setRejeicaoModal] = useState(null); // { orcamentoId, motivo: '' }
  const [historicoClienteModal, setHistoricoClienteModal] = useState(null); // cliente

  // Quick Inline Creation Modals
  const [quickClienteModal, setQuickClienteModal] = useState(false);
  const [quickClienteData, setQuickClienteData] = useState({
    nome: '',
    fantasia: '',
    cpfCnpj: '',
    telefone: '',
    email: '',
    cep: '',
    endereco: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: 'BA'
  });

  const [quickFornecedorModal, setQuickFornecedorModal] = useState(false);
  const [quickFornecedorData, setQuickFornecedorData] = useState({
    nome: '',
    fantasia: '',
    cpfCnpj: '',
    telefone: '',
    email: '',
    cep: '',
    endereco: '',
    bairro: '',
    cidade: '',
    estado: 'BA'
  });

  const [quickVendedorModal, setQuickVendedorModal] = useState(false);
  const [quickVendedorData, setQuickVendedorData] = useState({
    nome: '',
    email: '',
    telefone: '',
    tipo: 'Vendedor'
  });

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');

  // Form State for Create/Edit
  const [formFornecedorId, setFormFornecedorId] = useState('');
  const [formClienteId, setFormClienteId] = useState('');
  const [formEnderecoEntrega, setFormEnderecoEntrega] = useState('');
  const [isOutroEndereco, setIsOutroEndereco] = useState(false);
  const [formComprador, setFormComprador] = useState('');
  const [formVendedor, setFormVendedor] = useState('');
  const [formDataEmissao, setFormDataEmissao] = useState('');
  const [formDataDespacho, setFormDataDespacho] = useState('');
  const [formDataValidade, setFormDataValidade] = useState('');
  const [formOrdemCompra, setFormOrdemCompra] = useState(''); // xPed
  const [formCondicaoPagamento, setFormCondicaoPagamento] = useState('30 dias');
  const [formTipoFrete, setFormTipoFrete] = useState('CIF');
  const [formObservacoes, setFormObservacoes] = useState('');
  const [formItens, setFormItens] = useState([]); // [{ id, produtoId, quantidade, precoUnitario }]

  // Temporary item input state
  const [itemProdutoId, setItemProdutoId] = useState('');
  const [itemQuantidade, setItemQuantidade] = useState(1);
  const [itemPrecoUnitario, setItemPrecoUnitario] = useState(0);

  if (!empresa) return null;

  const orcamentos = storage.getOrcamentos(empresa.id);
  const clientes = storage.getClientes(empresa.id);
  const fornecedores = storage.getFornecedores(empresa.id);
  const todosProdutos = storage.getProdutos(empresa.id);
  const condicoesPagamento = storage.getCondicoesPagamento ? storage.getCondicoesPagamento(empresa.id) : [];
  const usuarios = storage.getUsuarios ? storage.getUsuarios(empresa.id) : [];
  
  const listaVendedores = Array.from(new Set([
    user?.nome,
    ...usuarios.map(u => u.nome),
    ...orcamentos.map(o => o.vendedorResponsavel)
  ].filter(Boolean)));

  const performCEPLookup = async (rawCEP, targetSetter) => {
    const clean = (rawCEP || '').replace(/\D/g, '');
    if (clean.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data = await res.json();
      if (!data.erro) {
        targetSetter(prev => ({
          ...prev,
          endereco: data.logradouro || prev.endereco || '',
          bairro: data.bairro || prev.bairro || '',
          cidade: data.localidade || prev.cidade || '',
          estado: data.uf || prev.estado || ''
        }));
      }
    } catch (e) {
      console.warn('Erro ao consultar CEP:', e);
    }
  };

  const handleSaveQuickCliente = (e) => {
    e.preventDefault();
    if (!quickClienteData.nome) return;
    try {
      const newCli = {
        ...quickClienteData,
        tipo: 'Clientes',
        empresaId: empresa.id
      };
      const saved = storage.saveCliente(newCli, empresa.id, user.nome);
      setFormClienteId(saved.id);
      
      const parts = [
        saved.endereco,
        saved.numero,
        saved.bairro,
        saved.cidade ? `${saved.cidade} - ${saved.estado || 'BA'}` : '',
        saved.cep ? `CEP: ${saved.cep}` : ''
      ].filter(Boolean);
      setFormEnderecoEntrega(parts.join(', '));
      if (!formComprador) setFormComprador(saved.nome);

      setQuickClienteModal(false);
      setQuickClienteData({ nome: '', fantasia: '', cpfCnpj: '', telefone: '', email: '', cep: '', endereco: '', numero: '', bairro: '', cidade: '', estado: 'BA' });
      showToast('success', `Cliente "${saved.nome}" cadastrado e vinculado ao orçamento!`);
    } catch (err) {
      showToast('error', 'Erro ao cadastrar cliente.');
    }
  };

  const handleSaveQuickFornecedor = (e) => {
    e.preventDefault();
    if (!quickFornecedorData.nome) return;
    try {
      const newForn = {
        ...quickFornecedorData,
        tipo: 'Fornecedores',
        empresaId: empresa.id
      };
      const saved = storage.saveFornecedor(newForn, empresa.id, user.nome);
      setFormFornecedorId(saved.id);
      setQuickFornecedorModal(false);
      setQuickFornecedorData({ nome: '', fantasia: '', cpfCnpj: '', telefone: '', email: '', cep: '', endereco: '', bairro: '', cidade: '', estado: 'BA' });
      showToast('success', `Fornecedor "${saved.nome}" cadastrado e vinculado ao orçamento!`);
    } catch (err) {
      showToast('error', 'Erro ao cadastrar fornecedor.');
    }
  };

  const handleSaveQuickVendedor = (e) => {
    e.preventDefault();
    if (!quickVendedorData.nome) return;
    try {
      const novoUsr = {
        empresaId: empresa.id,
        nome: quickVendedorData.nome,
        email: quickVendedorData.email || `${quickVendedorData.nome.toLowerCase().replace(/\s+/g, '')}@vendas.com`,
        tipo: quickVendedorData.tipo || 'Vendedor',
        ativo: true
      };
      if (storage.saveUsuario) {
        storage.saveUsuario(novoUsr, empresa.id, user.nome);
      }
      setFormVendedor(quickVendedorData.nome);
      setQuickVendedorModal(false);
      setQuickVendedorData({ nome: '', email: '', telefone: '', tipo: 'Vendedor' });
      showToast('success', `Vendedor "${quickVendedorData.nome}" cadastrado e selecionado!`);
    } catch (err) {
      showToast('error', 'Erro ao cadastrar vendedor.');
    }
  };

  // Filter available products by the selected supplier
  const produtosDoFornecedor = formFornecedorId
    ? todosProdutos.filter(p => p.fornecedorId === formFornecedorId)
    : [];

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return '-';
    try {
      const parts = isoStr.split('T')[0].split('-');
      if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
      return isoStr;
    } catch {
      return isoStr;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Rascunho':
        return <span className="badge badge-dark"><Clock size={12} /> Rascunho</span>;
      case 'Enviado':
        return <span className="badge badge-info"><Send size={12} /> Enviado</span>;
      case 'Aprovado':
        return <span className="badge badge-accent"><CheckCircle2 size={12} /> Aprovado</span>;
      case 'Convertido':
        return <span className="badge badge-success"><CheckCheck size={12} /> Convertido em Venda</span>;
      case 'Rejeitado':
        return <span className="badge badge-danger"><XCircle size={12} /> Rejeitado</span>;
      case 'Expirado':
        return <span className="badge badge-warning"><AlertCircle size={12} /> Expirado</span>;
      default:
        return <span className="badge badge-dark">{status}</span>;
    }
  };

  // Keyboard shortcut listener for F8 / F9 navigation in form
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isNovoModal) return;
      if (e.key === 'F8') {
        e.preventDefault();
        if (activeFormTab === 'fechamento') setActiveFormTab('itens');
        else if (activeFormTab === 'itens') setActiveFormTab('cabecalho');
      } else if (e.key === 'F9') {
        e.preventDefault();
        if (activeFormTab === 'cabecalho') {
          if (!formFornecedorId || !formClienteId) {
            showToast('warning', 'Selecione o Fornecedor e o Cliente para avançar.');
            return;
          }
          setActiveFormTab('itens');
        } else if (activeFormTab === 'itens') {
          if (formItens.length === 0) {
            showToast('warning', 'Adicione pelo menos 1 item para avançar.');
            return;
          }
          setActiveFormTab('fechamento');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isNovoModal, activeFormTab, formFornecedorId, formClienteId, formItens]);

  // --- OPEN CREATE/EDIT MODAL ---
  const handleOpenNovoOrcamento = (orcamentoParaEditar = null) => {
    setActiveFormTab('cabecalho');
    if (orcamentoParaEditar) {
      setEditingOrcamentoId(orcamentoParaEditar.id);
      setFormFornecedorId(orcamentoParaEditar.fornecedorId || '');
      setFormClienteId(orcamentoParaEditar.clienteId || '');
      setFormEnderecoEntrega(orcamentoParaEditar.enderecoEntrega || '');
      setIsOutroEndereco(Boolean(orcamentoParaEditar.enderecoEntrega));
      setFormComprador(orcamentoParaEditar.comprador || '');
      setFormVendedor(orcamentoParaEditar.vendedorResponsavel || user.nome);
      setFormDataEmissao(orcamentoParaEditar.dataEmissao || orcamentoParaEditar.dataCriacao?.split('T')[0] || new Date().toISOString().split('T')[0]);
      setFormDataDespacho(orcamentoParaEditar.dataDespacho || '');
      setFormDataValidade(orcamentoParaEditar.dataValidade || '');
      setFormOrdemCompra(orcamentoParaEditar.ordemCompra || '');
      setFormCondicaoPagamento(orcamentoParaEditar.condicaoPagamento || '30 dias');
      setFormTipoFrete(orcamentoParaEditar.tipoFrete || 'CIF');
      setFormObservacoes(orcamentoParaEditar.observacoes || '');

      const itensExistentes = storage.getItensOrcamento(orcamentoParaEditar.id);
      setFormItens(itensExistentes);
    } else {
      setEditingOrcamentoId(null);
      setFormFornecedorId(fornecedores.length === 1 ? fornecedores[0].id : '');
      setFormClienteId('');
      setFormEnderecoEntrega('');
      setIsOutroEndereco(false);
      setFormComprador('');
      setFormVendedor(user.nome);
      
      const hoje = new Date().toISOString().split('T')[0];
      setFormDataEmissao(hoje);
      
      const despacho = new Date();
      despacho.setDate(despacho.getDate() + 3);
      setFormDataDespacho(despacho.toISOString().split('T')[0]);

      const validade = new Date();
      validade.setDate(validade.getDate() + 15);
      setFormDataValidade(validade.toISOString().split('T')[0]);
      
      setFormOrdemCompra('');
      setFormCondicaoPagamento('30 dias');
      setFormTipoFrete('CIF');
      setFormObservacoes('');
      setFormItens([]);
    }

    setItemProdutoId('');
    setItemQuantidade(1);
    setItemPrecoUnitario(0);
    setIsNovoModal(true);
  };

  // When changing supplier in form
  const handleFornecedorChange = (e) => {
    const newFornecedorId = e.target.value;
    if (formItens.length > 0 && newFornecedorId !== formFornecedorId) {
      if (window.confirm('Ao alterar o fornecedor, os produtos atuais serão removidos pois pertencem a outro fornecedor. Deseja continuar?')) {
        setFormItens([]);
      } else {
        return;
      }
    }
    setFormFornecedorId(newFornecedorId);
    setItemProdutoId('');
    setItemQuantidade(1);
    setItemPrecoUnitario(0);
  };

  // When selecting a client, auto-fill address and buyer
  const handleClienteChange = (e) => {
    const cliId = e.target.value;
    setFormClienteId(cliId);
    if (cliId) {
      const cli = clientes.find(c => c.id === cliId);
      if (cli) {
        // Auto fill address
        const fullAddr = [
          cli.endereco,
          cli.numero ? `nº ${cli.numero}` : '',
          cli.complemento,
          cli.bairro,
          cli.cidade,
          cli.cep ? `CEP: ${cli.cep}` : ''
        ].filter(Boolean).join(', ');

        setFormEnderecoEntrega(fullAddr || 'Mesmo endereço cadastral do cliente');
        setFormComprador(cli.comprador || cli.contato || cli.nome);
      }
    } else {
      setFormEnderecoEntrega('');
      setFormComprador('');
    }
  };

  // When selecting a product, prefill its unit price
  const handleSelectProduto = (e) => {
    const prodId = e.target.value;
    setItemProdutoId(prodId);
    if (prodId) {
      const prod = todosProdutos.find(p => p.id === prodId);
      if (prod) {
        setItemPrecoUnitario(prod.preco || 0);
      }
    } else {
      setItemPrecoUnitario(0);
    }
  };

  // Add Item to Quote Form
  const handleAddItemToForm = () => {
    if (!formFornecedorId) {
      showToast('warning', 'Selecione um fornecedor antes de adicionar produtos.');
      return;
    }
    if (!itemProdutoId) {
      showToast('warning', 'Selecione um produto.');
      return;
    }
    const prod = todosProdutos.find(p => p.id === itemProdutoId);
    if (!prod) return;

    const qtd = parseFloat(itemQuantidade) || 0;
    if (qtd <= 0) {
      showToast('warning', 'A quantidade deve ser maior que zero.');
      return;
    }

    const preco = parseFloat(itemPrecoUnitario) || 0;
    if (preco < 0) {
      showToast('warning', 'O preço unitário não pode ser negativo.');
      return;
    }

    // Check if already in items list
    const existingIdx = formItens.findIndex(i => i.produtoId === itemProdutoId);
    if (existingIdx >= 0) {
      const updated = [...formItens];
      updated[existingIdx].quantidade += qtd;
      updated[existingIdx].precoUnitario = preco;
      updated[existingIdx].subtotal = updated[existingIdx].quantidade * preco;
      setFormItens(updated);
    } else {
      setFormItens([...formItens, {
        id: 'it-orc-' + Math.random().toString(36).substring(2, 9),
        produtoId: itemProdutoId,
        produtoNome: prod.nome,
        codigo: prod.codigo || '',
        unidade: prod.unidade || 'UN',
        quantidade: qtd,
        precoUnitario: preco,
        desconto: 0,
        ipi: prod.ipi || 0,
        st: prod.st || 0,
        subtotal: qtd * preco
      }]);
    }

    setItemProdutoId('');
    setItemQuantidade(1);
    setItemPrecoUnitario(0);
    showToast('success', `${prod.nome} adicionado ao orçamento.`);
  };

  const handleRemoveItemFromForm = (idx) => {
    setFormItens(formItens.filter((_, i) => i !== idx));
  };

  // Calculate form total
  const formTotalCalculated = formItens.reduce((acc, item) => {
    return acc + ((parseFloat(item.quantidade) || 0) * (parseFloat(item.precoUnitario) || 0));
  }, 0);

  // Submit Save Quote (Draft)
  const handleSaveOrcamento = (e) => {
    if (e) e.preventDefault();
    if (!formFornecedorId) {
      showToast('error', 'Selecione um fornecedor para o orçamento.');
      setActiveFormTab('cabecalho');
      return;
    }
    if (!formClienteId) {
      showToast('error', 'Selecione um cliente para o orçamento.');
      setActiveFormTab('cabecalho');
      return;
    }
    if (formItens.length === 0) {
      showToast('error', 'Adicione pelo menos 1 produto ao orçamento.');
      setActiveFormTab('itens');
      return;
    }

    try {
      const payload = {
        id: editingOrcamentoId,
        clienteId: formClienteId,
        fornecedorId: formFornecedorId,
        enderecoEntrega: formEnderecoEntrega,
        comprador: formComprador,
        dataEmissao: formDataEmissao,
        dataDespacho: formDataDespacho,
        dataValidade: formDataValidade,
        ordemCompra: formOrdemCompra,
        condicaoPagamento: formCondicaoPagamento,
        tipoFrete: formTipoFrete,
        observacoes: formObservacoes,
        vendedorResponsavel: formVendedor || user.nome
      };

      storage.saveOrcamento(payload, formItens, empresa.id, user.nome);
      showToast('success', editingOrcamentoId ? 'Orçamento atualizado com sucesso!' : 'Orçamento salvo como Rascunho com sucesso!');
      setIsNovoModal(false);
      setEditingOrcamentoId(null);
    } catch (err) {
      showToast('error', err.message || 'Erro ao salvar orçamento.');
    }
  };

  // --- SEND QUOTE (WhatsApp / Email) ---
  const handleOpenEnvioModal = (orcamento) => {
    setEnvioModal({
      orcamento,
      canal: 'WhatsApp'
    });
  };

  const generateQuoteTextSummary = (orcamentoDetalhado) => {
    const cli = orcamentoDetalhado.cliente;
    const forn = orcamentoDetalhado.fornecedor;
    const itens = orcamentoDetalhado.itens || [];

    let text = `📄 *PROPOSTA / ORÇAMENTO #${orcamentoDetalhado.numero}*\n`;
    text += `🏢 *Empresa Emissora:* ${empresa.nome}\n`;
    if (forn) text += `🏭 *Fornecedor:* ${forn.nome} ${forn.fantasia ? `(${forn.fantasia})` : ''} - ${forn.cpfCnpj || ''}\n`;
    text += `👤 *Cliente:* ${cli ? (cli.nome + (cli.fantasia ? ` (${cli.fantasia})` : '')) : 'Cliente'}\n`;
    if (orcamentoDetalhado.comprador) text += `🤝 *Comprador / Contato:* ${orcamentoDetalhado.comprador}\n`;
    if (orcamentoDetalhado.ordemCompra) text += `📑 *Ordem de Compra (xPed):* ${orcamentoDetalhado.ordemCompra}\n`;
    text += `📅 *Emissão:* ${formatDate(orcamentoDetalhado.dataEmissao || orcamentoDetalhado.dataCriacao)}\n`;
    if (orcamentoDetalhado.dataDespacho) text += `🚚 *Previsão de Despacho:* ${formatDate(orcamentoDetalhado.dataDespacho)}\n`;
    text += `⏳ *Validade da Proposta:* ${formatDate(orcamentoDetalhado.dataValidade)}\n\n`;
    text += `📦 *ITENS DA PROPOSTA:*\n`;

    itens.forEach((item, idx) => {
      text += `${idx + 1}. ${item.produtoNome} (${item.quantidade} ${item.unidade || 'UN'} x ${formatCurrency(item.precoUnitario)}) = ${formatCurrency(item.subtotal)}\n`;
    });

    text += `\n💰 *VALOR TOTAL:* ${formatCurrency(orcamentoDetalhado.total)}\n`;

    if (orcamentoDetalhado.enderecoEntrega) {
      text += `📍 *Endereço de Entrega:* ${orcamentoDetalhado.enderecoEntrega}\n`;
    }

    if (orcamentoDetalhado.condicaoPagamento || orcamentoDetalhado.observacoes) {
      text += `\n📝 *Condições / Observações:* ${[orcamentoDetalhado.condicaoPagamento, orcamentoDetalhado.observacoes].filter(Boolean).join(' - ')}\n`;
    }

    text += `\nEstamos à disposição para formalizar seu pedido!\n`;
    text += `👤 *Vendedor Responsável:* ${orcamentoDetalhado.vendedorResponsavel || user.nome}`;

    return text;
  };

  const handleConfirmSend = () => {
    if (!envioModal || !envioModal.orcamento) return;
    const orc = storage.getOrcamentoDetalhado(envioModal.orcamento.id, empresa.id);
    if (!orc) return;

    const summaryText = generateQuoteTextSummary(orc);
    const canal = envioModal.canal;

    if (canal === 'WhatsApp') {
      const rawPhone = orc.cliente?.telefone || orc.clienteTelefone || '';
      const cleanPhone = rawPhone.replace(/\D/g, '');
      const encodedMsg = encodeURIComponent(summaryText);
      const waUrl = cleanPhone 
        ? `https://wa.me/55${cleanPhone}?text=${encodedMsg}` 
        : `https://wa.me/?text=${encodedMsg}`;

      window.open(waUrl, '_blank');
    } else {
      const email = orc.cliente?.email || orc.clienteEmail || '';
      const subject = encodeURIComponent(`Orçamento #${orc.numero} - ${empresa.nome}`);
      const body = encodeURIComponent(summaryText);
      const mailUrl = `mailto:${email}?subject=${subject}&body=${body}`;

      window.open(mailUrl, '_blank');
    }

    try {
      storage.enviarOrcamento(orc.id, canal, empresa.id, user.nome);
      showToast('success', `Orçamento #${orc.numero} marcado como ENVIADO via ${canal}!`);
      setEnvioModal(null);
      if (detalhesModal && detalhesModal.id === orc.id) {
        setDetalhesModal(storage.getOrcamentoDetalhado(orc.id, empresa.id));
      }
    } catch (err) {
      showToast('error', err.message || 'Erro ao registrar envio.');
    }
  };

  // --- APPROVE / REJECT ---
  const handleAprovarOrcamento = (orcamentoId) => {
    try {
      storage.aprovarOrcamento(orcamentoId, empresa.id, user.nome);
      showToast('success', 'Orçamento APROVADO com sucesso!');
      if (detalhesModal && detalhesModal.id === orcamentoId) {
        setDetalhesModal(storage.getOrcamentoDetalhado(orcamentoId, empresa.id));
      }
    } catch (err) {
      showToast('error', err.message || 'Erro ao aprovar orçamento.');
    }
  };

  const handleConfirmRejeicao = () => {
    if (!rejeicaoModal) return;
    try {
      storage.rejeitarOrcamento(rejeicaoModal.orcamentoId, rejeicaoModal.motivo, empresa.id, user.nome);
      showToast('warning', 'Orçamento marcado como REJEITADO.');
      const id = rejeicaoModal.orcamentoId;
      setRejeicaoModal(null);
      if (detalhesModal && detalhesModal.id === id) {
        setDetalhesModal(storage.getOrcamentoDetalhado(id, empresa.id));
      }
    } catch (err) {
      showToast('error', err.message || 'Erro ao rejeitar orçamento.');
    }
  };

  // --- CONVERT TO SALE (PDV) ---
  const handleConverterEmVenda = (orcamentoId) => {
    if (!window.confirm('Deseja converter este orçamento em um Pedido de Venda oficial? Isso dará baixa automática no estoque e gerará a conta a receber no financeiro.')) {
      return;
    }

    try {
      const novaVenda = storage.converterOrcamentoEmVenda(orcamentoId, empresa.id, user.nome);
      showToast('success', `Sucesso! Orçamento convertido no Pedido de Venda #${novaVenda.id}.`);
      if (detalhesModal && detalhesModal.id === orcamentoId) {
        setDetalhesModal(storage.getOrcamentoDetalhado(orcamentoId, empresa.id));
      }
    } catch (err) {
      showToast('error', err.message || 'Erro ao converter orçamento em venda.');
    }
  };

  // --- DELETE DRAFT ---
  const handleDeleteOrcamento = (orcamentoId, numero) => {
    if (!window.confirm(`Deseja realmente excluir o orçamento #${numero}?`)) return;
    try {
      storage.deleteOrcamento(orcamentoId, empresa.id, user.nome);
      showToast('success', `Orçamento #${numero} excluído.`);
      if (detalhesModal && detalhesModal.id === orcamentoId) {
        setDetalhesModal(null);
      }
    } catch (err) {
      showToast('error', err.message || 'Erro ao excluir orçamento.');
    }
  };

  // Selected client entity for current form
  const clienteSelecionadoNoForm = clientes.find(c => c.id === formClienteId);

  // --- FILTERED DATA ---
  const filteredOrcamentos = orcamentos.filter(o => {
    const matchSearch = searchTerm === '' || 
      o.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.clienteNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.fornecedorNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.ordemCompra && o.ordemCompra.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchStatus = statusFilter === 'TODOS' || o.status === statusFilter;

    return matchSearch && matchStatus;
  });

  // KPI Calculations
  const totalGeral = orcamentos.length;
  const countRascunho = orcamentos.filter(o => o.status === 'Rascunho').length;
  const countEnviado = orcamentos.filter(o => o.status === 'Enviado').length;
  const countAprovado = orcamentos.filter(o => o.status === 'Aprovado').length;
  const countConvertido = orcamentos.filter(o => o.status === 'Convertido').length;

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>Gestão de Orçamentos Comerciais</h1>
          <p>Elabore propostas completas por fornecedor, controle de xPed, envio ágil e conversão em vendas</p>
        </div>
        <button className="btn btn-accent" onClick={() => handleOpenNovoOrcamento()}>
          <Plus size={18} /> Novo Orçamento
        </button>
      </div>

      {/* Stat Grid */}
      <div className="stat-grid">
        <div className="stat-card">
          <div>
            <div className="stat-label">Total de Orçamentos</div>
            <div className="stat-val">{totalGeral}</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(10, 37, 64, 0.08)', color: 'var(--primary-dark)' }}>
            <FileSpreadsheet size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Rascunhos</div>
            <div className="stat-val">{countRascunho}</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(100, 116, 139, 0.1)', color: '#64748B' }}>
            <Clock size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Aguardando Envio/Resposta</div>
            <div className="stat-val">{countEnviado}</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(37, 99, 235, 0.1)', color: '#2563EB' }}>
            <Send size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Aprovados</div>
            <div className="stat-val" style={{ color: '#008764' }}>{countAprovado}</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(0, 200, 150, 0.12)', color: '#00C896' }}>
            <CheckCircle2 size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Convertidos em Venda</div>
            <div className="stat-val" style={{ color: '#7C3AED' }}>{countConvertido}</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(124, 58, 237, 0.1)', color: '#7C3AED' }}>
            <CheckCheck size={24} />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card">
        {/* Filters and Search Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              className={`btn btn-sm ${statusFilter === 'TODOS' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setStatusFilter('TODOS')}
            >
              Todos ({totalGeral})
            </button>
            <button
              className={`btn btn-sm ${statusFilter === 'Rascunho' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setStatusFilter('Rascunho')}
            >
              Rascunhos ({countRascunho})
            </button>
            <button
              className={`btn btn-sm ${statusFilter === 'Enviado' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setStatusFilter('Enviado')}
            >
              Enviados ({countEnviado})
            </button>
            <button
              className={`btn btn-sm ${statusFilter === 'Aprovado' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setStatusFilter('Aprovado')}
            >
              Aprovados ({countAprovado})
            </button>
            <button
              className={`btn btn-sm ${statusFilter === 'Convertido' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setStatusFilter('Convertido')}
            >
              Convertidos ({countConvertido})
            </button>
            <button
              className={`btn btn-sm ${statusFilter === 'Rejeitado' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setStatusFilter('Rejeitado')}
            >
              Rejeitados
            </button>
          </div>

          <div style={{ position: 'relative', minWidth: '280px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Buscar por nº, cliente, fornecedor, xPed..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          </div>
        </div>

        {/* Quotes Table */}
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Número</th>
                <th>Cliente & Comprador</th>
                <th>Fornecedor Representado</th>
                <th>Ordem Compra (xPed)</th>
                <th>Total</th>
                <th>Status</th>
                <th>Emissão / Validade</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrcamentos.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', color: '#64748B', padding: '3.5rem 1rem' }}>
                    <FileSpreadsheet size={44} style={{ opacity: 0.35, marginBottom: '0.75rem', display: 'inline-block' }} />
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary-dark)' }}>Nenhum orçamento localizado</div>
                    <div style={{ fontSize: '0.8125rem', marginTop: '4px' }}>Crie uma nova proposta comercial clicando no botão "Novo Orçamento".</div>
                  </td>
                </tr>
              ) : (
                filteredOrcamentos.map(orc => (
                  <tr key={orc.id}>
                    <td className="font-mono" style={{ fontWeight: 800, color: 'var(--primary-dark)' }}>
                      {orc.numero}
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>{orc.clienteNome}</div>
                      {orc.comprador && (
                        <div style={{ fontSize: '0.75rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          <User size={12} style={{ color: '#008764' }} /> {orc.comprador}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                        <Building2 size={15} style={{ color: '#008764', flexShrink: 0 }} />
                        <span style={{ fontWeight: 600 }}>{orc.fornecedorNome}</span>
                      </div>
                    </td>
                    <td>
                      {orc.ordemCompra ? (
                        <span className="badge badge-dark font-mono" style={{ fontSize: '0.75rem' }}>
                          {orc.ordemCompra}
                        </span>
                      ) : (
                        <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>-</span>
                      )}
                    </td>
                    <td className="font-mono" style={{ fontWeight: 800, color: '#008764' }}>
                      {formatCurrency(orc.total)}
                    </td>
                    <td>
                      {getStatusBadge(orc.status)}
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: '#64748B' }}>
                      <div>{formatDate(orc.dataEmissao || orc.dataCriacao)}</div>
                      <div style={{ fontSize: '0.75rem', color: '#D97706', fontWeight: 600 }}>Val: {formatDate(orc.dataValidade)}</div>
                    </td>
                    <td className="text-right">
                      <div style={{ display: 'inline-flex', gap: '4px' }}>
                        {/* View Details */}
                        <button
                          className="btn-icon"
                          title="Visualizar Detalhes"
                          onClick={() => setDetalhesModal(storage.getOrcamentoDetalhado(orc.id, empresa.id))}
                        >
                          <Eye size={16} />
                        </button>

                        {/* View / Print PDF */}
                        <button
                          className="btn-icon"
                          title="Visualizar Proposta em PDF / Imprimir"
                          onClick={() => setPdfModal(storage.getOrcamentoDetalhado(orc.id, empresa.id))}
                          style={{ color: '#DC2626' }}
                        >
                          <FileText size={16} />
                        </button>

                        {/* Send Action (if Rascunho or Enviado) */}
                        {(orc.status === 'Rascunho' || orc.status === 'Enviado') && (
                          <button
                            className="btn-icon"
                            title="Enviar Proposta (WhatsApp/Email)"
                            onClick={() => handleOpenEnvioModal(orc)}
                            style={{ color: '#2563EB' }}
                          >
                            <Send size={16} />
                          </button>
                        )}

                        {/* Approve Action (if Enviado) */}
                        {orc.status === 'Enviado' && (
                          <button
                            className="btn-icon"
                            title="Marcar como Aprovado"
                            onClick={() => handleAprovarOrcamento(orc.id)}
                            style={{ color: '#059669' }}
                          >
                            <CheckCircle2 size={16} />
                          </button>
                        )}

                        {/* Convert to Sale Action (if Aprovado) */}
                        {orc.status === 'Aprovado' && (
                          <button
                            className="btn btn-accent btn-sm"
                            title="Converter em Pedido de Venda"
                            onClick={() => handleConverterEmVenda(orc.id)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <ArrowRightCircle size={14} /> Converter
                          </button>
                        )}

                        {/* Edit Action (only if Rascunho) */}
                        {orc.status === 'Rascunho' && (
                          <button
                            className="btn-icon"
                            title="Editar Orçamento"
                            onClick={() => handleOpenNovoOrcamento(orc)}
                          >
                            <Edit3 size={16} />
                          </button>
                        )}

                        {/* Delete Action (only if not Convertido) */}
                        {orc.status !== 'Convertido' && (
                          <button
                            className="btn-icon"
                            title="Excluir Orçamento"
                            onClick={() => handleDeleteOrcamento(orc.id, orc.numero)}
                            style={{ color: '#DC2626' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: NOVO / EDITAR ORÇAMENTO COM DESIGN ULTRA-LIMPO E INTUITIVO         */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isNovoModal}
        title={editingOrcamentoId ? 'Editar Orçamento Comercial' : 'Novo Orçamento Comercial'}
        onClose={() => { setIsNovoModal(false); setEditingOrcamentoId(null); }}
        maxWidth="820px"
      >
        <div>
          {/* Stepper Navigation Pills */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.875rem' }}>
            <button
              type="button"
              className={`btn btn-sm ${activeFormTab === 'cabecalho' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveFormTab('cabecalho')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
            >
              <span>1. Cabeçalho & Parceiros</span>
              <ChevronRight size={14} />
            </button>

            <button
              type="button"
              className={`btn btn-sm ${activeFormTab === 'itens' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => {
                if (!formFornecedorId) {
                  showToast('warning', 'Selecione o Fornecedor primeiro.');
                  return;
                }
                setActiveFormTab('itens');
              }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
            >
              <span>2. Produtos & Itens ({formItens.length})</span>
              <ChevronRight size={14} />
            </button>

            <button
              type="button"
              className={`btn btn-sm ${activeFormTab === 'fechamento' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveFormTab('fechamento')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
            >
              <span>3. Fechamento ({formatCurrency(formTotalCalculated)})</span>
            </button>
          </div>

          <form onSubmit={handleSaveOrcamento}>
            {/* ========================================================================= */}
            {/* ETAPA 1: CABEÇALHO, FORNECEDOR, CLIENTE, DATAS E XPED                     */}
            {/* ========================================================================= */}
            {activeFormTab === 'cabecalho' && (
              <div>
                {/* Fornecedor Section Card */}
                <div style={{ backgroundColor: '#F8FAFC', padding: '1.25rem', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '1.25rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <label className="form-label" style={{ marginBottom: 0, color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Building2 size={16} style={{ color: '#008764' }} />
                        Fornecedor Representado *
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => setQuickFornecedorModal(true)}
                          style={{
                            padding: '2px 8px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: '#008764',
                            borderColor: '#008764'
                          }}
                        >
                          <Plus size={12} /> Cadastrar Fornecedor
                        </button>
                        <span className="badge badge-accent" style={{ fontSize: '0.7rem' }}>
                          Catálogo Restrito
                        </span>
                      </div>
                    </div>

                    <select
                      className="form-select"
                      value={formFornecedorId}
                      onChange={handleFornecedorChange}
                      required
                      style={{ fontWeight: 600, borderColor: !formFornecedorId ? '#F59E0B' : '#CBD5E1', backgroundColor: '#FFFFFF' }}
                    >
                      <option value="">Selecione o Fornecedor...</option>
                      {fornecedores.map(forn => (
                        <option key={forn.id} value={forn.id}>
                          {forn.nome} {forn.fantasia ? `(${forn.fantasia})` : ''} - {forn.cpfCnpj || 'S/ CNPJ'} - {forn.cidade || 'Brasil'}
                        </option>
                      ))}
                    </select>
                    <span style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px', display: 'block' }}>
                      * Os produtos disponíveis para inserção serão filtrados exclusivamente por este fornecedor.
                    </span>
                  </div>
                </div>

                {/* Cliente & Entregas Card */}
                <div style={{ backgroundColor: '#F8FAFC', padding: '1.25rem', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '1.25rem' }}>
                  {/* Cliente Selector with Quick Action Buttons */}
                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <label className="form-label" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <User size={16} style={{ color: '#2563EB' }} />
                        Cliente *
                      </label>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => setQuickClienteModal(true)}
                        style={{
                          padding: '2px 8px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: '#2563EB',
                          borderColor: '#2563EB'
                        }}
                      >
                        <Plus size={12} /> Cadastrar Cliente
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <select
                        className="form-select"
                        value={formClienteId}
                        onChange={handleClienteChange}
                        required
                        style={{ flex: 1 }}
                      >
                        <option value="">Selecione o Cliente...</option>
                        {clientes.map(cli => (
                          <option key={cli.id} value={cli.id}>
                            {cli.nome} {cli.fantasia ? `(${cli.fantasia})` : ''} - {cli.cpfCnpj || 'S/ CPF/CNPJ'} - {cli.cidade || ''}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        title="Ver Histórico de Compras do Cliente"
                        onClick={() => {
                          if (!clienteSelecionadoNoForm) {
                            showToast('warning', 'Selecione um cliente primeiro.');
                            return;
                          }
                          setHistoricoClienteModal(clienteSelecionadoNoForm);
                        }}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <History size={14} /> Histórico
                      </button>

                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        title="Imprimir Ficha Cadastral"
                        onClick={() => {
                          if (!clienteSelecionadoNoForm) {
                            showToast('warning', 'Selecione um cliente primeiro.');
                            return;
                          }
                          window.print();
                        }}
                      >
                        <Printer size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Endereço de Entrega */}
                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <label className="form-label" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={14} style={{ color: '#008764' }} />
                        Endereço de Entrega:
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsOutroEndereco(!isOutroEndereco)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#2563EB',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Send size={12} />
                        {isOutroEndereco ? 'Usar Endereço do Cadastro' : 'Outro Endereço'}
                      </button>
                    </div>
                    <input
                      type="text"
                      className="form-input"
                      value={formEnderecoEntrega}
                      onChange={(e) => setFormEnderecoEntrega(e.target.value)}
                      placeholder="Ex: Av. Paulista, 1000 - Bela Vista, São Paulo - SP"
                    />
                  </div>

                  {/* Comprador / Contato */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Comprador / Contato do Cliente:</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        className="form-input"
                        list="contatosSugestoes"
                        value={formComprador}
                        onChange={(e) => setFormComprador(e.target.value)}
                        placeholder="Nome do comprador ou selecione um contato"
                        style={{ flex: 1 }}
                      />
                      <datalist id="contatosSugestoes">
                        {clienteSelecionadoNoForm?.nome && <option value={clienteSelecionadoNoForm.nome} />}
                        {(clienteSelecionadoNoForm?.contatos || []).map((c, idx) => (
                          <option key={idx} value={typeof c === 'string' ? c : (c.nome || c.contato || '')} />
                        ))}
                      </datalist>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => {
                          if (clienteSelecionadoNoForm) {
                            setFormComprador(clienteSelecionadoNoForm.nome);
                          }
                        }}
                        style={{ whiteSpace: 'nowrap' }}
                      >
                        <User size={14} /> Puxar Nome
                      </button>
                    </div>
                  </div>
                </div>

                {/* Vendedor, Datas & xPed */}
                <div style={{ backgroundColor: '#F8FAFC', padding: '1.25rem', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '1.25rem' }}>
                  <div className="form-row">
                    <div className="form-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <label className="form-label" style={{ marginBottom: 0 }}>Vendedor / Representante:</label>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => setQuickVendedorModal(true)}
                          style={{
                            padding: '2px 8px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: '#008764',
                            borderColor: '#008764'
                          }}
                        >
                          <Plus size={12} /> Novo Vendedor
                        </button>
                      </div>
                      <input
                        type="text"
                        className="form-input"
                        list="vendedoresSugestoes"
                        value={formVendedor}
                        onChange={(e) => setFormVendedor(e.target.value)}
                        placeholder="Selecione na lista ou digite..."
                      />
                      <datalist id="vendedoresSugestoes">
                        {listaVendedores.map((v, idx) => (
                          <option key={idx} value={v} />
                        ))}
                      </datalist>
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        Ordem Compra: <span style={{ color: '#64748B', fontWeight: 400 }}>(xPed)</span>
                      </label>
                      <input
                        type="text"
                        className="form-input font-mono"
                        value={formOrdemCompra}
                        onChange={(e) => setFormOrdemCompra(e.target.value)}
                        placeholder="Ex: OC-99882, Pedido Cliente #123"
                      />
                    </div>
                  </div>

                  <div className="form-row" style={{ marginTop: '0.5rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Data de Emissão:</label>
                      <input
                        type="date"
                        className="form-input"
                        value={formDataEmissao}
                        onChange={(e) => setFormDataEmissao(e.target.value)}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Data de Despacho (Previsão):</label>
                      <input
                        type="date"
                        className="form-input"
                        value={formDataDespacho}
                        onChange={(e) => setFormDataDespacho(e.target.value)}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ color: '#D97706' }}>Data de Validade:</label>
                      <input
                        type="date"
                        className="form-input"
                        value={formDataValidade}
                        onChange={(e) => setFormDataValidade(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => { setIsNovoModal(false); setEditingOrcamentoId(null); }}
                  >
                    Voltar [F8]
                  </button>

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      if (!formFornecedorId) {
                        showToast('warning', 'Selecione o Fornecedor primeiro.');
                        return;
                      }
                      if (!formClienteId) {
                        showToast('warning', 'Selecione o Cliente primeiro.');
                        return;
                      }
                      setActiveFormTab('itens');
                    }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
                  >
                    Avançar para Itens [F9]
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* ETAPA 2: PRODUTOS & ITENS DO FORNECEDOR                                   */}
            {/* ========================================================================= */}
            {activeFormTab === 'itens' && (
              <div>
                <div style={{ backgroundColor: '#F8FAFC', padding: '1.25rem', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                      <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--primary-dark)', margin: 0 }}>
                        Catálogo do Fornecedor: {fornecedores.find(f => f.id === formFornecedorId)?.nome || 'Fornecedor'}
                      </h4>
                      <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                        Apenas os produtos deste fornecedor estão liberados para inserção
                      </span>
                    </div>

                    <span className="badge badge-accent">
                      {produtosDoFornecedor.length} produto(s) disponíveis
                    </span>
                  </div>

                  {produtosDoFornecedor.length === 0 ? (
                    <div style={{ padding: '1.5rem', backgroundColor: '#FEF2F2', border: '1px dashed #F87171', borderRadius: '8px', color: '#DC2626', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <AlertCircle size={24} style={{ flexShrink: 0 }} />
                      <div>
                        <strong style={{ fontSize: '0.9rem' }}>Nenhum produto cadastrado para este fornecedor!</strong>
                        <div style={{ fontSize: '0.8rem', marginTop: '2px', color: '#64748B' }}>
                          Vá até o módulo <strong>Produtos & Estoque</strong> e vincule produtos a este fornecedor.
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {/* Product Selector and Inputs */}
                      <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr auto', gap: '0.75rem', alignItems: 'flex-end', marginBottom: '1.25rem' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label">Produto</label>
                          <select
                            className="form-select"
                            value={itemProdutoId}
                            onChange={handleSelectProduto}
                          >
                            <option value="">-- Selecione o Produto --</option>
                            {produtosDoFornecedor.map(prod => (
                              <option key={prod.id} value={prod.id}>
                                {prod.codigo} - {prod.nome} ({formatCurrency(prod.preco)}) [Est: {prod.estoque}]
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label">Qtd.</label>
                          <input
                            type="number"
                            min="1"
                            step="1"
                            className="form-input"
                            value={itemQuantidade}
                            onChange={(e) => setItemQuantidade(Math.max(1, parseInt(e.target.value) || 1))}
                          />
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label">Preço Unit. (R$)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="form-input"
                            value={itemPrecoUnitario}
                            onChange={(e) => setItemPrecoUnitario(parseFloat(e.target.value) || 0)}
                          />
                        </div>

                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={handleAddItemToForm}
                          style={{ height: '42px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Plus size={16} /> Adicionar
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Items List Table */}
                  <div style={{ marginTop: '1.25rem' }}>
                    <h5 style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                      Itens do Orçamento ({formItens.length})
                    </h5>

                    {formItens.length > 0 ? (
                      <div className="table-responsive" style={{ border: '1px solid #E2E8F0', borderRadius: '6px' }}>
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Item / Código</th>
                              <th style={{ textAlign: 'center' }}>Qtd.</th>
                              <th style={{ textAlign: 'right' }}>Preço Unit.</th>
                              <th style={{ textAlign: 'right' }}>Subtotal</th>
                              <th style={{ width: '40px' }}></th>
                            </tr>
                          </thead>
                          <tbody>
                            {formItens.map((item, idx) => {
                              const prod = todosProdutos.find(p => p.id === item.produtoId);
                              const sub = (parseFloat(item.quantidade) || 0) * (parseFloat(item.precoUnitario) || 0);
                              return (
                                <tr key={idx}>
                                  <td>
                                    <div style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>{prod ? prod.nome : 'Produto'}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{prod ? prod.codigo : ''} - {prod ? prod.unidade : 'UN'}</div>
                                  </td>
                                  <td style={{ textAlign: 'center', fontWeight: 700 }}>
                                    {item.quantidade}
                                  </td>
                                  <td style={{ textAlign: 'right', color: '#64748B' }}>
                                    {formatCurrency(item.precoUnitario)}
                                  </td>
                                  <td className="font-mono" style={{ textAlign: 'right', fontWeight: 800, color: '#008764' }}>
                                    {formatCurrency(sub)}
                                  </td>
                                  <td style={{ textAlign: 'center' }}>
                                    <button
                                      type="button"
                                      className="btn-icon"
                                      onClick={() => handleRemoveItemFromForm(idx)}
                                      style={{ color: '#DC2626' }}
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: '#FFFFFF', borderRadius: '6px', border: '1px solid #E2E8F0', color: '#64748B', fontSize: '0.875rem' }}>
                        Nenhum produto adicionado ao orçamento ainda.
                      </div>
                    )}

                    {/* Subtotal Banner */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', padding: '1rem', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748B' }}>
                        Total de Itens: <strong style={{ color: 'var(--primary-dark)' }}>{formItens.length}</strong>
                      </span>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.8125rem', color: '#64748B', marginRight: '8px' }}>Total Estimado:</span>
                        <span className="font-mono" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#008764' }}>
                          {formatCurrency(formTotalCalculated)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setActiveFormTab('cabecalho')}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <ArrowLeft size={16} /> Voltar [F8]
                  </button>

                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={formItens.length === 0}
                    onClick={() => setActiveFormTab('fechamento')}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
                  >
                    Avançar para Fechamento [F9]
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* ETAPA 3: CONDIÇÕES COMERCIAIS, OBSERVAÇÕES & FECHAMENTO                   */}
            {/* ========================================================================= */}
            {activeFormTab === 'fechamento' && (
              <div>
                <div style={{ backgroundColor: '#F8FAFC', padding: '1.25rem', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '1.25rem' }}>
                  <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '1rem' }}>
                    Condições Comerciais & Pagamento
                  </h4>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Condição de Pagamento</label>
                      <select
                        className="form-select"
                        value={formCondicaoPagamento}
                        onChange={(e) => setFormCondicaoPagamento(e.target.value)}
                      >
                        {condicoesPagamento.length === 0 ? (
                          <>
                            <option value="À vista (PIX / Transferência)">À vista (PIX / Transferência)</option>
                            <option value="15 dias">15 dias</option>
                            <option value="28 dias">28 dias</option>
                            <option value="30 dias">30 dias</option>
                            <option value="30/60 dias">30/60 dias</option>
                            <option value="30/60/90 dias">30/60/90 dias</option>
                            <option value="Boleto Bancário 30DD">Boleto Bancário 30DD</option>
                            <option value="Cartão de Crédito">Cartão de Crédito</option>
                          </>
                        ) : (
                          condicoesPagamento.map(cp => (
                            <option key={cp.id} value={cp.descricao}>
                              {cp.descricao} {cp.percentualCustoFinanceiro > 0 ? `(+${cp.percentualCustoFinanceiro}% juros)` : ''}
                            </option>
                          ))
                        )}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Tipo de Frete</label>
                      <select
                        className="form-select"
                        value={formTipoFrete}
                        onChange={(e) => setFormTipoFrete(e.target.value)}
                      >
                        <option value="CIF">CIF (Frete por conta do Remetente)</option>
                        <option value="FOB">FOB (Frete por conta do Destinatário)</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Observações / Instruções da Proposta</label>
                    <textarea
                      className="form-textarea"
                      rows="3"
                      value={formObservacoes}
                      onChange={(e) => setFormObservacoes(e.target.value)}
                      placeholder="Instruções de faturamento, prazos de garantia ou condições comerciais específicas..."
                    />
                  </div>
                </div>

                {/* Recap Box */}
                <div style={{ backgroundColor: '#F0FDF4', border: '1px solid rgba(0, 200, 150, 0.3)', padding: '1.25rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Cliente</span>
                      <strong style={{ color: 'var(--primary-dark)', fontSize: '0.9rem' }}>{clienteSelecionadoNoForm?.nome || 'Não selecionado'}</strong>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Fornecedor</span>
                      <strong style={{ color: 'var(--primary-dark)', fontSize: '0.9rem' }}>{fornecedores.find(f => f.id === formFornecedorId)?.nome || '-'}</strong>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Ordem Compra (xPed)</span>
                      <strong className="font-mono" style={{ color: 'var(--primary-dark)', fontSize: '0.9rem' }}>{formOrdemCompra || '-'}</strong>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Total do Orçamento</span>
                      <span className="font-mono" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#008764' }}>{formatCurrency(formTotalCalculated)}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setActiveFormTab('itens')}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <ArrowLeft size={16} /> Voltar para Itens [F8]
                  </button>

                  <button
                    type="submit"
                    className="btn btn-accent"
                    disabled={formItens.length === 0}
                    style={{ padding: '0.75rem 1.75rem', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem' }}
                  >
                    <CheckCircle2 size={18} />
                    {editingOrcamentoId ? 'Salvar Alterações' : 'Concluir & Salvar Rascunho'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL: HISTÓRICO RÁPIDO DO CLIENTE                                        */}
      {/* ========================================================================= */}
      <Modal
        isOpen={Boolean(historicoClienteModal)}
        title={`Histórico do Cliente: ${historicoClienteModal?.nome || ''}`}
        onClose={() => setHistoricoClienteModal(null)}
        maxWidth="650px"
      >
        {historicoClienteModal && (
          <div>
            <div style={{ padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div><strong>CNPJ/CPF:</strong> {historicoClienteModal.cpfCnpj || 'S/ Doc'}</div>
                <div><strong>Telefone:</strong> {historicoClienteModal.telefone || 'S/ Tel'}</div>
                <div><strong>Email:</strong> {historicoClienteModal.email || 'S/ Email'}</div>
                <div><strong>Cidade:</strong> {historicoClienteModal.cidade || 'N/D'}</div>
              </div>
            </div>

            <h5 style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              Orçamentos Anteriores
            </h5>

            {orcamentos.filter(o => o.clienteId === historicoClienteModal.id).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: '#64748B', fontSize: '0.875rem' }}>
                Nenhum orçamento anterior registrado para este cliente.
              </div>
            ) : (
              <div className="table-responsive" style={{ border: '1px solid #E2E8F0', borderRadius: '6px' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Número</th>
                      <th>Data</th>
                      <th>Status</th>
                      <th className="text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orcamentos.filter(o => o.clienteId === historicoClienteModal.id).map(o => (
                      <tr key={o.id}>
                        <td className="font-mono" style={{ fontWeight: 700 }}>{o.numero}</td>
                        <td style={{ color: '#64748B' }}>{formatDate(o.dataCriacao)}</td>
                        <td>{getStatusBadge(o.status)}</td>
                        <td className="font-mono text-right" style={{ fontWeight: 800, color: '#008764' }}>{formatCurrency(o.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="modal-footer" style={{ marginTop: '1.25rem', padding: 0, background: 'none', border: 'none' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setHistoricoClienteModal(null)}
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL: ENVIAR PROPOSTA (WhatsApp / E-mail)                                */}
      {/* ========================================================================= */}
      <Modal
        isOpen={Boolean(envioModal)}
        title={`Enviar Orçamento #${envioModal?.orcamento?.numero || ''}`}
        onClose={() => setEnvioModal(null)}
        maxWidth="560px"
      >
        <div>
          <p style={{ color: '#64748B', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            Escolha o canal de envio para o cliente <strong>{envioModal?.orcamento?.clienteNome}</strong>. O sistema gerará a mensagem formatada e abrirá diretamente o canal correspondente.
          </p>

          {/* Canal Selection */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div
              onClick={() => setEnvioModal({ ...envioModal, canal: 'WhatsApp' })}
              style={{
                padding: '1.25rem',
                borderRadius: '8px',
                cursor: 'pointer',
                border: envioModal?.canal === 'WhatsApp' ? '2px solid #00C896' : '1px solid #E2E8F0',
                backgroundColor: envioModal?.canal === 'WhatsApp' ? '#F0FDF4' : '#F8FAFC',
                textAlign: 'center',
                transition: 'all 0.2s'
              }}
            >
              <MessageSquare size={32} style={{ color: '#008764', marginBottom: '8px', display: 'inline-block' }} />
              <div style={{ fontWeight: 800, color: 'var(--primary-dark)' }}>WhatsApp</div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>
                {envioModal?.orcamento?.clienteTelefone || 'Abrirá WhatsApp com texto'}
              </div>
            </div>

            <div
              onClick={() => setEnvioModal({ ...envioModal, canal: 'Email' })}
              style={{
                padding: '1.25rem',
                borderRadius: '8px',
                cursor: 'pointer',
                border: envioModal?.canal === 'Email' ? '2px solid #2563EB' : '1px solid #E2E8F0',
                backgroundColor: envioModal?.canal === 'Email' ? '#EFF6FF' : '#F8FAFC',
                textAlign: 'center',
                transition: 'all 0.2s'
              }}
            >
              <Mail size={32} style={{ color: '#2563EB', marginBottom: '8px', display: 'inline-block' }} />
              <div style={{ fontWeight: 800, color: 'var(--primary-dark)' }}>E-mail</div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>
                {envioModal?.orcamento?.clienteEmail || 'Abrirá cliente de e-mail'}
              </div>
            </div>
          </div>

          {/* Preview of the formatted text */}
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">Prévia do Resumo da Proposta</label>
            <div style={{
              backgroundColor: '#F8FAFC',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              fontSize: '0.8125rem',
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              maxHeight: '160px',
              overflowY: 'auto',
              color: 'var(--primary-dark)'
            }}>
              {envioModal?.orcamento && generateQuoteTextSummary(storage.getOrcamentoDetalhado(envioModal.orcamento.id, empresa.id) || envioModal.orcamento)}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="modal-footer" style={{ padding: 0, background: 'none', border: 'none' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setEnvioModal(null)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleConfirmSend}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Share2 size={16} /> Abrir {envioModal?.canal} & Marcar como Enviado
            </button>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL: DETALHES & AÇÕES DO ORÇAMENTO                                     */}
      {/* ========================================================================= */}
      <Modal
        isOpen={Boolean(detalhesModal)}
        title={`Detalhes do Orçamento #${detalhesModal?.numero || ''}`}
        onClose={() => setDetalhesModal(null)}
        maxWidth="800px"
      >
        {detalhesModal && (
          <div>
            {/* Header info bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.725rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Status Atual</span>
                {getStatusBadge(detalhesModal.status)}
              </div>

              <div>
                <span style={{ fontSize: '0.725rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Emissão</span>
                <span style={{ fontWeight: 700, color: 'var(--primary-dark)', fontSize: '0.875rem' }}>{formatDate(detalhesModal.dataEmissao || detalhesModal.dataCriacao)}</span>
              </div>

              <div>
                <span style={{ fontSize: '0.725rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Validade</span>
                <span style={{ fontWeight: 700, color: '#D97706', fontSize: '0.875rem' }}>{formatDate(detalhesModal.dataValidade)}</span>
              </div>

              {detalhesModal.dataDespacho && (
                <div>
                  <span style={{ fontSize: '0.725rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Despacho Previsto</span>
                  <span style={{ fontWeight: 700, color: '#2563EB', fontSize: '0.875rem' }}>{formatDate(detalhesModal.dataDespacho)}</span>
                </div>
              )}

              {detalhesModal.dataEnvio && (
                <div>
                  <span style={{ fontSize: '0.725rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Enviado em</span>
                  <span style={{ fontWeight: 700, color: '#2563EB', fontSize: '0.875rem' }}>
                    {formatDate(detalhesModal.dataEnvio)} ({detalhesModal.formaEnvio || 'WhatsApp'})
                  </span>
                </div>
              )}

              {detalhesModal.dataAprovacao && (
                <div>
                  <span style={{ fontSize: '0.725rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Aprovado em</span>
                  <span style={{ fontWeight: 700, color: '#059669', fontSize: '0.875rem' }}>{formatDate(detalhesModal.dataAprovacao)}</span>
                </div>
              )}
            </div>

            {/* Client, Supplier & Order Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#008764', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Dados do Cliente
                </div>
                <div style={{ fontWeight: 700, color: 'var(--primary-dark)', fontSize: '0.95rem' }}>
                  {detalhesModal.cliente?.nome || detalhesModal.clienteNome}
                </div>
                {detalhesModal.cliente?.cpfCnpj && (
                  <div style={{ fontSize: '0.8125rem', color: '#64748B', marginTop: '2px' }}>CNPJ/CPF: {detalhesModal.cliente.cpfCnpj}</div>
                )}
                {detalhesModal.comprador && (
                  <div style={{ fontSize: '0.8125rem', color: '#2563EB', marginTop: '2px' }}>Comprador: <strong>{detalhesModal.comprador}</strong></div>
                )}
                {detalhesModal.enderecoEntrega && (
                  <div style={{ fontSize: '0.8125rem', color: '#64748B', marginTop: '4px' }}>
                    <MapPin size={12} style={{ display: 'inline', marginRight: '4px', color: '#008764' }} />
                    Entrega: {detalhesModal.enderecoEntrega}
                  </div>
                )}
              </div>

              <div style={{ padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#008764', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Fornecedor & Dados Comerciais
                </div>
                <div style={{ fontWeight: 700, color: 'var(--primary-dark)', fontSize: '0.95rem' }}>
                  {detalhesModal.fornecedor?.nome || detalhesModal.fornecedorNome}
                </div>
                {detalhesModal.ordemCompra && (
                  <div style={{ fontSize: '0.8125rem', color: 'var(--primary-dark)', marginTop: '4px' }}>
                    Ordem de Compra (xPed): <strong className="font-mono">{detalhesModal.ordemCompra}</strong>
                  </div>
                )}
                <div style={{ fontSize: '0.8125rem', color: '#64748B', marginTop: '4px' }}>
                  Vendedor Resp.: <strong>{detalhesModal.vendedorResponsavel || 'Representante'}</strong>
                </div>
                {detalhesModal.condicaoPagamento && (
                  <div style={{ fontSize: '0.8125rem', color: '#64748B', marginTop: '4px' }}>
                    Pagamento: <strong>{detalhesModal.condicaoPagamento}</strong>
                  </div>
                )}
              </div>
            </div>

            {/* Items Table */}
            <div style={{ marginBottom: '1.25rem' }}>
              <h5 style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Itens da Proposta
              </h5>
              <div className="table-responsive" style={{ border: '1px solid #E2E8F0', borderRadius: '6px' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Produto</th>
                      <th style={{ textAlign: 'center' }}>Qtd.</th>
                      <th style={{ textAlign: 'right' }}>Preço Unit.</th>
                      <th style={{ textAlign: 'right' }}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(detalhesModal.itens || []).map((item, idx) => (
                      <tr key={idx}>
                        <td className="font-mono" style={{ color: '#64748B' }}>{item.codigo || '-'}</td>
                        <td style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>{item.produtoNome}</td>
                        <td style={{ textAlign: 'center' }}>{item.quantidade} {item.unidade || 'UN'}</td>
                        <td style={{ textAlign: 'right', color: '#64748B' }}>{formatCurrency(item.precoUnitario)}</td>
                        <td className="font-mono" style={{ textAlign: 'right', fontWeight: 800, color: '#008764' }}>{formatCurrency(item.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Observações & Total */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ flex: 1, minWidth: '240px' }}>
                {detalhesModal.observacoes && (
                  <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>Observações</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--primary-dark)', whiteSpace: 'pre-wrap' }}>{detalhesModal.observacoes}</div>
                  </div>
                )}

                {detalhesModal.vendaId && (
                  <div style={{ marginTop: '0.75rem', padding: '0.75rem', backgroundColor: '#F5F3FF', border: '1px solid #DDD6FE', borderRadius: '6px', color: '#7C3AED', fontSize: '0.8125rem' }}>
                    <CheckCheck size={16} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }} />
                    Convertido no <strong>Pedido de Venda #{detalhesModal.vendaId}</strong> (somente leitura).
                  </div>
                )}
              </div>

              <div style={{ padding: '1rem 1.5rem', backgroundColor: '#F0FDF4', borderRadius: '8px', border: '1px solid rgba(0, 200, 150, 0.3)', textAlign: 'right', minWidth: '220px' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Total do Orçamento</span>
                <span className="font-mono" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#008764' }}>{formatCurrency(detalhesModal.total)}</span>
              </div>
            </div>

            {/* Contextual Action Buttons in Details */}
            <div className="modal-footer" style={{ padding: 0, background: 'none', borderTop: '1px solid #E2E8F0', paddingTop: '1rem' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => window.print()}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Printer size={16} /> Imprimir / PDF
              </button>

              {/* Rascunho actions */}
              {detalhesModal.status === 'Rascunho' && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    const orc = detalhesModal;
                    setDetalhesModal(null);
                    handleOpenEnvioModal(orc);
                  }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Send size={16} /> Enviar Proposta
                </button>
              )}

              {/* Enviado actions (Approve / Reject / Resend) */}
              {detalhesModal.status === 'Enviado' && (
                <>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => setRejeicaoModal({ orcamentoId: detalhesModal.id, motivo: '' })}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <XCircle size={16} /> Rejeitar
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => {
                      const orc = detalhesModal;
                      setDetalhesModal(null);
                      handleOpenEnvioModal(orc);
                    }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Send size={16} /> Reenviar
                  </button>

                  <button
                    type="button"
                    className="btn btn-accent"
                    onClick={() => handleAprovarOrcamento(detalhesModal.id)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <CheckCircle2 size={16} /> Aprovar
                  </button>
                </>
              )}

              {/* Aprovado actions (Convert to Sale) */}
              {detalhesModal.status === 'Aprovado' && (
                <button
                  type="button"
                  className="btn btn-accent"
                  onClick={() => handleConverterEmVenda(detalhesModal.id)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 800 }}
                >
                  <ArrowRightCircle size={18} /> Converter em Pedido de Venda
                </button>
              )}

              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setDetalhesModal(null)}
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL: REGISTRAR MOTIVO DE REJEIÇÃO                                       */}
      {/* ========================================================================= */}
      <Modal
        isOpen={Boolean(rejeicaoModal)}
        title="Rejeitar Orçamento"
        onClose={() => setRejeicaoModal(null)}
        maxWidth="500px"
      >
        <div>
          <p style={{ color: '#64748B', fontSize: '0.875rem', marginBottom: '1rem' }}>
            Informe o motivo da rejeição pelo cliente (preço alto, prazo longo, concorrente, etc.):
          </p>

          <div className="form-group">
            <label className="form-label">Motivo da Rejeição</label>
            <textarea
              className="form-textarea"
              rows="3"
              value={rejeicaoModal?.motivo || ''}
              onChange={(e) => setRejeicaoModal({ ...rejeicaoModal, motivo: e.target.value })}
              placeholder="Descreva o motivo informado pelo cliente..."
              autoFocus
            />
          </div>

          <div className="modal-footer" style={{ padding: 0, background: 'none', border: 'none' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setRejeicaoModal(null)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleConfirmRejeicao}
            >
              Confirmar Rejeição
            </button>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL: VISUALIZAÇÃO DE PROPOSTA EM PDF (DOCUMENTO COMERCIAL OFICIAL)      */}
      {/* ========================================================================= */}
      <Modal
        isOpen={Boolean(pdfModal)}
        title={`Visualização de Proposta em PDF - #${pdfModal?.numero || ''}`}
        onClose={() => setPdfModal(null)}
        maxWidth="1020px"
      >
        {pdfModal && (() => {
          const cli = pdfModal.cliente || {};
          const forn = pdfModal.fornecedor || {};
          const itens = pdfModal.itens || [];

          const totalProdutos = itens.reduce((acc, item) => acc + ((parseFloat(item.quantidade) || 0) * (parseFloat(item.precoUnitario) || 0)), 0);
          const totalIpi = itens.reduce((acc, item) => {
            const ipiRate = parseFloat(item.ipi) || 0;
            const sub = (parseFloat(item.quantidade) || 0) * (parseFloat(item.precoUnitario) || 0);
            return acc + (sub * (ipiRate / 100));
          }, 0);
          const totalFinal = pdfModal.total || (totalProdutos + totalIpi);

          return (
            <div>
              {/* Top Toolbar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="badge badge-accent font-mono" style={{ fontSize: '0.85rem' }}>
                    {pdfModal.numero}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: '#64748B' }}>
                    Status: <strong>{pdfModal.status}</strong>
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => window.print()}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
                  >
                    <Printer size={16} /> Imprimir / Salvar PDF
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setPdfModal(null)}
                  >
                    Fechar
                  </button>
                </div>
              </div>

              {/* Exact Report Sheet Layout matching the Screenshot */}
              <div 
                id="printable-commercial-proposal"
                style={{
                  backgroundColor: '#FFFFFF',
                  padding: '1.5rem',
                  border: '1px solid #1E293B',
                  borderRadius: '4px',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
                  color: '#000000',
                  fontFamily: 'Arial, Helvetica, sans-serif',
                  fontSize: '0.8rem',
                  lineHeight: '1.3'
                }}
              >
                {/* 1. TOP HEADER BOX */}
                <div style={{
                  border: '1px solid #000000',
                  borderBottom: 'none',
                  display: 'grid',
                  gridTemplateColumns: '1.4fr 2fr 1.3fr 1.6fr',
                  alignItems: 'center',
                  padding: '8px 12px',
                  gap: '10px'
                }}>
                  {/* Company Logo */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {empresa.logomarca ? (
                      <img src={empresa.logomarca} alt="Logo Empresa" style={{ maxHeight: '60px', maxWidth: '100%', objectFit: 'contain' }} />
                    ) : (
                      <div style={{
                        border: '1px solid #CBD5E1',
                        padding: '6px 10px',
                        borderRadius: '4px',
                        textAlign: 'center',
                        backgroundColor: '#F8FAFC'
                      }}>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0A2540', letterSpacing: '0.04em' }}>
                          LAFITE LIMA
                        </div>
                        <div style={{ fontSize: '0.62rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          REPRESENTAÇÕES
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Company Info */}
                  <div style={{ fontSize: '0.75rem', lineHeight: '1.4' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#000000' }}>
                      {empresa.nome || 'Lafite Lima'}
                    </div>
                    <div>CNPJ: {empresa.cnpj || '12.345.678/0001-90'}, IE: -</div>
                    <div>Email: {empresa.email || 'lafitelima@outlook.com'}</div>
                    <div>Fone: (71) 9812-71678 Celular: (71) 9812-71678</div>
                  </div>

                  {/* Supplier Logo & Name */}
                  <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#000000', marginBottom: '2px' }}>
                      {forn.fantasia || forn.nome || 'Fornecedor'}
                    </div>
                    {forn.logomarca ? (
                      <img src={forn.logomarca} alt="Logo Fornecedor" style={{ maxHeight: '42px', maxWidth: '100%', objectFit: 'contain' }} />
                    ) : (
                      <div style={{ border: '1px dashed #94A3B8', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', color: '#64748B' }}>
                        {forn.nome || 'Logo Representada'}
                      </div>
                    )}
                  </div>

                  {/* Quote Number & Metadata */}
                  <div style={{ fontSize: '0.75rem', lineHeight: '1.4', paddingLeft: '8px', borderLeft: '1px solid #000000' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong>Orçamento Nº:</strong>
                      <span className="font-mono" style={{ fontWeight: 800 }}>{pdfModal.numero}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong>Pedido Cliente:</strong>
                      <span>{pdfModal.ordemCompra || '-'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong>Vendedor:</strong>
                      <span style={{ fontWeight: 700 }}>{pdfModal.vendedorResponsavel || user.nome}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong>Status:</strong>
                      <span>{pdfModal.status}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong>Data Pedido:</strong>
                      <span>{formatDate(pdfModal.dataEmissao || pdfModal.dataCriacao)}</span>
                    </div>
                  </div>
                </div>

                {/* 2. CUSTOMER & DELIVERY INFO BOX */}
                <div style={{
                  border: '1px solid #000000',
                  borderBottom: 'none',
                  padding: '6px 10px',
                  fontSize: '0.75rem',
                  lineHeight: '1.45'
                }}>
                  {/* Linha 1 */}
                  <div style={{ display: 'grid', gridTemplateColumns: '3fr 2.5fr 1fr', gap: '8px' }}>
                    <div><strong>Cliente:</strong> {cli.nome || pdfModal.clienteNome}</div>
                    <div><strong>Email:</strong> {cli.email || '-'}</div>
                    <div><strong>Tipo:</strong> Venda</div>
                  </div>

                  {/* Linha 2 */}
                  <div style={{ display: 'grid', gridTemplateColumns: '3fr 2.5fr 1fr', gap: '8px' }}>
                    <div><strong>Endereço:</strong> {cli.endereco ? `${cli.endereco}, ${cli.numero || ''}` : '-'}</div>
                    <div><strong>Bairro:</strong> {cli.bairro || '-'}</div>
                    <div><strong>Comprador:</strong> {pdfModal.comprador || cli.comprador || '-'}</div>
                  </div>

                  {/* Linha 3 */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1.5fr 1.5fr', gap: '8px' }}>
                    <div><strong>Cidade/Uf:</strong> {cli.cidade || '-'}</div>
                    <div><strong>CEP:</strong> {cli.cep || '-'}</div>
                    <div><strong>Fone:</strong> {cli.telefone || '-'}</div>
                    <div><strong>Data Despacho:</strong> {formatDate(pdfModal.dataDespacho) || '-'}</div>
                  </div>

                  {/* Linha 4 */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 2fr', gap: '8px' }}>
                    <div><strong>CNPJ:</strong> {cli.cpfCnpj || '-'}</div>
                    <div><strong>Inscrição:</strong> {cli.ie || cli.ieRg || '-'}</div>
                    <div><strong>Condição:</strong> {pdfModal.condicaoPagamento || '28/42/56dd'}</div>
                  </div>

                  {/* Linha 5: Entrega */}
                  <div style={{ marginTop: '2px' }}>
                    <strong>Entrega:</strong> {pdfModal.enderecoEntrega || `${cli.endereco || ''}, ${cli.numero || ''} - ${cli.bairro || ''}, CEP: ${cli.cep || ''}, ${cli.cidade || ''}`}
                  </div>

                  {/* Linha 6: Transportador */}
                  <div style={{ display: 'grid', gridTemplateColumns: '3fr 1.5fr 1.5fr', gap: '8px', marginTop: '2px' }}>
                    <div><strong>Transportador:</strong> {cli.transportadoraId || 'VIA VERDE Grande Linha Transportes E Logistica Eireli'}</div>
                    <div><strong>CEP:</strong> {cli.cep || '41219-600'}</div>
                    <div><strong>Fone:</strong> {cli.telefone || '(71) 3215-8207'}</div>
                  </div>
                </div>

                {/* 3. PRODUCTS TABLE WITH EXACT BORDERS AND COLUMNS */}
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  border: '1px solid #000000',
                  fontSize: '0.725rem',
                  textAlign: 'left'
                }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F1F5F9', borderBottom: '1px solid #000000' }}>
                      <th style={{ padding: '4px 6px', borderRight: '1px solid #000000', width: '35px', textAlign: 'center' }}>Item</th>
                      <th style={{ padding: '4px 6px', borderRight: '1px solid #000000', width: '90px' }}>Código</th>
                      <th style={{ padding: '4px 6px', borderRight: '1px solid #000000' }}>Descrição do produto</th>
                      <th style={{ padding: '4px 6px', borderRight: '1px solid #000000', textAlign: 'right', width: '70px' }}>Quantidade</th>
                      <th style={{ padding: '4px 6px', borderRight: '1px solid #000000', textAlign: 'right', width: '70px' }}>Preço Bruto</th>
                      <th style={{ padding: '4px 6px', borderRight: '1px solid #000000', textAlign: 'right', width: '60px' }}>Desconto</th>
                      <th style={{ padding: '4px 6px', borderRight: '1px solid #000000', textAlign: 'right', width: '70px' }}>Preço Líquido</th>
                      <th style={{ padding: '4px 6px', borderRight: '1px solid #000000', textAlign: 'right', width: '45px' }}>%IPI</th>
                      <th style={{ padding: '4px 6px', borderRight: '1px solid #000000', textAlign: 'right', width: '45px' }}>%ST</th>
                      <th style={{ padding: '4px 6px', borderRight: '1px solid #000000', textAlign: 'right', width: '75px' }}>Preço c/ Impostos</th>
                      <th style={{ padding: '4px 6px', textAlign: 'right', width: '85px' }}>Total c/ Impostos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itens.length === 0 ? (
                      <tr>
                        <td colSpan={11} style={{ textAlign: 'center', padding: '1rem', color: '#64748B' }}>
                          Nenhum item adicionado
                        </td>
                      </tr>
                    ) : (
                      itens.map((it, idx) => {
                        const qtd = parseFloat(it.quantidade) || 0;
                        const precoBruto = parseFloat(it.precoUnitario) || 0;
                        const desconto = parseFloat(it.desconto) || 0;
                        const precoLiquido = Math.max(0, precoBruto - desconto);
                        const ipiRate = parseFloat(it.ipi) || 0;
                        const stRate = parseFloat(it.st) || 0;
                        const precoComImpostos = precoLiquido * (1 + (ipiRate / 100) + (stRate / 100));
                        const totalItem = qtd * precoComImpostos;

                        return (
                          <tr key={idx} style={{ borderBottom: '1px solid #CBD5E1' }}>
                            <td style={{ padding: '4px 6px', borderRight: '1px solid #000000', textAlign: 'center' }}>
                              {String(idx + 1).padStart(2, '0')}
                            </td>
                            <td className="font-mono" style={{ padding: '4px 6px', borderRight: '1px solid #000000', fontWeight: 600 }}>
                              {it.codigo || '-'}
                            </td>
                            <td style={{ padding: '4px 6px', borderRight: '1px solid #000000', fontWeight: 600 }}>
                              {it.produtoNome}
                            </td>
                            <td style={{ padding: '4px 6px', borderRight: '1px solid #000000', textAlign: 'right' }}>
                              {qtd.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 3 })}
                            </td>
                            <td style={{ padding: '4px 6px', borderRight: '1px solid #000000', textAlign: 'right' }}>
                              {precoBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td style={{ padding: '4px 6px', borderRight: '1px solid #000000', textAlign: 'right' }}>
                              {desconto.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td style={{ padding: '4px 6px', borderRight: '1px solid #000000', textAlign: 'right' }}>
                              {precoLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td style={{ padding: '4px 6px', borderRight: '1px solid #000000', textAlign: 'right' }}>
                              {ipiRate.toFixed(2)}
                            </td>
                            <td style={{ padding: '4px 6px', borderRight: '1px solid #000000', textAlign: 'right' }}>
                              {stRate.toFixed(2)}
                            </td>
                            <td style={{ padding: '4px 6px', borderRight: '1px solid #000000', textAlign: 'right' }}>
                              {precoComImpostos.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="font-mono" style={{ padding: '4px 6px', textAlign: 'right', fontWeight: 700 }}>
                              {totalItem.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>

                {/* 4. OBSERVATION & TOTALS BOTTOM BOX */}
                <div style={{
                  border: '1px solid #000000',
                  borderTop: 'none',
                  display: 'grid',
                  gridTemplateColumns: '1fr 280px',
                  fontSize: '0.75rem'
                }}>
                  {/* Observation Block */}
                  <div style={{ padding: '8px 10px', borderRight: '1px solid #000000' }}>
                    <strong>Observação:</strong>
                    <div style={{ marginTop: '3px', whiteSpace: 'pre-wrap', color: '#1E293B' }}>
                      {pdfModal.observacoes || 'Proposta sujeita à confirmação de estoque e crédito. Faturamento direto pela indústria representada.'}
                    </div>
                  </div>

                  {/* Totals Breakdown Block */}
                  <div style={{ padding: '8px 12px', lineHeight: '1.45' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>(+) Produtos:</span>
                      <strong className="font-mono">{formatCurrency(totalProdutos)}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>(+) Frete: <strong>{pdfModal.tipoFrete || 'FOB'}</strong></span>
                      <span className="font-mono">R$ 0,00</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>(+) IPI:</span>
                      <span className="font-mono">{formatCurrency(totalIpi)}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>(+) ST:</span>
                      <span className="font-mono">R$ 0,00</span>
                    </div>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      borderTop: '1px solid #CBD5E1',
                      marginTop: '4px',
                      paddingTop: '4px',
                      fontSize: '0.85rem'
                    }}>
                      <strong style={{ color: '#DC2626' }}>Total:</strong>
                      <strong className="font-mono" style={{ color: '#DC2626', fontSize: '0.95rem' }}>
                        {formatCurrency(totalFinal)}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* QUICK MODAL 1: CADASTRAR CLIENTE NA HORA */}
      <Modal
        isOpen={quickClienteModal}
        onClose={() => setQuickClienteModal(false)}
        title="Cadastrar Novo Cliente"
        maxWidth="620px"
      >
        <form onSubmit={handleSaveQuickCliente}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Nome / Razão Social *</label>
              <input
                type="text"
                className="form-input"
                value={quickClienteData.nome}
                onChange={(e) => setQuickClienteData({ ...quickClienteData, nome: e.target.value })}
                placeholder="Ex: Comercial Silva Ltda"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Nome Fantasia</label>
              <input
                type="text"
                className="form-input"
                value={quickClienteData.fantasia}
                onChange={(e) => setQuickClienteData({ ...quickClienteData, fantasia: e.target.value })}
                placeholder="Ex: Silva Distribuidora"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">CPF / CNPJ</label>
              <input
                type="text"
                className="form-input"
                value={quickClienteData.cpfCnpj}
                onChange={(e) => setQuickClienteData({ ...quickClienteData, cpfCnpj: e.target.value })}
                placeholder="00.000.000/0000-00"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Telefone / WhatsApp</label>
              <input
                type="text"
                className="form-input"
                value={quickClienteData.telefone}
                onChange={(e) => setQuickClienteData({ ...quickClienteData, telefone: e.target.value })}
                placeholder="(71) 99999-9999"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">CEP (Auto-preenchimento)</label>
              <input
                type="text"
                className="form-input"
                value={quickClienteData.cep}
                onChange={(e) => {
                  const val = e.target.value;
                  setQuickClienteData({ ...quickClienteData, cep: val });
                  if (val.replace(/\D/g, '').length === 8) {
                    performCEPLookup(val, setQuickClienteData);
                  }
                }}
                placeholder="00000-000"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Cidade</label>
              <input
                type="text"
                className="form-input"
                value={quickClienteData.cidade}
                onChange={(e) => setQuickClienteData({ ...quickClienteData, cidade: e.target.value })}
                placeholder="Cidade"
              />
            </div>
            <div className="form-group" style={{ maxWidth: '80px' }}>
              <label className="form-label">UF</label>
              <input
                type="text"
                className="form-input"
                value={quickClienteData.estado}
                onChange={(e) => setQuickClienteData({ ...quickClienteData, estado: e.target.value })}
                placeholder="BA"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group" style={{ flex: 2 }}>
              <label className="form-label">Endereço (Rua / Av.)</label>
              <input
                type="text"
                className="form-input"
                value={quickClienteData.endereco}
                onChange={(e) => setQuickClienteData({ ...quickClienteData, endereco: e.target.value })}
                placeholder="Logradouro"
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Número</label>
              <input
                type="text"
                className="form-input"
                value={quickClienteData.numero}
                onChange={(e) => setQuickClienteData({ ...quickClienteData, numero: e.target.value })}
                placeholder="Nº"
              />
            </div>
          </div>

          <div className="modal-footer" style={{ padding: '1rem 0 0 0', borderTop: '1px solid #E2E8F0', marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => setQuickClienteModal(false)}>Cancelar</button>
            <button type="submit" className="btn btn-accent">Salvar e Vincular Cliente</button>
          </div>
        </form>
      </Modal>

      {/* QUICK MODAL 2: CADASTRAR FORNECEDOR NA HORA */}
      <Modal
        isOpen={quickFornecedorModal}
        onClose={() => setQuickFornecedorModal(false)}
        title="Cadastrar Novo Fornecedor Representado"
        maxWidth="620px"
      >
        <form onSubmit={handleSaveQuickFornecedor}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Razão Social / Nome *</label>
              <input
                type="text"
                className="form-input"
                value={quickFornecedorData.nome}
                onChange={(e) => setQuickFornecedorData({ ...quickFornecedorData, nome: e.target.value })}
                placeholder="Ex: Vidros & Cia Indústria"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Nome Fantasia</label>
              <input
                type="text"
                className="form-input"
                value={quickFornecedorData.fantasia}
                onChange={(e) => setQuickFornecedorData({ ...quickFornecedorData, fantasia: e.target.value })}
                placeholder="Ex: Vidros Brasil"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">CNPJ / CPF</label>
              <input
                type="text"
                className="form-input"
                value={quickFornecedorData.cpfCnpj}
                onChange={(e) => setQuickFornecedorData({ ...quickFornecedorData, cpfCnpj: e.target.value })}
                placeholder="00.000.000/0000-00"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Telefone / WhatsApp</label>
              <input
                type="text"
                className="form-input"
                value={quickFornecedorData.telefone}
                onChange={(e) => setQuickFornecedorData({ ...quickFornecedorData, telefone: e.target.value })}
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">CEP (Auto-preenchimento)</label>
              <input
                type="text"
                className="form-input"
                value={quickFornecedorData.cep}
                onChange={(e) => {
                  const val = e.target.value;
                  setQuickFornecedorData({ ...quickFornecedorData, cep: val });
                  if (val.replace(/\D/g, '').length === 8) {
                    performCEPLookup(val, setQuickFornecedorData);
                  }
                }}
                placeholder="00000-000"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Cidade</label>
              <input
                type="text"
                className="form-input"
                value={quickFornecedorData.cidade}
                onChange={(e) => setQuickFornecedorData({ ...quickFornecedorData, cidade: e.target.value })}
                placeholder="Cidade"
              />
            </div>
            <div className="form-group" style={{ maxWidth: '80px' }}>
              <label className="form-label">UF</label>
              <input
                type="text"
                className="form-input"
                value={quickFornecedorData.estado}
                onChange={(e) => setQuickFornecedorData({ ...quickFornecedorData, estado: e.target.value })}
                placeholder="BA"
              />
            </div>
          </div>

          <div className="modal-footer" style={{ padding: '1rem 0 0 0', borderTop: '1px solid #E2E8F0', marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => setQuickFornecedorModal(false)}>Cancelar</button>
            <button type="submit" className="btn btn-accent">Salvar e Vincular Fornecedor</button>
          </div>
        </form>
      </Modal>

      {/* QUICK MODAL 3: CADASTRAR VENDEDOR NA HORA */}
      <Modal
        isOpen={quickVendedorModal}
        onClose={() => setQuickVendedorModal(false)}
        title="Cadastrar Novo Vendedor / Representante"
        maxWidth="500px"
      >
        <form onSubmit={handleSaveQuickVendedor}>
          <div className="form-group">
            <label className="form-label">Nome Completo do Vendedor *</label>
            <input
              type="text"
              className="form-input"
              value={quickVendedorData.nome}
              onChange={(e) => setQuickVendedorData({ ...quickVendedorData, nome: e.target.value })}
              placeholder="Ex: Carlos Oliveira"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">E-mail (Opcional)</label>
            <input
              type="email"
              className="form-input"
              value={quickVendedorData.email}
              onChange={(e) => setQuickVendedorData({ ...quickVendedorData, email: e.target.value })}
              placeholder="carlos@empresa.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Telefone / WhatsApp</label>
            <input
              type="text"
              className="form-input"
              value={quickVendedorData.telefone}
              onChange={(e) => setQuickVendedorData({ ...quickVendedorData, telefone: e.target.value })}
              placeholder="(71) 98888-8888"
            />
          </div>

          <div className="modal-footer" style={{ padding: '1rem 0 0 0', borderTop: '1px solid #E2E8F0', marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => setQuickVendedorModal(false)}>Cancelar</button>
            <button type="submit" className="btn btn-accent">Cadastrar e Selecionar Vendedor</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
