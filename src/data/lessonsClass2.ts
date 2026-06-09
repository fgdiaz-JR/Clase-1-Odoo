import { Lesson } from "../types";

export const lessonsClass2Data: Lesson[] = [
  {
    id: 101,
    title: "1. Tipos de Inventarios en Odoo",
    summary: "En Odoo el inventario se gestiona de forma perpetua, actualizando existencias automáticamente en cada compra, venta o movimiento interno.",
    iconName: "Layers",
    points: [
      "**Inventario Permanente (Perpetuo)**: Es el modelo de Odoo. Actualiza el stock en tiempo real frente a cada entrada o salida física de mercancía.",
      "**Inventario Inicial**: Representa el saldo inicial de stock real con el cual se abren operaciones al inicializar del software.",
      "**Inventario Físico / Cíclico**: Auditoría manual en estanterías reales para contrastar físicamente los conteos contra la base de datos lógica de Odoo."
    ],
    quiz: [
      {
        id: "q2_101_1",
        question: "¿Cuál de las siguientes opciones define mejor la importancia del Inventario Permanente en Odoo?",
        options: [
          "Actualiza el stock en tiempo real con cada movimiento logístico, sin esperar al cierre de mes.",
          "Evita tener mercancía pesada en el almacén físico.",
          "Solo sirve para contar mercancías dañadas al final de la jornada laboral."
        ],
        answerIndex: 0,
        explanation: "El inventario permanente o perpetuo actualiza de forma automática y en tiempo real el stock remanente lógicamente con cualquier evento (compra, venta, merma, transferencia)."
      },
      {
        id: "q2_101_2",
        question: "¿Qué representa un \"Inventario Físico / Cíclico\" en la práctica con Odoo?",
        options: [
          "El stock estimado por algoritmos de inteligencia artificial sin contar productos físicamente.",
          "La suma de productos comprados en el extranjero pendientes de embarque.",
          "Una auditoría manual periódica para verificar y ajustar el stock real contra los conteos del ERP."
        ],
        answerIndex: 2,
        explanation: "Un inventario físico o cíclico es un conteo periódico real en las estanterías de la bodega para conciliar y ajustar posibles discrepancias con el stock lógico de Odoo."
      }
    ]
  },
  {
    id: 102,
    title: "2. Partida Doble en Logística",
    summary: "Odoo aplica el concepto tradicional de partida doble contable: los productos no aparecen ni desaparecen de la nada; simplemente cambian de ubicación física o virtual.",
    iconName: "Workflow",
    points: [
      "**Principio de Partida Doble**: Todo movimiento de stock genera un registro inmutable con una ubicación de origen exacta y una de destino.",
      "**Trazabilidad total**: Si se vende un artículo, se transfiere desde la Ubicación de Existencias hacia la Ubicación Virtual de Clientes.",
      "**Ubicaciones virtuales de contrapartida**: Se usan para representar el mundo exterior (Proveedores, Clientes, Inventarios de Ajuste, Merma/Desechos)."
    ],
    quiz: [
      {
        id: "q2_102_1",
        question: "Si entregamos un despacho por venta de producto en Odoo, ¿cuál es el movimiento de ubicaciones correcto?",
        options: [
          "Desde Ubicación Virtual de Clientes hacia Ubicación de Existencias (WH/Stock).",
          "Desde Ubicación de Existencias (WH/Stock) hacia Ubicación Virtual de Clientes.",
          "Desde Ubicación de Desechos hacia la ubicación de inventario de ajustes."
        ],
        answerIndex: 1,
        explanation: "Al vender, el stock físico abandona nuestro depósito real ('WH/Stock') y se traslada lógicamente al cliente ('Virtual Locations/Customers')."
      },
      {
        id: "q2_102_2",
        question: "En Odoo ERP, ¿qué es una \"Ubicación Virtual\"?",
        options: [
          "Una contrapartida lógica que representa entidades externas (como clientes, proveedores o mermas) para mantener la partida doble logística.",
          "Una dirección física en la bodega que cuenta con realidad virtual de última generación.",
          "Un almacén en la nube operado exclusivamente por servidores externos de Google."
        ],
        answerIndex: 0,
        explanation: "Odoo no elimina ni crea productos mágicamente; las ubicaciones virtuales sirven como el origen o destino contable para representar la procedencia o destino real (clientes, proveedores, pérdidas, etc.)."
      }
    ]
  },
  {
    id: 103,
    title: "3. Recepciones y Entregas (Entradas / Salidas)",
    summary: "Aprende a ejecutar y gobernar las entradas físicas de proveedores (Inbound) y las salidas de mercancías de clientes (Outbound).",
    iconName: "Truck",
    points: [
      "**Recepciones (Inbound)**: Ingreso de mercancía que compramos. Genera un documento y flujo de tipo IN (ej. WH/IN/00001).",
      "**Entregas (Outbound)**: Despacho y egreso de existencias a clientes finales por ventas, generando un documento tipo OUT (ej. WH/OUT/00001).",
      "**Pasos logísticos habituales**: Las recepciones exigen (Inspección -> Validación cuantitativa -> Ubicado en estanterías), y las entregas exigen (Picking o recolección -> Packing o empaquetado -> Despacho)."
    ],
    quiz: [
      {
        id: "q2_103_1",
        question: "¿Qué código o nomenclatura genérica asigna Odoo para una operación de entrada proveniente de un proveedor?",
        options: [
          "Documento de transferencia interna WH/INT.",
          "Documento tipo OUT de Despacho rápido.",
          "Documento tipo WH/IN/XXXXX de Recepciones."
        ],
        answerIndex: 2,
        explanation: "Las transacciones de entrada (Inbound / Recepciones) son prefijadas clásicamente por Odoo con las iniciales de entrada/recepción (ej. WH/IN/XXXXX)."
      },
      {
        id: "q2_103_2",
        question: "¿Cuál es la secuencia lógica habitual de pasos en un flujo clásico de entrega (Outbound) a clientes?",
        options: [
          "Recolección (Picking) -> Empaquetado (Packing) -> Despacho (Shipping).",
          "Devaluación inmediata -> Auditoría fiscal -> Ajuste negativo.",
          "Facturación ciega -> Pago internacional -> Compra de materia prima."
        ],
        answerIndex: 0,
        explanation: "El proceso clásico de salida (Outbound) pasa secuencialmente por recolectar el stock (Picking), acondicionar el paquete (Packing) y enviarlo al transportista (Shipping)."
      }
    ]
  },
  {
    id: 104,
    title: "4. Ajustes y Mermas de Inventario",
    summary: "El mundo real sufre discrepancias (productos dañados, mermas, pérdidas). Odoo soluciona esto mediante Ajustes de Inventario automáticos.",
    iconName: "Settings",
    points: [
      "**Ajustes de Stock**: Permite ingresar la cantidad exacta contada en estanterías físicas para actualizar los saldos lógicos del ERP Odoo.",
      "**Diferencia de Existencias**: Si la cantidad contada es menor a la teórica, Odoo hace una salida automática a una ubicación virtual de Ajuste (`Virtual Locations/Inventory Adjustment`).",
      "**Diferencia física negativa**: Se traduce en una pérdida o merma que equilibra de inmediato el balance físico real y el contable."
    ],
    quiz: [
      {
        id: "q2_104_1",
        question: "Si contamos físicamente 19 escritorios pero el sistema dice que hay 20, ¿qué genera Odoo para corregir la discrepancia?",
        options: [
          "Un movimiento manual de compras por 1 unidad extra.",
          "Odoo genera un movimiento automático de salida por 1 unidad hacia la ubicación virtual de desvío o ajuste, igualando el stock real.",
          "El sistema bloquea la facturación indefinidamente hasta reponer el stock extraviado físicamente."
        ],
        answerIndex: 1,
        explanation: "Odoo calcula la diferencia (-1) y emite un movimiento de inventario correctivo automático de salida de stock real hacia la ubicación virtual para sincerar las cifras lógicas."
      },
      {
        id: "q2_104_2",
        question: "¿Cuándo se debe utilizar la ubicación virtual de 'Desechos/Mermas' (Scrap) en lugar de un Ajuste de Inventario común?",
        options: [
          "Cuando el producto está defectuoso o inservible y debe ser retirado definitivamente del circuito comercial.",
          "Cuando queremos transferir mercancía en perfecto estado entre sucursales principales.",
          "Cuando el cliente solicita un descuento en caja por compras al por mayor."
        ],
        answerIndex: 0,
        explanation: "El Scrap o Desecho se utiliza para registrar merma o deterioro inservible, enviando el stock a una ubicación de pérdida física definitiva que no volverá a usarse."
      }
    ]
  },
  {
    id: 105,
    title: "5. Consultas y Reportes de Stock",
    summary: "Aprende a auditar qué tenemos en almacén (Stock a mano), qué tendremos a futuro (Stock Pronosticado) y el historial inmutable de movimientos.",
    iconName: "Compass",
    points: [
      "**Cantidad a Mano (On Hand)**: Es el inventario físico real neto ubicado físicamente en nuestro almacén en este preciso momento.",
      "**Stock Pronosticado (Forecasted)**: Calcula las tendencias de inventario futuras sumando el stock actual + recepciones programadas - entregas reservadas.",
      "**Movimientos de Stock**: Pantalla de auditoría de Odoo que exhibe secuencialmente cada transferencia de stock con su fecha, origen, destino y cantidad."
    ],
    quiz: [
      {
        id: "q2_105_1",
        question: "¿Para qué sirve el reporte de 'Stock Pronosticado' en Odoo WMS?",
        options: [
          "Para ver qué productos se vencen más rápido.",
          "Para calcular existencias futuras contemplando compras validadas por ingresar y ventas programadas por despachar.",
          "Para contar los productos que los clientes ya se llevaron físicamente el año pasado."
        ],
        answerIndex: 1,
        explanation: "El stock pronosticado brinda visibilidad del futuro cercano de existencias para que el negocio tome preventivamente decisiones de abastecimiento o marketing."
      },
      {
        id: "q2_105_2",
        question: "¿Cuál es la diferencia clave entre 'Cantidad a mano' (On Hand) y 'Cantidad reservada' en los reportes de Odoo?",
        options: [
          "La de reserva se almacena en bodegas de otros proveedores y la de mano es virtual.",
          "El stock reservado no existe porque aún no se ha comprado ni cotizado.",
          "El de mano es el stock que se encuentra de verdad en el almacén físico; el reservado ya tiene dueño (pedidos pendientes de entrega)."
        ],
        answerIndex: 2,
        explanation: "La cantidad a mano representa el stock real que físicamente yace en tu almacén en este momento, mientras que la reservada se refiere a unidades ya comprometidas en pedidos de ventas."
      }
    ]
  }
];
