import React, { useState } from 'react';
import { ShoppingCart, Plus, Trash2, CheckCircle2, Eye, FileText, UserCheck, PackageCheck, Printer } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../services/storage';
import { Modal } from '../components/Modal';

export const VendasPage = ({ showToast }) => {
  const { empresa, user } = useAuth();
  const [isNovaVendaModal, setIsNovaVendaModal] = useState(false);
  const [vendaDetalhadaModal, setVendaDetalhadaModal] = useState(null);

  const [selectedClienteId, setSelectedClienteId] = useState('');
  const [cartItems, setCartItems] = useState([]); // [{ produtoId, quantidade }]

  // Temporary selection state for adding items to cart
  const [selectedProdutoId, setSelectedProdutoId] = useState('');
  const [inputQtd, setInputQtd] = useState(1);

  if (!empresa) return null;

  const clientes = storage.getClientes(empresa.id);
  const produtos = storage.getProdutos(empresa.id);
  const vendas = storage.getVendas(empresa.id);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handleOpenNovaVenda = () => {
    setSelectedClienteId(clientes.length > 0 ? clientes[0].id : '');
    setCartItems([]);
    setSelectedProdutoId('');
    setInputQtd(1);
    setIsNovaVendaModal(true);
  };

  const handleAddToCart = () => {
    if (!selectedProdutoId) {
      showToast('warning', 'Selecione um produto para adicionar.');
      return;
    }
    const prod = produtos.find(p => p.id === selectedProdutoId);
    if (!prod) return;

    if (inputQtd <= 0) {
      showToast('warning', 'Digite uma quantidade maior que zero.');
      return;
    }

    if (prod.estoque < inputQtd) {
      showToast('error', `Estoque insuficiente! Disponível: ${prod.estoque} un.`);
      return;
    }

    // Check if item already exists in cart
    const existingIndex = cartItems.findIndex(i => i.produtoId === selectedProdutoId);
    if (existingIndex >= 0) {
      const newTotalQtd = cartItems[existingIndex].quantidade + inputQtd;
      if (prod.estoque < newTotalQtd) {
        showToast('error', `Estoque máximo atingido! Disponível: ${prod.estoque} un.`);
        return;
      }
      const updated = [...cartItems];
      updated[existingIndex].quantidade = newTotalQtd;
      setCartItems(updated);
    } else {
      setCartItems([...cartItems, { produtoId: selectedProdutoId, quantidade: inputQtd }]);
    }

    setSelectedProdutoId('');
    setInputQtd(1);
    showToast('success', `${prod.nome} adicionado ao carrinho.`);
  };

  const handleRemoveFromCart = (index) => {
    setCartItems(cartItems.filter((_, idx) => idx !== index));
  };

  // Calculate cart subtotal & total
  const cartTotal = cartItems.reduce((acc, item) => {
    const prod = produtos.find(p => p.id === item.produtoId);
    return acc + (prod ? prod.preco * item.quantidade : 0);
  }, 0);

  const handleFinalizeSale = (e) => {
    e.preventDefault();
    if (!selectedClienteId) {
      showToast('error', 'Selecione um cliente para finalizar a venda.');
      return;
    }
    if (cartItems.length === 0) {
      showToast('error', 'O carrinho está vazio.');
      return;
    }

    try {
      storage.createVenda({
        clienteId: selectedClienteId,
        itens: cartItems
      }, empresa.id, user.nome);

      showToast('success', 'Venda realizada com sucesso! Estoque e financeiro atualizados.');
      setIsNovaVendaModal(false);
    } catch (err) {
      showToast('error', err.message || 'Erro ao finalizar venda.');
    }
  };

  const handleOpenDetalhes = (vendaId) => {
    const detalhada = storage.getVendaDetalhada(vendaId, empresa.id);
    setVendaDetalhadaModal(detalhada);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1>Gestão de Vendas (PDV)</h1>
          <p>Faturamento e emissão de ordens de venda da empresa {empresa.nome}</p>
        </div>
        <button className="btn btn-accent" onClick={handleOpenNovaVenda}>
          <Plus size={18} /> Realizar Nova Venda
        </button>
      </div>

      {/* Vendas History Card */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <ShoppingCart size={20} style={{ color: '#00C896' }} /> Histórico de Vendas
          </div>
          <span className="badge badge-dark">{vendas.length} Registros</span>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Código Venda</th>
                <th>Cliente</th>
                <th>Data da Venda</th>
                <th>Qtd. Itens</th>
                <th>Valor Total</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {vendas.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: '#64748B', padding: '3rem 1rem' }}>
                    Nenhuma venda realizada ainda nesta empresa.
                  </td>
                </tr>
              ) : (
                vendas.map(v => (
                  <tr key={v.id}>
                    <td className="font-mono" style={{ fontWeight: 700, color: '#0A2540' }}>#{v.id}</td>
                    <td style={{ fontWeight: 600 }}>{v.clienteNome}</td>
                    <td style={{ color: '#64748B' }}>{new Date(v.dataVenda).toLocaleString('pt-BR')}</td>
                    <td>{v.itensCount || 1} item(ns)</td>
                    <td className="font-mono" style={{ fontWeight: 800, color: '#00C896' }}>
                      {formatCurrency(v.total)}
                    </td>
                    <td className="text-right">
                      <button 
                        className="btn btn-outline btn-sm" 
                        onClick={() => handleOpenDetalhes(v.id)}
                      >
                        <Eye size={14} /> Detalhes
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nova Venda (PDV) */}
      <Modal
        isOpen={isNovaVendaModal}
        onClose={() => setIsNovaVendaModal(false)}
        title="Ponto de Venda (PDV) - Nova Venda"
        maxWidth="720px"
      >
        <form onSubmit={handleFinalizeSale}>
          {/* Cliente Selector */}
          <div className="form-group">
            <label className="form-label">Selecione o Cliente</label>
            <select
              className="form-select"
              required
              value={selectedClienteId}
              onChange={(e) => setSelectedClienteId(e.target.value)}
            >
              {clientes.length === 0 && <option value="">Nenhum cliente cadastrado</option>}
              {clientes.map(cli => (
                <option key={cli.id} value={cli.id}>
                  {cli.nome} ({cli.cpfCnpj})
                </option>
              ))}
            </select>
          </div>

          <div style={{ margin: '1.5rem 0 1rem 0', borderTop: '1px solid #E2E8F0', paddingTop: '1rem' }}>
            <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0A2540', marginBottom: '0.75rem' }}>
              Adicionar Produtos ao Carrinho
            </h4>

            {/* Add item row */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '0.75rem', alignItems: 'flex-end' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Produto</label>
                <select
                  className="form-select"
                  value={selectedProdutoId}
                  onChange={(e) => setSelectedProdutoId(e.target.value)}
                >
                  <option value="">-- Selecione o Produto --</option>
                  {produtos.map(prod => (
                    <option key={prod.id} value={prod.id} disabled={prod.estoque === 0}>
                      {prod.nome} - {formatCurrency(prod.preco)} (Estoque: {prod.estoque})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Qtd.</label>
                <input
                  type="number"
                  min="1"
                  className="form-input"
                  value={inputQtd}
                  onChange={(e) => setInputQtd(parseInt(e.target.value, 10) || 1)}
                />
              </div>

              <button type="button" className="btn btn-primary" onClick={handleAddToCart}>
                <Plus size={16} /> Adicionar
              </button>
            </div>
          </div>

          {/* Cart Table */}
          <div style={{ margin: '1.25rem 0', backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <h5 style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              Itens da Venda ({cartItems.length})
            </h5>

            {cartItems.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#94A3B8', fontSize: '0.875rem', padding: '1.5rem 0' }}>
                Carrinho vazio. Adicione produtos acima.
              </div>
            ) : (
              <table className="table" style={{ backgroundColor: 'white', borderRadius: '6px' }}>
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Preço Unit.</th>
                    <th>Qtd</th>
                    <th>Subtotal</th>
                    <th className="text-right">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item, index) => {
                    const prod = produtos.find(p => p.id === item.produtoId);
                    const subtotal = prod ? prod.preco * item.quantidade : 0;
                    return (
                      <tr key={index}>
                        <td style={{ fontWeight: 600 }}>{prod?.nome}</td>
                        <td className="font-mono">{formatCurrency(prod?.preco || 0)}</td>
                        <td className="font-mono">{item.quantidade}</td>
                        <td className="font-mono" style={{ fontWeight: 700, color: '#00C896' }}>
                          {formatCurrency(subtotal)}
                        </td>
                        <td className="text-right">
                          <button
                            type="button"
                            className="btn-icon"
                            onClick={() => handleRemoveFromCart(index)}
                            style={{ color: '#EF4444' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {/* Total Footer */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '1rem',
              paddingTop: '0.75rem',
              borderTop: '2px solid #E2E8F0'
            }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0A2540' }}>TOTAL DA VENDA:</span>
              <span className="font-mono" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#00C896' }}>
                {formatCurrency(cartTotal)}
              </span>
            </div>
          </div>

          <div className="modal-footer" style={{ padding: '1rem 0 0 0', backgroundColor: 'transparent' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsNovaVendaModal(false)}>Cancelar</button>
            <button type="submit" className="btn btn-accent" disabled={cartItems.length === 0}>
              Finalizar Venda & Gerar Fatura
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Detalhes da Venda / Comprovante */}
      {vendaDetalhadaModal && (
        <Modal
          isOpen={!!vendaDetalhadaModal}
          onClose={() => setVendaDetalhadaModal(null)}
          title={`Comprovante de Venda #${vendaDetalhadaModal.id}`}
        >
          <div style={{ padding: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontWeight: 800, color: '#0A2540', fontSize: '1.1rem' }}>{empresa.nome}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748B' }}>CNPJ: {empresa.cnpj}</div>
              </div>
              <span className="badge badge-success">Venda Concluída</span>
            </div>

            <div style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
              <div><strong>Cliente:</strong> {vendaDetalhadaModal.cliente?.nome}</div>
              <div><strong>CPF/CNPJ:</strong> {vendaDetalhadaModal.cliente?.cpfCnpj}</div>
              <div><strong>Data:</strong> {new Date(vendaDetalhadaModal.dataVenda).toLocaleString('pt-BR')}</div>
            </div>

            <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0A2540', marginBottom: '0.5rem' }}>
              Itens Adquiridos:
            </h5>
            <table className="table" style={{ fontSize: '0.8125rem', marginBottom: '1.25rem' }}>
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Qtd</th>
                  <th>Preço Unit.</th>
                  <th className="text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {vendaDetalhadaModal.itens.map((it, idx) => (
                  <tr key={idx}>
                    <td>{it.produtoNome}</td>
                    <td>{it.quantidade}</td>
                    <td className="font-mono">{formatCurrency(it.precoUnitario)}</td>
                    <td className="text-right font-mono" style={{ fontWeight: 700 }}>
                      {formatCurrency(it.quantidade * it.precoUnitario)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#F8FAFC',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid #E2E8F0'
            }}>
              <span style={{ fontWeight: 800, color: '#0A2540' }}>TOTAL PAGO:</span>
              <span className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#00C896' }}>
                {formatCurrency(vendaDetalhadaModal.total)}
              </span>
            </div>
          </div>

          <div className="modal-footer" style={{ padding: '1rem 0 0 0', backgroundColor: 'transparent' }}>
            <button className="btn btn-outline" onClick={() => window.print()}>
              <Printer size={16} /> Imprimir Comprovante
            </button>
            <button className="btn btn-primary" onClick={() => setVendaDetalhadaModal(null)}>
              Fechar
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
