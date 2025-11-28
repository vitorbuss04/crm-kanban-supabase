# CRM Kanban - Supabase

Sistema CRM moderno com Kanban board integrado ao Supabase para gerenciamento de clientes.

## 🚀 Características

- ✅ **Kanban Board** - 5 colunas de status (Novo, Em Contato, Proposta, Fechado, Perdido)
- ✅ **Drag & Drop** - Arraste cards entre colunas para alterar status
- ✅ **Visual Feedback** - Sistema "Shadow & Highlight" ao arrastar
- ✅ **CRUD Completo** - Criar, editar e excluir clientes
- ✅ **Integração Supabase** - Persistência de dados em tempo real
- ✅ **Design Moderno** - Interface limpa e responsiva
- ✅ **Mobile Friendly** - Funciona em todos os dispositivos

## 🛠️ Tecnologias

- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Backend**: Supabase (PostgreSQL)
- **Build Tool**: Vite
- **Estilo**: CSS Moderno com variáveis CSS

## 📦 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/crm-kanban-supabase.git
cd crm-kanban-supabase
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env` na raiz do projeto:
```env
VITE_SUPABASE_URL=sua-url-do-supabase
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

4. Execute o projeto:
```bash
npm run dev
```

## 🗄️ Configuração do Banco de Dados

Execute o seguinte SQL no Supabase para criar a tabela:

```sql
-- Create the clients table
create table clients (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  phone text,
  status text default 'Novo',
  notes text,
  position double precision default 0,
  created_at timestamp with time zone default now() not null
);

-- Enable Row Level Security (RLS)
alter table clients enable row level security;

-- Create secure RLS policies
-- 1. Users can view their own clients
create policy "Users can view their own clients" on clients
  for select using (auth.uid() = user_id);

-- 2. Users can insert new clients for themselves
create policy "Users can insert their own clients" on clients
  for insert with check (auth.uid() = user_id);

-- 3. Users can update their own clients
create policy "Users can update their own clients" on clients
  for update using (auth.uid() = user_id);

-- 4. Users can delete their own clients
create policy "Users can delete their own clients" on clients
  for delete using (auth.uid() = user_id);
```

## 🎯 Como Usar

1. **Adicionar Cliente**: Clique no botão "Novo Cliente" no topo
2. **Arrastar Card**: Clique e arraste um card para outra coluna para mudar o status
3. **Editar Cliente**: Clique no ícone de lápis no card
4. **Excluir Cliente**: Clique no ícone de lixeira no card
5. **Navegação Rápida**: Use as setas para mover cliente entre status adjacentes

## 📁 Estrutura do Projeto

```
crm/
├── index.html          # HTML principal
├── main.js            # Lógica da aplicação
├── style.css          # Estilos
├── .env               # Variáveis de ambiente (não commitado)
├── .gitignore         # Arquivos ignorados
├── package.json       # Dependências
└── vite.config.js     # Configuração do Vite
```

## 🎨 Design System

- **Cores**: Sistema de cores neutras com destaques coloridos para cada status
- **Tipografia**: Inter (Google Fonts)
- **Ícones**: SVG inline para melhor performance
- **Animações**: Transições suaves e micro-interações

## 📱 Responsividade

O sistema é totalmente responsivo:
- **Desktop**: Layout de 5 colunas lado a lado
- **Mobile**: Scroll horizontal com snap para cada coluna

## 🔐 Segurança

- Autenticação via Supabase
- RLS (Row Level Security) habilitado
- Variáveis de ambiente para credenciais

## 📝 Licença

MIT

## 👨‍💻 Autor

Desenvolvido com ❤️ usando Supabase e Vite