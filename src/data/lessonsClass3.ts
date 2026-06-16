import { Lesson } from "../types";

export const lessonsClass3Data: Lesson[] = [
  {
    id: 201,
    title: "1. Relación entre Compras y Logística",
    summary: "Descubre la conexión indisoluble que existe entre negociar adquisiciones de stock y su posterior almacenamiento físico y descarga operativa.",
    iconName: "Truck",
    points: [
      "**Sincronización Crítica**: Compras negocia precios, condiciones de pago y plazos. Logística ejecuta la recepción física, control de espacio, descarga y ordenamiento.",
      "**El Desafío Operativo**: Comprar grandes volúmenes para ahorrar precio unitario puede colapsar el almacén e incrementar costos lógicos por colmatación o retrasos.",
      "**Flujo en Tiempo Real**: En un ERP moderno como Odoo, confirmar un pedido de compras genera instantáneamente un albarán de entrada visible para el personal de rampa, previniendo cuellos de botella."
    ],
    quiz: [
      {
        id: "q3_201_1",
        question: "¿Qué problema clásico ocurre si el depto de Compras adquiere stock de forma aislada sin avisar a Logística?",
        options: [
          "Se genera un incremento incontrolado en el precio de venta sugerido.",
          "El almacén puede quedarse sin espacio físico (colapso de andén) perdiendo el beneficio de la negociación comercial.",
          "El sistema Odoo desinstala automáticamente el módulo de inventario por seguridad técnica."
        ],
        answerIndex: 1,
        explanation: "La falta de comunicación causa sobrecostos en almacenamiento secundario o demoras de descarga si el almacén no cuenta con el espacio físico o personal listo."
      },
      {
        id: "q3_201_2",
        question: "¿Cómo soluciona un sistema ERP integrado la fricción típica entre Compras e Inventario?",
        options: [
          "Borrando los saldos teóricos cada vez que llega un nuevo transportista.",
          "Obligando al equipo de compras a realizar las descargas físicas los fines de semana.",
          "Sincronizando la confirmación de la orden con una alerta de llegada o recepción automática en el módulo logístico."
        ],
        answerIndex: 2,
        explanation: "En Odoo, la validación de un documento de compras genera en tiempo real un movimiento previsto de entrada (Inbound) para que almacén prepare el espacio."
      }
    ]
  },
  {
    id: 202,
    title: "2. Gestión de Proveedores",
    summary: "Un adecuado registro técnico y comercial de tus proveedores garantiza una trazabilidad de 360° desde las negociaciones hasta las entregas físicas.",
    iconName: "Settings",
    points: [
      "**Ficha de Contacto Centralizada**: Odoo unifica los datos fiscales, ubicaciones, plazos de pago y el histórico completo de interacciones con cada proveedor.",
      "**Visión 360 Grados**: Permite analizar las compras históricas, facturas pendientes de cobro, desviaciones de entrega y plazos pactados desde un único panel.",
      "**Precios Negociados**: Puedes ligar múltiples tarifas o listas de precios preferenciales a un proveedor para que se apliquen en compras de forma automatizada."
    ],
    quiz: [
      {
        id: "q3_202_1",
        question: "¿Qué beneficio aporta el concepto de 'Trazabilidad 360°' en la ficha de un proveedor en Odoo?",
        options: [
          "Monitorear desde un mismo sitio las compras válidas, facturas, productos vinculados e históricos de entregas.",
          "Habilitar un chat tridimensional con inteligencia artificial interactiva.",
          "Permitir que los clientes finales auditen el margen de ganancia de cada fabricante."
        ],
        answerIndex: 0,
        explanation: "La vista 360 unifica la información de compras, contabilidad y almacén, permitiendo calificar de forma ágil el cumplimiento y regular operaciones."
      },
      {
        id: "q3_202_2",
        question: "¿Es posible configurar tarifas de precios específicas según el proveedor seleccionado en Odoo?",
        options: [
          "No, Odoo tiene un único precio rígido de costo para todos los proveedores.",
          "Sí, registrando las reglas de proveedor y precios alternos en la pestaña de 'Compra' en la ficha de producto.",
          "Solo si se crea una bodega nueva para cada distribuidor asociado."
        ],
        answerIndex: 1,
        explanation: "Puedes asignar diferentes proveedores a un mismo artículo, definiendo para cada uno precios mínimos, plazos y códigos de referencia alternos en su ficha."
      }
    ]
  },
  {
    id: 203,
    title: "3. El Flujo Documental: Solicitudes vs. Órdenes de Compra",
    summary: "Domina la maduración formal del documento desde la Solicitud de Cotización (SdC) hasta convertirse en una Orden de Compra (OC).",
    iconName: "Workflow",
    points: [
      "**Petición de Presupuesto (SdC / RfQ)**: Borrador inicial. No vinculante legalmente. Sirve para negociar costos y plazos ('P0000X').",
      "**Orden de Compra (OC / PO)**: Al confirmar la cotización, se vuelve un acuerdo comercial formal y gatilla el proceso de entrada física.",
      "**Enlace Logístico**: Odoo usa este flujo inmutable para rastrear si los pedidos facturados coinciden estrictamente con lo que se solicitó."
    ],
    quiz: [
      {
        id: "q3_203_1",
        question: "¿Qué es una 'Petición de Presupuesto' o 'Solicitud de Cotización' (SdC) en Odoo?",
        options: [
          "Un documento final obligatorio que bloquea la facturación tributaria de clientes.",
          "Un borrador borrable de cotización no vinculante técnica ni legalmente con el proveedor.",
          "Una solicitud de crédito bancario internacional."
        ],
        answerIndex: 1,
        explanation: "La Solicitud de Cotización (SdC) es un primer borrador de sondeo para cotizar precios, antes del acuerdo formal."
      },
      {
        id: "q3_203_2",
        question: "¿Qué ocurre en Odoo WMS al pulsar el botón 'Confirmar Orden' en una Solicitud de Cotización?",
        options: [
          "El documento se borra permanentemente del servidor.",
          "El stock a mano se actualiza de inmediato aunque el camión no haya descargado nada.",
          "Se formaliza como Orden de Compra y se genera automáticamente una Recepción (WH/IN) en el módulo de Inventario."
        ],
        answerIndex: 2,
        explanation: "Al confirmar, el sistema asume el compromiso legal de compra y genera la orden logística (recepción pendiente) de forma desasistida."
      }
    ]
  },
  {
    id: 204,
    title: "4. Recepción de Mercancías y Validación",
    summary: "Aprende a ejecutar las validaciones físicas y de conteo de existencias en el andén de descarga, controlando recepciones y backorders.",
    iconName: "Layers",
    points: [
      "**La Recepción en Almacén (Inbound)**: Enlace operacional directo, pre-asociado a la Orden de Compra (ej. documento WH/IN/00021).",
      "**Validación Cuantitativa**: El operario realiza el conteo real frente a la orden teórica y anota en Odoo las unidades 'Hechas'.",
      "**Pedidos Pendientes (Backorders)**: Si llegan menos productos de los contratados, Odoo te permite recibir lo disponible y crear un Backorder automático para las cantidades faltantes."
    ],
    quiz: [
      {
        id: "q3_204_1",
        question: "¿Qué nomenclatura típica asigna Odoo para las operaciones logísticas de recepción e ingreso de existencias?",
        options: [
          "WH/OUT/XXXXX.",
          "WH/INT/XXXXX.",
          "WH/IN/XXXXX."
        ],
        answerIndex: 2,
        explanation: "Las operaciones de recepción (ingresos de almacén) se codifican con las iniciales de entrada 'WH/IN/XXXXX'."
      },
      {
        id: "q3_204_2",
        question: "¿Qué es un 'Pedido Pendiente' (Backorder) en el flujo de validaciones de Odoo?",
        options: [
          "Una multa monetaria que Odoo cobra automáticamente a los transportistas.",
          "Un documento complementario que deja abierto el saldo de existencias faltantes si el proveedor entregó de forma parcial.",
          "Un error técnico de la base de datos por sobrecarga de peticiones."
        ],
        answerIndex: 1,
        explanation: "Si el proveedor te trae solo una parte del pedido (ej. 30 de 50), el Backorder mantiene abierta la solicitud para recibir las restantes 20 unidades en el futuro."
      }
    ]
  },
  {
    id: 205,
    title: "5. Control Documental e Impacto en el Inventario",
    summary: "Ejecuta los filtros de Triple Verificación (3-Way Matching) para cautelar el stock pronosticado, stock físico real y estados de pago.",
    iconName: "Compass",
    points: [
      "**Triple Verificación (3-Way Matching)**: Cotejo rígido entre: lo que compraste (Orden de Compra) = lo que te llegó (Recepción) = lo que te cobran (Factura).",
      "**Impactos del Flujo**: Confirmar la OC incrementa inmediatamente el Stock Pronosticado. Validar la Recepción incrementa el Stock Físico a Mano.",
      "**Regla de Seguridad Financiera**: En Odoo se aconseja bloquear la contabilización de facturas si la cantidad facturada por el proveedor difiere de la cantidad validada en andenes."
    ],
    quiz: [
      {
        id: "q3_205_1",
        question: "¿En qué consiste la 'Triple Verificación' (3-Way Matching) del flujo de Compras en Odoo?",
        options: [
          "En validar que el administrador apruebe tres veces la misma clave de acceso por seguridad.",
          "En contrastar cuantitativamente que lo solicitado en la OC = lo verificado físicamente en la Recepción = lo cobrado en la Factura.",
          "En comprobar que el producto pase por tres bodegas diferentes antes de llegar al andén."
        ],
        answerIndex: 1,
        explanation: "Es un control cruzado diseñado para prevenir pagar facturas erróneas o recibir mercancías no solicitadas contractualmente."
      },
      {
        id: "q3_205_2",
        question: "¿Cuándo se incrementa específicamente la 'Cantidad a Mano' (On Hand) en tu almacén al comprar en Odoo?",
        options: [
          "En el momento en que se redacta el borrador de Petición de Presupuesto.",
          "Solo cuando se efectúa el pago final o transferencia bancaria al proveedor.",
          "En el instante exacto en que almacén valida como hechas las unidades de Recepción (WH/IN/XXXXX)."
        ],
        answerIndex: 2,
        explanation: "La cantidad a mano representa el stock real presente físicamente. Se incrementa únicamente tras la validación física en el albarán de entrada de inventario."
      }
    ]
  }
];
