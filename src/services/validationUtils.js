// Utilitários de Validação e Formatação (CNPJ, CEP, Telefone e ViaCEP)

export const formatCNPJ = (val) => {
  if (!val) return '';
  const digits = val.replace(/\D/g, '').slice(0, 14);
  if (digits.length === 14) {
    return digits
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }
  return val;
};

export const formatPhone = (val) => {
  if (!val) return '';
  const digits = val.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }
  return digits
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
};

export const formatCEP = (val) => {
  if (!val) return '';
  const digits = val.replace(/\D/g, '').slice(0, 8);
  if (digits.length === 8) {
    return digits.replace(/^(\d{5})(\d)/, '$1-$2');
  }
  return val;
};

// Permite informar qualquer número no CNPJ conforme solicitado
export const validateCNPJ = (cnpj) => {
  if (!cnpj) return false;
  const clean = cnpj.toString().trim();
  return clean.length > 0;
};

export const fetchAddressByCEP = async (cep) => {
  const clean = (cep || '').replace(/\D/g, '');
  if (clean.length !== 8) {
    throw new Error('CEP deve conter 8 dígitos.');
  }

  const response = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
  if (!response.ok) {
    throw new Error('Erro ao consultar CEP.');
  }

  const data = await response.json();
  if (data.erro) {
    throw new Error('CEP não localizado.');
  }

  return {
    endereco: data.logradouro || '',
    bairro: data.bairro || '',
    cidade: data.localidade || '',
    estado: data.uf || '',
    complemento: data.complemento || ''
  };
};
