import React, { useState } from 'react';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import Textarea from '../components/Textarea';
import Checkbox from '../components/Checkbox';
import Radio from '../components/Radio';
import Switch from '../components/Switch';
import Badge from '../components/Badge';
import { Card, CardHeader, CardBody, CardFooter } from '../components/Card';
import Loading from '../components/Loading';
import ErrorBoundary from '../components/ErrorBoundary';
import { Save, ArrowLeft, Home, AlertTriangle } from 'lucide-react';

const selectOptions = [
  { value: 'option1', label: 'Opção 1' },
  { value: 'option2', label: 'Opção 2' },
  { value: 'option3', label: 'Opção 3' },
];

const ComponentGuide: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [selectValue, setSelectValue] = useState('option1');
  const [textareaValue, setTextareaValue] = useState('');
  const [checkboxValue, setCheckboxValue] = useState(false);
  const [radioValue, setRadioValue] = useState('a');
  const [switchValue, setSwitchValue] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [showError, setShowError] = useState(false);

  return (
    <div className="space-y-12 max-w-4xl mx-auto py-12 animate-fade-in">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Guia de Componentes</h1>
      <p className="text-gray-500 mb-8">Exemplos de uso dos principais componentes customizados do sistema.</p>

      {/* Botões */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Button</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <Button variant="primary">Primário</Button>
          <Button variant="secondary">Secundário</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Perigo</Button>
          <Button isLoading>Carregando</Button>
          <Button leftIcon={<Save className="w-4 h-4" />}>Com Ícone</Button>
          <Button rightIcon={<ArrowLeft className="w-4 h-4" />}>Ícone Direita</Button>
          <Button fullWidth>Full Width</Button>
        </div>
      </section>

      {/* Inputs */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Input</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="Texto" value={inputValue} onChange={e => setInputValue(e.target.value)} placeholder="Digite algo..." />
          <Input label="Com erro" error="Campo obrigatório" placeholder="Erro" />
          <Input label="Desabilitado" disabled placeholder="Desabilitado" />
          <Input label="Com ícone" leftIcon={<Save className="w-4 h-4" />} placeholder="Ícone à esquerda" />
        </div>
      </section>

      {/* Select */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Select</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select label="Selecione uma opção" value={selectValue} onChange={e => setSelectValue(e.target.value)} options={selectOptions} />
          <Select label="Com erro" error="Selecione algo" options={selectOptions} />
        </div>
      </section>

      {/* Textarea */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Textarea</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Textarea label="Mensagem" value={textareaValue} onChange={e => setTextareaValue(e.target.value)} placeholder="Digite sua mensagem..." />
          <Textarea label="Com erro" error="Campo obrigatório" />
        </div>
      </section>

      {/* Checkbox, Radio, Switch */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Checkbox, Radio, Switch</h2>
        <div className="flex flex-wrap gap-8 items-center">
          <Checkbox label="Aceito os termos" checked={checkboxValue} onChange={e => setCheckboxValue(e.target.checked)} />
          <Radio label="Opção A" checked={radioValue === 'a'} onChange={() => setRadioValue('a')} />
          <Radio label="Opção B" checked={radioValue === 'b'} onChange={() => setRadioValue('b')} />
          <Switch label="Ativo" checked={switchValue} onChange={e => setSwitchValue(e.target.checked)} />
        </div>
      </section>

      {/* Badge */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Badge</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <Badge variant="primary">Primário</Badge>
          <Badge variant="secondary">Secundário</Badge>
          <Badge variant="success">Sucesso</Badge>
          <Badge variant="danger">Perigo</Badge>
          <Badge variant="warning">Aviso</Badge>
          <Badge variant="info">Info</Badge>
        </div>
      </section>

      {/* Card */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Card</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>Header do Card</CardHeader>
            <CardBody>Conteúdo do Card</CardBody>
            <CardFooter>Rodapé do Card</CardFooter>
          </Card>
          <Card hover onClick={() => alert('Card clicado!')}>
            <CardBody>Card com hover e clique</CardBody>
          </Card>
        </div>
      </section>

      {/* Loading */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Loading</h2>
        <div className="flex gap-4 items-center">
          <Button onClick={() => setShowLoading(true)}>Mostrar Loading Fullscreen</Button>
          <Loading text="Carregando..." />
        </div>
        {showLoading && <Loading fullScreen text="Carregando tela inteira..." />}
      </section>

      {/* ErrorBoundary */}
      <section>
        <h2 className="text-2xl font-bold mb-4">ErrorBoundary</h2>
        <div className="flex gap-4 items-center">
          <Button variant="danger" onClick={() => setShowError(true)}>Disparar Erro</Button>
        </div>
        <div className="mt-4">
          <ErrorBoundary>
            {showError ? (() => { throw new Error('Erro de exemplo!'); })() : <div>Nenhum erro lançado.</div>}
          </ErrorBoundary>
        </div>
      </section>
    </div>
  );
};

export default ComponentGuide; 