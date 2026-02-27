# 🎨 Assets e Identidade Visual

## Logo Gracie Barra

Para adicionar a logo oficial da Gracie Barra:

1. Baixe a logo oficial do [manual de marca da Gracie Barra](https://www.graciebarra.com/)
2. Adicione os seguintes arquivos na pasta `assets/`:

```
assets/
├── icon.png            (1024x1024px)
├── adaptive-icon.png   (1024x1024px)
├── splash.png          (1242x2436px)
├── favicon.png         (48x48px)
└── logo-gb.png         (transparente, alta resolução)
```

## Cores Oficiais GB

### Principais

- **Vermelho GB**: `#E31E24` (RGB: 227, 30, 36)
- **Branco**: `#FFFFFF`
- **Preto**: `#000000`

### Complementares

- **Azul**: `#1E88E5`
- **Cinza Claro**: `#F5F5F5`

## Tipografia

A Gracie Barra utiliza:

- **Título**: Roboto Bold / System Bold
- **Corpo**: Roboto Regular / System Regular
- **Caption**: Roboto Light / System Light

## Especificações dos Cartões de Presença

### Dimensões Físicas (para referência)

- Tamanho: 8.5cm x 5.5cm (padrão cartão de visita)
- Orientação: Horizontal

### Elementos do Cartão Digital

1. **Header**: Logo GB centralizada
2. **Nome do Aluno**: Fonte grande, negrito
3. **Faixa Atual**: Com indicador visual
4. **Graus**: Bolinhas preenchidas
5. **Grid de Presença**: 40 pontos (8x5)
6. **Barra de Progresso**: Visual para próxima graduação
7. **Datas**: Última e próxima graduação

## Screenshots Recomendadas

Para publicar nas lojas, você precisará de:

### iPhone (iOS)

- 6.5" (1242 x 2688 pixels) - iPhone 13 Pro Max
- 5.5" (1242 x 2208 pixels) - iPhone 8 Plus

### Android

- Phone (1080 x 1920 pixels)
- 7" Tablet (1200 x 1920 pixels)
- 10" Tablet (2048 x 2732 pixels)

### Conteúdo das Screenshots

1. **Tela de Login** - Mostrando a logo GB
2. **Check-in** - Aluno vendo horários disponíveis
3. **Cartão Digital** - Mostrando o cartão colorido
4. **Dashboard Admin** - Check-ins pendentes
5. **Gestão de Alunos** - Lista de alunos

## Diretrizes de Design

### Espaçamento

- Pequeno: 8px
- Médio: 16px
- Grande: 24px
- Extra Grande: 32px

### Bordas

- Cards: 12px border-radius
- Botões: 8px border-radius
- Inputs: 8px border-radius

### Sombras

```css
/* Card padrão */
shadowColor: '#000',
shadowOffset: { width: 0, height: 2 },
shadowOpacity: 0.1,
shadowRadius: 4,
elevation: 2

/* Card elevado */
shadowColor: '#000',
shadowOffset: { width: 0, height: 4 },
shadowOpacity: 0.3,
shadowRadius: 8,
elevation: 8
```

## Ícones

Use ícones simples e minimalistas:

- Check: ✓
- Cross: ✕
- Profile: 👤
- Stats: 📊
- Students: 👥
- Calendar: 📅
- Belt: 🥋

Ou use bibliotecas como:

- [Ionicons](https://ionic.io/ionicons)
- [Material Icons](https://fonts.google.com/icons)
- [Font Awesome](https://fontawesome.com/)

## Animações

### Recomendadas

- Fade in ao carregar
- Slide ao navegar
- Scale ao tocar botões
- Shimmer ao carregar dados

### Bibliotecas

```bash
npm install react-native-animatable
npm install lottie-react-native
```

## Acessibilidade

- Contraste mínimo: 4.5:1
- Tamanho mínimo de toque: 44x44px
- Labels em todos os inputs
- Alt text em imagens
- Suporte a leitores de tela

## Dark Mode (Futuro)

Se implementar dark mode:

```javascript
// Cores dark
const DARK_COLORS = {
  background: "#121212",
  surface: "#1E1E1E",
  text: "#FFFFFF",
  textSecondary: "#B0B0B0",
  primary: "#E31E24", // Mantém vermelho GB
};
```

## Exemplo de Cartão Digital Colorido

### Faixa Branca (0-2 graus)

- Background: Azul claro (#81D4FA)
- Texto: Preto
- Bolinhas grau: Vermelho GB

### Faixa Azul até Preta

- Background: Preto (#212121)
- Texto: Branco
- Bolinhas grau: Vermelho GB

## Formatação de Datas

Use formato brasileiro:

```javascript
const formatDate = (date) => {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Resultado: 27/02/2026
```

## Mensagens e Textos

### Tom de Voz

- Motivacional
- Respeitoso
- Claro e direto
- Profissional

### Exemplos

✅ "Pronto para treinar hoje?"
✅ "Parabéns! Mais uma aula concluída!"
✅ "Confirme a presença do aluno"

❌ "Você não tem aulas"
❌ "Erro desconhecido"
❌ "Ops, algo deu errado"

## Placeholder para Dados Vazios

```javascript
const EmptyState = () => (
  <View style={styles.emptyState}>
    <Text style={styles.emoji}>🥋</Text>
    <Text style={styles.message}>Nenhum check-in pendente</Text>
    <Text style={styles.submessage}>
      Quando alunos fizerem check-in, eles aparecerão aqui
    </Text>
  </View>
);
```

---

**Lembre-se**: A consistência visual é fundamental. Use sempre as cores e espaçamentos definidos em `theme.js`.
