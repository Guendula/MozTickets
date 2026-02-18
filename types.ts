
export type Language = 'pt' | 'en';
export type UserRole = 'admin' | 'staff' | 'user';

export interface Event {
  id: string;
  title: string;
  category: 'concert' | 'theater' | 'festival' | 'business';
  description: string;
  date: string;
  location: string;
  city: string;
  image: string;
  organizer: string;
  ticketTypes: TicketType[];
  artistId?: string; // ID do artista associado
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface TicketType {
  id: string;
  name: string;
  price: number;
  available: number;
  description: string;
}

export interface CartItem {
  event: Event;
  ticketType: TicketType;
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  gender?: 'Masculino' | 'Feminino' | 'Outro' | '';
  age?: number | string;
}

export interface Artist {
  id: string;
  name: string;
  photo: string;
  bio: string;
}

export interface VideoHighlight {
  id: string;
  title: string;
  description: string;
  type: 'link' | 'upload';
  url: string;
  thumbnail: string;
  active: boolean;
}

export type PaymentMethod = 'mpesa' | 'emola' | 'mkesh' | 'card' | 'bank_transfer';

export interface ValidationRecord {
  checkpoint: string;
  timestamp: string;
  staffId: string;
}

export interface Purchase {
  id: string;
  userId: string;
  eventId: string;
  eventTitle: string;
  date: string;
  total: number;
  method: PaymentMethod;
  tickets: {
    type: string;
    quantity: number;
    price: number;
  }[];
  qrCode: string;
  status: 'completed' | 'pending' | 'failed' | 'validated';
  validations?: ValidationRecord[];
}

export interface Ad {
  id: string;
  title: string;
  imageUrl: string;
  link: string;
  active: boolean;
}

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  page: string;
}

export interface Province {
  id: string;
  name: string;
}

export interface PageContent {
  id: string;
  title: string;
  content: string;
}
