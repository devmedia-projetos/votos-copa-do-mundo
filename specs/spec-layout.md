# Spec de Layout \- Melhores do Brasil nas Copas

## 1\. Tecnologias

* Framework: Next.js (App Router)  
* Estilização: CSS Puro (Sem Tailwind)  
* Ícones: Lucide React

## 2\. Identidade Visual

* **Fundo Principal:** Verde escuro (\`bg-\[\#0d2b1a\]\`)  
* **Fundo dos Cards:** Verde médio (\`bg-\[\#1a3a2a\]\`)  
* **Cor de Destaque (Botões e Ícones):** Amarelo Ouro (\`bg-\[\#FFD700\]\`, \`text-\[\#FFD700\]\`)  
* **Texto Principal:** Branco (\`text-white\`)  
* **Texto Secundário:** Cinza claro (\`text-gray-300\`)  
* **Tipografia:** Fonte sans-serif limpa (Inter ou Montserrat)

## 3\. Estrutura da Tela (Desktop)

O layout deve seguir estritamente a imagem de referência \`layout.png\` localizada na pasta specs que fica na raiz do projeto.

A tela é dividida em duas colunas principais:

* **Coluna Esquerda (60% da largura):** Contém o cabeçalho, o seletor horizontal de anos e a área de duelo com os dois cards de jogadores.  
* **Coluna Direita (40% da largura):** Contém o card de Ranking Histórico.

## 4\. Detalhes dos Componentes

**Seletor de Anos:** Uma lista horizontal com scroll. O ano selecionado deve ter fundo amarelo ouro e texto escuro. Os demais anos devem ter fundo transparente e texto branco.

**Cards de Jogadores (Duelo):** Devem ter bordas arredondadas (\`rounded-xl\`). A foto do jogador deve ocupar a parte superior. O botão "VOTAR" deve ser largo, amarelo ouro, com texto escuro em negrito.

**Ranking Histórico:** Uma lista vertical. Cada item deve ter a foto circular do jogador à esquerda, nome no centro e total de votos em dourado à direita. O primeiro colocado deve exibir um ícone de troféu dourado.