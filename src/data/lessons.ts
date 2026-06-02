import { Lesson } from "../types";

export const lessonsData: Lesson[] = [
  {
    id: 1,
    title: "1. Conceptos Básicos de Logística",
    summary: "Se encarga de gestionar el flujo de recursos desde el origen hasta el consumidor final. Su meta principal se resume en conseguir un flujo ágil e inteligente.",
    iconName: "Truck",
    points: [
      "La logística empresarial organiza los métodos e infraestructuras de distribución.",
      "Las 5 'R' de la Logística: Entregar el **producto** correcto, en la **cantidad** correcta, en el **lugar** correcto, en el **momento** correcto y al **menor costo** posible.",
      "El inventario representa dinero inmovilizado. Una mala gestión causa sobrecostos por almacenamiento o roturas de stock (pérdidas de ventas)."
    ],
    quiz: [
      {
        id: "q1_1",
        question: "¿Cuál de las siguientes opciones define mejor la importancia de controlar el inventario?",
        options: [
          "Evita tener mercancía, ya que el inventario no aporta ningún valor financiero.",
          "El inventario es dinero inmovilizado; controlarlo evita sobrecostos por exceso de stock y pérdidas por roturas.",
          "El inventario solo es importante si se trata de productos electrónicos de alta gama."
        ],
        answerIndex: 1,
        explanation: "El inventario equivale a capital de trabajo inmovilizado de la empresa. Optimizar su nivel previene sobrecostos de almacenamiento y la imposibilidad de vender por falta de productos (roturas)."
      },
      {
        id: "q1_2",
        question: "¿Cuáles son las llamadas '5 R' de la logística empresarial?",
        options: [
          "Rapidez, Resiliencia, Retorno, Reputación y Rentabilidad.",
          "Recepción, Registro, Reubicación, Reenvío y Reclamación.",
          "Producto correcto, Cantidad correcta, Lugar correcto, Momento correcto y Menor costo posible."
        ],
        answerIndex: 2,
        explanation: "Las 5 'R' (Right) representan la máxima de la logística para satisfacer la demanda de forma rentable y certera."
      }
    ]
  },
  {
    id: 2,
    title: "2. Cadena de Suministro y Flujo",
    summary: "La Cadena de Suministro (Supply Chain) abarca toda la red de valor. La logística gestiona el transporte y almacenamiento estratégico dentro de esta red.",
    iconName: "GitCommit",
    points: [
      "La Cadena de Suministro engloba todas las funciones que participan en el cumplimiento de la solicitud del cliente.",
      "Flujo Progresivo: Proveedores → Almacén de materia prima → Producción → Almacén de producto terminado → Distribución → Cliente final.",
      "Flujo Regresivo (Logística Inversa): Enfocado en devoluciones de clientes, reciclaje de bienes, empaques o soporte técnico secundario."
    ],
    quiz: [
      {
        id: "q2_1",
        question: "¿Qué es la logística en comparación con la Cadena de Suministro?",
        options: [
          "Es un sinónimo idéntico, cubren exactamente el mismo alcance organizativo.",
          "La logística es sólo una parte de la Cadena de Suministro, enfocada en el flujo y almacenamiento físico.",
          "La logística se encarga únicamente de los cobros a clientes y facturación."
        ],
        answerIndex: 1,
        explanation: "La Cadena de Suministro es la red macro que une proveedores, fábricas y clientes. La logística es la disciplina que gestiona los movimientos e inventarios dentro de esa red."
      },
      {
        id: "q2_2",
        question: "Si un cliente devuelve un producto defectuoso, ¿por cuál flujo se canaliza?",
        options: [
          "Flujo Regresivo (Logística Inversa).",
          "Flujo Progresivo de Materiales.",
          "Flujo Lateral Estacionario."
        ],
        answerIndex: 0,
        explanation: "Todo movimiento que retorne de los clientes hacia el almacén o fábrica (como devoluciones, reciclaje o reparaciones) forma parte de la logística inversa o flujo regresivo."
      }
    ]
  },
  {
    id: 3,
    title: "3. Introducción al ERP Odoo",
    summary: "Odoo revoluciona la gestión empresarial a través de un ecosistema modular totalmente integrado que sincroniza todos los departamentos en tiempo real.",
    iconName: "Workflow",
    points: [
      "Sistemas de bases de datos aisladas vs ERP integrado: En Odoo, Ventas, Compras, Facturación e Inventario se actualizan mutuamente al instante.",
      "Logística con sistema de inventario de partida doble: Ningún producto se crea o destruye. Cada acción es un movimiento entre una ubicación de origen y otra de destino.",
      "La automatización robusta genera alertas de límites mínimos para activar auto-compras o solicitudes de abastecimiento internas de forma inteligente."
    ],
    quiz: [
      {
        id: "q3_1",
        question: "¿Qué significa que el inventario de Odoo funcione mediante 'partida doble'?",
        options: [
          "Que cada producto siempre debe registrarse con un precio duplicado.",
          "Que los productos no aparecen de la nada; todo movimiento es una transferencia entre una ubicación de origen y una de destino.",
          "Que sólo se pueden realizar transferencias de dos en dos unidades."
        ],
        answerIndex: 1,
        explanation: "De forma análoga a la contabilidad, el inventario de partida doble en Odoo garantiza la trazabilidad total mediante trasvases entre ubicaciones, evitando pérdidas ocultas e inconsistencias matemáticas."
      }
    ]
  },
  {
    id: 4,
    title: "4. Navegación en la Plataforma",
    summary: "Para dominar Odoo, es fundamental entender el mapa del sistema: el Dashboard principal, la búsqueda y las vistas flexibles de datos.",
    iconName: "Compass",
    points: [
      "El Tablero Principal (Dashboard) contiene accesos directos visuales a todas las aplicaciones modulares instaladas.",
      "La Barra de búsqueda superior permite encontrar rápidamente registros, menús de configuración instalados, o fichas específicas de clientes.",
      "Migas de Pan (Breadcrumbs): Guía de ruta interactiva arriba a la izquierda para rastrear dónde te encuentras y retroceder rápidamente (ej. Inventario / Productos / Ficha).",
      "Vistas típicas de Odoo: Vista Kanban (tarjetas Kanban de flujo), de Lista (grilla masiva editable) y de Formulario (ficha de detalle completo)."
    ],
    quiz: [
      {
        id: "q4_1",
        question: "¿Cuál de las siguientes vistas en Odoo es más adecuada para obtener un análisis masivo tipo Excel con columnas ordenables?",
        options: [
          "Vista de Formulario.",
          "Vista Kanban.",
          "Vista de Lista."
        ],
        answerIndex: 2,
        explanation: "La vista de lista muestra los registros en filas y columnas tipo Excel, lo que facilita el ordenado masivo, la selección y análisis rápido."
      },
      {
        id: "q4_2",
        question: "¿Cuál es la función del menú de 'Migas de Pan' (Breadcrumbs) en Odoo?",
        options: [
          "Permitir la descarga de manuales en formato PDF.",
          "Indicar en qué parte del sistema estamos situados y permitir regresar fácilmente a menús anteriores.",
          "Buscar productos que usen harinas y cereales."
        ],
        answerIndex: 1,
        explanation: "Las migas de pan te guían jerárquicamente. Por ejemplo, al leer: 'Inventario / Productos / Escritorio', puedes pulsar 'Productos' para volver inmediatamente al listado general."
      }
    ]
  },
  {
    id: 5,
    title: "5. Estructura de Inventario",
    summary: "Al entrar a la app de Inventario, verás los flujos de trabajo físicos representados por tarjetas de operaciones.",
    iconName: "Layers",
    points: [
      "La página de inicio de la aplicación de Inventario se organiza en base a los Flujos de Operaciones del almacén.",
      "Recepciones (Receipts): Gestiona la descarga de las mercancías compradas a los proveedores para ser validadas en stock.",
      "Transferencias Internas (Internal Transfers): Movimientos entre zonas del almacén (ej. del recibo principal a estanterías definitivas).",
      "Órdenes de Entrega (Delivery Orders): Controla los despachos, embalaje y egresos de productos hacia los clientes finales."
    ],
    quiz: [
      {
        id: "q5_1",
        question: "¿Qué tarjeta de operación en la app de Inventario gestiona la llegada de mercancía comprada a proveedores?",
        options: [
          "Órdenes de Entrega.",
          "Recepciones.",
          "Transferencias Internas."
        ],
        answerIndex: 1,
        explanation: "Las 'Recepciones' (Receipts) representan las operaciones de entrada de stock asociadas a compras de proveedores o devoluciones de clientes."
      }
    ]
  },
  {
    id: 6,
    title: "6. Configuración Inicial",
    summary: "Define los cimientos lógicos que estructurarán el espacio físico y contable de la operación.",
    iconName: "Settings",
    points: [
      "Almacenes (Warehouses): Espacio físico real que tiene una dirección postal. Odoo genera automáticamente rutas de entrada, almacenamiento y salida.",
      "Ubicaciones (Locations): Subdivisiones internas meticulosas (estanterías, pasillos, cajas). Se clasifican en:",
      "• Internas: Pasillos reales del almacén donde se cuenta stock físico disponible (ej. Pasillo A / Fila 2).",
      "• De Vista: Jerarquías conceptuales que organizan (no guardan stock directamente, ej. WH/Stock).",
      "• Virtuales: Ubicaciones transitorias lógicas de contrapartida (ej. Virtual Locations/Scrap para merma, Virtual Locations/Customers para productos vendidos).",
      "Categorías de Producto: Agrupan artículos para definir masivamente sus cuentas contables y métodos de costeo (ej. FIFO, estándar)."
    ],
    quiz: [
      {
        id: "q6_1",
        question: "Si queremos tirar un producto inservible a la basura (merma/scrap), ¿a qué tipo de ubicación se transfiere?",
        options: [
          "A una ubicación virtual como Virtual Locations/Scrap.",
          "A una ubicación de tipo Vista como WH.",
          "Se elimina por completo el registro del producto del sistema."
        ],
        answerIndex: 0,
        explanation: "Las mermas o productos dañados son transferidos a la ubicación virtual de 'Scrap' (Desechos). Esto reduce el inventario físico real contrapartiendo contablemente la pérdida."
      },
      {
        id: "q6_2",
        question: "¿Cuál es la diferencia primordial entre un Almacén y una Ubicación en Odoo?",
        options: [
          "Un almacén es el edificio físico real; una ubicación es una subdivisión jerárquica dentro de él.",
          "El almacén sirve únicamente para productos de servicios y las ubicaciones para tangibles.",
          "Son sinónimos idénticos y se configuran en el mismo menú sin diferencias."
        ],
        answerIndex: 0,
        explanation: "El Almacén (Warehouse / WH) representa la estructura inmobiliaria o predio. Las ubicaciones (Locations) son las posiciones lógicas o físicas (estantes, pasillos) dentro del almacén."
      }
    ]
  },
  {
    id: 7,
    title: "7. Creación de Productos",
    summary: "Configura de manera óptima las fichas de tus artículos definiendo variables fundamentales que impactan compras, ventas y contabilidad.",
    iconName: "Package",
    points: [
      "Tipo de Producto: Define el comportamiento logístico del artículo:",
      "• Almacenable (Storable): Odoo lleva el control riguroso de movimientos y valoriza el stock (computadora, silla).",
      "• Consumible (Consumable): Artículos físicos que se asume que se agotan al recibirse. No se calcula inventario a largo plazo (tornillos en producción, papel).",
      "• Servicio: Prestación intangible. No genera movimientos de inventario físico (consultoría, gastos de flete).",
      "Referencia Interna (SKU): Código alfa-numérico estructurado único que identifica al producto (ej. MUE-ESC-001).",
      "Código de Barras (EAN/UPC): Código universal numérico para la interacción directa con pistolas de lectura láser."
    ],
    quiz: [
      {
        id: "q7_1",
        question: "Si vendes 'Clavos de Hierro' para que los operarios los usen de inmediato libremente sin auditar saldos físicos mensuales, ¿qué Tipo de Producto es más apropiado?",
        options: [
          "Producto Almacenable.",
          "Consumible.",
          "Servicio."
        ],
        answerIndex: 1,
        explanation: "Para materiales auxiliares que fluyen rápidamente y no ameritan auditoría de existencias físicas continuas, el tipo 'Consumible' evita fricción en el almacén."
      },
      {
        id: "q7_2",
        question: "¿Qué representa la 'Referencia Interna' (SKU) en la ficha de un producto de Odoo?",
        options: [
          "Es el costo total de envío calculado por Odoo.",
          "Un código de identificación único creado por la empresa para organizar sus artículos rápidamente (ej. MUE-ESC-001).",
          "La dirección física de la fábrica del proveedor."
        ],
        answerIndex: 1,
        explanation: "La Referencia Interna o SKU (Stock Keeping Unit) permite la identificación inequívoca rápida de un producto sin depender de descripciones lingüísticas que puedan ser impersonales o ambiguas."
      }
    ]
  }
];
