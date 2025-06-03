import React from 'react';
import { Code, Users, Heart, Star, Github, Linkedin, Mail } from 'lucide-react';

const features = [
  {
    title: 'Gerenciamento de Veículos',
    description: 'Cadastre e gerencie seus veículos de forma simples e eficiente.',
    icon: <Car className="w-6 h-6" />
  },
  {
    title: 'Controle de Manutenções',
    description: 'Acompanhe todas as manutenções realizadas em seus veículos.',
    icon: <Wrench className="w-6 h-6" />
  },
  {
    title: 'Lembretes Automáticos',
    description: 'Receba notificações sobre manutenções e despesas pendentes.',
    icon: <Bell className="w-6 h-6" />
  },
  {
    title: 'Relatórios Detalhados',
    description: 'Visualize relatórios completos sobre seus gastos e manutenções.',
    icon: <BarChart className="w-6 h-6" />
  }
];

const team = [
  {
    name: 'João Silva',
    role: 'Desenvolvedor Full Stack',
    image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&w=200',
    github: 'https://github.com/joaosilva',
    linkedin: 'https://linkedin.com/in/joaosilva'
  },
  {
    name: 'Maria Santos',
    role: 'Designer UI/UX',
    image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&w=200',
    github: 'https://github.com/mariasantos',
    linkedin: 'https://linkedin.com/in/mariasantos'
  },
  {
    name: 'Pedro Oliveira',
    role: 'Desenvolvedor Backend',
    image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&w=200',
    github: 'https://github.com/pedrooliveira',
    linkedin: 'https://linkedin.com/in/pedrooliveira'
  }
];

const About: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Sobre</h1>
        <p className="text-gray-500">Conheça mais sobre o nosso projeto</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-100">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
            <Code className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Nossa Missão</h2>
            <p className="text-gray-500">Simplificar o gerenciamento de veículos</p>
          </div>
        </div>
        <p className="text-gray-600">
          O Sistema de Gerenciamento de Veículos foi desenvolvido com o objetivo de facilitar
          o controle e manutenção de veículos, oferecendo uma solução completa e intuitiva
          para os usuários. Nossa plataforma permite o gerenciamento eficiente de manutenções,
          despesas e lembretes, ajudando a manter seus veículos sempre em dia.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-100 hover:scale-105 transition-transform"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                {feature.icon}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{feature.title}</h2>
                <p className="text-gray-500">{feature.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-100">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Nossa Equipe</h2>
            <p className="text-gray-500">Conheça os desenvolvedores do projeto</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {team.map((member, index) => (
            <div
              key={index}
              className="flex flex-col items-center p-6 rounded-xl border-2 border-gray-100 hover:scale-105 transition-transform"
            >
              <img
                src={member.image}
                alt={member.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg mb-4"
              />
              <h3 className="font-bold text-gray-900">{member.name}</h3>
              <p className="text-gray-500 mb-4">{member.role}</p>
              <div className="flex items-center gap-4">
                <a
                  href={member.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  <Github className="w-5 h-5" />
                </a>
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a
                  href={`mailto:${member.name.toLowerCase().replace(' ', '.')}@exemplo.com`}
                  className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-100">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Agradecimentos</h2>
            <p className="text-gray-500">A todos que contribuíram para o projeto</p>
          </div>
        </div>
        <p className="text-gray-600">
          Agradecemos a todos os usuários que acreditaram em nosso projeto e nos ajudaram
          a melhorar a plataforma com suas sugestões e feedback. Nosso objetivo é continuar
          evoluindo e oferecendo a melhor experiência possível para gerenciar seus veículos.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-100">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Versão</h2>
            <p className="text-gray-500">Informações sobre a versão atual</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-100">
            <div>
              <h3 className="font-bold text-gray-900">Versão Atual</h3>
              <p className="text-gray-500">1.0.0</p>
            </div>
            <div className="px-3 py-1 rounded-full bg-green-100 text-green-600 text-sm font-medium">
              Estável
            </div>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-100">
            <div>
              <h3 className="font-bold text-gray-900">Última Atualização</h3>
              <p className="text-gray-500">15 de Março de 2024</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About; 