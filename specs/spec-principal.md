# Spec Principal: Votação Melhores do Brasil nas Copas

## 1\. Referências

Antes de iniciar o desenvolvimento, o agente deve ler e aplicar as seguintes especificações complementares:

- **Modelo de Dados:** `specs/data-model.md`  
- **Layout e Estilos:** `specs/spec-layout.md`

## 2\. Objetivo

Criar uma aplicação web interativa para que os usuários votem nos melhores jogadores brasileiros de cada edição da Copa do Mundo, gerando um ranking histórico em tempo real.

## 3\. Contexto

A aplicação exibirá todas as edições da Copa do Mundo em que o Brasil participou (1930 a 2026). 

Para cada edição, haverá um duelo entre dois jogadores de destaque. O usuário escolhe seu favorito, o voto é computado no banco de dados e o ranking geral de todos os tempos é atualizado imediatamente na tela.

A stack tecnológica obrigatória é: **Next.js** (Front-end e rotas de API), **TypeScript** (Linguagem) e **Supabase** (Banco de dados e tempo real).

Não haverá sistema de login; a votação é aberta e anônima.

## 4\. Regras de Negócios

- Cada edição da copa apresenta exatamente dois jogadores, e cada jogador aparece apenas uma vez em todo o sistema (para garantir igualdade de chances de voto entre todos os participantes).  
- O usuário pode registrar apenas um voto por edição da copa.  
- O voto é definitivo e não pode ser alterado ou cancelado.  
- O ranking geral deve exibir apenas jogadores que possuam 1 ou mais votos.  
- Em caso de empate no número de votos no ranking, o jogador da copa mais recente fica na frente.

## 5\. Comportamentos

* Ao acessar a página, a lista de copas é carregada e a primeira edição é exibida.  
* Os cards dos jogadores exibem efeito visual ao passar o mouse (hover).  
    
* Ao clicar em um jogador, o card recebe um destaque visual imediato.  
    
* Após clicar em um botão de votação de uma edição, o voto será computado e os botões da edição votada serão desabilitados.  
    
* O contador de votos na tela incrementa \+1 instantaneamente.  
    
* A API recebe o voto, valida os dados da requisição e verifica se o usuário já votou naquela edição usando identificação anônima (token de sessão).  
    
* Se válido, atualiza o contador no Supabase (+1) e retorna confirmação.  
    
* Calcula a ordenação do ranking aplicando a regra de desempate pelo ano mais recente.  
    
* Enquanto o voto é processado, o front-end exibe um estado de carregamento (spinner).  
    
* Ao receber a confirmação do back-end, remove o spinner e aplica o destaque visual definitivo.  
    
* O ranking é atualizado em tempo real na tela de todos os usuários conectados via Supabase Realtime.  
    
* O ranking na coluna da direita é atualizado em tempo real com o novo voto.