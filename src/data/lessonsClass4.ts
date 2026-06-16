import { Lesson } from "../types";

export const lessonsClass4Data: Lesson[] = [
  {
    id: 301,
    title: "1. Proceso de Despacho y Distribución",
    summary: "Asimila las fases operativas de picking, packing y dispatch en la logística de salida (Outbound) antes de transferir la custodia al transportista.",
    iconName: "Truck",
    points: [
      "**Picking (Recolección)**: Consiste en retirar físicamente el stock exacto de sus ubicaciones de almacenamiento asignadas basándose en una ruta eficiente establecida.",
      "**Packing (Empaque y Embalaje)**: Fase de acondicionamiento de la carga, verificación de calidad del producto, embalado estructural y etiquetado para entrega.",
      "**Dispatch (Despacho)**: Carga ordenada de las mercancías preparadas en el camión transportista, firma de conformidad e impresión de la documentación de guía física."
    ],
    quiz: [
      {
        id: "q4_301_1",
        question: "¿Qué etapa de la logística de salida (Outbound) se encarga de retirar físicamente las mercancías de los estantes de almacén?",
        options: [
          "El proceso de Packing o embalado primario.",
          "El proceso de Picking o recolección de mercancías.",
          "El proceso de Cross-docking de reabastecimiento directo."
        ],
        answerIndex: 1,
        explanation: "El Picking es la recolección física de unidades en las ubicaciones basadas en las directrices de la orden de entrega."
      },
      {
        id: "q4_301_2",
        question: "¿Qué elemento es fundamental realizar en la etapa de Packing para consolidar un despacho seguro?",
        options: [
          "Imprimir una Solicitud de Cotización internacional.",
          "Verificar la calidad del producto, empaquetarlo adecuadamente y etiquetarlo para el transporte.",
          "Incrementar la cantidad 'A Mano' del artículo ficticio por duplicado."
        ],
        answerIndex: 1,
        explanation: "Durante el Packing, los productos se acondicionan para soportar el transporte, verificando su estado y asignando sus etiquetas de destino."
      }
    ]
  },
  {
    id: 302,
    title: "2. Órdenes de Entrega en Odoo",
    summary: "Comprende la nomenclatura oficial WH/OUT y la evolución del ciclo de vida documental desde el borrador hasta la salida física definitiva.",
    iconName: "Workflow",
    points: [
      "**Nomenclatura Estándar (WH/OUT)**: El acrónimo para las salidas de almacén general (Warehouse Outbound) que se asocian de forma nativa a Ventas.",
      "**Estados del Documento**: Fluctuación clara entre: Borrador (en edición), Esperando otra operación (dependencias previas), Listo (con stock reservado y disponible) y Hecho (confirmado y fuera del sistema).",
      "**Reserva Automática**: Cuando el estado cambia a 'Listo', Odoo ha reservado automáticamente las unidades en tu inventario, previniendo que otro pedido las tome."
    ],
    quiz: [
      {
        id: "q4_302_1",
        question: "¿Cuál es la nomenclatura oficial estándar que asigna Odoo WMS para los documentos de orden de entrega de salida?",
        options: [
          "WH/OUT/XXXXX",
          "WH/IN/XXXXX",
          "WH/INT/XXXXX"
        ],
        answerIndex: 0,
        explanation: "Las Órdenes de Entrega en Odoo de salida de mercancías se denominan bajo el rótulo de Warehouse Outbound: WH/OUT."
      },
      {
        id: "q4_302_2",
        question: "¿Qué significa que una orden de entrega se encuentre en estado 'Listo' en Odoo?",
        options: [
          "Que el cliente ya pagó la totalidad de la mercancía con tarjeta.",
          "Que el stock físico de productos comprometidos está disponible en estantes y ya está reservado para este documento.",
          "Que el sistema eliminó el reporte histórico por sobre-existencia."
        ],
        answerIndex: 1,
        explanation: "El estado 'Listo' confirma que el stock físico requerido se encuentra disponible y apartado en el almacén listo para ser recolectado."
      }
    ]
  },
  {
    id: 303,
    title: "3. Preparación y Validación de Envíos",
    summary: "Aprende a asentar la rebaja real de inventario y a gestionar incidencias operativas mediante órdenes de saldos pendientes (Backorders).",
    iconName: "Layers",
    points: [
      "**Impacto del Botón Validar**: Al presionar 'Validar' con las cantidades Hechas registradas, Odoo efectúa la rebaja inmediata del stock a mano general.",
      "**Gestión de Faltantes (Backorder)**: Si el cliente solicita 10 unidades pero sólo tienes 5 disponibles para enviar hoy, Odoo divide la entrega para despachar lo actual y crear un pedido pendiente automático por el resto.",
      "**Sincronización Inmediata**: La orden de transporte y los saldos financieros asumen el nuevo volumen real disminuyendo de inmediato las valorizaciones lógicas."
    ],
    quiz: [
      {
        id: "q4_303_1",
        question: "Al validar una entrega parcial en Odoo por falta de existencias completas, ¿qué decisión te ofrece el sistema de forma sugerida?",
        options: [
          "Generar un Pedido Pendiente (Backorder) para crear una entrega complementaria con la cantidad restante.",
          "Borrar permanentemente el stock total remanente del catálogo de la base de datos.",
          "Cobrar una multa automática a la dirección de correo fiscal de la compañía."
        ],
        answerIndex: 0,
        explanation: "El Backorder (Pedido Pendiente) divide automáticamente el documento original para enviar de inmediato lo que se tiene a mano, manteniendo activo el saldo restante."
      },
      {
        id: "q4_303_2",
        question: "¿Qué ocurre físicamente con las existencias lógicas del almacén cuando una Orden de Entrega pasa al estado 'Hecho'?",
        options: [
          "El sistema bloquea las compras de forma asíncrona.",
          "Se efectúa la rebaja real e inmediata de las unidades del stock físico a mano.",
          "El producto se convierte transitoriamente en consumible no inventariable."
        ],
        answerIndex: 1,
        explanation: "El estado 'Hecho' representa que la mercancía ha cruzado físicamente la rampa de despacho y ha sido retirada formalmente del stock a mano disponible en el almacén."
      }
    ]
  },
  {
    id: 304,
    title: "4. Gestión de Clientes Asociada a la Logística",
    summary: "Organiza múltiples puntos de destino geográfico y directrices en las fichas de tus clientes corporativos dentro del directorio base.",
    iconName: "Users",
    points: [
      "**Ubicaciones Múltiples de Destino**: Un mismo cliente unificado puede registrar un domicilio fiscal de cobro y múltiples direcciones de entrega para sus diferentes sucursales.",
      "**Políticas de Envío**: Define técnicamente si despachas 'lo antes posible' (para envíos parciales oportunos) o 'cuando todos los productos estén listos' (exigiendo entrega unificada).",
      "**Plazos de Entrega Solicitados**: Configura el tiempo de entrega prometido para que Odoo retro-planifique el inicio de picking para cumplir con el acuerdo."
    ],
    quiz: [
      {
        id: "q4_304_1",
        question: "¿Qué directriz logística clave se puede configurar directamente sobre la pestaña de logística del cliente en Odoo?",
        options: [
          "La política de despacho: aceptar envíos parciales inmediatos o exigir una entrega completa.",
          "El color de fondo de las cartas que recibe el destinatario final.",
          "La capacidad estibadora en metros cúbicos de sus montacargas externos."
        ],
        answerIndex: 0,
        explanation: "La política de entrega le dice a Odoo si puede fraccionar los pedidos del cliente en múltiples entregas o si debe aguardar al stock de todos los ítems."
      }
    ]
  },
  {
    id: 305,
    title: "5. Seguimiento de Movimientos",
    summary: "Audita con precisión el diario de ruta de un producto desde ubicaciones internas hasta destinos virtuales dedicados.",
    iconName: "Compass",
    points: [
      "**Rastreo Histórico Completo**: Odoo mantiene una contabilidad de partida doble para stock; cada artículo entra en un sitio físico restándose de otro.",
      "**Origen y Destino de Despacho**: La orden estándar registra la transferencia desde 'WH/Stock' hacia la ubicación virtual externa 'Virtual Locations/Customers'.",
      "**Trazabilidad Unívoca**: De ser activados, los números de serie (Lotes) permiten auditar exactamente a qué cliente se despachó cada unidad de stock comprada originalmente."
    ],
    quiz: [
      {
        id: "q4_305_1",
        question: "¿Qué transferencia física y contable ocurre por detrás en Odoo al validar una salida hacia un cliente?",
        options: [
          "De Virtual Locations/Customers hacia Virtual/Scrap de desecho.",
          "De la ubicación física de almacenamiento (ej. WH/Stock) hacia la ubicación virtual 'Virtual Locations/Customers' por valor negativo.",
          "No se realiza transferencia, solo se asienta un registro de notas contables externas."
        ],
        answerIndex: 1,
        explanation: "La partida doble logística requiere un origen real (ej: WH/Stock) y un destino contrapartida (Virtual Locations/Customers) para cuadrar balances globales."
      }
    ]
  },
  {
    id: 306,
    title: "6. Indicadores Básicos (KPIs)",
    summary: "Aprende a analizar reportes de existencias, flujos agregados y fórmulas clave de gestión de almacén para tomar decisiones rentables.",
    iconName: "Awards",
    points: [
      "**Fórmula de Rotación**: Rotación de Inventarios = (Costo de Productos Vendidos) / (Valor Promedio del Inventario). Indica la velocidad con la que vacías y renuevas stock.",
      "**Nivel de Existencias Activas**: Volumen total almacenado filtrado por pasillos para evitar sobrecostos por capital de trabajo inmovilizado.",
      "**Balance de Flujos**: Equilibrio porcentual entre entradas recibidas y embarques despachados, el cual regula las dotaciones del personal del andén comercial."
    ],
    quiz: [
      {
        id: "q4_306_1",
        question: "¿Cuál es el beneficio de mantener una rotación de inventarios alta en una compañía comercial?",
        options: [
          "Garantizar que los productos permanezcan acumulados por más tiempo en los pasillos de almacén.",
          "Mejorar el flujo de efectivo y reducir sobrecostos por almacenamiento y mermas por obsolescencia.",
          "Obligar a Odoo a no requerir el pago mensual de impuestos lógicos."
        ],
        answerIndex: 1,
        explanation: "Una rotación alta evidencia eficiencia operativa: los productos comprados salen con agilidad, disminuyendo gastos de bodega y liberando capital."
      }
    ]
  }
];
