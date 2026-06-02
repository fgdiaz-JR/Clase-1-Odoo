import React, { useState, useEffect, useRef, FormEvent } from "react";
import {
  Truck,
  GitCommit,
  Workflow,
  Compass,
  Layers,
  Settings,
  Package,
  CheckCircle,
  AlertTriangle,
  X,
  ChevronRight,
  ChevronLeft,
  Send,
  Database,
  MapPin,
  RotateCcw,
  Sparkles,
  Menu,
  BookOpen,
  Check,
  Award,
  ExternalLink,
  Lock,
  Plus,
  Lightbulb,
  Warehouse
} from "lucide-react";
import { lessonsData } from "./data/lessons";
import { Lesson, OdooLocation, OdooProduct, ChatMessage, SimulatorState } from "./types";

const simulatorHints = [
  {
    step: 0,
    title: "Paso 1: Iniciar Sesión en Odoo",
    shortHint: "Inicia sesión con las credenciales sugeridas o presionando el botón 'Auto-llenar'.",
    detailedHint: "Ingresa el correo electrónico 'admin@odoo-edu.com' y la contraseña 'odoo2026', luego haz clic en 'Iniciar Sesión'. También puedes automatizarlo pulsando el botón morado 'Auto-llenar credenciales' que aparece debajo del formulario de acceso."
  },
  {
    step: 1,
    title: "Paso 2: Activar Ubicaciones de Almacenamiento en Ajustes",
    shortHint: "Activa e ingresa en los ajustes para habilitar ubicaciones físicas en el módulo de Inventario.",
    detailedHint: "Navega al ícono de 'Ajustes' (engranaje) en el escritorio de Odoo. Desplaza la página de configuración hasta la sección de 'Almacén' y activa la casilla 'Ubicaciones de almacenamiento'. Finalmente haz clic en el botón morado superior 'Guardar'."
  },
  {
    step: 2,
    title: "Paso 3: Crear tu Almacén Central (AC)",
    shortHint: "Ingresa a Configuración > Almacenes y registra un nuevo Almacén Central.",
    detailedHint: "Ve a Configuración > Almacenes en la barra de menú superior de Odoo. Haz clic en el botón morado 'Nuevo', ingresa exactamente de Nombre de almacén: 'Almacén Central' (o 'Almacen Central') y en Código Corto introduce 'AC'. Haz clic en 'Guardar'. Al hacerlo, Odoo inicializa por defecto las direcciones base de ubicaciones física como 'AC' y 'AC/Stock'."
  },
  {
    step: 3,
    title: "Paso 4: Crear la Ubicación 'Pasillo A' bajo de AC/Stock",
    shortHint: "Navega a Configuración > Ubicaciones y crea la ubicación interna 'Pasillo A' bajo el almacén central.",
    detailedHint: "Ve a Configuración > Ubicaciones en la barra de menú. Haz clic en el botón 'Nuevo' y escribe Nombre de la ubicación: 'Pasillo A'. En Ubicación Padre, selecciona 'AC/Stock' (porque pertenece a nuestro nuevo Almacén Central) y en Tipo de ubicación selecciona 'Ubicación interna'. Pulsa 'Guardar'."
  },
  {
    step: 4,
    title: "Paso 5: Crear el Producto Almacenable 'Escritorio de Madera Premium'",
    shortHint: "Registra la ficha técnica exacta del producto con su referencia interna, precio de venta y costo.",
    detailedHint: "Navega a Productos en la barra de menú. Haz clic en 'Nuevo'. Llena los campos obligatorios exactamente así: Nombre del Producto: 'Escritorio de Madera Premium', Tipo de producto: 'Producto Almacenable' (Storable), Referencia Interna: 'MUE-ESC-001', Precio de venta: '150.00', Costo: '80.00'. Asegúrate de marcar los checks de 'Puede ser vendido' y 'Puede ser comprado', luego haz clic en 'Guardar'."
  },
  {
    step: 5,
    title: "¡Práctica Completada de manera Exitosa!",
    shortHint: "¡Felicitaciones! Has configurado con éxito un almacén digital logístico de Odoo.",
    detailedHint: "Has completado satisfactoriamente los 5 pasos interactivos del simulador de Odoo: 1) Login, 2) Ajustes habilitados, 3) Creación de Almacén Central (AC), 4) Jerarquía de ubicaciones físicas (Pasillo A), 5) Ficha del producto ('Escritorio de Madera Premium'). Puedes reiniciar la BD si deseas practicar nuevamente desde cero."
  }
];

export default function App() {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<"teoria" | "simulador">("teoria");
  const [showTutorChat, setShowTutorChat] = useState<boolean>(true);
  
  // Lesson state
  const [currentLessonIndex, setCurrentLessonIndex] = useState<number>(0);
  const [completedQuizzes, setCompletedQuizzes] = useState<{ [key: string]: boolean }>({});
  const [quizScores, setQuizScores] = useState<{ [key: string]: number }>({}); // q_id -> optionIndex selected
  const [quizSubmitted, setQuizSubmitted] = useState<{ [key: string]: boolean }>({});
  const [completedLessons, setCompletedLessons] = useState<{ [key: number]: boolean }>({});
  const [studentCertName, setStudentCertName] = useState("Estudiante de Logística");
  const [showCertificate, setShowCertificate] = useState(false);

  // Simulator state
  const [simState, setSimState] = useState<SimulatorState>({
    hasLoggedIn: false,
    settingsActivatedLocations: false,
    warehouses: [
      { id: "wh_main", name: "YourCompany", code: "WH" }
    ],
    locations: [
      { id: "loc_wh", name: "WH", parent: "", type: "view" },
      { id: "loc_stock", name: "Stock", parent: "WH", type: "view" },
      { id: "loc_virtual_scrap", name: "Scrap", parent: "Virtual Locations", type: "virtual" },
      { id: "loc_virtual_customers", name: "Customers", parent: "Virtual Locations", type: "virtual" }
    ],
    products: [
      {
        id: "prod_sample",
        name: "Clavos de Acero 2mm",
        storable: false,
        type: "consumable",
        category: "All",
        internalRef: "AUX-CLA-002",
        price: 2.5,
        cost: 1.0,
        canBeSold: true,
        canBeBought: true
      }
    ],
    activeStep: 0 // 0: Login, 1: Dashboard, 2: Ajustes, 3: Ubicaciones, 4: Productos, 5: Completado
  });

  // Simulator interactive forms state
  const [loginEmail, setLoginEmail] = useState("admin@odoo-edu.com");
  const [loginPass, setLoginPass] = useState("odoo2026");
  const [loginError, setLoginError] = useState("");
  
  // For Simulator step 2: setting page switch
  const [simMenuSection, setSimMenuSection] = useState<"dashboard" | "ajustes" | "inventario" | "ubicaciones" | "productos_list" | "producto_form" | "ubicacion_form" | "almacenes" | "almacen_form">("dashboard");
  const [settingsCheckLocations, setSettingsCheckLocations] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // For Simulator Warehouse Creation (New Step)
  const [whFormName, setWhFormName] = useState("");
  const [whFormCode, setWhFormCode] = useState("");
  const [whValidationMessage, setWhValidationMessage] = useState("");

  // Hint overlay helper state
  const [showActiveHint, setShowActiveHint] = useState<boolean>(false);
  const [showOdooConfigDropdown, setShowOdooConfigDropdown] = useState<boolean>(false);

  // For Simulator step 3: location creation form
  const [locFormName, setLocFormName] = useState("");
  const [locFormParent, setLocFormParent] = useState("WH/Stock");
  const [locFormType, setLocFormType] = useState<"internal" | "view" | "virtual">("internal");
  const [locValidationMessage, setLocValidationMessage] = useState("");

  // For Simulator step 4: product creation form
  const [prodFormName, setProdFormName] = useState("");
  const [prodFormType, setProdFormType] = useState<"storable" | "consumable" | "service">("storable");
  const [prodFormRef, setProdFormRef] = useState("");
  const [prodFormPrice, setProdFormPrice] = useState<number>(0);
  const [prodFormCost, setProdFormCost] = useState<number>(0);
  const [prodFormSold, setProdFormSold] = useState(true);
  const [prodFormBought, setProdFormBought] = useState(true);
  const [prodValidationMessage, setProdValidationMessage] = useState("");

  // Tutor Chat state
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem("odoo_lessons_chat");
    return saved ? JSON.parse(saved) : [
      {
        id: "welcome",
        role: "model",
        text: "¡Hola! Soy tu **Tutor de Odoo y Logística**. Te daré soporte en esta clase introductoria.\n\n" +
          "Puedo explicarte los conceptos de las **5 R's**, los **flujos progresivos y regresivos**, " +
          "el **inventario de partida doble en Odoo**, o ayudarte paso a paso con la actividad práctica.\n\n" +
          "¿En qué te puedo asesorar hoy?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Synchronize browser tab title for Clase 1
  useEffect(() => {
    document.title = "Clase 1: Introducción a la Logística y al Módulo de Inventario - Odoo WMS";
  }, []);

  // Auto-saved chat to localStorage
  useEffect(() => {
    localStorage.setItem("odoo_lessons_chat", JSON.stringify(chatMessages));
  }, [chatMessages]);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isChatLoading]);

  // Get current active lesson
  const currentLesson: Lesson = lessonsData[currentLessonIndex];

  // Map icon name to React element
  const getIcon = (name: string, className = "w-5 h-5") => {
    switch (name) {
      case "Truck": return <Truck className={className} />;
      case "GitCommit": return <GitCommit className={className} />;
      case "Workflow": return <Workflow className={className} />;
      case "Compass": return <Compass className={className} />;
      case "Layers": return <Layers className={className} />;
      case "Settings": return <Settings className={className} />;
      case "Package": return <Package className={className} />;
      default: return <BookOpen className={className} />;
    }
  };

  // Chat API Call
  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || chatInput;
    if (!query.trim()) return;

    // Append user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    if (!textToSend) setChatInput("");
    setIsChatLoading(true);
    setChatError("");

    try {
      // Map chat history for the backend
      const history = chatMessages.map(m => ({
        role: m.role,
        text: m.text
      }));

      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query, history })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al conectar con la IA.");
      }

      const modelMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        role: "model",
        text: data.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, modelMsg]);
    } catch (err: any) {
      console.error(err);
      setChatError(err.message || "No se pudo obtener respuesta del tutor de IA.");
      
      // Fallback response for offline/demo model when API key is not ready
      const fallbackMsg: ChatMessage = {
        id: `fallback-${Date.now()}`,
        role: "model",
        text: "**[Modo Demo Activo]** " + 
          "El Tutor virtual se encuentra en modo alternativo local. " +
          "Aquí tienes información clave sobre Odoo:\n\n" +
          "📚 Para activar las ubicaciones, debes ir a **Ajustes**, bajar hasta la sección **Almacén** y marcar **Ubicaciones de Almacenamiento**. " +
          "Luego haz clic en **Guardar**.\n\n" +
          "🎯 En el simulador, puedes proceder al siguiente paso ingresando las credenciales predeterminadas:\n" +
          "• **Email**: `admin@odoo-edu.com` \n" +
          "• **Contraseña**: `odoo2026`\n\n" +
          "Si tienes configurada tu clave de GEMINI_API_KEY en la sección Secrets de AI Studio, tendrías soporte ilimitado de lenguaje natural interactivo. ¡Por favor pregúntame de todos modos!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Hotkeys / Presets for chat
  const triggerQuickTopic = (topic: string) => {
    handleSendMessage(topic);
  };

  // Submit Quiz helper
  const handleSelectQuizOption = (e: React.MouseEvent | undefined, qId: string, optionIdx: number) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setQuizScores(prev => ({ ...prev, [qId]: optionIdx }));
  };

  const handleVerifyQuiz = (e: React.MouseEvent | undefined, qId: string, correctAnswerIdx: number) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const selectedIdx = quizScores[qId];
    if (selectedIdx === undefined) return;

    setQuizSubmitted(prev => ({ ...prev, [qId]: true }));
    if (selectedIdx === correctAnswerIdx) {
      setCompletedQuizzes(prev => ({ ...prev, [qId]: true }));
    }
  };

  // Check if current lesson's quizzes are all passed
  const isLessonQuizComplete = (lesson: Lesson) => {
    return lesson.quiz.every(q => completedQuizzes[q.id]);
  };

  const handleMarkLessonRead = (lessonId: number) => {
    setCompletedLessons(prev => {
      const updated = { ...prev, [lessonId]: true };
      return updated;
    });
  };

  // SIMULATOR ACTIONS
  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (loginEmail === "admin@odoo-edu.com" && loginPass === "odoo2026") {
      setSimState(prev => ({ ...prev, hasLoggedIn: true, activeStep: Math.max(prev.activeStep, 1) }));
      setSimMenuSection("dashboard");
      setLoginError("");
    } else {
      setLoginError("Credenciales incorrectas. Prueba con admin@odoo-edu.com / odoo2026");
    }
  };

  const handleAutoFillLogin = () => {
    setLoginEmail("admin@odoo-edu.com");
    setLoginPass("odoo2026");
  };

  const handleToggleSettingsLocation = () => {
    setSettingsCheckLocations(!settingsCheckLocations);
  };

  const handleSaveSettings = () => {
    setSettingsSaved(true);
    if (settingsCheckLocations) {
      setSimState(prev => ({ 
        ...prev, 
        settingsActivatedLocations: true,
        activeStep: Math.max(prev.activeStep, 2)
      }));
    }
    // Return to dashboard
    setSimMenuSection("dashboard");
  };

  const handleWarehouseSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!whFormName.trim()) {
      setWhValidationMessage("El nombre del almacén es obligatorio.");
      return;
    }
    if (!whFormCode.trim()) {
      setWhValidationMessage("El código corto es obligatorio.");
      return;
    }

    const cleanName = whFormName.trim();
    const cleanCode = whFormCode.trim().toUpperCase();

    const isCorrectName = cleanName.toLowerCase().includes("almacén central") || cleanName.toLowerCase() === "almacén central" || cleanName.toLowerCase() === "almacen central";
    const isCorrectCode = cleanCode === "AC";

    if (isCorrectName && isCorrectCode) {
      const newWh = {
        id: `wh_${Date.now()}`,
        name: cleanName,
        code: cleanCode
      };

      // Al crear un nuevo almacén, Odoo inicializa por defecto la ubicación jerárquica del mismo
      const baseLoc = {
        id: `loc_ac_base`,
        name: cleanCode,
        parent: "",
        type: "view" as const
      };
      const stockLoc = {
        id: `loc_ac_stock`,
        name: "Stock",
        parent: cleanCode,
        type: "internal" as const
      };

      setSimState(prev => ({
        ...prev,
        warehouses: [...prev.warehouses, newWh],
        locations: [...prev.locations, baseLoc, stockLoc],
        activeStep: Math.max(prev.activeStep, 3)
      }));

      setWhValidationMessage("");
      alert(`¡Almacén '${cleanName}' [${cleanCode}] creado con éxito! Se han inicializado las ubicaciones '${cleanCode}' y '${cleanCode}/Stock' automáticamente.`);
      setSimMenuSection("inventario");
    } else {
      let errors = [];
      if (!isCorrectName) errors.push("El nombre del almacén debe ser 'Almacén Central'");
      if (!isCorrectCode) errors.push("El código corto debe ser 'AC'");
      setWhValidationMessage("Revisa las instrucciones de la práctica: " + errors.join(", ") + ".");
    }
  };

  const handleLocationSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!locFormName.trim()) {
      setLocValidationMessage("El nombre de la ubicación no puede estar vacío.");
      return;
    }

    const cleanName = locFormName.trim();
    const isPasilloA = cleanName.toLowerCase() === "pasillo a";
    const isCorrectParent = locFormParent === "AC/Stock" || locFormParent === "WH/Stock";
    const isCorrectType = locFormType === "internal";

    if (isPasilloA && isCorrectParent && isCorrectType) {
      // Create location
      const newLoc: OdooLocation = {
        id: `loc_${Date.now()}`,
        name: cleanName,
        parent: locFormParent,
        type: locFormType
      };

      setSimState(prev => ({
        ...prev,
        locations: [...prev.locations, newLoc],
        activeStep: Math.max(prev.activeStep, 4)
      }));

      setLocValidationMessage("");
      setSimMenuSection("inventario");
      alert(`¡Ubicación 'Pasillo A' creada correctamente dentro de ${locFormParent}!`);
    } else {
      let errors = [];
      if (!isPasilloA) errors.push("El nombre de la ubicación debe ser exactamente 'Pasillo A'");
      if (!isCorrectParent) errors.push("La ubicación Padre debe ser 'AC/Stock' (o 'WH/Stock')");
      if (!isCorrectType) errors.push("El tipo de ubicación debe ser 'Ubicación interna'");
      setLocValidationMessage("Revisa las instrucciones de la práctica: " + errors.join(", "));
    }
  };

  const handleProductSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!prodFormName.trim()) {
      setProdValidationMessage("El nombre del producto es obligatorio.");
      return;
    }

    const cleanName = prodFormName.trim();
    const isCorrectName = cleanName.toLowerCase().includes("escritorio de madera premium") || cleanName.toLowerCase() === "escritorio de madera premium";
    const isStorable = prodFormType === "storable";
    const isCorrectRef = prodFormRef.trim().toUpperCase() === "MUE-ESC-001";
    const isCorrectPrice = Number(prodFormPrice) === 150;
    const isCorrectCost = Number(prodFormCost) === 80;

    if (isCorrectName && isStorable && isCorrectRef && isCorrectPrice && isCorrectCost) {
      const newProd: OdooProduct = {
        id: `prod_${Date.now()}`,
        name: cleanName,
        storable: true,
        type: "storable",
        category: "All",
        internalRef: prodFormRef.trim().toUpperCase(),
        price: Number(prodFormPrice),
        cost: Number(prodFormCost),
        canBeSold: prodFormSold,
        canBeBought: prodFormBought
      };

      setSimState(prev => ({
        ...prev,
        products: [...prev.products, newProd],
        activeStep: Math.max(prev.activeStep, 5) // Completa satisfactoriamente los pasos
      }));

      setProdValidationMessage("");
      setSimMenuSection("dashboard");
      alert("¡Producto 'Escritorio de Madera Premium' guardado correctamente!");
    } else {
      let errors = [];
      if (!isCorrectName) errors.push("Nombre debe ser 'Escritorio de Madera Premium'");
      if (!isStorable) errors.push("Tipo debe ser 'Producto Almacenable' (Storable)");
      if (!isCorrectRef) errors.push("La Referencia Interna debe ser 'MUE-ESC-001'");
      if (!isCorrectPrice) errors.push("El precio de venta debe ser 150.00");
      if (!isCorrectCost) errors.push("El costo debe ser 80.00");
      setProdValidationMessage("Asegúrate de llenar los datos idénticos la guía: " + errors.join(". "));
    }
  };

  const handleResetSimulator = () => {
    if (confirm("¿Estás seguro de reiniciar el simulador? Se borrarán el almacén, la ubicación y los productos creados.")) {
      setSimState({
        hasLoggedIn: false,
        settingsActivatedLocations: false,
        warehouses: [{ id: "wh_main", name: "YourCompany", code: "WH" }],
        locations: [
          { id: "loc_wh", name: "WH", parent: "", type: "view" },
          { id: "loc_stock", name: "Stock", parent: "WH", type: "view" },
          { id: "loc_virtual_scrap", name: "Scrap", parent: "Virtual Locations", type: "virtual" },
          { id: "loc_virtual_customers", name: "Customers", parent: "Virtual Locations", type: "virtual" }
        ],
        products: [
          {
            id: "prod_sample",
            name: "Clavos de Acero 2mm",
            storable: false,
            type: "consumable",
            category: "All",
            internalRef: "AUX-CLA-002",
            price: 2.5,
            cost: 1.0,
            canBeSold: true,
            canBeBought: true
          }
        ],
        activeStep: 0
      });
      setSettingsCheckLocations(false);
      setSettingsSaved(false);
      setWhFormName("");
      setWhFormCode("");
      setWhValidationMessage("");
      setLocFormName("");
      setLocFormParent("WH/Stock");
      setLocFormType("internal");
      setProdFormName("");
      setProdFormType("storable");
      setProdFormRef("");
      setProdFormPrice(0);
      setProdFormCost(0);
      setSimMenuSection("dashboard");
      setShowActiveHint(false);
    }
  };

  const handleResetQuizzes = () => {
    if (confirm("¿Estás seguro de reiniciar todas las respuestas de los mini-quizzes? Podrás realizarlos nuevamente para mejorar tu calificación.")) {
      setQuizScores({});
      setQuizSubmitted({});
      setCompletedQuizzes({});
    }
  };

  // Stats
  const totalLessonsCount = lessonsData.length;
  const lessonsReadCount = Object.keys(completedLessons).length;
  
  const totalQuizzesCount = lessonsData.reduce((acc, l) => acc + l.quiz.length, 0);
  const quizPassedCount = Object.keys(completedQuizzes).length;

  const simStepsCompleted = simState.activeStep; // 0, 1, 2, 3, 4, 5 represents steps achieved

  const overallProgressPercent = Math.min(
    100,
    Math.round(
      ((lessonsReadCount / totalLessonsCount) * 40) +
      ((quizPassedCount / totalQuizzesCount) * 30) +
      ((simState.activeStep / 5) * 30)
    )
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-purple-600 selection:text-white" id="main_container">
      
      {/* HEADER BAR */}
      <header className="border-b border-slate-800 bg-slate-900 sticky top-0 z-40 px-4 py-3 shadow-md" id="header_section">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Course Info */}
          <div className="flex items-center space-x-3" id="logo_container">
            <div className="bg-purple-600 p-2.5 rounded-lg text-white shadow-lg shadow-purple-900/30 flex items-center justify-center">
              <Layers className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-white flex flex-wrap items-center gap-1.5 sm:gap-2">
                Odoo WMS Clase Interactiva
                <span className="text-[11px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-bold">
                  Clase 1
                </span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 sm:px-2.5 py-0.5 rounded-full font-semibold">
                  Logística Básica
                </span>
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-400 leading-tight mt-0.5">
                Curso: Logística con Odoo WMS (Clase 1: Introducción a la Logística y al Módulo de Inventario)
              </p>
            </div>
          </div>

          {/* Progress Indicators */}
          <div className="flex flex-wrap items-center gap-4 bg-slate-800/60 p-2 rounded-xl border border-slate-700/50" id="progress_section">
            <div className="text-center px-1">
              <span className="block text-[10px] text-slate-400 uppercase font-bold">Teoría</span>
              <span className="text-sm font-semibold text-purple-300">{lessonsReadCount}/{totalLessonsCount}</span>
            </div>
            <div className="w-[1px] h-6 bg-slate-700"></div>
            <div className="text-center px-1">
              <span className="block text-[10px] text-slate-400 uppercase font-bold">Pruebas</span>
              <span className="text-sm font-semibold text-emerald-400">{quizPassedCount}/{totalQuizzesCount}</span>
            </div>
            <div className="w-[1px] h-6 bg-slate-700"></div>
            <div className="text-center px-1">
              <span className="block text-[10px] text-slate-400 uppercase font-bold">Práctica</span>
              <span className="text-sm font-semibold text-sky-400">{simStepsCompleted}/5</span>
            </div>
            
            {/* Global progress bar */}
            <div className="flex items-center space-x-2 pl-2">
              <div className="w-16 md:w-24 bg-slate-700 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-emerald-400 h-full transition-all duration-500"
                  style={{ width: `${overallProgressPercent}%` }}
                ></div>
              </div>
              <span className="text-xs font-mono font-bold text-white whitespace-nowrap">
                {overallProgressPercent}% OK
              </span>
            </div>
          </div>

          {/* Main Module Switch Header Tabs */}
          <div className="flex flex-wrap items-center gap-2" id="tab_toggle_container">
            <div className="flex space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800/80" id="tab_toggle_section">
              <button
                onClick={() => setActiveTab("teoria")}
                className={`flex items-center space-x-2 px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all ${
                  activeTab === "teoria"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/10"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
                id="btn_tab_teoria"
              >
                <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>1. Temario</span>
              </button>
              <button
                onClick={() => setActiveTab("simulador")}
                className={`flex items-center space-x-2 px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all ${
                  activeTab === "simulador"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/10"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
                id="btn_tab_simulador"
              >
                <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>2. Simulador</span>
                {simStepsCompleted < 5 && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                )}
              </button>
            </div>

            <button
              onClick={() => setShowTutorChat(!showTutorChat)}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all shadow-md ${
                showTutorChat
                  ? "bg-purple-900/30 text-purple-300 border border-purple-500/30 hover:bg-purple-900/50"
                  : "bg-slate-950 text-slate-400 border border-slate-800/80 hover:text-slate-200 hover:bg-slate-900"
              }`}
              id="btn_toggle_tutor"
              title="Mostrar u ocultar el Consultor IA"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span>{showTutorChat ? "Ocultar Tutor" : "Preguntar al Tutor"}</span>
            </button>
          </div>

        </div>
      </header>

      {/* THREE-COLUMN LAYOUT OR SPLIT LAYOUT */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-5" id="main_columns_container">
        
        {/* LEFT COLUMN/S - MAIN CONTENT AREA */}
        <section className={`flex flex-col space-y-4 transition-all duration-300 ${showTutorChat ? "lg:col-span-8" : "lg:col-span-12"}`} id="main_content_area">
          
          {/* TAB 1: TEORIA O TEMARIO */}
          {activeTab === "teoria" && (
            <div className="flex flex-col gap-4" id="teoria_tab_view">
              
              {/* Horizontal Course Tracker */}
              <div className="grid grid-cols-2 md:grid-cols-7 gap-2" id="lessons_tracker_grid">
                {lessonsData.map((lesson, idx) => {
                  const isActive = currentLessonIndex === idx;
                  const isRead = completedLessons[lesson.id];
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => {
                        setCurrentLessonIndex(idx);
                        // Mark as read automatically when clicking
                        handleMarkLessonRead(lesson.id);
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all relative overflow-hidden group ${
                        isActive 
                          ? "bg-slate-800 border-purple-500 shadow-md shadow-purple-500/5 text-white" 
                          : "bg-slate-800/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-800/80"
                      }`}
                      id={`lesson_nav_btn_${lesson.id}`}
                    >
                      {/* Read indicator */}
                      <div className="absolute top-1.5 right-1.5 flex items-center space-x-1">
                        {isRead && <span className="w-1.5 h-1.5 rounded-full bg-purple-500" title="Leído"></span>}
                        {isLessonQuizComplete(lesson) && <Check className="w-3.5 h-3.5 text-emerald-400" title="Quiz superado" />}
                      </div>

                      <div className="text-[10px] uppercase font-bold text-slate-500 block">Tema 0{lesson.id}</div>
                      <div className="text-xs font-semibold truncate mt-0.5 text-slate-200 group-hover:text-white transition-colors">{lesson.title.split(".")[1]?.trim() || lesson.title}</div>
                    </button>
                  );
                })}
              </div>

              {/* QUIZ GRADING REPORT CARD AND LOGISTICS CERTIFICATE SECTION */}
              <div className="bg-slate-850/90 rounded-2xl border border-purple-500/20 p-5 md:p-6 text-left shadow-xl" id="quiz_grading_report_card">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700/50 pb-4 mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl text-white shadow-md shadow-purple-900/40">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        Libreta de Calificaciones Académica
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold font-mono">
                          Oficial WMS
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400">Inspecciona y evalúa en tiempo real tus respuestas en los mini-quizzes de cada tema</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleResetQuizzes}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs bg-slate-900 hover:bg-slate-950 border border-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer"
                      id="btn_reset_quizzes"
                      title="Reiniciar todas las evaluaciones para volver a intentarlo"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                      <span>Reiniciar Pruebas</span>
                    </button>
                  </div>
                </div>

                {/* Score Summary Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch mb-4" id="grading_metrics_grid">
                  
                  {/* Digital Score Round Badge */}
                  <div className="md:col-span-4 bg-slate-950/60 rounded-xl p-4 border border-slate-800/80 flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/5 rounded-full blur-xl"></div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2">Puntaje Logístico</span>
                    
                    <div className="relative flex items-center justify-center">
                      {/* Circle Background */}
                      <svg className="w-24 h-24 transform -rotate-90">
                        <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="6" className="text-slate-800" fill="transparent" />
                        <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="6" className="text-purple-500 transition-all duration-1000" fill="transparent"
                          strokeDasharray={(2 * Math.PI * 40).toFixed(1)}
                          strokeDashoffset={(2 * Math.PI * 40 * (1 - quizPassedCount / totalQuizzesCount)).toFixed(1)}
                        />
                      </svg>
                      {/* Correct ratio display */}
                      <div className="absolute flex flex-col items-center justify-center">
                        <span className="text-2xl font-black text-white leading-none font-mono">
                          {((quizPassedCount / totalQuizzesCount) * 5).toFixed(1)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold mt-1">sobre 5</span>
                      </div>
                    </div>

                    <div className="mt-3.5 flex items-center gap-1.5 bg-purple-950/40 px-2.5 py-1 rounded-full border border-purple-500/20 col-span-3">
                      <span className="text-[10px] text-purple-300 font-bold uppercase tracking-wider">Calificación:</span>
                      <span className={`text-[11px] font-bold ${
                        (quizPassedCount / totalQuizzesCount) >= 0.83 ? 'text-emerald-400' :
                        (quizPassedCount / totalQuizzesCount) >= 0.58 ? 'text-purple-300' :
                        (quizPassedCount / totalQuizzesCount) >= 0.4 ? 'text-yellow-400' : 'text-slate-400'
                      }`}>
                        {(quizPassedCount / totalQuizzesCount) >= 0.95 ? "Sobresaliente Alto" :
                         (quizPassedCount / totalQuizzesCount) >= 0.8 ? "Sobresaliente (A)" :
                         (quizPassedCount / totalQuizzesCount) >= 0.58 ? "Notable (B+)" :
                         (quizPassedCount / totalQuizzesCount) >= 0.40 ? "Aprobado (B)" : "En Proceso"}
                      </span>
                    </div>
                  </div>

                  {/* Quantitative Stats Detail */}
                  <div className="md:col-span-8 bg-slate-900/40 rounded-xl p-4 border border-slate-800 flex flex-col justify-between space-y-4">
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800">
                        <span className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Respondid.</span>
                        <span className="text-lg font-black text-slate-200 font-mono">
                          {Object.keys(quizSubmitted).length} <span className="text-xs text-slate-500 font-normal">/ {totalQuizzesCount}</span>
                        </span>
                      </div>
                      <div className="bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-500/10">
                        <span className="block text-[10px] text-emerald-400 uppercase font-bold mb-1">Correctas</span>
                        <span className="text-lg font-black text-emerald-400 font-mono">{quizPassedCount}</span>
                      </div>
                      <div className="bg-rose-950/15 p-2.5 rounded-lg border border-rose-500/10">
                        <span className="block text-[10px] text-rose-400 uppercase font-bold mb-1">Incorrect.</span>
                        <span className="text-lg font-black text-rose-400 font-mono">
                          {Object.keys(quizSubmitted).length - quizPassedCount}
                        </span>
                      </div>
                    </div>

                    {/* Personal advice feedback block from tutor */}
                    <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-300">
                      <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5 animate-bounce" />
                      <div className="space-y-1">
                        <span className="font-bold text-slate-200 block">Reporte Pedagógico del Tutor:</span>
                        <p className="leading-relaxed text-slate-400">
                          {quizPassedCount === totalQuizzesCount && "¡Excelente trabajo! Has logrado una calificación perfecta. Demuestras un dominio absoluto de la terminología de Odoo WMS y los flujos logísticos básicos de almacenes."}
                          {quizPassedCount < totalQuizzesCount && quizPassedCount >= 10 && "¡Excelente desempeño logístico! Tienes muy claros los conceptos clave de almacenes, ubicaciones de partida doble y productos almacenables. Sigue así."}
                          {quizPassedCount < 10 && quizPassedCount >= 6 && "¡Aprobado con buen puntaje! Dominas los conceptos fundamentales, aunque te recomendamos repasar los temas de ubicaciones de vista y mermas virtuales para perfeccionar."}
                          {quizPassedCount < 6 && quizPassedCount > 0 && "Estás en proceso de aprendizaje. Continúa respondiendo las pruebas de conocimiento de cada tema para subir tu promedio y desbloquear el Certificado Oficial."}
                          {quizPassedCount === 0 && "Aún no has iniciado tus pruebas de conocimiento. Haz clic en los temas de arriba, lee los conceptos clave y resuelve el 'Mini-Quiz' al final de cada lectura para obtener tu calificación."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CERTIFICATE UNLOCKED ACCORDION */}
                {quizPassedCount >= 6 ? (
                  <div className="bg-gradient-to-r from-purple-950/30 to-indigo-950/30 border border-purple-500/30 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4" id="certificate_unlock_ribbon">
                    <div className="flex items-start md:items-center gap-3">
                      <div className="p-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 rounded-xl text-slate-950 shrink-0 shadow-lg shadow-yellow-500/10">
                        <Award className="w-5 h-5 text-slate-950" />
                      </div>
                      <div>
                        <h4 className="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                          🏆 ¡Certificado de Aprobación Logística Disponible!
                          <span className="text-[9.5px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full font-black animate-pulse">APROBADO</span>
                        </h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">Has obtenido una calificación aprobatoria de {quizPassedCount} respuestas correctas. Ingresa tu nombre e inspecciona tu certificado oficial de mérito en Logística Odoo ERP.</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => setShowCertificate(!showCertificate)}
                        className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2 rounded-lg text-xs transition-all shadow-md shadow-amber-500/20 cursor-pointer text-center"
                        id="btn_toggle_certificate"
                      >
                        {showCertificate ? "Ocultar Certificado" : "Ver Certificado Académico"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-900/30 border border-slate-800 p-3.5 rounded-xl text-xs text-slate-400 flex items-center gap-2.5">
                    <Lock className="w-4 h-4 text-slate-600 shrink-0 animate-pulse" />
                    <span>Responde al menos <strong className="text-purple-300">6 preguntas correctas</strong> en total (llevas {quizPassedCount} de {totalQuizzesCount}) de los mini-quizzes de lectura teórica para desbloquear tu Certificado de Mérito Oficial.</span>
                  </div>
                )}

                {/* CERTIFICATE COMPONENT */}
                {quizPassedCount >= 6 && showCertificate && (
                  <div className="mt-4 p-6 bg-slate-950 border-4 border-double border-amber-500/30 rounded-2xl relative shadow-2xl overflow-hidden" id="digital_certificate_container">
                    
                    {/* Background abstract styles */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
                      <Layers className="w-80 h-80 text-amber-500" />
                    </div>
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

                    {/* Certificate Borders & Headers */}
                    <div className="text-center space-y-4 relative z-10 font-sans">
                      <div className="flex justify-center mb-1">
                        <Award className="w-12 h-12 text-amber-400 animate-pulse" />
                      </div>
                      
                      <div className="uppercase tracking-[0.2em] text-[10px] font-bold text-amber-500">CERTIFICADO DE APROBACIÓN ACADÉMICA</div>
                      <h2 className="text-xl md:text-2xl font-serif text-white font-bold tracking-tight">Odoo Académico Virtual</h2>
                      
                      <div className="w-24 h-[1px] bg-amber-500/40 mx-auto my-1"></div>
                      
                      <p className="text-slate-400 text-xs italic">Por haber completado con éxito todas las materias de evaluación teórica,</p>

                      {/* Name input with absolute centering */}
                      <div className="py-2 max-w-sm mx-auto">
                        <input
                          type="text"
                          value={studentCertName}
                          onChange={(e) => setStudentCertName(e.target.value)}
                          className="w-full text-center bg-slate-900 border-b-2 border-amber-400/60 focus:border-amber-400 bg-transparent text-lg md:text-xl font-bold text-white py-1 focus:outline-none focus:ring-0 placeholder-slate-600 uppercase"
                          placeholder="Tu Nombre Completo"
                          id="cert_student_name_input"
                          title="Haz clic para modificar el nombre que se imprime en tu certificado"
                        />
                        <span className="block text-[9px] text-slate-500 tracking-wide mt-1">✏️ Haz clic encima para editar tu nombre completo</span>
                      </div>

                      <p className="text-slate-300 text-xs leading-relaxed max-w-lg mx-auto font-sans">
                        Ha acreditado satisfactoriamente el curso interactivo <strong className="text-white font-semibold">Logística con Odoo WMS (Clase 1: Introducción a la Logística y al Módulo de Inventario)</strong>, superando con mérito científico los mini-quizzes de control organizados por el tutor virtual con un promedio de <strong className="text-emerald-400 font-bold">{((quizPassedCount / totalQuizzesCount) * 5).toFixed(1)}/5</strong>.
                      </p>

                      <div className="grid grid-cols-2 gap-8 pt-6 max-w-md mx-auto text-center font-sans border-t border-slate-800/80">
                        {/* Signature 1 */}
                        <div className="space-y-1">
                          <div className="italic text-amber-400/80 text-xs text-center select-none tracking-widest leading-none">
                            Odoo Tutor AI
                          </div>
                          <div className="w-20 h-[1px] bg-slate-700 mx-auto"></div>
                          <span className="text-[9px] text-slate-500 uppercase font-semibold">Tutor Virtual Interactivo</span>
                        </div>

                        {/* Signature 2 */}
                        <div className="space-y-1">
                          <div className="text-[10px] text-emerald-400 text-center uppercase font-black tracking-tighter">
                            Aprobado Odoo-EDU
                          </div>
                          <div className="w-20 h-[1px] bg-slate-700 mx-auto"></div>
                          <span className="text-[9px] text-slate-500 uppercase font-semibold">Sello de Calificación</span>
                        </div>
                      </div>

                      {/* Certificate Stamp Footer */}
                      <div className="pt-3 text-[10px] font-mono text-slate-500 flex flex-col items-center justify-center gap-1">
                        <div>Código de Verificación Única: <span className="text-slate-400">OD-LOG-{(quizPassedCount * 837).toString(16).toUpperCase()}</span></div>
                        <div className="text-[9px]">Fecha de Aprobación: {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ACTIVE LESSON BLOCK */}
              <div className="bg-slate-800/80 rounded-2xl border border-slate-700/60 p-5 md:p-6 shadow-xl" id="active_lesson_block">
                
                {/* Lesson title header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-700/50 pb-4 mb-5 gap-3" id="active_lesson_header">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
                      {getIcon(currentLesson.iconName, "w-5 h-5")}
                    </div>
                    <div>
                      <h2 className="text-lg md:text-xl font-bold text-white">{currentLesson.title}</h2>
                      <p className="text-xs text-slate-400 italic">Introducción básica a la logística física y ERP</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleMarkLessonRead(currentLesson.id)}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        completedLessons[currentLesson.id]
                          ? "bg-purple-950/40 text-purple-300 border border-purple-500/30"
                          : "bg-slate-700 text-slate-200 hover:bg-slate-600"
                      }`}
                      id={`btn_mark_read_lesson_${currentLesson.id}`}
                    >
                      {completedLessons[currentLesson.id] ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-purple-400" />
                          <span>Tema Leído</span>
                        </>
                      ) : (
                        <span>Marcar como leído</span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Lesson summary card */}
                <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800 mb-6 text-slate-300 text-sm leading-relaxed" id="lesson_summary">
                  <strong className="text-purple-400 inline-block mb-1">Resumen del tema:</strong>
                  <p>{currentLesson.summary}</p>
                </div>

                {/* Bullets content detailed */}
                <div className="space-y-4 mb-8" id="lesson_bullets">
                  <h3 className="text-sm font-semibold tracking-wider text-slate-400 uppercase">Puntos clave de aprendizaje:</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {currentLesson.points.map((pt, pIdx) => {
                      // Process basic markdown bold **
                      const parts = pt.split(/\*\*(.*?)\*\*/g);
                      return (
                        <div key={pIdx} className="flex items-start space-x-3 bg-slate-900/30 p-3 rounded-lg border border-slate-800/50">
                          <span className="w-5 h-5 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                            {pIdx + 1}
                          </span>
                          <span className="text-slate-300 text-sm leading-relaxed">
                            {parts.map((p, pSubIdx) => pSubIdx % 2 === 1 ? <strong key={pSubIdx} className="text-purple-300 font-semibold">{p}</strong> : p)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Mini quiz interactives inside lesson */}
                <div className="border-t border-slate-700/50 pt-5 mt-6" id="quiz_section">
                  <div className="flex items-center space-x-2 mb-4">
                    <Award className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
                      Prueba de Conocimientos (Mini-Quiz)
                    </h3>
                  </div>

                  <div className="space-y-6">
                    {currentLesson.quiz.map((q, qIndex) => {
                      const isSubmitted = quizSubmitted[q.id];
                      const selectedOptionAndStored = quizScores[q.id];
                      const isCorrect = selectedOptionAndStored === q.answerIndex;

                      return (
                        <div key={q.id} className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 relative" id={`quiz_container_${q.id}`}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-mono text-slate-500 uppercase">Pregunta {qIndex + 1} de {currentLesson.quiz.length}</span>
                            {isSubmitted && (
                              <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${isCorrect ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/15 text-red-400 border border-red-500/20'}`}>
                                {isCorrect ? "¡Correcto!" : "Incorrecto"}
                              </span>
                            )}
                          </div>
                          
                          <p className="text-slate-200 text-sm font-medium mb-3">{q.question}</p>

                          {/* Options */}
                          <div className="space-y-2">
                            {q.options.map((opt, optIdx) => {
                              const isSelected = selectedOptionAndStored === optIdx;
                              let btnClass = "bg-slate-800/50 border-slate-700/40 text-slate-300 hover:bg-slate-800 hover:border-slate-600";
                              
                              if (isSubmitted) {
                                if (optIdx === q.answerIndex) {
                                  btnClass = "bg-emerald-500/20 border-emerald-500 text-emerald-300";
                                } else if (isSelected) {
                                  btnClass = "bg-red-500/20 border-red-500 text-red-300";
                                } else {
                                  btnClass = "bg-slate-900/40 border-slate-800 text-slate-500 opacity-60";
                                }
                              } else if (isSelected) {
                                btnClass = "bg-purple-600/30 border-purple-500 text-purple-200 font-medium";
                              }

                              return (
                                <button
                                  type="button"
                                  key={optIdx}
                                  disabled={isSubmitted}
                                  onClick={(e) => handleSelectQuizOption(e, q.id, optIdx)}
                                  className={`w-full text-left p-3 rounded-lg border text-xs transition-all flex items-start space-x-2.5 ${btnClass}`}
                                  id={`quiz_opt_${q.id}_${optIdx}`}
                                >
                                  <span className="font-mono text-slate-500 mt-0.5">[{String.fromCharCode(65 + optIdx)}]</span>
                                  <span>{opt}</span>
                                </button>
                              );
                            })}
                          </div>

                          {/* Action Button for checking */}
                          {!isSubmitted ? (
                            <div className="mt-3 flex justify-end">
                              <button
                                type="button"
                                disabled={selectedOptionAndStored === undefined}
                                onClick={(e) => handleVerifyQuiz(e, q.id, q.answerIndex)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                  selectedOptionAndStored !== undefined
                                    ? "bg-emerald-600 text-white hover:bg-emerald-500 shadow-md cursor-pointer"
                                    : "bg-slate-800 text-slate-500 cursor-not-allowed"
                                }`}
                                id={`quiz_submit_btn_${q.id}`}
                              >
                                Comprobar Respuesta
                              </button>
                            </div>
                          ) : (
                            <div className="mt-3 bg-slate-800/40 p-3 rounded-lg border border-slate-700/30 text-xs text-slate-300 leading-relaxed" id={`quiz_resp_exp_${q.id}`}>
                              <strong className="text-purple-400 block mb-1">Explicación técnica:</strong>
                              {q.explanation}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer Controls for lessons */}
                <div className="flex justify-between items-center border-t border-slate-700/40 pt-5 mt-6 gap-3" id="active_lesson_footer_controls">
                  <button
                    disabled={currentLessonIndex === 0}
                    onClick={() => {
                      setCurrentLessonIndex(prev => prev - 1);
                      handleMarkLessonRead(lessonsData[currentLessonIndex - 1].id);
                    }}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs transition-all ${
                      currentLessonIndex === 0
                        ? "text-slate-600 cursor-not-allowed"
                        : "text-slate-300 hover:bg-slate-700 hover:text-white"
                    }`}
                    id="btn_prev_lesson"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Tema Anterior</span>
                  </button>

                  <div className="text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full font-medium shadow-inner">
                    Estructura Teórica {currentLessonIndex + 1} / {totalLessonsCount}
                  </div>

                  {currentLessonIndex < totalLessonsCount - 1 ? (
                    <button
                      onClick={() => {
                        setCurrentLessonIndex(prev => prev + 1);
                        handleMarkLessonRead(lessonsData[currentLessonIndex + 1].id);
                      }}
                      className="flex items-center space-x-1.5 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-md shadow-purple-600/10"
                      id="btn_next_lesson"
                    >
                      <span>Siguiente Tema</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setActiveTab("simulador");
                        // Scroll to simulator if they finished lessons
                      }}
                      className="flex items-center space-x-1.5 bg-gradient-to-r from-emerald-500 to-sky-500 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:brightness-110 shadow-md shadow-emerald-500/15 animate-bounce"
                      id="btn_jump_to_simulator"
                    >
                      <Compass className="w-4 h-4" />
                      <span>¡Ir al Simulador Odoo!</span>
                    </button>
                  )}
                </div>

              </div>

              {/* Informative Note / Odoo double entry explanation popup banner */}
              <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-4 flex items-start space-x-3.5 shadow-md" id="info_banner">
                <div className="bg-purple-950 text-purple-400 p-2.5 rounded-xl border border-purple-500/20 shrink-0">
                  <Workflow className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm">¿Cómo probar en Odoo Real?</h4>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1">
                    Esta aplicación implementa un <strong>Simulador Interactivo de Odoo 17</strong> que refleja exactamente el comportamiento de la base de datos empresarial de Odoo. 
                    Complementa tu estudio con el simulador de la pestaña lateral para solidificar lo aprendido en esta clase de logística.
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: SIMULADOR ODOO (PRÁCTICA) */}
          {activeTab === "simulador" && (
            <div className="flex flex-col gap-4" id="simulador_tab_view">
              
              {/* Simulator instruction layout block */}
              <div className="bg-slate-800/90 rounded-2xl border border-slate-700 p-4 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4" id="sim_instructor_banner">
                <div className="space-y-1">
                  <h3 className="text-white font-bold text-sm flex items-center gap-2">
                    <Database className="w-4 h-4 text-sky-400" />
                    Actividad Práctica Guiada: Puesta en Marcha Digital de tu Almacén
                  </h3>
                  <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                    Sigue las instrucciones del tutor. Completar cada paso te desbloqueará acceso en la simulación virtual. Puedes consultar al tutor de IA integrado si tienes dudas sobre qué hacer.
                  </p>
                </div>
                <div className="flex space-x-2 shrink-0">
                  <button
                    onClick={handleResetSimulator}
                    className="flex items-center space-x-1 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 px-3 py-1.5 rounded-lg text-xs"
                    id="btn_reset_sim"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reiniciar BD</span>
                  </button>
                </div>
              </div>

              {/* Progress Checklist for steps */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 bg-slate-950 p-3 rounded-2xl border border-slate-800/80 shadow-inner" id="sim_steps_indicator">
                
                {/* Paso 1: Login */}
                <div className={`p-2 rounded-xl border text-center transition-all relative ${
                  simState.activeStep >= 1 
                    ? "bg-slate-900/50 border-emerald-500/40 text-emerald-400" 
                    : simState.activeStep === 0 
                      ? "bg-purple-950/40 border-purple-500 text-white shadow-lg shadow-purple-500/10 font-bold" 
                      : "bg-slate-900/20 border-slate-900 text-slate-600"
                }`} id="step_indicator_1">
                  <div className="text-[9px] uppercase font-bold tracking-wider mb-0.5">Paso 1</div>
                  <div className="text-[11px] leading-tight flex items-center justify-center gap-1">
                    {simState.activeStep >= 1 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : null}
                    Iniciar Sesión
                  </div>
                </div>
                
                {/* Paso 2: Activar Ubicaciones */}
                <div className={`p-2 rounded-xl border text-center transition-all relative ${
                  simState.activeStep >= 2 
                    ? "bg-slate-900/50 border-emerald-500/40 text-emerald-400" 
                    : simState.activeStep === 1 
                      ? "bg-purple-950/40 border-purple-500 text-white shadow-lg shadow-purple-500/10 font-bold" 
                      : "bg-slate-900/20 border-slate-900 text-slate-600"
                }`} id="step_indicator_2">
                  <div className="text-[9px] uppercase font-bold tracking-wider mb-0.5">Paso 2</div>
                  <div className="text-[11px] leading-tight flex items-center justify-center gap-1">
                    {simState.activeStep >= 2 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : null}
                    Ajustar Almacén
                  </div>
                </div>

                {/* Paso 3: Crear Almacén */}
                <div className={`p-2 rounded-xl border text-center transition-all relative ${
                  simState.activeStep >= 3 
                    ? "bg-slate-900/50 border-emerald-500/40 text-emerald-400" 
                    : simState.activeStep === 2 
                      ? "bg-purple-950/40 border-purple-500 text-white shadow-lg shadow-purple-500/10 font-bold" 
                      : "bg-slate-900/20 border-slate-900 text-slate-600"
                }`} id="step_indicator_3">
                  <div className="text-[9px] uppercase font-bold tracking-wider mb-0.5">Paso 3</div>
                  <div className="text-[11px] leading-tight flex items-center justify-center gap-1">
                    {simState.activeStep >= 3 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : null}
                    Crear Almacén
                  </div>
                </div>

                {/* Paso 4: Crear Ubicación */}
                <div className={`p-2 rounded-xl border text-center transition-all relative ${
                  simState.activeStep >= 4 
                    ? "bg-slate-900/50 border-emerald-500/40 text-emerald-400" 
                    : simState.activeStep === 3 
                      ? "bg-purple-950/40 border-purple-500 text-white shadow-lg shadow-purple-500/10 font-bold" 
                      : "bg-slate-900/20 border-slate-900 text-slate-600"
                }`} id="step_indicator_4">
                  <div className="text-[9px] uppercase font-bold tracking-wider mb-0.5">Paso 4</div>
                  <div className="text-[11px] leading-tight flex items-center justify-center gap-1">
                    {simState.activeStep >= 4 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : null}
                    Crear Ubicación
                  </div>
                </div>

                {/* Paso 5: Crear Producto */}
                <div className={`p-2 rounded-xl border text-center transition-all relative ${
                  simState.activeStep >= 5 
                    ? "bg-slate-900/50 border-emerald-500/40 text-emerald-400" 
                    : simState.activeStep === 4 
                      ? "bg-purple-950/40 border-purple-500 text-white shadow-lg shadow-purple-500/10 font-bold" 
                      : "bg-slate-900/20 border-slate-900 text-slate-600"
                }`} id="step_indicator_5">
                  <div className="text-[9px] uppercase font-bold tracking-wider mb-0.5">Paso 5</div>
                  <div className="text-[11px] leading-tight flex items-center justify-center gap-1">
                    {simState.activeStep >= 5 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : null}
                    Crear Producto
                  </div>
                </div>

                {/* Practica Completa */}
                <div className={`p-2 rounded-xl border text-center transition-all relative ${
                  simState.activeStep >= 5 
                    ? "bg-gradient-to-r from-emerald-500/20 to-sky-500/20 border-emerald-400 text-emerald-300 font-bold" 
                    : "bg-slate-900/20 border-slate-900 text-slate-600"
                }`} id="step_indicator_6">
                  <div className="text-[9px] uppercase font-bold tracking-wider mb-0.5">Prueba Final</div>
                  <div className="text-[11px] leading-tight flex items-center justify-center gap-1">
                    {simState.activeStep >= 5 ? <Award className="w-3.5 h-3.5 text-emerald-400 animate-bounce" /> : null}
                    ¡Listo!
                  </div>
                </div>

              </div>

              {/* INTERACTIVE HINTS PANEL (Contextual based on step) */}
              <div className="bg-slate-900 border border-purple-500/30 rounded-2xl p-4 shadow-xl text-left" id="step_hints_panel">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="bg-purple-950 text-purple-400 p-2 rounded-xl border border-purple-500/20 animate-pulse">
                      <Lightbulb className="w-4 h-4 text-purple-300" />
                    </div>
                    <div>
                      <h4 className="text-white text-[11px] font-bold uppercase tracking-wider">Asistente de Logística Odoo</h4>
                      <p className="text-[10px] text-purple-300 font-medium">
                        {simState.activeStep < 5 ? `Guía oficial del tutor para el Paso ${simState.activeStep + 1}` : "¡Felicitaciones!"}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setShowActiveHint(!showActiveHint)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all ${
                      showActiveHint 
                        ? "bg-purple-600 text-white hover:bg-purple-700" 
                        : "bg-purple-950 text-purple-200 border border-purple-500/30 hover:bg-purple-900"
                    }`}
                    id="btn_request_hint"
                  >
                    <span>{showActiveHint ? "Ocultar Pistas" : "💡 Mostrar Pista del Desafío"}</span>
                  </button>
                </div>

                <div className="space-y-1">
                  <div className="text-slate-200 font-semibold text-xs flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-purple-500" />
                    {simulatorHints[Math.min(simState.activeStep, 5)].title}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {simulatorHints[Math.min(simState.activeStep, 5)].shortHint}
                  </p>
                </div>

                {showActiveHint && (
                  <div className="mt-3 p-3 bg-purple-950/30 border border-purple-500/20 rounded-xl text-xs text-purple-300 leading-relaxed font-sans" id="detailed_hint_box">
                    <div className="font-bold text-white mb-1 uppercase tracking-wider text-[9px] flex items-center gap-1">
                      <Award className="w-3 h-3 text-[#714B67]" /> Valores Esperados del Ejercicio:
                    </div>
                    {simulatorHints[Math.min(simState.activeStep, 5)].detailedHint}
                  </div>
                )}
              </div>

              {/* LIVE ODOO HIGH-FIDELITY WEB INTERFACE CONTAINER */}
              <div className="bg-[#f9f9fa] text-slate-800 rounded-2xl border border-slate-300 min-h-[500px] overflow-hidden flex flex-col shadow-2xl relative" id="odoo_virtual_screen">
                
                {/* Odoo Web Desktop Topbar */}
                <div className="bg-[#714B67] text-white flex items-center justify-between px-3.5 py-1.5 text-xs font-medium" id="odoo_top_bar">
                  <div className="flex items-center space-x-4">
                    {/* Odoo Community App Launcher Hub */}
                    <button 
                      onClick={() => {
                        if (simState.hasLoggedIn) setSimMenuSection("dashboard");
                      }}
                      className="hover:bg-black/10 px-2 py-1 rounded transition-all cursor-pointer font-bold tracking-wider text-sm flex items-center gap-1.5"
                      id="odoo_home_hub"
                    >
                      <div className="grid grid-cols-3 gap-0.5 w-3.5 h-3.5">
                        <div className="bg-white rounded-xs"></div>
                        <div className="bg-white rounded-xs"></div>
                        <div className="bg-white rounded-xs"></div>
                        <div className="bg-white rounded-xs"></div>
                        <div className="bg-white rounded-xs"></div>
                        <div className="bg-white rounded-xs"></div>
                        <div className="bg-white rounded-xs"></div>
                        <div className="bg-white rounded-xs"></div>
                        <div className="bg-white rounded-xs"></div>
                      </div>
                      <span className="font-sans font-bold">Odoo</span>
                    </button>
                    
                    {/* Breadcrumbs for Odoo */}
                    {simState.hasLoggedIn && (
                      <div className="flex items-center space-x-1.5 text-slate-100/90 text-xs" id="odoo_breadcrumbs">
                        <span>/</span>
                        <button onClick={() => setSimMenuSection("dashboard")} className="hover:underline">Dashboard</button>
                        
                        {simMenuSection === "ajustes" && (
                          <>
                            <span>/</span>
                            <span className="font-semibold text-white">Ajustes</span>
                          </>
                        )}
                        
                        {simMenuSection === "inventario" && (
                          <>
                            <span>/</span>
                            <span className="font-semibold text-white">Inventario</span>
                          </>
                        )}

                        {simMenuSection === "ubicaciones" && (
                          <>
                            <span>/</span>
                            <button onClick={() => setSimMenuSection("inventario")} className="hover:underline">Inventario</button>
                            <span>/</span>
                            <span className="font-semibold text-white">Ubicaciones</span>
                          </>
                        )}

                        {simMenuSection === "ubicacion_form" && (
                          <>
                            <span>/</span>
                            <button onClick={() => setSimMenuSection("inventario")} className="hover:underline">Inventario</button>
                            <span>/</span>
                            <button onClick={() => setSimMenuSection("ubicaciones")} className="hover:underline">Ubicaciones</button>
                            <span>/</span>
                            <span className="font-semibold text-white">Nueva Ubicación</span>
                          </>
                        )}

                        {simMenuSection === "productos_list" && (
                          <>
                            <span>/</span>
                            <button onClick={() => setSimMenuSection("inventario")} className="hover:underline">Inventario</button>
                            <span>/</span>
                            <span className="font-semibold text-white">Productos</span>
                          </>
                        )}

                        {simMenuSection === "producto_form" && (
                          <>
                            <span>/</span>
                            <button onClick={() => setSimMenuSection("inventario")} className="hover:underline">Inventario</button>
                            <span>/</span>
                            <button onClick={() => setSimMenuSection("productos_list")} className="hover:underline">Productos</button>
                            <span>/</span>
                            <span className="font-semibold text-white">Nuevo Escritorio</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-3 text-slate-200">
                    <span>Base de Datos: <strong className="text-white text-xs">odoo_test_basic</strong></span>
                    {simState.hasLoggedIn && (
                      <div className="bg-purple-900/50 px-2 py-0.5 rounded text-[10px] text-purple-200 uppercase font-mono">
                        Administrador
                      </div>
                    )}
                  </div>
                </div>

                {/* Sub Menu Navbar for Operational Apps (only shown if logged in and in apps) */}
                {simState.hasLoggedIn && simMenuSection !== "dashboard" && simMenuSection !== "ajustes" && (
                  <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between text-xs text-slate-700" id="odoo_sub_nav shadow-xs">
                    <div className="flex space-x-4 items-center">
                      <span className="font-bold text-slate-950 text-sm">Inventario</span>
                      <button 
                        onClick={() => setSimMenuSection("inventario")}
                        className={`hover:bg-slate-100 px-2 py-1 rounded font-medium ${simMenuSection === "inventario" ? "text-[#714B67] bg-purple-50" : ""}`}
                        id="nav_btn_operations"
                      >
                        Operaciones
                      </button>
                      <button 
                        onClick={() => setSimMenuSection("productos_list")}
                        className={`hover:bg-slate-100 px-2 py-1 rounded font-medium ${simMenuSection === "productos_list" || simMenuSection === "producto_form" ? "text-[#714B67] bg-purple-50" : ""}`}
                        id="nav_btn_products"
                      >
                        Productos
                      </button>
                      
                      {/* Only configurable if step 2 locations are enabled */}
                      <div 
                        className="relative"
                        onMouseLeave={() => setShowOdooConfigDropdown(false)}
                      >
                        <button 
                          onClick={() => setShowOdooConfigDropdown(!showOdooConfigDropdown)}
                          className={`hover:bg-slate-100 px-2 py-1 rounded font-medium inline-flex items-center space-x-1 cursor-pointer transition-colors ${showOdooConfigDropdown ? "bg-slate-100 text-[#714B67]" : "text-slate-700"}`}
                          id="nav_btn_config_dropdown"
                        >
                          <span>Configuración</span>
                          <span className={`text-[8px] transition-transform duration-200 ${showOdooConfigDropdown ? "rotate-180 text-purple-600" : "text-slate-400"}`}>▼</span>
                        </button>
                        
                        {showOdooConfigDropdown && (
                          <div 
                            className="absolute left-0 mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-xl z-50 py-1 font-sans animate-in fade-in duration-100"
                            id="config_dropdown_content"
                          >
                            <button
                              onClick={() => {
                                setShowOdooConfigDropdown(false);
                                if (simState.settingsActivatedLocations) {
                                  setSimMenuSection("ubicaciones");
                                } else {
                                  alert("Debes activar 'Ubicaciones de Almacenamiento' en los Ajustes primero (Paso 2).");
                                }
                              }}
                              className="w-full text-left px-3.5 py-2 text-xs hover:bg-slate-50 font-normal block text-slate-700 cursor-pointer hover:text-purple-700 hover:pl-4 transition-all"
                              id="btn_dropdown_ubicaciones"
                            >
                              Ubicaciones
                            </button>
                            <span className="block border-t border-slate-100 my-1"></span>
                            <button
                              onClick={() => {
                                setShowOdooConfigDropdown(false);
                                if (simState.settingsActivatedLocations) {
                                  setSimMenuSection("almacenes");
                                } else {
                                  alert("Debes activar 'Ubicaciones de Almacenamiento' en los Ajustes primero (Paso 2).");
                                }
                              }}
                              className="w-full text-left px-3.5 py-2 text-xs hover:bg-slate-50 font-normal block text-slate-700 cursor-pointer hover:text-purple-700 hover:pl-4 transition-all"
                              id="btn_dropdown_almacenes"
                            >
                              Almacenes
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-slate-400 text-xs text-right">
                      *Módulo de Inventario (WMS)*
                    </div>
                  </div>
                )}

                {/* MAIN ODOO SCREEN WORKSPACE */}
                <div className="flex-1 bg-slate-50 relative p-4 flex flex-col justify-center items-center" id="odoo_client_workspace">
                  
                  {/* STEP 0: LOGIN COMPONENT */}
                  {!simState.hasLoggedIn && (
                    <div className="w-full max-w-sm bg-white border border-slate-200 rounded-xl shadow-lg p-6 my-auto" id="odoo_login_box">
                      <div className="text-center mb-6">
                        <div className="text-[#714B67] font-bold text-3xl font-sans tracking-wide">Odoo</div>
                        <p className="text-xs text-slate-400 mt-1">Ingresa a la plataforma de capacitación</p>
                      </div>

                      <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Correo Electrónico</label>
                          <input 
                            type="email" 
                            required
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-white text-slate-800"
                            placeholder="admin@odoo-edu.com"
                            id="login_email_input"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Contraseña</label>
                          <input 
                            type="password" 
                            required
                            value={loginPass}
                            onChange={(e) => setLoginPass(e.target.value)}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-white text-slate-800"
                            placeholder="••••••••"
                            id="login_pwd_input"
                          />
                        </div>

                        {loginError && (
                          <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-lg flex items-center gap-1.5" id="login_error">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>{loginError}</span>
                          </div>
                        )}

                        <button 
                          type="submit"
                          className="w-full bg-[#714B67] hover:bg-[#5f3e56] text-white py-2 rounded-lg text-sm font-semibold transition-all shadow-md mt-2 flex items-center justify-center gap-1.5 cursor-pointer"
                          id="login_submit_btn"
                        >
                          <Lock className="w-4 h-4" />
                          Iniciar Sesión
                        </button>
                      </form>

                      {/* Instructions panel & autofill */}
                      <div className="mt-5 border-t border-slate-100 pt-4 text-center">
                        <span className="text-[11px] text-slate-500 block">¿No recuerdas las credenciales? Infórmalo al tutor o:</span>
                        <button 
                          onClick={handleAutoFillLogin}
                          className="text-xs text-purple-700 font-semibold underline mt-1.5 hover:text-purple-950 inline-block focus:outline-none"
                        >
                          Autocompletar Datos de prueba
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 1: DASHBOARD MOCK */}
                  {simState.hasLoggedIn && simMenuSection === "dashboard" && (
                    <div className="w-full max-w-2xl text-left bg-slate-50" id="odoo_dashboard_apps">
                      <div className="mb-6 flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">Bienvenido, Administrador</h4>
                          <p className="text-[11px] text-slate-500">Selecciona una aplicación para iniciar</p>
                        </div>
                        <div className="text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg">
                          Estado: {simStepsCompleted >= 5 ? "Práctica Completa 🎉" : `Paso ${simStepsCompleted + 1} de 4 en Curso`}
                        </div>
                      </div>

                      {/* Bento Grid Apps Odoo */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4" id="odoo_apps_bento">
                        
                        {/* App 1: Inventario */}
                        <button
                          onClick={() => setSimMenuSection("inventario")}
                          className="bg-white hover:bg-[#714B67]/5 hover:border-[#714B67]/40 border border-slate-200 p-4 rounded-xl shadow-xs text-center flex flex-col items-center justify-center gap-2 group transition-all"
                          id="app_btn_inventario"
                        >
                          <div className="bg-[#56cd7f] text-white p-3 rounded-2xl group-hover:scale-105 transition-all shadow-sm">
                            <Layers className="w-6 h-6" />
                          </div>
                          <span className="text-xs font-semibold text-slate-800">Inventario</span>
                          <span className="text-[9px] text-slate-400">Ver tarjetas de operaciones</span>
                        </button>

                        {/* App 2: Ajustes */}
                        <button
                          onClick={() => setSimMenuSection("ajustes")}
                          className="bg-white hover:bg-[#714B67]/5 hover:border-[#714B67]/40 border border-slate-200 p-4 rounded-xl shadow-xs text-center flex flex-col items-center justify-center gap-2 group transition-all"
                          id="app_btn_settings"
                        >
                          <div className="bg-[#6c757d] text-white p-3 rounded-2xl group-hover:scale-105 transition-all shadow-sm">
                            <Settings className="w-6 h-6" />
                          </div>
                          <span className="text-xs font-semibold text-slate-800">Ajustes</span>
                          <span className="text-[9px] text-slate-400">Activar ubicaciones</span>
                        </button>

                        {/* App 3: Ventas (Locked for simplicity) */}
                        <div
                          className="bg-white/60 border border-slate-200/50 p-4 rounded-xl text-center flex flex-col items-center justify-center gap-2 relative opacity-55 cursor-not-allowed"
                          id="app_btn_ventas"
                        >
                          <div className="bg-[#1f8fc1] text-white p-3 rounded-2xl">
                            <Package className="w-6 h-6" />
                          </div>
                          <span className="text-xs font-semibold text-slate-800">Ventas</span>
                          <span className="text-[9px] text-slate-400">Módulo Bloqueado</span>
                        </div>

                      </div>

                      {/* Instructor tips box inside simulator workspace */}
                      <div className="mt-8 bg-purple-50 hover:bg-purple-100/80 border border-purple-200/50 p-4 rounded-xl flex items-start gap-3 transition-colors" id="instructor_comment_simulator">
                        <Sparkles className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
                        <div className="text-xs text-purple-950 leading-relaxed">
                          <strong>Guía de Logística:</strong> Para completar el paso 2, pulsa en la aplicación de <strong>Ajustes</strong>, busca la casilla llamada <strong>"Ubicaciones de Almacenamiento"</strong> bajo la sección Almacén, márcala y haz clic en <strong>Guardar</strong>.
                        </div>
                      </div>

                    </div>
                  )}

                  {/* STEP 2: SETTINGS (AJUSTES MOCK) */}
                  {simState.hasLoggedIn && simMenuSection === "ajustes" && (
                    <div className="w-full text-left bg-white rounded-xl border border-slate-200 shadow-md overflow-hidden flex flex-col" id="odoo_settings_workspace">
                      
                      {/* Form Header */}
                      <div className="bg-slate-50 border-b border-slate-200 p-3.5 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Settings className="w-4 h-4 text-slate-600" />
                          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Ajustes Generales de Facturación e Inventario</h4>
                        </div>
                        <div className="flex space-x-2">
                          <button 
                            onClick={handleSaveSettings}
                            className="bg-[#714B67] text-white px-3 py-1 text-xs rounded hover:bg-[#5f3e56] font-semibold transition-all cursor-pointer"
                            id="settings_save_btn"
                          >
                            Guardar
                          </button>
                          <button 
                            onClick={() => setSimMenuSection("dashboard")}
                            className="bg-slate-200 text-slate-700 px-3 py-1 text-xs rounded hover:bg-slate-300 font-semibold transition-all cursor-pointer"
                            id="settings_cancel_btn"
                          >
                            Descartar
                          </button>
                        </div>
                      </div>

                      {/* Form Body Settings list */}
                      <div className="p-4 space-y-6 max-h-[380px] overflow-y-auto bg-white text-slate-700 text-xs" id="settings_body">
                        
                        {/* Section Almacén */}
                        <div>
                          <h5 className="font-bold border-b border-slate-100 pb-1.5 text-[#714B67] text-xs">Almacenes (Warehouses Config)</h5>
                          
                          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                            
                            {/* TARGET BOX: UBICACIONES DE ALMACENAMIENTO */}
                            <div className="flex items-start space-x-3.5 bg-purple-50 p-3 rounded-lg border border-purple-200/50 hover:bg-purple-50/80 transition-colors">
                              <input 
                                type="checkbox"
                                checked={settingsCheckLocations}
                                onChange={handleToggleSettingsLocation}
                                className="mt-1 w-4 h-4 text-purple-600 border-slate-300 rounded focus:ring-purple-500 cursor-pointer"
                                id="settings_chk_locations"
                              />
                              <div>
                                <label htmlFor="settings_chk_locations" className="font-semibold text-slate-950 block cursor-pointer text-xs">
                                  Ubicaciones de Almacenamiento
                                </label>
                                <span className="text-[10px] text-slate-500 leading-normal block mt-0.5">
                                  Permite gestionar y auditar ubicaciones detalladas dentro de tus almacenes (estanterías, pasillos, etc).
                                </span>
                              </div>
                            </div>

                            {/* OTHER PLACEHOLDER SETTINGS */}
                            <div className="flex items-start space-x-3 opacity-55">
                              <input 
                                type="checkbox" 
                                disabled
                                className="mt-1 w-4 h-4 text-purple-600 border-slate-300 rounded"
                              />
                              <div>
                                <span className="font-medium text-slate-700 block text-xs">Códigos de Barras</span>
                                <span className="text-[10px] text-slate-500 block mt-0.5">Utiliza lectores láser para agilizar movimientos.</span>
                              </div>
                            </div>

                            {/* OTHER PLACEHOLDER SETTINGS */}
                            <div className="flex items-start space-x-3 opacity-55">
                              <input 
                                type="checkbox" 
                                disabled
                                className="mt-1 w-4 h-4 text-purple-600 border-slate-300 rounded"
                              />
                              <div>
                                <span className="font-medium text-slate-700 block text-xs">Rutas Multietapa</span>
                                <span className="text-[10px] text-slate-500 block mt-0.5">Define flujos complejos como cross-docking o picking de dos pasos.</span>
                              </div>
                            </div>

                            {/* OTHER PLACEHOLDER SETTINGS */}
                            <div className="flex items-start space-x-3 opacity-55">
                              <input 
                                type="checkbox" 
                                disabled
                                className="mt-1 w-4 h-4 text-purple-600 border-slate-300 rounded"
                              />
                              <div>
                                <span className="font-medium text-slate-700 block text-xs">Paquetes e Inventario Masivo</span>
                                <span className="text-[10px] text-slate-500 block mt-0.5">Agrupa productos en pallets o cajas para seguimiento.</span>
                              </div>
                            </div>

                          </div>
                        </div>

                      </div>
                    </div>
                  )}

                  {/* STEP 3: WORK DIRECTORY INVENTARIO (TARJETAS DE OPERACIONES) */}
                  {simState.hasLoggedIn && simMenuSection === "inventario" && (
                    <div className="w-full text-left space-y-4" id="odoo_inventory_workspace">
                      
                      {/* Success / Checklist banner */}
                      {simState.activeStep < 5 && (
                        <div className="bg-sky-50 border border-sky-200 text-sky-950 p-3 rounded-lg text-xs leading-normal flex items-start gap-2" id="inventario_tips_bar">
                          <Compass className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
                          <div>
                            <strong>Instrucciones Activas:</strong>
                            {simState.activeStep === 2 && (
                              <span> Hemos activado las ubicaciones. Vete a <strong>Configuración (menú superior) → Ubicaciones</strong> para crear la ubicación del Pasillo A.</span>
                            )}
                            {simState.activeStep >= 3 && (
                              <span> Has mapeado la ubicación. Ahora crea el Escritorio de Madera haciendo clic en <strong>Productos → Productos → Nuevo</strong> en la barra superior.</span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Header controls for operations */}
                      <div className="flex justify-between items-center" id="inventory_header_row">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">Resumen de Operaciones Físicas</h4>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => {
                              if (simState.settingsActivatedLocations) {
                                setSimMenuSection("ubicaciones");
                              } else {
                                alert("Debes habilitar 'Ubicaciones de Almacenamiento' en los Ajustes primero.");
                              }
                            }}
                            className="bg-slate-200 hover:bg-slate-300 border border-slate-300 text-slate-800 font-semibold px-2.5 py-1 rounded text-xs transition-colors"
                            id="btn_view_locations_header"
                          >
                            Ver Ubicaciones ({simState.locations.length})
                          </button>
                        </div>
                      </div>

                      {/* Operational Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="odoo_op_cards">
                        
                        {/* Tarjeta Recepciones */}
                        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs" id="op_card_receipts">
                          <div className="border-l-4 border-emerald-500 pl-2.5">
                            <h5 className="font-bold text-slate-900 text-xs text-emerald-700 font-mono">Recepciones</h5>
                            <span className="text-[10px] text-slate-400 block mt-0.5">YourCompany: Entradas</span>
                          </div>
                          <div className="mt-4 flex justify-between items-center bg-slate-50 p-2 rounded">
                            <span className="text-xl font-bold font-mono text-slate-900">0</span>
                            <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-100 font-semibold px-2 py-0.5 rounded">A Procesar</span>
                          </div>
                        </div>

                        {/* Tarjeta Transferencias Internas */}
                        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs" id="op_card_internal_transfers">
                          <div className="border-l-4 border-[#714B67] pl-2.5">
                            <h5 className="font-bold text-slate-900 text-xs text-[#714B67] font-mono">Transferencias Internas</h5>
                            <span className="text-[10px] text-slate-400 block mt-0.5">YourCompany: Movimientos internos</span>
                          </div>
                          <div className="mt-4 flex justify-between items-center bg-slate-50 p-2 rounded">
                            <span className="text-xl font-bold font-mono text-slate-900">0</span>
                            <span className="text-[10px] bg-purple-50 text-purple-800 border border-purple-100 font-semibold px-2 py-0.5 rounded">A Procesar</span>
                          </div>
                        </div>

                        {/* Tarjeta Salidas */}
                        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs" id="op_card_deliveries">
                          <div className="border-l-4 border-amber-500 pl-2.5">
                            <h5 className="font-bold text-slate-900 text-xs text-amber-700 font-mono">Órdenes de Entrega</h5>
                            <span className="text-[10px] text-slate-400 block mt-0.5">YourCompany: Despachos</span>
                          </div>
                          <div className="mt-4 flex justify-between items-center bg-slate-50 p-2 rounded">
                            <span className="text-xl font-bold font-mono text-slate-900">0</span>
                            <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-100 font-semibold px-2 py-0.5 rounded">A Procesar</span>
                          </div>
                        </div>

                      </div>

                      {/* Display active product catálogo mini */}
                      <div className="bg-white border border-slate-200 rounded-xl p-4 mt-6" id="product_minis">
                        <div className="flex justify-between items-center mb-3">
                          <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Últimos Productos Registrados</h5>
                          <button 
                            onClick={() => setSimMenuSection("productos_list")}
                            className="text-xs text-purple-700 font-semibold underline hover:text-purple-950"
                          >
                            Ver Catálogo Completo
                          </button>
                        </div>

                        <div className="divide-y divide-slate-100 text-xs" id="product_list_preview">
                          {simState.products.map(p => (
                            <div key={p.id} className="py-2.5 flex justify-between items-center gap-2">
                              <div className="flex items-center space-x-2">
                                <Package className="w-4 h-4 text-slate-400 shrink-0" />
                                <div>
                                  <span className="font-bold text-slate-950 text-xs block">{p.name}</span>
                                  <span className="text-[10px] text-slate-500 block">SKU: {p.internalRef} • Tipo: {p.type === 'storable' ? 'Almacenable' : p.type === 'consumable' ? 'Consumible' : 'Servicio'}</span>
                                </div>
                              </div>

                              <div className="flex justify-between space-x-6">
                                <div className="text-right">
                                  <span className="text-[10px] text-slate-400 block">P. Venta</span>
                                  <strong className="text-slate-900 font-mono text-xs">${Number(p.price).toFixed(2)}</strong>
                                </div>
                                <div className="text-right">
                                  <span className="text-[10px] text-slate-400 block">Costo</span>
                                  <strong className="text-slate-950 font-mono text-xs">${Number(p.cost).toFixed(2)}</strong>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}

                  {/* STEP 3C: WAREHOUSES LIST */}
                  {simState.hasLoggedIn && simMenuSection === "almacenes" && (
                    <div className="w-full text-left bg-white rounded-xl border border-slate-200 shadow-md flex flex-col overflow-hidden" id="odoo_warehouses_workspace">
                      {/* Nav controls */}
                      <div className="bg-slate-50 border-b border-slate-200 p-3 flex items-center justify-between text-xs">
                        <div className="flex space-x-4 items-center">
                          <span className="font-bold text-slate-950 text-sm">Almacenes</span>
                          <button 
                            onClick={() => setSimMenuSection("almacen_form")}
                            className="bg-[#714B67] text-white px-3.5 py-1 rounded text-xs font-semibold hover:bg-[#5f3e56] transition-colors cursor-pointer inline-flex items-center space-x-1"
                            id="btn_new_warehouse"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Nuevo</span>
                          </button>
                        </div>
                        <button 
                          onClick={() => setSimMenuSection("inventario")}
                          className="text-[#714B67] hover:underline"
                        >
                          Regresar a Operaciones
                        </button>
                      </div>

                      {/* Warehouses Table */}
                      <div className="p-3 bg-white max-h-[350px] overflow-y-auto" id="warehouses_table_area">
                        <table className="w-full text-xs font-sans text-slate-700">
                          <thead>
                            <tr className="bg-slate-50 text-slate-600 font-normal border-b border-slate-200">
                              <th className="py-2 px-3 text-left">Almacén</th>
                              <th className="py-2 px-3 text-left">Código Corto</th>
                              <th className="py-2 px-3 text-left">Dirección de Ubicaciones</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-xs">
                            {simState.warehouses.map(wh => (
                              <tr key={wh.id} className="hover:bg-slate-50/50">
                                <td className="py-2.5 px-3 font-semibold text-slate-900 flex items-center gap-1.5">
                                  <Warehouse className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                                  {wh.name}
                                </td>
                                <td className="py-2.5 px-3 font-mono text-slate-500">{wh.code}</td>
                                <td className="py-2.5 px-3 text-slate-500">{wh.code}/Stock</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* STEP 3D: WAREHOUSE FORM */}
                  {simState.hasLoggedIn && simMenuSection === "almacen_form" && (
                    <div className="w-full text-left bg-white rounded-xl border border-slate-200 shadow-md flex flex-col overflow-hidden" id="odoo_warehouse_form_workspace">
                      {/* Form top headers */}
                      <div className="bg-slate-50 border-b border-slate-200 p-3 flex justify-between items-center text-xs">
                        <div className="flex space-x-2">
                          <button 
                            type="submit"
                            form="warehouse-creation-form"
                            className="bg-[#714B67] text-white px-3 py-1 rounded font-semibold hover:bg-[#5f3e56] transition-colors cursor-pointer"
                            id="btn_save_warehouse_form"
                          >
                            Guardar
                          </button>
                          <button 
                            type="button"
                            onClick={() => setSimMenuSection("almacenes")}
                            className="bg-slate-200 hover:bg-slate-300 border border-slate-300 text-slate-800 px-3 py-1 rounded transition-colors"
                            id="btn_discard_warehouse_form"
                          >
                            Descartar
                          </button>
                        </div>
                        <span className="text-slate-400 font-mono text-[10px]">Almacén / Nuevo</span>
                      </div>

                      {/* Warehouse input content */}
                      <form id="warehouse-creation-form" onSubmit={handleWarehouseSubmit} className="p-5 space-y-4 max-w-lg bg-white">
                        {whValidationMessage && (
                          <div className="text-xs bg-rose-50 text-rose-700 border border-rose-200 p-3 rounded-lg leading-relaxed font-sans animate-pulse" id="wh_validation_box">
                            {whValidationMessage}
                          </div>
                        )}

                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Nombre del Almacén</label>
                            <input 
                              type="text"
                              value={whFormName}
                              onChange={(e) => setWhFormName(e.target.value)}
                              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#714B67] focus:border-transparent bg-white text-slate-800 font-sans"
                              placeholder="Ej. Almacén Central"
                              id="wh_name_input"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">Ingresa exactamente 'Almacén Central' como se indica en las pistas.</p>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Código Corto</label>
                            <input 
                              type="text"
                              maxLength={5}
                              value={whFormCode}
                              onChange={(e) => setWhFormCode(e.target.value)}
                              className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm uppercase font-mono focus:outline-none focus:ring-2 focus:ring-[#714B67] focus:border-transparent bg-white text-slate-800"
                              placeholder="Ej. AC"
                              id="wh_code_input"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">Ingresa exactamente 'AC' para configurar el código corto de tu almacén.</p>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-start space-x-2 text-[11px] text-slate-500 leading-relaxed">
                          <Compass className="w-4 h-4 text-[#714B67] shrink-0 mt-0.5" />
                          <span>Al crear este almacén, el sistema creará automáticamente su jerarquía de ubicaciones base como 'AC' y 'AC/Stock' para su uso inmediato en la práctica.</span>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* STEP 3B: LOCATIONS LIST/MANAGEMENT MOCK */}
                  {simState.hasLoggedIn && simMenuSection === "ubicaciones" && (
                    <div className="w-full text-left bg-white rounded-xl border border-slate-200 shadow-md flex flex-col overflow-hidden" id="odoo_locations_workspace">
                      
                      {/* Nav controls */}
                      <div className="bg-slate-50 border-b border-slate-200 p-3 flex items-center justify-between text-xs">
                        <div className="flex space-x-4 items-center">
                          <span className="font-bold text-slate-950">Ubicaciones</span>
                          <button 
                            onClick={() => setSimMenuSection("ubicacion_form")}
                            className="bg-[#714B67] text-white px-3.5 py-1 rounded text-xs font-semibold hover:bg-[#5f3e56] transition-colors cursor-pointer inline-flex items-center space-x-1"
                            id="btn_new_location"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Nuevo</span>
                          </button>
                        </div>
                        <button 
                          onClick={() => setSimMenuSection("inventario")}
                          className="text-[#714B67] hover:underline"
                        >
                          Regresar a Operaciones
                        </button>
                      </div>

                      {/* Locations Table */}
                      <div className="p-3 bg-white max-h-[350px] overflow-y-auto" id="locations_table_area">
                        <table className="w-full text-xs font-sans text-slate-700">
                          <thead>
                            <tr className="bg-slate-50 text-slate-600 font-normal border-b border-slate-200">
                              <th className="py-2 px-3 text-left">Ubicación</th>
                              <th className="py-2 px-3 text-left">Ubicación Padre</th>
                              <th className="py-2 px-3 text-left">Tipo de Ubicación</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-xs">
                            {simState.locations.map(loc => (
                              <tr key={loc.id} className="hover:bg-slate-50/50">
                                <td className="py-2.5 px-3 font-semibold text-slate-900 flex items-center gap-1.5">
                                  <MapPin className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                                  {loc.name}
                                </td>
                                <td className="py-2.5 px-3 font-mono text-slate-500">{loc.parent || "-"}</td>
                                <td className="py-2.5 px-3">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                    loc.type === "internal" 
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                                      : loc.type === "view"
                                        ? "bg-purple-50 text-purple-700 border-purple-100"
                                        : "bg-amber-50 text-amber-700 border-amber-100"
                                  }`}>
                                    {loc.type === "internal" ? "Ubicación Interna" : loc.type === "view" ? "Vista" : "Virtual"}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                    </div>
                  )}

                  {/* STEP 3C: LOCATION CREATION FORM (PASILLO A) */}
                  {simState.hasLoggedIn && simMenuSection === "ubicacion_form" && (
                    <div className="w-full bg-white rounded-xl border border-slate-200 shadow-md p-4 text-left text-xs" id="odoo_location_form">
                      <div className="border-b border-slate-200 pb-3 mb-4 flex justify-between items-center">
                        <span className="font-bold text-slate-900 text-sm">Crear Nueva Ubicación</span>
                        <button 
                          onClick={() => setSimMenuSection("ubicaciones")}
                          className="text-slate-400 hover:text-slate-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <form onSubmit={handleLocationSubmit} className="space-y-4">
                        
                        {/* Target name verification */}
                        <div>
                          <label className="block text-slate-600 font-bold mb-1">Nombre de la ubicación <strong className="text-red-500">*</strong></label>
                          <input 
                            type="text"
                            required
                            value={locFormName}
                            onChange={(e) => setLocFormName(e.target.value)}
                            className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-600 bg-white text-slate-900 font-sans"
                            placeholder="ej. Pasillo A"
                            id="field_location_name"
                          />
                          <span className="text-[10px] text-slate-500 block mt-1">Escribe exactamente <strong>Pasillo A</strong> para aprobar la práctica.</span>
                        </div>

                        {/* Hierarchical parent location */}
                        <div>
                          <label className="block text-slate-600 font-bold mb-1">Ubicación Padre</label>
                          <select 
                            value={locFormParent}
                            onChange={(e) => setLocFormParent(e.target.value)}
                            className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-600 bg-white text-slate-900 cursor-pointer"
                            id="field_location_parent"
                          >
                            <option value="">(Ninguno)</option>
                            <option value="WH">WH</option>
                            <option value="WH/Stock">WH/Stock (Ubicación Central)</option>
                            <option value="Virtual Locations">Virtual Locations</option>
                          </select>
                          <span className="text-[10px] text-slate-500 block mt-1">Debe colgar de <strong>WH/Stock</strong> según las instrucciones.</span>
                        </div>

                        {/* Location Type */}
                        <div>
                          <label className="block text-slate-600 font-bold mb-1">Tipo de Ubicación</label>
                          <select 
                            value={locFormType}
                            onChange={(e) => setLocFormType(e.target.value as any)}
                            className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-600 bg-white text-slate-900 cursor-pointer"
                            id="field_location_type"
                          >
                            <option value="internal">Ubicación interna (Real / donde se cuenta el stock físico)</option>
                            <option value="view">Ubicación de Vista (Solo de estructura, no contiene stock)</option>
                            <option value="virtual">Ubicación Virtual (Para scrap o de tránsito)</option>
                          </select>
                          <span className="text-[10px] text-slate-500 block mt-1">Debe ser <strong>Ubicación interna</strong> para que Odoo audite inventario aquí.</span>
                        </div>

                        {locValidationMessage && (
                          <div className="text-[11px] text-rose-600 bg-rose-50 border border-rose-200 p-2 rounded" id="loc_form_error">
                            {locValidationMessage}
                          </div>
                        )}

                        <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                          <button 
                            type="button"
                            onClick={() => {
                              setSimMenuSection("ubicaciones");
                              setLocValidationMessage("");
                            }}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-1.5 rounded font-semibold text-xs cursor-pointer"
                            id="btn_cancel_location"
                          >
                            Descartar
                          </button>
                          
                          <button 
                            type="submit"
                            className="bg-[#714B67] hover:bg-[#5f3e56] text-white px-4 py-1.5 rounded font-semibold text-xs cursor-pointer"
                            id="btn_save_location"
                          >
                            Guardar ubicación
                          </button>
                        </div>

                      </form>
                    </div>
                  )}

                  {/* STEP 4: PRODUCTS LIST MOCK */}
                  {simState.hasLoggedIn && simMenuSection === "productos_list" && (
                    <div className="w-full text-left bg-white rounded-xl border border-slate-200 shadow-md flex flex-col overflow-hidden" id="odoo_products_workspace">
                      
                      {/* Nav controls */}
                      <div className="bg-slate-50 border-b border-slate-200 p-3 flex justify-between items-center text-xs">
                        <div className="flex space-x-3 items-center">
                          <span className="font-bold text-slate-950">Catálogo de Productos</span>
                          <button 
                            onClick={() => setSimMenuSection("producto_form")}
                            className="bg-[#714B67] text-white px-3.5 py-1 rounded text-xs font-semibold hover:bg-[#5f3e56] transition-colors cursor-pointer inline-flex items-center space-x-1"
                            id="btn_new_product_list"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Crear Producto</span>
                          </button>
                        </div>
                        <button 
                          onClick={() => setSimMenuSection("inventario")}
                          className="text-[#714B67] hover:underline"
                        >
                          Volver a Operaciones
                        </button>
                      </div>

                      {/* Products visual dashboard grid */}
                      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto" id="products_cards_grid">
                        {simState.products.map(p => (
                          <div key={p.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start gap-3 hover:shadow-xs transition-shadow">
                            <div className="bg-white border border-slate-300 p-2 rounded-lg text-slate-400">
                              <Package className="w-6 h-6" />
                            </div>
                            <div className="text-xs flex-1">
                              <strong className="text-slate-950 font-bold block truncate">{p.name}</strong>
                              <span className="text-[10px] text-slate-500 block">Ref: {p.internalRef || "-"}</span>
                              <span className="text-[10px] text-purple-700 bg-purple-50 border border-purple-100 font-semibold px-2 py-0.2 rounded-full inline-block mt-1">
                                {p.type === "storable" ? "Almacenable" : p.type === "consumable" ? "Consumible" : "Servicio"}
                              </span>
                              
                              <div className="flex items-center gap-4 mt-2 border-t border-slate-200/50 pt-2 text-slate-600">
                                <span className="font-mono">P. Venta: <strong className="text-slate-900">${p.price.toFixed(2)}</strong></span>
                                <span className="font-mono">Costo: <strong className="text-slate-900">${p.cost.toFixed(2)}</strong></span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                    </div>
                  )}

                  {/* STEP 4B: PRODUCT CREATION FORM (ESCRITORIO DE MADERA PREMIUM) */}
                  {simState.hasLoggedIn && simMenuSection === "producto_form" && (
                    <div className="w-full bg-white rounded-xl border border-slate-200 shadow-md p-4 text-left text-xs" id="odoo_product_form">
                      <div className="border-b border-slate-200 pb-2 mb-3 flex justify-between items-center">
                        <span className="font-bold text-slate-1000 text-sm">Nuevo Producto - Ficha Técnica</span>
                        <button 
                          onClick={() => setSimMenuSection("productos_list")}
                          className="text-slate-400 hover:text-slate-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <form onSubmit={handleProductSubmit} className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
                        
                        {/* Name */}
                        <div>
                          <label className="block text-slate-600 font-bold mb-1">Nombre del producto <strong className="text-red-500">*</strong></label>
                          <input 
                            type="text"
                            required
                            value={prodFormName}
                            onChange={(e) => setProdFormName(e.target.value)}
                            className="w-full border border-slate-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-600 bg-white text-slate-900 font-sans"
                            placeholder="ej. Escritorio de Madera Premium"
                            id="field_product_name"
                          />
                          <span className="text-[10px] text-slate-500 block mt-0.5">Mapea exactamente: <strong>Escritorio de Madera Premium</strong></span>
                        </div>

                        {/* Quick Checkboxes for sale and purchase */}
                        <div className="flex space-x-6 bg-slate-50 p-2 rounded border border-slate-200">
                          <label className="flex items-center space-x-1.5 cursor-pointer text-slate-700">
                            <input 
                              type="checkbox"
                              checked={prodFormSold}
                              onChange={(e) => setProdFormSold(e.target.checked)}
                              className="w-4 h-4 text-purple-600 border-slate-300 rounded cursor-pointer"
                              id="chk_can_be_sold"
                            />
                            <span>Puede ser vendido</span>
                          </label>

                          <label className="flex items-center space-x-1.5 cursor-pointer text-slate-700">
                            <input 
                              type="checkbox"
                              checked={prodFormBought}
                              onChange={(e) => setProdFormBought(e.target.checked)}
                              className="w-4 h-4 text-purple-600 border-slate-300 rounded cursor-pointer"
                              id="chk_can_be_bought"
                            />
                            <span>Puede ser comprado</span>
                          </label>
                        </div>

                        {/* Two columns: Product Type & category */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-slate-600 font-bold mb-1">Tipo de Producto</label>
                            <select 
                              value={prodFormType}
                              onChange={(e) => setProdFormType(e.target.value as any)}
                              className="w-full border border-slate-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-purple-600 bg-white text-slate-900 cursor-pointer font-sans"
                              id="field_product_type"
                            >
                              <option value="storable font-sans">Producto Almacenable (Storable)</option>
                              <option value="consumable font-sans">Consumible</option>
                              <option value="service font-sans">Servicio</option>
                            </select>
                            <span className="text-[9px] text-slate-500 block mt-0.5">Utiliza <strong>Producto Almacenable (Storable)</strong>.</span>
                          </div>

                          <div>
                            <label className="block text-slate-600 font-bold mb-1">Referencia Interna (SKU)</label>
                            <input 
                              type="text"
                              required
                              value={prodFormRef}
                              onChange={(e) => setProdFormRef(e.target.value)}
                              className="w-full border border-slate-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-purple-600 bg-white text-slate-900 font-mono"
                              placeholder="MUE-ESC-001"
                              id="field_product_ref"
                            />
                            <span className="text-[9px] text-slate-500 block mt-0.5">Ingresa exactamente: <strong>MUE-ESC-001</strong></span>
                          </div>
                        </div>

                        {/* Prices columns */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-slate-600 font-bold mb-1">Precio de Venta ($)</label>
                            <input 
                              type="number"
                              required
                              value={prodFormPrice || ""}
                              onChange={(e) => setProdFormPrice(Number(e.target.value))}
                              className="w-full border border-slate-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-purple-600 bg-white text-slate-900 font-mono"
                              placeholder="150.00"
                              id="field_product_price"
                            />
                            <span className="text-[9px] text-slate-500 block mt-0.5">Mapea exactamente: <strong>150</strong></span>
                          </div>

                          <div>
                            <label className="block text-slate-600 font-bold mb-1">Costo ($)</label>
                            <input 
                              type="number"
                              required
                              value={prodFormCost || ""}
                              onChange={(e) => setProdFormCost(Number(e.target.value))}
                              className="w-full border border-slate-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-purple-600 bg-white text-slate-900 font-mono"
                              placeholder="80.00"
                              id="field_product_cost"
                            />
                            <span className="text-[9px] text-slate-500 block mt-0.5">Mapea exactamente: <strong>80</strong></span>
                          </div>
                        </div>

                        {prodValidationMessage && (
                          <div className="text-[11px] text-rose-600 bg-rose-50 border border-rose-200 p-2 rounded" id="prod_form_error">
                            {prodValidationMessage}
                          </div>
                        )}

                        <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                          <button 
                            type="button"
                            onClick={() => {
                              setSimMenuSection("productos_list");
                              setProdValidationMessage("");
                            }}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded text-xs cursor-pointer font-bold"
                            id="btn_cancel_product"
                          >
                            Descartar
                          </button>
                          
                          <button 
                            type="submit"
                            className="bg-[#714B67] hover:bg-[#5f3e56] text-white px-4 py-1.5 rounded font-bold text-xs cursor-pointer"
                            id="btn_save_product"
                          >
                            Guardar Producto
                          </button>
                        </div>

                      </form>
                    </div>
                  )}

                  {/* SUCCESS ANIMATED STATE (COMPLETED PRACTICAL LESSON) */}
                  {simState.activeStep >= 5 && simMenuSection === "dashboard" && (
                    <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-lg p-6 my-auto text-center space-y-4" id="sim_complete_panel">
                      <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-sky-400 text-white rounded-full flex items-center justify-center text-4xl shadow-lg shadow-emerald-500/10 mx-auto">
                        🎉
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-slate-950 font-bold text-lg">¡Actividad Práctica Completada con Éxito!</h4>
                        <p className="text-xs text-slate-500 leading-normal">
                          Has llevado a cabo toda la puesta en marcha técnica de un almacén digital en Odoo con total éxito.
                        </p>
                      </div>

                      <div className="bg-slate-50 text-slate-700 text-xs border border-slate-200 rounded-lg p-3 text-left space-y-1.5 leading-relaxed" id="completion_bullet_report">
                        <strong className="text-slate-900 font-bold block border-b border-slate-200 pb-1 mr-1">Reporte de Auditoría Odoo:</strong>
                        <div className="flex items-center space-x-1.5 text-[11px]">
                          <Check className="w-3.5 h-3.5 text-emerald-600 font-bold" />
                          <span>Módulo de Ubicaciones activado en Ajustes.</span>
                        </div>
                        <div className="flex items-center space-x-1.5 text-[11px]">
                          <Check className="w-3.5 h-3.5 text-emerald-600 font-bold" />
                          <span>Ubicación interna <strong>Pasillo A</strong> creada dentro de WH/Stock.</span>
                        </div>
                        <div className="flex items-center space-x-1.5 text-[11px]">
                          <Check className="w-3.5 h-3.5 text-emerald-600 font-bold" />
                          <span>Ficha de producto <strong>Escritorio de Madera Premium</strong> (SKU: MUE-ESC-001) creada como Almacenable, precio 150.00 y costo 80.00.</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSimMenuSection("inventario");
                          }}
                          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-2 rounded-lg text-xs border border-slate-300"
                          id="btn_view_sandbox"
                        >
                          Explorar Almacén
                        </button>
                        <button
                          onClick={() => {
                            setActiveTab("teoria");
                          }}
                          className="flex-1 bg-[#714B67] text-white font-semibold py-2 rounded-lg text-xs hover:bg-[#5f3e56]"
                          id="btn_back_to_lessons"
                        >
                          Ir al Temario Teórico
                        </button>
                      </div>
                    </div>
                  )}

                </div>

                {/* Footer simulation indicator bar */}
                <div className="bg-slate-200 border-t border-slate-300 px-4 py-2 flex justify-between items-center text-[11px] text-slate-600 font-mono" id="odoo_footer_bar">
                  <span>© Odoo Education Suite - 2026</span>
                  <div className="flex gap-4">
                    <span>Ubicaciones: <strong>{simState.locations.length}</strong></span>
                    <span>Productos: <strong>{simState.products.length}</strong></span>
                  </div>
                </div>

              </div>

            </div>
          )}

        </section>

        {/* RIGHT COLUMN - virtual tutor chat (takes 4 cols) */}
        {showTutorChat && (
          <section className="lg:col-span-4 flex flex-col h-[calc(100vh-140px)] min-h-[500px]" id="tutor_chat_area">
          <div className="bg-slate-800/90 border border-slate-700/60 rounded-2xl flex-1 flex flex-col overflow-hidden shadow-xl" id="chat_panel">
            
            {/* Header chat block */}
            <div className="bg-slate-900 border-b border-slate-700/60 px-4 py-3.5 flex items-center justify-between" id="chat_header">
              <div className="flex items-center space-x-2.5">
                <div className="bg-purple-600/20 text-purple-400 p-2 rounded-xl border border-purple-500/20">
                  <Sparkles className="w-4 h-4 animate-spin-slow" />
                </div>
                <div>
                  <h3 className="text-xs md:text-sm font-bold text-white leading-tight">Tutor Odoo Consultor IA</h3>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-ping"></span>
                    Gemini Activo • En Línea
                  </p>
                </div>
              </div>

              <div className="flex space-x-1.5">
                <button
                  onClick={() => {
                    if (confirm("¿Limpiar todo el historial del chat con el tutor?")) {
                      setChatMessages([
                        {
                          id: "welcome",
                          role: "model",
                          text: "Claro, he restablecido nuestra sesión. ¿En qué te ayudo con la materia de Odoo o Logística para la clase 1?",
                          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        }
                      ]);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors border border-slate-700/50"
                  title="Restablecer chat"
                  id="btn_clear_chat"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Chat message list area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/30 scrollbar-thin" id="chat_message_container">
              {chatMessages.map((msg) => {
                const isModel = msg.role === "model";
                return (
                  <div 
                    key={msg.id} 
                    className={`flex items-start gap-2.5 max-w-[85%] ${isModel ? "mr-auto" : "ml-auto flex-row-reverse"}`}
                    id={`chat_msg_bubble_${msg.id}`}
                  >
                    {/* Tiny Avatar */}
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold border ${
                      isModel 
                        ? "bg-purple-950 text-purple-400 border-purple-500/20" 
                        : "bg-slate-700 text-slate-200 border-slate-600"
                    }`}>
                      {isModel ? "IA" : "Tú"}
                    </div>

                    <div className="space-y-1">
                      <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                        isModel 
                          ? "bg-slate-800 text-slate-200 border border-slate-800/80 rounded-tl-none font-normal" 
                          : "bg-purple-600 text-white rounded-tr-none font-medium shadow-md shadow-purple-600/10"
                      }`}>
                        
                        {/* Process simple markdown formatting on message */}
                        <div className="space-y-1.5 selection:bg-slate-50 selection:text-slate-900">
                          {msg.text.split("\n\n").map((paragraph, pIdx) => {
                            // Match bullet patterns
                            if (paragraph.startsWith("•") || paragraph.startsWith("-")) {
                              const lines = paragraph.split("\n");
                              return (
                                <ul key={pIdx} className="list-disc pl-4 space-y-1 my-1">
                                  {lines.map((ln, lIdx) => {
                                    const cleanedLine = ln.replace(/^[•\-\s]+/, "");
                                    const boldFormatted = cleanedLine.split(/\*\*(.*?)\*\*/g);
                                    return (
                                      <li key={lIdx}>
                                        {boldFormatted.map((textPart, idxPart) => 
                                          idxPart % 2 === 1 ? <strong key={idxPart} className={isModel ? "text-purple-300 font-bold" : "text-white font-bold"}>{textPart}</strong> : textPart
                                        )}
                                      </li>
                                    );
                                  })}
                                </ul>
                              );
                            }

                            // Match normal text with bold decorators
                            const lineSegments = paragraph.split(/\*\*(.*?)\*\*/g);
                            return (
                              <p key={pIdx} className="leading-relaxed">
                                {lineSegments.map((textPart, idxPart) => 
                                  idxPart % 2 === 1 ? <strong key={idxPart} className={isModel ? "text-purple-300 font-bold" : "text-white font-bold"}>{textPart}</strong> : textPart
                                )}
                              </p>
                            );
                          })}
                        </div>

                      </div>
                      <span className="text-[9px] text-slate-500 block text-right font-mono pr-1">{msg.timestamp}</span>
                    </div>
                  </div>
                );
              })}

              {/* Chat loading bubble */}
              {isChatLoading && (
                <div className="flex items-start gap-2 max-w-[80%]" id="chat_loading_bubble">
                  <div className="w-7 h-7 rounded-lg bg-purple-950 text-purple-400 border border-purple-500/20 flex items-center justify-center text-xs font-bold shrink-0">
                    IA
                  </div>
                  <div className="bg-slate-800/60 text-slate-400 p-3 rounded-2xl rounded-tl-none border border-slate-800 text-xs flex items-center space-x-2">
                    <span className="flex space-x-1">
                      <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                      <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                      <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                    </span>
                    <span>Tutor redactando...</span>
                  </div>
                </div>
              )}

              {chatError && (
                <div className="bg-rose-950/40 text-rose-300 p-3 rounded-xl border border-rose-900/40 text-xs" id="chat_error_message">
                  {chatError}
                </div>
              )}

              <div ref={chatEndRef}></div>
            </div>

            {/* Quick Questions buttons list */}
            <div className="p-2 border-t border-slate-700/40 bg-slate-900/15" id="chat_presets">
              <span className="text-[10px] text-slate-400 font-bold block mb-1.5 uppercase tracking-wider pl-1.5">Pautas del temario / Preguntas rápidas:</span>
              <div className="flex flex-wrap gap-1.5 pr-1.5 pb-0.5" id="preset_buttons">
                <button 
                  onClick={() => triggerQuickTopic("¿Cuáles son las 5 R de la logística?")}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded-lg text-[10px] border border-slate-700/50 hover:text-white transition-all focus:outline-none"
                >
                  🚚 5 R's Logística
                </button>
                <button 
                  onClick={() => triggerQuickTopic("¿Qué diferencia hay entre ubicación interna, de vista y virtual?")}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded-lg text-[10px] border border-slate-700/50 hover:text-white transition-all focus:outline-none"
                >
                  🗺️ Tipos de Ubicaciones
                </button>
                <button 
                  onClick={() => triggerQuickTopic("¿Cómo activo el módulo de ubicaciones en los ajustes?")}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded-lg text-[10px] border border-slate-700/50 hover:text-white transition-all focus:outline-none"
                >
                  ⚙️ Guía de Ajustes
                </button>
                <button 
                  onClick={() => triggerQuickTopic("¿Cómo configuro la ficha del Escritorio de Madera Premium?")}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded-lg text-[10px] border border-slate-700/50 hover:text-white transition-all focus:outline-none"
                >
                  📦 Crear Producto
                </button>
              </div>
            </div>

            {/* Input entry chat row */}
            <div className="p-3 border-t border-slate-700/60 bg-slate-900" id="chat_input_section">
              <div className="flex items-center bg-slate-800 border border-slate-700/60 rounded-xl px-2.5 py-1 focus-within:ring-1 focus-within:ring-purple-600 focus-within:border-transparent transition-all">
                <input 
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isChatLoading) {
                      handleSendMessage();
                    }
                  }}
                  placeholder="Consúltale al tutor de Odoo sobre el curso..."
                  className="bg-transparent border-none outline-none flex-1 text-slate-100 text-xs py-1.5 focus:ring-0 placeholder-slate-500 font-sans"
                  id="chat_text_input"
                />
                <button
                  disabled={!chatInput.trim() || isChatLoading}
                  onClick={() => handleSendMessage()}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    chatInput.trim() && !isChatLoading
                      ? "bg-purple-600 text-white hover:bg-purple-500"
                      : "text-slate-600 cursor-not-allowed"
                  }`}
                  id="chat_send_btn"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </section>
        )}

      </main>

    </div>
  );
}
