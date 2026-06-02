export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface Lesson {
  id: number;
  title: string;
  summary: string;
  iconName: string;
  points: string[];
  quiz: QuizQuestion[];
}

export interface OdooLocation {
  id: string;
  name: string;
  parent: string;
  type: "internal" | "view" | "virtual";
}

export interface OdooProduct {
  id: string;
  name: string;
  storable: boolean;
  type: "storable" | "consumable" | "service";
  category: string;
  internalRef: string;
  price: number;
  cost: number;
  canBeSold: boolean;
  canBeBought: boolean;
}

export interface SimulatorState {
  hasLoggedIn: boolean;
  settingsActivatedLocations: boolean;
  warehouses: { id: string; name: string; code: string }[];
  locations: OdooLocation[];
  products: OdooProduct[];
  activeStep: number; // 0: login, 1: dashboard, 2: settings, 3: locations, 4: products, 5: completed
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
}
