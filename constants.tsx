
import { Event, User, Artist, Ad, VideoHighlight } from './types';

export const TRANSLATIONS = {
  pt: {
    heroTitle: "Descubra os melhores eventos em Moçambique",
    heroSubtitle: "Compre seus bilhetes de forma rápida e segura com M-Pesa, e-Mola e cartões locais.",
    searchPlaceholder: "Pesquisar eventos, artistas ou locais...",
    categories: "Categorias",
    featured: "Eventos em Destaque",
    buyTickets: "Comprar Bilhetes",
    cart: "Meu Darling",
    checkout: "Finalizar Compra",
    myTickets: "Meus Bilhetes",
    profile: "Perfil",
    login: "Entrar",
    register: "Registar",
    paymentMethod: "Método de Pagamento",
    completePayment: "Completar Pagamento",
    success: "Sucesso!",
    successMessage: "Seu bilhete foi gerado com sucesso.",
    downloadTicket: "Baixar Bilhete",
    adminPanel: "Painel Admin",
    wishlist: "Favoritos",
    noWishlist: "A sua lista de favoritos está vazia.",
    all: "Tudo",
    concert: "Concerto",
    theater: "Teatro",
    festival: "Festival",
    business: "Negócios",
    filterDate: "Filtrar por data",
    ticketsLeft: "Restam {count} bilhetes",
    ticketsLeftSingular: "Resta {count} bilhete"
  },
  en: {
    heroTitle: "Discover the best events in Mozambique",
    heroSubtitle: "Buy your tickets quickly and safely with M-Pesa, e-Mola, and local cards.",
    searchPlaceholder: "Search events, artists, or venues...",
    categories: "Categories",
    featured: "Featured Events",
    buyTickets: "Buy Tickets",
    cart: "My Darling",
    checkout: "Checkout",
    myTickets: "My Tickets",
    profile: "Profile",
    login: "Login",
    register: "Register",
    paymentMethod: "Payment Method",
    completePayment: "Complete Payment",
    success: "Success!",
    successMessage: "Your ticket has been generated successfully.",
    downloadTicket: "Download Ticket",
    adminPanel: "Admin Panel",
    wishlist: "Wishlist",
    noWishlist: "Your wishlist is empty.",
    all: "All",
    concert: "Concert",
    theater: "Theater",
    festival: "Festival",
    business: "Business",
    filterDate: "Filter by date",
    ticketsLeft: "{count} tickets left",
    ticketsLeftSingular: "{count} ticket left"
  }
};

export const MOCK_EVENTS: Event[] = [
  {
    id: '1',
    title: 'Festival da Marrabenta 2024',
    category: 'festival',
    description: 'A maior celebração da música tradicional moçambicana com artistas de renome nacional e internacional.',
    date: '2024-12-15T18:00:00Z',
    location: 'Centro Cultural Franco-Moçambicano',
    city: 'Maputo',
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=800&h=400',
    organizer: 'C&O Entretenimento',
    coordinates: { lat: -25.9692, lng: 32.5732 },
    ticketTypes: [
      { id: 't1_normal', name: 'Bilhete Normal', price: 1500, available: 500, description: 'Acesso à pista geral e zona de restauração.' },
      { id: 't1_vip', name: 'Bilhete VIP', price: 4500, available: 100, description: 'Acesso frontal, zona exclusiva e 3 bebidas de boas-vindas.' }
    ]
  },
  {
    id: '3',
    title: 'Mr. Bow Live: King of Mozambique',
    category: 'concert',
    description: 'O espectáculo mais esperado do ano. Mr. Bow apresenta os seus maiores sucessos com convidados especiais.',
    date: '2024-12-30T21:00:00Z',
    location: 'Pavilhão do Maxaquene',
    city: 'Maputo',
    image: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&q=80&w=800&h=400',
    organizer: 'Bawito Music',
    coordinates: { lat: -25.9650, lng: 32.5780 },
    ticketTypes: [
      { id: 't3_normal', name: 'Pista Normal', price: 1000, available: 2000, description: 'Acesso à pista principal.' },
      { id: 't3_vip', name: 'VIP Gold Lounge', price: 6500, available: 80, description: 'Lounge elevado, Open Bar até às 23h e kit Bawito.' }
    ]
  },
  {
    id: '6',
    title: 'Beach Party Bilene 2024',
    category: 'festival',
    description: 'A festa de areia branca que marca o fim de ano na Lagoa do Bilene. DJs nacionais e internacionais.',
    date: '2024-12-28T14:00:00Z',
    location: 'Praia do Bilene',
    city: 'Bilene',
    image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=800&h=400',
    organizer: 'Gaza Vibes',
    coordinates: { lat: -25.2667, lng: 33.2333 },
    ticketTypes: [
      { id: 't6_normal', name: 'Acesso Geral', price: 1200, available: 1500, description: 'Passe de dia único para a praia.' },
      { id: 't6_vip', name: 'VIP Sand Stage', price: 3500, available: 150, description: 'Acesso ao palco principal, zona de sombra e bar exclusivo.' }
    ]
  },
  {
    id: '2',
    title: 'Noite de Stand-up Comedy',
    category: 'theater',
    description: 'Gargalhadas garantidas com os melhores comediantes nacionais num ambiente intimista.',
    date: '2024-11-20T20:00:00Z',
    location: 'Cine-Teatro Gil Vicente',
    city: 'Maputo',
    image: 'https://images.unsplash.com/photo-1585699324551-f6c309eedee5?auto=format&fit=crop&q=80&w=800&h=400',
    organizer: 'Maputo Comedy Club',
    coordinates: { lat: -25.9712, lng: 32.5745 },
    ticketTypes: [
      { id: 't2_normal', name: 'Plateia', price: 750, available: 200, description: 'Lugar sentado na plateia geral.' },
      { id: 't2_vip', name: 'Camarote VIP', price: 2000, available: 20, description: 'Melhor vista do palco e serviço de mesa.' }
    ]
  }
];

export const MOCK_ARTISTS: Artist[] = [
  {
    id: 'a1',
    name: 'Mr. Bow',
    photo: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400&h=400',
    bio: 'Conhecido como o Rei da Marrabenta Moderna, Mr. Bow é um dos artistas mais influentes de Moçambique, misturando ritmos tradicionais com pop contemporâneo.'
  },
  {
    id: 'a2',
    name: 'Lizha James',
    photo: 'https://images.unsplash.com/photo-1516715662728-7c62ee4150a8?auto=format&fit=crop&q=80&w=400&h=400',
    bio: 'Diva da música moçambicana, Lizha James é famosa pelo seu estilo enérgico e fusão de Marrabenta, Reggae e R&B.'
  }
];

export const MOCK_VIDEOS: VideoHighlight[] = [
  {
    id: 'v1',
    title: 'Aftermovie Festival da Marrabenta',
    description: 'Os melhores momentos da edição passada.',
    type: 'link',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=800&h=450',
    active: true
  },
  {
    id: 'v2',
    title: 'Mr. Bow - Especial Live',
    description: 'Um ensaio exclusivo para o grande show.',
    type: 'link',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&q=80&w=800&h=450',
    active: true
  },
  {
    id: 'v3',
    title: 'Vibes de Verão Bilene',
    description: 'O sol, a praia e a música que você ama.',
    type: 'link',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800&h=450',
    active: true
  }
];

export const MOCK_ADS: Ad[] = [
  {
    id: 'ad1',
    title: 'Desconto M-Pesa 10%',
    imageUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=800&h=300',
    link: '#',
    active: true
  }
];
