import React, { useState } from 'react';
import { Search, HelpCircle, ChevronDown, ChevronUp, Mail, Phone, MessageSquare } from 'lucide-react';

const faqs = [
  {
    question: 'Como adicionar um novo veículo?',
    answer: 'Para adicionar um novo veículo, clique no botão "Adicionar Veículo" na tela de Meus Veículos. Preencha os dados do veículo e clique em "Salvar".'
  },
  {
    question: 'Como registrar uma manutenção?',
    answer: 'Para registrar uma manutenção, vá até a tela de Manutenções e clique em "Nova Manutenção". Preencha os dados da manutenção, incluindo peças e serviços, e clique em "Salvar".'
  },
  {
    question: 'Como configurar lembretes?',
    answer: 'Para configurar lembretes, vá até a tela de Lembretes e clique em "Novo Lembrete". Escolha o tipo de lembrete, a data e o veículo, e clique em "Salvar".'
  },
  {
    question: 'Como visualizar relatórios?',
    answer: 'Para visualizar relatórios, vá até a tela de Relatórios. Você pode filtrar por período e exportar os dados em diferentes formatos.'
  },
  {
    question: 'Como alterar minha senha?',
    answer: 'Para alterar sua senha, vá até a tela de Configurações e clique na aba "Segurança". Digite sua senha atual e a nova senha, e clique em "Salvar".'
  }
];

const categories = [
  {
    title: 'Veículos',
    icon: <Car className="w-6 h-6" />,
    description: 'Aprenda a gerenciar seus veículos',
    articles: [
      'Como adicionar um novo veículo',
      'Como editar dados do veículo',
      'Como excluir um veículo',
      'Como visualizar histórico do veículo'
    ]
  },
  {
    title: 'Manutenções',
    icon: <Wrench className="w-6 h-6" />,
    description: 'Aprenda a gerenciar manutenções',
    articles: [
      'Como registrar uma manutenção',
      'Como editar uma manutenção',
      'Como excluir uma manutenção',
      'Como visualizar histórico de manutenções'
    ]
  },
  {
    title: 'Lembretes',
    icon: <Bell className="w-6 h-6" />,
    description: 'Aprenda a gerenciar lembretes',
    articles: [
      'Como criar um lembrete',
      'Como editar um lembrete',
      'Como excluir um lembrete',
      'Como visualizar lembretes pendentes'
    ]
  },
  {
    title: 'Relatórios',
    icon: <BarChart className="w-6 h-6" />,
    description: 'Aprenda a gerar relatórios',
    articles: [
      'Como gerar relatório de despesas',
      'Como gerar relatório de manutenções',
      'Como exportar relatórios',
      'Como filtrar relatórios'
    ]
  }
];

const Help: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Ajuda</h1>
        <p className="text-gray-500">Encontre respostas para suas dúvidas</p>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
          placeholder="Pesquisar por dúvidas..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {categories.map((category, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-100 hover:scale-105 transition-transform"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                {category.icon}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{category.title}</h2>
                <p className="text-gray-500">{category.description}</p>
              </div>
            </div>
            <ul className="space-y-2">
              {category.articles.map((article, articleIndex) => (
                <li key={articleIndex} className="flex items-center gap-2 text-gray-600">
                  <HelpCircle className="w-4 h-4 text-blue-500" />
                  <span>{article}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Perguntas Frequentes</h2>
        <div className="space-y-4">
          {filteredFaqs.map((faq, index) => (
            <div
              key={index}
              className="border-2 border-gray-100 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition"
              >
                <span className="font-medium text-gray-900">{faq.question}</span>
                {expandedFaq === index ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
              {expandedFaq === index && (
                <div className="p-4 bg-gray-50 border-t border-gray-100">
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Contato</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100">
            <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Email</h3>
              <p className="text-gray-500">suporte@exemplo.com</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100">
            <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Telefone</h3>
              <p className="text-gray-500">(11) 1234-5678</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100">
            <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Chat</h3>
              <p className="text-gray-500">Seg-Sex, 9h-18h</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help; 