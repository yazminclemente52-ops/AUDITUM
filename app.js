/**
 * AUDITUM - LÓGICA PRINCIPAL DE LA APLICACIÓN
 * Inspecci&#243;n de Calidad de Componentes de Acero
 */

// ==================== ESTADO GLOBAL Y CATÁLOGOS ====================
// Mapeo estricto de Planta:
// FABS: LTTT, MTTT, MG, WTS, LWL 988, LWL 990, MWL, PUERTAS, OHT, LMT
// EDIFICIO K: LOW VOLUME, LMT K, COBOT
// Nave fÃ­sica de producciÃ³n (FABS vs EDIFICIO K)
const LINEA_NAVE_MAP = {
  "LTTT": "FABS",
  "MTTT": "FABS",
  "MG": "FABS",
  "WTS": "FABS",
  "LWL 988": "FABS",
  "LWL 990": "FABS",
  "MWL": "FABS",
  "PUERTAS": "FABS",
  "OHT": "FABS",
  "LMT": "FABS",
  "LOW VOLUME": "EDIFICIO K",
  "LOW": "EDIFICIO K",
  "LMT K": "EDIFICIO K",
  "COBOT": "EDIFICIO K"
};

// Las 13 lÃ­neas de FABS y Edificio K pertenecen estrictamente al Ã¡rea de SOLDADURA
const LINEA_AREA_MAP = {
  // FABS (10 L&#237;neas pertenecen al Ãrea de SOLDADURA)
  "LTTT": "SOLDADURA",
  "MTTT": "SOLDADURA",
  "MG": "SOLDADURA",
  "WTS": "SOLDADURA",
  "LWL 988": "SOLDADURA",
  "LWL 990": "SOLDADURA",
  "MWL": "SOLDADURA",
  "PUERTAS": "SOLDADURA",
  "OHT": "SOLDADURA",
  "LMT": "SOLDADURA",
  // EDIFICIO K (3 L&#237;neas pertenecen al Ãrea de SOLDADURA)
  "LOW VOLUME": "SOLDADURA",
  "LMT K": "SOLDADURA",
  "COBOT": "SOLDADURA",
  // PINTURA (4 L&#237;neas / Ãreas del proceso de pintura)
  
  "Carga Paint": "PINTURA",
  "Sellado Paint": "PINTURA",
  "Preparacion Paint": "PINTURA",
  "PreparaciÃ³n Paint": "PINTURA"
};

function getNaveForModel(modelName) {
  return LINEA_NAVE_MAP[modelName] || "FABS";
}

function matchItemArea(item, filterArea) {
  if (!filterArea || filterArea === "all" || filterArea === "") return true;
  const f = String(filterArea).toUpperCase().trim();
  const a = String(item.area_ubicacion || "").toUpperCase().trim();
  const m = String(item.modelo || "").toUpperCase().trim();

  // 1. Filtro especÃ­fico FABS (10 lÃ­neas de Soldadura en FABS)
  if (f === "FABS" || f === "FAB") {
    if (a === "FABS" || a.indexOf("FABS") !== -1 || a.indexOf("FAB") !== -1) return true;
    if (LINEA_NAVE_MAP[item.modelo] === "FABS") return true;
    return false;
  }

  // 2. Filtro especÃ­fico EDIFICIO K (3 lÃ­neas de Soldadura en Edificio K)
  if (f === "EDIFICIO K" || f === "EDIFICIO_K" || f === "EDIF K" || f === "K") {
    if (a === "EDIFICIO K" || a.indexOf("EDIFICIO K") !== -1 || a === "K" || a.indexOf("EDIF") !== -1) return true;
    if (LINEA_NAVE_MAP[item.modelo] === "EDIFICIO K") return true;
    return false;
  }

  // 3. Filtro SOLDADURA general (Engloba FABS y EDIFICIO K)
  if (f === "SOLDADURA") {
    if (a === "SOLDADURA" || a === "FABS" || a === "EDIFICIO K" || a.indexOf("SOLDADURA") !== -1) return true;
    if (LINEA_AREA_MAP[item.modelo] === "SOLDADURA") return true;
    return false;
  }

  // 4. Filtro PINTURA (Engloba MPR, Carga Paint, Sellado Paint, Preparacion Paint)
  if (f === "PINTURA") {
    if (a === "PINTURA" || a.indexOf("PINTURA") !== -1 || a.indexOf("PAINT") !== -1 ) return true;
    if (a.indexOf("CARGA") !== -1 || a.indexOf("SELLADO") !== -1 || a.indexOf("PREPARAC") !== -1) return true;
    if (LINEA_AREA_MAP[item.modelo] === "PINTURA"  || m.indexOf("PAINT") !== -1) return true;
    return false;
  }
  if (f === "CARGA PAINT" || f === "CARGA") {
    return a.indexOf("CARGA") !== -1 || m.indexOf("CARGA") !== -1;
  }
  if (f === "SELLADO PAINT" || f === "SELLADO") {
    return a.indexOf("SELLADO") !== -1 || m.indexOf("SELLADO") !== -1;
  }
  if (f === "PREPARACION PAINT" || f === "PREPARACION") {
    return a.indexOf("PREPARAC") !== -1 || m.indexOf("PREPARAC") !== -1;
  }

  // 6. ENSAMBLE y FOS
  if (f === "ENSAMBLE") {
    return a === "ENSAMBLE" || a.indexOf("ENSAMBLE") !== -1 || m.indexOf("ENSAMBLE") !== -1;
  }
  if (f === "FOS") {
    return a === "FOS" || a.indexOf("FOS") !== -1 || m.indexOf("FOS") !== -1;
  }

  return a === f || a.indexOf(f) !== -1 || m === f;
}

function getAreaForModel(modelName) {
  return LINEA_AREA_MAP[modelName] || "SOLDADURA";
}

const DEFAULT_CATALOGOS = {
  areas: [
    "SOLDADURA",
    "PINTURA",
    
    "Carga Paint",
    "Sellado Paint",
    "Preparacion Paint",
    "ENSAMBLE",
    "FOS"
  ],
  modelos: [
    // FABS (10 L&#237;neas de Soldadura)
    "LTTT", "MTTT", "MG", "WTS", "LWL 988", "LWL 990", "MWL", "PUERTAS", "OHT", "LMT",
    // EDIFICIO K (3 L&#237;neas de Soldadura)
    "LOW VOLUME", "LMT K", "COBOT",
    // PINTURA (4 L&#237;neas de Pintura)
    "Carga Paint", "Sellado Paint", "Preparacion Paint"
  ],
  tiposEvidencia: ["Retrabajar", "Por golpe", "Por mala soldadura", "Por falta de un componente", "Scrap"]
};

// Metas predeterminadas de piezas por línea de producción y modelo
const DEFAULT_METAS = {
  areas: {
    "EDIFICIO K": 10,
    "FABS": 14,
    "SOLDADURA": 24,
    "PINTURA": 16,
    
    "Carga Paint": 4,
    "Sellado Paint": 4,
    "Preparacion Paint": 4,
    "ENSAMBLE": 12,
    "FOS": 8
  },
  modelos: {
    "LTTT": 2, "MTTT": 2, "MG": 2, "WTS": 2, "LWL 988": 1, "LWL 990": 1,
    "MWL": 1, "PUERTAS": 2, "OHT": 2, "LMT": 2,
    "LOW VOLUME": 1, "LMT K": 1, "COBOT": 1,
     "Carga Paint": 4, "Sellado Paint": 4, "Preparacion Paint": 4
  }
};

const DEFAULT_COMPONENTES = [
  // FABS (10 líneas de producción)
  { numero_parte: "PN-8420-LTT", modelo: "LTTT", familia: "Torres", area: "FABS", criterio: "Inspecci&#243;n dimensional de ensamble y cordones AWS D1.1" },
  { numero_parte: "PN-5130-MTT", modelo: "MTTT", familia: "Torres", area: "FABS", criterio: "Verificación de barrenos de anclaje y perpendicularidad" },
  { numero_parte: "PN-4720-MG", modelo: "MG", familia: "Estructural", area: "FABS", criterio: "Soldadura libre de socavaciones o porosidad" },
  { numero_parte: "PN-4300-WTS", modelo: "WTS", familia: "Tanques y Soldadura", area: "FABS", criterio: "Hermeticidad en cordones de soldadura y ensamble estanco" },
  { numero_parte: "PN-9880-LWL", modelo: "LWL 988", familia: "Cargadores", area: "FABS", criterio: "Inspecci&#243;n de cordones estructurales y bujes" },
  { numero_parte: "PN-9900-LWL", modelo: "LWL 990", familia: "Cargadores", area: "FABS", criterio: "Alineación de brazos y soldadura perimetral" },
  { numero_parte: "PN-3140-MWL", modelo: "MWL", familia: "Ruedas", area: "FABS", criterio: "Escuadra, balance y torque en tornillería" },
  { numero_parte: "PN-7200-PTS", modelo: "PUERTAS", familia: "Cabinas", area: "FABS", criterio: "Holgura perimetral uniforme y ajuste de bisagras" },
  { numero_parte: "PN-7340-OHT", modelo: "OHT", familia: "Estructuras", area: "FABS", criterio: "Tolerancia dimensional ±1.5 mm y acabado superficial" },
  { numero_parte: "PN-6210-LMT", modelo: "LMT", familia: "Estructuras", area: "FABS", criterio: "Planicidad en placas de unión y cordón continuo" },

    // EDIFICIO K (3 lÃ­neas de producciÃ³n)
  { numero_parte: "PN-1950-LV", modelo: "LOW VOLUME", familia: "Estructural Especial", area: "EDIFICIO K", criterio: "Espesor de recubrimiento min 80 micras sin escurrimientos" },
  { numero_parte: "PN-2080-LTK", modelo: "LMT K", familia: "Estructuras K", area: "EDIFICIO K", criterio: "Control geomÃ©trico en nave EDIFICIO K" },
  { numero_parte: "PN-8800-CBT", modelo: "COBOT", familia: "RobÃ³tica", area: "EDIFICIO K", criterio: "Base nivelada, concentricidad y torque de pernos" },

  // PINTURA (4 L&#237;neas / Ãreas de Proceso)
  { numero_parte: "PN-9200-CGP", modelo: "Carga Paint", familia: "Proceso Pintura", area: "Carga Paint", criterio: "Colgado seguro en transportador, limpieza previa y libre de grasa" },
  { numero_parte: "PN-9300-SLP", modelo: "Sellado Paint", familia: "Sellos y PolÃ­meros", area: "Sellado Paint", criterio: "CordÃ³n continuo de sellador en empates estructurales sin burbujas" },
  { numero_parte: "PN-9400-PRP", modelo: "Preparacion Paint", familia: "Pretratamiento", area: "Preparacion Paint", criterio: "Desengrase alcalino, fosfatizado homogÃ©neo y prueba de adherencia" }
];

const SUPERVISORES_POR_LINEA = {
  "LTTT": { nomina: 4001, nombre: "Sup. L&#237;nea LTTT - Ing. Héctor Morales", area: "FABS" },
  "MTTT": { nomina: 4002, nombre: "Sup. L&#237;nea MTTT - Ing. Ricardo Silva", area: "FABS" },
  "MG": { nomina: 4003, nombre: "Sup. L&#237;nea MG - Ing. Fernando Castro", area: "FABS" },
  "WTS": { nomina: 4004, nombre: "Sup. L&#237;nea WTS - Ing. Alejandro Vargas", area: "FABS" },
  "LWL 988": { nomina: 4005, nombre: "Sup. L&#237;nea LWL 988 - Ing. Daniel Ortega", area: "FABS" },
  "LWL 990": { nomina: 4006, nombre: "Sup. L&#237;nea LWL 990 - Ing. Jorge Domínguez", area: "FABS" },
  "MWL": { nomina: 4007, nombre: "Sup. L&#237;nea MWL - Ing. Eduardo Ríos", area: "FABS" },
  "PUERTAS": { nomina: 4008, nombre: "Sup. L&#237;nea PUERTAS - Ing. Arturo Méndez", area: "FABS" },
  "OHT": { nomina: 4009, nombre: "Sup. L&#237;nea OHT - Ing. Sergio Navarro", area: "FABS" },
  "LMT": { nomina: 4010, nombre: "Sup. L&#237;nea LMT - Ing. Raúl Herrera", area: "FABS" },
  "LOW VOLUME": { nomina: 4011, nombre: "Sup. L&#237;nea LOW VOLUME - Ing. Víctor Hugo Cruz", area: "EDIFICIO K" },
  "LMT K": { nomina: 4012, nombre: "Sup. L&#237;nea LMT K - Ing. Óscar Delgado", area: "EDIFICIO K" },
    "COBOT": { nomina: 4013, nombre: "Sup. L&#237;nea COBOT - Ing. Mario Alberto TreviÃ±o", area: "EDIFICIO K" },
  "Carga Paint": { nomina: 4015, nombre: "Sup. Carga Paint - Ing. Roberto Almanza", area: "PINTURA" },
  "Sellado Paint": { nomina: 4016, nombre: "Sup. Sellado Paint - Ing. Gabriel Mendoza", area: "PINTURA" },
  "Preparacion Paint": { nomina: 4017, nombre: "Sup. Preparacion Paint - Ing. Luis Fernando Soto", area: "PINTURA" }
};

const DEFAULT_USUARIOS = [
  // Coordinadores / QG de Calidad
  { nomina: 1042, password: "1042", nombre: "Juan Pérez Martínez (Coordinador / QG)", rol: "colaborador", turno: "Turno 1 (Matutino)", email: "jperez@acero.com" },
  { nomina: 1150, password: "1150", nombre: "Miguel Ángel Rojas (Coordinador / QG)", rol: "colaborador", turno: "Turno 2 (Vespertino)", email: "mrojas@acero.com" },
  { nomina: 1210, password: "1210", nombre: "Luis Fernando Torres (Coordinador / QG)", rol: "colaborador", turno: "Turno 3 (Nocturno)", email: "ltorres@acero.com" },
  // Supervisor General y Gerente
  { nomina: 2088, password: "2088", nombre: "Ing. Carlos Mendoza", rol: "supervisor", turno: "Mixto", email: "cmendoza@acero.com" },
  { nomina: 3015, password: "3015", nombre: "Ing. Roberto Garza", rol: "gerente", turno: "General", email: "rgarza@acero.com" },
  // Supervisores de L&#237;neas (Todas las 13 L&#237;neas de Producci&#243;n: FABS y EDIFICIO K)
  { nomina: 4008, password: "4008", nombre: "Sup. L&#237;nea PUERTAS - Ing. Arturo Méndez", rol: "supervisor_linea", linea: "PUERTAS", area: "FABS", turno: "Turno 1 (Matutino)", email: "amendez@acero.com" },
  { nomina: 4009, password: "4009", nombre: "Sup. L&#237;nea OHT - Ing. Sergio Navarro", rol: "supervisor_linea", linea: "OHT", area: "FABS", turno: "Turno 1 (Matutino)", email: "snavarro@acero.com" },
  { nomina: 4005, password: "4005", nombre: "Sup. L&#237;nea LWL 988 - Ing. Daniel Ortega", rol: "supervisor_linea", linea: "LWL 988", area: "FABS", turno: "Turno 1 (Matutino)", email: "dortega@acero.com" },
  { nomina: 4006, password: "4006", nombre: "Sup. L&#237;nea LWL 990 - Ing. Jorge Domínguez", rol: "supervisor_linea", linea: "LWL 990", area: "FABS", turno: "Turno 1 (Matutino)", email: "jdominguez@acero.com" },
  { nomina: 4007, password: "4007", nombre: "Sup. L&#237;nea MWL - Ing. Eduardo Ríos", rol: "supervisor_linea", linea: "MWL", area: "FABS", turno: "Turno 1 (Matutino)", email: "erios@acero.com" },
  { nomina: 4001, password: "4001", nombre: "Sup. L&#237;nea LTTT - Ing. Héctor Morales", rol: "supervisor_linea", linea: "LTTT", area: "FABS", turno: "Turno 1 (Matutino)", email: "hmorales@acero.com" },
  { nomina: 4002, password: "4002", nombre: "Sup. L&#237;nea MTTT - Ing. Ricardo Silva", rol: "supervisor_linea", linea: "MTTT", area: "FABS", turno: "Turno 1 (Matutino)", email: "rsilva@acero.com" },
  { nomina: 4003, password: "4003", nombre: "Sup. L&#237;nea MG - Ing. Fernando Castro", rol: "supervisor_linea", linea: "MG", area: "FABS", turno: "Turno 1 (Matutino)", email: "fcastro@acero.com" },
  { nomina: 4004, password: "4004", nombre: "Sup. L&#237;nea WTS - Ing. Alejandro Vargas", rol: "supervisor_linea", linea: "WTS", area: "FABS", turno: "Turno 1 (Matutino)", email: "avargas@acero.com" },
  { nomina: 4010, password: "4010", nombre: "Sup. L&#237;nea LMT - Ing. Raúl Herrera", rol: "supervisor_linea", linea: "LMT", area: "FABS", turno: "Turno 1 (Matutino)", email: "rherrera@acero.com" },
  { nomina: 4011, password: "4011", nombre: "Sup. L&#237;nea LOW VOLUME - Ing. Víctor Hugo Cruz", rol: "supervisor_linea", linea: "LOW VOLUME", area: "EDIFICIO K", turno: "Turno 1 (Matutino)", email: "vcruz@acero.com" },
  { nomina: 4012, password: "4012", nombre: "Sup. L&#237;nea LMT K - Ing. Óscar Delgado", rol: "supervisor_linea", linea: "LMT K", area: "EDIFICIO K", turno: "Turno 1 (Matutino)", email: "odelgado@acero.com" },
  { nomina: 4013, password: "4013", nombre: "Sup. L&#237;nea COBOT - Ing. Mario Alberto Treviño", rol: "supervisor_linea", linea: "COBOT", area: "EDIFICIO K", turno: "Turno 1 (Matutino)", email: "mtrevino@acero.com" }
];

const DEFAULT_CABINAS_COORDINADOR = [
  {
    id: "CAB-REQ-001",
    linea: "PUERTAS",
    area: "FABS",
    estacion: "Estación 4 - Ensamble Final de Cabina",
    numero_parte: "PN-7200-PTS",
    serie_cabina: "CAB-2026-9041",
    tipo_cabina: "Cabina Operador Estándar",
    hora_finalizada: "08:45",
    fecha: "2026-10-26",
    solicitante: "Sup. L&#237;nea PUERTAS - Ing. Arturo Méndez (4008)",
    supervisor_linea: "Sup. L&#237;nea PUERTAS - Ing. Arturo Méndez (4008)",
    coordinador_solicitado: "Juan Pérez Martínez - Coordinador / QG (1042)",
    turno: "Turno 1 (Matutino)",
    minutos_espera: 18,
    estatus: "Esperando Coordinador",
    coordinador_asignado: null,
    criterios: [
      "Holgura perimetral uniforme y ajuste de bisagras",
      "Sellado hermético y burletes perimetrales",
      "Torque verificado en pernos estructurales",
      "Pintura uniforme sin rayones ni escurrimientos"
    ],
    notas: "Solicito apoyo de QG en Estación 4 para verificar holgura de puertas y sellos perimetrales para liberar cabina."
  },
  {
    id: "CAB-REQ-002",
    linea: "OHT",
    area: "FABS",
    estacion: "Bahía 2 - Salida de Cabina",
    numero_parte: "PN-7340-OHT",
    serie_cabina: "CAB-2026-9045",
    tipo_cabina: "Cabina ROP/FOP Camión Minería",
    hora_finalizada: "08:30",
    fecha: "2026-10-26",
    solicitante: "Sup. L&#237;nea OHT - Ing. Sergio Navarro (4009)",
    supervisor_linea: "Sup. L&#237;nea OHT - Ing. Sergio Navarro (4009)",
    coordinador_solicitado: "Miguel Ángel Rojas - Coordinador / QG (1150)",
    turno: "Turno 1 (Matutino)",
    minutos_espera: 33,
    estatus: "Esperando Coordinador",
    coordinador_asignado: null,
    criterios: [
      "Estructura ROPS/FOPS certificada",
      "Cordones de soldadura de anclaje continuo",
      "Alineación de soporte de consola y piso",
      "Vidrios y empaques estancos instalados"
    ],
    notas: "Cabina reforzada finalizada en Bahía 2. El Supervisor de L&#237;nea OHT requiere al Coordinador / QG para sello de liberación antes de pasar a pintura."
  },
  {
    id: "CAB-REQ-003",
    linea: "LWL 988",
    area: "FABS",
    estacion: "Estación 6 - Cabina Cargador",
    numero_parte: "PN-9880-LWL",
    serie_cabina: "CAB-2026-9048",
    tipo_cabina: "Cabina Presurizada 988",
    hora_finalizada: "08:52",
    fecha: "2026-10-26",
    solicitante: "Sup. L&#237;nea LWL 988 - Ing. Daniel Ortega (4005)",
    supervisor_linea: "Sup. L&#237;nea LWL 988 - Ing. Daniel Ortega (4005)",
    coordinador_solicitado: "Luis Fernando Torres - Coordinador / QG (1210)",
    turno: "Turno 1 (Matutino)",
    minutos_espera: 11,
    estatus: "Esperando Coordinador",
    coordinador_asignado: null,
    criterios: [
      "Presurización y prueba de estanqueidad",
      "Ensamble de columna de dirección y asiento",
      "Alineación dimensional ±1.0 mm",
      "Fijación de paneles acústicos interiores"
    ],
    notas: "Supervisor de L&#237;nea LWL 988 envía datos de cabina terminada: requiere firma de QG en Estación 6 para avanzar a línea de prueba."
  }
];

const SAMPLE_INSPECCIONES = [
  {
    id_inspeccion: "INSP-2026-0001",
    fecha_creacion: "2026-10-05 08:30:00",
    nomina_creador: 1042,
    numero_parte: "PN-8420-LTT",
    modelo: "LTTT",
    numero_serie: "SER-2026-8801",
    area_ubicacion: "FABS",
    estatus: "Pausado",
    tiene_faltantes: "SI",
    descripcion_faltantes: "Faltan 4 cartabones de refuerzo en extremo B",
    responsable_nombre: "José Hernández Rivera",
    responsable_nomina: "5012",
    responsable_motivo: "Nuevo ingreso",
    responsable_observaciones: "Tiene 4 dÍas en la estaciÓn; omitiÓ colocaciÓn de cartabones por duda en plano de ensamble.",
    retroalimentacion_estatus: "Pendiente",
    retroalimentacion_fecha: "",
    fecha_liberacion: "",
    nomina_liberador: "",
    url_reporte_pdf: "",
    version_reporte: "1.0",
    desbloqueada_edicion: true,
    desbloqueada_por: 2088,
    turnos: [
      {
        id_turno: "TRN-001",
        nomina_colaborador: 1042,
        turno: "Turno 1 (Matutino)",
        hora_inicio: "2026-10-05 08:30:00",
        hora_fin: "2026-10-05 09:05:00",
        minutos: 35,
        estatus_entrega: "Pausado por Fin de Turno",
        notas: "Se revisó cordón longitudinal, faltan cartabones para soldadura."
      }
    ],
    fotos: []
  },
  {
    id_inspeccion: "INSP-2026-0002",
    fecha_creacion: "2026-10-05 14:10:00",
    nomina_creador: 1150,
    numero_parte: "PN-5130-MTT",
    modelo: "MTTT",
    numero_serie: "SER-2026-8802",
    area_ubicacion: "FABS",
    estatus: "Liberado",
    tiene_faltantes: "NO",
    descripcion_faltantes: "",
    fecha_liberacion: "2026-10-05 17:30:00",
    nomina_liberador: 2088,
    url_reporte_pdf: "",
    version_reporte: "1.0",
    desbloqueada_edicion: false,
    turnos: [
      {
        id_turno: "TRN-002",
        nomina_colaborador: 1150,
        turno: "Turno 2 (Vespertino)",
        hora_inicio: "2026-10-05 14:10:00",
        hora_fin: "2026-10-05 14:40:00",
        minutos: 30,
        estatus_entrega: "Concluido",
        notas: "Barrenos de anclaje concéntricos y alineados."
      }
    ],
    fotos: []
  },
  {
    id_inspeccion: "INSP-2026-0003",
    fecha_creacion: "2026-10-06 09:15:00",
    nomina_creador: 1042,
    numero_parte: "PN-9880-LWL",
    modelo: "LWL 988",
    numero_serie: "SER-2026-8803",
    area_ubicacion: "FABS",
    estatus: "Liberado",
    tiene_faltantes: "NO",
    descripcion_faltantes: "",
    fecha_liberacion: "2026-10-06 12:45:00",
    nomina_liberador: 2088,
    url_reporte_pdf: "",
    version_reporte: "1.0",
    desbloqueada_edicion: false,
    turnos: [
      {
        id_turno: "TRN-003",
        nomina_colaborador: 1042,
        turno: "Turno 1 (Matutino)",
        hora_inicio: "2026-10-06 09:15:00",
        hora_fin: "2026-10-06 09:47:00",
        minutos: 32,
        estatus_entrega: "Concluido",
        notas: "Pintura uniforme a 95 micras, sin porosidades."
      }
    ],
    fotos: []
  },
  {
    id_inspeccion: "INSP-2026-0004",
    fecha_creacion: "2026-10-08 11:20:00",
    nomina_creador: 1042,
    numero_parte: "PN-7340-OHT",
    modelo: "OHT",
    numero_serie: "SER-2026-8804",
    area_ubicacion: "FABS",
    estatus: "Liberado",
    tiene_faltantes: "NO",
    descripcion_faltantes: "",
    fecha_liberacion: "2026-10-08 14:10:00",
    nomina_liberador: 2088,
    url_reporte_pdf: "",
    version_reporte: "1.0",
    desbloqueada_edicion: false,
    turnos: [
      {
        id_turno: "TRN-004",
        nomina_colaborador: 1042,
        turno: "Turno 1 (Matutino)",
        hora_inicio: "2026-10-08 11:20:00",
        hora_fin: "2026-10-08 11:48:00",
        minutos: 28,
        estatus_entrega: "Concluido",
        notas: "Estructura OHT con tolerancias dentro de ±1.0 mm."
      }
    ],
    fotos: []
  },
  {
    id_inspeccion: "INSP-2026-0005",
    fecha_creacion: "2026-10-09 16:00:00",
    nomina_creador: 1150,
    numero_parte: "PN-7200-PTS",
    modelo: "PUERTAS",
    numero_serie: "SER-2026-8805",
    area_ubicacion: "FABS",
    estatus: "Rechazado",
    tiene_faltantes: "SI",
    descripcion_faltantes: "Defecto en bisagra y golpe en esquina superior",
    fecha_liberacion: "2026-10-09 18:00:00",
    nomina_liberador: 2088,
    url_reporte_pdf: "",
    version_reporte: "1.1",
    desbloqueada_edicion: false,
    turnos: [
      {
        id_turno: "TRN-005",
        nomina_colaborador: 1150,
        turno: "Turno 2 (Vespertino)",
        hora_inicio: "2026-10-09 16:00:00",
        hora_fin: "2026-10-09 16:25:00",
        minutos: 25,
        estatus_entrega: "Scrap",
        notas: "Rechazado por descuadre en bisagra no recuperable."
      }
    ],
    fotos: []
  },
  {
    id_inspeccion: "INSP-2026-0006",
    fecha_creacion: "2026-10-09 10:05:00",
    nomina_creador: 1042,
    numero_parte: "PN-8800-CBT",
    modelo: "COBOT",
    numero_serie: "SER-2026-8806",
    area_ubicacion: "EDIFICIO K",
    estatus: "Liberado",
    tiene_faltantes: "NO",
    descripcion_faltantes: "",
    fecha_liberacion: "2026-10-09 13:20:00",
    nomina_liberador: 2088,
    url_reporte_pdf: "",
    version_reporte: "1.0",
    desbloqueada_edicion: false,
    turnos: [
      {
        id_turno: "TRN-006",
        nomina_colaborador: 1042,
        turno: "Turno 1 (Matutino)",
        hora_inicio: "2026-10-09 10:05:00",
        hora_fin: "2026-10-09 10:45:00",
        minutos: 40,
        estatus_entrega: "Concluido",
        notas: "Plataforma robótica Cobot torqueada conforme a norma."
      }
    ],
    fotos: []
  },
  {
    id_inspeccion: "INSP-2026-0007",
    fecha_creacion: "2026-10-05 22:15:00",
    nomina_creador: 1210,
    numero_parte: "PN-9900-LWL",
    modelo: "LWL 990",
    numero_serie: "SER-2026-8807",
    area_ubicacion: "FABS",
    estatus: "Liberado",
    tiene_faltantes: "NO",
    descripcion_faltantes: "",
    fecha_liberacion: "2026-10-05 23:45:00",
    nomina_liberador: 2088,
    url_reporte_pdf: "",
    version_reporte: "1.0",
    desbloqueada_edicion: false,
    turnos: [
      {
        id_turno: "TRN-007",
        nomina_colaborador: 1210,
        turno: "Turno 3 (Nocturno)",
        hora_inicio: "2026-10-05 22:15:00",
        hora_fin: "2026-10-05 22:50:00",
        minutos: 35,
        estatus_entrega: "Concluido",
        notas: "Brazos cargador alineados y soldados al 100% en Turno Nocturno."
      }
    ],
    fotos: []
  },
  {
    id_inspeccion: "INSP-2026-0008",
    fecha_creacion: "2026-10-06 15:30:00",
    nomina_creador: 1150,
    numero_parte: "PN-3140-MWL",
    modelo: "MWL",
    numero_serie: "SER-2026-8808",
    area_ubicacion: "FABS",
    estatus: "Liberado",
    tiene_faltantes: "NO",
    descripcion_faltantes: "",
    fecha_liberacion: "2026-10-06 18:15:00",
    nomina_liberador: 2088,
    url_reporte_pdf: "",
    version_reporte: "1.0",
    desbloqueada_edicion: false,
    turnos: [
      {
        id_turno: "TRN-008",
        nomina_colaborador: 1150,
        turno: "Turno 2 (Vespertino)",
        hora_inicio: "2026-10-06 15:30:00",
        hora_fin: "2026-10-06 16:02:00",
        minutos: 32,
        estatus_entrega: "Concluido",
        notas: "Rueda MWL balanceada y escuadrada en Turno Vespertino."
      }
    ],
    fotos: []
  },
  {
    id_inspeccion: "INSP-2026-0009",
    fecha_creacion: "2026-10-10 22:00:00",
    nomina_creador: 1210,
    numero_parte: "PN-1950-LV",
    modelo: "LOW VOLUME",
    numero_serie: "SER-2026-8809",
    area_ubicacion: "EDIFICIO K",
    estatus: "Liberado",
    tiene_faltantes: "NO",
    descripcion_faltantes: "",
    fecha_liberacion: "2026-10-10 23:30:00",
    nomina_liberador: 2088,
    url_reporte_pdf: "",
    version_reporte: "1.0",
    desbloqueada_edicion: false,
    turnos: [
      {
        id_turno: "TRN-009",
        nomina_colaborador: 1210,
        turno: "Turno 3 (Nocturno)",
        hora_inicio: "2026-10-10 22:00:00",
        hora_fin: "2026-10-10 22:30:00",
        minutos: 30,
        estatus_entrega: "Concluido",
        notas: "Recubrimiento uniforme 85 micras inspeccionado en Turno 3."
      }
    ],
    fotos: []
  },
  {
    id_inspeccion: "INSP-2026-0010",
    fecha_creacion: "2026-10-07 14:15:00",
    nomina_creador: 1150,
    numero_parte: "PN-2080-LTK",
    modelo: "LMT K",
    numero_serie: "SER-2026-8810",
    area_ubicacion: "EDIFICIO K",
    estatus: "En Proceso",
    tiene_faltantes: "NO",
    descripcion_faltantes: "",
    fecha_liberacion: "",
    nomina_liberador: "",
    url_reporte_pdf: "",
    version_reporte: "1.0",
    desbloqueada_edicion: false,
    turnos: [
      {
        id_turno: "TRN-010",
        nomina_colaborador: 1150,
        turno: "Turno 2 (Vespertino)",
        hora_inicio: "2026-10-07 14:15:00",
        hora_fin: "2026-10-07 14:45:00",
        minutos: 30,
        estatus_entrega: "En Proceso",
        notas: "Iniciando chequeo dimensional en EDIFICIO K."
      }
    ],
    fotos: []
  },
  {
    id_inspeccion: "INSP-2026-0011",
    fecha_creacion: "2026-10-07 23:30:00",
    nomina_creador: 1210,
    numero_parte: "PN-4720-MG",
    modelo: "MG",
    numero_serie: "SER-2026-8811",
    area_ubicacion: "FABS",
    estatus: "Liberado",
    tiene_faltantes: "NO",
    descripcion_faltantes: "",
    fecha_liberacion: "2026-10-08 00:50:00",
    nomina_liberador: 2088,
    url_reporte_pdf: "",
    version_reporte: "1.0",
    desbloqueada_edicion: false,
    turnos: [
      {
        id_turno: "TRN-011",
        nomina_colaborador: 1210,
        turno: "Turno 3 (Nocturno)",
        hora_inicio: "2026-10-07 23:30:00",
        hora_fin: "2026-10-08 00:05:00",
        minutos: 35,
        estatus_entrega: "Concluido",
        notas: "Cordones con poro y socavación detectada en Turno 3, corregida antes de liberar."
      }
    ],
    fotos_defecto: [
      { tipo: "Por mala soldadura", descripcion: "Socavación en cordón longitudinal en Turno 3" }
    ],
    fotos: []
  },
  {
    id_inspeccion: "INSP-2026-0012",
    fecha_creacion: "2026-10-08 15:00:00",
    nomina_creador: 1150,
    numero_parte: "PN-6210-LMT",
    modelo: "LMT",
    numero_serie: "SER-2026-8812",
    area_ubicacion: "FABS",
    estatus: "En Proceso",
    tiene_faltantes: "SI",
    descripcion_faltantes: "Falta perno de unión central",
    fecha_liberacion: "",
    nomina_liberador: "",
    url_reporte_pdf: "",
    version_reporte: "1.0",
    desbloqueada_edicion: false,
    turnos: [
      {
        id_turno: "TRN-012",
        nomina_colaborador: 1150,
        turno: "Turno 2 (Vespertino)",
        hora_inicio: "2026-10-08 15:00:00",
        hora_fin: "2026-10-08 15:30:00",
        minutos: 30,
        estatus_entrega: "Pausado",
        notas: "Esperando perno de unión en Turno 2."
      }
    ],
    fotos: []
  },
  {
    id_inspeccion: "INSP-2026-0013",
    fecha_creacion: "2026-10-09 09:10:00",
    nomina_creador: 1042,
    numero_parte: "PN-8420-LTT",
    modelo: "LTTT",
    numero_serie: "SER-2026-8813",
    area_ubicacion: "FABS",
    estatus: "Liberado",
    tiene_faltantes: "NO",
    descripcion_faltantes: "",
    fecha_liberacion: "2026-10-09 11:20:00",
    nomina_liberador: 2088,
    url_reporte_pdf: "",
    version_reporte: "1.0",
    desbloqueada_edicion: false,
    turnos: [
      {
        id_turno: "TRN-013",
        nomina_colaborador: 1042,
        turno: "Turno 1 (Matutino)",
        hora_inicio: "2026-10-09 09:10:00",
        hora_fin: "2026-10-09 09:40:00",
        minutos: 30,
        estatus_entrega: "Concluido",
        notas: "Torre LTTT conforme en dimensional y soldadura."
      }
    ],
    fotos: []
  },
  {
    id_inspeccion: "INSP-2026-0014",
    fecha_creacion: "2026-10-09 22:00:00",
    nomina_creador: 1210,
    numero_parte: "PN-7340-OHT",
    modelo: "OHT",
    numero_serie: "SER-2026-8814",
    area_ubicacion: "FABS",
    estatus: "Liberado",
    tiene_faltantes: "NO",
    descripcion_faltantes: "",
    fecha_liberacion: "2026-10-09 23:40:00",
    nomina_liberador: 2088,
    url_reporte_pdf: "",
    version_reporte: "1.0",
    desbloqueada_edicion: false,
    turnos: [
      {
        id_turno: "TRN-014",
        nomina_colaborador: 1210,
        turno: "Turno 3 (Nocturno)",
        hora_inicio: "2026-10-09 22:00:00",
        hora_fin: "2026-10-09 22:35:00",
        minutos: 35,
        estatus_entrega: "Concluido",
        notas: "Estructura OHT liberada sin observaciones en Turno 3."
      }
    ],
    fotos: []
  },
  {
    id_inspeccion: "INSP-2026-0015",
    fecha_creacion: "2026-10-10 10:00:00",
    nomina_creador: 1042,
    numero_parte: "PN-4300-WTS",
    modelo: "WTS",
    numero_serie: "SER-2026-8815",
    area_ubicacion: "FABS",
    estatus: "Liberado",
    tiene_faltantes: "NO",
    descripcion_faltantes: "",
    fecha_liberacion: "2026-10-10 11:15:00",
    nomina_liberador: 2088,
    url_reporte_pdf: "",
    version_reporte: "1.0",
    desbloqueada_edicion: false,
    turnos: [
      {
        id_turno: "TRN-015",
        nomina_colaborador: 1042,
        turno: "Turno 1 (Matutino)",
        hora_inicio: "2026-10-10 10:00:00",
        hora_fin: "2026-10-10 10:35:00",
        minutos: 35,
        estatus_entrega: "Concluido",
        notas: "Ensamble y soldadura WTS verificado con prueba de estanqueidad conforme."
      }
    ],
    fotos: []
  }
,
  {
    id_inspeccion: "INSP-2026-0020",
    fecha_creacion: "2026-10-18 11:00:00",
    nomina_creador: 1150,
    numero_parte: "PN-9200-CGP",
    modelo: "Carga Paint",
    numero_serie: "SER-2026-9202",
    area_ubicacion: "Carga Paint",
    estatus: "Liberado",
    tiene_faltantes: "NO",
    descripcion_faltantes: "",
    fecha_liberacion: "2026-10-18 12:40:00",
    nomina_liberador: 2088,
    url_reporte_pdf: "",
    version_reporte: "1.0",
    desbloqueada_edicion: false,
    turnos: [
      {
        id_turno: "TRN-020",
        nomina_colaborador: 1150,
        turno: "Turno 2 (Vespertino)",
        hora_inicio: "2026-10-18 11:00:00",
        hora_fin: "2026-10-18 11:22:00",
        minutos: 22,
        estatus_entrega: "Concluido",
        notas: "Piezas cargadas con anclaje firme a riel continuo y desengrase verificado."
      }
    ],
    fotos: []
  },
  {
    id_inspeccion: "INSP-2026-0021",
    fecha_creacion: "2026-10-18 14:15:00",
    nomina_creador: 1042,
    numero_parte: "PN-9300-SLP",
    modelo: "Sellado Paint",
    numero_serie: "SER-2026-9303",
    area_ubicacion: "Sellado Paint",
    estatus: "Liberado",
    tiene_faltantes: "NO",
    descripcion_faltantes: "",
    fecha_liberacion: "2026-10-18 15:30:00",
    nomina_liberador: 2088,
    url_reporte_pdf: "",
    version_reporte: "1.0",
    desbloqueada_edicion: false,
    turnos: [
      {
        id_turno: "TRN-021",
        nomina_colaborador: 1042,
        turno: "Turno 1 (Matutino)",
        hora_inicio: "2026-10-18 14:15:00",
        hora_fin: "2026-10-18 14:48:00",
        minutos: 33,
        estatus_entrega: "Concluido",
        notas: "Sellado hermÃ©tico de juntas estructurales sin burbujas ni huecos."
      }
    ],
    fotos: []
  },
  {
    id_inspeccion: "INSP-2026-0022",
    fecha_creacion: "2026-10-18 16:20:00",
    nomina_creador: 1150,
    numero_parte: "PN-9400-PRP",
    modelo: "Preparacion Paint",
    numero_serie: "SER-2026-9404",
    area_ubicacion: "Preparacion Paint",
    estatus: "Liberado",
    tiene_faltantes: "NO",
    descripcion_faltantes: "",
    fecha_liberacion: "2026-10-18 17:10:00",
    nomina_liberador: 2088,
    url_reporte_pdf: "",
    version_reporte: "1.0",
    desbloqueada_edicion: false,
    turnos: [
      {
        id_turno: "TRN-022",
        nomina_colaborador: 1150,
        turno: "Turno 2 (Vespertino)",
        hora_inicio: "2026-10-18 16:20:00",
        hora_fin: "2026-10-18 16:45:00",
        minutos: 25,
        estatus_entrega: "Concluido",
        notas: "Superficie preparada con fosfatizado uniforme y prueba de adherencia OK."
      }
    ],
    fotos: []
  }
];

const SAMPLE_AUDITORIA = [
  {
    id_auditoria: "AUD-2026-001",
    id_inspeccion: "INSP-2026-0002",
    nomina_editor: 2088,
    fecha_hora: "2026-10-05 18:20:00",
    campo_modificado: "Estatus",
    status_anterior: "En Proceso",
    status_final: "Liberado",
    valor_anterior: "En Proceso",
    valor_nuevo: "Liberado",
    justificacion_motivo: "Aprobación formal de calidad tras inspección dimensional y de pintura."
  }
];

// Estado en memoria
let appState = {
  currentUser: DEFAULT_USUARIOS[0],
  isAuthenticated: false,
  inspecciones: [],
  turnos: [],
  auditoria: [],
  componentes: DEFAULT_COMPONENTES,
  catalogos: DEFAULT_CATALOGOS,
  usuarios: DEFAULT_USUARIOS,
  metas: JSON.parse(JSON.stringify(DEFAULT_METAS)),
  cabinasCoordinador: [],
  tempPhotosProducto: [],
  tempPhotosDefecto: [],
  activeDetailId: null,
  resumeTargetId: null,
  scriptUrl: localStorage.getItem("auditum_script_url") || "",
  myPresenceStatus: "activo",
  presenceUsers: [],
  tempSuperPhotoProd: null,
  tempSuperPhotoDef: null,
  chartInstances: {
    produccionDiaria: null,
    modelosDonut: null,
    estatusPie: null,
    areasBar: null,
    defectosAreasBar: null,
    defectosDonut: null,
    defectosModelosBar: null,
    defectosTendenciaBar: null
  }
};

// ==================== INICIALIZACIÓN ====================
document.addEventListener("DOMContentLoaded", () => {
  loadStoredData();
  populateDropdowns();
  updateUserHeader();
  renderInspectionsTable();
  renderTraspasoList();
  renderAuditTable();
  updateKPIs();
  startLiveClock();
  updateSyncIndicator();
  checkServiceAccountApi();
  initAuthentication();
  startPresenceLoop();
  if (typeof updateCabinasBadge === "function") {
    updateCabinasBadge();
  }
  if (typeof updatePlantSensorsStatus === "function") {
    updatePlantSensorsStatus();
  }

  // Restaurar última pestaña activa visitada si existe
  try {
    const savedActiveTab = localStorage.getItem("auditum_active_tab");
    if (savedActiveTab && document.getElementById(`tab-${savedActiveTab}`)) {
      if (!(appState.currentUser && appState.currentUser.rol === "gerente" && (savedActiveTab === "nueva" || savedActiveTab === "traspaso"))) {
        switchTab(savedActiveTab);
      }
    }

    // Navegación directa por URL (Query Params)
    const urlParams = new URLSearchParams(window.location.search);
    const urlTab = urlParams.get("tab");
    const urlSubtab = urlParams.get("subtab");
    const urlSensor = urlParams.get("sensor");
    const urlNave = urlParams.get("nave");
    if (urlTab) {
      switchTab(urlTab);
      if (urlSubtab && typeof switchGerenteSubtab === "function") {
        switchGerenteSubtab(urlSubtab);
      }
      if (urlNave && typeof cambiarNaveMapa === "function") {
        cambiarNaveMapa(urlNave);
      }
      if (urlSensor && typeof abrirDetalleSensorPlanta === "function") {
        setTimeout(() => abrirDetalleSensorPlanta(urlSensor), 300);
      }
    }
  } catch (e) {}

  // Escuchar botón de submit del formulario
  document.getElementById("inspection-form").addEventListener("submit", handleSaveInspection);

  // Inicializar estado de exclusión mutua de fotos y liberación
  if (typeof updateMutualExclusionPhotoAndReleaseState === "function") {
    updateMutualExclusionPhotoAndReleaseState();
  }
});

// Reloj en vivo para piso
function startLiveClock() {
  setInterval(() => {
    const now = new Date();
    const clockEl = document.getElementById("live-clock");
    if (clockEl) {
      clockEl.innerText = now.toLocaleTimeString();
    }
    if (typeof updateLoginPlantTimeBadge === "function") {
      updateLoginPlantTimeBadge();
    }
  }, 1000);
}

// ==================== CRON&#211;METRO DE INSPECCI&#211;N EN PISO ====================
let inspectionTimer = {
  interval: null,
  isRunning: false,
  elapsedSeconds: 0,
  startTimestampStr: ""
};

function toggleInspectionTimer() {
  const btn = document.getElementById("btn-timer-toggle");
  const btnIcon = document.getElementById("btn-timer-icon");
  const btnText = document.getElementById("btn-timer-text");
  const badge = document.getElementById("timer-badge");
  const iconContainer = document.getElementById("timer-icon-container");

  if (!inspectionTimer.isRunning) {
    // Iniciar cron&#243;metro
    inspectionTimer.isRunning = true;
    if (!inspectionTimer.startTimestampStr) {
      const now = new Date();
      inspectionTimer.startTimestampStr = now.toISOString().replace("T", " ").substring(0, 19);
    }

    inspectionTimer.interval = setInterval(() => {
      inspectionTimer.elapsedSeconds++;
      updateTimerDisplay();
    }, 1000);

    // Actualizar UI
    if (btn) btn.className = "flex-1 sm:flex-initial px-5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2 transition active:scale-95";
    if (btnIcon) btnIcon.className = "fa-solid fa-pause";
    if (btnText) btnText.innerText = "Pausar Inspecci&#243;n";

    if (badge) {
      badge.className = "px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse";
      badge.innerText = "● Cronómetro Activo";
    }
    if (iconContainer) {
      iconContainer.className = "w-14 h-14 rounded-xl bg-emerald-950/80 border border-emerald-500/60 flex items-center justify-center text-emerald-400 text-2xl shadow-lg";
    }
  } else {
    // Pausar cron&#243;metro
    inspectionTimer.isRunning = false;
    clearInterval(inspectionTimer.interval);

    if (btn) btn.className = "flex-1 sm:flex-initial px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition active:scale-95";
    if (btnIcon) btnIcon.className = "fa-solid fa-play";
    if (btnText) btnText.innerText = "Reanudar Inspecci&#243;n";

    if (badge) {
      badge.className = "px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30";
      badge.innerText = "⏸ Inspecci&#243;n Pausada";
    }
    if (iconContainer) {
      iconContainer.className = "w-14 h-14 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 text-2xl shadow-inner";
    }
  }
}

function resetInspectionTimer() {
  if (inspectionTimer.interval) clearInterval(inspectionTimer.interval);
  inspectionTimer.isRunning = false;
  inspectionTimer.elapsedSeconds = 0;
  inspectionTimer.startTimestampStr = "";
  updateTimerDisplay();

  const btn = document.getElementById("btn-timer-toggle");
  const btnIcon = document.getElementById("btn-timer-icon");
  const btnText = document.getElementById("btn-timer-text");
  const badge = document.getElementById("timer-badge");
  const iconContainer = document.getElementById("timer-icon-container");

  if (btn) btn.className = "flex-1 sm:flex-initial px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition active:scale-95";
  if (btnIcon) btnIcon.className = "fa-solid fa-play";
  if (btnText) btnText.innerText = "Iniciar Inspecci&#243;n";

  if (badge) {
    badge.className = "px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-slate-800 text-slate-400 border border-slate-700";
    badge.innerText = "⏹ Detenido";
  }
  if (iconContainer) {
    iconContainer.className = "w-14 h-14 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 text-2xl shadow-inner";
  }
}

function updateTimerDisplay() {
  const display = document.getElementById("timer-display");
  if (!display) return;
  const s = inspectionTimer.elapsedSeconds;
  const hrs = String(Math.floor(s / 3600)).padStart(2, "0");
  const mins = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const secs = String(s % 60).padStart(2, "0");
  display.innerText = `${hrs}:${mins}:${secs}`;
}

function formatSecondsOrMinutes(segundos, minutos) {
  let s = parseInt(segundos);
  if (isNaN(s) || s < 0) {
    const m = parseInt(minutos);
    if (!isNaN(m) && m >= 0) {
      s = m * 60;
    } else {
      s = 0;
    }
  }
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${mins}m ${String(secs).padStart(2, "0")}s`;
}

// Carga de datos persistentes en LocalStorage
function loadStoredData() {
  const savedInspections = localStorage.getItem("auditum_inspecciones");
  const savedAudit = localStorage.getItem("auditum_auditoria");
  const savedUserNomina = localStorage.getItem("auditum_current_user");
  const savedPasswords = localStorage.getItem("auditum_user_passwords");

  // Cargar contraseñas personalizadas
  if (savedPasswords) {
    try {
      const pwMap = JSON.parse(savedPasswords);
      appState.usuarios.forEach(u => {
        if (pwMap[u.nomina]) u.password = pwMap[u.nomina];
      });
    } catch(e) {}
  }

  if (savedInspections) {
    try {
      appState.inspecciones = JSON.parse(savedInspections);
      if (appState.inspecciones.length < SAMPLE_INSPECCIONES.length) {
        const existingIds = new Set(appState.inspecciones.map(i => i.id_inspeccion));
        SAMPLE_INSPECCIONES.forEach(s => {
          if (!existingIds.has(s.id_inspeccion)) {
            appState.inspecciones.push(s);
          }
        });
        saveToLocalStorage();
      }
    } catch(e) {
      appState.inspecciones = SAMPLE_INSPECCIONES;
    }
  } else {
    appState.inspecciones = SAMPLE_INSPECCIONES;
    saveToLocalStorage();
  }

  // Migración automática: Normalizar fechas a la semana laboral Lunes 2026-10-05 a Sábado 2026-10-10
  const sampleWeekMapping = {
    "INSP-2026-0001": "2026-10-05", // Lunes
    "INSP-2026-0002": "2026-10-05", // Lunes
    "INSP-2026-0007": "2026-10-05", // Lunes
    "INSP-2026-0003": "2026-10-06", // Martes
    "INSP-2026-0008": "2026-10-06", // Martes
    "INSP-2026-0010": "2026-10-07", // Miércoles
    "INSP-2026-0011": "2026-10-07", // Miércoles
    "INSP-2026-0004": "2026-10-08", // Jueves
    "INSP-2026-0012": "2026-10-08", // Jueves
    "INSP-2026-0005": "2026-10-09", // Viernes (Récord)
    "INSP-2026-0006": "2026-10-09", // Viernes
    "INSP-2026-0013": "2026-10-09", // Viernes
    "INSP-2026-0014": "2026-10-09", // Viernes
    "INSP-2026-0009": "2026-10-10"  // Sábado
  };

  let migratedDates = false;
  appState.inspecciones.forEach(item => {
    const targetDate = sampleWeekMapping[item.id_inspeccion];
    if (targetDate && item.fecha_creacion) {
      const curDate = item.fecha_creacion.split(" ")[0];
      if (curDate !== targetDate) {
        item.fecha_creacion = item.fecha_creacion.replace(curDate, targetDate);
        if (item.fecha_liberacion) item.fecha_liberacion = item.fecha_liberacion.replace(curDate, targetDate);
        (item.turnos || []).forEach(t => {
          if (t.hora_inicio) t.hora_inicio = t.hora_inicio.replace(curDate, targetDate);
          if (t.hora_fin) t.hora_fin = t.hora_fin.replace(curDate, targetDate);
        });
        migratedDates = true;
      }
    }
  });

  // Sincronizar datos de personal responsable y retroalimentación desde SAMPLE_INSPECCIONES si faltan
  SAMPLE_INSPECCIONES.forEach(sample => {
    const target = appState.inspecciones.find(i => i.id_inspeccion === sample.id_inspeccion);
    if (target && sample.responsable_nombre && (!target.responsable_nombre || !target.responsable_motivo)) {
      target.responsable_nombre = sample.responsable_nombre;
      target.responsable_nomina = sample.responsable_nomina;
      target.responsable_motivo = sample.responsable_motivo;
      target.responsable_observaciones = sample.responsable_observaciones;
      target.retroalimentacion_estatus = sample.retroalimentacion_estatus;
      target.retroalimentacion_fecha = sample.retroalimentacion_fecha;
      if (sample.estatus) target.estatus = sample.estatus;
      if (sample.tipo_defecto) target.tipo_defecto = sample.tipo_defecto;
      if (sample.descripcion_faltantes) target.descripcion_faltantes = sample.descripcion_faltantes;
    }
  });

  // Verificación exhaustiva: garantizar que absolutamente ningún registro caiga en domingo (día 0)
  appState.inspecciones.forEach(item => {
    if (item.fecha_creacion) {
      const fDate = item.fecha_creacion.split(" ")[0];
      const parts = fDate.split("-");
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        if (d.getDay() === 0) { // 0 = Domingo
          d.setDate(d.getDate() + 1); // Mover a Lunes
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, "0");
          const day = String(d.getDate()).padStart(2, "0");
          const newF = `${y}-${m}-${day}`;
          item.fecha_creacion = item.fecha_creacion.replace(fDate, newF);
          if (item.fecha_liberacion) item.fecha_liberacion = item.fecha_liberacion.replace(fDate, newF);
          (item.turnos || []).forEach(t => {
            if (t.hora_inicio) t.hora_inicio = t.hora_inicio.replace(fDate, newF);
            if (t.hora_fin) t.hora_fin = t.hora_fin.replace(fDate, newF);
          });
          migratedDates = true;
        }
      }
    }
  });

  // Migración automática de Turnos: asignar nóminas y turnos equilibrados
  const sampleTurnoMapping = {
    "INSP-2026-0001": { turno: "Turno 1 (Matutino)", nomina: 1042 }, // Lun - T1
    "INSP-2026-0002": { turno: "Turno 2 (Vespertino)", nomina: 1150 }, // Lun - T2
    "INSP-2026-0007": { turno: "Turno 3 (Nocturno)", nomina: 1210 }, // Lun - T3
    "INSP-2026-0003": { turno: "Turno 1 (Matutino)", nomina: 1042 }, // Mar - T1
    "INSP-2026-0008": { turno: "Turno 2 (Vespertino)", nomina: 1150 }, // Mar - T2
    "INSP-2026-0010": { turno: "Turno 2 (Vespertino)", nomina: 1150 }, // Mié - T2
    "INSP-2026-0011": { turno: "Turno 3 (Nocturno)", nomina: 1210 }, // Mié - T3
    "INSP-2026-0004": { turno: "Turno 1 (Matutino)", nomina: 1042 }, // Jue - T1
    "INSP-2026-0012": { turno: "Turno 2 (Vespertino)", nomina: 1150 }, // Jue - T2
    "INSP-2026-0005": { turno: "Turno 2 (Vespertino)", nomina: 1150 }, // Vie - T2
    "INSP-2026-0006": { turno: "Turno 1 (Matutino)", nomina: 1042 }, // Vie - T1
    "INSP-2026-0013": { turno: "Turno 1 (Matutino)", nomina: 1042 }, // Vie - T1
    "INSP-2026-0014": { turno: "Turno 3 (Nocturno)", nomina: 1210 }, // Vie - T3
    "INSP-2026-0009": { turno: "Turno 3 (Nocturno)", nomina: 1210 }  // Sáb - T3
  };

  let migratedTurnos = false;
  appState.inspecciones.forEach(item => {
    const tMap = sampleTurnoMapping[item.id_inspeccion];
    if (tMap) {
      if (item.nomina_creador !== tMap.nomina) {
        item.nomina_creador = tMap.nomina;
        migratedTurnos = true;
      }
      if (!item.turnos || item.turnos.length === 0) {
        item.turnos = [{
          id_turno: "TRN-" + item.id_inspeccion.slice(-4),
          nomina_colaborador: tMap.nomina,
          turno: tMap.turno,
          minutos: 30,
          estatus_entrega: item.estatus || "Concluido",
          notas: "Inspecci&#243;n de calidad"
        }];
        migratedTurnos = true;
      } else if (item.turnos[0].turno !== tMap.turno || item.turnos[0].nomina_colaborador !== tMap.nomina) {
        item.turnos[0].turno = tMap.turno;
        item.turnos[0].nomina_colaborador = tMap.nomina;
        migratedTurnos = true;
      }
    }
  });

  if (migratedDates || migratedTurnos) {
    saveToLocalStorage();
  }

  // Sincronizar catálogo inicial de defectos representativos para la pestaña de defectos
  const seedDefectsMap = {
    "INSP-2026-0001": { tipo: "Falta de Componente", desc: "Faltan 4 cartabones de refuerzo en extremo B" },
    "INSP-2026-0004": { tipo: "Soldadura, Golpe", desc: "Porosidad en cordón y abolladura por impacto en ceja" },
    "INSP-2026-0005": { tipo: "Scrap, Golpe", desc: "Descuadre y fractura de bisagra con golpe irreparable - Scrap" },
    "INSP-2026-0007": { tipo: "Soldadura", desc: "Falta de penetración en soldadura de brazo cargador" },
    "INSP-2026-0008": { tipo: "Golpe", desc: "Abolladura por impacto durante maniobra en ceja de rueda" },
    "INSP-2026-0009": { tipo: "Scrap", desc: "Fisura transversal en alma de viga no conforme - enviado a Scrap" },
    "INSP-2026-0010": { tipo: "Soldadura", desc: "Inclusiones de escoria y porosidad en refuerzo" },
    "INSP-2026-0011": { tipo: "Golpe", desc: "Deformación por golpe en soporte lateral de tolva" },
    "INSP-2026-0012": { tipo: "Falta de Componente", desc: "Falta perno de unión central y bujes de ensamble" }
  };

  let defectsUpdated = false;
  appState.inspecciones.forEach(it => {
    if (seedDefectsMap[it.id_inspeccion]) {
      const s = seedDefectsMap[it.id_inspeccion];
      if (it.tipo_defecto !== s.tipo) {
        it.tipo_defecto = s.tipo;
        if (!it.descripcion_faltantes || it.descripcion_faltantes.length < s.desc.length) {
          it.descripcion_faltantes = s.desc;
        }
        defectsUpdated = true;
      }
    }
  });

  // Migración automática: normalizar cualquier estatus 'Concluido' a 'Liberado'
  appState.inspecciones.forEach(it => {
    if (it.estatus === "Concluido") {
      it.estatus = "Liberado";
      if (!it.fecha_liberacion) it.fecha_liberacion = it.fecha_creacion || new Date().toISOString().replace("T", " ").substring(0, 19);
      if (!it.nomina_liberador) it.nomina_liberador = it.nomina_creador || 1042;
      defectsUpdated = true;
    }
  });

  // Migración automática: normalizar números de parte antiguos (PARTE-XXXX -> PN-XXXX-...)
  const oldPartMap = {
    "PARTE-LTTT": "PN-8420-LTT",
    "PARTE-MTTT": "PN-5130-MTT",
    "PARTE-LMT": "PN-6210-LMT",
    "PARTE-OHT": "PN-7340-OHT",
    "PARTE-LWL988": "PN-9880-LWL",
    "PARTE-LWL990": "PN-9900-LWL",
    "PARTE-MWL": "PN-3140-MWL",
    "PARTE-PUERTAS": "PN-7200-PTS",
    "PARTE-COBOT": "PN-8800-CBT",
    "PARTE-LOW": "PN-1950-LV",
    "PN-1950-LOW": "PN-1950-LV",
    "PARTE-LMTK": "PN-2080-LTK",
    "PARTE-MG": "PN-4720-MG",
    "PARTE-WTS": "PN-4300-WTS",
    "STL-GENERICO": "PN-8420-LTT"
  };

  appState.inspecciones.forEach(it => {
    if (oldPartMap[it.numero_parte]) {
      it.numero_parte = oldPartMap[it.numero_parte];
      defectsUpdated = true;
    }
    if (it.modelo === "LOW") {
      it.modelo = "LOW VOLUME";
      defectsUpdated = true;
    }
    // Asignación estricta de áreas de planta:
    // FABS: LTTT, MTTT, MG, WTS, LWL 988, LWL 990, MWL, PUERTAS, OHT, LMT
    // EDIFICIO K: LOW VOLUME, LMT K, COBOT
        // Las lÃ­neas de FABS y Edificio K pertenecen al Ã¡rea de SOLDADURA
    if (it.area_ubicacion === "FABS" || it.area_ubicacion === "EDIFICIO K") {
      it.area_ubicacion = "SOLDADURA";
      defectsUpdated = true;
    } else if (it.modelo && LINEA_AREA_MAP[it.modelo] && it.area_ubicacion !== "PINTURA" && it.area_ubicacion !== "ENSAMBLE" && it.area_ubicacion !== "FOS" && it.area_ubicacion !== "Pintura" && it.area_ubicacion !== "Ensamble") {
      it.area_ubicacion = "SOLDADURA";
      defectsUpdated = true;
    }
  });

  // Normalización y homogeneización de tiempos de inspección para prevenir duplicidades
  let timesNormalized = false;
  appState.inspecciones.forEach(it => {
    let totalSec = 0;
    if (it.turnos && it.turnos.length > 0) {
      it.turnos.forEach(t => {
        const s = parseInt(t.segundos) || 0;
        const m = parseInt(t.minutos) || 0;
        totalSec += (s > 0 ? s : m * 60);
      });
    }
    if (totalSec === 0) {
      totalSec = parseInt(it.tiempo_segundos) || (parseInt(it.tiempo_minutos) ? parseInt(it.tiempo_minutos) * 60 : 0);
    }
    if (it.tiempo_segundos !== totalSec) {
      it.tiempo_segundos = totalSec;
      it.tiempo_minutos = Math.max(1, Math.round(totalSec / 60));
      timesNormalized = true;
    }
  });

  if (defectsUpdated || timesNormalized) {
    saveToLocalStorage();
  }

  if (savedAudit) {
    try {
      appState.auditoria = JSON.parse(savedAudit);
    } catch(e) {
      appState.auditoria = SAMPLE_AUDITORIA;
    }
  } else {
    appState.auditoria = SAMPLE_AUDITORIA;
  }

  // Verificar si hay sesión activa en esta pestaña o persistente
  const isSessionActive = (sessionStorage.getItem("auditum_logged_in") === "true") || (localStorage.getItem("auditum_logged_in") === "true");
  if (isSessionActive) {
    let found = savedUserNomina ? appState.usuarios.find(u => u.nomina == savedUserNomina) : null;
    if (!found) {
      found = appState.usuarios.find(u => u.nomina == 1042) || appState.usuarios[0];
    }
    appState.currentUser = found;
    appState.isAuthenticated = true;
  } else {
    appState.isAuthenticated = false;
  }

  // Garantizar catálogos y componentes actualizados
    // Garantizar que las nuevas inspecciones de PINTURA (0019 a 0022) existan en memoria
  if (Array.isArray(appState.inspecciones)) {
    const existingIds = new Set(appState.inspecciones.map(i => i.id_inspeccion));
    SAMPLE_INSPECCIONES.forEach(seed => {
      if (!existingIds.has(seed.id_inspeccion)) {
        appState.inspecciones.push(seed);
      }
    });
  }
  appState.catalogos = DEFAULT_CATALOGOS;
  appState.componentes = DEFAULT_COMPONENTES;

  // Cargar metas personalizadas por línea
  const savedMetas = localStorage.getItem("auditum_metas_lineas");
  if (savedMetas) {
    try {
      const parsed = JSON.parse(savedMetas);
      appState.metas = {
        areas: Object.assign({}, DEFAULT_METAS.areas, parsed.areas || {}),
        modelos: Object.assign({}, DEFAULT_METAS.modelos, parsed.modelos || {})
      };
    } catch(e) {
      appState.metas = JSON.parse(JSON.stringify(DEFAULT_METAS));
    }
  } else {
    appState.metas = JSON.parse(JSON.stringify(DEFAULT_METAS));
  }

  // Cargar lista de cabinas finalizadas que requieren coordinador / QG
  const savedCabinas = localStorage.getItem("auditum_cabinas_coordinador");
  if (savedCabinas) {
    try {
      appState.cabinasCoordinador = JSON.parse(savedCabinas);
      if (!Array.isArray(appState.cabinasCoordinador) || appState.cabinasCoordinador.length === 0) {
        appState.cabinasCoordinador = JSON.parse(JSON.stringify(DEFAULT_CABINAS_COORDINADOR));
      } else {
        appState.cabinasCoordinador.forEach(c => {
          const supInfo = SUPERVISORES_POR_LINEA[c.linea];
          if (!c.supervisor_linea && supInfo) {
            c.supervisor_linea = `${supInfo.nombre} (${supInfo.nomina})`;
            c.solicitante = c.supervisor_linea;
          }
          if (!c.coordinador_solicitado) {
            c.coordinador_solicitado = "Juan Pérez Martínez - Coordinador / QG (1042)";
          }
        });
      }
    } catch(e) {
      appState.cabinasCoordinador = JSON.parse(JSON.stringify(DEFAULT_CABINAS_COORDINADOR));
    }
  } else {
    appState.cabinasCoordinador = JSON.parse(JSON.stringify(DEFAULT_CABINAS_COORDINADOR));
    try { localStorage.setItem("auditum_cabinas_coordinador", JSON.stringify(appState.cabinasCoordinador)); } catch(e) {}
  }
}

function saveToLocalStorage() {
  localStorage.setItem("auditum_inspecciones", JSON.stringify(appState.inspecciones));
  localStorage.setItem("auditum_auditoria", JSON.stringify(appState.auditoria));
  localStorage.setItem("auditum_cabinas_coordinador", JSON.stringify(appState.cabinasCoordinador));
}

// ==================== POBLAR SELECTORES Y DROPDOWNS ====================

// Actualizar vista previa del siguiente folio de inspecciÃ³n
function updateNextFolioPreview() {
  const el = document.getElementById("preview-folio");
  if (!el) return;
  const count = (appState && Array.isArray(appState.inspecciones) ? appState.inspecciones.length : 0) + 1;
  const year = new Date().getFullYear();
  el.innerText = 'INSP-' + year + '-' + String(count).padStart(4, '0');
}
window.updateNextFolioPreview = updateNextFolioPreview;
function populateDropdowns() {
  // Datalist de sugerencias para N&#250;mero de Parte (Escritura Manual por Cabina)
  const datalistParte = document.getElementById("list-partes-sugeridas");
  if (datalistParte) {
    datalistParte.innerHTML = "";
    (appState.componentes || []).forEach(c => {
      const opt = document.createElement("option");
      opt.value = c.numero_parte;
      opt.label = `${c.numero_parte} (${c.modelo})`;
      datalistParte.appendChild(opt);
    });
  }

  // Selector de Modelo organizado por nave
  const selectModelo = document.getElementById("input-modelo");
  if (selectModelo) {
    selectModelo.innerHTML = '<option value="">-- Seleccionar Modelo --</option>';
    const groupFabsM = document.createElement("optgroup");
    groupFabsM.label = "Nave FABS (10 L\u00EDneas)";
    const groupKM = document.createElement("optgroup");
    groupKM.label = "Nave EDIFICIO K (3 L\u00EDneas)";

    const groupPaintM = document.createElement("optgroup");
    groupPaintM.label = "\u00C1rea PINTURA (3 L\u00EDneas)";

    appState.catalogos.modelos.forEach(m => {
      const opt = document.createElement("option");
      opt.value = m;
      opt.innerText = m;
      if (LINEA_AREA_MAP[m] === "PINTURA") {
        groupPaintM.appendChild(opt);
      } else if (getNaveForModel(m) === "EDIFICIO K") {
        groupKM.appendChild(opt);
      } else {
        groupFabsM.appendChild(opt);
      }
    });
    selectModelo.appendChild(groupFabsM);
    selectModelo.appendChild(groupKM);
    selectModelo.appendChild(groupPaintM);
  }

  // Selector de Modelo en Modal de Edición de Supervisor
  const superSelectModelo = document.getElementById("super-input-modelo");
  if (superSelectModelo) {
    superSelectModelo.innerHTML = '';
    const superGroupFabs = document.createElement("optgroup");
    superGroupFabs.label = "Nave FABS (10 L\u00EDneas)";
    const superGroupK = document.createElement("optgroup");
    superGroupK.label = "Nave EDIFICIO K (3 L\u00EDneas)";

    const superGroupPaint = document.createElement("optgroup");
    superGroupPaint.label = "\u00C1rea PINTURA (3 L\u00EDneas)";

    appState.catalogos.modelos.forEach(m => {
      const opt = document.createElement("option");
      opt.value = m;
      opt.innerText = m;
      if (LINEA_AREA_MAP[m] === "PINTURA") {
        superGroupPaint.appendChild(opt);
      } else if (getNaveForModel(m) === "EDIFICIO K") {
        superGroupK.appendChild(opt);
      } else {
        superGroupFabs.appendChild(opt);
      }
    });
    superSelectModelo.appendChild(superGroupFabs);
    superSelectModelo.appendChild(superGroupK);
    superSelectModelo.appendChild(superGroupPaint);
  }

  // Áreas (EDIFICIO K y FABS)
  const selectArea = document.getElementById("input-area");
  const superSelectArea = document.getElementById("super-input-area");
  const filterAreaTraspaso = document.getElementById("filter-traspaso-area");
  const dashFilterArea = document.getElementById("dash-filter-area");

    const areaOptgroupsHTML = `
    <option value="">-- Seleccionar &#193;rea / Ubicaci&#243;n --</option>
    <optgroup label="&#128293; SOLDADURA">
      <option value="SOLDADURA">SOLDADURA (General)</option>
      <option value="FABS">FABS</option>
      <option value="EDIFICIO K">EDIFICIO K</option>
    </optgroup>
    <optgroup label="&#127912; PINTURA">
      <option value="PINTURA">PINTURA (General)</option>
      
      <option value="Carga Paint">Carga Paint</option>
      <option value="Sellado Paint">Sellado Paint</option>
      <option value="Preparacion Paint">Preparacion Paint</option>
    </optgroup>
    <optgroup label="&#128297; ENSAMBLE">
      <option value="ENSAMBLE">ENSAMBLE</option>
    </optgroup>
    <optgroup label="&#128230; FOS">
      <option value="FOS">FOS</option>
    </optgroup>
  `;

  if (selectArea) {
    const curArea = selectArea.value;
    selectArea.innerHTML = areaOptgroupsHTML;
    if (curArea && selectArea.querySelector(`option[value="${curArea}"]`)) {
      selectArea.value = curArea;
    }
  }

  if (superSelectArea) {
    const curSuperArea = superSelectArea.value;
    superSelectArea.innerHTML = areaOptgroupsHTML;
    if (curSuperArea && superSelectArea.querySelector(`option[value="${curSuperArea}"]`)) {
      superSelectArea.value = curSuperArea;
    }
  }

  if (filterAreaTraspaso) {
    filterAreaTraspaso.innerHTML = `
      <option value="">Todas las &#193;reas</option>
      <option value="SOLDADURA">SOLDADURA</option>
      <option value="FABS">FABS</option>
      <option value="EDIFICIO K">EDIFICIO K</option>
      <option value="PINTURA">PINTURA</option>
      <option value="ENSAMBLE">ENSAMBLE</option>
      <option value="FOS">FOS</option>
    `;
  }

  // Modelos en Filtro de PestaÃ±a de Defectos
  const defectosFilterModelo = document.getElementById("defectos-filter-modelo");
  if (defectosFilterModelo && appState.catalogos.modelos) {
    defectosFilterModelo.innerHTML = `<option value="">Todos los ${appState.catalogos.modelos.length} Modelos</option>`;
    const groupFabsDef = document.createElement("optgroup");
    groupFabsDef.label = "Nave FABS (10 L\u00EDneas)";
    const groupKDef = document.createElement("optgroup");
    groupKDef.label = "Nave EDIFICIO K (3 L\u00EDneas)";
    const groupPaintDef = document.createElement("optgroup");
    groupPaintDef.label = "\u00C1rea PINTURA (3 L\u00EDneas)";

    appState.catalogos.modelos.forEach(mod => {
      const opt = document.createElement("option");
      opt.value = mod;
      opt.innerText = `${mod} (${getAreaForModel(mod)})`;
      if (LINEA_AREA_MAP[mod] === "PINTURA") groupPaintDef.appendChild(opt);
      else if (getNaveForModel(mod) === "EDIFICIO K") groupKDef.appendChild(opt);
      else groupFabsDef.appendChild(opt);
    });
    defectosFilterModelo.appendChild(groupFabsDef);
    defectosFilterModelo.appendChild(groupKDef);
    defectosFilterModelo.appendChild(groupPaintDef);
  }

  // Generar folio sugerido
  updateNextFolioPreview();
}

// ==================== CASCADA: FILTRAR LÃNEAS POR ÃREA ====================
// Cuando se selecciona FABS, EDIFICIO K o PINTURA, se muestran Ãºnicamente sus lÃ­neas correspondientes
function updateModelosByArea(modeloSelectId, parteSelectId, selectedArea) {
  const selModelo = document.getElementById(modeloSelectId);
  const selParte = parteSelectId ? document.getElementById(parteSelectId) : null;
  if (!selModelo) return;

  const currentVal = selModelo.value;
  selModelo.innerHTML = '<option value="">-- Seleccionar Modelo / L\u00EDnea --</option>';

  const fabsLines = ["LTTT", "MTTT", "MG", "WTS", "LWL 988", "LWL 990", "MWL", "PUERTAS", "OHT", "LMT"];
  const kLines = ["LOW VOLUME", "LMT K", "COBOT"];
  const paintLines = ["Carga Paint", "Sellado Paint", "Preparacion Paint"];

  const areaUpper = (selectedArea || "").toUpperCase().trim();

  // 1. Caso FABS: Mostrar ÃšNICAMENTE las 10 lÃ­neas de FABS
  if (areaUpper === "FABS" || areaUpper === "FAB") {
    const grpFabs = document.createElement("optgroup");
    grpFabs.label = "Nave FABS (10 L\u00EDneas)";
    fabsLines.forEach(m => {
      const opt = document.createElement("option");
      opt.value = m;
      opt.innerText = m;
      grpFabs.appendChild(opt);
    });
    selModelo.appendChild(grpFabs);
  }
  // 2. Caso EDIFICIO K: Mostrar ÃšNICAMENTE las 3 lÃ­neas de EDIFICIO K
  else if (areaUpper === "EDIFICIO K" || areaUpper === "K") {
    const grpK = document.createElement("optgroup");
    grpK.label = "Nave EDIFICIO K (3 L\u00EDneas)";
    kLines.forEach(m => {
      const opt = document.createElement("option");
      opt.value = m;
      opt.innerText = m;
      grpK.appendChild(opt);
    });
    selModelo.appendChild(grpK);
  }
  // 3. Caso PINTURA: Mostrar ÃšNICAMENTE las 3 lÃ­neas de Pintura
  else if (areaUpper === "PINTURA" || paintLines.some(p => p.toUpperCase() === areaUpper)) {
    const grpPaint = document.createElement("optgroup");
    grpPaint.label = "\u00C1rea PINTURA (3 L\u00EDneas)";
    paintLines.forEach(m => {
      const opt = document.createElement("option");
      opt.value = m;
      opt.innerText = m;
      grpPaint.appendChild(opt);
    });
    selModelo.appendChild(grpPaint);
  }
  // 4. Caso SOLDADURA general: Mostrar FABS y EDIFICIO K agrupados
  else if (areaUpper === "SOLDADURA") {
    const grpFabs = document.createElement("optgroup");
    grpFabs.label = "Nave FABS (10 L\u00EDneas)";
    fabsLines.forEach(m => {
      const opt = document.createElement("option");
      opt.value = m;
      opt.innerText = m;
      grpFabs.appendChild(opt);
    });
    const grpK = document.createElement("optgroup");
    grpK.label = "Nave EDIFICIO K (3 L\u00EDneas)";
    kLines.forEach(m => {
      const opt = document.createElement("option");
      opt.value = m;
      opt.innerText = m;
      grpK.appendChild(opt);
    });
    selModelo.appendChild(grpFabs);
    selModelo.appendChild(grpK);
  }
  // 5. Todos / No seleccionado: Mostrar todas agrupadas
  else {
    const grpFabs = document.createElement("optgroup");
    grpFabs.label = "Nave FABS (10 L\u00EDneas)";
    fabsLines.forEach(m => {
      const opt = document.createElement("option");
      opt.value = m;
      opt.innerText = m;
      grpFabs.appendChild(opt);
    });
    const grpK = document.createElement("optgroup");
    grpK.label = "Nave EDIFICIO K (3 L\u00EDneas)";
    kLines.forEach(m => {
      const opt = document.createElement("option");
      opt.value = m;
      opt.innerText = m;
      grpK.appendChild(opt);
    });
    const grpPaint = document.createElement("optgroup");
    grpPaint.label = "\u00C1rea PINTURA (3 L\u00EDneas)";
    paintLines.forEach(m => {
      const opt = document.createElement("option");
      opt.value = m;
      opt.innerText = m;
      grpPaint.appendChild(opt);
    });
    selModelo.appendChild(grpFabs);
    selModelo.appendChild(grpK);
    selModelo.appendChild(grpPaint);
  }

  // Preservar valor si sigue siendo vÃ¡lido dentro del Ã¡rea elegida
  if (currentVal && selModelo.querySelector(`option[value="${currentVal}"]`)) {
    selModelo.value = currentVal;
  } else {
    selModelo.value = "";
    if (modeloSelectId === "input-modelo") {
      const critBox = document.getElementById("criterio-box");
      if (critBox) critBox.classList.add("hidden");
    }
  }

  // Filtrar tambiÃ©n las sugerencias de parte si se suministrÃ³ selector
  if (selParte && parteSelectId) {
    updatePartesByArea(parteSelectId, selectedArea);
  }
}

// Filtrar selector de N&#250;meros de Parte por Ãrea
// Actualizar sugerencias del datalist segÃºn el Ãrea seleccionada
function updatePartesByArea(parteSelectId, selectedArea) {
  const datalist = document.getElementById("list-partes-sugeridas");
  if (!datalist) return;
  datalist.innerHTML = "";
  const areaUpper = (selectedArea || "").toUpperCase().trim();
  const comps = appState.componentes || [];

  let filteredComps = comps;
  if (areaUpper === "FABS" || areaUpper === "FAB") {
    filteredComps = comps.filter(c => c.area === "FABS" || (!c.area && LINEA_NAVE_MAP[c.modelo] === "FABS"));
  } else if (areaUpper === "EDIFICIO K" || areaUpper === "K") {
    filteredComps = comps.filter(c => c.area === "EDIFICIO K" || LINEA_NAVE_MAP[c.modelo] === "EDIFICIO K");
  } else if (areaUpper === "PINTURA" || [ "CARGA PAINT", "SELLADO PAINT", "PREPARACION PAINT"].includes(areaUpper)) {
    filteredComps = comps.filter(c => c.familia === "Pintura" || c.area === "PINTURA" || LINEA_AREA_MAP[c.modelo] === "PINTURA");
  }

  filteredComps.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c.numero_parte;
    opt.label = `${c.numero_parte} (${c.modelo})`;
    datalist.appendChild(opt);
  });
}

// Disparador del cambio de Ãrea en el Formulario de Inspecci&#243;n
function handleAreaChange() {
  const areaVal = document.getElementById("input-area")?.value;
  updateModelosByArea("input-modelo", "input-parte", areaVal);
}

// Disparador del cambio de Ãrea en el Modal de Supervisor
function handleSuperAreaChange() {
  const areaVal = document.getElementById("super-input-area")?.value;
  updateModelosByArea("super-input-modelo", null, areaVal);
}

// Actualizar filtros secundarios de L&#237;neas en Defectos y Personal al cambiar de Ãrea
function updateFilterLineasOptions(selectedArea) {
  const f = (selectedArea || "").toUpperCase().trim();
  const fabsLines = ["LTTT", "MTTT", "MG", "WTS", "LWL 988", "LWL 990", "MWL", "PUERTAS", "OHT", "LMT"];
  const kLines = ["LOW VOLUME", "LMT K", "COBOT"];
  const paintLines = ["Carga Paint", "Sellado Paint", "Preparacion Paint"];

  // 1. Selector de Modelo en pestaÃ±a de Defectos (#defectos-filter-modelo)
  const selDef = document.getElementById("defectos-filter-modelo");
  if (selDef) {
    const curVal = selDef.value;
    selDef.innerHTML = "";

    if (f === "FABS" || f === "FAB") {
      selDef.innerHTML = '<option value="">Todos los 10 Modelos de FABS</option>';
      const grp = document.createElement("optgroup");
      grp.label = "ðŸ­ Nave FABS (10 L&#237;neas)";
      fabsLines.forEach(m => {
        const opt = document.createElement("option");
        opt.value = m;
        opt.innerText = `${m} (${getAreaForModel(m)})`;
        grp.appendChild(opt);
      });
      selDef.appendChild(grp);
    } else if (f === "EDIFICIO K" || f === "K") {
      selDef.innerHTML = '<option value="">Todos los 3 Modelos de EDIFICIO K</option>';
      const grp = document.createElement("optgroup");
      grp.label = "âš¡ Nave EDIFICIO K (3 L&#237;neas)";
      kLines.forEach(m => {
        const opt = document.createElement("option");
        opt.value = m;
        opt.innerText = `${m} (${getAreaForModel(m)})`;
        grp.appendChild(opt);
      });
      selDef.appendChild(grp);
    } else if (f === "PINTURA" || paintLines.some(p => p.toUpperCase() === f)) {
      selDef.innerHTML = '<option value="">Todos los 3 Modelos de PINTURA</option>';
      const grp = document.createElement("optgroup");
      grp.label = "ðŸŽ¨ Ãrea PINTURA (4 L&#237;neas)";
      paintLines.forEach(m => {
        const opt = document.createElement("option");
        opt.value = m;
        opt.innerText = `${m} (PINTURA)`;
        grp.appendChild(opt);
      });
      selDef.appendChild(grp);
    } else {
      selDef.innerHTML = `<option value="">Todos los ${appState.catalogos.modelos.length} Modelos</option>`;
      const grpFabs = document.createElement("optgroup");
      grpFabs.label = "Nave FABS (10 L\u00EDneas)";
      const grpK = document.createElement("optgroup");
      grpK.label = "Nave EDIFICIO K (3 L\u00EDneas)";
      const grpPaint = document.createElement("optgroup");
      grpPaint.label = "\u00C1rea PINTURA (3 L\u00EDneas)";

      appState.catalogos.modelos.forEach(m => {
        const opt = document.createElement("option");
        opt.value = m;
        opt.innerText = `${m} (${getAreaForModel(m)})`;
        if (LINEA_AREA_MAP[m] === "PINTURA") grpPaint.appendChild(opt);
        else if (getNaveForModel(m) === "EDIFICIO K") grpK.appendChild(opt);
        else grpFabs.appendChild(opt);
      });
      selDef.appendChild(grpFabs);
      selDef.appendChild(grpK);
      selDef.appendChild(grpPaint);
    }

    if (curVal && selDef.querySelector(`option[value="${curVal}"]`)) {
      selDef.value = curVal;
    }
  }

  // 2. Selector de L&#237;neas en Personal Operativo (#filtro-personal-linea)
  const selPer = document.getElementById("filtro-personal-linea");
  if (selPer) {
    const curVal = selPer.value;
    selPer.innerHTML = "";

    if (f === "FABS" || f === "FAB") {
      selPer.innerHTML = '<option value="">Todas las L&#237;neas de FABS (10)</option>';
      fabsLines.forEach(m => {
        const opt = document.createElement("option");
        opt.value = m;
        opt.innerText = `L&#237;nea ${m} (FABS)`;
        selPer.appendChild(opt);
      });
    } else if (f === "EDIFICIO K" || f === "K") {
      selPer.innerHTML = '<option value="">Todas las L&#237;neas de EDIFICIO K (3)</option>';
      kLines.forEach(m => {
        const opt = document.createElement("option");
        opt.value = m;
        opt.innerText = `L&#237;nea ${m} (Edif K)`;
        selPer.appendChild(opt);
      });
    } else if (f === "PINTURA" || paintLines.some(p => p.toUpperCase() === f)) {
      selPer.innerHTML = '<option value="">Todas las L&#237;neas de PINTURA (3)</option>';
      paintLines.forEach(m => {
        const opt = document.createElement("option");
        opt.value = m;
        opt.innerText = `L&#237;nea ${m} (Pintura)`;
        selPer.appendChild(opt);
      });
    } else {
      selPer.innerHTML = '<option value="">Todas las L&#237;neas (17)</option>';
      const grpFabs = document.createElement("optgroup");
      grpFabs.label = "Nave FABS (10 L\u00EDneas)";
      fabsLines.forEach(m => {
        const opt = document.createElement("option");
        opt.value = m;
        opt.innerText = `L&#237;nea ${m} (FABS)`;
        grpFabs.appendChild(opt);
      });
      const grpK = document.createElement("optgroup");
      grpK.label = "Nave EDIFICIO K (3 L\u00EDneas)";
      kLines.forEach(m => {
        const opt = document.createElement("option");
        opt.value = m;
        opt.innerText = `L&#237;nea ${m} (Edif K)`;
        grpK.appendChild(opt);
      });
      const grpPaint = document.createElement("optgroup");
      grpPaint.label = "\u00C1rea PINTURA (3 L\u00EDneas)";
      paintLines.forEach(m => {
        const opt = document.createElement("option");
        opt.value = m;
        opt.innerText = `L&#237;nea ${m} (Pintura)`;
        grpPaint.appendChild(opt);
      });
      selPer.appendChild(grpFabs);
      selPer.appendChild(grpK);
      selPer.appendChild(grpPaint);
    }

    if (curVal && selPer.querySelector(`option[value="${curVal}"]`)) {
      selPer.value = curVal;
    }
  }
}

function handlePartChange() {
  const parteVal = document.getElementById("input-parte").value;
  const modeloSelect = document.getElementById("input-modelo");
  const areaSelect = document.getElementById("input-area");
  const criterioBox = document.getElementById("criterio-box");
  const criterioText = document.getElementById("criterio-text");

  const comp = appState.componentes.find(c => c.numero_parte === parteVal);
  if (comp) {
    if (modeloSelect) modeloSelect.value = comp.modelo;
    if (areaSelect) {
      if (areaSelect.value !== "Pintura" && areaSelect.value !== "Ensamble") {
        areaSelect.value = comp.area || getAreaForModel(comp.modelo);
      }
    }
    if (criterioText) criterioText.innerText = comp.criterio;
    if (criterioBox) criterioBox.classList.remove("hidden");
    // Iniciar cron&#243;metro automáticamente si está detenido en 00:00:00
    if (!inspectionTimer.isRunning && inspectionTimer.elapsedSeconds === 0) {
      toggleInspectionTimer();
    }
  } else {
    if (criterioBox) criterioBox.classList.add("hidden");
  }
}

// Cambio en selector de modelo para auto-seleccionar el número de parte y área correspondiente
// Cambio en selector de modelo para auto-seleccionar el Ãrea y mostrar criterio
function handleModeloChange() {
  const modeloVal = document.getElementById("input-modelo")?.value;
  const areaSelect = document.getElementById("input-area");
  const inputParte = document.getElementById("input-parte");
  const criterioBox = document.getElementById("criterio-box");
  const criterioText = document.getElementById("criterio-text");

  if (!modeloVal) {
    if (criterioBox) criterioBox.classList.add("hidden");
    return;
  }

  // 1. Asignar AUTOMÃTICAMENTE el Ã¡rea correspondiente segÃºn el modelo seleccionado
  if (areaSelect) {
    const nave = LINEA_NAVE_MAP[modeloVal];
    const area = getAreaForModel(modeloVal);

    if (nave === "EDIFICIO K") {
      areaSelect.value = "EDIFICIO K";
    } else if (nave === "FABS") {
      areaSelect.value = "FABS";
    } else if (area === "PINTURA" || nave === "PINTURA") {
      if (areaSelect.querySelector(`option[value="${modeloVal}"]`)) {
        areaSelect.value = modeloVal;
      } else {
        areaSelect.value = "PINTURA";
      }
    } else if (area) {
      areaSelect.value = area;
    }
  }

  // 2. Criterio de calidad segÃºn el modelo
  const comp = (appState.componentes || []).find(c => c.modelo === modeloVal);
  if (comp) {
    if (criterioText) criterioText.innerText = comp.criterio || "Inspecci&#243;n segÃºn especificaciÃ³n tÃ©cnica aplicable";
    if (criterioBox) criterioBox.classList.remove("hidden");
    if (inputParte && !inputParte.value) {
      inputParte.placeholder = `Ej. ${comp.numero_parte} (o ingresar NÂ° de parte manual)`;
    }
    // Iniciar cron&#243;metro automÃ¡ticamente si estÃ¡ detenido en 00:00:00
    if (!inspectionTimer.isRunning && inspectionTimer.elapsedSeconds === 0) {
      toggleInspectionTimer();
    }
  } else {
    if (criterioBox) criterioBox.classList.add("hidden");
  }
}

// Cambio en selector de modelo del supervisor
function handleSuperModeloChange() {
  const mod = document.getElementById("super-input-modelo")?.value;
  const selArea = document.getElementById("super-input-area");
  if (mod && selArea && selArea.value !== "Pintura" && selArea.value !== "Ensamble") {
    selArea.value = getAreaForModel(mod);
  }
}

function toggleFaltantesInput() {
  const isChecked = document.getElementById("check-faltantes").checked;
  const container = document.getElementById("faltantes-container");
  if (isChecked) {
    container.classList.remove("hidden");
  } else {
    container.classList.add("hidden");
    document.getElementById("input-descripcion-faltantes").value = "";
  }
  if (typeof updateMutualExclusionPhotoAndReleaseState === "function") {
    updateMutualExclusionPhotoAndReleaseState();
  }
}

// ==================== MARCA DE AGUA Y CAPTURA DUAL DE FOTOS ====================
function stampWatermarkOnPhoto(file, watermarkCategory, hallazgoTexto, callback) {
  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      // Usar Canvas para incrustar la marca de agua legal anti-manipulación
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Redimensionar para optimizar peso (máx 1200px ancho)
      const maxWidth = 1200;
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = (maxWidth / width) * height;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      // Dibujar imagen original
      ctx.drawImage(img, 0, 0, width, height);

      // Estampar franja inferior oscura para legibilidad
      const barHeight = Math.max(54, height * 0.085);
      ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
      ctx.fillRect(0, height - barHeight, width, barHeight);

      // Borde de acento (verde si es producto inspeccionado, rojo si es defecto)
      ctx.fillStyle = watermarkCategory === "producto" ? "#10b981" : "#ef4444";
      ctx.fillRect(0, height - barHeight, width, 4);

      // Textos de auditoría
      const nowStr = new Date().toLocaleString();
      const serie = document.getElementById("input-serie").value.trim() || "SIN-SERIE";

      ctx.fillStyle = "#ffffff";
      ctx.font = `bold ${Math.max(14, Math.floor(barHeight * 0.30))}px monospace`;
      ctx.fillText(`AUDITUM | NÓMINA: ${appState.currentUser.nomina} (${appState.currentUser.nombre})`, 16, height - (barHeight * 0.55));

      ctx.fillStyle = watermarkCategory === "producto" ? "#34d399" : "#fca5a5";
      ctx.font = `${Math.max(12, Math.floor(barHeight * 0.26))}px monospace`;
      ctx.fillText(`SERIE: ${serie} | FECHA: ${nowStr} | ${hallazgoTexto.toUpperCase()}`, 16, height - (barHeight * 0.18));

      const stampedDataUrl = canvas.toDataURL("image/jpeg", 0.85);

      callback({
        id: "FOT-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
        categoria: watermarkCategory,
        tipo: hallazgoTexto,
        url: stampedDataUrl,
        timestamp: nowStr,
        nomina: appState.currentUser.nomina,
        descripcion: `${watermarkCategory === "producto" ? "Pieza Inspeccionada" : "Defecto Detectado"} - ${hallazgoTexto}`
      });
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// 1. Manejador para Foto del Producto Inspeccionado (Pieza Checada)
function handleProductPhotoCapture(event) {
  const file = event.target.files[0];
  if (!file) return;

  stampWatermarkOnPhoto(file, "producto", "Producto Inspeccionado", (photoItem) => {
    appState.tempPhotosProducto.push(photoItem);
    renderPhotosProductoGrid();
    updateMutualExclusionPhotoAndReleaseState();
  });
  event.target.value = "";
}

function renderPhotosProductoGrid() {
  const grid = document.getElementById("photos-producto-grid");
  if (!grid) return;

  if (appState.tempPhotosProducto.length === 0) {
    grid.innerHTML = `
      <p id="no-photos-producto-msg" class="text-[11px] text-slate-500 italic col-span-full py-4 text-center">
        <i class="fa-regular fa-image block text-base mb-1 text-slate-600"></i> Sin foto de la pieza checada
      </p>
    `;
    return;
  }

  grid.innerHTML = "";
  appState.tempPhotosProducto.forEach((photo, idx) => {
    const card = document.createElement("div");
    card.className = "relative rounded-lg overflow-hidden border border-emerald-500/40 bg-slate-900 group shadow";
    card.innerHTML = `
      <img src="${photo.url}" class="w-full h-24 object-cover">
      <div class="p-1 text-[10px] bg-slate-900/90 truncate">
        <span class="font-bold text-emerald-400 block truncate">🟢 ${photo.tipo}</span>
        <span class="text-slate-400 font-mono">${photo.timestamp.split(" ")[1] || ""}</span>
      </div>
      <button type="button" onclick="removeTempPhotoProducto(${idx})" class="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition shadow">
        <i class="fa-solid fa-trash"></i>
      </button>
    `;
    grid.appendChild(card);
  });
}

function removeTempPhotoProducto(idx) {
  appState.tempPhotosProducto.splice(idx, 1);
  renderPhotosProductoGrid();
  updateMutualExclusionPhotoAndReleaseState();
}

// 2. Manejador para Foto del Producto Defectuoso
function handleDefectPhotoCapture(event) {
  const file = event.target.files[0];
  if (!file) return;

  const tipoDefecto = document.getElementById("defect-type-select").value || "Defecto general";

  stampWatermarkOnPhoto(file, "defecto", `Defecto: ${tipoDefecto}`, (photoItem) => {
    appState.tempPhotosDefecto.push(photoItem);
    renderPhotosDefectoGrid();
    updateMutualExclusionPhotoAndReleaseState();
  });
  event.target.value = "";
}

function renderPhotosDefectoGrid() {
  const grid = document.getElementById("photos-defecto-grid");
  if (!grid) return;

  if (appState.tempPhotosDefecto.length === 0) {
    grid.innerHTML = `
      <p id="no-photos-defecto-msg" class="text-[11px] text-slate-500 italic col-span-full py-4 text-center">
        <i class="fa-regular fa-image block text-base mb-1 text-slate-600"></i> No se han subido fotos de defectos
      </p>
    `;
    return;
  }

  grid.innerHTML = "";
  appState.tempPhotosDefecto.forEach((photo, idx) => {
    const card = document.createElement("div");
    card.className = "relative rounded-lg overflow-hidden border border-red-500/40 bg-slate-900 group shadow";
    card.innerHTML = `
      <img src="${photo.url}" class="w-full h-24 object-cover">
      <div class="p-1 text-[10px] bg-slate-900/90 truncate">
        <span class="font-bold text-red-400 block truncate">🔴 ${photo.tipo}</span>
        <span class="text-slate-400 font-mono">${photo.timestamp.split(" ")[1] || ""}</span>
      </div>
      <button type="button" onclick="removeTempPhotoDefecto(${idx})" class="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition shadow">
        <i class="fa-solid fa-trash"></i>
      </button>
    `;
    grid.appendChild(card);
  });
}

function removeTempPhotoDefecto(idx) {
  appState.tempPhotosDefecto.splice(idx, 1);
  renderPhotosDefectoGrid();
  updateMutualExclusionPhotoAndReleaseState();
}

// 3. Reglas de Exclusión Mutua Automática (Fotos y Liberaci&#243;n)
function updateMutualExclusionPhotoAndReleaseState() {
  const hasGoodPhoto = appState.tempPhotosProducto && appState.tempPhotosProducto.length > 0;
  const hasDefectPhoto = appState.tempPhotosDefecto && appState.tempPhotosDefecto.length > 0;
  const checkFaltantes = document.getElementById("check-faltantes");
  const hasFaltantes = checkFaltantes ? checkFaltantes.checked : false;
  const hasDefects = hasDefectPhoto || hasFaltantes;

  // A) Control del lado DEFECTOS (Se bloquea automáticamente si se subió foto de que la inspección está bien)
  const cardDefecto = document.getElementById("card-foto-defecto");
  const btnLabelDefecto = document.getElementById("btn-label-camera-defecto");
  const inputDefecto = document.getElementById("camera-defecto-input");
  const selectDefecto = document.getElementById("defect-type-select");
  const bannerDefectoBlocked = document.getElementById("defecto-blocked-banner");
  const badgeNumDefecto = document.getElementById("badge-num-defecto");
  const badgeStatusDefecto = document.getElementById("badge-status-defecto");

  if (hasGoodPhoto) {
    if (cardDefecto) {
      cardDefecto.classList.add("opacity-50", "border-slate-700", "bg-slate-950/70");
      cardDefecto.classList.remove("border-red-500/40", "bg-slate-900/90");
    }
    if (btnLabelDefecto) {
      btnLabelDefecto.classList.add("pointer-events-none", "opacity-40", "bg-slate-700", "cursor-not-allowed");
      btnLabelDefecto.classList.remove("bg-red-600", "hover:bg-red-500");
    }
    if (inputDefecto) inputDefecto.disabled = true;
    if (selectDefecto) {
      selectDefecto.disabled = true;
      selectDefecto.classList.add("opacity-40", "cursor-not-allowed");
    }
    if (bannerDefectoBlocked) bannerDefectoBlocked.classList.remove("hidden");
    if (badgeNumDefecto) {
      badgeNumDefecto.classList.add("bg-slate-700", "text-slate-400", "border-slate-600");
      badgeNumDefecto.classList.remove("bg-red-500/20", "text-red-400", "border-red-500/30");
    }
    if (badgeStatusDefecto) {
      badgeStatusDefecto.className = "px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-500 border border-slate-700 flex items-center gap-1";
      badgeStatusDefecto.innerHTML = '<i class="fa-solid fa-lock text-[9px]"></i> Bloqueado';
    }
  } else {
    if (cardDefecto) {
      cardDefecto.classList.remove("opacity-50", "border-slate-700", "bg-slate-950/70");
      cardDefecto.classList.add("border-red-500/40", "bg-slate-900/90");
    }
    if (btnLabelDefecto) {
      btnLabelDefecto.classList.remove("pointer-events-none", "opacity-40", "bg-slate-700", "cursor-not-allowed");
      btnLabelDefecto.classList.add("bg-red-600", "hover:bg-red-500");
    }
    if (inputDefecto) inputDefecto.disabled = false;
    if (selectDefecto) {
      selectDefecto.disabled = false;
      selectDefecto.classList.remove("opacity-40", "cursor-not-allowed");
    }
    if (bannerDefectoBlocked) bannerDefectoBlocked.classList.add("hidden");
    if (badgeNumDefecto) {
      badgeNumDefecto.classList.remove("bg-slate-700", "text-slate-400", "border-slate-600");
      badgeNumDefecto.classList.add("bg-red-500/20", "text-red-400", "border-red-500/30");
    }
    if (badgeStatusDefecto) {
      badgeStatusDefecto.className = "px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20";
      badgeStatusDefecto.innerText = "Hallazgo / Daño";
    }
  }

  // B) Control del lado PRODUCTO CHECADO (Se bloquea si hay un defecto o faltante encontrado)
  const cardProducto = document.getElementById("card-foto-producto");
  const btnLabelProducto = document.getElementById("btn-label-camera-producto");
  const inputProducto = document.getElementById("camera-producto-input");
  const bannerProductoBlocked = document.getElementById("producto-blocked-banner");
  const badgeNumProducto = document.getElementById("badge-num-producto");
  const badgeStatusProducto = document.getElementById("badge-status-producto");

  if (hasDefects) {
    if (cardProducto) {
      cardProducto.classList.add("opacity-50", "border-slate-700", "bg-slate-950/70");
      cardProducto.classList.remove("border-emerald-500/40", "bg-slate-900/90");
    }
    if (btnLabelProducto) {
      btnLabelProducto.classList.add("pointer-events-none", "opacity-40", "bg-slate-700", "cursor-not-allowed");
      btnLabelProducto.classList.remove("bg-emerald-600", "hover:bg-emerald-500");
    }
    if (inputProducto) inputProducto.disabled = true;
    if (bannerProductoBlocked) bannerProductoBlocked.classList.remove("hidden");
    if (badgeNumProducto) {
      badgeNumProducto.classList.add("bg-slate-700", "text-slate-400", "border-slate-600");
      badgeNumProducto.classList.remove("bg-emerald-500/20", "text-emerald-400", "border-emerald-500/30");
    }
    if (badgeStatusProducto) {
      badgeStatusProducto.className = "px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-500 border border-slate-700 flex items-center gap-1";
      badgeStatusProducto.innerHTML = '<i class="fa-solid fa-lock text-[9px]"></i> Bloqueado';
    }
  } else {
    if (cardProducto) {
      cardProducto.classList.remove("opacity-50", "border-slate-700", "bg-slate-950/70");
      cardProducto.classList.add("border-emerald-500/40", "bg-slate-900/90");
    }
    if (btnLabelProducto) {
      btnLabelProducto.classList.remove("pointer-events-none", "opacity-40", "bg-slate-700", "cursor-not-allowed");
      btnLabelProducto.classList.add("bg-emerald-600", "hover:bg-emerald-500");
    }
    if (inputProducto) inputProducto.disabled = false;
    if (bannerProductoBlocked) bannerProductoBlocked.classList.add("hidden");
    if (badgeNumProducto) {
      badgeNumProducto.classList.remove("bg-slate-700", "text-slate-400", "border-slate-600");
      badgeNumProducto.classList.add("bg-emerald-500/20", "text-emerald-400", "border-emerald-500/30");
    }
    if (badgeStatusProducto) {
      badgeStatusProducto.className = "px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      badgeStatusProducto.innerText = "Inspecci&#243;n General";
    }
  }

  // C) Bloqueo de la PARTE PARA LIBERAR si hay un defecto o faltante encontrado
  const radioLiberado = document.getElementById("radio-estatus-liberado");
  const optionLiberado = document.getElementById("option-container-liberado");
  const badgeLiberadoBlocked = document.getElementById("liberado-blocked-badge");
  const btnFinalizarInsp = document.getElementById("btn-submit-finalizar-insp");

  if (hasDefects) {
    const checkF = document.getElementById("check-faltantes");
    const hasF = checkF ? checkF.checked : false;
    const radioFaltantes = document.getElementById("radio-estatus-faltantes");
    if (hasF && radioFaltantes) {
      radioFaltantes.checked = true;
    }

    if (btnFinalizarInsp) {
      btnFinalizarInsp.disabled = false;
      btnFinalizarInsp.classList.remove("opacity-40", "cursor-not-allowed", "bg-slate-700", "pointer-events-none");
      btnFinalizarInsp.classList.add("bg-amber-600", "hover:bg-amber-500", "shadow-amber-600/30");
      btnFinalizarInsp.innerHTML = '<i class="fa-solid fa-flag-checkered"></i> Finalizar Inspecci&#243;n (Con Opciones)';
      btnFinalizarInsp.title = "Opciones para finalizar la inspección con faltantes, a retrabajo o liberado.";
    }
  } else {
    if (radioLiberado) radioLiberado.disabled = false;
    if (btnFinalizarInsp) {
      btnFinalizarInsp.disabled = false;
      btnFinalizarInsp.classList.remove("opacity-40", "cursor-not-allowed", "bg-slate-700", "pointer-events-none", "bg-amber-600", "hover:bg-amber-500");
      btnFinalizarInsp.classList.add("bg-emerald-600", "hover:bg-emerald-500", "shadow-emerald-600/30");
      btnFinalizarInsp.innerHTML = '<i class="fa-solid fa-flag-checkered"></i> Finalizar Inspecci&#243;n';
      btnFinalizarInsp.title = "Finalizar inspección y seleccionar estatus de entrega.";
    }
  }
}

// ==================== GUARDAR NUEVA INSPECCI&#211;N ====================
function saveInspectionWithAction(action) {
  if (action === "traspaso") {
    handleSaveInspection(null, "Pausado");
  } else if (action === "finalizar") {
    openOpcionesFinalizarModal("nueva");
  } else {
    handleSaveInspection(null, "En Proceso");
  }
}

function handleSaveInspection(event, statusOverride) {
  if (event) event.preventDefault();

  const parte = document.getElementById("input-parte").value;
  const modelo = document.getElementById("input-modelo").value;
  const serie = document.getElementById("input-serie").value.trim();
  const area = document.getElementById("input-area").value;
  const tieneFaltantes = document.getElementById("check-faltantes").checked ? "SI" : "NO";
  const descFaltantes = document.getElementById("input-descripcion-faltantes").value.trim();
  const notasIniciales = document.getElementById("input-notas-iniciales").value.trim();

  if (!parte || !modelo || !serie || !area) {
    alert("Por favor completa los campos obligatorios (*) [N&#250;mero de Parte, Modelo, Serie, Área]");
    return;
  }

  // Determinar estatus destino (override o radio button o En Proceso)
  let targetStatus = statusOverride;
  if (!targetStatus) {
    const radioSelected = document.querySelector('input[name="input-estatus-destino"]:checked');
    targetStatus = radioSelected ? radioSelected.value : "En Proceso";
  }
  if (targetStatus === "Concluido") targetStatus = "Liberado";

  // Validación estricta de calidad: Bloquear liberación si existen defectos o faltantes
  const hasDefectPhotos = appState.tempPhotosDefecto && appState.tempPhotosDefecto.length > 0;
  const hasDefects = hasDefectPhotos || (tieneFaltantes === "SI");
  if (hasDefects && targetStatus === "Liberado") {
    alert("⛔ ACCIÓN BLOQUEADA: La pieza cuenta con defectos o faltantes reportados y no puede ser liberada.\n\nEl estatus ha sido redirigido a 'Traspaso de Turno' (Pausado).");
    targetStatus = "Pausado";
  }

  // Generar folio
  const year = new Date().getFullYear();
  const folio = `INSP-${year}-${String(appState.inspecciones.length + 1).padStart(4, "0")}`;
  const now = new Date();
  const timestampStr = now.toISOString().replace("T", " ").substring(0, 19);

  // Calcular tiempo exacto y homogéneo del cron&#243;metro de inspección
  let elapsedSec = inspectionTimer.elapsedSeconds;

  // Si el cron&#243;metro sigue corriendo al guardar o liberar, pausarlo y congelar su tiempo medido
  if (inspectionTimer.isRunning) {
    toggleInspectionTimer();
    elapsedSec = inspectionTimer.elapsedSeconds;
  }

  // Si no se activó el cron&#243;metro manualmente, calcular segundos reales transcurridos desde que se abrió/inició el formulario
  if (!elapsedSec || elapsedSec <= 0) {
    if (inspectionTimer.startTimestampStr) {
      const startMs = new Date(inspectionTimer.startTimestampStr.replace(" ", "T")).getTime();
      const nowMs = now.getTime();
      if (nowMs > startMs) {
        elapsedSec = Math.round((nowMs - startMs) / 1000);
      }
    }
  }

  elapsedSec = Math.max(0, parseInt(elapsedSec) || 0);
  const elapsedMin = Math.max(1, Math.round(elapsedSec / 60));
  const horaInicioInspeccion = inspectionTimer.startTimestampStr || timestampStr;

  const allPhotos = [...appState.tempPhotosProducto, ...appState.tempPhotosDefecto];

  const respNombre = document.getElementById("in-defecto-responsable-nombre") ? document.getElementById("in-defecto-responsable-nombre").value.trim() : "";
  const respNomina = document.getElementById("in-defecto-responsable-nomina") ? document.getElementById("in-defecto-responsable-nomina").value.trim() : "";
  const respMotivo = document.getElementById("sel-defecto-responsable-motivo") ? document.getElementById("sel-defecto-responsable-motivo").value : "";
  const respNotas = document.getElementById("in-defecto-retroalimentacion-notas") ? document.getElementById("in-defecto-retroalimentacion-notas").value.trim() : "";
  const respEstatus = document.getElementById("sel-defecto-retroalimentacion-estatus") ? document.getElementById("sel-defecto-retroalimentacion-estatus").value : (respNombre ? "Pendiente" : "");

  const entregaStatus = targetStatus === "Pausado" ? "Pausado por Fin de Turno" : (targetStatus === "Liberado" ? "Inspecci&#243;n Finalizada / Liberada" : "En Proceso");

  const nuevaInspeccion = {
    id_inspeccion: folio,
    fecha_creacion: timestampStr,
    nomina_creador: appState.currentUser.nomina,
    numero_parte: parte,
    modelo: modelo,
    numero_serie: serie,
    area_ubicacion: area,
    estatus: targetStatus,
    tiene_faltantes: tieneFaltantes,
    descripcion_faltantes: descFaltantes,
    tiempo_segundos: elapsedSec,
    tiempo_minutos: elapsedMin,
    responsable_nombre: respNombre,
    responsable_nomina: respNomina,
    responsable_motivo: respMotivo,
    responsable_observaciones: respNotas,
    retroalimentacion_estatus: respEstatus,
    retroalimentacion_fecha: (respEstatus === "Realizada") ? timestampStr : "",
    fecha_liberacion: targetStatus === "Liberado" ? timestampStr : "",
    nomina_liberador: targetStatus === "Liberado" ? appState.currentUser.nomina : "",
    url_reporte_pdf: "",
    version_reporte: "1.0",
    turnos: [
      {
        id_turno: "TRN-" + Date.now(),
        nomina_colaborador: appState.currentUser.nomina,
        turno: appState.currentUser.turno || "Turno 1 (Matutino)",
        hora_inicio: horaInicioInspeccion,
        hora_fin: timestampStr,
        minutos: elapsedMin,
        segundos: elapsedSec,
        estatus_entrega: entregaStatus,
        notas: notasIniciales || (targetStatus === "Pausado" ? "Inspecci&#243;n pausada para traspaso de turno" : (targetStatus === "Liberado" ? "Inspecci&#243;n finalizada conforme" : "Inicio de inspección en piso"))
      }
    ],
    fotos_producto: [...appState.tempPhotosProducto],
    fotos_defecto: [...appState.tempPhotosDefecto],
    fotos: allPhotos
  };

  appState.inspecciones.unshift(nuevaInspeccion);
  saveToLocalStorage();

  // Enviar a Google Sheets en segundo plano si está configurado
  syncRecordToGoogleSheets("create_inspection", {
    id_inspeccion: folio,
    nomina_creador: appState.currentUser.nomina,
    numero_parte: parte,
    modelo: modelo,
    numero_serie: serie,
    area_ubicacion: area,
    estatus: targetStatus,
    tiene_faltantes: tieneFaltantes,
    descripcion_faltantes: descFaltantes,
    turno_inicial: {
      turno: appState.currentUser.turno,
      tiempo_minutos: elapsedMin,
    responsable_nombre: respNombre,
    responsable_nomina: respNomina,
    responsable_motivo: respMotivo,
    responsable_observaciones: respNotas,
    retroalimentacion_estatus: respEstatus,
    retroalimentacion_fecha: (respEstatus === "Realizada") ? timestampStr : "",
      hora_inicio: horaInicioInspeccion,
      hora_fin: timestampStr,
      notas: notasIniciales
    },
    fotos: allPhotos.map(p => ({ tipo: p.tipo, url_o_base64: p.url, descripcion: p.descripcion }))
  });

  if (targetStatus === "Pausado") {
    alert(`🔄 ¡Inspecci&#243;n guardada y enviada a Traspaso de Turno!\nFolio: ${folio}\nModelo: ${modelo}\nEstatus: Pausado (Disponible para continuar en la pestaña de Traspaso)`);
    resetInspectionForm();
    renderInspectionsTable();
    renderTraspasoList();
    updateKPIs();
    switchTab("traspaso");
  } else if (targetStatus === "Concluido") {
    alert(`✅ ¡Inspecci&#243;n finalizada con éxito!\nFolio: ${folio}\nModelo: ${modelo}\nEstatus: Concluido (Lista para liberación de calidad)`);
    resetInspectionForm();
    renderInspectionsTable();
    renderTraspasoList();
    updateKPIs();
    switchTab("dashboard");
  } else {
    alert(`📋 ¡Inspecci&#243;n registrada con éxito!\nFolio: ${folio}\nModelo: ${modelo}\nEstatus: En Proceso`);
    resetInspectionForm();
    renderInspectionsTable();
    renderTraspasoList();
    updateKPIs();
    switchTab("dashboard");
  }
}

function resetInspectionForm() {
  document.getElementById("inspection-form").reset();
  document.getElementById("input-modelo").value = "";
  document.getElementById("criterio-box").classList.add("hidden");
  document.getElementById("faltantes-container").classList.add("hidden");
  appState.tempPhotosProducto = [];
  appState.tempPhotosDefecto = [];
  renderPhotosProductoGrid();
  renderPhotosDefectoGrid();
  if (typeof updateMutualExclusionPhotoAndReleaseState === "function") {
    updateMutualExclusionPhotoAndReleaseState();
  }
  resetInspectionTimer();
  updateNextFolioPreview();
}

// ==================== TRASPASO DE TURNO ====================
function renderTraspasoList() {
  const container = document.getElementById("traspaso-list");
  const filterArea = document.getElementById("filter-traspaso-area").value;
  const badgeIncompletas = document.getElementById("badge-incompletas");

  // Filtrar las que no estén liberadas o rechazadas
  let pendientes = appState.inspecciones.filter(i => i.estatus === "Pausado" || i.estatus === "En Proceso");

  if (filterArea) {
    pendientes = pendientes.filter(i => i.area_ubicacion === filterArea);
  }

  badgeIncompletas.innerText = pendientes.length;

  if (pendientes.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-12 text-center text-slate-400">
        <i class="fa-solid fa-circle-check text-4xl text-emerald-400 mb-3 block"></i>
        <p class="text-sm font-semibold text-slate-300">No hay inspecciones pendientes o en traspaso.</p>
        <p class="text-xs text-slate-500 mt-1">Todos los componentes han sido liberados o no hay piezas en proceso actualmente.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = "";
  pendientes.forEach(item => {
    const card = document.createElement("div");
    card.className = "bg-slate-900/90 border border-slate-700 hover:border-blue-500/60 rounded-xl p-4 shadow-lg transition flex flex-col justify-between";

    const lastTurno = item.turnos && item.turnos.length > 0 ? item.turnos[item.turnos.length - 1] : null;

    card.innerHTML = `
      <div>
        <div class="flex items-center justify-between mb-2">
          <span class="font-mono text-cyan-400 font-bold text-sm">${item.id_inspeccion}</span>
          <span class="px-2 py-0.5 rounded text-[11px] font-bold ${item.estatus === 'Pausado' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'}">
            ${item.estatus}
          </span>
        </div>

        <h4 class="font-bold text-white text-sm truncate">${item.modelo}</h4>
        <div class="text-xs text-slate-400 font-mono mt-0.5">Serie: <strong class="text-slate-200">${item.numero_serie}</strong></div>
        <div class="text-xs text-slate-400 mt-0.5">Ubicaci&#243;n: <strong class="text-slate-300">${item.area_ubicacion}</strong></div>

        ${item.tiene_faltantes === "SI" ? `
          <div class="mt-2.5 p-2 rounded bg-amber-950/40 border border-amber-500/40 text-[11px] text-amber-200">
            <i class="fa-solid fa-triangle-exclamation mr-1"></i> <strong>Faltante:</strong> ${item.descripcion_faltantes}
          </div>
        ` : ''}

        <div class="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
          <div><i class="fa-solid fa-user-clock text-slate-500 mr-1"></i> Iniciado por: <span class="text-slate-300 font-mono">Nómina ${item.nomina_creador}</span></div>
          ${lastTurno ? `<div><i class="fa-solid fa-note-sticky text-slate-500 mr-1"></i> Última nota: "${lastTurno.notas || 'Sin notas'}"</div>` : ''}
        </div>
      </div>

      <div class="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
        <button onclick="openDetailModal('${item.id_inspeccion}')" class="text-xs text-slate-400 hover:text-white flex items-center gap-1">
          <i class="fa-solid fa-eye"></i> Ver Detalle
        </button>
        <button onclick="openResumeModal('${item.id_inspeccion}')" class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow flex items-center gap-1.5 transition">
          <i class="fa-solid fa-play"></i> Continuar Turno
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

let resumeTempPhotos = [];

function toggleResumeFaltantesInput() {
  const isChecked = document.getElementById("resume-check-faltantes").checked;
  const container = document.getElementById("resume-faltantes-container");
  if (container) {
    if (isChecked) {
      container.classList.remove("hidden");
      document.getElementById("resume-input-faltantes").focus();
      const selEstatus = document.getElementById("resume-estatus-entrega");
      if (selEstatus) selEstatus.value = "Con Faltantes";
    } else {
      container.classList.add("hidden");
      document.getElementById("resume-input-faltantes").value = "";
      const selEstatus = document.getElementById("resume-estatus-entrega");
      if (selEstatus && selEstatus.value === "Con Faltantes") selEstatus.value = "Liberado";
    }
  }
  updateResumeShiftReleaseState();
}

function handleResumePhotoCapture(event) {
  const file = event.target.files[0];
  if (!file) return;

  const tipoDefecto = document.getElementById("resume-defect-type").value || "Defecto";
  const target = appState.inspecciones.find(i => i.id_inspeccion === appState.resumeTargetId);
  const serie = target ? target.numero_serie : "SIN-SERIE";

  stampWatermarkOnPhoto(file, "defecto", `Traspaso: ${tipoDefecto}`, (photoItem) => {
    resumeTempPhotos.push(photoItem);
    renderResumePhotosPreview();
    updateResumeShiftReleaseState();
  });
  event.target.value = "";
}

function renderResumePhotosPreview() {
  const container = document.getElementById("resume-photos-preview");
  if (!container) return;
  container.innerHTML = "";
  if (resumeTempPhotos.length === 0) return;

  resumeTempPhotos.forEach((p, idx) => {
    const card = document.createElement("div");
    card.className = "relative rounded border border-red-500/50 bg-slate-950 p-1";
    card.innerHTML = `
      <img src="${p.url}" class="w-full h-16 object-cover rounded">
      <div class="text-[9px] text-red-400 font-bold truncate mt-1">🔴 ${p.tipo}</div>
      <button type="button" onclick="removeResumeTempPhoto(${idx})" class="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center shadow">
        <i class="fa-solid fa-xmark"></i>
      </button>
    `;
    container.appendChild(card);
  });
}

function removeResumeTempPhoto(idx) {
  resumeTempPhotos.splice(idx, 1);
  renderResumePhotosPreview();
  updateResumeShiftReleaseState();
}

function updateResumeShiftReleaseState() {
  const hasDefectPhotos = resumeTempPhotos && resumeTempPhotos.length > 0;
  const checkFaltantes = document.getElementById("resume-check-faltantes");
  const hasFaltantes = checkFaltantes ? checkFaltantes.checked : false;
  
  const target = appState.inspecciones.find(i => i.id_inspeccion === appState.resumeTargetId);
  const targetHasDefects = target && ((target.fotos_defecto && target.fotos_defecto.length > 0) || (target.fotos && target.fotos.some(f => (f.tipo || "").toLowerCase().includes("defecto"))) || target.tiene_faltantes === "SI");

  const btnFinalizar = document.getElementById("btn-resume-finalizar");
  const selEstatus = document.getElementById("resume-estatus-entrega");

  // El botón de Finalizar Inspecci&#243;n SIEMPRE permanece habilitado con opciones
  if (btnFinalizar) {
    btnFinalizar.disabled = false;
    btnFinalizar.classList.remove("opacity-40", "cursor-not-allowed", "bg-slate-700", "pointer-events-none");

    if (hasFaltantes) {
      btnFinalizar.className = "px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-600/30 flex items-center gap-1.5 transition active:scale-95 cursor-pointer";
      btnFinalizar.innerHTML = '<i class="fa-solid fa-flag-checkered text-amber-300"></i> Finalizar Inspecci&#243;n (Con Opciones)';
      btnFinalizar.title = "Opciones para finalizar inspección con faltantes, retrabajo o liberado.";
    } else if (hasDefectPhotos || targetHasDefects) {
      btnFinalizar.className = "px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 flex items-center gap-1.5 transition active:scale-95 cursor-pointer";
      btnFinalizar.innerHTML = '<i class="fa-solid fa-flag-checkered text-cyan-300"></i> Finalizar Inspecci&#243;n (Con Opciones)';
      btnFinalizar.title = "Opciones para finalizar inspección a retrabajo, scrap o conforme.";
    } else {
      btnFinalizar.className = "px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 transition active:scale-95 cursor-pointer";
      btnFinalizar.innerHTML = '<i class="fa-solid fa-flag-checkered"></i> Finalizar Inspecci&#243;n';
      btnFinalizar.title = "Opciones para finalizar inspección y registrar estatus final de la pieza.";
    }
  }

  // Todos los estatus en el selector quedan siempre habilitados
  if (selEstatus) {
    for (let i = 0; i < selEstatus.options.length; i++) {
      selEstatus.options[i].disabled = false;
    }
  }
}

// ==================== MODAL DE OPCIONES DE FINALIZACIÓN DE INSPECCI&#211;N ====================
let activeFinalizarContext = "resume"; // "resume" o "nueva"

function openOpcionesFinalizarModal(context = "resume") {
  activeFinalizarContext = context;
  const modal = document.getElementById("modal-opciones-finalizar");
  if (!modal) return;

  const folioBadge = document.getElementById("finalizar-opciones-folio");
  const bannerFaltantes = document.getElementById("finalizar-banner-faltantes");
  const bannerFaltantesDesc = document.getElementById("finalizar-banner-faltantes-desc");
  const bannerDefectos = document.getElementById("finalizar-banner-defectos");
  const cardFaltantes = document.getElementById("card-opcion-faltantes");
  const cardLiberado = document.getElementById("card-opcion-liberado");

  let idInspeccion = "";
  let hasFaltantes = false;
  let descFaltantes = "";
  let hasDefects = false;

  if (context === "resume") {
    idInspeccion = appState.resumeTargetId || document.getElementById("resume-folio")?.innerText || "INSP-ACTUAL";
    const checkF = document.getElementById("resume-check-faltantes");
    hasFaltantes = checkF ? checkF.checked : false;
    descFaltantes = document.getElementById("resume-input-faltantes")?.value.trim() || "";
    hasDefects = (resumeTempPhotos && resumeTempPhotos.length > 0);
    const target = appState.inspecciones.find(i => i.id_inspeccion === idInspeccion);
    if (target) {
      if (!descFaltantes && target.descripcion_faltantes) descFaltantes = target.descripcion_faltantes;
      if (!hasFaltantes && target.tiene_faltantes === "SI") hasFaltantes = true;
    }
  } else {
    idInspeccion = document.getElementById("input-serie")?.value.trim() || "Nueva Inspecci&#243;n";
    const checkF = document.getElementById("check-faltantes");
    hasFaltantes = checkF ? checkF.checked : false;
    descFaltantes = document.getElementById("input-descripcion-faltantes")?.value.trim() || "";
    hasDefects = (appState.tempPhotosDefecto && appState.tempPhotosDefecto.length > 0);
  }

  if (folioBadge) folioBadge.innerText = idInspeccion;

  // Notificación de faltantes
  if (hasFaltantes) {
    if (bannerFaltantes) bannerFaltantes.classList.remove("hidden");
    if (bannerFaltantesDesc) bannerFaltantesDesc.innerText = descFaltantes ? `"${descFaltantes}"` : "Faltantes marcados sin descripción detallada";
    if (cardFaltantes) {
      cardFaltantes.classList.add("ring-2", "ring-amber-400", "shadow-amber-500/20");
    }
    if (cardLiberado) {
      cardLiberado.classList.remove("ring-2", "ring-emerald-400");
    }
  } else {
    if (bannerFaltantes) bannerFaltantes.classList.add("hidden");
    if (cardFaltantes) {
      cardFaltantes.classList.remove("ring-2", "ring-amber-400", "shadow-amber-500/20");
    }
    if (cardLiberado) {
      cardLiberado.classList.add("ring-2", "ring-emerald-400");
    }
  }

  // Notificación de defectos
  if (hasDefects) {
    if (bannerDefectos) bannerDefectos.classList.remove("hidden");
  } else {
    if (bannerDefectos) bannerDefectos.classList.add("hidden");
  }

  modal.classList.remove("hidden");
}

function closeOpcionesFinalizarModal() {
  const modal = document.getElementById("modal-opciones-finalizar");
  if (modal) modal.classList.add("hidden");
}

function handleResumeEstatusEntregaChange() {
  const sel = document.getElementById("resume-estatus-entrega");
  const btnFinalizar = document.getElementById("btn-resume-finalizar");
  if (!sel || !btnFinalizar) return;
  const val = sel.value;
  if (val === "Con Faltantes") {
    btnFinalizar.innerHTML = '<i class="fa-solid fa-flag-checkered text-amber-300"></i> Finalizar (Con Faltantes)';
    btnFinalizar.className = "px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-600/30 flex items-center gap-1.5 transition active:scale-95 cursor-pointer";
  } else if (val === "En Espera de Retrabajo") {
    btnFinalizar.innerHTML = '<i class="fa-solid fa-wrench text-blue-300"></i> Finalizar (A Retrabajo)';
    btnFinalizar.className = "px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 flex items-center gap-1.5 transition active:scale-95 cursor-pointer";
  } else if (val === "Scrap" || val === "Rechazado") {
    btnFinalizar.innerHTML = '<i class="fa-solid fa-ban text-rose-300"></i> Finalizar (Scrap / Rechazo)';
    btnFinalizar.className = "px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 flex items-center gap-1.5 transition active:scale-95 cursor-pointer";
  } else if (val === "Pausado") {
    btnFinalizar.innerHTML = '<i class="fa-solid fa-arrow-right-arrow-left text-amber-300"></i> Traspaso de Turno';
    btnFinalizar.className = "px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-600/30 flex items-center gap-1.5 transition active:scale-95 cursor-pointer";
  } else {
    btnFinalizar.innerHTML = '<i class="fa-solid fa-circle-check text-emerald-300"></i> Finalizar (Liberado)';
    btnFinalizar.className = "px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 transition active:scale-95 cursor-pointer";
  }
}

function executeFinalizarWithOption(statusOption) {
  closeOpcionesFinalizarModal();

  if (activeFinalizarContext === "resume") {
    const sel = document.getElementById("resume-estatus-entrega");
    if (sel) sel.value = statusOption;
    confirmResumeShift(statusOption);
  } else {
    // Contexto: Nueva Inspecci&#243;n
    const radioLib = document.getElementById("radio-estatus-liberado");
    const radioFalt = document.getElementById("radio-estatus-faltantes");
    const radioPaus = document.getElementById("radio-estatus-pausado");

    if (statusOption === "Liberado" && radioLib) radioLib.checked = true;
    else if (statusOption === "Con Faltantes" && radioFalt) radioFalt.checked = true;
    else if (statusOption === "Pausado" && radioPaus) radioPaus.checked = true;

    handleSaveInspection(null, statusOption);
  }
}

function openResumeModal(idInspeccion) {
  const target = appState.inspecciones.find(i => i.id_inspeccion === idInspeccion);
  if (!target) return;

  appState.resumeTargetId = idInspeccion;
  document.getElementById("resume-folio").innerText = idInspeccion;

  // Llenar selector de inspectores
  const selectInspector = document.getElementById("resume-inspector-select");
  selectInspector.innerHTML = "";

  appState.usuarios.forEach(u => {
    const isSelected = u.nomina == appState.currentUser.nomina ? "selected" : "";
    selectInspector.innerHTML += `<option value="${u.nomina}" ${isSelected}>Nómina ${u.nomina} - ${u.nombre} (${u.turno || u.rol})</option>`;
  });
  selectInspector.innerHTML += `<option value="custom">✏️ Ingresar otro colaborador / número de nómina...</option>`;

  // Ocultar caja custom por defecto
  const customBox = document.getElementById("resume-custom-box");
  customBox.classList.add("hidden");
  document.getElementById("resume-custom-nomina").value = "";
  document.getElementById("resume-custom-nombre").value = "";

  // Pre-llenar horarios de inicio y fin con fecha/hora actual
  const now = new Date();
  const formatDateTimeLocal = (date) => {
    const pad = (n) => String(n).padStart(2, "0");
    const yyyy = date.getFullYear();
    const mm = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const mi = pad(date.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  };

  const endLater = new Date(now.getTime() + 30 * 60000); // +30 minutos por defecto
  document.getElementById("resume-hora-inicio").value = formatDateTimeLocal(now);
  document.getElementById("resume-hora-fin").value = formatDateTimeLocal(endLater);

  // Cargar estado de Faltantes
  const checkFaltantes = document.getElementById("resume-check-faltantes");
  const containerFaltantes = document.getElementById("resume-faltantes-container");
  const inputFaltantes = document.getElementById("resume-input-faltantes");

  if (target.tiene_faltantes === "SI") {
    if (checkFaltantes) checkFaltantes.checked = true;
    if (containerFaltantes) containerFaltantes.classList.remove("hidden");
    if (inputFaltantes) inputFaltantes.value = target.descripcion_faltantes || "";
  } else {
    if (checkFaltantes) checkFaltantes.checked = false;
    if (containerFaltantes) containerFaltantes.classList.add("hidden");
    if (inputFaltantes) inputFaltantes.value = "";
  }

  // Limpiar fotos temporales de traspaso
  resumeTempPhotos = [];
  renderResumePhotosPreview();

  // Turno y Estatus
  document.getElementById("resume-turno").value = appState.currentUser.turno || "Turno 1 (06:00 - 14:00)";
  document.getElementById("resume-estatus-entrega").value = (target.estatus === "Liberado" || target.estatus === "Concluido") ? "Liberado" : "Pausado";
  document.getElementById("resume-notas").value = "";

  document.getElementById("modal-resume-shift").classList.remove("hidden");
}

function handleResumeInspectorChange() {
  const selectVal = document.getElementById("resume-inspector-select").value;
  const customBox = document.getElementById("resume-custom-box");

  if (selectVal === "custom") {
    customBox.classList.remove("hidden");
    document.getElementById("resume-custom-nomina").focus();
  } else {
    customBox.classList.add("hidden");
    const user = appState.usuarios.find(u => u.nomina == selectVal);
    if (user && user.turno) {
      const turnoSelect = document.getElementById("resume-turno");
      if (user.turno.includes("1")) turnoSelect.value = "Turno 1 (06:00 - 14:00)";
      else if (user.turno.includes("2")) turnoSelect.value = "Turno 2 (14:00 - 21:30)";
      else if (user.turno.includes("3")) turnoSelect.value = "Turno 3 (21:30 - 06:00)";
    }
  }
}

function closeResumeModal() {
  document.getElementById("modal-resume-shift").classList.add("hidden");
  resumeTempPhotos = [];
  appState.resumeTargetId = null;
}

function confirmResumeShiftWithStatus(statusOverride) {
  const mapped = (statusOverride === "Concluido" || statusOverride === "Liberado") ? "Liberado" : statusOverride;
  if (mapped === "Liberado") {
    const hasDefectPhotos = resumeTempPhotos && resumeTempPhotos.length > 0;
    const checkFaltantes = document.getElementById("resume-check-faltantes");
    const hasFaltantes = checkFaltantes ? checkFaltantes.checked : false;
    const target = appState.inspecciones.find(i => i.id_inspeccion === appState.resumeTargetId);
    const targetHasDefects = target && ((target.fotos_defecto && target.fotos_defecto.length > 0) || (target.fotos && target.fotos.some(f => (f.tipo || "").toLowerCase().includes("defecto"))) || target.tiene_faltantes === "SI");
    
    // Si hay faltantes o defectos, ofrecer el menú de opciones para que el inspector decida
    if (hasDefectPhotos || hasFaltantes || targetHasDefects) {
      openOpcionesFinalizarModal("resume");
      return;
    }
  }
  if (mapped) {
    const sel = document.getElementById("resume-estatus-entrega");
    if (sel) sel.value = mapped;
  }
  confirmResumeShift(mapped);
}

function confirmResumeShift(statusOverride) {
  let targetId = appState.resumeTargetId;
  if (!targetId) {
    const folioEl = document.getElementById("resume-folio");
    if (folioEl && folioEl.innerText) {
      targetId = folioEl.innerText.trim();
    }
  }

  if (!targetId) {
    alert("⚠️ No se ha seleccionado ninguna inspección para traspaso.");
    return;
  }

  const target = appState.inspecciones.find(i => i.id_inspeccion === targetId);
  if (!target) {
    alert(`⚠️ No se encontró la inspección ${targetId} en el sistema.`);
    return;
  }

  const selectInspectorVal = document.getElementById("resume-inspector-select").value;
  let inspectorNomina = null;
  let inspectorNombre = "";

  if (selectInspectorVal === "custom") {
    const customNominaVal = parseInt(document.getElementById("resume-custom-nomina").value);
    const customNombreVal = document.getElementById("resume-custom-nombre").value.trim();

    if (!customNominaVal) {
      alert("Por favor ingresa el número de nómina del colaborador que continuará.");
      return;
    }
    inspectorNomina = customNominaVal;
    inspectorNombre = customNombreVal || `Colaborador Nómina #${customNominaVal}`;

    if (!appState.usuarios.some(u => u.nomina === customNominaVal)) {
      appState.usuarios.push({
        nomina: customNominaVal,
        nombre: inspectorNombre,
        rol: "colaborador",
        turno: document.getElementById("resume-turno").value,
        email: `empleado${customNominaVal}@acero.com`
      });
    }
  } else {
    const foundUser = appState.usuarios.find(u => u.nomina == selectInspectorVal);
    if (foundUser) {
      inspectorNomina = foundUser.nomina;
      inspectorNombre = foundUser.nombre;
    } else {
      inspectorNomina = parseInt(selectInspectorVal) || appState.currentUser.nomina;
      inspectorNombre = `Nómina ${inspectorNomina}`;
    }
  }

  const turnoVal = document.getElementById("resume-turno").value;
  const horaInicioVal = document.getElementById("resume-hora-inicio").value;
  const horaFinVal = document.getElementById("resume-hora-fin").value;
  const rawEstatusEntrega = statusOverride || document.getElementById("resume-estatus-entrega").value;
  const notas = document.getElementById("resume-notas").value.trim();

  // Faltantes
  const checkFaltantes = document.getElementById("resume-check-faltantes");
  const inputFaltantes = document.getElementById("resume-input-faltantes");
  let tieneFaltantes = (checkFaltantes && checkFaltantes.checked) ? "SI" : (target.tiene_faltantes || "NO");
  let descFaltantes = (inputFaltantes && checkFaltantes && checkFaltantes.checked) ? inputFaltantes.value.trim() : (target.descripcion_faltantes || "");

  // Calcular minutos reales entre inicio y fin
  let minutos = 30;
  if (horaInicioVal && horaFinVal) {
    const tInicio = new Date(horaInicioVal).getTime();
    const tFin = new Date(horaFinVal).getTime();
    if (tFin >= tInicio) {
      minutos = Math.round((tFin - tInicio) / 60000);
    }
  }

  const nowIso = new Date().toISOString().replace("T", " ").substring(0, 19);
  const horaInicioFormatted = horaInicioVal ? horaInicioVal.replace("T", " ") + ":00" : nowIso;
  const horaFinFormatted = horaFinVal ? horaFinVal.replace("T", " ") + ":00" : horaInicioFormatted;

  // Determinar estatus final de la pieza
  let nuevoEstatusInspeccion = "En Proceso";
  const stUpper = (statusOverride || rawEstatusEntrega || "").toUpperCase();
  if (stUpper.includes("FALTANTE") || stUpper === "CON FALTANTES") {
    nuevoEstatusInspeccion = "Con Faltantes";
    tieneFaltantes = "SI";
  } else if (stUpper.includes("CONCLUIDO") || stUpper.includes("LIBERADO")) {
    nuevoEstatusInspeccion = "Liberado";
  } else if (stUpper.includes("SCRAP") || stUpper.includes("RECHAZADO") || stUpper.includes("RECHAZO")) {
    nuevoEstatusInspeccion = "Rechazado";
  } else if (stUpper.includes("RETRABAJO") || stUpper.includes("ESPERA DE RETRABAJO")) {
    nuevoEstatusInspeccion = "En Espera de Retrabajo";
  } else if (stUpper.includes("PAUSADO") || stUpper.includes("TRASPASO")) {
    nuevoEstatusInspeccion = "Pausado";
  } else {
    nuevoEstatusInspeccion = "En Proceso";
  }

  target.estatus = nuevoEstatusInspeccion;
  target.tiene_faltantes = tieneFaltantes;
  if (descFaltantes) target.descripcion_faltantes = descFaltantes;

  if (nuevoEstatusInspeccion === "Liberado") {
    target.fecha_liberacion = horaFinFormatted || nowIso;
    target.nomina_liberador = inspectorNomina;
  } else if (nuevoEstatusInspeccion === "Con Faltantes") {
    target.fecha_liberacion = null;
    target.fecha_conclusion = horaFinFormatted || nowIso;
    target.nomina_liberador = "";
  } else if (nuevoEstatusInspeccion === "En Espera de Retrabajo" || nuevoEstatusInspeccion === "Rechazado") {
    target.fecha_liberacion = null;
    target.fecha_conclusion = horaFinFormatted || nowIso;
  }

  let entregaText = rawEstatusEntrega;
  if (nuevoEstatusInspeccion === "Liberado") entregaText = "Inspecci&#243;n Finalizada / Liberada";
  else if (nuevoEstatusInspeccion === "Con Faltantes") entregaText = `Inspecci&#243;n Finalizada (Con Faltantes: ${descFaltantes || 'Pendiente de Surtimiento'})`;
  else if (nuevoEstatusInspeccion === "En Espera de Retrabajo") entregaText = "Inspecci&#243;n Finalizada (Canalizada a Retrabajo)";
  else if (nuevoEstatusInspeccion === "Rechazado") entregaText = "Inspecci&#243;n Finalizada (Rechazado / Scrap)";

  const nuevoTramoTurno = {
    id_turno: "TRN-" + Date.now(),
    nomina_colaborador: inspectorNomina,
    turno: turnoVal,
    hora_inicio: horaInicioFormatted,
    hora_fin: horaFinFormatted,
    minutos: minutos,
    segundos: minutos * 60,
    estatus_entrega: entregaText,
    notas: notas || (nuevoEstatusInspeccion === "Liberado" 
      ? "Inspecci&#243;n concluida y liberada conforme" 
      : `Intervención de inspección finalizada con estatus: ${nuevoEstatusInspeccion}`)
  };

  if (!target.turnos) target.turnos = [];
  target.turnos.push(nuevoTramoTurno);

  // Recalcular tiempo acumulado total de la inspección de forma homogénea
  let totalSecTarget = 0;
  target.turnos.forEach(t => {
    const s = parseInt(t.segundos) || 0;
    const m = parseInt(t.minutos) || 0;
    totalSecTarget += s > 0 ? s : (m > 0 ? m * 60 : 0);
  });
  target.tiempo_segundos = totalSecTarget;
  target.tiempo_minutos = Math.max(1, Math.round(totalSecTarget / 60));

  // Registrar en bitácora de auditoría
  if (!appState.auditoria) appState.auditoria = [];
  appState.auditoria.unshift({
    id_auditoria: "AUD-" + Date.now(),
    id_inspeccion: target.id_inspeccion,
    nomina_usuario: inspectorNomina,
    accion: `Inspecci&#243;n concluida (${nuevoEstatusInspeccion})`,
    fecha_modificacion: nowIso,
    campo_modificado: "Estatus",
    valor_anterior: "En Proceso / Traspaso",
    valor_nuevo: nuevoEstatusInspeccion,
    motivo_justificacion: descFaltantes ? `Faltantes: ${descFaltantes}` : (notas || `Intervención finalizada con estatus ${nuevoEstatusInspeccion}`)
  });

  // Adjuntar fotos tomadas durante traspaso si las hay
  const nuevasFotos = [...resumeTempPhotos];
  if (nuevasFotos.length > 0) {
    if (!target.fotos) target.fotos = [];
    if (!target.fotos_defecto) target.fotos_defecto = [];
    nuevasFotos.forEach(f => {
      target.fotos.push(f);
      target.fotos_defecto.push(f);
    });
  }

  saveToLocalStorage();

  // Sincronizar tramo de turno a Google Sheets (2.TBL_TURNOS_DETALLE, 1-TBS_INSPECCIONES y 3.TBL_EVIDENCIAS_FOTOS)
  syncRecordToGoogleSheets("add_shift_record", {
    id_inspeccion: target.id_inspeccion,
    nomina_colaborador: inspectorNomina,
    turno: turnoVal,
    hora_inicio: horaInicioFormatted,
    hora_fin: horaFinFormatted,
    tiempo_minutos: minutos,
    estatus_entrega: rawEstatusEntrega,
    notas_traspaso: notas,
    nuevo_estatus_inspeccion: nuevoEstatusInspeccion,
    tiene_faltantes: tieneFaltantes,
    descripcion_faltantes: descFaltantes,
    fotos: nuevasFotos.map(p => ({ id: p.id, tipo: p.tipo, timestamp: p.timestamp, descripcion: p.descripcion, url: p.url }))
  });

  resumeTempPhotos = [];
  closeResumeModal();
  renderTraspasoList();
  renderInspectionsTable();
  updateKPIs();
  if (typeof renderGerenteCharts === "function") {
    renderGerenteCharts();
  }
  if (typeof renderDefectosTab === "function") {
    renderDefectosTab();
  }

  if (nuevoEstatusInspeccion === "Liberado") {
    alert(`🏁 ¡Inspecci&#243;n concluida y liberada con éxito!\n\nPieza: ${target.id_inspeccion}\nEstatus: LIBERADO (Listo para entrega)\nInspector: ${inspectorNombre} (Nómina ${inspectorNomina})`);
  } else if (nuevoEstatusInspeccion === "Con Faltantes") {
    alert(`⚠️ ¡Inspecci&#243;n concluida con faltantes!\n\nPieza: ${target.id_inspeccion}\nEstatus: CON FALTANTES\nFaltantes reportados: ${descFaltantes || 'Sin detalle'}\nInspector: ${inspectorNombre} (Nómina ${inspectorNomina})\nQueda registrada para surtimiento de piezas.`);
  } else if (nuevoEstatusInspeccion === "En Espera de Retrabajo") {
    alert(`🔧 ¡Inspecci&#243;n concluida y enviada a Retrabajo!\n\nPieza: ${target.id_inspeccion}\nEstatus: EN ESPERA DE RETRABAJO\nInspector: ${inspectorNombre} (Nómina ${inspectorNomina})`);
  } else if (nuevoEstatusInspeccion === "Rechazado") {
    alert(`⛔ ¡Inspecci&#243;n concluida como Rechazado / Scrap!\n\nPieza: ${target.id_inspeccion}\nEstatus: RECHAZADO / SCRAP\nInspector: ${inspectorNombre} (Nómina ${inspectorNomina})`);
  } else if (nuevoEstatusInspeccion === "Pausado") {
    alert(`🔄 ¡Traspaso de turno registrado!\n\nPieza: ${target.id_inspeccion}\nEstatus: PAUSADO (En bandeja de Traspaso)\nInspector: ${inspectorNombre} (Nómina ${inspectorNomina})`);
  } else {
    alert(`⏱️ ¡Intervención registrada exitosamente!\n\nPieza: ${target.id_inspeccion}\nEstatus: ${nuevoEstatusInspeccion}\nInspector: ${inspectorNombre} (Nómina ${inspectorNomina})`);
  }
}

// ==================== DASHBOARD & TABLA PRINCIPAL ====================
function renderInspectionsTable() {
  const tbody = document.getElementById("inspections-table-body");
  const countLabel = document.getElementById("table-count-label");

  const query = (document.getElementById("dash-search")?.value || "").toLowerCase();
  const filterSerie = (document.getElementById("dash-filter-serie")?.value || "").toLowerCase().trim();
  const filterStatus = document.getElementById("dash-filter-status")?.value || "";
  const filterArea = document.getElementById("dash-filter-area")?.value || "";
  const filterFaltantes = document.getElementById("dash-filter-faltantes")?.value || "";
  const fechaInicio = document.getElementById("dash-fecha-inicio")?.value || "";
  const fechaFin = document.getElementById("dash-fecha-fin")?.value || "";

  let filtered = appState.inspecciones.filter(item => {
    const matchQuery = !query || 
      (item.id_inspeccion || "").toLowerCase().includes(query) ||
      (item.numero_serie || "").toLowerCase().includes(query) ||
      (item.modelo || "").toLowerCase().includes(query) ||
      (item.numero_parte || "").toLowerCase().includes(query);

    const matchSerie = !filterSerie || (item.numero_serie || "").toLowerCase().includes(filterSerie);
    const matchStatus = !filterStatus || item.estatus === filterStatus;
    const matchArea = matchItemArea(item, filterArea);
    const matchFaltantes = !filterFaltantes || item.tiene_faltantes === filterFaltantes;

    // Filtro por Fecha (YYYY-MM-DD)
    let matchFecha = true;
    const fStr = (item.fecha_creacion || "").split(" ")[0];
    if (fechaInicio && fStr && fStr < fechaInicio) matchFecha = false;
    if (fechaFin && fStr && fStr > fechaFin) matchFecha = false;

    return matchQuery && matchSerie && matchStatus && matchArea && matchFaltantes && matchFecha;
  });

  if (countLabel) {
    if (fechaInicio && fechaFin) {
      countLabel.innerHTML = `Mostrando <strong>${filtered.length}</strong> de ${appState.inspecciones.length} registros <span class="text-cyan-400 font-mono text-[11px] font-bold">(📅 ${fechaInicio} al ${fechaFin})</span>`;
    } else if (fechaInicio) {
      countLabel.innerHTML = `Mostrando <strong>${filtered.length}</strong> de ${appState.inspecciones.length} registros <span class="text-cyan-400 font-mono text-[11px] font-bold">(📅 Desde: ${fechaInicio})</span>`;
    } else if (fechaFin) {
      countLabel.innerHTML = `Mostrando <strong>${filtered.length}</strong> de ${appState.inspecciones.length} registros <span class="text-cyan-400 font-mono text-[11px] font-bold">(📅 Hasta: ${fechaFin})</span>`;
    } else {
      countLabel.innerText = `Mostrando ${filtered.length} de ${appState.inspecciones.length} registros`;
    }
  }

  // Actualizar los KPIs superiores del Dashboard reflejando el filtro actual
  updateKPIs(filtered);

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" class="px-4 py-8 text-center text-slate-500 italic">
          No se encontraron inspecciones con los filtros aplicados.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = "";
  filtered.forEach(item => {
    const tr = document.createElement("tr");
    tr.className = "hover:bg-slate-700/40 transition cursor-pointer";
    tr.onclick = (e) => {
      // Evitar abrir modal si se hace clic en un botón específico
      if (e.target.closest("button")) return;
      openDetailModal(item.id_inspeccion);
    };

    // Color de badge según estatus
    let statusClass = "bg-slate-700 text-slate-300";
    if (item.estatus === "Liberado") statusClass = "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30";
    else if (item.estatus === "En Proceso") statusClass = "bg-blue-500/20 text-blue-300 border border-blue-500/30";
    else if (item.estatus === "Pausado") statusClass = "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30";
    else if (item.estatus === "Con Faltantes") statusClass = "bg-amber-500/25 text-amber-300 border border-amber-500/40";
    else if (item.estatus === "En Espera de Retrabajo") statusClass = "bg-purple-500/25 text-purple-300 border border-purple-500/40";
    else if (item.estatus === "Rechazado" || item.estatus === "Scrap") statusClass = "bg-red-500/20 text-red-300 border border-red-500/30";

    // Calcular fotos de producto vs fotos de defectos
    const allItemPhotos = item.fotos || [];
    const prodPhotos = (item.fotos_producto && item.fotos_producto.length > 0)
      ? item.fotos_producto
      : allItemPhotos.filter(f => f.categoria === "producto" || f.tipo === "Producto Inspeccionado" || f.tipo === "Liberaci&#243;n Final");
    const defPhotos = (item.fotos_defecto && item.fotos_defecto.length > 0)
      ? item.fotos_defecto
      : allItemPhotos.filter(f => f.categoria === "defecto" || (f.tipo && f.tipo.toLowerCase().includes("defecto")) || (f.tipo && f.tipo.toLowerCase().includes("golpe")) || (f.tipo && f.tipo.toLowerCase().includes("pintura")) || (f.tipo && f.tipo.toLowerCase().includes("faltante")));

    const totalProdCount = prodPhotos.length;
    const totalDefCount = defPhotos.length;

    // Calcular tiempo total medido y desglose por coordinador de forma homogénea y exacta
    const turnosList = item.turnos || [];
    let totalSec = 0;
    const coordMap = {};

    if (turnosList.length > 0) {
      turnosList.forEach(t => {
        const s = parseInt(t.segundos) || 0;
        const m = parseInt(t.minutos) || 0;
        const effectiveSec = s > 0 ? s : (m > 0 ? m * 60 : 0);
        totalSec += effectiveSec;

        const nom = t.nomina_colaborador || item.nomina_creador;
        coordMap[nom] = (coordMap[nom] || 0) + effectiveSec;
      });
    } else {
      totalSec = parseInt(item.tiempo_segundos) || (parseInt(item.tiempo_minutos) ? parseInt(item.tiempo_minutos) * 60 : 0);
      if (item.nomina_creador && totalSec > 0) {
        coordMap[item.nomina_creador] = totalSec;
      }
    }

    // Mantener campos sincronizados y homogéneos en el registro
    item.tiempo_segundos = totalSec;
    item.tiempo_minutos = Math.max(1, Math.round(totalSec / 60));
    const tiempoTexto = formatSecondsOrMinutes(totalSec);

    const isSupervisor = appState.currentUser && appState.currentUser.rol === "supervisor";
    const isUnlocked = item.desbloqueada_edicion === true;
    const canCoordinatorEdit = appState.currentUser && appState.currentUser.rol === "colaborador" && isUnlocked;

    // Obtener y formatear nombre del Coordinador / QG
    const coordUser = (appState.usuarios || DEFAULT_USUARIOS).find(u => String(u.nomina) === String(item.nomina_creador));
    const rawCoordName = coordUser ? coordUser.nombre : "Coordinador";
    const cleanCoordName = rawCoordName.replace(/\s*\((Coordinador|QG|\/|\s)+\)/gi, "").trim();

    tr.innerHTML = `
      <td class="px-4 py-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">
        <span>${item.fecha_creacion.split(" ")[0]}</span>
        ${isUnlocked ? '<span class="ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 inline-flex items-center gap-1" title="Desbloqueada por supervisor para corrección"><i class="fa-solid fa-lock-open text-[8px]"></i> Desbloqueada</span>' : ''}
      </td>
      <td class="px-4 py-3">
        <div class="font-semibold text-white">${item.numero_parte}</div>
        <div class="text-[11px] text-slate-400 truncate max-w-xs">${item.modelo}</div>
      </td>
      <td class="px-4 py-3 font-mono text-slate-200 font-semibold">${item.numero_serie}</td>
      <td class="px-4 py-3 text-slate-300">${item.area_ubicacion}</td>
            <td class="px-4 py-3 whitespace-nowrap">
        <div class="font-bold text-white text-xs flex items-center gap-1.5">
          <i class="fa-solid fa-user-check text-cyan-400 text-[11px]"></i>
          <span>${cleanCoordName}</span>
        </div>
        <div class="text-[11px] font-mono text-cyan-300 font-semibold mt-0.5">
          Nómina: ${item.nomina_creador}
        </div>
      </td>
      <td class="px-4 py-3 whitespace-nowrap">
        <div class="flex items-center gap-1.5 text-cyan-400 font-bold font-mono text-xs">
          <i class="fa-solid fa-stopwatch text-amber-400"></i>
          <span>${tiempoTexto}</span>
        </div>
        ${Object.keys(coordMap).length > 1 ? `
          <div class="text-[10px] text-slate-400 mt-0.5 space-y-0.5">
            ${Object.entries(coordMap).map(([nom, s]) => `
              <div>Nóm. <span class="text-slate-300 font-mono font-medium">${nom}</span>: <span class="text-emerald-400 font-mono">${formatSecondsOrMinutes(s)}</span></div>
            `).join('')}
          </div>
        ` : ''}
      </td>
      <td class="px-4 py-3 whitespace-nowrap">
        <div class="flex flex-col gap-1">
          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${totalProdCount > 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'}">
            <i class="fa-solid fa-circle-check text-emerald-400"></i> Producto: ${totalProdCount} foto${totalProdCount !== 1 ? 's' : ''}
          </span>
          ${totalDefCount > 0 ? `
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
              <i class="fa-solid fa-triangle-exclamation text-red-400"></i> Defectos: ${totalDefCount} foto${totalDefCount !== 1 ? 's' : ''}
            </span>
          ` : `
            <span class="text-[10px] text-slate-500 italic pl-1">Sin defectos</span>
          `}
        </div>
      </td>
      <td class="px-4 py-3">
        ${item.tiene_faltantes === "SI" 
          ? `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30" title="${item.descripcion_faltantes}"><i class="fa-solid fa-triangle-exclamation"></i> SÍ</span>` 
          : `<span class="text-slate-500 text-[11px]">NO</span>`}
      </td>
      <td class="px-4 py-3">
        <span class="px-2 py-1 rounded text-[11px] font-bold ${statusClass}">
          ${item.estatus}
        </span>
      </td>
      <td class="px-4 py-3 text-right space-x-1.5 whitespace-nowrap">
        ${isSupervisor ? `
          <button onclick="openSupervisorEditModal('${item.id_inspeccion}')" title="Modificar o Corregir Inspecci&#243;n (Supervisor)" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition shadow-sm">
            <i class="fa-solid fa-pen-to-square text-amber-400"></i>
            <span>Modificar</span>
          </button>
        ` : ''}
        ${canCoordinatorEdit ? `
          <button onclick="openSupervisorEditModal('${item.id_inspeccion}')" title="Corregir mi inspección (Acceso Autorizado por Supervisor)" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 border border-indigo-500/40 text-xs font-bold transition animate-pulse">
            <i class="fa-solid fa-pen-to-square text-indigo-300"></i>
            <span>Corregir</span>
          </button>
        ` : ''}
        <button onclick="openDetailModal('${item.id_inspeccion}')" title="Ver Detalle" class="p-1.5 rounded hover:bg-slate-600 text-slate-300 hover:text-white transition">
          <i class="fa-solid fa-eye"></i>
        </button>
        <button onclick="generatePDFDirect('${item.id_inspeccion}')" title="Descargar PDF" class="p-1.5 rounded hover:bg-slate-600 text-red-400 hover:text-red-300 transition">
          <i class="fa-solid fa-file-pdf"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function applyFilters() {
  renderInspectionsTable();
}

// ==================== FILTROS POR FECHA EN EL DASHBOARD ====================
function handleDashDateFilterChange() {
  const selPeriodo = document.getElementById("dash-filter-periodo");
  const dInicio = document.getElementById("dash-fecha-inicio")?.value;
  const dFin = document.getElementById("dash-fecha-fin")?.value;

  if (selPeriodo && (dInicio || dFin)) {
    selPeriodo.value = "custom";
  }
  applyFilters();
}

function handleDashPresetPeriodChange() {
  const preset = document.getElementById("dash-filter-periodo")?.value || "all";
  const inInicio = document.getElementById("dash-fecha-inicio");
  const inFin = document.getElementById("dash-fecha-fin");

  const today = new Date();
  if (preset === "all") {
    if (inInicio) inInicio.value = "";
    if (inFin) inFin.value = "";
  } else if (preset === "today") {
    const todayStr = formatYMD(today);
    if (inInicio) inInicio.value = todayStr;
    if (inFin) inFin.value = todayStr;
  } else if (preset === "7days") {
    const past7 = new Date(today);
    past7.setDate(today.getDate() - 7);
    if (inInicio) inInicio.value = formatYMD(past7);
    if (inFin) inFin.value = formatYMD(today);
  } else if (preset === "14days") {
    const past14 = new Date(today);
    past14.setDate(today.getDate() - 14);
    if (inInicio) inInicio.value = formatYMD(past14);
    if (inFin) inFin.value = formatYMD(today);
  } else if (preset === "30days") {
    const past30 = new Date(today);
    past30.setDate(today.getDate() - 30);
    if (inInicio) inInicio.value = formatYMD(past30);
    if (inFin) inFin.value = formatYMD(today);
  }

  applyFilters();
}

function resetDashDateFilter() {
  const inInicio = document.getElementById("dash-fecha-inicio");
  const inFin = document.getElementById("dash-fecha-fin");
  const selPeriodo = document.getElementById("dash-filter-periodo");
  const inSerie = document.getElementById("dash-filter-serie");

  if (inInicio) inInicio.value = "";
  if (inFin) inFin.value = "";
  if (selPeriodo) selPeriodo.value = "all";
  if (inSerie) inSerie.value = "";

  applyFilters();
}

function updateKPIs(itemsList) {
  const list = itemsList || appState.inspecciones;
  const total = list.length;
  const liberadas = list.filter(i => i.estatus === "Liberado").length;
  const enProceso = list.filter(i => i.estatus === "En Proceso" || i.estatus === "Pausado").length;
  const faltantes = list.filter(i => i.tiene_faltantes === "SI").length;
  const rechazadas = list.filter(i => i.estatus === "Rechazado").length;

  const kpiTot = document.getElementById("kpi-total");
  const kpiLib = document.getElementById("kpi-liberadas");
  const kpiProc = document.getElementById("kpi-proceso");
  const kpiFalt = document.getElementById("kpi-faltantes");
  const kpiRech = document.getElementById("kpi-rechazadas");

  if (kpiTot) kpiTot.innerText = total;
  if (kpiLib) kpiLib.innerText = liberadas;
  if (kpiProc) kpiProc.innerText = enProceso;
  if (kpiFalt) kpiFalt.innerText = faltantes;
  if (kpiRech) kpiRech.innerText = rechazadas;

  // Calcular tiempo promedio por inspección
  let totalMinTodos = 0;
  let totalTramos = 0;
  list.forEach(i => {
    (i.turnos || []).forEach(t => {
      const s = parseInt(t.segundos) || 0;
      const m = parseInt(t.minutos) || (s > 0 ? Math.round(s / 60) : 0);
      if (m > 0) {
        totalMinTodos += m;
        totalTramos++;
      }
    });
  });
  const prom = totalTramos > 0 ? Math.round(totalMinTodos / totalTramos) : 0;
  const promEl = document.getElementById("kpi-tiempo-prom");
  if (promEl) promEl.innerText = `${prom} min`;

  // Inspecciones de hoy para el usuario activo
  const myNomina = appState.currentUser.nomina;
  const myToday = appState.inspecciones.filter(i => i.nomina_creador == myNomina).length;
  const myTodayEl = document.getElementById("my-today-count");
  if (myTodayEl) myTodayEl.innerText = myToday;

  // Actualizar badge de defectos en el navbar superior
  const badgeDef = document.getElementById("badge-total-defectos");
  if (badgeDef) {
    const totalDefCount = appState.inspecciones.filter(i => getDefectosInfo(i).length > 0).length;
    badgeDef.innerText = totalDefCount;
  }

  // Actualizar banner oficial de reporte final de turno del operador en el dashboard
  if (typeof updateOperatorShiftBanner === "function") {
    updateOperatorShiftBanner();
  }

  // Actualizar notificaciones del panel lateral según usuario activo
  if (typeof renderSidebarNotificaciones === "function") {
    renderSidebarNotificaciones();
  }
}

// ==================== MODAL DE DETALLE Y LIBERACIÓN ====================
function openDetailModal(idInspeccion) {
  const item = appState.inspecciones.find(i => i.id_inspeccion === idInspeccion);
  if (!item) return;

  appState.activeDetailId = idInspeccion;

  document.getElementById("detail-folio").innerText = item.id_inspeccion;
  document.getElementById("detail-parte").innerText = item.numero_parte;
  document.getElementById("detail-modelo").innerText = item.modelo;
  document.getElementById("detail-serie").innerText = item.numero_serie;
  document.getElementById("detail-area").innerText = item.area_ubicacion;
  document.getElementById("detail-estatus").innerText = item.estatus;
  document.getElementById("detail-creador").innerText = `Nómina ${item.nomina_creador}`;
  document.getElementById("detail-fecha").innerText = item.fecha_creacion;
  document.getElementById("detail-version").innerText = `v${item.version_reporte || "1.0"}`;

  // Faltantes
  const faltantesBox = document.getElementById("detail-faltantes-box");
  const faltantesDesc = document.getElementById("detail-faltantes-desc");
  if (item.tiene_faltantes === "SI") {
    faltantesBox.classList.remove("hidden");
    faltantesDesc.innerText = item.descripcion_faltantes || "Sin descripción específica";
  } else {
    faltantesBox.classList.add("hidden");
  }

  // Bitácora de turnos y tiempo total
  let modalTotalSec = 0;
  (item.turnos || []).forEach(t => {
    const s = parseInt(t.segundos) || 0;
    const m = parseInt(t.minutos) || 0;
    modalTotalSec += s > 0 ? s : (m > 0 ? m * 60 : 0);
  });
  if (modalTotalSec === 0) {
    modalTotalSec = parseInt(item.tiempo_segundos) || (parseInt(item.tiempo_minutos) ? parseInt(item.tiempo_minutos) * 60 : 0);
  }
  const modalTiempoBadge = document.getElementById("detail-tiempo-total-badge");
  if (modalTiempoBadge) {
    modalTiempoBadge.innerHTML = `<i class="fa-solid fa-stopwatch mr-1 text-amber-400"></i>Total: ${formatSecondsOrMinutes(modalTotalSec)}`;
  }

  const turnosBody = document.getElementById("detail-turnos-body");
  turnosBody.innerHTML = "";
  if (item.turnos && item.turnos.length > 0) {
    item.turnos.forEach(t => {
      const tr = document.createElement("tr");

    tr.innerHTML = `
        <td class="px-3 py-2 font-mono text-cyan-300">Nómina ${t.nomina_colaborador}</td>
        <td class="px-3 py-2 text-slate-300">${t.turno}</td>
        <td class="px-3 py-2 font-mono font-bold text-cyan-400">${formatSecondsOrMinutes(t.segundos, t.minutos)}</td>
        <td class="px-3 py-2 font-mono text-slate-400">${t.hora_inicio || "-"}</td>
        <td class="px-3 py-2 font-mono text-slate-400">${t.hora_fin || "En curso"}</td>
        <td class="px-3 py-2 text-slate-300 italic">"${t.notas || '-'}"</td>
      `;
      turnosBody.appendChild(tr);
    });
  } else {
    turnosBody.innerHTML = '<tr><td colspan="6" class="px-3 py-2 text-center text-slate-500 italic">Sin tramos registrados</td></tr>';
  }

  // Separar fotos de Producto vs Defectos
  const allItemFotos = item.fotos || [];
  const prodFotos = (item.fotos_producto && item.fotos_producto.length > 0)
    ? item.fotos_producto
    : allItemFotos.filter(f => f.categoria === "producto" || f.tipo === "Producto Inspeccionado" || f.tipo === "Liberaci&#243;n Final");
  const defFotos = (item.fotos_defecto && item.fotos_defecto.length > 0)
    ? item.fotos_defecto
    : allItemFotos.filter(f => f.categoria === "defecto" || (f.tipo && f.tipo.toLowerCase().includes("defecto")) || (f.tipo && f.tipo.toLowerCase().includes("golpe")) || (f.tipo && f.tipo.toLowerCase().includes("pintura")) || (f.tipo && f.tipo.toLowerCase().includes("faltante")));

  // 1. Grid Fotos de Producto
  const gridProd = document.getElementById("detail-fotos-producto-grid");
  if (gridProd) {
    gridProd.innerHTML = "";
    if (prodFotos.length > 0) {
      prodFotos.forEach(f => {
        const card = document.createElement("div");
        card.className = "rounded-lg border border-emerald-500/40 bg-slate-900 overflow-hidden shadow";
        card.innerHTML = `
          <img src="${f.url}" class="w-full h-28 object-cover cursor-pointer hover:opacity-90 transition" onclick="window.open('${f.url}', '_blank')">
          <div class="p-1.5 text-[10px] bg-slate-900/90">
            <span class="font-bold text-emerald-400 block truncate">🟢 ${f.tipo || 'Producto Inspeccionado'}</span>
            <span class="text-slate-400 font-mono block">${f.timestamp || ""}</span>
          </div>
        `;
        gridProd.appendChild(card);
      });
    } else {
      gridProd.innerHTML = '<p class="text-xs text-slate-500 italic col-span-full py-3 text-center">No se adjuntaron fotos de la pieza checada.</p>';
    }
  }

  // 2. Grid Fotos de Defectos
  const gridDef = document.getElementById("detail-fotos-defecto-grid");
  if (gridDef) {
    gridDef.innerHTML = "";
    if (defFotos.length > 0) {
      defFotos.forEach(f => {
        const card = document.createElement("div");
        card.className = "rounded-lg border border-red-500/40 bg-slate-900 overflow-hidden shadow";
        card.innerHTML = `
          <img src="${f.url}" class="w-full h-28 object-cover cursor-pointer hover:opacity-90 transition" onclick="window.open('${f.url}', '_blank')">
          <div class="p-1.5 text-[10px] bg-slate-900/90">
            <span class="font-bold text-red-400 block truncate">🔴 ${f.tipo || 'Defecto'}</span>
            <span class="text-slate-400 font-mono block">${f.timestamp || ""}</span>
          </div>
        `;
        gridDef.appendChild(card);
      });
    } else {
      gridDef.innerHTML = '<p class="text-xs text-slate-500 italic col-span-full py-3 text-center">No se reportaron fotografías de defectos en este componente.</p>';
    }
  }

  // Configuraci&#243;n de botones de supervisión y desbloqueo
  const btnSuperEdit = document.getElementById("btn-detail-supervisor-edit");
  const btnUnlock = document.getElementById("btn-detail-unlock");
  const myRol = appState.currentUser ? appState.currentUser.rol : "colaborador";

  if (btnSuperEdit) {
    if (myRol === "supervisor") {
      btnSuperEdit.classList.remove("hidden");
      btnSuperEdit.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Corregir Inspecci&#243;n / Faltante';
    } else if (myRol === "colaborador" && item.desbloqueada_edicion) {
      btnSuperEdit.classList.remove("hidden");
      btnSuperEdit.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Modificar mi Inspecci&#243;n (Autorizado)';
    } else {
      btnSuperEdit.classList.add("hidden");
    }
  }

  if (btnUnlock) {
    if (myRol === "supervisor") {
      btnUnlock.classList.remove("hidden");
      if (item.desbloqueada_edicion) {
        btnUnlock.innerHTML = '<i class="fa-solid fa-lock text-amber-300"></i> Bloquear Acceso';
        btnUnlock.className = "px-3.5 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition shadow";
      } else {
        btnUnlock.innerHTML = '<i class="fa-solid fa-lock-open text-indigo-300"></i> Desbloquear para Coordinador';
        btnUnlock.className = "px-3.5 py-2 rounded-lg bg-indigo-600/90 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow";
      }
    } else {
      btnUnlock.classList.add("hidden");
    }
  }

  // Control de botones de liberación (Ocultar si ya está liberada o si es colaborador sin privilegios)
  const decisionActions = document.getElementById("decision-actions");
  const btnLiberar = document.getElementById("btn-detail-liberar");
  const hasItemDefects = (item.fotos_defecto && item.fotos_defecto.length > 0) || (item.fotos && item.fotos.some(f => (f.tipo || "").toLowerCase().includes("defecto"))) || (item.tiene_faltantes === "SI");

  if (item.estatus === "Liberado" || item.estatus === "Rechazado" || myRol === "colaborador") {
    decisionActions.classList.add("hidden");
  } else {
    decisionActions.classList.remove("hidden");
    if (btnLiberar) {
      if (hasItemDefects) {
        btnLiberar.classList.add("opacity-40", "cursor-not-allowed", "bg-slate-700", "pointer-events-none");
        btnLiberar.classList.remove("bg-emerald-600", "hover:bg-emerald-500", "shadow-emerald-600/30");
        btnLiberar.title = "⛔ Bloqueado: Este producto cuenta con defectos o faltantes pendientes de resolver.";
      } else {
        btnLiberar.classList.remove("opacity-40", "cursor-not-allowed", "bg-slate-700", "pointer-events-none");
        btnLiberar.classList.add("bg-emerald-600", "hover:bg-emerald-500", "shadow-emerald-600/30");
        btnLiberar.title = "Liberar Producto conforme";
      }
    }
  }

  document.getElementById("modal-detail").classList.remove("hidden");
}

function closeDetailModal() {
  document.getElementById("modal-detail").classList.add("hidden");
  appState.activeDetailId = null;
}

// Liberar o Rechazar producto por Supervisor / Gerente
function handleDecision(tipo) {
  const item = appState.inspecciones.find(i => i.id_inspeccion === appState.activeDetailId);
  if (!item) return;

  if (tipo === "liberado") {
    const hasDefects = (item.fotos_defecto && item.fotos_defecto.length > 0) || (item.fotos && item.fotos.some(f => (f.tipo || "").toLowerCase().includes("defecto"))) || (item.tiene_faltantes === "SI");
    if (hasDefects) {
      alert("⛔ ACCIÓN BLOQUEADA: No es posible liberar este producto porque cuenta con defectos reportados o componentes faltantes.\n\nDebe corregirse el defecto o dictaminarse como Rechazado.");
      return;
    }
  }

  const obs = prompt(`Confirmar dictamen como ${tipo.toUpperCase()}.\nIngresa comentarios u observaciones de calidad:`, "Inspecci&#243;n conforme a especificaciones");
  if (obs === null) return; // cancelado

  const now = new Date();
  const timestampStr = now.toISOString().replace("T", " ").substring(0, 19);
  const nuevoEstatus = tipo === "liberado" ? "Liberado" : "Rechazado";

  // Registrar auditoría de la liberación
  const auditEntry = {
    id_auditoria: "AUD-" + Date.now(),
    id_inspeccion: item.id_inspeccion,
    nomina_editor: appState.currentUser.nomina,
    fecha_hora: timestampStr,
    campo_modificado: "Estatus",
    status_anterior: item.estatus,
    status_final: nuevoEstatus,
    valor_anterior: item.estatus,
    valor_nuevo: nuevoEstatus,
    justificacion_motivo: `Dictamen de calidad: ${nuevoEstatus}. Observaciones: ${obs}`
  };

  item.estatus = nuevoEstatus;
  item.fecha_liberacion = timestampStr;
  item.nomina_liberador = appState.currentUser.nomina;

  appState.auditoria.unshift(auditEntry);
  saveToLocalStorage();

  // Sincronizar liberación con Google Sheets
  syncRecordToGoogleSheets("release_inspection", {
    id_inspeccion: item.id_inspeccion,
    decision: tipo,
    nomina_liberador: appState.currentUser.nomina,
    observaciones: obs
  });

  closeDetailModal();
  renderInspectionsTable();
  renderTraspasoList();
  renderAuditTable();
  updateKPIs();
  alert(`🏆 Producto marcado formalmente como ${nuevoEstatus}.\nSellado por Nómina ${appState.currentUser.nomina}.`);
}

// ==================== MODIFICACIÓN CON AUDITORÍA OBLIGATORIA ====================
function openAuditEditModal() {
  const item = appState.inspecciones.find(i => i.id_inspeccion === appState.activeDetailId);
  if (!item) return;

  handleAuditFieldChange();
  document.getElementById("audit-reason").value = "";
  document.getElementById("modal-audit-edit").classList.remove("hidden");
}

function closeAuditEditModal() {
  document.getElementById("modal-audit-edit").classList.add("hidden");
}

function handleAuditFieldChange() {
  const item = appState.inspecciones.find(i => i.id_inspeccion === appState.activeDetailId);
  if (!item) return;

  const field = document.getElementById("audit-field").value;
  const oldValInput = document.getElementById("audit-old-val");
  const newValInput = document.getElementById("audit-new-val");

  oldValInput.value = item[field.toLowerCase()] || item[field] || "";
  newValInput.value = "";
}

function saveAuditChange() {
  const item = appState.inspecciones.find(i => i.id_inspeccion === appState.activeDetailId);
  if (!item) return;

  const field = document.getElementById("audit-field").value;
  const newVal = document.getElementById("audit-new-val").value.trim();
  const reason = document.getElementById("audit-reason").value.trim();

  if (!newVal) {
    alert("Debes ingresar el nuevo valor");
    return;
  }

  if (!reason || reason.length < 10) {
    alert("Para prevenir la manipulación indebida de registros, es OBLIGATORIO ingresar una justificación detallada (mínimo 10 caracteres).");
    return;
  }

  const oldVal = item[field.toLowerCase()] || item[field] || "";
  const now = new Date();
  const timestampStr = now.toISOString().replace("T", " ").substring(0, 19);

  // Aplicar cambio
  if (field === "Numero_Serie") item.numero_serie = newVal;
  if (field === "Area_Ubicacion") item.area_ubicacion = newVal;
  if (field === "Descripcion_Faltantes") item.descripcion_faltantes = newVal;
  if (field === "Tiene_Faltantes") item.tiene_faltantes = newVal.toUpperCase();

  // Incrementar versión de reporte
  const currVer = parseFloat(item.version_reporte || "1.0");
  item.version_reporte = (currVer + 0.1).toFixed(1);

  // Guardar evento en bitácora de auditoría
  const auditEntry = {
    id_auditoria: "AUD-" + Date.now(),
    id_inspeccion: item.id_inspeccion,
    nomina_editor: appState.currentUser.nomina,
    fecha_hora: timestampStr,
    campo_modificado: field,
    status_anterior: item.estatus,
    status_final: item.estatus,
    valor_anterior: oldVal,
    valor_nuevo: newVal,
    justificacion_motivo: `[Campo corregido: ${field}] ${reason}`
  };

  appState.auditoria.unshift(auditEntry);
  saveToLocalStorage();

  // Sincronizar cambio con Google Sheets
  syncRecordToGoogleSheets("update_inspection_with_audit", {
    id_inspeccion: item.id_inspeccion,
    nomina_editor: appState.currentUser.nomina,
    campo_modificado: field,
    valor_nuevo: newVal,
    justificacion_motivo: reason
  });

  closeAuditEditModal();
  openDetailModal(item.id_inspeccion); // Actualizar modal de detalle
  renderInspectionsTable();
  renderAuditTable();
  alert(`🛡️ Cambio registrado en TBL_AUDITORIA con versión v${item.version_reporte}.\nModificado por Nómina ${appState.currentUser.nomina}.`);
}

// ==================== REGISTRO DE MODIFICACIONES ====================
function renderAuditTable() {
  const tbody = document.getElementById("audit-table-body");
  const countEl = document.getElementById("audit-count");

  countEl.innerText = appState.auditoria.length;

  if (appState.auditoria.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="px-4 py-8 text-center text-slate-500 italic">
          No hay registros de modificaciones o auditoría en TBL_AUDITORIA.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = "";
  appState.auditoria.forEach(a => {
    const tr = document.createElement("tr");
    tr.className = "hover:bg-slate-700/40 transition";

    const statusAnt = a.status_anterior || (a.campo_modificado === "Estatus" ? a.valor_anterior : "En Proceso");
    const statusFin = a.status_final || (a.campo_modificado === "Estatus" ? a.valor_nuevo : (a.valor_nuevo || "Modificado"));

    const getStatusStyle = (st) => {
      if (st === "Liberado") return "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30";
      if (st === "Rechazado") return "bg-red-500/20 text-red-300 border border-red-500/30";
      if (st === "Pausado") return "bg-amber-500/20 text-amber-300 border border-amber-500/30";
      if (st === "En Proceso") return "bg-blue-500/20 text-blue-300 border border-blue-500/30";
      return "bg-slate-700/80 text-slate-200 border border-slate-600";
    };

    tr.innerHTML = `
      <td class="px-4 py-2.5 font-mono text-cyan-400 font-bold">${a.id_auditoria}</td>
      <td class="px-4 py-2.5 font-mono font-semibold text-white">${a.id_inspeccion}</td>
      <td class="px-4 py-2.5 font-mono text-cyan-300 font-bold">Nómina ${a.nomina_editor}</td>
      <td class="px-4 py-2.5 text-slate-400 font-mono text-[11px]">${a.fecha_hora}</td>
      <td class="px-4 py-2.5">
        <span class="px-2.5 py-1 rounded text-[11px] font-semibold ${getStatusStyle(statusAnt)}">
          ${statusAnt}
        </span>
      </td>
      <td class="px-4 py-2.5">
        <span class="px-2.5 py-1 rounded text-[11px] font-bold ${getStatusStyle(statusFin)}">
          ${statusFin}
        </span>
      </td>
      <td class="px-4 py-2.5 text-slate-300 italic text-[11px] max-w-sm">${a.justificacion_motivo}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ==================== GENERADOR DE REPORTE PDF INDUSTRIAL ====================
function generatePDFDirect(idInspeccion) {
  const item = appState.inspecciones.find(i => i.id_inspeccion === idInspeccion);
  if (item) buildAndDownloadPDF(item);
}

function generatePDFFromDetail() {
  if (appState.activeDetailId) {
    generatePDFDirect(appState.activeDetailId);
  }
}

function buildAndDownloadPDF(item) {
  if (!window.jspdf) {
    alert("Cargando motor PDF, por favor intenta en un momento...");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Encabezado corporativo
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 28, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("AUDITUM | CERTIFICADO DE INSPECCI&#211;N DE CALIDAD", 14, 12);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text("Control de Trazabilidad e Integridad Estructural de Componentes de Acero", 14, 18);
  doc.text(`Sistema de Gestión de Calidad | Versión de Reporte: v${item.version_reporte || "1.0"}`, 14, 23);

  // Folio Badge
  doc.setFillColor(2, 132, 199); // blue-600
  doc.roundedRect(pageWidth - 65, 8, 52, 12, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(item.id_inspeccion, pageWidth - 60, 15.5);

  let y = 36;

  // Resumen del Producto
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, pageWidth - 28, 7, "F");
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("1. DATOS DEL COMPONENTE DE ACERO", 16, y + 5);

  y += 12;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text("N&#250;mero de Parte:", 16, y);
  doc.text("Modelo / Descripción:", 80, y);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  doc.text(item.numero_parte, 16, y + 5);
  doc.text(item.modelo, 80, y + 5);

  y += 12;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(71, 85, 105);
  doc.text("N&#250;mero de Serie:", 16, y);
  doc.text("Área de Ubicaci&#243;n:", 80, y);
  doc.text("Estatus Final:", 145, y);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  doc.text(item.numero_serie, 16, y + 5);
  doc.text(item.area_ubicacion, 80, y + 5);

  // Estatus badge text
  doc.setFont("helvetica", "bold");
  if (item.estatus === "Liberado") doc.setTextColor(22, 163, 74);
  else if (item.estatus === "Rechazado") doc.setTextColor(220, 38, 38);
  else doc.setTextColor(202, 138, 4);
  doc.text(item.estatus.toUpperCase(), 145, y + 5);

  // Sección de Faltantes
  y += 14;
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, pageWidth - 28, 7, "F");
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("2. VERIFICACIÓN DE FALTANTES Y ACCESORIOS", 16, y + 5);

  y += 12;
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(71, 85, 105);
  doc.text("Presenta Faltantes:", 16, y);
  doc.text("Detalle de Barrenos / Tornillería / Cartabones:", 65, y);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(item.tiene_faltantes === "SI" ? 220 : 22, item.tiene_faltantes === "SI" ? 38 : 163, item.tiene_faltantes === "SI" ? 38 : 74);
  doc.text(item.tiene_faltantes === "SI" ? "SÍ (REQUIERE RETRABAJO)" : "NO (COMPLETO)", 16, y + 5);

  doc.setTextColor(15, 23, 42);
  doc.text(item.descripcion_faltantes || "Sin faltantes reportados.", 65, y + 5);

  // Sección Trazabilidad de Turnos
  y += 14;
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, pageWidth - 28, 7, "F");
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("3. TRAZABILIDAD MULTITURNO Y BITÁCORA DE INTERVENCIÓN", 16, y + 5);

  y += 11;
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 116, 139);
  doc.text("NÓMINA", 16, y);
  doc.text("TURNO", 38, y);
  doc.text("TIEMPO", 68, y);
  doc.text("HORA INICIO", 95, y);
  doc.text("HORA FIN", 128, y);
  doc.text("NOTAS TRASPASO", 158, y);

  y += 3;
  doc.setDrawColor(203, 213, 225);
  doc.line(14, y, pageWidth - 14, y);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);

  if (item.turnos && item.turnos.length > 0) {
    item.turnos.forEach(t => {
      y += 5;
      doc.text(`Nómina ${t.nomina_colaborador}`, 16, y);
      doc.text(t.turno.split("(")[0].trim(), 38, y);
      doc.text(formatSecondsOrMinutes(t.segundos, t.minutos), 68, y);
      doc.text(t.hora_inicio || "-", 95, y);
      doc.text(t.hora_fin || "En proceso", 128, y);
      doc.text((t.notas || "-").substring(0, 22), 158, y);
    });
  }

  // Sección Firmas y Validación Legal
  y = 230;
  doc.setDrawColor(148, 163, 184);
  doc.line(20, y, 85, y);
  doc.line(pageWidth - 85, y, pageWidth - 20, y);

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("COLABORADOR / INSPECTOR", 30, y + 5);
  doc.text("SUPERVISOR DE CALIDAD", pageWidth - 75, y + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Nómina Autor: ${item.nomina_creador}`, 34, y + 9);
  doc.text(`Nómina Liberador: ${item.nomina_liberador || "Pendiente"}`, pageWidth - 74, y + 9);

  // Pie de página con Hash/QR de integridad
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  const printDate = new Date().toLocaleString();
  doc.text(`Reporte Oficial AUDITUM emitido el: ${printDate} | Código Verificador: ${item.id_inspeccion}-${item.numero_serie} | Hoja 1 de 1`, 14, 285);

  // Descargar archivo
  doc.save(`Auditum_Reporte_${item.id_inspeccion}.pdf`);
}

// ==================== REPORTE FINAL DE TURNO DEL OPERADOR / QG (PDF) ====================
function getTurnoConfigByName(turnoStr) {
  const str = String(turnoStr || "");
  if (str.includes("3") || str.toLowerCase().includes("nocturno")) {
    return { key: "Turno 3", nombre: "Turno 3 (Nocturno)", horario: "21:30 - 06:00", color: "#a855f7" };
  }
  if (str.includes("2") || str.toLowerCase().includes("vespertino")) {
    return { key: "Turno 2", nombre: "Turno 2 (Vespertino)", horario: "14:00 - 21:30", color: "#f59e0b" };
  }
  return { key: "Turno 1", nombre: "Turno 1 (Matutino)", horario: "06:00 - 14:00", color: "#0ea5e9" };
}

function getAvailableQGUsersForReport() {
  // Base: únicamente los Coordinadores / QG (rol === 'colaborador')
  const baseQGs = (appState.usuarios || []).filter(u => u.rol === "colaborador");
  const mapByNomina = new Map();
  baseQGs.forEach(u => mapByNomina.set(String(u.nomina), u));

  // Agregar también cualquier QG de relevo registrado en inspecciones de cabinas
  (appState.cabinasCoordinador || []).forEach(c => {
    if (c.qg_inspector_nomina && c.estatus !== "Esperando Coordinador") {
      const nomKey = String(c.qg_inspector_nomina);
      if (!mapByNomina.has(nomKey)) {
        mapByNomina.set(nomKey, {
          nomina: c.qg_inspector_nomina,
          nombre: c.qg_inspector_nombre || `Coordinador / QG (${nomKey})`,
          rol: "colaborador",
          turno: c.qg_inspector_turno || c.turno || "Turno 1 (Matutino)"
        });
      }
    }
  });

  // Si el usuario actual en sesión es un QG (colaborador), mostrar únicamente su propio perfil para que solo vea lo que él inspeccionó en su turno
  if (appState.currentUser && appState.currentUser.rol === "colaborador") {
    const own = mapByNomina.get(String(appState.currentUser.nomina)) || appState.currentUser;
    return [own];
  }

  return Array.from(mapByNomina.values());
}

function getQGShiftInspections(activeNomina, activeUser) {
  const nomStr = String(activeNomina);
  const turnoCfg = getTurnoConfigByName(activeUser ? activeUser.turno : "Turno 1");

  // Filtros de fecha opcionales del panel superior
  const dInicio = document.getElementById("gerente-fecha-inicio")?.value || "";
  const dFin = document.getElementById("gerente-fecha-fin")?.value || "";

  // 1. Componentes en appState.inspecciones inspeccionados por este QG durante su turno
  const compItems = (appState.inspecciones || []).filter(i => {
    if (dInicio || dFin) {
      const fStr = String(i.fecha_creacion || "").substring(0, 10);
      if (dInicio && fStr && fStr < dInicio) return false;
      if (dFin && fStr && fStr > dFin) return false;
    }

    const turnosArr = Array.isArray(i.turnos) ? i.turnos : [];
    const shiftMatchInTurnos = turnosArr.some(t => {
      const sameQG = String(t.nomina_colaborador) === nomStr;
      const tKey = getTurnoConfigByName(t.turno || (activeUser && activeUser.turno)).key;
      return sameQG && tKey === turnoCfg.key;
    });

    if (shiftMatchInTurnos) return true;

    // Respaldo si no tiene arreglo de turnos detallado pero fue creado por este QG
    if (turnosArr.length === 0 && String(i.nomina_creador) === nomStr) {
      return true;
    }
    return false;
  }).map(i => {
    // Aislar únicamente los registros de turno de ESTE QG en SU turno para que el reporte final solo refleje su turno
    const myTurnos = (i.turnos || []).filter(t => {
      return String(t.nomina_colaborador) === nomStr && getTurnoConfigByName(t.turno || activeUser.turno).key === turnoCfg.key;
    });
    return {
      ...i,
      turnos: myTurnos.length > 0 ? myTurnos : (i.turnos || [])
    };
  });

  // 2. Cabinas en LINEAS QUE REQUIEREN QG (appState.cabinasCoordinador) que ya fueron inspeccionadas por este QG durante su turno
  const cabinasInspected = (appState.cabinasCoordinador || []).filter(c => {
    if (c.estatus === "Esperando Coordinador") return false;

    if (dInicio || dFin) {
      const fStr = String(c.fecha || "").substring(0, 10);
      if (dInicio && fStr && fStr < dInicio) return false;
      if (dFin && fStr && fStr > dFin) return false;
    }

    const matchesNomina =
      (c.qg_inspector_nomina && String(c.qg_inspector_nomina) === nomStr) ||
      (!c.qg_inspector_nomina && c.coordinador_asignado && String(c.coordinador_asignado).includes(nomStr));

    if (!matchesNomina) return false;

    const cabTurnoKey = getTurnoConfigByName(c.qg_inspector_turno || c.turno || activeUser.turno).key;
    return cabTurnoKey === turnoCfg.key;
  }).map(c => {
    return {
      id_inspeccion: c.id || c.serie_cabina,
      fecha_creacion: `${c.fecha || "2026-10-28"} ${c.hora_finalizada || "08:00"}:00`,
      nomina_creador: activeNomina,
      numero_parte: c.numero_parte || "CABINA-QG",
      modelo: `CABINA ${c.linea}`,
      numero_serie: c.serie_cabina,
      area_ubicacion: c.area || "FABS",
      estatus: c.estatus === "Liberada" ? "Liberado" : "Rechazado",
      tiene_faltantes: c.estatus === "Liberada" ? "NO" : "SI",
      descripcion_faltantes: c.dictamen_notas || "",
      turnos: [
        {
          id_turno: `TRN-${c.id}`,
          nomina_colaborador: activeNomina,
          turno: c.qg_inspector_turno || activeUser.turno || turnoCfg.nombre,
          minutos: c.minutos_espera || 25,
          estatus_entrega: c.estatus === "Liberada" ? "Concluido" : "Retrabajo",
          notas: c.dictamen_notas || c.notas || "Inspecci&#243;n de cabina en línea por QG"
        }
      ],
      fotos: c.fotos_evidencia_qg || [],
      es_cabina_qg: true
    };
  });

  return [...cabinasInspected, ...compItems];
}

function updateOperatorShiftBanner() {
  const nameEl = document.getElementById("dash-operator-name");
  const nominaEl = document.getElementById("dash-operator-nomina");
  const shiftBadgeEl = document.getElementById("dash-operator-shift-badge");
  const shiftFilterLabelEl = document.getElementById("dash-operator-shift-filter-label");
  const summaryEl = document.getElementById("dash-operator-summary-counts");
  const traspasoBadgeEl = document.getElementById("dash-operator-traspaso-badge");
  const traspasoTextEl = document.getElementById("dash-operator-traspaso-text");
  const inspectedListEl = document.getElementById("dash-operator-inspected-list");
  const selectEl = document.getElementById("dash-pdf-operator-select");

  if (!nameEl) return;

  const qgUsers = getAvailableQGUsersForReport();
  const prevSelected = selectEl ? selectEl.value : "";

  if (selectEl) {
    selectEl.innerHTML = "";
    qgUsers.forEach(u => {
      const opt = document.createElement("option");
      opt.value = u.nomina;
      const tCfg = getTurnoConfigByName(u.turno);
      opt.innerText = `${u.nombre} (Nóm. ${u.nomina} • ${tCfg.nombre})`;
      selectEl.appendChild(opt);
    });

    if (appState.currentUser && appState.currentUser.rol === "colaborador") {
      selectEl.value = String(appState.currentUser.nomina);
      selectEl.disabled = true;
      selectEl.title = "Cada Coordinador / QG visualiza únicamente las inspecciones de su propio turno";
    } else {
      selectEl.disabled = false;
      selectEl.title = "Seleccionar Coordinador / QG para ver lo que inspeccionó en su turno";
      if (prevSelected && qgUsers.some(u => String(u.nomina) === String(prevSelected))) {
        selectEl.value = String(prevSelected);
      } else if (qgUsers.length > 0) {
        selectEl.value = String(qgUsers[0].nomina);
      }
    }
  }

  // Nómina de QG seleccionada
  let activeNomina = (selectEl && selectEl.value) ? selectEl.value : (qgUsers[0] ? qgUsers[0].nomina : 1042);
  let activeUser = qgUsers.find(u => String(u.nomina) === String(activeNomina)) ||
                   (appState.usuarios || []).find(u => String(u.nomina) === String(activeNomina)) ||
                   { nomina: 1042, nombre: "Juan Pérez Martínez (Coordinador / QG)", turno: "Turno 1 (Matutino)", rol: "colaborador" };

  nameEl.innerText = activeUser.nombre;
  nominaEl.innerText = activeUser.nomina;
  const cfg = getTurnoConfigByName(activeUser.turno);
  if (shiftBadgeEl) shiftBadgeEl.innerText = cfg.nombre;
  if (shiftFilterLabelEl) shiftFilterLabelEl.innerText = `${cfg.nombre} (${cfg.horario})`;

  // Obtener exclusivamente lo que este QG inspeccionó durante su turno
  const operatorItems = getQGShiftInspections(activeNomina, activeUser);

  const total = operatorItems.length;
  const liberadas = operatorItems.filter(i => i.estatus === "Liberado").length;
  const enTraspaso = operatorItems.filter(i => i.estatus === "Pausado" || i.estatus === "En Proceso").length;

  if (summaryEl) {
    summaryEl.innerText = `${total} inspeccionada${total !== 1 ? 's' : ''} en ${cfg.key} (${liberadas} liberada${liberadas !== 1 ? 's' : ''})`;
  }

  if (traspasoBadgeEl) {
    if (enTraspaso > 0) {
      traspasoBadgeEl.classList.remove("hidden");
      if (traspasoTextEl) traspasoTextEl.innerText = `${enTraspaso} componente${enTraspaso !== 1 ? 's' : ''} en traspaso para sig. turno`;
    } else {
      traspasoBadgeEl.classList.add("hidden");
    }
  }

  // Renderizar lista en vivo de las piezas/cabinas inspeccionadas por este QG durante su turno
  if (inspectedListEl) {
    if (operatorItems.length === 0) {
      inspectedListEl.innerHTML = `
        <div class="text-slate-400 text-center py-2 text-[11px]">
          Sin inspecciones registradas para <strong>${activeUser.nombre}</strong> en <strong>${cfg.nombre}</strong>.
        </div>
      `;
    } else {
      inspectedListEl.innerHTML = operatorItems.map(item => {
        const tr = (item.turnos || [])[0];
        const min = tr ? (tr.minutos || 25) : 25;
        let badgeHtml = `<span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">LIBERADO</span>`;
        if (item.estatus === "Pausado" || item.estatus === "En Proceso") {
          badgeHtml = `<span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">TRASPASO</span>`;
        } else if (item.estatus === "Rechazado") {
          badgeHtml = `<span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">RETRABAJO / RECHAZO</span>`;
        }
        return `
          <div class="flex items-center justify-between gap-2 bg-slate-900/90 border border-slate-800/90 rounded-lg px-2.5 py-1.5">
            <div class="min-w-0 flex items-center gap-2">
              <span class="font-mono font-bold text-cyan-300 text-[11px] shrink-0">${item.numero_serie || item.id_inspeccion}</span>
              <span class="text-white font-semibold truncate">${item.modelo}</span>
              <span class="text-[10px] text-slate-400 shrink-0">(${item.area_ubicacion})</span>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <span class="text-[10px] text-slate-400 font-mono">${min}m</span>
              ${badgeHtml}
            </div>
          </div>
        `;
      }).join("");
    }
  }
}

function downloadCurrentOperatorShiftPDF() {
  const selectEl = document.getElementById("dash-pdf-operator-select");
  const qgUsers = getAvailableQGUsersForReport();
  let activeNomina = (selectEl && selectEl.value) ? selectEl.value : (qgUsers[0] ? qgUsers[0].nomina : 1042);
  let activeUser = qgUsers.find(u => String(u.nomina) === String(activeNomina)) ||
                   (appState.usuarios || []).find(u => String(u.nomina) === String(activeNomina)) ||
                   { nomina: 1042, nombre: "Juan Pérez Martínez (Coordinador / QG)", turno: "Turno 1 (Matutino)", rol: "colaborador" };

  // Inspecciones realizadas exclusivamente por este QG durante su turno
  let operatorItems = getQGShiftInspections(activeNomina, activeUser);

  if (operatorItems.length === 0) {
    alert(`ℹ️ El Coordinador / QG ${activeUser.nombre} (Nómina ${activeNomina}) no tiene inspecciones registradas durante su turno (${activeUser.turno || 'Turno 1'}).`);
    return;
  }

  const turnoConfig = getTurnoConfigByName(activeUser.turno);
  const operatorData = {
    nombre: activeUser.nombre,
    nomina: activeUser.nomina,
    turnoNombre: turnoConfig.nombre || activeUser.turno || "Turno 1 (Matutino)",
    turnoHorario: turnoConfig.horario || "06:00 - 14:00",
    rol: "Coordinador / QG de Calidad"
  };

  buildAndDownloadShiftReportPDF(operatorData, operatorItems);
}

function buildAndDownloadShiftReportPDF(operatorData, shiftInspections) {
  if (!window.jspdf) {
    alert("Cargando motor PDF, por favor intenta en un momento...");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // 1. Encabezado Oficial
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 28, "F");

  // Barra de acento cyan
  doc.setFillColor(14, 165, 233); // cyan-500
  doc.rect(0, 27, pageWidth, 1.5, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("AUDITUM | REPORTE FINAL DE ENTREGA DE TURNO", 14, 12);

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text("Control de Trazabilidad e Inspecci&#243;n de Calidad de Componentes de Acero", 14, 18);
  const nowStr = new Date().toLocaleString("es-MX", { dateStyle: "full", timeStyle: "short" });
  doc.text(`Fecha y Hora de Emisión: ${nowStr}`, 14, 23);

  // Badge Turno
  doc.setFillColor(2, 132, 199); // blue-600
  doc.roundedRect(pageWidth - 75, 7, 61, 14, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(operatorData.turnoNombre || "Turno Operativo", pageWidth - 71, 13);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(224, 242, 254);
  doc.text(`Horario: ${operatorData.turnoHorario || "06:00 - 14:00"}`, pageWidth - 71, 18);

  let y = 35;

  // 2. Ficha del Inspector Responsable
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, pageWidth - 28, 6.5, "F");
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text("1. DATOS DEL INSPECTOR / COLABORADOR", 16, y + 4.5);

  y += 11;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text("Nombre Completo:", 16, y);
  doc.text("N&#250;mero de Nómina:", 80, y);
  doc.text("Puesto / Perfil:", 135, y);

  y += 4.5;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);
  doc.text(operatorData.nombre, 16, y);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(2, 132, 199);
  doc.text(String(operatorData.nomina), 80, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  doc.text(operatorData.rol.toUpperCase(), 135, y);

  // 3. Resumen y Balance de Producci&#243;n del Turno
  y += 10;
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, pageWidth - 28, 6.5, "F");
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text("2. BALANCE Y RESULTADOS DE CALIDAD DE LA JORNADA", 16, y + 4.5);

  y += 10;
  const totalChecadas = shiftInspections.length;
  const liberadas = shiftInspections.filter(i => i.estatus === "Liberado").length;
  const rechazadas = shiftInspections.filter(i => i.estatus === "Rechazado").length;
  const enPausa = shiftInspections.filter(i => i.estatus === "Pausado" || i.estatus === "En Proceso");

  // Dibujar 4 mini-tarjetas resumen
  const cardW = (pageWidth - 28 - 9) / 4;
  
  // Tarjeta 1: Total Checadas
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, y, cardW, 16, 1.5, 1.5, "FD");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("TOTAL CHECADAS", 17, y + 5);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(`${totalChecadas}`, 17, y + 13);

  // Tarjeta 2: Liberadas Conformes (Verde)
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(14 + cardW + 3, y, cardW, 16, 1.5, 1.5, "FD");
  doc.setFontSize(7.5);
  doc.setTextColor(22, 101, 52);
  doc.text("LIBERADAS OK", 17 + cardW + 3, y + 5);
  doc.setFontSize(14);
  doc.setTextColor(22, 163, 74);
  doc.text(`${liberadas}`, 17 + cardW + 3, y + 13);

  // Tarjeta 3: Dejadas en Traspaso (Ámbar)
  doc.setFillColor(254, 252, 232);
  doc.setDrawColor(254, 240, 138);
  doc.roundedRect(14 + (cardW + 3) * 2, y, cardW, 16, 1.5, 1.5, "FD");
  doc.setFontSize(7.5);
  doc.setTextColor(133, 77, 14);
  doc.text("EN TRASPASO SIG. TURNO", 17 + (cardW + 3) * 2, y + 5);
  doc.setFontSize(14);
  doc.setTextColor(217, 119, 6);
  doc.text(`${enPausa.length}`, 17 + (cardW + 3) * 2, y + 13);

  // Tarjeta 4: Rechazos / Scrap (Rojo)
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(254, 202, 202);
  doc.roundedRect(14 + (cardW + 3) * 3, y, cardW, 16, 1.5, 1.5, "FD");
  doc.setFontSize(7.5);
  doc.setTextColor(153, 27, 27);
  doc.text("RECHAZOS / SCRAP", 17 + (cardW + 3) * 3, y + 5);
  doc.setFontSize(14);
  doc.setTextColor(220, 38, 38);
  doc.text(`${rechazadas}`, 17 + (cardW + 3) * 3, y + 13);

  y += 22;

  // 4. Tabla Detallada de Piezas Checadas
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, pageWidth - 28, 6.5, "F");
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text("3. DETALLE DE COMPONENTES CHECADOS EN EL TURNO", 16, y + 4.5);

  y += 10;
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(14, y, pageWidth - 28, 6, "F");
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("FOLIO", 16, y + 4.2);
  doc.text("NO. SERIE", 43, y + 4.2);
  doc.text("MODELO / PIEZA", 73, y + 4.2);
  doc.text("ÁREA", 125, y + 4.2);
  doc.text("TIEMPO", 155, y + 4.2);
  doc.text("DICTAMEN", 176, y + 4.2);

  y += 6;
  doc.setFontSize(7.5);

  shiftInspections.forEach((item, index) => {
    if (y > 240) {
      doc.addPage();
      y = 20;
      doc.setFillColor(30, 41, 59);
      doc.rect(14, y, pageWidth - 28, 6, "F");
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("FOLIO", 16, y + 4.2);
      doc.text("NO. SERIE", 43, y + 4.2);
      doc.text("MODELO / PIEZA", 73, y + 4.2);
      doc.text("ÁREA", 125, y + 4.2);
      doc.text("TIEMPO", 155, y + 4.2);
      doc.text("DICTAMEN", 176, y + 4.2);
      y += 6;
    }

    const isEven = index % 2 === 0;
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.rect(14, y, pageWidth - 28, 7.5, "F");
    doc.setDrawColor(226, 232, 240);
    doc.line(14, y + 7.5, pageWidth - 14, y + 7.5);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(2, 132, 199);
    doc.text(item.id_inspeccion, 16, y + 5);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85);
    doc.text((item.numero_serie || "-").substring(0, 14), 43, y + 5);
    doc.text((item.modelo || "-").substring(0, 26), 73, y + 5);
    doc.text((item.area_ubicacion || "-").substring(0, 14), 125, y + 5);

    const tr = (item.turnos || []).find(t => t.nomina_colaborador == operatorData.nomina) || (item.turnos || [])[0];
    const tMin = tr ? (tr.minutos || 30) : 30;
    doc.text(`${tMin} min`, 155, y + 5);

    // Estatus con color
    doc.setFont("helvetica", "bold");
    if (item.estatus === "Liberado") {
      doc.setTextColor(22, 163, 74);
      doc.text("LIBERADO", 176, y + 5);
    } else if (item.estatus === "Pausado" || item.estatus === "En Proceso") {
      doc.setTextColor(217, 119, 6);
      doc.text("TRASPASO", 176, y + 5);
    } else if (item.estatus === "Rechazado") {
      doc.setTextColor(220, 38, 38);
      doc.text("RECHAZO", 176, y + 5);
    } else {
      doc.setTextColor(71, 85, 105);
      doc.text(item.estatus.substring(0, 9).toUpperCase(), 176, y + 5);
    }

    y += 7.5;
  });

  // 5. SECCIÓN CRÍTICA: COMPONENTES EN TRASPASO PARA EL SIGUIENTE TURNO
  if (y > 215) {
    doc.addPage();
    y = 20;
  } else {
    y += 7;
  }

  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, pageWidth - 28, 6.5, "F");
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text("4. CONTROL DE TRASPASO Y COMPONENTES PENDIENTES PARA EL SIGUIENTE TURNO", 16, y + 4.5);

  y += 10;

  if (enPausa.length > 0) {
    // Calcular altura dinámica exacta para que ningún texto se desborde ni se encime
    let neededHeight = 12;
    enPausa.forEach(p => {
      const hasNotas = p.turnos && p.turnos.length > 0 && p.turnos[p.turnos.length - 1].notas;
      neededHeight += hasNotas ? 19 : 14;
    });

    doc.setFillColor(254, 252, 232); // amber-50
    doc.setDrawColor(245, 158, 11); // amber-500
    doc.roundedRect(14, y, pageWidth - 28, neededHeight, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(180, 83, 9); // amber-700
    doc.text(`[AVISO DE TRASPASO] COMPONENTES PENDIENTES ENTREGADOS AL RELEVO ENTRANTE (${enPausa.length}):`, 18, y + 6);

    let curY = y + 12;
    enPausa.forEach((p, idx) => {
      // L&#237;nea 1: Identificación clara del componente
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      const titleLine = `(${idx + 1}) ${p.id_inspeccion} | Serie: ${p.numero_serie || 'S/N'} | ${p.modelo} (${p.area_ubicacion || 'General'})`;
      doc.text(titleLine.substring(0, 85), 18, curY);

      // L&#237;nea 2: Faltantes reportados
      curY += 4.5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      if (p.tiene_faltantes === "SI") {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(185, 28, 28); // rojo
        doc.text(`    FALTANTES: ${p.descripcion_faltantes || "Requiere piezas/accesorios"}`, 18, curY);
      } else {
        doc.setTextColor(71, 85, 105);
        doc.text("    FALTANTES: Sin faltantes reportados.", 18, curY);
      }

      // L&#237;nea 3: Nota de traspaso/relevo (si existe)
      const lastTr = (p.turnos && p.turnos.length > 0) ? p.turnos[p.turnos.length - 1] : null;
      if (lastTr && lastTr.notas) {
        curY += 4.5;
        doc.setFont("helvetica", "italic");
        doc.setTextColor(100, 116, 139);
        doc.text(`    NOTA DE RELEVO: "${lastTr.notas}"`, 18, curY);
      }

      curY += 5.5; // Espaciado limpio para evitar encimado con el siguiente componente
    });

    y += neededHeight + 8;
  } else {
    doc.setFillColor(240, 253, 244); // emerald-50
    doc.setDrawColor(34, 197, 94); // emerald-500
    doc.roundedRect(14, y, pageWidth - 28, 14, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(21, 128, 61); // emerald-700
    doc.text("[ENTREGA CONFORME] REPORTE DE TURNO 100% CERRADO", 18, y + 6);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(22, 101, 52);
    doc.text("Todos los componentes asignados en este turno fueron liberados conforme o concluidos. No se dejan piezas pendientes.", 18, y + 10.5);

    y += 20;
  }

  // Pie de página oficial de trazabilidad (sin firmas; la ficha del colaborador superior certifica la autoría)
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.text(`AUDITUM Acero & Calidad | Reporte Oficial de Turno | Colaborador: ${operatorData.nombre} (Nómina ${operatorData.nomina}) | Página ${i} de ${totalPages}`, 14, pageHeight - 8);
  }

  const cleanTurno = (operatorData.turnoNombre || "Turno").replace(/[^a-zA-Z0-9]/g, "_");
  const fileName = `Reporte_Final_Turno_${cleanTurno}_Nomina_${operatorData.nomina}.pdf`;
  doc.save(fileName);
}

// ==================== GESTIÓN DE AUTENTICACIÓN, NÓMINAS Y CONTRASEÑAS ====================
function initAuthentication() {
  const loginScreen = document.getElementById("login-screen");
  if (!loginScreen) return;

  if (typeof updateLoginPlantTimeBadge === "function") {
    updateLoginPlantTimeBadge();
  }

  renderLoginPresetsList();

  // Escuchar cambios manuales en el input de nómina para sincronizar el select
  const nominaInput = document.getElementById("login-nomina");
  if (nominaInput && !nominaInput.dataset.listenerAttached) {
    nominaInput.dataset.listenerAttached = "true";
    nominaInput.addEventListener("input", (e) => {
      const val = parseInt(e.target.value);
      const selectEl = document.getElementById("login-user-select");
      if (selectEl) {
        const match = appState.usuarios.find(u => u.nomina == val);
        selectEl.value = match ? String(match.nomina) : "";
        if (match) {
          const pwdInput = document.getElementById("login-password");
          if (pwdInput && !pwdInput.value) {
            pwdInput.value = match.password || String(match.nomina);
          }
          const turnoSelect = document.getElementById("login-turno-ingreso");
          if (turnoSelect && match.turno) {
            if (match.turno.includes("Turno 1") || match.turno.includes("Matutino")) turnoSelect.value = "Turno 1 (Matutino)";
            else if (match.turno.includes("Turno 2") || match.turno.includes("Vespertino")) turnoSelect.value = "Turno 2 (Vespertino)";
            else if (match.turno.includes("Turno 3") || match.turno.includes("Nocturno")) turnoSelect.value = "Turno 3 (Nocturno)";
          }
        }
      }
    });
  }

  if (appState.isAuthenticated) {
    loginScreen.classList.add("hidden");
    loginScreen.classList.remove("flex");
    loginScreen.style.setProperty("display", "none", "important");
  } else {
    loginScreen.classList.remove("hidden");
    loginScreen.classList.add("flex");
    loginScreen.style.removeProperty("display");
    loginScreen.style.display = "flex";
    if (nominaInput) {
      if (appState.currentUser && appState.currentUser.nomina) {
        nominaInput.value = appState.currentUser.nomina;
        const selectEl = document.getElementById("login-user-select");
        if (selectEl) selectEl.value = String(appState.currentUser.nomina);
        const pwdInput = document.getElementById("login-password");
        if (pwdInput && !pwdInput.value) {
          pwdInput.value = appState.currentUser.password || String(appState.currentUser.nomina);
        }
        const turnoSelect = document.getElementById("login-turno-ingreso");
        if (turnoSelect && appState.currentUser.turno) {
          if (appState.currentUser.turno.includes("Turno 1") || appState.currentUser.turno.includes("Matutino")) turnoSelect.value = "Turno 1 (Matutino)";
          else if (appState.currentUser.turno.includes("Turno 2") || appState.currentUser.turno.includes("Vespertino")) turnoSelect.value = "Turno 2 (Vespertino)";
          else if (appState.currentUser.turno.includes("Turno 3") || appState.currentUser.turno.includes("Nocturno")) turnoSelect.value = "Turno 3 (Nocturno)";
        }
      }
      setTimeout(() => nominaInput.focus(), 200);
    }
  }
}

function validateUserPassword(user, enteredPassword) {
  // Garantizar que la contraseña nunca bloquee el acceso
  if (!enteredPassword || String(enteredPassword).trim() === "") return true;
  const pwd = String(enteredPassword).trim();
  if (pwd === "1234" || pwd === String(user.nomina) || pwd === String(user.password)) return true;

  // Si ingresó cualquier otra contraseña, se acepta y se guarda como clave activa del usuario
  saveCustomPassword(user.nomina, pwd);
  user.password = pwd;
  return true;
}

function saveCustomPassword(nomina, password) {
  let pwMap = {};
  const saved = localStorage.getItem("auditum_user_passwords");
  if (saved) {
    try { pwMap = JSON.parse(saved); } catch(e) {}
  }
  pwMap[nomina] = password;
  localStorage.setItem("auditum_user_passwords", JSON.stringify(pwMap));
}

function hideLoginModal() {
  const loginScreen = document.getElementById("login-screen");
  if (loginScreen) {
    loginScreen.classList.add("hidden");
    loginScreen.classList.remove("flex");
    loginScreen.style.setProperty("display", "none", "important");
  }
}

function handleLoginSubmit(event) {
  if (event) {
    try { event.preventDefault(); } catch(e) {}
    try { event.stopPropagation(); } catch(e) {}
  }

  const nInput = document.getElementById("login-nomina");
  const rawInputVal = nInput && nInput.value ? nInput.value.trim() : "";
  let nominaVal = rawInputVal ? parseInt(rawInputVal) : null;
  const selectEl = document.getElementById("login-user-select");

  if ((!nominaVal || isNaN(nominaVal)) && selectEl && selectEl.value) {
    nominaVal = parseInt(selectEl.value);
    if (nInput) nInput.value = nominaVal;
  }

  const pInput = document.getElementById("login-password");
  let passwordVal = pInput ? pInput.value.trim() : "";
  const errorEl = document.getElementById("login-error-msg");

  // Buscar usuario en catálogo por nómina o por nombre aproximado
  let user = null;
  if (nominaVal && !isNaN(nominaVal)) {
    user = appState.usuarios.find(u => u.nomina == nominaVal);
  }
  if (!user && rawInputVal) {
    const term = rawInputVal.toLowerCase();
    user = appState.usuarios.find(u => u.nombre && u.nombre.toLowerCase().includes(term));
    if (user) {
      nominaVal = user.nomina;
      if (nInput) nInput.value = nominaVal;
    }
  }

  // Si no se especificó o no se encontró, fallback seguro al usuario predeterminado (Juan #1042)
  if (!user) {
    if (!nominaVal || isNaN(nominaVal)) {
      nominaVal = 1042;
      if (nInput) nInput.value = 1042;
      user = appState.usuarios.find(u => u.nomina == 1042);
    }
  }

  if (!passwordVal) {
    passwordVal = user ? (user.password || String(user.nomina)) : String(nominaVal);
    if (pInput) pInput.value = passwordVal;
  }

  if (user) {
    validateUserPassword(user, passwordVal);
  } else {
    // Usuario nuevo ingresando por primera vez
    user = {
      nomina: nominaVal,
      password: passwordVal,
      nombre: `Colaborador Nómina #${nominaVal}`,
      rol: "colaborador",
      turno: document.getElementById("login-turno-ingreso") ? document.getElementById("login-turno-ingreso").value : "Turno 1 (Matutino)",
      email: `empleado${nominaVal}@acero.com`
    };
    appState.usuarios.push(user);
    try { saveCustomPassword(nominaVal, passwordVal); } catch(e) {}
  }

  // Aplicar el turno y horario de ingreso escogido para este nuevo horario
  const turnoSelect = document.getElementById("login-turno-ingreso");
  if (turnoSelect && turnoSelect.value) {
    user.turno = turnoSelect.value;
  }

  // 1. OCULTAR INMEDIATAMENTE LA PANTALLA DE LOGIN PARA PERMITIR TRABAJAR AL INSTANTE
  hideLoginModal();

  // 2. Establecer sesión activa
  if (errorEl) errorEl.classList.add("hidden");
  appState.currentUser = user;
  appState.isAuthenticated = true;

  try { sessionStorage.setItem("auditum_logged_in", "true"); } catch(e) {}
  try { localStorage.setItem("auditum_logged_in", "true"); } catch(e) {}
  try { localStorage.setItem("auditum_current_user", String(user.nomina)); } catch(e) {}
  try { localStorage.setItem("auditum_current_turno_" + user.nomina, user.turno); } catch(e) {}

  // 3. Inicializar interfaz de trabajo según el rol del usuario
  try {
    updateUserHeader();
  } catch(e) {
    console.warn("updateUserHeader error:", e);
  }

  try {
    if (user.rol === "gerente" || user.rol === "supervisor_linea") {
      switchTab("gerente");
    } else {
      switchTab("nueva");
    }
  } catch(e) {
    console.warn("switchTab error:", e);
  }

  try {
    updateKPIs();
  } catch(e) {
    console.warn("updateKPIs error:", e);
  }

  try {
    startPresenceLoop();
    renderPresenceDropdown(appState.presenceUsers || []);
  } catch(e) {
    console.warn("presence startup error:", e);
  }

  return false;
}


function togglePasswordVisibility(inputId, iconId) {
  const input = document.getElementById(inputId);
  const icon = document.getElementById(iconId);
  if (!input) return;
  if (input.type === "password") {
    input.type = "text";
    if (icon) icon.className = "fa-regular fa-eye-slash";
  } else {
    input.type = "password";
    if (icon) icon.className = "fa-regular fa-eye";
  }
}

let currentLoginShiftFilter = 'all';

function toggleManualLogin() {
  const form = document.getElementById("login-form");
  const chevron = document.getElementById("manual-login-chevron");
  if (!form) return;
  form.classList.toggle("hidden");
  if (chevron) {
    chevron.classList.toggle("rotate-180");
  }
}

function toggleLoginPresets() {
  const list = document.getElementById("login-presets-list");
  const chevron = document.getElementById("login-presets-chevron");
  if (!list) return;
  list.classList.toggle("hidden");
  if (chevron) {
    chevron.classList.toggle("rotate-180");
  }
}

function quickLoginUser(nomina, pwd) {
  quickFillLogin(nomina, pwd);
  // Sincronizar el turno si se filtró arriba
  const turnoSelect = document.getElementById("login-turno-ingreso");
  if (turnoSelect && currentLoginShiftFilter !== "all") {
    if (currentLoginShiftFilter === "Turno 1") turnoSelect.value = "Turno 1 (Matutino)";
    else if (currentLoginShiftFilter === "Turno 2") turnoSelect.value = "Turno 2 (Vespertino)";
    else if (currentLoginShiftFilter === "Turno 3") turnoSelect.value = "Turno 3 (Nocturno)";
  }
  handleLoginSubmit();
}

function updateQuickChipsDisplay() {
  const chipUsers = [
    { nomina: 1042, baseName: "Juan", shortRole: "QG / Coord" },
    { nomina: 1150, baseName: "Miguel", shortRole: "QG / Coord" },
    { nomina: 1210, baseName: "Luis", shortRole: "QG / Coord" },
    { nomina: 2088, baseName: "Carlos", shortRole: "Sup. Calidad" },
    { nomina: 3015, baseName: "Ing. Roberto Garza", shortRole: "Gerente" }
  ];

  chipUsers.forEach(cu => {
    const nameEl = document.getElementById(`chip-name-${cu.nomina}`);
    const subEl = document.getElementById(`chip-sub-${cu.nomina}`);
    const u = appState.usuarios.find(x => x.nomina == cu.nomina);
    if (nameEl) {
      if (currentLoginShiftFilter === "all") {
        nameEl.innerText = cu.baseName;
      } else {
        const shiftShort = (u && u.turno) ? (u.turno.includes("Turno 1") ? "T1" : u.turno.includes("Turno 2") ? "T2" : u.turno.includes("Turno 3") ? "T3" : "") : "";
        nameEl.innerText = shiftShort ? `${cu.baseName} (${shiftShort})` : cu.baseName;
      }
    }
    if (subEl) {
      if (currentLoginShiftFilter === "all") {
        subEl.innerText = `${cu.nomina} • ${cu.shortRole}`;
      } else {
        const shiftShort = (u && u.turno) ? (u.turno.includes("Turno 1") ? "T1" : u.turno.includes("Turno 2") ? "T2" : u.turno.includes("Turno 3") ? "T3" : "") : "";
        subEl.innerText = shiftShort ? `${cu.nomina} • ${cu.shortRole} • ${shiftShort}` : `${cu.nomina} • ${cu.shortRole}`;
      }
    }
  });
}

function filterLoginByTurno(shiftKey) {
  currentLoginShiftFilter = shiftKey || 'all';

  // Actualizar estilos de los botones de filtro arriba
  const filterBtns = document.querySelectorAll("#login-shift-filter-buttons .shift-filter-btn");
  filterBtns.forEach(btn => {
    btn.className = "shift-filter-btn py-1 px-2 rounded-lg text-[11px] font-bold border transition text-center bg-slate-900 text-slate-300 border-slate-700 hover:border-cyan-400 cursor-pointer";
  });

  const activeBtnId = shiftKey === "Turno 1" ? "btn-shift-t1" :
                      shiftKey === "Turno 2" ? "btn-shift-t2" :
                      shiftKey === "Turno 3" ? "btn-shift-t3" : "btn-shift-all";
  const activeBtn = document.getElementById(activeBtnId);
  if (activeBtn) {
    activeBtn.className = "shift-filter-btn py-1 px-2 rounded-lg text-[11px] font-bold border transition text-center bg-blue-600 text-white border-blue-400 shadow cursor-pointer";
  }

  // Filtrar los chips de acceso rápido
  const chipBtns = document.querySelectorAll("#login-quick-chips .login-chip-btn");
  chipBtns.forEach(btn => {
    const chipTurno = btn.getAttribute("data-turno") || "";
    if (shiftKey === "all") {
      btn.classList.remove("hidden");
    } else {
      const match = chipTurno.toLowerCase().includes(shiftKey.toLowerCase()) || 
                    (shiftKey === "Turno 1" && chipTurno === "Turno 1") || 
                    (shiftKey === "Turno 2" && chipTurno === "Turno 2") || 
                    (shiftKey === "Turno 3" && chipTurno === "Turno 3") ||
                    chipTurno === "Mixto" || chipTurno === "General";
      if (match) {
        btn.classList.remove("hidden");
      } else {
        btn.classList.add("hidden");
      }
    }
  });

  // Re-renderizar lista y desplegable con el filtro aplicado
  renderLoginPresetsList();

  // Sincronizar automáticamente el selector de turno de ingreso al nuevo horario
  const turnoIngresoSelect = document.getElementById("login-turno-ingreso");
  if (turnoIngresoSelect && shiftKey !== "all") {
    if (shiftKey === "Turno 1") turnoIngresoSelect.value = "Turno 1 (Matutino)";
    else if (shiftKey === "Turno 2") turnoIngresoSelect.value = "Turno 2 (Vespertino)";
    else if (shiftKey === "Turno 3") turnoIngresoSelect.value = "Turno 3 (Nocturno)";
  }

  // Pre-cargar datos del usuario correspondiente sin submit forzado
  const matchingUser = appState.usuarios.find(u => {
    if (shiftKey === "all") return true;
    return (u.turno && u.turno.toLowerCase().includes(shiftKey.toLowerCase()));
  });
  if (matchingUser) {
    quickFillLogin(matchingUser.nomina, matchingUser.password || String(matchingUser.nomina));
  }
}

function handleLoginUserSelect(nomina) {
  if (!nomina) return;
  const user = appState.usuarios.find(u => u.nomina == nomina);
  if (user) {
    quickFillLogin(user.nomina, user.password || String(user.nomina));
  }
}

function renderLoginPresetsList() {
  const list = document.getElementById("login-presets-list");
  const selectEl = document.getElementById("login-user-select");

  // Filtrar usuarios según el turno activo arriba
  const filteredUsers = appState.usuarios.filter(u => {
    if (currentLoginShiftFilter === "all") return true;
    return (u.turno && u.turno.toLowerCase().includes(currentLoginShiftFilter.toLowerCase())) || u.rol === "supervisor" || u.rol === "gerente" || u.rol === "supervisor_linea";
  });

  // Sincronizar dinámicamente las opciones del selector desplegable agrupadas por perfil y línea
  if (selectEl) {
    const currentVal = selectEl.value;
    selectEl.innerHTML = `<option value="">-- Elige tu usuario o Supervisor de L&#237;nea --</option>`;

    const grpCoord = document.createElement("optgroup");
    grpCoord.label = "🛡️ Coordinadores / QG, Supervisor y Gerente";

    const grpFabs = document.createElement("optgroup");
    grpFabs.label = "Nave FABS (10 L\u00EDneas)";

    const grpK = document.createElement("optgroup");
    grpK.label = "Nave EDIFICIO K (3 L\u00EDneas)";

    filteredUsers.forEach(u => {
      const opt = document.createElement("option");
      opt.value = u.nomina;
      let roleIcon = "🛡️";
      if (u.rol === "gerente") roleIcon = "👑";
      else if (u.rol === "supervisor") roleIcon = "🛡️";
      else if (u.rol === "supervisor_linea") roleIcon = u.area === "EDIFICIO K" ? "🏢" : "🏭";

      if (currentLoginShiftFilter === "all") {
        opt.innerText = `${roleIcon} ${u.nombre} (${u.nomina})`;
      } else {
        opt.innerText = `${roleIcon} ${u.nombre} (${u.turno || currentLoginShiftFilter})`;
      }

      if (currentVal && String(currentVal) === String(u.nomina)) {
        opt.selected = true;
      }

      if (u.rol === "supervisor_linea") {
        if (u.area === "EDIFICIO K") grpK.appendChild(opt);
        else grpFabs.appendChild(opt);
      } else {
        grpCoord.appendChild(opt);
      }
    });

    selectEl.appendChild(grpCoord);
    selectEl.appendChild(grpFabs);
    selectEl.appendChild(grpK);
  }

  // Actualizar también los textos de los chips rápidos según el filtro arriba
  updateQuickChipsDisplay();

  if (!list) return;
  list.innerHTML = "";

  filteredUsers.forEach(u => {
    const card = document.createElement("div");
    card.className = "p-2 rounded-xl bg-slate-950/90 border border-slate-800 hover:border-cyan-500/60 flex items-center justify-between cursor-pointer transition group shadow-sm";
    card.onclick = () => quickLoginUser(u.nomina, u.password || String(u.nomina));

    let roleBadge = "bg-cyan-950/80 text-cyan-300 border-cyan-700/80";
    let roleLabel = "QG / Coordinador";
    let avatarBg = "bg-blue-600";
    if (u.rol === "gerente") {
      roleBadge = "bg-emerald-950/80 text-emerald-300 border-emerald-700/80";
      roleLabel = "Gerente";
      avatarBg = "bg-emerald-600";
    } else if (u.rol === "supervisor") {
      roleBadge = "bg-purple-950/80 text-purple-300 border-purple-700/80";
      roleLabel = "Supervisor";
      avatarBg = "bg-purple-600";
    } else if (u.rol === "supervisor_linea") {
      roleBadge = "bg-amber-950/80 text-amber-300 border-amber-500/80";
      roleLabel = `Sup. ${u.linea}`;
      avatarBg = "bg-amber-600";
    }

    const initials = (u.nombre || "US").split(" ").map(w => w[0]).slice(0, 2).join("");
    const turnoText = currentLoginShiftFilter === "all" ? "" : ` • <span class="text-amber-300 font-semibold">${u.turno || currentLoginShiftFilter}</span>`;

    card.innerHTML = `
      <div class="flex items-center gap-2.5 min-w-0">
        <div class="w-7 h-7 rounded-lg ${avatarBg} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow">
          ${initials}
        </div>
        <div class="text-left truncate">
          <div class="font-bold text-xs text-white group-hover:text-cyan-300 transition truncate">${u.nombre}</div>
          <div class="text-[10px] text-slate-400 font-mono">Nómina: <span class="text-cyan-400 font-bold">${u.nomina}</span>${turnoText}</div>
        </div>
      </div>
      <div class="flex items-center gap-2 shrink-0 ml-2">
        <span class="px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${roleBadge}">${roleLabel}</span>
        <button type="button" class="px-2 py-0.5 rounded-lg bg-blue-600/30 group-hover:bg-blue-600 text-cyan-300 group-hover:text-white text-[10px] font-bold transition">
          Entrar
        </button>
      </div>
    `;
    list.appendChild(card);
  });
}

function quickFillLogin(nomina, pwd) {
  const nInput = document.getElementById("login-nomina");
  const pInput = document.getElementById("login-password");
  const selectEl = document.getElementById("login-user-select");
  const turnoSelect = document.getElementById("login-turno-ingreso");

  const user = appState.usuarios.find(u => u.nomina == nomina);

  if (nInput) nInput.value = nomina;
  if (pInput) pInput.value = pwd || (user ? user.password || String(user.nomina) : "1234");
  if (selectEl) selectEl.value = String(nomina);

  if (turnoSelect && user && user.turno) {
    if (user.turno.includes("Turno 1") || user.turno.includes("Matutino")) {
      turnoSelect.value = "Turno 1 (Matutino)";
    } else if (user.turno.includes("Turno 2") || user.turno.includes("Vespertino")) {
      turnoSelect.value = "Turno 2 (Vespertino)";
    } else if (user.turno.includes("Turno 3") || user.turno.includes("Nocturno")) {
      turnoSelect.value = "Turno 3 (Nocturno)";
    } else {
      turnoSelect.value = "Mixto";
    }
  }

  const errorEl = document.getElementById("login-error-msg");
  if (errorEl) errorEl.classList.add("hidden");

  const submitBtn = document.getElementById("btn-login-submit");
  if (submitBtn) submitBtn.focus();
}

function updateLoginPlantTimeBadge() {
  const badge = document.getElementById("login-shift-live-badge");
  if (!badge) return;
  const now = new Date();
  const hrs = now.getHours();
  const mins = String(now.getMinutes()).padStart(2, "0");
  const timeStr = `${String(hrs).padStart(2, "0")}:${mins}`;
  let shiftName = "T1 Matutino";
  if ((hrs >= 14 && hrs < 21) || (hrs === 21 && now.getMinutes() <= 30)) {
    shiftName = "T2 Vespertino";
  } else if (hrs >= 22 || hrs < 6 || (hrs === 21 && now.getMinutes() > 30)) {
    shiftName = "T3 Nocturno";
  }
  badge.innerText = `Planta: ${timeStr} (${shiftName})`;
}

function logoutUser() {
  appState.isAuthenticated = false;
  sessionStorage.removeItem("auditum_logged_in");

  // Pausar cron&#243;metro si está corriendo
  if (inspectionTimer.isRunning) {
    toggleInspectionTimer();
  }

  const pwdInput = document.getElementById("login-password");
  if (pwdInput) pwdInput.value = "";
  const errorEl = document.getElementById("login-error-msg");
  if (errorEl) errorEl.classList.add("hidden");

  const loginScreen = document.getElementById("login-screen");
  if (loginScreen) {
    loginScreen.classList.remove("hidden");
    loginScreen.classList.add("flex");
    loginScreen.style.removeProperty("display");
    loginScreen.style.display = "flex";
    renderLoginPresetsList();
    const selectEl = document.getElementById("login-user-select");
    if (selectEl && appState.currentUser) {
      selectEl.value = String(appState.currentUser.nomina);
    }
    const nominaInput = document.getElementById("login-nomina");
    if (nominaInput) {
      nominaInput.value = appState.currentUser ? appState.currentUser.nomina : "";
      nominaInput.focus();
    }
  }
}

// ==================== GESTIÓN DE USUARIOS / NÓMINAS EN MODAL ====================
function openUserModal() {
  const container = document.getElementById("users-preset-list");
  if (!container) return;
  container.innerHTML = "";
  const errEl = document.getElementById("modal-user-error");
  if (errEl) errEl.classList.add("hidden");

  appState.usuarios.forEach(u => {
    const isCurrent = appState.currentUser.nomina == u.nomina;
    const roleText = u.rol === "supervisor_linea" ? `Sup. L&#237;nea ${u.linea}` : u.rol === "colaborador" ? "Coordinador / QG" : u.rol;
    const card = document.createElement("div");
    card.className = `p-3 rounded-lg border transition ${isCurrent ? 'bg-blue-600/20 border-blue-500 text-white' : 'bg-slate-900 border-slate-700 hover:border-slate-500 text-slate-300'}`;
    card.innerHTML = `
      <div class="flex items-center justify-between">
        <div>
          <div class="font-bold text-xs">${u.nombre}</div>
          <div class="text-[11px] text-slate-400">Nómina: <span class="font-mono text-cyan-400">${u.nomina}</span> • ${u.turno}</div>
        </div>
        <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 border border-slate-600 text-amber-300">${roleText}</span>
      </div>
      ${!isCurrent ? `
        <div class="mt-2 pt-2 border-t border-slate-800 flex gap-2 items-center">
          <input type="password" id="switch-pwd-${u.nomina}" placeholder="Contraseña (opcional)" class="bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-white flex-1 focus:outline-none focus:border-blue-500 font-mono">
          <button type="button" onclick="confirmSwitchUser(${u.nomina})" class="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition cursor-pointer">Cambiar Usuario</button>
        </div>
      ` : '<div class="text-[10px] text-emerald-400 mt-1 font-semibold flex items-center gap-1"><i class="fa-solid fa-check"></i> Usuario activo en turno</div>'}
    `;
    container.appendChild(card);
  });

  document.getElementById("modal-user").classList.remove("hidden");
}

function closeUserModal() {
  document.getElementById("modal-user").classList.add("hidden");
}

function confirmSwitchUser(nomina) {
  const pwdInput = document.getElementById(`switch-pwd-${nomina}`);
  const pwd = pwdInput ? pwdInput.value.trim() : "";
  const user = appState.usuarios.find(u => u.nomina == nomina);
  if (!user) return;

  if (!validateUserPassword(user, pwd)) {
    alert(`Contraseña incorrecta para la nómina ${nomina}. (Pista: usa tu misma nómina o 1234)`);
    if (pwdInput) pwdInput.focus();
    return;
  }

  appState.currentUser = user;
  appState.isAuthenticated = true;
  localStorage.setItem("auditum_current_user", String(user.nomina));
  sessionStorage.setItem("auditum_logged_in", "true");
  updateUserHeader();
  if (user.rol === "gerente" || user.rol === "supervisor_linea") {
    switchTab("gerente");
  }
  closeUserModal();
  updateKPIs();
  try { startPresenceLoop(); renderPresenceDropdown(appState.presenceUsers || []); } catch(e) {}
}

function setCustomNominaWithPassword() {
  const nomVal = parseInt(document.getElementById("custom-nomina").value);
  const pwdVal = document.getElementById("custom-password").value.trim();
  const errEl = document.getElementById("modal-user-error");

  if (!nomVal) {
    if (errEl) { errEl.innerText = "Ingresa el número de nómina."; errEl.classList.remove("hidden"); }
    return;
  }
  if (!pwdVal) {
    if (errEl) { errEl.innerText = "Ingresa la contraseña para validar."; errEl.classList.remove("hidden"); }
    return;
  }

  let user = appState.usuarios.find(u => u.nomina == nomVal);
  if (user) {
    if (!validateUserPassword(user, pwdVal)) {
      if (errEl) { errEl.innerText = "Contraseña incorrecta para esta nómina."; errEl.classList.remove("hidden"); }
      return;
    }
  } else {
    user = {
      nomina: nomVal,
      password: pwdVal,
      nombre: `Colaborador Nómina #${nomVal}`,
      rol: "colaborador",
      turno: "Turno 1 (Matutino)",
      email: `empleado${nomVal}@acero.com`
    };
    appState.usuarios.push(user);
    saveCustomPassword(nomVal, pwdVal);
  }

  if (errEl) errEl.classList.add("hidden");
  appState.currentUser = user;
  appState.isAuthenticated = true;
  localStorage.setItem("auditum_current_user", String(nomVal));
  sessionStorage.setItem("auditum_logged_in", "true");
  updateUserHeader();
  if (user.rol === "gerente" || user.rol === "supervisor_linea") {
    switchTab("gerente");
  }
  closeUserModal();
  updateKPIs();
  try { startPresenceLoop(); renderPresenceDropdown(appState.presenceUsers || []); } catch(e) {}
}

// CONTROL DE VISIBILIDAD DE PESTAÑAS SEGÚN ROL
function applyRoleTabVisibility() {
  const u = appState.currentUser;
  const isGerente = u && u.rol === "gerente";
  const isSupervisorLinea = u && u.rol === "supervisor_linea";
  const tabBtnNueva = document.getElementById("tab-btn-nueva");
  const tabBtnTraspaso = document.getElementById("tab-btn-traspaso");
  const tabBtnGerente = document.getElementById("tab-btn-gerente");
  const tabBtnAuditoria = document.getElementById("tab-btn-auditoria");
  const tabBtnCabinas = document.getElementById("tab-btn-cabinas") || document.getElementById("btn-cabinas-coordinador");
  const tabBtnMapa = document.getElementById("tab-btn-mapa");

  // El Mapa de Planta y Sensores es visible para todos los roles (Coordinador, Supervisor de L&#237;nea y Gerente)
  if (tabBtnMapa) {
    tabBtnMapa.classList.remove("hidden");
    tabBtnMapa.style.display = "";
  }

  if (isSupervisorLinea) {
    // Para Supervisores de L&#237;nea: SOLO se ve Dashboard, Producci&#243;n y Defectos + LINEAS QUE REQUIEREN QG
    if (tabBtnNueva) {
      tabBtnNueva.classList.add("hidden");
      tabBtnNueva.style.display = "none";
    }
    if (tabBtnTraspaso) {
      tabBtnTraspaso.classList.add("hidden");
      tabBtnTraspaso.style.display = "none";
    }
    if (tabBtnAuditoria) {
      tabBtnAuditoria.classList.add("hidden");
      tabBtnAuditoria.style.display = "none";
    }
    if (tabBtnGerente) {
      tabBtnGerente.classList.remove("hidden");
      tabBtnGerente.style.display = "";
    }
    if (tabBtnCabinas) {
      tabBtnCabinas.classList.remove("hidden");
      tabBtnCabinas.style.display = "";
    }
  } else if (isGerente) {
    // Para Gerente: Ocultar y remover estrictamente Nueva Inspecci&#243;n y Traspaso de Turno
    if (tabBtnNueva) {
      tabBtnNueva.classList.add("hidden");
      tabBtnNueva.style.display = "none";
    }
    if (tabBtnTraspaso) {
      tabBtnTraspaso.classList.add("hidden");
      tabBtnTraspaso.style.display = "none";
    }
    if (tabBtnAuditoria) {
      tabBtnAuditoria.classList.remove("hidden");
      tabBtnAuditoria.style.display = "";
    }
    if (tabBtnGerente) {
      tabBtnGerente.classList.remove("hidden");
      tabBtnGerente.style.display = "";
    }
    if (tabBtnCabinas) {
      tabBtnCabinas.classList.remove("hidden");
      tabBtnCabinas.style.display = "";
    }
  } else {
    // Para Coordinadores / QG y Supervisores Generales: Restaurar visibilidad completa
    if (tabBtnNueva) {
      tabBtnNueva.classList.remove("hidden");
      tabBtnNueva.style.display = "";
    }
    if (tabBtnTraspaso) {
      tabBtnTraspaso.classList.remove("hidden");
      tabBtnTraspaso.style.display = "";
    }
    if (tabBtnAuditoria) {
      tabBtnAuditoria.classList.remove("hidden");
      tabBtnAuditoria.style.display = "";
    }
    if (tabBtnGerente) {
      tabBtnGerente.classList.remove("hidden");
      tabBtnGerente.style.display = "";
    }
    if (tabBtnCabinas) {
      tabBtnCabinas.classList.remove("hidden");
      tabBtnCabinas.style.display = "";
    }
  }

  if (typeof applyQGModalRoleVisibility === "function") {
    applyQGModalRoleVisibility();
  }
}

function updateUserHeader() {
  const u = appState.currentUser;
  document.getElementById("user-display-name").innerText = u.nombre;
  document.getElementById("user-display-nomina").innerText = u.nomina;
  const roleLabel = u.rol === "supervisor_linea" ? `Sup. L&#237;nea ${u.linea}` : u.rol === "colaborador" ? "Coordinador / QG" : u.rol;
  document.getElementById("user-display-role").innerText = roleLabel;

  const initials = u.nombre.split(" ").map(w => w[0]).slice(0, 2).join("");
  document.getElementById("user-avatar").innerText = initials || "U";

  // Sidebar card
  const sideNomina = document.getElementById("side-user-nomina");
  const sideName = document.getElementById("side-user-name");
  const sideTurno = document.getElementById("side-user-turno");
  if (sideNomina) sideNomina.innerText = u.nomina;
  if (sideName) sideName.innerText = u.nombre;
  if (sideTurno) sideTurno.innerText = u.turno || "Turno 1";

  // Label de usuario en cron&#243;metro
  const timerUser = document.getElementById("timer-user-label");
  if (timerUser) timerUser.innerText = `Nómina ${u.nomina} - ${u.nombre}`;

  // Aplicar visibilidad de pestañas por rol
  applyRoleTabVisibility();

  // Tip de supervisor en tabla
  const superTip = document.getElementById("supervisor-table-tip");
  if (superTip) {
    if (u.rol === "supervisor") superTip.classList.remove("hidden");
    else superTip.classList.add("hidden");
  }

  // Sincronizar selector de reporte de turno en el dashboard
  const selDashOperator = document.getElementById("dash-pdf-operator-select");
  if (selDashOperator && u && u.nomina) {
    selDashOperator.value = u.nomina;
  }
  if (typeof updateOperatorShiftBanner === "function") {
    updateOperatorShiftBanner();
  }

  // Actualizar notificaciones del panel lateral según usuario activo
  if (typeof renderSidebarNotificaciones === "function") {
    renderSidebarNotificaciones();
  }

  if (u.rol === "gerente") {
    // Redirigir al panel gerencial si estaba en pestañas operativas
    const activeTab = document.querySelector(".tab-content:not(.hidden)");
    if (!activeTab || activeTab.id === "tab-nueva" || activeTab.id === "tab-traspaso") {
      switchTab("gerente");
    }
  } else if (u.rol === "supervisor_linea") {
    // Para Supervisor de L&#237;nea: permitir pestaña Dashboard o pestaña LINEAS QUE REQUIEREN QG
    const activeTab = document.querySelector(".tab-content:not(.hidden)");
    if (!activeTab || (activeTab.id !== "tab-gerente" && activeTab.id !== "tab-cabinas")) {
      switchTab("gerente");
    }
  }

  // Actualizar presencia para el usuario actual
  if (typeof sendPresenceHeartbeat === "function") {
    sendPresenceHeartbeat();
  }
  if (typeof updateMyPauseButtonUI === "function") {
    updateMyPauseButtonUI();
  }
}

// ==================== CONFIGURACIÓN Y SINCRONIZACIÓN GOOGLE SHEETS ====================
async function checkServiceAccountApi() {
  try {
    const res = await fetch("/api/sheets/status");
    if (res.ok) {
      const statusData = await res.json();
      if (statusData.connected) {
        appState.isServiceAccountConnected = true;
        appState.serviceAccountInfo = statusData;
        updateSyncIndicator();
        return true;
      }
    }
  } catch(e) {
    console.log("Modo standalone / API local no disponible en esta ruta");
  }
  return false;
}

function openSyncModal() {
  const infoEl = document.getElementById("sa-connection-details");
  if (infoEl && appState.serviceAccountInfo) {
    infoEl.innerHTML = `
      <div class="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-lg space-y-1">
        <div class="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
          <i class="fa-solid fa-circle-check"></i> Google Sheets API v4 Activa
        </div>
        <div class="text-[11px] text-slate-300">
          <span class="text-slate-400 font-semibold">Service Account:</span>
          <span class="font-mono text-cyan-300 block truncate">${appState.serviceAccountInfo.serviceAccount}</span>
        </div>
        <div class="text-[11px] text-slate-300">
          <span class="text-slate-400 font-semibold">Proyecto:</span>
          <span class="font-mono text-slate-200">${appState.serviceAccountInfo.projectId}</span>
        </div>
      </div>
    `;
  }
  document.getElementById("script-url-input").value = appState.scriptUrl;
  document.getElementById("modal-sync").classList.remove("hidden");
}

function closeSyncModal() {
  document.getElementById("modal-sync").classList.add("hidden");
}

function saveSyncSettings() {
  const url = document.getElementById("script-url-input").value.trim();
  appState.scriptUrl = url;
  localStorage.setItem("auditum_script_url", url);
  updateSyncIndicator();
  closeSyncModal();
  if (url) {
    alert("Configuraci&#243;n de URL de respaldo guardada correctamente.");
  }
}

function updateSyncIndicator() {
  const dot = document.getElementById("sync-dot");
  const label = document.getElementById("sync-label");

  if (appState.isServiceAccountConnected) {
    dot.className = "w-2 h-2 rounded-full bg-emerald-400 animate-pulse";
    label.innerText = "Google Cloud API: Conectado";
  } else if (appState.scriptUrl) {
    dot.className = "w-2 h-2 rounded-full bg-emerald-400 animate-pulse";
    label.innerText = "Sheets: Conectado (Apps Script)";
  } else {
    dot.className = "w-2 h-2 rounded-full bg-blue-400";
    label.innerText = "Sheets: Modo Local";
  }
}

async function testSyncConnection() {
  // Probar primero el endpoint local oficial de Google Cloud API
  try {
    const res = await fetch("/api/sheets/status");
    if (res.ok) {
      const data = await res.json();
      if (data.connected) {
        appState.isServiceAccountConnected = true;
        appState.serviceAccountInfo = data;
        updateSyncIndicator();
        alert(`🎉 ¡Conexión exitosa con Google Cloud API!\n\nCuenta de Servicio: ${data.serviceAccount}\nProyecto: ${data.projectId}\nAPI: ${data.api}\nHoja ID: ${data.spreadsheetId}`);
        return;
      }
    }
  } catch(e) {}

  // Probar Apps Script remoto si está configurado
  const url = document.getElementById("script-url-input").value.trim();
  if (!url) {
    alert("No se detectó el backend de Google Cloud API en el servidor local. Ingresa una URL de Apps Script para modo alterno.");
    return;
  }

  fetch(url + "?action=ping")
    .then(r => r.json())
    .then(res => {
      if (res.success) {
        alert("🎉 ¡Conexión exitosa con Google Sheets!\nRespuesta: " + res.message);
      } else {
        alert("⚠️ La URL respondió pero hubo un error: " + JSON.stringify(res));
      }
    })
    .catch(err => {
      alert("❌ Error al conectar con Google Apps Script.\nDetalle: " + err.message);
    });
}

async function syncRecordToGoogleSheets(action, data) {
  // 1. Intentar enviar a través del endpoint oficial de Google Sheets API v4
  try {
    const res = await fetch("/api/sheets/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: action, data: data })
    });
    if (res.ok) {
      const resJson = await res.json();
      console.log("✅ Registro sincronizado exitosamente con Google Sheets API v4:", resJson);
      return;
    }
  } catch(e) {
    console.warn("API proxy local no respondió, evaluando respaldo:", e);
  }

  // 2. Respaldo por Web App Apps Script si existe URL configurada
  if (!appState.scriptUrl) return;

  fetch(appState.scriptUrl, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: action, data: data })
  }).catch(e => {
    console.warn("Sincronización en segundo plano con Google Sheets:", e);
  });
}

// ==================== NAVEGACIÓN Y ENFOQUE MODULAR (PANEL DE CONTROL VISUAL) ====================
let currentGerenteModule = "none";
let gerenteViewMode = "focus";

const GERENTE_MODULES = [
  "mod-dashboard",
  "mod-diaria",
  "mod-metas",
  "mod-turnos",
  "mod-modelos",
  "mod-naves",
  "mod-calidad",
  "mod-defectos",
  "mod-personal"
];

const GERENTE_MODULE_INFO = {
  "dashboard": {
    shortName: "Dashboard",
    name: "Dashboard & Liberaci&#243;n de Calidad",
    desc: "Catálogo maestro de componentes en piso, balance de piezas aprobadas y reporte final de turno en PDF.",
    icon: "fa-solid fa-chart-pie text-emerald-400",
    pillBg: "from-emerald-600 to-teal-500"
  },
  "diaria": {
    shortName: "Prod. Diaria",
    name: "Producci&#243;n Diaria y Matriz Semanal",
    desc: "Volumen de piezas inspeccionadas por día (Lunes a Sábado), desglose por turno y día récord.",
    icon: "fa-solid fa-chart-column text-blue-400",
    pillBg: "from-blue-600 to-cyan-500"
  },
  "metas": {
    shortName: "Metas Planta",
    name: "Metas de Planta y 12 Familias",
    desc: "Objetivos de producción por Nave (EDIFICIO K vs FABS) y avance individual de las 12 familias de modelos.",
    icon: "fa-solid fa-bullseye text-amber-400",
    pillBg: "from-amber-500 to-orange-500"
  },
  "turnos": {
    shortName: "Turnos",
    name: "Desglose por Turno de Trabajo",
    desc: "Balance operativo de producción e incidencias en Turno 1 (Matutino), Turno 2 (Vespertino) y Turno 3 (Nocturno).",
    icon: "fa-solid fa-users-gear text-sky-400",
    pillBg: "from-sky-600 to-blue-500"
  },
  "modelos": {
    shortName: "Modelos",
    name: "Distribución de Modelos de Acero",
    desc: "Proporción de los 12 modelos en planta y gráfica comparativa de no conformidades por modelo.",
    icon: "fa-solid fa-cubes-stacked text-purple-400",
    pillBg: "from-fuchsia-600 to-purple-500"
  },
  "naves": {
    shortName: "Naves",
    name: "Comparativa de Naves: EDIFICIO K vs FABS",
    desc: "Producci&#243;n total y defectos clasificados por nave (Soldadura, Golpe, Faltantes y Scrap).",
    icon: "fa-solid fa-industry text-cyan-400",
    pillBg: "from-cyan-600 to-teal-500"
  },
  "calidad": {
    shortName: "Calidad",
    name: "Calidad y Estatus del Proceso",
    desc: "Porcentaje de conformidad global, tiempo promedio de ciclo y estatus de inspección.",
    icon: "fa-solid fa-circle-check text-teal-400",
    pillBg: "from-teal-500 to-emerald-500"
  },
  "defectos": {
    shortName: "Defectos",
    name: "Análisis y Catálogo de Defectos",
    desc: "Indicadores de fallas, 4 gráficas analíticas de defectos y catálogo detallado con fotos de hallazgos.",
    icon: "fa-solid fa-triangle-exclamation text-rose-400",
    pillBg: "from-rose-600 to-red-500"
  },
  "personal": {
    shortName: "Personal Op.",
    name: "Gr&#225;fica del Personal Operativo & Causa Raíz",
    desc: "Distribución de causas humanas (Entrenamiento, Fatiga, Compromiso, Utillaje) y seguimiento de retroalimentación.",
    icon: "fa-solid fa-chalkboard-user text-amber-400",
    pillBg: "from-amber-600 via-orange-500 to-yellow-400"
  }
};

let isGerenteControlGridCollapsed = false;

function toggleGerenteControlPanelGrid() {
  isGerenteControlGridCollapsed = !isGerenteControlGridCollapsed;
  const grid = document.getElementById("gerente-apps-grid");
  const icon = document.getElementById("icon-toggle-gerente-control-grid");
  if (grid) {
    if (isGerenteControlGridCollapsed) {
      grid.classList.add("hidden");
      if (icon) {
        icon.classList.remove("fa-chevron-up");
        icon.classList.add("fa-chevron-down");
      }
    } else {
      grid.classList.remove("hidden");
      if (icon) {
        icon.classList.remove("fa-chevron-down");
        icon.classList.add("fa-chevron-up");
      }
    }
  }
}

function renderCollapsedTablesCornerDock() {
  const keys = Object.keys(GERENTE_MODULE_INFO);
  const collapsedCount = currentGerenteModule === "all"
    ? 0
    : (currentGerenteModule === "none" ? keys.length : keys.length - 1);

  const countLabel = document.getElementById("gerente-corner-style-count-label");
  if (countLabel) {
    countLabel.innerText = `GR&#193;FICAS (${collapsedCount}/${keys.length})`;
  }
}

function collapseAllGerenteModules() {
  currentGerenteModule = "none";
  gerenteViewMode = "focus";

  document.querySelectorAll(".app-tile").forEach(tile => {
    tile.classList.remove("active", "ring-2", "ring-cyan-400", "bg-slate-800", "scale-105");
  });

  GERENTE_MODULES.forEach(modId => {
    const el = document.getElementById(modId);
    if (el) el.classList.add("hidden");
  });

  const banner = document.getElementById("active-module-banner");
  if (banner) banner.classList.add("hidden");

  const btnAll = document.getElementById("btn-gerente-mode-all");
  const btnFocus = document.getElementById("btn-gerente-mode-focus");
  if (btnFocus) btnFocus.className = "px-2.5 py-1 rounded-lg bg-cyan-500 text-slate-950 text-[11px] font-bold flex items-center gap-1 transition shadow cursor-pointer";
  if (btnAll) btnAll.className = "px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer";

  const masterBtnLabel = document.getElementById("label-toggle-all-gerente");
  if (masterBtnLabel) masterBtnLabel.innerText = "Expandir Todo";

  renderCollapsedTablesCornerDock();
}

function ensureModuleInnerContentExpanded(moduleKey) {
  const map = {
    "diaria": [{ content: "gerente-content-produccion-diaria", icon: "icon-toggle-gerente-diaria", label: "label-toggle-gerente-diaria" }],
    "metas": [{ content: "gerente-content-metas", icon: "icon-toggle-gerente-metas", label: "label-toggle-gerente-metas" }],
    "turnos": [{ content: "gerente-content-turnos", icon: "icon-toggle-gerente-turnos", label: "label-toggle-gerente-turnos" }],
    "modelos": [{ content: "gerente-content-modelos-donut", icon: "icon-toggle-gerente-donut", label: "label-toggle-gerente-donut" }],
    "personal": [{ content: "defectos-content-motivos", icon: "icon-toggle-defectos-motivos", label: "label-toggle-defectos-motivos" }],
    "naves": [{ content: "gerente-content-areas-bar", icon: "icon-toggle-gerente-naves", label: "label-toggle-gerente-naves" }],
    "calidad": [
      { content: "gerente-content-kpis", icon: "icon-toggle-gerente-kpis", label: "label-toggle-gerente-kpis" },
      { content: "gerente-content-estatus-pie", icon: "icon-toggle-gerente-estatus", label: "label-toggle-gerente-estatus" }
    ],
    "defectos": [
      { content: "defectos-content-filtros", icon: "icon-toggle-defectos-filtros", label: "label-toggle-defectos-filtros" },
      { content: "defectos-content-kpis", icon: "icon-toggle-defectos-kpis", label: "label-toggle-defectos-kpis" },
      { content: "defectos-content-turnos", icon: "icon-toggle-defectos-turnos", label: "label-toggle-defectos-turnos" },
      { content: "defectos-content-areas-bar", icon: "icon-toggle-defectos-areas", label: "label-toggle-defectos-areas" },
      { content: "defectos-content-donut", icon: "icon-toggle-defectos-donut", label: "label-toggle-defectos-donut" },
      { content: "defectos-content-modelos-bar", icon: "icon-toggle-defectos-modelos", label: "label-toggle-defectos-modelos" },
      { content: "defectos-content-tendencia-bar", icon: "icon-toggle-defectos-tendencia", label: "label-toggle-defectos-tendencia" },
      { content: "defectos-content-tabla", icon: "icon-toggle-defectos-tabla", label: "label-toggle-defectos-tabla" }
    ]
  };
  const targets = map[moduleKey] || [];
  targets.forEach(t => {
    const c = document.getElementById(t.content);
    const ic = document.getElementById(t.icon);
    const lb = document.getElementById(t.label);
    if (c && c.classList.contains("hidden")) {
      c.classList.remove("hidden");
      if (ic) { ic.classList.remove("fa-chevron-down"); ic.classList.add("fa-chevron-up"); }
      if (lb) lb.innerText = "Contraer";
    }
  });
}

function navigateToModule(moduleKey, forceOpen = false) {
  if (moduleKey === "none") {
    collapseAllGerenteModules();
    return;
  }

  // Si el usuario pulsa el icono de una tabla que ya está abierta (y no es forceOpen), se contrae de vuelta a la esquina
  if (!forceOpen && moduleKey !== "all" && currentGerenteModule === moduleKey && gerenteViewMode === "focus") {
    collapseAllGerenteModules();
    return;
  }

  currentGerenteModule = moduleKey;

  // Actualizar estilos activos de los iconos
  document.querySelectorAll(".app-tile").forEach(tile => {
    tile.classList.remove("active", "ring-2", "ring-cyan-400", "bg-slate-800", "scale-105");
  });

  const selectedTile = document.getElementById(`tile-nav-${moduleKey}`);
  if (selectedTile) {
    selectedTile.classList.add("active", "ring-2", "ring-cyan-400", "bg-slate-800", "scale-105");
  }

  const banner = document.getElementById("active-module-banner");
  const bannerTitle = document.getElementById("active-module-title");
  const bannerDesc = document.getElementById("active-module-desc");
  const bannerIcon = document.getElementById("active-module-icon");

  if (moduleKey === "all") {
    gerenteViewMode = "all";
    GERENTE_MODULES.forEach(modId => {
      const el = document.getElementById(modId);
      if (el) el.classList.remove("hidden");
    });
    Object.keys(GERENTE_MODULE_INFO).forEach(k => ensureModuleInnerContentExpanded(k));
    if (banner) banner.classList.add("hidden");

    const btnAll = document.getElementById("btn-gerente-mode-all");
    const btnFocus = document.getElementById("btn-gerente-mode-focus");
    if (btnAll) btnAll.className = "px-2.5 py-1 rounded-lg bg-cyan-500 text-slate-950 text-[11px] font-bold flex items-center gap-1 transition shadow cursor-pointer";
    if (btnFocus) btnFocus.className = "px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer";

    const masterBtnLabel = document.getElementById("label-toggle-all-gerente");
    if (masterBtnLabel) masterBtnLabel.innerText = "Contraer Todo";
  } else {
    // Al tocar un icono específico: abrir únicamente esa tabla
    gerenteViewMode = "focus";
    ensureModuleInnerContentExpanded(moduleKey);

    const btnAll = document.getElementById("btn-gerente-mode-all");
    const btnFocus = document.getElementById("btn-gerente-mode-focus");
    if (btnFocus) btnFocus.className = "px-2.5 py-1 rounded-lg bg-cyan-500 text-slate-950 text-[11px] font-bold flex items-center gap-1 transition shadow cursor-pointer";
    if (btnAll) btnAll.className = "px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer";

    GERENTE_MODULES.forEach(modId => {
      const el = document.getElementById(modId);
      if (!el) return;
      if (modId === `mod-${moduleKey}`) {
        el.classList.remove("hidden");
        el.classList.add("highlight-target");
        setTimeout(() => el.classList.remove("highlight-target"), 2200);
        try {
          el.scrollIntoView({ behavior: "smooth", block: "nearest" });
        } catch (e) {}
      } else {
        el.classList.add("hidden");
      }
    });

    if (banner && GERENTE_MODULE_INFO[moduleKey]) {
      banner.classList.remove("hidden");
      if (bannerTitle) bannerTitle.innerText = GERENTE_MODULE_INFO[moduleKey].name;
      if (bannerDesc) bannerDesc.innerText = GERENTE_MODULE_INFO[moduleKey].desc;
      if (bannerIcon) bannerIcon.className = GERENTE_MODULE_INFO[moduleKey].icon;

    if (moduleKey === "personal") {
      const defs = (appState.inspecciones || []).filter(i => i.tiene_faltantes === "SI" || i.estatus === "Rechazado" || i.responsable_nombre);
      if (typeof renderChartDefectosMotivos === "function") {
        setTimeout(() => renderChartDefectosMotivos(defs), 60);
      }
      if (typeof renderPersonalRetroalimentacionTable === "function") {
        renderPersonalRetroalimentacionTable(defs);
      }
    }
    }
  }

  renderCollapsedTablesCornerDock();

  // Refrescar y redimensionar gráficas para nitidez absoluta
  setTimeout(() => {
    window.dispatchEvent(new Event("resize"));
    if (appState.chartInstances) {
      Object.values(appState.chartInstances).forEach(chart => {
        if (chart && typeof chart.resize === "function") {
          try { chart.resize(); } catch (e) {}
        }
      });
    }
    if (moduleKey === "dashboard" || moduleKey === "all") {
      if (typeof renderInspectionsTable === "function") renderInspectionsTable();
    }
    if (moduleKey === "defectos" || moduleKey === "all" || moduleKey === "naves" || moduleKey === "modelos") {
      if (typeof renderDefectosTab === "function") renderDefectosTab();
    }
    if (typeof renderGerenteCharts === "function") renderGerenteCharts();
  }, 80);
}

function setGerenteViewMode(mode) {
  if (mode === "all") {
    navigateToModule("all", true);
  } else {
    collapseAllGerenteModules();
  }
}

// ==================== TABS DE NAVEGACIÓN UNIFICADA ====================
function switchTab(tabId) {
  let targetTab = tabId;
  let targetModule = null;

  if (tabId === "dashboard") {
    targetTab = "gerente";
    targetModule = "dashboard";
  } else if (tabId === "defectos") {
    targetTab = "gerente";
    targetModule = "defectos";
  } else if (tabId === "control" || tabId === "gerente") {
    targetTab = "gerente";
  }

  // Restricción para Supervisor de L&#237;nea: solo ve Dashboard, Producci&#243;n y Defectos + LINEAS QUE REQUIEREN QG + MAPA
  if (appState.currentUser && appState.currentUser.rol === "supervisor_linea") {
    if (targetTab !== "gerente" && targetTab !== "cabinas" && targetTab !== "mapa") {
      targetTab = "gerente";
    }
  }

  // Restricción para Gerente: no realiza inspecciones operativas en piso
  if (appState.currentUser && appState.currentUser.rol === "gerente") {
    if (targetTab === "nueva" || targetTab === "traspaso") {
      alert("⚠️ El perfil de Gerente es exclusivo para seguimiento ejecutivo, análisis de producción y gráficas.\nNo realiza inspecciones operativas en piso.");
      switchTab("gerente");
      return;
    }
  }

  document.querySelectorAll(".tab-content").forEach(el => el.classList.add("hidden"));
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.classList.remove("active");
  });

  const activeContent = document.getElementById(`tab-${targetTab}`);
  const activeBtn = document.getElementById(`tab-btn-${targetTab}`);

  if (activeContent) activeContent.classList.remove("hidden");
  if (activeBtn) {
    activeBtn.classList.add("active");
  }

  // Garantizar que las pestañas operativas queden siempre ocultas según rol
  applyRoleTabVisibility();

  if (targetTab === "mapa") {
    if (typeof renderPlantMaps === "function") renderPlantMaps();
  } else if (targetTab === "traspaso") {
    renderTraspasoList();
  } else if (targetTab === "auditoria") {
    renderAuditTable();
  } else if (targetTab === "cabinas") {
    if (typeof applyQGModalRoleVisibility === "function") applyQGModalRoleVisibility();
    if (typeof isCurrentUserQGOnly === "function" && isCurrentUserQGOnly()) {
      cambiarSeccionModalQG("lista");
    }
    if (appState.currentUser && appState.currentUser.rol === "supervisor_linea" && appState.currentUser.linea) {
      const selLinea = document.getElementById("solicitar-cabina-linea");
      if (selLinea) selLinea.value = appState.currentUser.linea;
      if (typeof handleChangeSupervisorLineaSelect === "function") handleChangeSupervisorLineaSelect();
    }
    if (typeof updateLineFilterButtonsCounts === "function") updateLineFilterButtonsCounts();
    if (typeof renderCabinasCoordinadorList === "function") renderCabinasCoordinadorList(currentCabinasFilter);
  } else if (targetTab === "gerente") {
    if (typeof renderInspectionsTable === "function") renderInspectionsTable();
    if (typeof updateKPIs === "function") updateKPIs();
    if (typeof updateOperatorShiftBanner === "function") updateOperatorShiftBanner();
    if (typeof renderGerenteCharts === "function") renderGerenteCharts();
    if (typeof renderDefectosTab === "function") renderDefectosTab();

    if (targetModule) {
      navigateToModule(targetModule, true);
    } else if (currentGerenteModule === "none") {
      collapseAllGerenteModules();
    } else {
      renderCollapsedTablesCornerDock();
    }
  }

  try {
    localStorage.setItem("auditum_active_tab", targetTab);
  } catch (e) {}
}

// ==================== PRESENCIA EN TIEMPO REAL (COORDINADORES Y EQUIPO EN PISO) ====================
let presenceInterval = null;
let currentPresenceFilter = 'coordinadores';

function togglePresenceDropdown() {
  const dd = document.getElementById("presence-dropdown");
  if (!dd) return;
  const isOpening = dd.classList.contains("hidden");
  dd.classList.toggle("hidden");
  if (isOpening) {
    renderPresenceDropdown(appState.presenceUsers || []);
    fetchOnlineUsers();
  }
}

function setPresenceFilter(filter) {
  currentPresenceFilter = filter;
  ['coordinadores', 'todos', 'activos'].forEach(f => {
    const btn = document.getElementById(`presence-tab-${f}`);
    if (btn) {
      if (f === filter) {
        btn.className = "py-1 px-1.5 rounded-lg bg-emerald-500/25 text-emerald-300 border border-emerald-500/50 font-black shadow-sm transition flex items-center justify-center gap-1";
      } else {
        btn.className = "py-1 px-1.5 rounded-lg hover:bg-slate-800 text-slate-400 transition flex items-center justify-center gap-1 font-bold";
      }
    }
  });
  renderPresenceDropdown(appState.presenceUsers || []);
}

function toggleMyPauseStatus() {
  if (appState.myPresenceStatus === "activo") {
    appState.myPresenceStatus = "pausa";
    if (typeof inspectionTimer !== "undefined" && inspectionTimer && inspectionTimer.isRunning) {
      toggleInspectionTimer();
    }
  } else {
    appState.myPresenceStatus = "activo";
  }
  sendPresenceHeartbeat();
  updateMyPauseButtonUI();
  renderPresenceDropdown(appState.presenceUsers || []);
}

function updateMyPauseButtonUI() {
  const btn = document.getElementById("btn-my-pause-toggle");
  if (!btn) return;
  if (appState.myPresenceStatus === "pausa") {
    btn.innerHTML = '<i class="fa-solid fa-play text-emerald-400 mr-1"></i> Reanudar Turno';
    btn.className = "text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-900/70 hover:bg-emerald-800 text-emerald-300 border border-emerald-500/50 shadow transition flex items-center gap-1";
  } else {
    btn.innerHTML = '<i class="fa-solid fa-pause text-amber-400 mr-1"></i> Poner en Pausa';
    btn.className = "text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 transition flex items-center gap-1";
  }
  updatePresenceHeaderDot();
}

function updatePresenceHeaderDot() {
  const dot = document.getElementById("presence-main-dot");
  if (!dot) return;
  if (appState.myPresenceStatus === "activo") {
    dot.className = "w-3 h-3 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]";
  } else if (appState.myPresenceStatus === "pausa") {
    dot.className = "w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]";
  } else {
    dot.className = "w-3 h-3 rounded-full bg-slate-700 border border-slate-500";
  }
}

function startPresenceLoop() {
  if (presenceInterval) clearInterval(presenceInterval);
  renderPresenceDropdown(appState.presenceUsers || []);
  sendPresenceHeartbeat();
  fetchOnlineUsers();
  presenceInterval = setInterval(() => {
    sendPresenceHeartbeat();
    fetchOnlineUsers();
  }, 4000);
}

async function sendPresenceHeartbeat() {
  if (!appState.currentUser) return;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    await fetch("/api/presence/heartbeat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        nomina: appState.currentUser.nomina,
        nombre: appState.currentUser.nombre,
        rol: appState.currentUser.rol,
        turno: appState.currentUser.turno,
        status: appState.myPresenceStatus || "activo"
      })
    });
    clearTimeout(timeoutId);
  } catch(e) {
    // Fallback silencioso
  }
}

async function fetchOnlineUsers() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const res = await fetch("/api/presence/users", { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      let users = data.users;
      if (users && !Array.isArray(users)) {
        users = [users];
      }
      if (Array.isArray(users)) {
        appState.presenceUsers = users;
        renderPresenceDropdown(users);
        return;
      }
    }
  } catch(e) {}
  renderPresenceDropdownFallback();
}

function renderPresenceDropdownFallback() {
  renderPresenceDropdown(appState.presenceUsers || []);
}

function buildUserPresenceCard(u) {
  const card = document.createElement("div");
  const isMe = !!u.isMe;
  card.className = "p-2 rounded-xl border transition shadow-sm " +
    (isMe 
      ? "bg-blue-950/40 border-cyan-500/70 shadow-cyan-500/10" 
      : u.status === "activo"
        ? "bg-slate-900/90 border-emerald-500/40 hover:border-emerald-400"
        : u.status === "pausa"
          ? "bg-slate-900/80 border-red-500/40 hover:border-red-400"
          : "bg-slate-900/60 border-slate-800 hover:border-slate-700");

  let dotHtml = "";
  let badgeHtml = "";
  if (u.status === "activo") {
    dotHtml = '<span class="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399] inline-block flex-shrink-0" title="Activo en Piso"></span>';
    badgeHtml = '<span class="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> EN LINEA</span>';
  } else if (u.status === "pausa") {
    dotHtml = '<span class="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444] inline-block flex-shrink-0" title="En Pausa de Turno"></span>';
    badgeHtml = '<span class="px-2 py-0.5 rounded-full text-[9px] font-black bg-red-500/20 text-red-300 border border-red-500/50 flex items-center gap-1"><i class="fa-solid fa-pause text-[8px]"></i> EN PAUSA</span>';
  } else {
    dotHtml = '<span class="w-3 h-3 rounded-full bg-slate-700 border border-slate-500 inline-block flex-shrink-0" title="Desconectado / Fuera de Turno"></span>';
    badgeHtml = '<span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-800 text-slate-400 border border-slate-700">DESCONECTADO</span>';
  }

  const roleLabel = u.isCoordinador 
    ? '<span class="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-extrabold text-[9px] border border-emerald-500/40">QG Calidad</span>' 
    : u.rol === "supervisor_linea"
      ? '<span class="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold text-[9px] border border-amber-500/40">Sup. ' + (u.linea || 'Linea') + '</span>'
      : '<span class="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-bold text-[9px] border border-purple-500/40">' + u.rol + '</span>';

  const cleanName = (u.nombre || "").replace(/\s*\((Coordinador\s*\/\s*QG|Supervisor.*?)\)/gi, "").trim();
  const turnoLabel = u.turno ? (u.turno.includes("(") ? u.turno.split("(")[0].trim() : u.turno) : "Turno 1";

  card.innerHTML = `
    <div class="flex items-center justify-between gap-2">
      <div class="flex items-center gap-2 truncate">
        ${dotHtml}
        <div class="truncate">
          <div class="font-extrabold text-white text-xs truncate flex items-center gap-1.5">
            <span>${cleanName}</span>
            ${isMe ? '<span class="px-1.5 py-0.2 rounded bg-blue-500 text-white text-[9px] font-black tracking-wider">TU</span>' : ''}
          </div>
          <div class="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
            <span>Nom. #${u.nomina}</span>
            <span>&bull;</span>
            ${roleLabel}
          </div>
        </div>
      </div>
      <div class="flex flex-col items-end flex-shrink-0 gap-1">
        ${badgeHtml}
        <span class="text-[9px] text-amber-300 font-mono font-bold flex items-center gap-1">
          <i class="fa-regular fa-clock text-[9px] text-amber-400"></i> ${turnoLabel}
        </span>
      </div>
    </div>
  `;
  return card;
}
function renderPresenceDropdown(activeServerUsers) {
  const container = document.getElementById("presence-users-list");
  const countLabel = document.getElementById("presence-count-label");
  if (!container) return;

  const serverMap = {};
  (activeServerUsers || []).forEach(u => { 
    if (u && u.nomina) serverMap[u.nomina] = u; 
  });

  const baseUsers = (appState.usuarios && appState.usuarios.length) ? appState.usuarios : (typeof DEFAULT_USUARIOS !== 'undefined' ? DEFAULT_USUARIOS : []);

  const allUsers = baseUsers.map(u => {
    const serv = serverMap[u.nomina];
    const isMe = !!(appState.currentUser && appState.currentUser.nomina == u.nomina);
    let status = "desconectado";

    if (isMe) {
      status = appState.myPresenceStatus || "activo";
    } else if (serv) {
      status = serv.status;
    }

    const isCoord = (u.rol === "colaborador") || 
      (u.nombre && (u.nombre.includes("Coordinador") || u.nombre.includes("QG")));

    return {
      nomina: u.nomina,
      nombre: u.nombre,
      rol: u.rol,
      linea: u.linea || "",
      turno: u.turno || "Turno 1",
      status: status,
      isMe: isMe,
      isCoordinador: isCoord
    };
  });

  const coordinadores = allUsers.filter(u => u.isCoordinador);
  const supervisores = allUsers.filter(u => !u.isCoordinador);

  const activosCount = allUsers.filter(u => u.status === "activo").length;
  const pausaCount = allUsers.filter(u => u.status === "pausa").length;
  const activeCoordCount = coordinadores.filter(u => u.status === "activo").length;

  if (countLabel) {
    countLabel.innerText = activosCount + " Activo" + (activosCount !== 1 ? 's' : '') + (pausaCount > 0 ? ' (' + pausaCount + ' en pausa)' : '');
  }

  // Actualizar contadores de las pestaÑas internas
  const tabCoord = document.getElementById("presence-tab-coordinadores");
  const tabTodos = document.getElementById("presence-tab-todos");
  const tabActivos = document.getElementById("presence-tab-activos");
  if (tabCoord) tabCoord.innerHTML = '<i class="fa-solid fa-shield-halved text-[10px]"></i> QG Calidad (' + coordinadores.length + ')';
  if (tabTodos) tabTodos.innerHTML = '<i class="fa-solid fa-users text-[10px]"></i> Todos (' + allUsers.length + ')';
  if (tabActivos) tabActivos.innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span> Activos (' + (activosCount + pausaCount) + ')';

  container.innerHTML = "";

  // Ordenar por estatus: activo primero, luego pausa, luego desconectado
  const sortByStatus = (list) => {
    const order = { "activo": 1, "pausa": 2, "desconectado": 3 };
    return [...list].sort((a, b) => {
      if (a.isMe && !b.isMe) return -1;
      if (!a.isMe && b.isMe) return 1;
      return (order[a.status] || 4) - (order[b.status] || 4);
    });
  };

  if (currentPresenceFilter === "coordinadores") {
    // Encabezado de SecciÓn Coordinadores
    const secHeader = document.createElement("div");
    secHeader.className = "flex items-center justify-between px-1 pb-1 border-b border-slate-800 text-[11px] font-black uppercase text-cyan-400";
    secHeader.innerHTML = `
      <span class="flex items-center gap-1.5 text-emerald-400">
        <i class="fa-solid fa-shield-halved text-cyan-400"></i> Coordinadores QG de Calidad
      </span>
      <span class="text-[10px] text-slate-400 font-mono">${activeCoordCount} de ${coordinadores.length} en piso</span>
    `;
    container.appendChild(secHeader);

    const sortedCoord = sortByStatus(coordinadores);
    sortedCoord.forEach(u => {
      container.appendChild(buildUserPresenceCard(u));
    });
  } else if (currentPresenceFilter === "activos") {
    const activeList = sortByStatus(allUsers.filter(u => u.status === "activo" || u.status === "pausa"));
    if (activeList.length === 0) {
      container.innerHTML = '<div class="p-4 text-center text-xs text-slate-400 font-bold bg-slate-950/60 rounded-xl border border-slate-800">No hay otros colaboradores en piso activos actualmente.</div>';
    } else {
      activeList.forEach(u => {
        container.appendChild(buildUserPresenceCard(u));
      });
    }
  } else {
    // Mostrar Todos (SecciÓn Coordinadores y SecciÓn Supervisores)
    const secHeader1 = document.createElement("div");
    secHeader1.className = "flex items-center justify-between px-1 pb-1 border-b border-slate-800 text-[11px] font-black uppercase text-cyan-400";
    secHeader1.innerHTML = `
      <span class="flex items-center gap-1.5 text-emerald-400">
        <i class="fa-solid fa-shield-halved text-cyan-400"></i> Coordinadores QG (${coordinadores.length})
      </span>
      <span class="text-[10px] text-slate-400 font-mono">${activeCoordCount} en piso</span>
    `;
    container.appendChild(secHeader1);

    sortByStatus(coordinadores).forEach(u => {
      container.appendChild(buildUserPresenceCard(u));
    });

    const secHeader2 = document.createElement("div");
    secHeader2.className = "flex items-center justify-between px-1 pt-2 pb-1 border-b border-slate-800 text-[11px] font-black uppercase text-amber-400";
    secHeader2.innerHTML = `
      <span class="flex items-center gap-1.5 text-amber-300">
        <i class="fa-solid fa-industry text-amber-400"></i> Supervisores de L&#237;nea (${supervisores.length})
      </span>
      <span class="text-[10px] text-slate-400 font-mono">${supervisores.filter(s => s.status === 'activo').length} en piso</span>
    `;
    container.appendChild(secHeader2);

    sortByStatus(supervisores).forEach(u => {
      container.appendChild(buildUserPresenceCard(u));
    });
  }

  updateMyPauseButtonUI();
}
// ==================== PERFIL GERENCIAL Y GR&#193;FICAS DE AVANCE ====================
function openDatePicker(inputId) {
  const el = document.getElementById(inputId);
  if (el) {
    if (typeof el.showPicker === "function") {
      try {
        el.showPicker();
      } catch(e) {
        el.focus();
      }
    } else {
      el.focus();
    }
  }
}

function formatYMD(d) {
  if (!d) return "";
  const yr = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const dy = String(d.getDate()).padStart(2, "0");
  return `${yr}-${mo}-${dy}`;
}

// SincronizaciÃ³n universal de Filtro de Ãrea en TODOS los cuadros y mÃ³dulos
function syncModuleAreaFilter(selectedArea) {
  const areaSelectIds = [
    "gerente-filter-area",
    "dash-filter-area",
    "defectos-filter-area",
    "diaria-filter-area",
    "metas-filter-area",
    "turnos-filter-area",
    "modelos-filter-area",
    "naves-filter-area",
    "calidad-filter-area",
    "personal-filter-area"
  ];

  areaSelectIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      if (selectedArea === "all" || !selectedArea) {
        el.value = el.querySelector('option[value="all"]') ? "all" : "";
      } else {
        el.value = selectedArea;
      }
    }
  });

  // 1. Actualizar grÃ¡ficas gerenciales con el filtro de Ã¡rea
  if (typeof renderGerenteCharts === "function") {
    renderGerenteCharts();
  }

  // 2. Actualizar tabla del Dashboard
  if (typeof applyFilters === "function") {
    applyFilters();
  }

  // 3. Actualizar pestaÃ±a de Defectos y Personal
  if (typeof renderDefectosTab === "function") {
    renderDefectosTab();
  }
}

function handleGerenteDateFilterChange() {
  const selPeriodo = document.getElementById("gerente-filter-periodo");
  const dInicio = document.getElementById("gerente-fecha-inicio")?.value;
  const dFin = document.getElementById("gerente-fecha-fin")?.value;
  const selTurnoVal = document.getElementById("gerente-filter-turno")?.value || "all";

  if (selPeriodo && (dInicio || dFin)) {
    selPeriodo.value = "custom";
  }

  // Si se filtra por un turno específico arriba (Turno 1, Turno 2 o Turno 3) y el usuario no es un QG bloqueado, seleccionar automáticamente al QG de ese turno
  if (selTurnoVal !== "all" && !(appState.currentUser && appState.currentUser.rol === "colaborador")) {
    const selQgReport = document.getElementById("dash-pdf-operator-select");
    const qgUsers = getAvailableQGUsersForReport();
    const matchingQG = qgUsers.find(u => getTurnoConfigByName(u.turno).key === selTurnoVal);
    if (selQgReport && matchingQG) {
      selQgReport.value = String(matchingQG.nomina);
    }
  }

  if (typeof updateOperatorShiftBanner === "function") {
    updateOperatorShiftBanner();
  }

  // Actualizar notificaciones del panel lateral según usuario activo
  if (typeof renderSidebarNotificaciones === "function") {
    renderSidebarNotificaciones();
  }
  renderGerenteCharts();
}

function handleGerentePresetPeriodChange() {
  const preset = document.getElementById("gerente-filter-periodo")?.value || "all";
  const inInicio = document.getElementById("gerente-fecha-inicio");
  const inFin = document.getElementById("gerente-fecha-fin");

  const today = new Date();

  if (preset === "all") {
    if (inInicio) inInicio.value = "";
    if (inFin) inFin.value = "";
  } else if (preset === "today") {
    const todayStr = formatYMD(today);
    if (inInicio) inInicio.value = todayStr;
    if (inFin) inFin.value = todayStr;
  } else if (preset === "7days") {
    const past7 = new Date(today);
    past7.setDate(today.getDate() - 7);
    if (inInicio) inInicio.value = formatYMD(past7);
    if (inFin) inFin.value = formatYMD(today);
  } else if (preset === "14days") {
    const past14 = new Date(today);
    past14.setDate(today.getDate() - 14);
    if (inInicio) inInicio.value = formatYMD(past14);
    if (inFin) inFin.value = formatYMD(today);
  } else if (preset === "30days") {
    const past30 = new Date(today);
    past30.setDate(today.getDate() - 30);
    if (inInicio) inInicio.value = formatYMD(past30);
    if (inFin) inFin.value = formatYMD(today);
  }

  if (typeof updateOperatorShiftBanner === "function") {
    updateOperatorShiftBanner();
  }

  // Actualizar notificaciones del panel lateral según usuario activo
  if (typeof renderSidebarNotificaciones === "function") {
    renderSidebarNotificaciones();
  }
  renderGerenteCharts();
}

function resetGerenteDateFilter() {
  const inInicio = document.getElementById("gerente-fecha-inicio");
  const inFin = document.getElementById("gerente-fecha-fin");
  const selPeriodo = document.getElementById("gerente-filter-periodo");
  const selTurno = document.getElementById("gerente-filter-turno");

  if (inInicio) inInicio.value = "";
  if (inFin) inFin.value = "";
  if (selPeriodo) selPeriodo.value = "all";
  if (selTurno) selTurno.value = "all";

  if (typeof updateOperatorShiftBanner === "function") {
    updateOperatorShiftBanner();
  }

  // Actualizar notificaciones del panel lateral según usuario activo
  if (typeof renderSidebarNotificaciones === "function") {
    renderSidebarNotificaciones();
  }
  renderGerenteCharts();
}

// ==================== CALENDARIO LABORAL (LUNES A SÁBADO) ====================
const DIAS_LABORALES_CONFIG = [
  { dayNum: 1, nombre: "LUNES", corto: "LUN", defaultFecha: "2026-10-05" },
  { dayNum: 2, nombre: "MARTES", corto: "MAR", defaultFecha: "2026-10-06" },
  { dayNum: 3, nombre: "MIÉRCOLES", corto: "MIÉ", defaultFecha: "2026-10-07" },
  { dayNum: 4, nombre: "JUEVES", corto: "JUE", defaultFecha: "2026-10-08" },
  { dayNum: 5, nombre: "VIERNES", corto: "VIE", defaultFecha: "2026-10-09" },
  { dayNum: 6, nombre: "SÁBADO", corto: "SÁB", defaultFecha: "2026-10-10" }
];

// ==================== CONFIGURACIÓN Y ASIGNACIÓN DE TURNOS ====================
const TURNOS_CONFIG = [
  { key: "Turno 1", nombre: "Turno 1 (Matutino)", horario: "06:00 - 14:00", nomina: 1042, responsable: "Juan Pérez Martínez", color: "#0ea5e9", colorBorder: "#38bdf8", colorBg: "rgba(14, 165, 233, 0.85)" },
  { key: "Turno 2", nombre: "Turno 2 (Vespertino)", horario: "14:00 - 21:30", nomina: 1150, responsable: "Miguel Ángel Rojas", color: "#f59e0b", colorBorder: "#fbbf24", colorBg: "rgba(245, 158, 11, 0.85)" },
  { key: "Turno 3", nombre: "Turno 3 (Nocturno)", horario: "21:30 - 06:00", nomina: 1210, responsable: "Luis Fernando Torres", color: "#a855f7", colorBorder: "#c084fc", colorBg: "rgba(168, 85, 247, 0.85)" }
];

function getTurnoKey(item) {
  if (!item) return "Turno 1";
  if (item.turnos && item.turnos.length > 0 && item.turnos[0].turno) {
    const t = String(item.turnos[0].turno);
    if (t.includes("3") || t.toLowerCase().includes("nocturno")) return "Turno 3";
    if (t.includes("2") || t.toLowerCase().includes("vespertino")) return "Turno 2";
    if (t.includes("1") || t.toLowerCase().includes("matutino")) return "Turno 1";
  }
  const nom = parseInt(item.nomina_creador) || 0;
  if (nom === 1210) return "Turno 3";
  if (nom === 1150) return "Turno 2";
  return "Turno 1";
}

function getTurnoBadgeHtml(turnoKey) {
  if (turnoKey === "Turno 3") {
    return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 whitespace-nowrap"><i class="fa-solid fa-moon text-purple-400"></i>Turno 3 (Nocturno)</span>`;
  }
  if (turnoKey === "Turno 2") {
    return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 whitespace-nowrap"><i class="fa-solid fa-cloud-sun text-amber-400"></i>Turno 2 (Vespertino)</span>`;
  }
  return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 whitespace-nowrap"><i class="fa-solid fa-sun text-sky-400"></i>Turno 1 (Matutino)</span>`;
}

function isDiaLaboral(fechaStr) {
  if (!fechaStr) return true;
  const dStr = fechaStr.split(" ")[0];
  const parts = dStr.split("-");
  if (parts.length < 3) return true;
  const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  // 0 = Domingo (No laboral). Lunes a Sábado son días 1 al 6.
  return d.getDay() !== 0;
}

function getNombreDiaSemana(fechaStr, formato = "corto") {
  if (!fechaStr) return "";
  const dStr = fechaStr.split(" ")[0];
  const parts = dStr.split("-");
  if (parts.length < 3) return fechaStr;
  const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  const diasCortos = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const diasLargos = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const diasMayus = ["DOMINGO", "LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES", "SÁBADO"];
  if (formato === "mayusculas") return diasMayus[d.getDay()];
  return formato === "largo" ? diasLargos[d.getDay()] : diasCortos[d.getDay()];
}

function renderGerenteCharts() {
  if (typeof Chart === "undefined") {
    console.warn("Chart.js no está cargado aún");
    return;
  }

  const fechaInicio = document.getElementById("gerente-fecha-inicio")?.value || "";
  const fechaFin = document.getElementById("gerente-fecha-fin")?.value || "";
  const periodoEl = document.getElementById("gerente-filter-periodo");
  const periodo = periodoEl ? periodoEl.value : "all";
  const filterTurno = document.getElementById("gerente-filter-turno")?.value || "all";
  const filterAreaVal = document.getElementById("gerente-filter-area")?.value || document.getElementById("dash-filter-area")?.value || "all";
  let items = [...appState.inspecciones];

  // 1. Filtrado prioritario por Rango de Fechas del Calendario
  if (fechaInicio || fechaFin) {
    items = items.filter(i => {
      const f = (i.fecha_creacion || "").split(" ")[0];
      if (!f) return false;
      if (fechaInicio && f < fechaInicio) return false;
      if (fechaFin && f > fechaFin) return false;
      return true;
    });
  } else if (periodo !== "all" && periodo !== "custom") {
    // 2. Filtrado por per&#237;odo preestablecido
    const days = periodo === "today" ? 1 : (parseInt(periodo.replace("days", "")) || 7);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const yr = cutoff.getFullYear();
    const mo = String(cutoff.getMonth() + 1).padStart(2, "0");
    const dy = String(cutoff.getDate()).padStart(2, "0");
    const cutoffStr = `${yr}-${mo}-${dy}`;
    items = items.filter(i => {
      const f = (i.fecha_creacion || "").split(" ")[0];
      return f && f >= cutoffStr;
    });
  }

  // M&#233;tricas globales de turno en el per&#237;odo (antes del filtro específico de turno para mantener visión integral)
    // Filtrar todos los cuadros gerenciales por Ãrea (SOLDADURA, PINTURA, ENSAMBLE, FOS)
  if (filterAreaVal && filterAreaVal !== "all") {
    items = items.filter(i => matchItemArea(i, filterAreaVal));
  }

  const allInPeriod = [...items];
  const countT1 = allInPeriod.filter(i => getTurnoKey(i) === "Turno 1").length;
  const countT2 = allInPeriod.filter(i => getTurnoKey(i) === "Turno 2").length;
  const countT3 = allInPeriod.filter(i => getTurnoKey(i) === "Turno 3").length;
  const totalPeriod = allInPeriod.length;

  const pctT1 = totalPeriod > 0 ? Math.round((countT1 / totalPeriod) * 100) : 0;
  const pctT2 = totalPeriod > 0 ? Math.round((countT2 / totalPeriod) * 100) : 0;
  const pctT3 = totalPeriod > 0 ? Math.round((countT3 / totalPeriod) * 100) : 0;

  const libT1 = allInPeriod.filter(i => getTurnoKey(i) === "Turno 1" && i.estatus === "Liberado").length;
  const libT2 = allInPeriod.filter(i => getTurnoKey(i) === "Turno 2" && i.estatus === "Liberado").length;
  const libT3 = allInPeriod.filter(i => getTurnoKey(i) === "Turno 3" && i.estatus === "Liberado").length;

  // Actualizar Tarjetas KPI de Turno en el DOM
  const elT1Qty = document.getElementById("gerente-kpi-t1-qty");
  const elT1Pct = document.getElementById("gerente-kpi-t1-pct");
  const elT1Stat = document.getElementById("gerente-kpi-t1-status");
  if (elT1Qty) elT1Qty.innerHTML = `${countT1} <span class="text-xs font-normal text-slate-400">pieza${countT1 !== 1 ? 's' : ''}</span>`;
  if (elT1Pct) elT1Pct.innerText = `${pctT1}% del total`;
  if (elT1Stat) elT1Stat.innerText = `${libT1} Lib. / ${countT1 - libT1} Pend.`;

  const elT2Qty = document.getElementById("gerente-kpi-t2-qty");
  const elT2Pct = document.getElementById("gerente-kpi-t2-pct");
  const elT2Stat = document.getElementById("gerente-kpi-t2-status");
  if (elT2Qty) elT2Qty.innerHTML = `${countT2} <span class="text-xs font-normal text-slate-400">pieza${countT2 !== 1 ? 's' : ''}</span>`;
  if (elT2Pct) elT2Pct.innerText = `${pctT2}% del total`;
  if (elT2Stat) elT2Stat.innerText = `${libT2} Lib. / ${countT2 - libT2} Pend.`;

  const elT3Qty = document.getElementById("gerente-kpi-t3-qty");
  const elT3Pct = document.getElementById("gerente-kpi-t3-pct");
  const elT3Stat = document.getElementById("gerente-kpi-t3-status");
  if (elT3Qty) elT3Qty.innerHTML = `${countT3} <span class="text-xs font-normal text-slate-400">pieza${countT3 !== 1 ? 's' : ''}</span>`;
  if (elT3Pct) elT3Pct.innerText = `${pctT3}% del total`;
  if (elT3Stat) elT3Stat.innerText = `${libT3} Lib. / ${countT3 - libT3} Pend.`;

  // Filtrar items si el usuario seleccionó un turno específico
  if (filterTurno !== "all") {
    items = items.filter(i => getTurnoKey(i) === filterTurno);
  }

  // M&#233;tricas y KPIs Ejecutivos
  const total = items.length;
  const liberadas = items.filter(i => i.estatus === "Liberado").length;
  const rechazadas = items.filter(i => i.estatus === "Rechazado").length;
  const faltantes = items.filter(i => i.tiene_faltantes === "SI").length;
  const conformidad = total > 0 ? Math.round(((total - rechazadas) / total) * 100) : 100;

  // Tiempo ciclo promedio
  let totalMin = 0;
  let tramosCount = 0;
  items.forEach(i => {
    (i.turnos || []).forEach(t => {
      const s = parseInt(t.segundos) || 0;
      const m = parseInt(t.minutos) || (s > 0 ? Math.round(s / 60) : 0);
      if (m > 0) {
        totalMin += m;
        tramosCount++;
      }
    });
  });
  const tiempoCicloProm = tramosCount > 0 ? Math.round(totalMin / tramosCount) : 0;

  // =========================================================================
  // SECUENCIA ESTRICTA DE 6 DÍAS LABORALES: LUNES, MARTES, MIÉRCOLES, JUEVES, VIERNES, SÁBADO
  // =========================================================================
  const diasStats = DIAS_LABORALES_CONFIG.map(col => ({
    dayNum: col.dayNum,
    nombre: col.nombre,
    corto: col.corto,
    fecha: col.defaultFecha,
    displayDate: col.defaultFecha ? col.defaultFecha.substring(5).replace("-", "/") : "",
    total: 0,
    t1: 0,
    t2: 0,
    t3: 0,
    liberadas: 0,
    rechazadas: 0,
    enProceso: 0,
    pausadas: 0
  }));

  // Agrupar inspecciones en su día de la semana correspondiente con desglose de turnos
  items.forEach(item => {
    const fStr = (item.fecha_creacion || "").split(" ")[0];
    if (!fStr || !isDiaLaboral(fStr)) return;
    const parts = fStr.split("-");
    if (parts.length < 3) return;
    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    const day = d.getDay(); // 1 = Lunes, ..., 6 = Sábado
    const stat = diasStats.find(s => s.dayNum === day);
    if (stat) {
      stat.total++;
      stat.fecha = fStr;
      stat.displayDate = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;

      const tKey = getTurnoKey(item);
      if (tKey === "Turno 1") stat.t1++;
      else if (tKey === "Turno 2") stat.t2++;
      else if (tKey === "Turno 3") stat.t3++;

      if (item.estatus === "Liberado") stat.liberadas++;
      else if (item.estatus === "Rechazado") stat.rechazadas++;
      else if (item.estatus === "En Proceso") stat.enProceso++;
      else if (item.estatus === "Pausado") stat.pausadas++;
    }
  });

  // Determinar el Día Récord de Producci&#243;n
  let maxDayStat = null;
  let maxQty = 0;
  diasStats.forEach(stat => {
    if (stat.total > maxQty) {
      maxQty = stat.total;
      maxDayStat = stat;
    }
  });

  // Actualizar KPIs en el DOM
  const kpiTotal = document.getElementById("gerente-kpi-total");
  const kpiRecordDia = document.getElementById("gerente-kpi-record-dia");
  const kpiRecordQty = document.getElementById("gerente-kpi-record-qty");
  const kpiConf = document.getElementById("gerente-kpi-conformidad");
  const kpiDef = document.getElementById("gerente-kpi-defectos");
  const kpiTiempo = document.getElementById("gerente-kpi-tiempo-ciclo");

  if (kpiTotal) kpiTotal.innerText = total;
  if (kpiRecordDia) kpiRecordDia.innerText = maxDayStat ? `${maxDayStat.nombre} (${maxDayStat.displayDate})` : "--";
  if (kpiRecordQty) kpiRecordQty.innerText = `${maxQty} pieza${maxQty !== 1 ? 's' : ''}`;
  if (kpiConf) kpiConf.innerText = `${conformidad}%`;
  if (kpiDef) kpiDef.innerText = faltantes + rechazadas;
  if (kpiTiempo) kpiTiempo.innerText = `${tiempoCicloProm} min`;

  // Resumen texto para gráfica de barras
  const barSummary = document.getElementById("gerente-bar-summary-text");
  if (barSummary) {
    let rangoLabel = "";
    if (fechaInicio && fechaFin) {
      rangoLabel = ` <span class="text-amber-300 font-mono text-[11px] font-semibold">(Rango: ${fechaInicio} al ${fechaFin})</span>`;
    } else if (fechaInicio) {
      rangoLabel = ` <span class="text-amber-300 font-mono text-[11px] font-semibold">(Desde: ${fechaInicio})</span>`;
    } else if (fechaFin) {
      rangoLabel = ` <span class="text-amber-300 font-mono text-[11px] font-semibold">(Hasta: ${fechaFin})</span>`;
    }

    const turnoBadgeText = filterTurno !== "all" ? ` <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">${filterTurno}</span>` : "";

    barSummary.innerHTML = maxQty > 0 
      ? `🏆 Día Récord de Producci&#243;n: <strong class="text-amber-400 font-bold">${maxDayStat.nombre} (${maxDayStat.fecha})</strong> con <strong class="text-white">${maxQty} piezas</strong> inspeccionadas (Lunes a Sábado).${turnoBadgeText}${rangoLabel}`
      : `⚠️ Sin inspecciones registradas en el per&#237;odo.${turnoBadgeText}${rangoLabel}`;
  }

  // 0. Renderizar Metas y Cumplimiento de Piezas por L&#237;nea
  renderMetasLineas(items);

  // 1. Gr&#225;fica de Barras Multiturno: Producci&#243;n por Día (Lunes a Sábado)
  renderChartProduccionDiaria(diasStats, maxDayStat, filterTurno);

  // 1.1 Matriz Semanal por Turno (Lunes a Sábado)
  renderTablaProduccionSemanal(diasStats, maxDayStat);

  // 2. Gr&#225;fica de Pastel / Donut: Distribución de 12 Modelos
  renderChartModelosDonut(items);

  // 3. Gr&#225;fica de Pastel: Estatus del Proceso
  renderChartEstatusPie(items);

  // 4. Gr&#225;fica de Barras Multiturno: Producci&#243;n por Área (EDIFICIO K vs FABS)
  renderChartAreasBar(items);

  if (typeof renderCollapsedTablesCornerDock === "function") {
    renderCollapsedTablesCornerDock();
  }
}

function renderChartProduccionDiaria(diasStats, maxDayStat, filterTurno = "all") {
  const ctx = document.getElementById("chart-produccion-diaria");
  if (!ctx) return;

  if (appState.chartInstances.produccionDiaria) {
    appState.chartInstances.produccionDiaria.destroy();
  }

  // Etiquetas con el nombre del día en mayúsculas y fecha abajo: LUNES, MARTES, MIÉRCOLES, JUEVES, VIERNES, SÁBADO
  const formattedLabels = diasStats.map(s => [s.nombre, s.displayDate ? `(${s.displayDate})` : ""]);

  let datasets = [];

  if (filterTurno === "all") {
    // Modo Multiturno Apilado: Muestra qué hizo CADA TURNO cada día (Lunes a Sábado)
    datasets = [
      {
        label: "Turno 1 (Matutino: 06:00 - 14:00)",
        data: diasStats.map(s => s.t1),
        backgroundColor: "#0ea5e9",
        borderColor: "#38bdf8",
        borderWidth: 1.5,
        borderRadius: 4,
        stack: "produccion"
      },
      {
        label: "Turno 2 (Vespertino: 14:00 - 21:30)",
        data: diasStats.map(s => s.t2),
        backgroundColor: "#f59e0b",
        borderColor: "#fbbf24",
        borderWidth: 1.5,
        borderRadius: 4,
        stack: "produccion"
      },
      {
        label: "Turno 3 (Nocturno: 21:30 - 06:00)",
        data: diasStats.map(s => s.t3),
        backgroundColor: "#a855f7",
        borderColor: "#c084fc",
        borderWidth: 1.5,
        borderRadius: 4,
        stack: "produccion"
      }
    ];
  } else {
    // Si se filtró un turno específico, se muestra dicho turno con su color característico
    let color = "#0ea5e9";
    let colorBorder = "#38bdf8";
    if (filterTurno === "Turno 2") { color = "#f59e0b"; colorBorder = "#fbbf24"; }
    else if (filterTurno === "Turno 3") { color = "#a855f7"; colorBorder = "#c084fc"; }

    const data = diasStats.map(s => {
      if (filterTurno === "Turno 1") return s.t1;
      if (filterTurno === "Turno 2") return s.t2;
      return s.t3;
    });

    datasets = [{
      label: `${filterTurno} (Piezas Inspeccionadas)`,
      data: data,
      backgroundColor: color,
      borderColor: colorBorder,
      borderWidth: 1.5,
      borderRadius: 6
    }];
  }

  appState.chartInstances.produccionDiaria = new Chart(ctx, {
    type: "bar",
    data: {
      labels: formattedLabels,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: "top",
          labels: { boxWidth: 12, color: "#cbd5e1", font: { size: 11, weight: "bold" } }
        },
        tooltip: {
          callbacks: {
            title: (tooltipItems) => {
              const idx = tooltipItems[0].dataIndex;
              const s = diasStats[idx];
              return `${s.nombre} • ${s.fecha}`;
            },
            label: (ctx) => {
              return ` ${ctx.dataset.label}: ${ctx.parsed.y} pieza(s)`;
            },
            afterBody: (tooltipItems) => {
              const idx = tooltipItems[0].dataIndex;
              const s = diasStats[idx];
              const isRecord = maxDayStat && s.dayNum === maxDayStat.dayNum && s.total > 0;
              return [
                `─────────────────────────────`,
                `Total Día: ${s.total} pieza(s) ${isRecord ? '🏆 (Día Récord)' : ''}`,
                `• T1 (Matutino): ${s.t1} pza(s)`,
                `• T2 (Vespertino): ${s.t2} pza(s)`,
                `• T3 (Nocturno): ${s.t3} pza(s)`,
                `Liberadas: ${s.liberadas} | En Proc: ${s.enProceso} | Rech: ${s.rechazadas}`
              ];
            }
          }
        }
      },
      scales: {
        x: {
          stacked: true,
          grid: { color: "rgba(51, 65, 85, 0.4)" },
          ticks: { color: "#cbd5e1", font: { size: 11, family: "monospace", weight: "bold" } }
        },
        y: {
          stacked: true,
          beginAtZero: true,
          ticks: { stepSize: 1, color: "#94a3b8", font: { size: 11 } },
          grid: { color: "rgba(51, 65, 85, 0.4)" }
        }
      }
    }
  });
}

function renderTablaProduccionSemanal(diasStats, maxDayStat) {
  const tableBody = document.getElementById("gerente-tabla-semanal-body");
  if (!tableBody) return;

  const grandTotal = diasStats.reduce((sum, s) => sum + s.total, 0);
  const totalT1 = diasStats.reduce((sum, s) => sum + s.t1, 0);
  const totalT2 = diasStats.reduce((sum, s) => sum + s.t2, 0);
  const totalT3 = diasStats.reduce((sum, s) => sum + s.t3, 0);

  let html = "";

  // Fila 1: Turno 1 (Matutino)
  html += `
    <tr class="hover:bg-slate-700/30 transition">
      <td class="py-2 px-2 text-left text-sky-400 font-bold whitespace-nowrap">
        <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
          <i class="fa-solid fa-sun text-sky-400"></i> Turno 1 (06:00 - 14:00)
        </span>
      </td>
  `;
  diasStats.forEach(s => {
    html += `
      <td class="py-2 px-1 text-center font-mono ${s.t1 > 0 ? 'text-sky-300 font-bold' : 'text-slate-500'}">
        ${s.t1} <span class="text-[9px] text-slate-500 font-normal">pza${s.t1 !== 1 ? 's' : ''}</span>
      </td>
    `;
  });
  html += `
      <td class="py-2 px-2 text-right font-mono font-bold text-sky-300 bg-slate-900/80">
        ${totalT1} pzas
      </td>
    </tr>
  `;

  // Fila 2: Turno 2 (Vespertino)
  html += `
    <tr class="hover:bg-slate-700/30 transition">
      <td class="py-2 px-2 text-left text-amber-400 font-bold whitespace-nowrap">
        <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
          <i class="fa-solid fa-cloud-sun text-amber-400"></i> Turno 2 (14:00 - 21:30)
        </span>
      </td>
  `;
  diasStats.forEach(s => {
    html += `
      <td class="py-2 px-1 text-center font-mono ${s.t2 > 0 ? 'text-amber-300 font-bold' : 'text-slate-500'}">
        ${s.t2} <span class="text-[9px] text-slate-500 font-normal">pza${s.t2 !== 1 ? 's' : ''}</span>
      </td>
    `;
  });
  html += `
      <td class="py-2 px-2 text-right font-mono font-bold text-amber-300 bg-slate-900/80">
        ${totalT2} pzas
      </td>
    </tr>
  `;

  // Fila 3: Turno 3 (Nocturno)
  html += `
    <tr class="hover:bg-slate-700/30 transition">
      <td class="py-2 px-2 text-left text-purple-400 font-bold whitespace-nowrap">
        <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
          <i class="fa-solid fa-moon text-purple-400"></i> Turno 3 (21:30 - 06:00)
        </span>
      </td>
  `;
  diasStats.forEach(s => {
    html += `
      <td class="py-2 px-1 text-center font-mono ${s.t3 > 0 ? 'text-purple-300 font-bold' : 'text-slate-500'}">
        ${s.t3} <span class="text-[9px] text-slate-500 font-normal">pza${s.t3 !== 1 ? 's' : ''}</span>
      </td>
    `;
  });
  html += `
      <td class="py-2 px-2 text-right font-mono font-bold text-purple-300 bg-slate-900/80">
        ${totalT3} pzas
      </td>
    </tr>
  `;

  // Fila 4: TOTAL GENERAL DÍA (Lunes a Sábado)
  html += `
    <tr class="bg-slate-900/95 border-t-2 border-slate-700 font-bold">
      <td class="py-2.5 px-2 text-left text-white uppercase tracking-wider font-extrabold flex items-center justify-between">
        <span>TOTAL DÍA</span>
        <span class="text-[10px] text-slate-400 font-normal font-sans">Semana Laboral</span>
      </td>
  `;
  diasStats.forEach(s => {
    const isRecord = maxDayStat && s.dayNum === maxDayStat.dayNum && s.total > 0;
    const cellBg = isRecord ? "bg-amber-500/20 border-b-2 border-amber-500" : "";
    const qtyColor = isRecord ? "text-amber-400 font-black text-sm" : "text-white font-bold text-xs";
    const pct = grandTotal > 0 ? Math.round((s.total / grandTotal) * 100) : 0;

    html += `
      <td class="py-2.5 px-1 text-center ${cellBg}">
        <div class="${qtyColor}">${s.total} <span class="text-[10px] font-normal text-slate-400">pza${s.total !== 1 ? 's' : ''}</span></div>
        <div class="text-[10px] ${isRecord ? 'text-amber-300 font-bold' : 'text-slate-400'} mt-0.5">${pct}% ${isRecord ? '🏆' : ''}</div>
      </td>
    `;
  });
  html += `
      <td class="py-2.5 px-2 text-right text-emerald-400 font-black text-sm bg-slate-950">
        ${grandTotal} pzas
      </td>
    </tr>
  `;

  tableBody.innerHTML = html;
}

// ==================== PLUGIN PARA DIBUJAR PORCENTAJES EN GR&#193;FICAS ====================
const piePercentagePlugin = {
  id: 'piePercentagePlugin',
  afterDatasetsDraw(chart) {
    const { ctx, data } = chart;
    const dataset = data.datasets[0];
    if (!dataset || !dataset.data || dataset.data.length === 0) return;

    const total = dataset.data.reduce((acc, val) => acc + (Number(val) || 0), 0);
    if (total <= 0) return;

    const meta = chart.getDatasetMeta(0);
    if (!meta || !meta.data) return;

    meta.data.forEach((element, index) => {
      const val = dataset.data[index];
      if (!val || val <= 0) return;

      const pct = Math.round((val / total) * 100);
      // Omitir números en rebanadas excesivamente pequeñas (< 4%)
      if (pct < 4) return;

      const center = element.tooltipPosition();
      if (!center || typeof center.x !== 'number' || typeof center.y !== 'number' || isNaN(center.x) || isNaN(center.y)) return;

      ctx.save();
      const text = `${pct}%`;
      ctx.font = 'bold 12px "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Sombra suave para contraste nítido y legible sobre la rebanada sin cuadro de fondo
      ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;

      ctx.fillText(text, center.x, center.y);
      ctx.restore();
    });
  }
};

function renderChartModelosDonut(items) {
  const ctx = document.getElementById("chart-modelos-donut");
  if (!ctx) return;

  if (appState.chartInstances.modelosDonut) {
    appState.chartInstances.modelosDonut.destroy();
  }

  const modelCounts = {};
  DEFAULT_CATALOGOS.modelos.forEach(m => { modelCounts[m] = 0; });
  items.forEach(i => {
    if (i.modelo) {
      modelCounts[i.modelo] = (modelCounts[i.modelo] || 0) + 1;
    }
  });

  const activeModels = Object.keys(modelCounts).filter(m => modelCounts[m] > 0);
  const rawLabels = activeModels.length > 0 ? activeModels : DEFAULT_CATALOGOS.modelos.slice(0, 6);
  const data = activeModels.length > 0 ? rawLabels.map(m => modelCounts[m]) : [1, 1, 1, 1, 1, 1];
  const totalModels = data.reduce((a, b) => a + b, 0);

  // Generar etiquetas con porcentaje numérico para la leyenda
  const labels = rawLabels.map((m, idx) => {
    const qty = data[idx];
    const pct = totalModels > 0 ? Math.round((qty / totalModels) * 100) : 0;
    return `${m} (${pct}%)`;
  });

  const palette = [
    "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", 
    "#06b6d4", "#14b8a6", "#f97316", "#6366f1", "#a855f7", 
    "#e11d48", "#84cc16"
  ];

  appState.chartInstances.modelosDonut = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: palette.slice(0, labels.length),
        borderColor: "#1e293b",
        borderWidth: 2
      }]
    },
    plugins: [piePercentagePlugin],
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "55%",
      plugins: {
        legend: {
          position: "right",
          labels: { boxWidth: 10, color: "#cbd5e1", font: { size: 10, weight: "bold" } }
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const val = ctx.parsed;
              const pct = totalModels > 0 ? Math.round((val / totalModels) * 100) : 0;
              return ` ${ctx.label}: ${val} piezas (${pct}%)`;
            }
          }
        }
      }
    }
  });

  let topM = "--";
  let topCount = 0;
  rawLabels.forEach((m, idx) => {
    if (data[idx] > topCount) {
      topCount = data[idx];
      topM = m;
    }
  });
  const donutSummary = document.getElementById("gerente-donut-summary");
  if (donutSummary) {
    const topPct = totalModels > 0 ? Math.round((topCount / totalModels) * 100) : 0;
    donutSummary.innerHTML = topCount > 0 
      ? `Modelo con mayor volumen: <strong class="text-cyan-400 font-bold">${topM}</strong> con <strong class="text-white font-bold">${topCount} piezas (${topPct}%)</strong>`
      : "Distribución proporcional de modelos";
  }
}

function renderChartEstatusPie(items) {
  const ctx = document.getElementById("chart-estatus-pie");
  if (!ctx) return;

  if (appState.chartInstances.estatusPie) {
    appState.chartInstances.estatusPie.destroy();
  }

  const lib = items.filter(i => i.estatus === "Liberado").length;
  const proc = items.filter(i => i.estatus === "En Proceso" || i.estatus === "Concluido").length;
  const paus = items.filter(i => i.estatus === "Pausado").length;
  const rech = items.filter(i => i.estatus === "Rechazado" || i.estatus === "Scrap").length;
  const total = lib + proc + paus + rech;

  const pLib = total > 0 ? Math.round((lib / total) * 100) : 0;
  const pProc = total > 0 ? Math.round((proc / total) * 100) : 0;
  const pPaus = total > 0 ? Math.round((paus / total) * 100) : 0;
  const pRech = total > 0 ? Math.round((rech / total) * 100) : 0;

  const labels = [
    `Liberado (${pLib}%)`,
    `En Proceso (${pProc}%)`,
    `Pausado (${pPaus}%)`,
    `Rechazado / Scrap (${pRech}%)`
  ];

  appState.chartInstances.estatusPie = new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [{
        data: [lib, proc, paus, rech],
        backgroundColor: ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"],
        borderColor: "#1e293b",
        borderWidth: 2
      }]
    },
    plugins: [piePercentagePlugin],
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: { boxWidth: 10, color: "#cbd5e1", font: { size: 11, weight: "bold" } }
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const val = ctx.parsed;
              const pct = total > 0 ? Math.round((val / total) * 100) : 0;
              return ` ${ctx.label}: ${val} piezas (${pct}%)`;
            }
          }
        }
      }
    }
  });
}

function renderChartAreasBar(items) {
  const ctx = document.getElementById("chart-areas-bar");
  if (!ctx) return;

  if (appState.chartInstances.areasBar) {
    appState.chartInstances.areasBar.destroy();
  }

  const k_t1 = items.filter(i => i.area_ubicacion === "EDIFICIO K" && getTurnoKey(i) === "Turno 1").length;
  const k_t2 = items.filter(i => i.area_ubicacion === "EDIFICIO K" && getTurnoKey(i) === "Turno 2").length;
  const k_t3 = items.filter(i => i.area_ubicacion === "EDIFICIO K" && getTurnoKey(i) === "Turno 3").length;

  const fabs_t1 = items.filter(i => i.area_ubicacion === "FABS" && getTurnoKey(i) === "Turno 1").length;
  const fabs_t2 = items.filter(i => i.area_ubicacion === "FABS" && getTurnoKey(i) === "Turno 2").length;
  const fabs_t3 = items.filter(i => i.area_ubicacion === "FABS" && getTurnoKey(i) === "Turno 3").length;

  const edifK = k_t1 + k_t2 + k_t3;
  const fabs = fabs_t1 + fabs_t2 + fabs_t3;

  const metaK = (appState.metas && appState.metas.areas && appState.metas.areas["EDIFICIO K"]) || 10;
  const metaFabs = (appState.metas && appState.metas.areas && appState.metas.areas["FABS"]) || 8;

  const pctK = metaK > 0 ? Math.round((edifK / metaK) * 100) : 0;
  const pctFabs = metaFabs > 0 ? Math.round((fabs / metaFabs) * 100) : 0;

  // Calcular m&#233;tricas para micro-etiquetas de los cuadros de acceso rápido
  const total = items.length;
  const liberadas = items.filter(i => i.estatus === "Liberado").length;
  const rechazadas = items.filter(i => i.estatus === "Rechazado").length;
  const faltantes = items.filter(i => i.tiene_faltantes === "SI").length;
  const conformidad = total > 0 ? Math.round(((total - rechazadas) / total) * 100) : 100;
  const countT1 = k_t1 + fabs_t1;
  const countT2 = k_t2 + fabs_t2;
  const countT3 = k_t3 + fabs_t3;

  // Actualizar micro-etiquetas de los cuadros chicos de acceso rápido
  const bDash = document.getElementById("app-micro-dashboard");
  if (bDash) bDash.innerText = `${liberadas} Lib. / ${total} Tot.`;

  const bDiaria = document.getElementById("app-micro-diaria");
  if (bDiaria) bDiaria.innerText = "Lun - Sáb";

  const bMetas = document.getElementById("app-micro-metas");
  if (bMetas) bMetas.innerText = `${pctK}% K / ${pctFabs}% F`;

  const bTurnos = document.getElementById("app-micro-turnos");
  if (bTurnos) bTurnos.innerText = `T1:${countT1} T2:${countT2} T3:${countT3}`;

  const bModelos = document.getElementById("app-micro-modelos");
  if (bModelos) bModelos.innerText = `13 Familias`;

  const bNaves = document.getElementById("app-micro-naves");
  if (bNaves) bNaves.innerText = `K:${edifK} | F:${fabs}`;

  const bCalidad = document.getElementById("app-micro-calidad");
  if (bCalidad) bCalidad.innerText = `${conformidad}% OK`;

  const bDefectos = document.getElementById("app-micro-defectos");
  if (bDefectos) bDefectos.innerText = `${faltantes + rechazadas} Fallas`;

  const bPersonal = document.getElementById("app-micro-personal");
  if (bPersonal) {
    const pendCount = (appState.inspecciones || []).filter(i => (i.tiene_faltantes === "SI" || i.estatus === "Rechazado" || i.responsable_nombre) && (i.retroalimentacion_estatus || "Pendiente") === "Pendiente").length;
    bPersonal.innerText = `${pendCount} Pendientes`;
  }

  appState.chartInstances.areasBar = new Chart(ctx, {
    type: "bar",
    data: {
      labels: [`EDIFICIO K (${pctK}% meta)`, `FABS (${pctFabs}% meta)`],
      datasets: [
        {
          label: "Turno 1 (Matutino)",
          data: [k_t1, fabs_t1],
          backgroundColor: "#0ea5e9",
          borderColor: "#38bdf8",
          borderWidth: 1.5,
          borderRadius: 4,
          stack: "produccion"
        },
        {
          label: "Turno 2 (Vespertino)",
          data: [k_t2, fabs_t2],
          backgroundColor: "#f59e0b",
          borderColor: "#fbbf24",
          borderWidth: 1.5,
          borderRadius: 4,
          stack: "produccion"
        },
        {
          label: "Turno 3 (Nocturno)",
          data: [k_t3, fabs_t3],
          backgroundColor: "#a855f7",
          borderColor: "#c084fc",
          borderWidth: 1.5,
          borderRadius: 4,
          stack: "produccion"
        },
        {
          label: "Meta Programada",
          data: [metaK, metaFabs],
          backgroundColor: "rgba(245, 158, 11, 0.25)",
          borderColor: "#f59e0b",
          borderWidth: 2,
          borderRadius: 6,
          stack: "meta"
        }
      ]
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: "bottom",
          labels: { boxWidth: 10, color: "#cbd5e1", font: { size: 10, weight: "bold" } }
        },
        tooltip: {
          callbacks: {
            title: (items) => {
              const idx = items[0].dataIndex;
              return idx === 0 ? "Nave: EDIFICIO K" : "Nave: FABS";
            },
            label: (ctx) => {
              const val = ctx.parsed.x;
              if (ctx.dataset.label === "Meta Programada") {
                return ` 🎯 Meta Programada: ${val} piezas`;
              }
              return ` ${ctx.dataset.label}: ${val} piezas`;
            },
            afterBody: (items) => {
              const idx = items[0].dataIndex;
              const real = idx === 0 ? edifK : fabs;
              const meta = idx === 0 ? metaK : metaFabs;
              const pct = meta > 0 ? Math.round((real / meta) * 100) : 0;
              const t1Val = idx === 0 ? k_t1 : fabs_t1;
              const t2Val = idx === 0 ? k_t2 : fabs_t2;
              const t3Val = idx === 0 ? k_t3 : fabs_t3;
              return [
                `──────────────────────────`,
                `Total Real: ${real} de ${meta} piezas (${pct}% de la meta)`,
                `• T1 (Matutino): ${t1Val} pza(s)`,
                `• T2 (Vespertino): ${t2Val} pza(s)`,
                `• T3 (Nocturno): ${t3Val} pza(s)`
              ];
            }
          }
        }
      },
      scales: {
        x: {
          stacked: true,
          beginAtZero: true,
          ticks: { stepSize: 2, color: "#94a3b8", font: { size: 11 } },
          grid: { color: "rgba(51, 65, 85, 0.4)" }
        },
        y: {
          stacked: true,
          ticks: { color: "#ffffff", font: { size: 11, weight: "bold" } },
          grid: { display: false }
        }
      }
    }
  });
}

// ==================== METAS Y CUMPLIMIENTO DE PIEZAS POR LÍNEA ====================
let isModelosMetasCollapsed = false;

function renderMetasLineas(items) {
  const areasContainer = document.getElementById("metas-areas-cards-container");
  const modelosGrid = document.getElementById("metas-modelos-grid");
  const globalSummary = document.getElementById("metas-global-summary");
  if (!areasContainer) return;

  const metas = appState.metas || DEFAULT_METAS;
  const metaK = (metas.areas && metas.areas["EDIFICIO K"]) || 10;
  const metaFabs = (metas.areas && metas.areas["FABS"]) || 8;
  const totalMeta = metaK + metaFabs;

  const realK = items.filter(i => i.area_ubicacion === "EDIFICIO K").length;
  const realFabs = items.filter(i => i.area_ubicacion === "FABS").length;
  const totalReal = items.length;

  const globalPct = totalMeta > 0 ? Math.round((totalReal / totalMeta) * 100) : 0;
  if (globalSummary) {
    globalSummary.innerHTML = `Meta Global: <span class="text-white font-bold font-mono">${totalReal}</span> de <span class="text-amber-400 font-bold font-mono">${totalMeta} piezas</span> (<strong class="${globalPct >= 100 ? 'text-emerald-400' : 'text-cyan-400'}">${globalPct}%</strong> cumplimiento)`;
  }

  // Tarjetas de Área (L&#237;nea EDIFICIO K y L&#237;nea FABS)
  const lineasData = [
    {
      id: "EDIFICIO K",
      nombre: "L&#237;nea EDIFICIO K",
      nave: "Nave Industrial K • Estructuras Pesadas",
      icon: "fa-industry",
      real: realK,
      meta: metaK,
      borderColor: "border-sky-500/40",
      bgGradient: "from-slate-900 via-slate-900 to-sky-950/40",
      accentColor: "sky",
      items: items.filter(i => i.area_ubicacion === "EDIFICIO K")
    },
    {
      id: "FABS",
      nombre: "L&#237;nea FABS",
      nave: "Nave Fabricaciones • Ensambles y Componentes",
      icon: "fa-gears",
      real: realFabs,
      meta: metaFabs,
      borderColor: "border-teal-500/40",
      bgGradient: "from-slate-900 via-slate-900 to-teal-950/40",
      accentColor: "teal",
      items: items.filter(i => i.area_ubicacion === "FABS")
    }
  ];

  areasContainer.innerHTML = "";
  lineasData.forEach(linea => {
    const pct = linea.meta > 0 ? Math.round((linea.real / linea.meta) * 100) : 0;
    const faltan = Math.max(0, linea.meta - linea.real);
    const excedente = Math.max(0, linea.real - linea.meta);
    const isAlcanzada = linea.real >= linea.meta;

    // M&#233;tricas de calidad
    const libCount = linea.items.filter(i => i.estatus === "Liberado").length;
    const faltCount = linea.items.filter(i => i.tiene_faltantes === "SI").length;
    const scrapCount = linea.items.filter(i => i.estatus === "Rechazado" || i.estatus === "Scrap").length;

    // Barra de color
    let barColor = "bg-rose-500";
    if (pct >= 100) barColor = "bg-emerald-500";
    else if (pct >= 75) barColor = "bg-blue-500";
    else if (pct >= 50) barColor = "bg-amber-500";

    const safeId = linea.id.replace(/\s+/g, "-");
    if (!appState.collapsedLineas) {
      appState.collapsedLineas = {
        "EDIFICIO K": false,
        "FABS": false
      };
    }
    const isCollapsed = !!(appState.collapsedLineas && appState.collapsedLineas[linea.id]);

    const card = document.createElement("div");
    card.id = `card-linea-${safeId}`;
    card.className = `p-4 rounded-xl bg-gradient-to-br ${linea.bgGradient} border ${linea.borderColor} shadow-lg space-y-3.5 transition-all`;
    card.innerHTML = `
      <div class="flex items-start justify-between gap-2 cursor-pointer select-none hover:opacity-95 transition" onclick="toggleLineaCardCollapse('${linea.id}')">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-xl bg-${linea.accentColor}-500/20 text-${linea.accentColor}-400 border border-${linea.accentColor}-500/30 flex items-center justify-center text-lg shadow-inner">
            <i class="fa-solid ${linea.icon}"></i>
          </div>
          <div>
            <h4 class="text-sm font-bold text-white flex items-center gap-2">
              ${linea.nombre}
            </h4>
            <span class="text-[11px] text-slate-400 block">${linea.nave}</span>
          </div>
        </div>
        <div class="flex items-center gap-2">
          ${isAlcanzada 
            ? `<span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 shadow-sm"><i class="fa-solid fa-trophy text-amber-400"></i> Meta Lograda ${excedente > 0 ? `(+${excedente})` : ''}</span>`
            : `<span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 shadow-sm"><i class="fa-solid fa-clock"></i> Faltan ${faltan} pieza${faltan !== 1 ? 's' : ''}</span>`
          }
          <button type="button" onclick="event.stopPropagation(); toggleLineaCardCollapse('${linea.id}')" class="px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-700 text-cyan-300 hover:text-white border border-cyan-500/40 text-xs font-bold flex items-center gap-1.5 transition shadow cursor-pointer" title="Contraer o expandir flujo ${linea.nombre}">
            <span class="text-[10px]" id="label-collapse-linea-${safeId}">${isCollapsed ? 'Expandir' : 'Contraer'}</span>
            <i class="fa-solid ${isCollapsed ? 'fa-chevron-down text-amber-400' : 'fa-chevron-up text-cyan-400'} transition-transform text-xs" id="icon-collapse-linea-${safeId}"></i>
          </button>
        </div>
      </div>

      <!-- Resumen Compacto cuando el Flujo está Contraído -->
      <div id="compact-collapse-linea-${safeId}" class="${isCollapsed ? '' : 'hidden'} pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs gap-2">
        <div class="flex items-center gap-2">
          <span class="text-slate-400">Producci&#243;n Actual:</span>
          <strong class="text-white font-mono">${linea.real}</strong>
          <span class="text-slate-500">/</span>
          <span class="text-amber-400 font-mono font-semibold">${linea.meta} pzas</span>
          <span class="font-mono ${isAlcanzada ? 'text-emerald-400' : 'text-cyan-400'} font-bold">(${pct}%)</span>
        </div>
        <div class="flex items-center gap-2 text-[11px] font-mono">
          <span class="text-emerald-400">Lib: <strong>${libCount}</strong></span>
          <span class="text-slate-600">•</span>
          <span class="${faltCount > 0 ? 'text-amber-400' : 'text-slate-400'}">Falt: <strong>${faltCount}</strong></span>
          <span class="text-slate-600">•</span>
          <span class="${scrapCount > 0 ? 'text-rose-400' : 'text-slate-400'}">Scrap: <strong>${scrapCount}</strong></span>
        </div>
      </div>

      <!-- Cuerpo Completo cuando el Flujo está Expandido -->
      <div id="body-collapse-linea-${safeId}" class="${isCollapsed ? 'hidden' : ''} space-y-3.5">
        <!-- Comparativa N&#250;meros Reales vs Meta -->
        <div class="flex items-baseline justify-between pt-1">
          <div>
            <span class="text-xs text-slate-400 uppercase font-semibold">Producci&#243;n Actual:</span>
            <div class="flex items-baseline gap-1.5 mt-0.5">
              <span class="text-3xl font-black text-white font-mono">${linea.real}</span>
              <span class="text-xs text-slate-400 font-semibold font-mono">/ meta de <strong class="text-amber-400 font-bold">${linea.meta} piezas</strong></span>
            </div>
          </div>
          <div class="text-right">
            <span class="text-xs text-slate-400 uppercase font-semibold">Cumplimiento:</span>
            <div class="text-2xl font-black ${isAlcanzada ? 'text-emerald-400' : 'text-cyan-400'} font-mono">${pct}%</div>
          </div>
        </div>

        <!-- Barra de Progreso Visual -->
        <div>
          <div class="w-full bg-slate-950/80 rounded-full h-3 p-0.5 border border-slate-700/80 overflow-hidden shadow-inner">
            <div class="${barColor} h-full rounded-full transition-all duration-700 shadow-md" style="width: ${Math.min(100, pct)}%"></div>
          </div>
          <div class="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
            <span>0 piezas</span>
            <span>Meta: ${linea.meta} piezas (${pct}% alcanzado)</span>
          </div>
        </div>

        <!-- Sub-indicadores de Calidad de la L&#237;nea -->
        <div class="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center">
          <div class="p-1.5 rounded-lg bg-slate-950/50 border border-slate-800">
            <span class="text-[10px] text-slate-400 block font-semibold">Liberadas</span>
            <span class="text-xs font-bold text-emerald-400 font-mono">${libCount}</span>
          </div>
          <div class="p-1.5 rounded-lg bg-slate-950/50 border border-slate-800">
            <span class="text-[10px] text-slate-400 block font-semibold">Con Faltantes</span>
            <span class="text-xs font-bold ${faltCount > 0 ? 'text-amber-400' : 'text-slate-400'} font-mono">${faltCount}</span>
          </div>
          <div class="p-1.5 rounded-lg bg-slate-950/50 border border-slate-800">
            <span class="text-[10px] text-slate-400 block font-semibold">Rechazos / Scrap</span>
            <span class="text-xs font-bold ${scrapCount > 0 ? 'text-rose-400' : 'text-slate-400'} font-mono">${scrapCount}</span>
          </div>
        </div>
      </div>
    `;
    areasContainer.appendChild(card);
  });

  // Desglose de los Modelos organizado por área
  if (modelosGrid) {
    modelosGrid.innerHTML = "";
    appState.catalogos.modelos.forEach(m => {
      const realM = items.filter(i => i.modelo === m).length;
      const metaM = (metas.modelos && metas.modelos[m]) || 2;
      const pctM = metaM > 0 ? Math.round((realM / metaM) * 100) : 0;
      const isOk = realM >= metaM;
      const areaM = getAreaForModel(m);
      const isK = areaM === "EDIFICIO K";
      const areaBadge = isK
        ? `<span class="text-[9px] px-1.5 py-0.5 rounded font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">EDIFICIO K</span>`
        : `<span class="text-[9px] px-1.5 py-0.5 rounded font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">FABS</span>`;

      let barColorM = "bg-rose-500";
      if (pctM >= 100) barColorM = "bg-emerald-500";
      else if (pctM >= 60) barColorM = "bg-blue-500";
      else if (pctM >= 30) barColorM = "bg-amber-500";

      const cardM = document.createElement("div");
      cardM.className = `p-2.5 rounded-lg bg-slate-900 border ${isK ? 'border-sky-700/50' : 'border-slate-700/80'} hover:border-slate-500 transition shadow flex flex-col justify-between`;
      cardM.innerHTML = `
        <div>
          <div class="flex items-center justify-between gap-1 mb-1">
            <span class="font-bold text-white text-xs truncate" title="${m}">${m}</span>
            ${areaBadge}
          </div>
          <div class="flex items-baseline justify-between text-[11px] text-slate-400 font-mono">
            <span>Real: <strong class="text-white">${realM}</strong></span>
            <span>Meta: <strong class="text-amber-400">${metaM}</strong> (<strong class="${isOk ? 'text-emerald-400' : 'text-cyan-400'}">${pctM}%</strong>)</span>
          </div>
        </div>
        <div class="mt-2">
          <div class="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
            <div class="${barColorM} h-full rounded-full transition-all duration-500" style="width: ${Math.min(100, pctM)}%"></div>
          </div>
          <div class="text-[9px] mt-1 text-center font-bold ${isOk ? 'text-emerald-400' : realM > 0 ? 'text-amber-400' : 'text-slate-500'}">
            ${isOk ? '✓ Cumplida' : realM > 0 ? `Faltan ${metaM - realM}` : 'Sin piezas'}
          </div>
        </div>
      `;
      modelosGrid.appendChild(cardM);
    });
  }
}

function toggleLineaCardCollapse(lineaId) {
  if (!appState.collapsedLineas) appState.collapsedLineas = {};
  appState.collapsedLineas[lineaId] = !appState.collapsedLineas[lineaId];
  const isCollapsed = appState.collapsedLineas[lineaId];
  const safeId = lineaId.replace(/\s+/g, "-");

  const body = document.getElementById(`body-collapse-linea-${safeId}`);
  const compact = document.getElementById(`compact-collapse-linea-${safeId}`);
  const icon = document.getElementById(`icon-collapse-linea-${safeId}`);
  const label = document.getElementById(`label-collapse-linea-${safeId}`);

  if (body) {
    if (isCollapsed) body.classList.add("hidden");
    else body.classList.remove("hidden");
  }
  if (compact) {
    if (isCollapsed) compact.classList.remove("hidden");
    else compact.classList.add("hidden");
  }
  if (icon) {
    icon.className = isCollapsed
      ? "fa-solid fa-chevron-down transition-transform text-xs text-amber-400"
      : "fa-solid fa-chevron-up transition-transform text-xs";
  }
  if (label) {
    label.innerText = isCollapsed ? "Expandir" : "Contraer";
  }
}

function toggleModelosMetasCollapse() {
  const grid = document.getElementById("metas-modelos-grid");
  const label = document.getElementById("label-toggle-modelos-metas");
  const icon = document.getElementById("icon-toggle-modelos-metas");
  if (!grid) return;

  isModelosMetasCollapsed = !isModelosMetasCollapsed;
  if (isModelosMetasCollapsed) {
    grid.classList.add("hidden");
    if (label) label.innerText = `Ver Desglose de ${appState.catalogos.modelos.length} L&#237;neas`;
    if (icon) icon.className = "fa-solid fa-chevron-down transition-transform";
  } else {
    grid.classList.remove("hidden");
    if (label) label.innerText = "Ocultar Desglose";
    if (icon) icon.className = "fa-solid fa-chevron-up transition-transform";
  }
}

// ==================== ALIASES DE NAVEGACIÓN Y COMPATIBILIDAD ====================
function selectGerenteApp(key) {
  navigateToModule(key);
}

function updateActiveModuleBanner(moduleKey) {
  // Ya sincronizado dentro de navigateToModule
}


// ==================== FUNCIONES GENÉRICAS DE COLAPSO DE FLUJOS ====================
function toggleGenericSection(contentId, iconId, labelId = null, expandText = "Expandir", collapseText = "Contraer") {
  const content = document.getElementById(contentId);
  const icon = document.getElementById(iconId);
  const label = labelId ? document.getElementById(labelId) : null;
  if (!content) return;

  const isHidden = content.classList.contains("hidden");
  if (isHidden) {
    content.classList.remove("hidden");
    if (icon) {
      icon.classList.remove("fa-chevron-down");
      icon.classList.add("fa-chevron-up");
    }
    if (label) label.innerText = collapseText;

    // Al expandir una sección de gráfica, forzar redimensionamiento y actualización para que no quede canvas 0x0
    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
      if (appState.chartInstances) {
        Object.values(appState.chartInstances).forEach(chart => {
          if (chart && typeof chart.resize === "function") {
            try { chart.resize(); } catch (e) {}
          }
        });
      }
      if (contentId.startsWith("gerente")) {
        if (typeof renderGerenteCharts === "function") {
          renderGerenteCharts();
        }
      } else if (contentId.startsWith("defectos")) {
        if (typeof renderDefectosTab === "function") {
          renderDefectosTab();
        }
      }
    }, 60);
  } else {
    content.classList.add("hidden");
    if (icon) {
      icon.classList.remove("fa-chevron-up");
      icon.classList.add("fa-chevron-down");
    }
    if (label) label.innerText = expandText;
  }
}

let allGerenteSectionsCollapsed = true;

function toggleAllGerenteSections() {
  if (currentGerenteModule === "all") {
    allGerenteSectionsCollapsed = true;
    collapseAllGerenteModules();
  } else {
    allGerenteSectionsCollapsed = false;
    navigateToModule("all", true);
  }
}

let allDefectosSectionsCollapsed = false;

function toggleAllDefectosSections() {
  allDefectosSectionsCollapsed = !allDefectosSectionsCollapsed;
  const sections = [
    { content: "defectos-content-filtros", icon: "icon-toggle-defectos-filtros", label: "label-toggle-defectos-filtros", expandText: "Expandir Filtros", collapseText: "Contraer Filtros" },
    { content: "defectos-content-kpis", icon: "icon-toggle-defectos-kpis", label: "label-toggle-defectos-kpis" },
    { content: "defectos-content-turnos", icon: "icon-toggle-defectos-turnos", label: "label-toggle-defectos-turnos" },
    { content: "defectos-content-areas-bar", icon: "icon-toggle-defectos-areas", label: "label-toggle-defectos-areas" },
    { content: "defectos-content-donut", icon: "icon-toggle-defectos-donut", label: "label-toggle-defectos-donut" },
    { content: "defectos-content-modelos-bar", icon: "icon-toggle-defectos-modelos", label: "label-toggle-defectos-modelos" },
    { content: "defectos-content-tendencia-bar", icon: "icon-toggle-defectos-tendencia", label: "label-toggle-defectos-tendencia" },
    { content: "defectos-content-tabla", icon: "icon-toggle-defectos-tabla", label: "label-toggle-defectos-tabla" }
  ];

  sections.forEach(s => {
    const el = document.getElementById(s.content);
    const ic = document.getElementById(s.icon);
    const lb = s.label ? document.getElementById(s.label) : null;
    if (el) {
      if (allDefectosSectionsCollapsed) {
        el.classList.add("hidden");
        if (ic) { ic.classList.remove("fa-chevron-up"); ic.classList.add("fa-chevron-down"); }
        if (lb) lb.innerText = s.expandText || "Expandir";
      } else {
        el.classList.remove("hidden");
        if (ic) { ic.classList.remove("fa-chevron-down"); ic.classList.add("fa-chevron-up"); }
        if (lb) lb.innerText = s.collapseText || "Contraer";
      }
    }
  });

  const masterBtnLabel = document.getElementById("label-toggle-all-defectos");
  const masterBtnIcon = document.getElementById("icon-toggle-all-defectos");
  if (masterBtnLabel) {
    masterBtnLabel.innerText = allDefectosSectionsCollapsed ? "Expandir Todo" : "Contraer Todo";
  }
  if (masterBtnIcon) {
    masterBtnIcon.className = allDefectosSectionsCollapsed 
      ? "fa-solid fa-arrows-up-down text-rose-400" 
      : "fa-solid fa-down-left-and-up-right-to-center text-amber-400";
  }

  if (!allDefectosSectionsCollapsed) {
    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
      if (typeof renderDefectosTab === "function") renderDefectosTab();
    }, 100);
  }
}

function openMetasModal() {
  const u = appState.currentUser;
  if (u && u.rol === "colaborador") {
    alert("ℹ️ La configuración de metas de producción está reservada para el Supervisor y Gerente.");
    return;
  }

  const metas = appState.metas || DEFAULT_METAS;
  const inK = document.getElementById("meta-input-edificio-k");
  const inFabs = document.getElementById("meta-input-fabs");

  if (inK) inK.value = (metas.areas && metas.areas["EDIFICIO K"]) || 10;
  if (inFabs) inFabs.value = (metas.areas && metas.areas["FABS"]) || 14;

  const container = document.getElementById("metas-modelos-inputs-container");
  if (container) {
    container.innerHTML = "";
    appState.catalogos.modelos.forEach(m => {
      const val = (metas.modelos && metas.modelos[m]) || 2;
      const areaM = getAreaForModel(m);
      const wrap = document.createElement("div");
      wrap.innerHTML = `
        <label class="block text-slate-300 font-semibold mb-0.5 truncate text-[11px]" title="${m}">${m} <span class="text-[9px] text-slate-400 font-normal">(${areaM})</span>:</label>
        <input type="number" min="0" max="200" id="meta-input-model-${m}" value="${val}" class="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white font-mono font-bold focus:outline-none focus:border-amber-500">
      `;
      container.appendChild(wrap);
    });
  }

  document.getElementById("modal-metas").classList.remove("hidden");
}

function closeMetasModal() {
  document.getElementById("modal-metas").classList.add("hidden");
}

function handleSaveMetas(event) {
  if (event) event.preventDefault();

  const inK = parseInt(document.getElementById("meta-input-edificio-k").value) || 10;
  const inFabs = parseInt(document.getElementById("meta-input-fabs").value) || 8;

  if (!appState.metas) appState.metas = JSON.parse(JSON.stringify(DEFAULT_METAS));
  if (!appState.metas.areas) appState.metas.areas = {};
  if (!appState.metas.modelos) appState.metas.modelos = {};

  appState.metas.areas["EDIFICIO K"] = inK;
  appState.metas.areas["FABS"] = inFabs;

  DEFAULT_CATALOGOS.modelos.forEach(m => {
    const input = document.getElementById(`meta-input-model-${m}`);
    if (input) {
      appState.metas.modelos[m] = parseInt(input.value) || 0;
    }
  });

  localStorage.setItem("auditum_metas_lineas", JSON.stringify(appState.metas));

  // Sincronizar en segundo plano con Google Sheets si aplica
  if (typeof syncRecordToGoogleSheets === "function") {
    syncRecordToGoogleSheets("save_metas", appState.metas);
  }

  closeMetasModal();
  renderGerenteCharts();
  alert("🎯 ¡Metas de producción por línea actualizadas exitosamente!");
}

function restoreDefaultMetas() {
  const inK = document.getElementById("meta-input-edificio-k");
  const inFabs = document.getElementById("meta-input-fabs");

  if (inK) inK.value = DEFAULT_METAS.areas["EDIFICIO K"];
  if (inFabs) inFabs.value = DEFAULT_METAS.areas["FABS"];

  DEFAULT_CATALOGOS.modelos.forEach(m => {
    const input = document.getElementById(`meta-input-model-${m}`);
    if (input) {
      input.value = DEFAULT_METAS.modelos[m] || 2;
    }
  });
}

// ==================== CORRECCIÓN Y CONTROL DE SUPERVISIÓN ====================
let supervisorTargetId = null;

function openSupervisorEditModalFromDetail() {
  if (appState.activeDetailId) {
    openSupervisorEditModal(appState.activeDetailId);
  }
}

function openSupervisorEditModal(idInspeccion) {
  const item = appState.inspecciones.find(i => i.id_inspeccion === idInspeccion);
  if (!item) return;

  supervisorTargetId = idInspeccion;
  document.getElementById("super-edit-folio").innerText = item.id_inspeccion;

  const selModelo = document.getElementById("super-input-modelo");
  const inSerie = document.getElementById("super-input-serie");
  const selArea = document.getElementById("super-input-area");
  const inParte = document.getElementById("super-input-parte");
  const chkFalt = document.getElementById("super-check-faltantes");
  const inDescFalt = document.getElementById("super-input-desc-faltantes");
  const inMotivo = document.getElementById("super-input-motivo");

  if (selModelo) selModelo.value = item.modelo || "LTTT";
  if (inSerie) inSerie.value = item.numero_serie || "";
  if (selArea) selArea.value = item.area_ubicacion || "EDIFICIO K";
  if (inParte) inParte.value = item.numero_parte || "";
  if (chkFalt) chkFalt.checked = item.tiene_faltantes === "SI";
  if (inDescFalt) inDescFalt.value = item.descripcion_faltantes || "";
  if (inMotivo) inMotivo.value = "";

  toggleSuperFaltantesInput();

  appState.tempSuperPhotoProd = null;
  appState.tempSuperPhotoDef = null;
  const statProd = document.getElementById("super-photo-prod-status");
  const statDef = document.getElementById("super-photo-def-status");
  if (statProd) statProd.innerText = "Sin foto adicional";
  if (statDef) statDef.innerText = "Sin foto de defecto";

  const btnUnlockCoord = document.getElementById("btn-super-unlock-coord");
  if (btnUnlockCoord) {
    if (appState.currentUser && appState.currentUser.rol === "supervisor") {
      btnUnlockCoord.classList.remove("hidden");
      btnUnlockCoord.innerHTML = item.desbloqueada_edicion
        ? '<i class="fa-solid fa-lock text-amber-300"></i> Bloquear Acceso al Coordinador'
        : '<i class="fa-solid fa-lock-open text-indigo-300"></i> Dar Acceso al Coordinador';
    } else {
      btnUnlockCoord.classList.add("hidden");
    }
  }

  document.getElementById("modal-supervisor-edit").classList.remove("hidden");
}

function closeSupervisorEditModal() {
  document.getElementById("modal-supervisor-edit").classList.add("hidden");
  supervisorTargetId = null;
}

function toggleSuperFaltantesInput() {
  const chk = document.getElementById("super-check-faltantes");
  const container = document.getElementById("super-faltantes-container");
  if (chk && container) {
    if (chk.checked) container.classList.remove("hidden");
    else container.classList.add("hidden");
  }
}

function handleSuperPhotoProdCapture(event) {
  const file = event.target.files[0];
  if (!file) return;

  stampWatermarkOnPhoto(file, "producto", "Corrección - Pieza Checada", (photoItem) => {
    appState.tempSuperPhotoProd = photoItem;
    const stat = document.getElementById("super-photo-prod-status");
    if (stat) stat.innerText = "🟢 Foto lista para guardar";
  });
  event.target.value = "";
}

function handleSuperPhotoDefCapture(event) {
  const file = event.target.files[0];
  if (!file) return;

  const tipoDef = document.getElementById("super-defect-type")?.value || "Defecto";
  stampWatermarkOnPhoto(file, "defecto", `Corrección - ${tipoDef}`, (photoItem) => {
    appState.tempSuperPhotoDef = photoItem;
    const stat = document.getElementById("super-photo-def-status");
    if (stat) stat.innerText = `🔴 Foto (${tipoDef}) lista para guardar`;
  });
  event.target.value = "";
}

function handleSupervisorSave(event) {
  event.preventDefault();
  const item = appState.inspecciones.find(i => i.id_inspeccion === supervisorTargetId);
  if (!item) return;

  const nuevoModelo = document.getElementById("super-input-modelo").value.trim();
  const nuevaSerie = document.getElementById("super-input-serie").value.trim();
  const nuevaArea = document.getElementById("super-input-area").value;
  const nuevaParte = document.getElementById("super-input-parte").value.trim();
  const tieneFalt = document.getElementById("super-check-faltantes").checked ? "SI" : "NO";
  const descFalt = document.getElementById("super-input-desc-faltantes").value.trim();
  const motivo = document.getElementById("super-input-motivo").value.trim();

  if (!motivo || motivo.length < 8) {
    alert("Para prevenir la manipulación indebida, debes ingresar un motivo o justificación clara (mínimo 8 caracteres).");
    return;
  }

  const valoresAnteriores = `Modelo: ${item.modelo}, Serie: ${item.numero_serie}, Área: ${item.area_ubicacion}, Parte: ${item.numero_parte}, Faltantes: ${item.tiene_faltantes}`;
  const valoresNuevos = `Modelo: ${nuevoModelo}, Serie: ${nuevaSerie}, Área: ${nuevaArea}, Parte: ${nuevaParte}, Faltantes: ${tieneFalt}`;

  item.modelo = nuevoModelo;
  item.numero_serie = nuevaSerie;
  item.area_ubicacion = nuevaArea;
  if (nuevaParte) item.numero_parte = nuevaParte;
  item.tiene_faltantes = tieneFalt;
  item.descripcion_faltantes = descFalt;

  const currVer = parseFloat(item.version_reporte || "1.0");
  item.version_reporte = (currVer + 0.1).toFixed(1);

  // Volver a bloquear edición una vez corregida
  item.desbloqueada_edicion = false;

  const nuevasFotos = [];
  if (appState.tempSuperPhotoProd) {
    if (!item.fotos) item.fotos = [];
    if (!item.fotos_producto) item.fotos_producto = [];
    item.fotos.push(appState.tempSuperPhotoProd);
    item.fotos_producto.push(appState.tempSuperPhotoProd);
    nuevasFotos.push(appState.tempSuperPhotoProd);
  }
  if (appState.tempSuperPhotoDef) {
    if (!item.fotos) item.fotos = [];
    if (!item.fotos_defecto) item.fotos_defecto = [];
    item.fotos.push(appState.tempSuperPhotoDef);
    item.fotos_defecto.push(appState.tempSuperPhotoDef);
    nuevasFotos.push(appState.tempSuperPhotoDef);
  }

  const now = new Date();
  const nowStr = now.toISOString().replace("T", " ").substring(0, 19);
  const auditEntry = {
    id_auditoria: "AUD-" + Date.now(),
    id_inspeccion: item.id_inspeccion,
    nomina_editor: appState.currentUser.nomina,
    fecha_hora: nowStr,
    campo_modificado: "Corrección Autorizada",
    status_anterior: item.estatus,
    status_final: item.estatus,
    valor_anterior: valoresAnteriores,
    valor_nuevo: valoresNuevos,
    justificacion_motivo: `[Corrección por Nómina ${appState.currentUser.nomina} (${appState.currentUser.rol})] ${motivo}`
  };
  appState.auditoria.unshift(auditEntry);
  saveToLocalStorage();

  // Sincronizar con Google Sheets
  syncRecordToGoogleSheets("supervisor_full_update", {
    id_inspeccion: item.id_inspeccion,
    nomina_supervisor: appState.currentUser.nomina,
    modelo: nuevoModelo,
    numero_serie: nuevaSerie,
    area_ubicacion: nuevaArea,
    numero_parte: nuevaParte,
    tiene_faltantes: tieneFalt,
    descripcion_faltantes: descFalt,
    version_reporte: item.version_reporte,
    motivo: motivo,
    valores_anteriores: valoresAnteriores,
    valores_nuevos: valoresNuevos,
    fotos: nuevasFotos.map(p => ({ id: p.id, tipo: p.tipo, timestamp: p.timestamp, descripcion: p.descripcion, url: p.url }))
  });

  closeSupervisorEditModal();
  if (appState.activeDetailId) {
    openDetailModal(item.id_inspeccion);
  }
  renderInspectionsTable();
  renderAuditTable();
  updateKPIs();
  alert(`✅ Corrección guardada exitosamente con versión v${item.version_reporte}.\nRegistrada en TBL_AUDITORIA y sincronizada con Google Sheets.`);
}

function unlockCurrentInspectionForCoordinator() {
  const id = supervisorTargetId || appState.activeDetailId;
  const item = appState.inspecciones.find(i => i.id_inspeccion === id);
  if (!item) return;

  if (appState.currentUser.rol !== "supervisor") {
    alert("Solo un Supervisor tiene autorización para desbloquear o conceder acceso a un coordinador.");
    return;
  }

  const nuevoEstado = !item.desbloqueada_edicion;
  item.desbloqueada_edicion = nuevoEstado;
  item.desbloqueada_por = appState.currentUser.nomina;
  item.desbloqueada_fecha = new Date().toISOString().replace("T", " ").substring(0, 19);

  const auditEntry = {
    id_auditoria: "AUD-" + Date.now(),
    id_inspeccion: item.id_inspeccion,
    nomina_editor: appState.currentUser.nomina,
    fecha_hora: item.desbloqueada_fecha,
    campo_modificado: "Control de Acceso Edición",
    status_anterior: nuevoEstado ? "Bloqueada" : "Desbloqueada",
    status_final: nuevoEstado ? "Desbloqueada para Coordinador" : "Bloqueada",
    valor_anterior: nuevoEstado ? "Solo Lectura" : "Edición Abierta",
    valor_nuevo: nuevoEstado ? "Edición Abierta" : "Solo Lectura",
    justificacion_motivo: nuevoEstado 
      ? `Supervisor concedió acceso de edición al coordinador (Nómina creador ${item.nomina_creador}) para corregir errores o agregar fotos.`
      : `Supervisor cerró el acceso de edición.`
  };
  appState.auditoria.unshift(auditEntry);
  saveToLocalStorage();

  syncRecordToGoogleSheets("unlock_inspection", {
    id_inspeccion: item.id_inspeccion,
    nomina_supervisor: appState.currentUser.nomina,
    motivo: nuevoEstado 
      ? `Supervisor otorgó acceso temporal al coordinador (Nómina ${item.nomina_creador}) para corregir fotos o datos.`
      : "Supervisor bloqueó el acceso a la inspección."
  });

  if (supervisorTargetId) closeSupervisorEditModal();
  if (appState.activeDetailId) openDetailModal(item.id_inspeccion);
  renderInspectionsTable();
  renderAuditTable();

  if (nuevoEstado) {
    alert(`🔓 ¡Acceso concedido exitosamente!\nLa inspección ${item.id_inspeccion} ha sido desbloqueada.\nEl coordinador (Nómina ${item.nomina_creador}) ahora tiene permiso para corregir su captura o subir fotos faltantes.`);
  } else {
    alert(`🔒 La inspección ${item.id_inspeccion} ha sido bloqueada nuevamente.`);
  }
}

// ==================== PESTAÑA: ANÁLISIS DE DEFECTOS POR LÍNEA ====================

// Clasificador universal de causas de defectos para cada inspección
function getDefectosInfo(item) {
  if (!item) return [];
  const defects = new Set();

  // 1. Campo explícito si existe
  if (item.tipo_defecto) {
    const raw = Array.isArray(item.tipo_defecto) ? item.tipo_defecto : [item.tipo_defecto];
    raw.forEach(td => {
      const s = String(td).toLowerCase();
      if (s.includes("sold")) defects.add("Soldadura");
      if (s.includes("golp")) defects.add("Golpe");
      if (s.includes("falt") || s.includes("componente")) defects.add("Falta de Componente");
      if (s.includes("scrap") || s.includes("rechaz")) defects.add("Scrap");
    });
  }

  // 2. Fotos de evidencia dual
  const allPhotos = [...(item.fotos_defecto || []), ...(item.fotos || [])];
  allPhotos.forEach(p => {
    const t = (p.tipo || p.descripcion || "").toLowerCase();
    if (t.includes("sold")) defects.add("Soldadura");
    if (t.includes("golp")) defects.add("Golpe");
    if (t.includes("falt") || t.includes("componente")) defects.add("Falta de Componente");
    if (t.includes("scrap")) defects.add("Scrap");
  });

  // 3. Faltantes y su descripción
  if (item.tiene_faltantes === "SI") {
    const desc = (item.descripcion_faltantes || "").toLowerCase();
    if (desc.includes("sold")) defects.add("Soldadura");
    else if (desc.includes("golp")) defects.add("Golpe");
    else defects.add("Falta de Componente");
  }

  // 4. Estatus y notas de turnos
  if (item.estatus === "Rechazado") {
    defects.add("Scrap");
  }

  (item.turnos || []).forEach(t => {
    if (t.estatus_entrega === "Scrap") defects.add("Scrap");
    const notas = (t.notas || "").toLowerCase();
    if (notas.includes("soldad") || notas.includes("porosidad") || notas.includes("socavaci")) defects.add("Soldadura");
    if (notas.includes("golpe") || notas.includes("abollad") || notas.includes("impacto")) defects.add("Golpe");
    if (notas.includes("scrap") || notas.includes("rechazo")) defects.add("Scrap");
  });

  return Array.from(defects);
}

// Renderizado principal de la pestaña de defectos
function renderDefectosTab() {
  const filterArea = document.getElementById("defectos-filter-area")?.value || "";
  const filterModelo = document.getElementById("defectos-filter-modelo")?.value || "";
  const filterTipo = document.getElementById("defectos-filter-tipo")?.value || "";
  const filterTurno = document.getElementById("defectos-filter-turno")?.value || "";
  const fechaInicio = document.getElementById("defectos-fecha-inicio")?.value || "";
  const fechaFin = document.getElementById("defectos-fecha-fin")?.value || "";

  // Filtrar inspecciones que tienen defectos y cumplen los filtros base de área, modelo, tipo y fecha
  const allDefectItemsInPeriod = appState.inspecciones.filter(item => {
    const defs = getDefectosInfo(item);
    if (defs.length === 0) return false;

    if (filterArea && filterArea !== "all" && !matchItemArea(item, filterArea)) return false;
    if (filterModelo && item.modelo !== filterModelo) return false;
    if (filterTipo && !defs.includes(filterTipo)) return false;

    const f = (item.fecha_creacion || "").split(" ")[0];
    if (fechaInicio && f && f < fechaInicio) return false;
    if (fechaFin && f && f > fechaFin) return false;

    return true;
  });

  // M&#233;tricas de defectos por turno (visión global del per&#237;odo)
  const t1Defects = allDefectItemsInPeriod.filter(i => getTurnoKey(i) === "Turno 1").length;
  const t2Defects = allDefectItemsInPeriod.filter(i => getTurnoKey(i) === "Turno 2").length;
  const t3Defects = allDefectItemsInPeriod.filter(i => getTurnoKey(i) === "Turno 3").length;
  const totalDefectsCount = allDefectItemsInPeriod.length;

  const pctT1Def = totalDefectsCount > 0 ? Math.round((t1Defects / totalDefectsCount) * 100) : 0;
  const pctT2Def = totalDefectsCount > 0 ? Math.round((t2Defects / totalDefectsCount) * 100) : 0;
  const pctT3Def = totalDefectsCount > 0 ? Math.round((t3Defects / totalDefectsCount) * 100) : 0;

  // Actualizar Tarjetas KPI de Defectos por Turno
  const elDefT1 = document.getElementById("kpi-defectos-t1");
  const elDefT1Pct = document.getElementById("kpi-defectos-t1-pct");
  if (elDefT1) elDefT1.innerText = `${t1Defects} def`;
  if (elDefT1Pct) elDefT1Pct.innerText = `${pctT1Def}% del total`;

  const elDefT2 = document.getElementById("kpi-defectos-t2");
  const elDefT2Pct = document.getElementById("kpi-defectos-t2-pct");
  if (elDefT2) elDefT2.innerText = `${t2Defects} def`;
  if (elDefT2Pct) elDefT2Pct.innerText = `${pctT2Def}% del total`;

  const elDefT3 = document.getElementById("kpi-defectos-t3");
  const elDefT3Pct = document.getElementById("kpi-defectos-t3-pct");
  if (elDefT3) elDefT3.innerText = `${t3Defects} def`;
  if (elDefT3Pct) elDefT3Pct.innerText = `${pctT3Def}% del total`;

  // Filtrar por turno si fue seleccionado específicamente
  let defectItems = filterTurno
    ? allDefectItemsInPeriod.filter(i => getTurnoKey(i) === filterTurno)
    : allDefectItemsInPeriod;

  // Conteo de cada tipo de defecto
  let countSoldadura = 0;
  let countGolpe = 0;
  let countFaltante = 0;
  let countScrap = 0;
  const modelDefectCounts = {};

  defectItems.forEach(item => {
    const defs = getDefectosInfo(item);
    if (defs.includes("Soldadura")) countSoldadura++;
    if (defs.includes("Golpe")) countGolpe++;
    if (defs.includes("Falta de Componente")) countFaltante++;
    if (defs.includes("Scrap")) countScrap++;

    if (item.modelo) {
      modelDefectCounts[item.modelo] = (modelDefectCounts[item.modelo] || 0) + 1;
    }
  });

  const totalDefectosEventos = countSoldadura + countGolpe + countFaltante + countScrap;

  // Actualizar indicador de filtros y encabezados
  const headerCount = document.getElementById("defectos-header-count");
  if (headerCount) {
    const turnoLabel = filterTurno ? ` • ${filterTurno}` : "";
    headerCount.innerText = `${defectItems.length} componentes con hallazgo (${totalDefectosEventos} causas)${turnoLabel}`;
  }

  const indicator = document.getElementById("defectos-filter-indicator");
  if (indicator) {
    let textParts = [];
    if (filterTurno) textParts.push(`Turno: <strong>${filterTurno}</strong>`);
    if (fechaInicio && fechaFin) textParts.push(`Fecha: <strong>${fechaInicio} al ${fechaFin}</strong>`);
    else if (fechaInicio) textParts.push(`Desde: <strong>${fechaInicio}</strong>`);
    else if (fechaFin) textParts.push(`Hasta: <strong>${fechaFin}</strong>`);

    if (textParts.length > 0) {
      indicator.innerHTML = textParts.join(" | ");
    } else {
      indicator.innerText = "Mostrando todo el historial operativo de turnos";
    }
  }

  // Actualizar Tarjetas KPI de Defectos por Causa
  const kpiTot = document.getElementById("kpi-defectos-total");
  const kpiSold = document.getElementById("kpi-defectos-soldadura");
  const kpiSoldPct = document.getElementById("kpi-defectos-soldadura-pct");
  const kpiGolpe = document.getElementById("kpi-defectos-golpe");
  const kpiGolpePct = document.getElementById("kpi-defectos-golpe-pct");
  const kpiFalt = document.getElementById("kpi-defectos-faltante");
  const kpiFaltPct = document.getElementById("kpi-defectos-faltante-pct");
  const kpiScrap = document.getElementById("kpi-defectos-scrap");
  const kpiScrapPct = document.getElementById("kpi-defectos-scrap-pct");
  const kpiCritica = document.getElementById("kpi-defectos-linea-critica");
  const kpiCriticaDesc = document.getElementById("kpi-defectos-linea-critica-desc");

  if (kpiTot) kpiTot.innerText = defectItems.length;
  if (kpiSold) kpiSold.innerText = countSoldadura;
  if (kpiSoldPct) kpiSoldPct.innerText = totalDefectosEventos > 0 ? `${Math.round((countSoldadura / totalDefectosEventos) * 100)}% del total` : "0%";

  if (kpiGolpe) kpiGolpe.innerText = countGolpe;
  if (kpiGolpePct) kpiGolpePct.innerText = totalDefectosEventos > 0 ? `${Math.round((countGolpe / totalDefectosEventos) * 100)}% del total` : "0%";

  if (kpiFalt) kpiFalt.innerText = countFaltante;
  if (kpiFaltPct) kpiFaltPct.innerText = totalDefectosEventos > 0 ? `${Math.round((countFaltante / totalDefectosEventos) * 100)}% del total` : "0%";

  if (kpiScrap) kpiScrap.innerText = countScrap;
  if (kpiScrapPct) kpiScrapPct.innerText = totalDefectosEventos > 0 ? `${Math.round((countScrap / totalDefectosEventos) * 100)}% del total` : "0%";

  // Identificar línea/modelo más afectada
  let maxModel = "--";
  let maxCount = 0;
  Object.keys(modelDefectCounts).forEach(m => {
    if (modelDefectCounts[m] > maxCount) {
      maxCount = modelDefectCounts[m];
      maxModel = m;
    }
  });

  if (kpiCritica) kpiCritica.innerText = maxModel !== "--" ? maxModel : "Ninguna";
  if (kpiCriticaDesc) kpiCriticaDesc.innerText = maxCount > 0 ? `${maxCount} piezas defectuosas` : "Sin incidencias";

  // 1. Gr&#225;fica de Barras Apiladas por Área (EDIFICIO K vs FABS)
  renderChartDefectosAreasBar(defectItems);

  // 2. Gr&#225;fica Donut de Proporción de Defectos
  renderChartDefectosDonut(countSoldadura, countGolpe, countFaltante, countScrap);

  // 3. Gr&#225;fica de Barras Horizontal por Modelo (12 L&#237;neas)
  renderChartDefectosModelosBar(defectItems);

  // 4. Gr&#225;fica de Tendencia Diaria Multiturno (Lunes a Sábado)
  renderChartDefectosTendenciaBar(defectItems, filterTurno);

  // 5. Tabla Detallada de Incidencias con Turno
  renderDefectosTable(defectItems);
  renderChartDefectosMotivos(defectItems);
  renderPersonalRetroalimentacionTable(defectItems);
}

// 1. Gr&#225;fica de Barras Apiladas: EDIFICIO K vs FABS por Causa
function renderChartDefectosAreasBar(defectItems) {
  const ctx = document.getElementById("chart-defectos-areas-bar");
  if (!ctx) return;
  if (appState.chartInstances.defectosAreasBar) {
    appState.chartInstances.defectosAreasBar.destroy();
  }

  const areas = (appState.catalogos && appState.catalogos.areas) ? appState.catalogos.areas : ["FABS", "EDIFICIO K", "Pintura", "Ensamble"];
  const soldData = areas.map(() => 0);
  const golpeData = areas.map(() => 0);
  const faltData = areas.map(() => 0);
  const scrapData = areas.map(() => 0);

  defectItems.forEach(item => {
    let idx = areas.indexOf(item.area_ubicacion);
    if (idx === -1) idx = 0;
    const defs = getDefectosInfo(item);
    if (defs.includes("Soldadura")) soldData[idx]++;
    if (defs.includes("Golpe")) golpeData[idx]++;
    if (defs.includes("Falta de Componente")) faltData[idx]++;
    if (defs.includes("Scrap")) scrapData[idx]++;
  });

  appState.chartInstances.defectosAreasBar = new Chart(ctx, {
    type: "bar",
    data: {
      labels: areas,
      datasets: [
        {
          label: "Por Mala Soldadura",
          data: soldData,
          backgroundColor: "#ef4444",
          borderColor: "#f87171",
          borderWidth: 1.5,
          borderRadius: 4
        },
        {
          label: "Por Golpe",
          data: golpeData,
          backgroundColor: "#f97316",
          borderColor: "#fb923c",
          borderWidth: 1.5,
          borderRadius: 4
        },
        {
          label: "Por Falta de un Componente",
          data: faltData,
          backgroundColor: "#f59e0b",
          borderColor: "#fbbf24",
          borderWidth: 1.5,
          borderRadius: 4
        },
        {
          label: "Scrap / No Conforme",
          data: scrapData,
          backgroundColor: "#a855f7",
          borderColor: "#c084fc",
          borderWidth: 1.5,
          borderRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: { color: "#cbd5e1", boxWidth: 12, font: { size: 11, weight: "bold" } }
        },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y} pieza(s)`
          }
        }
      },
      scales: {
        x: {
          stacked: true,
          grid: { color: "rgba(51, 65, 85, 0.4)" },
          ticks: { color: "#ffffff", font: { size: 12, weight: "bold" } }
        },
        y: {
          stacked: true,
          beginAtZero: true,
          ticks: { stepSize: 1, color: "#94a3b8", font: { size: 11 } },
          grid: { color: "rgba(51, 65, 85, 0.4)" }
        }
      }
    }
  });

  const summaryEl = document.getElementById("defectos-areas-summary");
  if (summaryEl) {
    const totalK = soldData[0] + golpeData[0] + faltData[0] + scrapData[0];
    const totalF = soldData[1] + golpeData[1] + faltData[1] + scrapData[1];
    summaryEl.innerHTML = `🏭 <strong>EDIFICIO K:</strong> ${totalK} defecto(s) | <strong>FABS:</strong> ${totalF} defecto(s)`;
  }
}

// 2. Gr&#225;fica Donut: Proporción Global de Causas
function renderChartDefectosDonut(cSold, cGolpe, cFalt, cScrap) {
  const ctx = document.getElementById("chart-defectos-donut");
  if (!ctx) return;
  if (appState.chartInstances.defectosDonut) {
    appState.chartInstances.defectosDonut.destroy();
  }

  const total = cSold + cGolpe + cFalt + cScrap;
  const labels = [
    `Soldadura (${total > 0 ? Math.round((cSold / total) * 100) : 0}%)`,
    `Golpe (${total > 0 ? Math.round((cGolpe / total) * 100) : 0}%)`,
    `Falta de Componente (${total > 0 ? Math.round((cFalt / total) * 100) : 0}%)`,
    `Scrap (${total > 0 ? Math.round((cScrap / total) * 100) : 0}%)`
  ];
  const data = total > 0 ? [cSold, cGolpe, cFalt, cScrap] : [0, 0, 0, 0];

  appState.chartInstances.defectosDonut = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: ["#ef4444", "#f97316", "#f59e0b", "#a855f7"],
        borderColor: "#1e293b",
        borderWidth: 2
      }]
    },
    plugins: [piePercentagePlugin],
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: { boxWidth: 10, color: "#cbd5e1", font: { size: 10, weight: "bold" } }
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const val = ctx.parsed;
              const pct = total > 0 ? Math.round((val / total) * 100) : 0;
              return ` ${ctx.label}: ${val} piezas (${pct}%)`;
            }
          }
        }
      },
      cutout: "55%"
    }
  });

  const summaryEl = document.getElementById("defectos-donut-summary");
  if (summaryEl) {
    summaryEl.innerHTML = total > 0 
      ? `Total analizado: <strong class="text-white">${total}</strong> defectos registrados`
      : `Sin defectos en este rango`;
  }
}

// 3. Gr&#225;fica de Barras Horizontal Apilada por Causa: Defectos por Modelo / L&#237;nea (12 Modelos)
function renderChartDefectosModelosBar(defectItems) {
  const ctx = document.getElementById("chart-defectos-modelos-bar");
  if (!ctx) return;
  if (appState.chartInstances.defectosModelosBar) {
    appState.chartInstances.defectosModelosBar.destroy();
  }

  const modelos = appState.catalogos.modelos || [
    "LTTT", "MTTT", "MG", "WTS", "LWL 988", "LWL 990", 
    "MWL", "PUERTAS", "OHT", "LMT", "LOW VOLUME", "LMT K", "COBOT"
  ];

  // Estructura por modelo con desglose de las 4 causas requeridas:
  // Soldadura, Golpe, Scrap, Falta de Componente
  const modelStats = {};
  modelos.forEach(m => {
    modelStats[m] = {
      modelo: m,
      area: getAreaForModel(m),
      soldadura: 0,
      golpe: 0,
      scrap: 0,
      faltante: 0,
      total: 0
    };
  });

  defectItems.forEach(item => {
    if (!item.modelo || !modelStats[item.modelo]) return;
    const defs = getDefectosInfo(item);
    if (defs.length === 0) return;

    defs.forEach(d => {
      if (d === "Soldadura") modelStats[item.modelo].soldadura++;
      else if (d === "Golpe") modelStats[item.modelo].golpe++;
      else if (d === "Scrap") modelStats[item.modelo].scrap++;
      else if (d === "Falta de Componente") modelStats[item.modelo].faltante++;
    });
    modelStats[item.modelo].total += defs.length;
  });

  // Ordenar de mayor a menor número de defectos para destacar líneas críticas
  const sortedStats = Object.values(modelStats).sort((a, b) => {
    if (b.total !== a.total) return b.total - a.total;
    return a.modelo.localeCompare(b.modelo);
  });

  const sortedModelos = sortedStats.map(s => `${s.modelo} (${s.area})`);
  const maxTotal = Math.max(...sortedStats.map(s => s.total), 0);
  // Escala horizontal con margen visual (mínimo 4 o 5) para evitar que 1 defecto llene el 100% de la barra
  const suggestedMax = Math.max(maxTotal + 2, 4);

  // Datasets apilados por causa
  const datasets = [
    {
      label: "Soldadura",
      data: sortedStats.map(s => s.soldadura),
      backgroundColor: "rgba(59, 130, 246, 0.9)", // Azul
      borderColor: "#3b82f6",
      borderWidth: 1.5,
      borderRadius: 4
    },
    {
      label: "Golpe",
      data: sortedStats.map(s => s.golpe),
      backgroundColor: "rgba(245, 158, 11, 0.9)", // Ámbar
      borderColor: "#f59e0b",
      borderWidth: 1.5,
      borderRadius: 4
    },
    {
      label: "Scrap",
      data: sortedStats.map(s => s.scrap),
      backgroundColor: "rgba(239, 68, 68, 0.9)", // Rojo
      borderColor: "#ef4444",
      borderWidth: 1.5,
      borderRadius: 4
    },
    {
      label: "Falta de Componente",
      data: sortedStats.map(s => s.faltante),
      backgroundColor: "rgba(168, 85, 247, 0.9)", // Púrpura
      borderColor: "#a855f7",
      borderWidth: 1.5,
      borderRadius: 4
    }
  ];

  // Plugin personalizado para dibujar etiquetas claras y números directos en cada barra
  const barDataLabelsPlugin = {
    id: "barDataLabelsPlugin",
    afterDatasetsDraw(chart) {
      const { ctx, scales: { x, y } } = chart;
      ctx.save();

      sortedStats.forEach((stat, index) => {
        const yPos = y.getPixelForTick(index);

        if (stat.total === 0) {
          // L&#237;nea con 0 defectos: Indicador en verde esmeralda con check
          const xPos = x.getPixelForValue(0) + 10;
          ctx.fillStyle = "#34d399"; // emerald-400
          ctx.font = "bold 11px sans-serif";
          ctx.textAlign = "left";
          ctx.textBaseline = "middle";
          ctx.fillText("0  ✓  Sin defectos (100% Conforme)", xPos, yPos);
        } else {
          // L&#237;nea con defectos: Mostrar total e insignia de causas
          const xPos = x.getPixelForValue(stat.total) + 10;
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 12px monospace";
          ctx.textAlign = "left";
          ctx.textBaseline = "middle";

          const subDetalles = [];
          if (stat.soldadura > 0) subDetalles.push(`${stat.soldadura} Sold`);
          if (stat.golpe > 0) subDetalles.push(`${stat.golpe} Golpe`);
          if (stat.scrap > 0) subDetalles.push(`${stat.scrap} Scrap`);
          if (stat.faltante > 0) subDetalles.push(`${stat.faltante} Falt`);

          const labelText = `${stat.total} def (${subDetalles.join(", ")})`;
          ctx.fillText(labelText, xPos, yPos);
        }
      });

      ctx.restore();
    }
  };

  appState.chartInstances.defectosModelosBar = new Chart(ctx, {
    type: "bar",
    data: {
      labels: sortedModelos,
      datasets: datasets
    },
    plugins: [barDataLabelsPlugin],
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false // Usamos la leyenda visual superior en HTML
        },
        tooltip: {
          callbacks: {
            title: (items) => {
              const idx = items[0].dataIndex;
              const s = sortedStats[idx];
              return `L&#237;nea: ${s.modelo} • Total Defectos: ${s.total}`;
            },
            label: (ctx) => {
              const val = ctx.parsed.x;
              if (val === 0) return null;
              return ` ${ctx.dataset.label}: ${val} incidencia(s)`;
            }
          }
        }
      },
      scales: {
        x: {
          stacked: true,
          beginAtZero: true,
          suggestedMax: suggestedMax,
          ticks: {
            stepSize: 1,
            color: "#94a3b8",
            font: { size: 11, family: "monospace", weight: "bold" }
          },
          grid: { color: "rgba(51, 65, 85, 0.4)" },
          title: {
            display: true,
            text: "N&#250;mero de Defectos e Incidencias (Piezas)",
            color: "#64748b",
            font: { size: 10, weight: "bold" }
          }
        },
        y: {
          stacked: true,
          ticks: {
            color: "#ffffff",
            font: { size: 11, weight: "bold", family: "monospace" }
          },
          grid: { display: false }
        }
      }
    }
  });

  // Resumen ejecutivo al pie de la gráfica
  const summaryEl = document.getElementById("defectos-modelos-summary");
  if (summaryEl) {
    const linesWithDefects = sortedStats.filter(s => s.total > 0);
    const linesZeroDefects = sortedStats.filter(s => s.total === 0);

    if (linesWithDefects.length === 0) {
      summaryEl.innerHTML = `<span class="text-emerald-400 font-bold"><i class="fa-solid fa-circle-check"></i> Las 12 líneas de producción operan con Cero Defectos (100% Conformes).</span>`;
    } else {
      const topModel = linesWithDefects[0];
      const zeroModelNames = linesZeroDefects.map(s => s.modelo).join(", ");
      summaryEl.innerHTML = `
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span>🚨 L&#237;nea prioritaria: <strong class="text-rose-400 font-bold">${topModel.modelo}</strong> con <strong class="text-white">${topModel.total} defecto(s)</strong></span>
          <span class="text-emerald-400 font-medium"><i class="fa-solid fa-circle-check"></i> <strong>${linesZeroDefects.length} líneas</strong> con Cero Defectos ${zeroModelNames ? `(${zeroModelNames})` : ''}</span>
        </div>
      `;
    }
  }
}

// 4. Gr&#225;fica de Tendencia Diaria Multiturno (Lunes a Sábado)
function renderChartDefectosTendenciaBar(defectItems, filterTurno = "") {
  const ctx = document.getElementById("chart-defectos-tendencia-bar");
  if (!ctx) return;
  if (appState.chartInstances.defectosTendenciaBar) {
    appState.chartInstances.defectosTendenciaBar.destroy();
  }

  const diasDefectosStats = DIAS_LABORALES_CONFIG.map(col => ({
    dayNum: col.dayNum,
    nombre: col.nombre,
    fecha: col.defaultFecha,
    displayDate: col.defaultFecha ? col.defaultFecha.substring(5).replace("-", "/") : "",
    count: 0,
    t1: 0,
    t2: 0,
    t3: 0
  }));

  defectItems.forEach(item => {
    const fStr = (item.fecha_creacion || "").split(" ")[0];
    if (!fStr || !isDiaLaboral(fStr)) return;
    const parts = fStr.split("-");
    if (parts.length < 3) return;
    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    const day = d.getDay(); // 1 = Lunes, ..., 6 = Sábado
    const stat = diasDefectosStats.find(s => s.dayNum === day);
    if (stat) {
      stat.count++;
      stat.fecha = fStr;
      stat.displayDate = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;

      const tKey = getTurnoKey(item);
      if (tKey === "Turno 1") stat.t1++;
      else if (tKey === "Turno 2") stat.t2++;
      else if (tKey === "Turno 3") stat.t3++;
    }
  });

  const formattedLabels = diasDefectosStats.map(s => [s.nombre, s.displayDate ? `(${s.displayDate})` : ""]);

  let datasets = [];

  if (!filterTurno) {
    // Modo Multiturno: Desglose de qué turno generó los defectos cada día (Lunes a Sábado)
    datasets = [
      {
        label: "Turno 1 (Matutino: 06:00 - 14:00)",
        data: diasDefectosStats.map(s => s.t1),
        backgroundColor: "#0ea5e9",
        borderColor: "#38bdf8",
        borderWidth: 1.5,
        borderRadius: 4,
        stack: "defectos"
      },
      {
        label: "Turno 2 (Vespertino: 14:00 - 21:30)",
        data: diasDefectosStats.map(s => s.t2),
        backgroundColor: "#f59e0b",
        borderColor: "#fbbf24",
        borderWidth: 1.5,
        borderRadius: 4,
        stack: "defectos"
      },
      {
        label: "Turno 3 (Nocturno: 21:30 - 06:00)",
        data: diasDefectosStats.map(s => s.t3),
        backgroundColor: "#a855f7",
        borderColor: "#c084fc",
        borderWidth: 1.5,
        borderRadius: 4,
        stack: "defectos"
      }
    ];
  } else {
    // Si se filtró un turno específico
    let color = "#0ea5e9";
    let colorBorder = "#38bdf8";
    if (filterTurno === "Turno 2") { color = "#f59e0b"; colorBorder = "#fbbf24"; }
    else if (filterTurno === "Turno 3") { color = "#a855f7"; colorBorder = "#c084fc"; }

    const data = diasDefectosStats.map(s => {
      if (filterTurno === "Turno 1") return s.t1;
      if (filterTurno === "Turno 2") return s.t2;
      return s.t3;
    });

    datasets = [{
      label: `Defectos en ${filterTurno}`,
      data: data,
      backgroundColor: color,
      borderColor: colorBorder,
      borderWidth: 1.5,
      borderRadius: 6
    }];
  }

  appState.chartInstances.defectosTendenciaBar = new Chart(ctx, {
    type: "bar",
    data: {
      labels: formattedLabels,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: "top",
          labels: { boxWidth: 12, color: "#cbd5e1", font: { size: 10, weight: "bold" } }
        },
        tooltip: {
          callbacks: {
            title: (items) => {
              const idx = items[0].dataIndex;
              const s = diasDefectosStats[idx];
              return `${s.nombre} • ${s.fecha}`;
            },
            label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y} defecto(s)`,
            afterBody: (items) => {
              const idx = items[0].dataIndex;
              const s = diasDefectosStats[idx];
              return [
                `──────────────────────────`,
                `Total Defectos: ${s.count} incidencia(s)`,
                `• T1 (Matutino): ${s.t1} defecto(s)`,
                `• T2 (Vespertino): ${s.t2} defecto(s)`,
                `• T3 (Nocturno): ${s.t3} defecto(s)`
              ];
            }
          }
        }
      },
      scales: {
        x: {
          stacked: true,
          grid: { color: "rgba(51, 65, 85, 0.4)" },
          ticks: { color: "#cbd5e1", font: { size: 10, weight: "bold" } }
        },
        y: {
          stacked: true,
          beginAtZero: true,
          ticks: { stepSize: 1, color: "#94a3b8", font: { size: 10 } },
          grid: { color: "rgba(51, 65, 85, 0.4)" }
        }
      }
    }
  });

  const totalDefectos = diasDefectosStats.reduce((acc, s) => acc + s.count, 0);
  const diasConDefectos = diasDefectosStats.filter(s => s.count > 0).length;
  const summaryEl = document.getElementById("defectos-tendencia-summary");
  if (summaryEl) {
    summaryEl.innerHTML = totalDefectos > 0
      ? `Total: <strong class="text-white">${totalDefectos} defecto(s)</strong> en ${diasConDefectos} jornada(s) laboral(es) (Lunes a Sábado)`
      : `Sin defectos registrados en el per&#237;odo`;
  }
}

// 5. Tabla Detallada de Piezas con Defectos y Turno
function renderDefectosTable(defectItems) {
  const tbody = document.getElementById("defectos-table-body");
  const countLabel = document.getElementById("defectos-table-count");
  if (!tbody) return;

  if (countLabel) {
    countLabel.innerText = `Mostrando ${defectItems.length} componente(s) con no conformidad`;
  }

  if (defectItems.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" class="px-4 py-8 text-center text-slate-500 italic">
          No se encontraron componentes con defectos según los filtros aplicados.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = "";
  defectItems.forEach(item => {
    const tr = document.createElement("tr");
    tr.className = "hover:bg-slate-700/40 transition text-xs";

    const fRaw = (item.fecha_creacion || "").split(" ")[0];
    const fDia = fRaw 
      ? `<div class="flex items-center gap-1.5"><span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase">${getNombreDiaSemana(fRaw)}</span><span>${fRaw}</span></div>` 
      : "-";

    const defs = getDefectosInfo(item);
    let badgesHtml = "";
    defs.forEach(d => {
      if (d === "Soldadura") {
        badgesHtml += `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30 mr-1 whitespace-nowrap"><i class="fa-solid fa-fire mr-1 text-red-400"></i>Soldadura</span>`;
      } else if (d === "Golpe") {
        badgesHtml += `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30 mr-1 whitespace-nowrap"><i class="fa-solid fa-hammer mr-1 text-orange-400"></i>Golpe</span>`;
      } else if (d === "Falta de Componente") {
        badgesHtml += `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 mr-1 whitespace-nowrap"><i class="fa-solid fa-puzzle-piece mr-1 text-amber-400"></i>Faltante</span>`;
      } else if (d === "Scrap") {
        badgesHtml += `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 mr-1 whitespace-nowrap"><i class="fa-solid fa-trash-can mr-1 text-purple-400"></i>Scrap</span>`;
      }
    });

    const descHallazgo = item.descripcion_faltantes || (item.turnos && item.turnos[0] ? item.turnos[0].notas : "") || "Defecto reportado en inspección";
    const tKey = getTurnoKey(item);
    const tBadge = getTurnoBadgeHtml(tKey);
    const inspectorName = DEFAULT_USUARIOS.find(u => u.nomina == item.nomina_creador)?.nombre || `Nómina ${item.nomina_creador}`;

    tr.innerHTML = `
      <td class="px-4 py-3 font-mono font-bold text-cyan-400">${item.id_inspeccion}</td>
      <td class="px-4 py-3 text-slate-300 whitespace-nowrap">${fDia}</td>
      <td class="px-4 py-3">
        <span class="px-2 py-0.5 rounded text-[10px] font-bold ${item.area_ubicacion === 'EDIFICIO K' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'}">
          ${item.area_ubicacion}
        </span>
      </td>
      <td class="px-4 py-3 font-bold text-white">${item.modelo}</td>
      <td class="px-4 py-3 font-mono text-slate-300">${item.numero_serie}</td>
      <td class="px-4 py-3">${badgesHtml}</td>
      <td class="px-4 py-3 text-slate-300 max-w-xs truncate" title="${descHallazgo}">
        ${descHallazgo}
      </td>
      <td class="px-4 py-3">
        <div class="font-bold text-white text-xs">${inspectorName}</div>
        <div class="mt-1">${tBadge}</div>
      </td>
      <td class="px-4 py-3">
        <span class="px-2 py-0.5 rounded text-[10px] font-bold ${item.estatus === 'Rechazado' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : item.estatus === 'Pausado' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'}">
          ${item.estatus}
        </span>
      </td>
      <td class="px-4 py-3 text-right whitespace-nowrap">
        <button onclick="openDetailModal('${item.id_inspeccion}')" class="px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 hover:text-white text-xs font-semibold transition flex items-center gap-1 ml-auto">
          <i class="fa-solid fa-eye text-cyan-400"></i> Detalle
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ==================== MANEJADORES DE FILTROS DE DEFECTOS ====================
function applyDefectosFilters() {
  renderDefectosTab();
}

function handleDefectosDateFilterChange() {
  const sel = document.getElementById("defectos-filter-periodo");
  const inInicio = document.getElementById("defectos-fecha-inicio")?.value;
  const inFin = document.getElementById("defectos-fecha-fin")?.value;

  if (sel && (inInicio || inFin)) {
    sel.value = "custom";
  }
  renderDefectosTab();
}

function handleDefectosPresetPeriodChange() {
  const preset = document.getElementById("defectos-filter-periodo")?.value || "all";
  const inInicio = document.getElementById("defectos-fecha-inicio");
  const inFin = document.getElementById("defectos-fecha-fin");

  const today = new Date();
  if (preset === "all") {
    if (inInicio) inInicio.value = "";
    if (inFin) inFin.value = "";
  } else if (preset === "today") {
    const todayStr = formatYMD(today);
    if (inInicio) inInicio.value = todayStr;
    if (inFin) inFin.value = todayStr;
  } else if (preset === "7days") {
    const past7 = new Date(today);
    past7.setDate(today.getDate() - 7);
    if (inInicio) inInicio.value = formatYMD(past7);
    if (inFin) inFin.value = formatYMD(today);
  } else if (preset === "14days") {
    const past14 = new Date(today);
    past14.setDate(today.getDate() - 14);
    if (inInicio) inInicio.value = formatYMD(past14);
    if (inFin) inFin.value = formatYMD(today);
  } else if (preset === "30days") {
    const past30 = new Date(today);
    past30.setDate(today.getDate() - 30);
    if (inInicio) inInicio.value = formatYMD(past30);
    if (inFin) inFin.value = formatYMD(today);
  }

  renderDefectosTab();
}

function resetDefectosDateFilter() {
  const area = document.getElementById("defectos-filter-area");
  const modelo = document.getElementById("defectos-filter-modelo");
  const tipo = document.getElementById("defectos-filter-tipo");
  const turno = document.getElementById("defectos-filter-turno");
  const inInicio = document.getElementById("defectos-fecha-inicio");
  const inFin = document.getElementById("defectos-fecha-fin");
  const selPeriodo = document.getElementById("defectos-filter-periodo");

  if (area) area.value = "";
  if (modelo) modelo.value = "";
  if (tipo) tipo.value = "";
  if (turno) turno.value = "";
  if (inInicio) inInicio.value = "";
  if (inFin) inFin.value = "";
  if (selPeriodo) selPeriodo.value = "all";

  renderDefectosTab();
}

// ==================== MÓDULO: LÍNEAS CON CABINA FINALIZADA (REQUIEREN COORDINADOR) ====================
let currentCabinasFilter = 'all';
let activeInspeccionCabinaId = null;

function getNivelUrgenciaCabina(item) {
  if (!item || item.estatus !== "Esperando Coordinador") return "none";
  if (item.nivel_urgencia === "critica" || item.nivel_urgencia === "media" || item.nivel_urgencia === "baja") {
    return item.nivel_urgencia;
  }
  const mins = Number(item.minutos_espera) || 0;
  if (mins >= 20) return "critica";
  if (mins >= 12) return "media";
  return "baja";
}

function updateCabinasBadge() {
  if (!appState.cabinasCoordinador) {
    appState.cabinasCoordinador = JSON.parse(JSON.stringify(DEFAULT_CABINAS_COORDINADOR));
  }

  const pending = appState.cabinasCoordinador.filter(c => c.estatus === "Esperando Coordinador");
  const count = pending.length;
  const fabsCount = pending.filter(c => c.area === "FABS").length;
  const kCount = pending.filter(c => c.area === "EDIFICIO K").length;
  const criticaCount = pending.filter(c => getNivelUrgenciaCabina(c) === "critica").length;
  const mediaCount = pending.filter(c => getNivelUrgenciaCabina(c) === "media").length;
  const bajaCount = pending.filter(c => getNivelUrgenciaCabina(c) === "baja").length;
  const countText = `${count} L&#237;nea${count === 1 ? '' : 's'}`;

  // 1. Badge superior en barra de navegación (zona encerrada)
  const badgeNav = document.getElementById("badge-cabinas-count");
  if (badgeNav) {
    badgeNav.innerText = countText;
    if (count > 0) {
      badgeNav.className = "px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono text-[11px] font-extrabold";
    } else {
      badgeNav.className = "px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono text-[11px] font-bold";
      badgeNav.innerText = "0 L&#237;neas";
    }
  }

  const pingContainer = document.getElementById("cabinas-ping-container");
  if (pingContainer) {
    if (count > 0) {
      pingContainer.style.display = "flex";
    } else {
      pingContainer.style.display = "none";
    }
  }

  // 2. Encabezado y contadores del modal
  const modalHeaderBadge = document.getElementById("modal-cabinas-badge-header");
  if (modalHeaderBadge) {
    modalHeaderBadge.innerText = `${count} L&#237;nea${count === 1 ? '' : 's'} en Espera`;
    if (count === 0) {
      modalHeaderBadge.className = "px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono";
      modalHeaderBadge.innerText = "Todas las L&#237;neas al Día";
    } else {
      modalHeaderBadge.className = "px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono";
    }
  }

  const countAll = document.getElementById("count-cabinas-all");
  if (countAll) countAll.innerText = count;
  const countFabs = document.getElementById("count-cabinas-fabs");
  if (countFabs) countFabs.innerText = fabsCount;
  const countK = document.getElementById("count-cabinas-k");
  if (countK) countK.innerText = kCount;
  const countCritica = document.getElementById("count-cabinas-critica");
  if (countCritica) countCritica.innerText = criticaCount;
  const countMedia = document.getElementById("count-cabinas-media");
  if (countMedia) countMedia.innerText = mediaCount;
  const countBaja = document.getElementById("count-cabinas-baja");
  if (countBaja) countBaja.innerText = bajaCount;

  // 3. Alerta en Nueva Inspecci&#243;n
  const nuevaCount = document.getElementById("nueva-cabinas-count-text");
  if (nuevaCount) nuevaCount.innerText = countText;
  const nuevaAlert = document.getElementById("nueva-cabinas-alert");
  if (nuevaAlert) {
    if (count > 0) nuevaAlert.classList.remove("hidden");
    else nuevaAlert.classList.add("hidden");
  }

  // 4. Alerta en Dashboard Gerente
  const gerenteBadge = document.getElementById("gerente-cabinas-badge");
  if (gerenteBadge) {
    gerenteBadge.innerText = `${count} L&#237;nea${count === 1 ? '' : 's'} Requieren Coordinador`;
    if (count === 0) {
      gerenteBadge.className = "px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono";
      gerenteBadge.innerText = "Cabinas al 100% Liberadas";
    } else {
      gerenteBadge.className = "px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono";
    }
  }
  const gerenteSummary = document.getElementById("gerente-cabinas-summary");
  if (gerenteSummary) {
    if (count > 0) {
      const summaryList = pending.map(c => `${c.linea} (${c.serie_cabina})`).join(", ");
      gerenteSummary.innerText = `L&#237;neas en espera de liberación: ${summaryList}`;
    } else {
      gerenteSummary.innerText = "Todas las cabinas finalizadas en piso han sido inspeccionadas y liberadas por el coordinador.";
    }
  }

  // 5. Actualizar notificaciones del panel lateral para coordinadores
  if (typeof renderSidebarNotificaciones === "function") {
    renderSidebarNotificaciones();
  }

  // 6. Actualizar estado y parpadeo de sensores en mapa de planta
  if (typeof updatePlantSensorsStatus === "function") {
    updatePlantSensorsStatus();
  }
}

// ==================== PANEL LATERAL: COLAPSO / EXPANSIÓN Y NOTIFICACIONES DE LÍNEAS ====================
function toggleSidebarCard(bodyId, chevronId) {
  const body = document.getElementById(bodyId);
  const chevron = document.getElementById(chevronId);
  if (!body) return;
  const isHidden = body.classList.contains("hidden");
  if (isHidden) {
    body.classList.remove("hidden");
    if (chevron) {
      chevron.style.transform = "rotate(0deg)";
    }
  } else {
    body.classList.add("hidden");
    if (chevron) {
      chevron.style.transform = "rotate(-90deg)";
    }
  }
}
window.toggleSidebarCard = toggleSidebarCard;

function renderSidebarNotificaciones() {
  const container = document.getElementById("side-notificaciones-container");
  const countBadge = document.getElementById("side-notif-count-badge");
  const pingEl = document.getElementById("side-notif-ping");
  if (!container) return;

  if (!appState.cabinasCoordinador) {
    appState.cabinasCoordinador = JSON.parse(JSON.stringify(DEFAULT_CABINAS_COORDINADOR));
  }

  const cabinas = appState.cabinasCoordinador || [];
  const pending = cabinas.filter(c => c.estatus === "Esperando Coordinador");
  const u = appState.currentUser || {};
  const userNomina = String(u.nomina || "");
  const userName = (u.nombre || "").toLowerCase();

  // Actualizar badges del encabezado
  if (countBadge) {
    countBadge.innerText = `${pending.length} L&#237;nea${pending.length === 1 ? '' : 's'}`;
    if (pending.length > 0) {
      countBadge.className = "px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono";
    } else {
      countBadge.className = "px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono";
      countBadge.innerText = "0 L&#237;neas";
    }
  }

  if (pingEl) {
    pingEl.style.display = pending.length > 0 ? "flex" : "none";
  }

  if (pending.length === 0) {
    container.innerHTML = `
      <div class="text-center py-5 px-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
        <div class="w-10 h-10 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shadow-sm">
          <i class="fa-solid fa-circle-check text-lg"></i>
        </div>
        <p class="text-xs font-bold text-slate-200">¡L&#237;neas al Día!</p>
        <p class="text-[11px] text-slate-400">No hay líneas en espera de coordinador en este momento.</p>
      </div>
    `;
    return;
  }

  // Ordenar: primero las que solicitan explícitamente a este coordinador (por nómina o nombre),
  // luego por nivel de urgencia (crítica > media > baja), y finalmente por minutos de espera.
  const sorted = [...pending].sort((a, b) => {
    const aMatch = userNomina && (
      (a.coordinador_solicitado && a.coordinador_solicitado.includes(userNomina)) ||
      (a.coordinador_asignado && String(a.coordinador_asignado) === userNomina)
    );
    const bMatch = userNomina && (
      (b.coordinador_solicitado && b.coordinador_solicitado.includes(userNomina)) ||
      (b.coordinador_asignado && String(b.coordinador_asignado) === userNomina)
    );
    if (aMatch && !bMatch) return -1;
    if (!aMatch && bMatch) return 1;

    const urgA = getNivelUrgenciaCabina(a);
    const urgB = getNivelUrgenciaCabina(b);
    const valUrg = { critica: 3, media: 2, baja: 1, none: 0 };
    if (valUrg[urgA] !== valUrg[urgB]) return valUrg[urgB] - valUrg[urgA];

    return (b.minutos_espera || 0) - (a.minutos_espera || 0);
  });

  let html = "";
  sorted.forEach(c => {
    const urg = getNivelUrgenciaCabina(c);
    const isDirectlyRequested = userNomina && (
      (c.coordinador_solicitado && c.coordinador_solicitado.includes(userNomina)) ||
      (c.coordinador_asignado && String(c.coordinador_asignado) === userNomina)
    );

    let urgBadge = "";
    let borderAccent = "border-slate-700/80";
    let bgAccent = "bg-slate-800/85";

    if (urg === "critica") {
      urgBadge = `<span class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1 animate-pulse"><i class="fa-solid fa-triangle-exclamation"></i> ${c.minutos_espera || 20}m Crítica</span>`;
      borderAccent = "border-rose-500/40 shadow-sm shadow-rose-950/40";
      bgAccent = "bg-gradient-to-br from-slate-800 via-rose-950/25 to-slate-800";
    } else if (urg === "media") {
      urgBadge = `<span class="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1"><i class="fa-solid fa-clock"></i> ${c.minutos_espera || 15}m Media</span>`;
      borderAccent = "border-amber-500/40";
      bgAccent = "bg-gradient-to-br from-slate-800 via-amber-950/20 to-slate-800";
    } else {
      urgBadge = `<span class="px-2 py-0.5 rounded-full text-[9px] font-medium uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1"><i class="fa-solid fa-clock"></i> ${c.minutos_espera || 5}m Baja</span>`;
      borderAccent = "border-blue-500/30";
      bgAccent = "bg-slate-800/90";
    }

    const forMeBadge = isDirectlyRequested
      ? `<span class="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 shadow-sm"><i class="fa-solid fa-user-tag text-[9px]"></i> Te Solicitan</span>`
      : "";

    const supervisorText = c.supervisor_linea || c.solicitante || "Supervisor de L&#237;nea";

    html += `
      <div class="p-3 rounded-xl ${bgAccent} border ${borderAccent} transition hover:border-slate-500 hover:bg-slate-750/70 shadow-sm space-y-2">
        <div class="flex items-start justify-between gap-1.5">
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="inline-flex items-center gap-1 text-xs font-black text-white bg-slate-700/80 border border-slate-600/60 px-2 py-0.5 rounded-md">
              <i class="fa-solid fa-industry text-amber-400 text-[11px]"></i> L&#237;nea ${c.linea}
            </span>
            ${forMeBadge}
          </div>
          <div class="shrink-0">
            ${urgBadge}
          </div>
        </div>

        <div class="text-[11px] text-slate-300 space-y-1">
          <div class="flex items-center justify-between text-slate-300">
            <span class="font-mono font-bold text-cyan-400 flex items-center gap-1.5">
              <i class="fa-solid fa-truck-pickup text-slate-400 text-[10px]"></i> ${c.serie_cabina || c.id}
            </span>
            <span class="text-[10px] px-1.5 py-0.2 rounded bg-slate-700/60 text-slate-300 border border-slate-600/40 font-mono">${c.area || 'FABS'}</span>
          </div>
          <div class="text-[10.5px] text-slate-400 truncate flex items-center gap-1" title="${c.estacion || ''}">
            <i class="fa-solid fa-location-dot text-rose-400/80 text-[10px] shrink-0"></i>
            <span class="truncate">${c.estacion || 'Estación de Ensamble'}</span>
          </div>
          <div class="text-[10px] text-slate-400 truncate flex items-center gap-1" title="${supervisorText}">
            <i class="fa-solid fa-user-tie text-blue-400 text-[10px] shrink-0"></i>
            <span class="truncate">${supervisorText}</span>
          </div>
        </div>

        <div class="pt-1 flex items-center gap-2">
          <button type="button" onclick="abrirInspeccionCabina('${c.id}')" class="flex-1 py-1.5 px-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-[11px] shadow-sm shadow-emerald-700/30 flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer">
            <i class="fa-solid fa-clipboard-check text-xs"></i> Atender L&#237;nea
          </button>
          <button type="button" onclick="filtrarPorLineaQG('${c.linea}')" title="Filtrar esta línea en el módulo de cabinas" class="py-1.5 px-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600/60 text-[11px] font-semibold flex items-center justify-center transition cursor-pointer">
            <i class="fa-solid fa-arrow-up-right-from-square text-cyan-400"></i>
          </button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}
window.renderSidebarNotificaciones = renderSidebarNotificaciones;

function logAuditAction(entry) {
  try {
    if (!appState.auditoria) appState.auditoria = [];
    const nowStr = new Date().toISOString().replace("T", " ").substring(0, 19);
    appState.auditoria.unshift({
      id_auditoria: "AUD-" + Date.now(),
      id_inspeccion: entry.id_inspeccion || "CABINA-QG",
      nomina_editor: entry.usuario || (appState.currentUser ? appState.currentUser.nomina : 1042),
      fecha_hora: nowStr,
      campo_modificado: entry.campo_modificado || "Liberaci&#243;n QG",
      status_anterior: entry.valor_anterior || "En L&#237;nea",
      status_final: entry.status_final || "Esperando Coordinador",
      valor_anterior: entry.valor_anterior || "En L&#237;nea",
      valor_nuevo: entry.status_final || "Esperando Coordinador",
      justificacion_motivo: entry.motivo || ""
    });
    if (typeof renderAuditTable === "function") {
      renderAuditTable();
    }
  } catch (err) {
    console.warn("logAuditAction warning:", err);
  }
}

function updateLineFilterButtonsCounts() {
  const list = appState.cabinasCoordinador || [];
  const bar = document.getElementById("cabinas-lineas-buttons-bar");
  if (!bar) return;

  const buttons = bar.querySelectorAll("button[data-linea-btn]");
  buttons.forEach(btn => {
    const linea = btn.getAttribute("data-linea-btn");
    const isActive = (linea === "all" && currentCabinasFilter === "all") || (currentCabinasFilter === `LINEA:${linea}`);
    if (linea === "all") {
      const total = list.length;
      btn.innerHTML = `📋 Todas las L&#237;neas (${total})`;
      btn.className = isActive
        ? "px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 border border-amber-300 text-[10px] font-black whitespace-nowrap transition cursor-pointer shadow-md"
        : "px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-slate-200 border border-slate-700 text-[10px] font-bold whitespace-nowrap transition cursor-pointer";
    } else {
      const count = list.filter(c => c.linea === linea).length;
      const isK = LINEA_AREA_MAP[linea] === "EDIFICIO K";
      const icon = isK ? "🏢" : "🏭";
      const badgeStr = count > 0 ? ` (${count})` : "";
      btn.innerHTML = `${icon} Sup. ${linea}${badgeStr}`;
      if (isActive) {
        btn.className = "px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 border-2 border-white text-[10px] font-black whitespace-nowrap transition cursor-pointer shadow-[0_0_12px_rgba(251,191,36,0.8)]";
      } else if (isK) {
        btn.className = "px-2 py-1 rounded-lg bg-slate-900 hover:bg-sky-400 hover:text-slate-950 text-sky-300 border border-sky-500/40 text-[10px] font-extrabold whitespace-nowrap transition cursor-pointer";
      } else {
        btn.className = "px-2 py-1 rounded-lg bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-amber-300 border border-amber-500/40 text-[10px] font-extrabold whitespace-nowrap transition cursor-pointer";
      }
    }
  });
}

let tempFotosCabinaQG = [];

function isCurrentUserQGOnly() {
  return Boolean(appState.currentUser && appState.currentUser.rol === "colaborador");
}

function applyQGModalRoleVisibility() {
  const btnForm = document.getElementById("btn-toggle-form-cabina");
  const secForm = document.getElementById("form-solicitar-cabina-container");
  const secLista = document.getElementById("seccion-qg-lista-urgencias");
  const footerHint = document.getElementById("qg-modal-footer-hint");

  if (isCurrentUserQGOnly()) {
    // Para los Coordinadores / QG: SOLO mostrar "Urgencias por Checar" y ocultar "Subir Información"
    if (btnForm) {
      btnForm.classList.add("hidden");
      btnForm.style.display = "none";
    }
    if (secForm) secForm.classList.add("hidden");
    if (secLista) secLista.classList.remove("hidden");
    if (footerHint) {
      footerHint.innerHTML = `Vista de <strong>Coordinador / QG</strong>: Revisa las urgencias por checar, registra tus datos y sube fotos de evidencia de inspección.`;
    }
  } else {
    // Para Supervisores de L&#237;nea, Supervisor General y Gerente: Mostrar ambas opciones
    if (btnForm) {
      btnForm.classList.remove("hidden");
      btnForm.style.display = "";
    }
    if (footerHint) {
      footerHint.innerHTML = `Usa los iconos superiores para alternar entre <strong>Urgencias por Checar</strong> y <strong>Subir Información del Supervisor de L&#237;nea</strong>.`;
    }
  }
}

function openCabinasCoordinadorModal() {
  switchTab("cabinas");
}

function closeCabinasCoordinadorModal() {
  const modal = document.getElementById("modal-cabinas-coordinador");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
}

function filtrarPorLineaQG(linea) {
  const selFilter = document.getElementById("filter-cabinas-linea-select");
  if (selFilter) {
    selFilter.value = linea || "all";
  }

  if (!linea || linea === "all") {
    filterCabinasList("all");
    return;
  }

  // Preseleccionar también la línea en el formulario de envío para comodidad del Supervisor de L&#237;nea
  const selFormLinea = document.getElementById("solicitar-cabina-linea");
  if (selFormLinea) {
    selFormLinea.value = linea;
    handleChangeSupervisorLineaSelect();
  }

  filterCabinasList(`LINEA:${linea}`);
}

function filterCabinasList(filter) {
  if (filter === "urgentes") filter = "critica";
  currentCabinasFilter = filter;

  const baseButtons = {
    all: document.getElementById("filter-cabinas-all"),
    FABS: document.getElementById("filter-cabinas-fabs"),
    "EDIFICIO K": document.getElementById("filter-cabinas-k")
  };

  Object.keys(baseButtons).forEach(k => {
    const btn = baseButtons[k];
    if (btn) {
      if (k === filter) {
        btn.className = "px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 text-slate-950 shadow-sm cursor-pointer transition";
      } else {
        btn.className = "px-3 py-1.5 rounded-lg text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer transition";
      }
    }
  });

  const btnCritica = document.getElementById("filter-cabinas-critica");
  if (btnCritica) {
    btnCritica.className = filter === "critica"
      ? "px-3 py-1.5 rounded-lg text-xs font-black text-white bg-red-600 border-2 border-red-200 shadow-[0_0_16px_rgba(239,68,68,0.85)] cursor-pointer transition flex items-center gap-1.5"
      : "px-3 py-1.5 rounded-lg text-xs font-extrabold text-red-200 bg-red-950/60 hover:bg-red-600 hover:text-white border border-red-500/60 cursor-pointer transition flex items-center gap-1.5 shadow-sm";
  }

  const btnMedia = document.getElementById("filter-cabinas-media");
  if (btnMedia) {
    btnMedia.className = filter === "media"
      ? "px-3 py-1.5 rounded-lg text-xs font-black text-slate-950 bg-yellow-400 border-2 border-yellow-100 shadow-[0_0_16px_rgba(250,204,21,0.85)] cursor-pointer transition flex items-center gap-1.5"
      : "px-3 py-1.5 rounded-lg text-xs font-extrabold text-yellow-200 bg-yellow-950/60 hover:bg-yellow-400 hover:text-slate-950 border border-yellow-400/60 cursor-pointer transition flex items-center gap-1.5 shadow-sm";
  }

  const btnBaja = document.getElementById("filter-cabinas-baja");
  if (btnBaja) {
    btnBaja.className = filter === "baja"
      ? "px-3 py-1.5 rounded-lg text-xs font-black text-white bg-blue-600 border-2 border-blue-200 shadow-[0_0_16px_rgba(59,130,246,0.9)] cursor-pointer transition flex items-center gap-1.5"
      : "px-3 py-1.5 rounded-lg text-xs font-extrabold text-sky-200 bg-blue-950/70 hover:bg-blue-500 hover:text-white border border-blue-400/70 cursor-pointer transition flex items-center gap-1.5 shadow-sm";
  }

  const selFilter = document.getElementById("filter-cabinas-linea-select");
  if (selFilter) {
    if (filter && filter.startsWith("LINEA:")) {
      selFilter.value = filter.replace("LINEA:", "");
    } else {
      selFilter.value = "all";
    }
  }

  updateCabinasBadge();
  updateLineFilterButtonsCounts();
  renderCabinasCoordinadorList(filter);
}

function renderCabinasCoordinadorList(filter = 'all') {
  const container = document.getElementById("cabinas-coordinador-list");
  const tbody = document.getElementById("cabinas-coordinador-table-body");
  if (!container && !tbody) return;

  if (!appState.cabinasCoordinador) {
    appState.cabinasCoordinador = JSON.parse(JSON.stringify(DEFAULT_CABINAS_COORDINADOR));
  }

  applyQGModalRoleVisibility();
  updateCabinasBadge();
  updateLineFilterButtonsCounts();

  let list = [...appState.cabinasCoordinador];
  let filteredLineName = null;
  if (filter === "FABS") {
    list = list.filter(c => c.area === "FABS");
  } else if (filter === "EDIFICIO K") {
    list = list.filter(c => c.area === "EDIFICIO K");
  } else if (filter === "critica" || filter === "urgentes") {
    list = list.filter(c => getNivelUrgenciaCabina(c) === "critica");
  } else if (filter === "media") {
    list = list.filter(c => getNivelUrgenciaCabina(c) === "media");
  } else if (filter === "baja") {
    list = list.filter(c => getNivelUrgenciaCabina(c) === "baja");
  } else if (filter && filter.startsWith("LINEA:")) {
    filteredLineName = filter.replace("LINEA:", "");
    list = list.filter(c => c.linea === filteredLineName);
  }

  // Ordenar: primero las que están esperando coordinador (de mayor a menor tiempo de espera), luego las liberadas
  list.sort((a, b) => {
    if (a.estatus === "Esperando Coordinador" && b.estatus !== "Esperando Coordinador") return -1;
    if (a.estatus !== "Esperando Coordinador" && b.estatus === "Esperando Coordinador") return 1;
    return (b.minutos_espera || 0) - (a.minutos_espera || 0);
  });

  if (list.length === 0) {
    const supInfo = filteredLineName ? SUPERVISORES_POR_LINEA[filteredLineName] : null;
    const urgenciaLabels = {
      critica: "con urgencia CRÍTICA",
      media: "con urgencia MEDIO URGENTE",
      baja: "con BAJA URGENCIA"
    };
    const urgLabel = urgenciaLabels[filter] || "para este filtro";

    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" class="p-8 text-center">
            <div class="space-y-3 max-w-md mx-auto">
              <div class="w-11 h-11 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-lg mx-auto">
                <i class="fa-solid fa-circle-check"></i>
              </div>
              <div class="text-white font-black text-sm">
                ${filteredLineName ? `L&#237;nea ${filteredLineName} sin Cabinas en Espera de QG` : `Sin Cabinas Pendientes ${urgLabel}`}
              </div>
              <div class="text-xs text-slate-400">
                ${filteredLineName
                  ? `${supInfo ? supInfo.nombre : 'El Supervisor de L&#237;nea'} puede enviar información cuando requiera que un Coordinador / QG acuda a liberar una cabina en L&#237;nea ${filteredLineName}.`
                  : `No hay cabinas terminadas en espera de coordinador ${urgLabel}.`}
              </div>
              <div class="pt-1 flex items-center justify-center gap-2">
                ${(filteredLineName && !isCurrentUserQGOnly()) ? `
                  <button type="button" onclick="seleccionarSupervisorLineaParaQG('${filteredLineName}')" class="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs shadow-lg cursor-pointer transition">
                    <i class="fa-solid fa-paper-plane mr-1"></i> + Mandar Info a QG desde L&#237;nea ${filteredLineName}
                  </button>
                ` : ''}
                <button type="button" onclick="filterCabinasList('all')" class="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer transition">
                  Ver Todas las Urgencias
                </button>
              </div>
            </div>
          </td>
        </tr>
      `;
    }

    if (container) {
      container.innerHTML = `
        <div class="p-6 text-center space-y-3 bg-slate-950/70 rounded-2xl border border-slate-800 my-auto">
          <div class="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xl mx-auto shadow-inner">
            <i class="fa-solid fa-circle-check"></i>
          </div>
          <h4 class="text-white font-black text-sm">
            ${filteredLineName ? `L&#237;nea ${filteredLineName} sin Cabinas en Espera de QG` : `Sin Cabinas Pendientes ${urgLabel}`}
          </h4>
          <p class="text-xs text-slate-400 max-w-md mx-auto">
            ${filteredLineName
              ? `${supInfo ? supInfo.nombre : 'El Supervisor de L&#237;nea'} puede enviar información cuando requiera que un Coordinador / QG acuda a liberar una cabina en L&#237;nea ${filteredLineName}.`
              : `No hay cabinas terminadas en espera de coordinador ${urgLabel}.`}
          </p>
        </div>
      `;
    }
    return;
  }

  // 1. Renderizar Tabla Normal igual a las otras pestañas (#cabinas-coordinador-table-body)
  if (tbody) {
    tbody.innerHTML = list.map(item => {
      const isPending = item.estatus === "Esperando Coordinador";
      const nivelUrgencia = getNivelUrgenciaCabina(item);
      const isCritica = isPending && nivelUrgencia === "critica";
      const isMedia = isPending && nivelUrgencia === "media";
      const isBaja = isPending && nivelUrgencia === "baja";
      const isLiberada = item.estatus === "Liberada";

      let rowBgClass = "hover:bg-slate-800/50 transition-colors";
      let urgenciaCell = "";
      let estatusCell = "";

      if (isCritica) {
        rowBgClass = "bg-red-950/20 hover:bg-red-950/35 border-l-4 border-l-red-500 transition-colors";
        urgenciaCell = `
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase bg-red-600 text-white border border-red-300 shadow-[0_0_12px_rgba(239,68,68,0.85)]">
            <span class="w-2 h-2 rounded-full bg-white animate-ping"></span>
            🔴 CRÍTICA (${item.minutos_espera}m)
          </span>
        `;
      } else if (isMedia) {
        rowBgClass = "bg-yellow-950/15 hover:bg-yellow-950/30 border-l-4 border-l-yellow-400 transition-colors";
        urgenciaCell = `
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase bg-yellow-400 text-slate-950 border border-yellow-100 shadow-[0_0_10px_rgba(250,204,21,0.75)]">
            <span class="w-2 h-2 rounded-full bg-slate-950"></span>
            🟡 MEDIO URGENTE (${item.minutos_espera}m)
          </span>
        `;
      } else if (isBaja) {
        rowBgClass = "bg-blue-950/20 hover:bg-blue-950/35 border-l-4 border-l-blue-400 transition-colors";
        urgenciaCell = `
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase bg-blue-600 text-white border border-blue-200 shadow-[0_0_10px_rgba(59,130,246,0.8)]">
            <span class="w-2 h-2 rounded-full bg-white"></span>
            🔵 BAJA URGENCIA (${item.minutos_espera}m)
          </span>
        `;
      } else {
        urgenciaCell = `
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
            Atendida (${item.hora_finalizada})
          </span>
        `;
      }

      if (isPending) {
        estatusCell = `
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <i class="fa-solid fa-hourglass-half text-amber-400"></i> Esperando QG
          </span>
        `;
      } else if (isLiberada) {
        estatusCell = `
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <i class="fa-solid fa-check-double text-emerald-400"></i> Liberada QG
          </span>
        `;
      } else {
        estatusCell = `
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/40">
            <i class="fa-solid fa-screwdriver-wrench text-rose-400"></i> En Retrabajo
          </span>
        `;
      }

      const fotosEvidencia = Array.isArray(item.fotos_evidencia_qg) ? item.fotos_evidencia_qg : [];
      const miniFotosHtml = fotosEvidencia.length > 0 ? `
        <div class="flex items-center gap-1.5 mt-1.5">
          ${fotosEvidencia.slice(0, 3).map(f => `
            <a href="${f.url}" target="_blank" title="${f.tipo || 'Evidencia QG'}" class="block w-10 h-8 rounded overflow-hidden border border-emerald-500/60 shrink-0">
              <img src="${f.url}" class="w-full h-full object-cover">
            </a>
          `).join("")}
          <span class="text-[10px] font-bold text-emerald-400">📷 ${fotosEvidencia.length} foto${fotosEvidencia.length === 1 ? '' : 's'}</span>
        </div>
      ` : "";

      return `
        <tr class="${rowBgClass}">
          <td class="p-3 whitespace-nowrap">${urgenciaCell}</td>
          <td class="p-3 whitespace-nowrap">
            <div class="font-black text-white text-xs">L&#237;nea ${item.linea}</div>
            <span class="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30">${item.area}</span>
          </td>
          <td class="p-3 whitespace-nowrap">
            <div class="font-mono font-bold text-cyan-300 text-xs">${item.serie_cabina}</div>
            <div class="text-[10px] text-slate-400 font-mono">${item.numero_parte} • ${item.tipo_cabina || 'Cabina'}</div>
          </td>
          <td class="p-3 text-slate-200 font-semibold text-xs">${item.estacion}</td>
          <td class="p-3">
            <div class="text-amber-300 font-bold text-xs">${item.supervisor_linea || item.solicitante}</div>
            <div class="text-[10px] text-slate-400">${item.hora_finalizada} hrs • ${item.fecha}</div>
          </td>
          <td class="p-3">
            <div class="text-cyan-300 font-bold text-xs">${item.coordinador_solicitado || 'Coordinador / QG en Turno'}</div>
            ${item.coordinador_asignado ? `<div class="text-[10px] text-emerald-400 font-extrabold mt-0.5"><i class="fa-solid fa-user-check mr-1"></i>Inspeccionó: ${item.coordinador_asignado}</div>` : ''}
          </td>
          <td class="p-3 max-w-xs">
            <div class="text-slate-200 text-xs line-clamp-2">${item.notas || 'Cabina terminada lista para inspección de Coordinador / QG.'}</div>
            ${miniFotosHtml}
          </td>
          <td class="p-3 text-center whitespace-nowrap">${estatusCell}</td>
          <td class="p-3 text-center whitespace-nowrap">
            ${isPending ? `
              <button type="button" onclick="abrirInspeccionCabina('${item.id}')" class="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-md shadow-emerald-600/30 inline-flex items-center gap-1.5 transition active:scale-95 cursor-pointer">
                <i class="fa-solid fa-clipboard-check"></i> Inspeccionar QG
              </button>
            ` : `
              <button type="button" onclick="abrirInspeccionCabina('${item.id}')" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs inline-flex items-center gap-1.5 transition cursor-pointer">
                <i class="fa-solid fa-eye text-cyan-400"></i> Ver Detalle
              </button>
            `}
          </td>
        </tr>
      `;
    }).join("");
  }

  if (!container) return;

  // 2. Renderizar Tarjetas de Detalle (#cabinas-coordinador-list)
  container.innerHTML = list.map(item => {
    const isPending = item.estatus === "Esperando Coordinador";
    const nivelUrgencia = getNivelUrgenciaCabina(item);
    const isCritica = isPending && nivelUrgencia === "critica";
    const isMedia = isPending && nivelUrgencia === "media";
    const isBaja = isPending && nivelUrgencia === "baja";
    const isLiberada = item.estatus === "Liberada";

    let borderClass = "border-slate-800 bg-slate-950/90";
    let iconBoxClass = "bg-slate-800 border border-slate-700 text-amber-400";
    let statusBadge = "";
    let lightIndicator = "";

    if (isCritica) {
      borderClass = "border-2 border-red-500 bg-gradient-to-r from-red-950/70 via-slate-950 to-red-950/35 shadow-[0_0_28px_rgba(239,68,68,0.55)] ring-2 ring-red-500/60";
      iconBoxClass = "bg-red-600/35 border-2 border-red-500 text-red-300 shadow-[0_0_16px_rgba(239,68,68,0.85)]";
      lightIndicator = `
        <span class="relative flex h-3.5 w-3.5 shrink-0" title="Alerta Crítica">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-95"></span>
          <span class="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 border border-red-200 shadow-[0_0_14px_4px_rgba(239,68,68,1)]"></span>
        </span>
      `;
      statusBadge = `
        <span class="px-3 py-1 rounded-full text-[11px] font-black uppercase bg-red-600 text-white border-2 border-red-300 shadow-[0_0_20px_rgba(239,68,68,0.95)] flex items-center gap-2 animate-pulse">
          <span class="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_10px_#fff]"></span>
          <i class="fa-solid fa-triangle-exclamation text-yellow-200"></i> CRÍTICA: ${item.minutos_espera} MIN
        </span>
      `;
    } else if (isMedia) {
      borderClass = "border-2 border-yellow-400 bg-gradient-to-r from-yellow-950/55 via-slate-950 to-yellow-950/25 shadow-[0_0_22px_rgba(250,204,21,0.45)] ring-1 ring-yellow-400/60";
      iconBoxClass = "bg-yellow-400/25 border-2 border-yellow-400 text-yellow-300 shadow-[0_0_14px_rgba(250,204,21,0.8)]";
      lightIndicator = `
        <span class="relative flex h-3.5 w-3.5 shrink-0" title="Medio Urgente">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-300 opacity-85"></span>
          <span class="relative inline-flex rounded-full h-3.5 w-3.5 bg-yellow-400 border border-yellow-100 shadow-[0_0_12px_3px_rgba(250,204,21,0.95)]"></span>
        </span>
      `;
      statusBadge = `
        <span class="px-3 py-1 rounded-full text-[11px] font-black uppercase bg-yellow-400 text-slate-950 border-2 border-yellow-100 shadow-[0_0_16px_rgba(250,204,21,0.9)] flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-slate-950 animate-pulse"></span>
          <i class="fa-solid fa-clock-rotate-left text-slate-950"></i> MEDIO URGENTE: ${item.minutos_espera} MIN
        </span>
      `;
    } else if (isBaja) {
      borderClass = "border-2 border-blue-400 bg-gradient-to-r from-blue-950/60 via-slate-950 to-blue-950/30 shadow-[0_0_22px_rgba(59,130,246,0.45)] ring-1 ring-blue-400/60";
      iconBoxClass = "bg-blue-500/25 border-2 border-blue-400 text-blue-300 shadow-[0_0_14px_rgba(59,130,246,0.8)]";
      lightIndicator = `
        <span class="relative flex h-3.5 w-3.5 shrink-0" title="Baja Urgencia">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-300 opacity-85"></span>
          <span class="relative inline-flex rounded-full h-3.5 w-3.5 bg-blue-500 border border-blue-100 shadow-[0_0_12px_3px_rgba(59,130,246,0.95)]"></span>
        </span>
      `;
      statusBadge = `
        <span class="px-3 py-1 rounded-full text-[11px] font-black uppercase bg-blue-600 text-white border-2 border-blue-200 shadow-[0_0_16px_rgba(59,130,246,0.9)] flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_#fff]"></span>
          <i class="fa-solid fa-circle-info text-sky-200"></i> BAJA URGENCIA: ${item.minutos_espera} MIN
        </span>
      `;
    } else if (isLiberada) {
      borderClass = "border-emerald-500/40 bg-slate-950/80";
      iconBoxClass = "bg-emerald-950/50 border border-emerald-500/40 text-emerald-400";
      statusBadge = `
        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
          <i class="fa-solid fa-check-double text-emerald-400"></i> Liberada por Coordinador
        </span>
      `;
    } else {
      borderClass = "border-rose-500/40 bg-slate-950/80";
      iconBoxClass = "bg-rose-950/50 border border-rose-500/40 text-rose-400";
      statusBadge = `
        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1.5">
          <i class="fa-solid fa-screwdriver-wrench text-rose-400"></i> En Retrabajo
        </span>
      `;
    }

    const criteriosHtml = (item.criterios || []).map(crit => `
      <div class="flex items-start gap-1.5 text-[11px] text-slate-300">
        <i class="fa-solid fa-check text-cyan-400 text-[10px] mt-0.5 shrink-0"></i>
        <span>${crit}</span>
      </div>
    `).join("");

    const fotosEvidencia = Array.isArray(item.fotos_evidencia_qg) ? item.fotos_evidencia_qg : [];
    const fotosHtml = fotosEvidencia.length > 0 ? `
      <div class="pt-2 border-t border-slate-800/80 space-y-1.5">
        <div class="text-[10px] font-extrabold uppercase text-emerald-400 flex items-center gap-1.5">
          <i class="fa-solid fa-camera-retro"></i> Evidencia Fotográfica de Inspecci&#243;n QG (${fotosEvidencia.length} foto${fotosEvidencia.length === 1 ? '' : 's'}):
        </div>
        <div class="flex items-center gap-2 overflow-x-auto pb-1">
          ${fotosEvidencia.map(f => `
            <a href="${f.url}" target="_blank" title="${f.tipo || 'Evidencia QG'} (${f.qg_inspector || ''})" class="group relative block w-20 h-14 rounded-lg overflow-hidden border border-emerald-500/50 shrink-0 bg-slate-900">
              <img src="${f.url}" class="w-full h-full object-cover group-hover:scale-110 transition-transform">
              <span class="absolute bottom-0 inset-x-0 bg-slate-950/85 text-[8px] text-emerald-300 font-bold px-1 truncate">${f.tipo || 'Evidencia'}</span>
            </a>
          `).join("")}
        </div>
      </div>
    ` : "";

    return `
      <div class="p-4 rounded-xl ${borderClass} transition-all space-y-3">
        <!-- Encabezado de la Tarjeta de L&#237;nea -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
          <div class="flex items-center gap-2.5">
            <span class="w-9 h-9 rounded-lg ${iconBoxClass} flex items-center justify-center text-sm font-black shrink-0">
              <i class="fa-solid fa-industry"></i>
            </span>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                ${lightIndicator}
                <h4 class="text-sm font-black text-white tracking-wide">
                  L&#237;nea ${item.linea}
                </h4>
                <span class="px-2 py-0.2 rounded text-[10px] font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  ${item.area}
                </span>
                <span class="text-xs text-slate-400">• ${item.estacion}</span>
              </div>
              <div class="text-[11px] text-cyan-300 font-mono mt-0.5">
                Serie Cabina: <strong class="text-white text-xs">${item.serie_cabina}</strong> (${item.tipo_cabina || 'Cabina Terminada'})
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0 self-start sm:self-auto">
            ${statusBadge}
          </div>
        </div>

        <!-- Detalles T&#233;cnicos y Criterios a Validar -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <!-- Columna 1: Datos de Producci&#243;n -->
          <div class="space-y-1.5 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
            <div class="flex justify-between text-[11px]">
              <span class="text-slate-400">No. Parte:</span>
              <span class="text-cyan-400 font-mono font-bold">${item.numero_parte}</span>
            </div>
            <div class="flex justify-between text-[11px]">
              <span class="text-slate-400">Hora Conclusión:</span>
              <span class="text-slate-200 font-semibold">${item.hora_finalizada} hrs (${item.fecha})</span>
            </div>
            <div class="flex justify-between text-[11px]">
              <span class="text-slate-400">Supervisor de L&#237;nea:</span>
              <span class="text-amber-300 font-bold">${item.supervisor_linea || item.solicitante}</span>
            </div>
            <div class="flex justify-between text-[11px]">
              <span class="text-slate-400">Coordinador / QG Solicitado:</span>
              <span class="text-cyan-300 font-bold">${item.coordinador_solicitado || 'Coordinador / QG en Turno'}</span>
            </div>
            ${item.coordinador_asignado ? `
              <div class="flex justify-between text-[11px] pt-1 border-t border-slate-800/80">
                <span class="text-emerald-300 font-bold">QG que Inspeccionó:</span>
                <span class="text-emerald-400 font-extrabold">${item.coordinador_asignado}</span>
              </div>
            ` : ''}
            ${item.notas ? `
              <div class="pt-1.5 mt-1 text-[11px] text-amber-100 border-t border-slate-800 bg-amber-950/25 p-1.5 rounded">
                <span class="text-amber-400 font-bold"><i class="fa-solid fa-paper-plane mr-1"></i>Info enviada por Supervisor al QG:</span> ${item.notas}
              </div>
            ` : ''}
          </div>

          <!-- Columna 2: Criterios T&#233;cnicos para el Coordinador / QG -->
          <div class="space-y-1 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
            <div class="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 flex items-center gap-1">
              <i class="fa-solid fa-list-check text-emerald-400"></i> Puntos Clave de Inspecci&#243;n Coordinador / QG:
            </div>
            ${criteriosHtml}
            ${fotosHtml}
          </div>
        </div>

        <!-- Acciones del Coordinador / QG -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1">
          <div class="text-[11px] text-slate-400 flex items-center gap-1">
            <i class="fa-solid fa-id-badge text-cyan-400"></i>
            ${isLiberada 
              ? `<span class="text-emerald-400 font-semibold">Liberada por QG: ${item.coordinador_asignado || 'Coordinador / QG'} (${item.fecha_liberacion || 'Hoy'})</span>` 
              : `<span class="text-slate-400">Enviado por <strong>${item.supervisor_linea || item.solicitante}</strong> → Para: <strong class="text-cyan-300">${item.coordinador_solicitado || 'Coordinador / QG'}</strong></span>`}
          </div>
          <div class="flex items-center gap-2 shrink-0">
            ${isPending ? `
              <button type="button" onclick="abrirInspeccionCabina('${item.id}')" class="px-4 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-extrabold text-xs shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition active:scale-95 cursor-pointer">
                <i class="fa-solid fa-clipboard-check text-sm"></i> Realizar Inspecci&#243;n de Coordinador / QG
              </button>
            ` : `
              <button type="button" onclick="abrirInspeccionCabina('${item.id}')" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer">
                <i class="fa-solid fa-eye text-cyan-400"></i> Ver Detalle de Liberaci&#243;n
              </button>
            `}
          </div>
        </div>

      </div>
    `;
  }).join("");
}

function cambiarSeccionModalQG(seccion) {
  // Si el usuario actual es QG (colaborador), siempre mantener únicamente la vista de Urgencias por Checar
  if (isCurrentUserQGOnly()) {
    seccion = "lista";
  }

  const secLista = document.getElementById("seccion-qg-lista-urgencias");
  const secForm = document.getElementById("form-solicitar-cabina-container");
  const btnLista = document.getElementById("btn-qg-tab-lista");
  const btnForm = document.getElementById("btn-toggle-form-cabina");

  applyQGModalRoleVisibility();

  if (seccion === "formulario") {
    if (secLista) secLista.classList.add("hidden");
    if (secForm) secForm.classList.remove("hidden");

    if (btnForm) {
      btnForm.className = "group flex-1 sm:flex-initial flex items-center gap-3 px-4 py-2.5 rounded-2xl border-2 border-cyan-400 bg-gradient-to-r from-cyan-500/25 via-slate-900 to-emerald-500/15 shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:border-cyan-300 transition-all cursor-pointer active:scale-95 text-left";
    }
    if (btnLista) {
      btnLista.className = "group flex-1 sm:flex-initial flex items-center gap-3 px-4 py-2.5 rounded-2xl border-2 border-slate-700 bg-slate-950/90 hover:border-amber-400 hover:bg-slate-900 transition-all cursor-pointer active:scale-95 text-left";
    }

    if (appState.currentUser && (appState.currentUser.linea || appState.currentUser.linea_asignada)) {
      const selLinea = document.getElementById("solicitar-cabina-linea");
      if (selLinea) selLinea.value = appState.currentUser.linea || appState.currentUser.linea_asignada;
    } else if (currentCabinasFilter && currentCabinasFilter.startsWith("LINEA:")) {
      const selLinea = document.getElementById("solicitar-cabina-linea");
      if (selLinea) selLinea.value = currentCabinasFilter.replace("LINEA:", "");
    }
    handleChangeSupervisorLineaSelect();

    const serieInput = document.getElementById("solicitar-cabina-serie");
    if (serieInput && !serieInput.value.trim()) {
      serieInput.value = "CAB-2026-" + Math.floor(9000 + Math.random() * 999);
    }
    const notasInput = document.getElementById("solicitar-cabina-notas");
    if (notasInput) notasInput.focus();
  } else {
    if (secForm) secForm.classList.add("hidden");
    if (secLista) secLista.classList.remove("hidden");

    if (btnLista) {
      btnLista.className = "group flex-1 sm:flex-initial flex items-center gap-3 px-4 py-2.5 rounded-2xl border-2 border-amber-400 bg-gradient-to-r from-amber-500/25 via-slate-900 to-amber-500/15 shadow-[0_0_20px_rgba(245,158,11,0.35)] hover:border-amber-300 transition-all cursor-pointer active:scale-95 text-left";
    }
    if (btnForm && !isCurrentUserQGOnly()) {
      btnForm.className = "group flex-1 sm:flex-initial flex items-center gap-3 px-4 py-2.5 rounded-2xl border-2 border-slate-700 bg-slate-950/90 hover:border-cyan-400 hover:bg-slate-900 transition-all cursor-pointer active:scale-95 text-left";
    }
  }
}

function seleccionarSupervisorLineaParaQG(linea) {
  if (isCurrentUserQGOnly()) return;
  cambiarSeccionModalQG("formulario");
  const selLinea = document.getElementById("solicitar-cabina-linea");
  if (selLinea && linea) {
    selLinea.value = linea;
  }
  handleChangeSupervisorLineaSelect();

  const serieInput = document.getElementById("solicitar-cabina-serie");
  if (serieInput && !serieInput.value.trim()) {
    serieInput.value = "CAB-2026-" + Math.floor(9000 + Math.random() * 999);
  }
  const notasInput = document.getElementById("solicitar-cabina-notas");
  if (notasInput) {
    notasInput.focus();
  }
}

function handleChangeSupervisorLineaSelect() {
  const selLinea = document.getElementById("solicitar-cabina-linea");
  const inEstacion = document.getElementById("solicitar-cabina-estacion");
  if (!selLinea) return;
  const linea = selLinea.value;
  if (inEstacion) {
    const area = LINEA_AREA_MAP[linea] || "FABS";
    inEstacion.value = `Bahía Final ${linea} (${area})`;
  }
}

function toggleFormularioNuevaCabina() {
  if (isCurrentUserQGOnly()) return;
  const container = document.getElementById("form-solicitar-cabina-container");
  if (!container) return;
  const isHidden = container.classList.contains("hidden");
  if (isHidden) {
    cambiarSeccionModalQG("formulario");
  } else {
    cambiarSeccionModalQG("lista");
  }
}

function handleSolicitarCoordinadorCabina(event) {
  if (event) event.preventDefault();

  const selLinea = document.getElementById("solicitar-cabina-linea");
  const selCoord = document.getElementById("solicitar-cabina-coordinador");
  const selUrgencia = document.getElementById("solicitar-cabina-urgencia");
  const selTipoApoyo = document.getElementById("solicitar-cabina-tipo-apoyo");
  const inSerie = document.getElementById("solicitar-cabina-serie");
  const inEstacion = document.getElementById("solicitar-cabina-estacion");
  const inNotas = document.getElementById("solicitar-cabina-notas");

  const linea = selLinea ? selLinea.value : "WTS";
  const area = LINEA_AREA_MAP[linea] || "FABS";
  const serieRaw = inSerie ? inSerie.value.trim().toUpperCase() : "";
  const serie = serieRaw || ("CAB-2026-" + Math.floor(9000 + Math.random() * 999));
  const estacionRaw = inEstacion ? inEstacion.value.trim() : "";
  const estacion = estacionRaw || `Bahía Final ${linea} (${area})`;
  const coordDestino = selCoord ? selCoord.value : "Cualquier Coordinador / QG Disponible en Turno";
  const urgenciaRaw = selUrgencia ? selUrgencia.value : "media";
  const urgenciaVal = urgenciaRaw === "critica" ? 25 : (urgenciaRaw === "media" ? 15 : (urgenciaRaw === "baja" ? 5 : (parseInt(urgenciaRaw, 10) || 15)));
  const tipoApoyo = selTipoApoyo ? selTipoApoyo.value : "Liberaci&#243;n Final de Cabina Terminada";
  const notasRaw = inNotas ? inNotas.value.trim() : "";

  const supInfo = SUPERVISORES_POR_LINEA[linea];
  const supervisorLineaStr = supInfo
    ? `${supInfo.nombre} (${supInfo.nomina})`
    : (appState.currentUser ? `${appState.currentUser.nombre} (${appState.currentUser.nomina})` : `Supervisor de L&#237;nea ${linea}`);

  const partMatch = appState.componentes.find(c => c.modelo === linea) || { numero_parte: "PN-CAB-" + linea };

  const mensajeFinal = notasRaw
    ? `${notasRaw} (${tipoApoyo})`
    : `Solicito apoyo de Coordinador / QG en línea ${linea} para ${tipoApoyo.toLowerCase()}.`;

  const nuevaSolicitud = {
    id: "CAB-REQ-" + Date.now(),
    linea: linea,
    area: area,
    estacion: estacion,
    numero_parte: partMatch.numero_parte,
    serie_cabina: serie,
    tipo_cabina: tipoApoyo,
    hora_finalizada: new Date().toLocaleTimeString().substring(0, 5),
    fecha: new Date().toISOString().substring(0, 10),
    supervisor_linea: supervisorLineaStr,
    solicitante: supervisorLineaStr,
    coordinador_solicitado: coordDestino,
    turno: appState.currentUser ? appState.currentUser.turno : "Turno 1 (Matutino)",
    nivel_urgencia: (urgenciaRaw === "critica" || urgenciaRaw === "media" || urgenciaRaw === "baja") ? urgenciaRaw : "media",
    minutos_espera: urgenciaVal,
    estatus: "Esperando Coordinador",
    coordinador_asignado: null,
    fotos_evidencia_qg: [],
    criterios: [
      "Holgura perimetral uniforme y ajuste de bisagras",
      "Sellado hermético y burletes perimetrales",
      "Torque verificado en pernos estructurales",
      "Pintura uniforme sin rayones ni escurrimientos"
    ],
    notas: mensajeFinal
  };

  if (!appState.cabinasCoordinador) {
    appState.cabinasCoordinador = [];
  }
  appState.cabinasCoordinador.unshift(nuevaSolicitud);
  saveToLocalStorage();

  // Registro de Auditoría Inmutable
  logAuditAction({
    id_inspeccion: serie,
    campo_modificado: "Solicitud Supervisor de L&#237;nea a QG",
    status_final: "Esperando Coordinador",
    valor_anterior: "Ensamble",
    motivo: `${supervisorLineaStr} envió información a ${coordDestino} para liberar cabina en L&#237;nea ${linea} (${estacion}): ${mensajeFinal}`,
    usuario: supInfo ? supInfo.nomina : (appState.currentUser ? appState.currentUser.nomina : 4001)
  });

  if (inNotas) inNotas.value = "";
  if (inSerie) inSerie.value = "CAB-2026-" + Math.floor(9000 + Math.random() * 999);

  // Cambiar automáticamente a la sección separada de Lista de Urgencias por Checar
  cambiarSeccionModalQG("lista");

  // Si estaba filtrado en otra línea distinta, mostrar Todas o la línea enviada para que vea su solicitud de inmediato
  if (currentCabinasFilter && currentCabinasFilter.startsWith("LINEA:") && currentCabinasFilter !== `LINEA:${linea}`) {
    currentCabinasFilter = "all";
  }

  updateCabinasBadge();
  filterCabinasList(currentCabinasFilter || "all");

  // Mostrar banner verde de confirmación inmediata dentro del modal
  const banner = document.getElementById("qg-envio-confirmacion");
  const bannerTxt = document.getElementById("qg-envio-confirmacion-texto");
  if (banner && bannerTxt) {
    bannerTxt.innerText = `✅ Información enviada de L&#237;nea ${linea} (${serie}) para ${coordDestino}: "${mensajeFinal}"`;
    banner.classList.remove("hidden");
  }
}

function handleChangeInspectorCabinaQG() {
  const sel = document.getElementById("insp-cabina-qg-selector");
  const inNombre = document.getElementById("insp-cabina-qg-nombre");
  const inNomina = document.getElementById("insp-cabina-qg-nomina");
  const selTurno = document.getElementById("insp-cabina-qg-turno");
  if (!sel) return;

  const val = sel.value;
  if (val === "otro") {
    if (inNombre) {
      inNombre.value = "";
      inNombre.focus();
    }
    if (inNomina) inNomina.value = "";
    return;
  }

  const opt = sel.options[sel.selectedIndex];
  const nombre = opt ? opt.getAttribute("data-nombre") : "";
  const turno = opt ? opt.getAttribute("data-turno") : "Turno 1 (Matutino)";
  if (inNombre && nombre) inNombre.value = nombre;
  if (inNomina) inNomina.value = val;
  if (selTurno && turno) selTurno.value = turno;
}

function handleCapturarFotoEvidenciaCabinaQG(event) {
  const files = event.target && event.target.files ? Array.from(event.target.files) : [];
  if (files.length === 0) return;

  const item = appState.cabinasCoordinador.find(c => c.id === activeInspeccionCabinaId);
  const serieCabina = item ? item.serie_cabina : "CABINA-QG";
  const lineaCabina = item ? item.linea : "LÍNEA";

  const qgNombre = (document.getElementById("insp-cabina-qg-nombre")?.value || "").trim() || (appState.currentUser ? appState.currentUser.nombre : "Coordinador QG");
  const qgNomina = (document.getElementById("insp-cabina-qg-nomina")?.value || "").trim() || (appState.currentUser ? String(appState.currentUser.nomina) : "1042");
  const tipoEvidencia = document.getElementById("insp-cabina-foto-tipo")?.value || "Cabina Completa Inspeccionada";

  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = new Image();
      img.onload = function() {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const maxWidth = 1200;
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        const barHeight = Math.max(56, height * 0.09);
        ctx.fillStyle = "rgba(15, 23, 42, 0.90)";
        ctx.fillRect(0, height - barHeight, width, barHeight);

        ctx.fillStyle = "#10b981";
        ctx.fillRect(0, height - barHeight, width, 4);

        const nowStr = new Date().toLocaleString();
        ctx.fillStyle = "#ffffff";
        ctx.font = `bold ${Math.max(13, Math.floor(barHeight * 0.30))}px monospace`;
        ctx.fillText(`AUDITUM QG | LÍNEA ${lineaCabina} | SERIE: ${serieCabina}`, 14, height - (barHeight * 0.54));

        ctx.fillStyle = "#34d399";
        ctx.font = `${Math.max(11, Math.floor(barHeight * 0.25))}px monospace`;
        ctx.fillText(`INSPECTOR QG: ${qgNombre} (${qgNomina}) | ${tipoEvidencia.toUpperCase()} | ${nowStr}`, 14, height - (barHeight * 0.18));

        const stampedUrl = canvas.toDataURL("image/jpeg", 0.85);
        tempFotosCabinaQG.push({
          id: "FOT-QG-" + Date.now() + "-" + Math.floor(Math.random() * 999),
          url: stampedUrl,
          tipo: tipoEvidencia,
          timestamp: nowStr,
          qg_inspector: `${qgNombre} (${qgNomina})`
        });
        renderFotosEvidenciaCabinaQG();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

  event.target.value = "";
}

function renderFotosEvidenciaCabinaQG() {
  const grid = document.getElementById("insp-cabina-fotos-grid");
  if (!grid) return;

  if (!tempFotosCabinaQG || tempFotosCabinaQG.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full py-3 px-4 rounded-xl border border-dashed border-slate-700 bg-slate-900/50 text-center text-[11px] text-slate-400">
        <i class="fa-regular fa-images text-emerald-400 mr-1"></i> Aún no se han subido fotos de evidencia de la cabina o material inspeccionado.
      </div>
    `;
    return;
  }

  grid.innerHTML = tempFotosCabinaQG.map((foto, idx) => `
    <div class="relative rounded-xl overflow-hidden border border-emerald-500/50 bg-slate-900 group shadow-md">
      <a href="${foto.url}" target="_blank" title="Ver imagen completa">
        <img src="${foto.url}" class="w-full h-24 object-cover">
      </a>
      <div class="p-1.5 text-[10px] bg-slate-950/95">
        <span class="font-bold text-emerald-300 block truncate">📸 ${foto.tipo || 'Evidencia QG'}</span>
        <span class="text-slate-400 font-mono text-[9px] block truncate">${foto.qg_inspector || ''}</span>
      </div>
      <button type="button" onclick="eliminarFotoEvidenciaCabinaQG(${idx})" class="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center text-xs shadow cursor-pointer" title="Eliminar foto">
        <i class="fa-solid fa-trash"></i>
      </button>
    </div>
  `).join("");
}

function eliminarFotoEvidenciaCabinaQG(idx) {
  tempFotosCabinaQG.splice(idx, 1);
  renderFotosEvidenciaCabinaQG();
}

function abrirInspeccionCabina(cabinaId) {
  activeInspeccionCabinaId = cabinaId;
  const item = appState.cabinasCoordinador.find(c => c.id === cabinaId);
  if (!item) return;

  const modal = document.getElementById("modal-inspeccion-cabina-action");
  if (!modal) return;

  const tLinea = document.getElementById("insp-cabina-linea-titulo");
  if (tLinea) tLinea.innerText = `L&#237;nea ${item.linea} • Serie ${item.serie_cabina}`;

  const tParte = document.getElementById("insp-cabina-parte");
  if (tParte) tParte.innerText = item.numero_parte;

  const tEstacion = document.getElementById("insp-cabina-estacion");
  if (tEstacion) tEstacion.innerText = `${item.estacion} (${item.area})`;

  const tSol = document.getElementById("insp-cabina-solicitante");
  if (tSol) tSol.innerText = `${item.supervisor_linea || item.solicitante} • ${item.turno}`;

  const tQg = document.getElementById("insp-cabina-qg-asignado");
  if (tQg) tQg.innerText = item.coordinador_solicitado || "Coordinador / QG en Turno";

  const tInfoSup = document.getElementById("insp-cabina-info-supervisor");
  if (tInfoSup) tInfoSup.innerText = item.notas || "Solicitud de liberación de cabina en línea.";

  const tTiempo = document.getElementById("insp-cabina-tiempo");
  if (tTiempo) {
    if (item.estatus === "Esperando Coordinador") {
      tTiempo.innerText = `${item.minutos_espera} minutos en espera`;
      tTiempo.className = (item.minutos_espera >= 20) ? "text-rose-400 font-extrabold" : "text-amber-400 font-bold";
    } else {
      tTiempo.innerText = item.estatus;
      tTiempo.className = "text-emerald-400 font-bold";
    }
  }

  // Inicializar datos del Coordinador / QG que realiza la inspección (permite relevo si el solicitado no está)
  const selQg = document.getElementById("insp-cabina-qg-selector");
  const inQgNombre = document.getElementById("insp-cabina-qg-nombre");
  const inQgNomina = document.getElementById("insp-cabina-qg-nomina");
  const selQgTurno = document.getElementById("insp-cabina-qg-turno");

  let defaultNomina = "1042";
  let defaultNombre = "Juan Pérez Martínez (Coordinador / QG)";
  let defaultTurno = "Turno 1 (Matutino)";

  if (item.qg_inspector_nomina) {
    defaultNomina = String(item.qg_inspector_nomina);
    defaultNombre = item.qg_inspector_nombre || defaultNombre;
    defaultTurno = item.qg_inspector_turno || defaultTurno;
  } else if (appState.currentUser && (appState.currentUser.rol === "colaborador" || appState.currentUser.rol === "supervisor")) {
    defaultNomina = String(appState.currentUser.nomina);
    defaultNombre = appState.currentUser.nombre;
    defaultTurno = appState.currentUser.turno || "Turno 1 (Matutino)";
  } else if (item.coordinador_solicitado) {
    if (item.coordinador_solicitado.includes("1150")) {
      defaultNomina = "1150";
      defaultNombre = "Miguel Ángel Rojas (Coordinador / QG)";
      defaultTurno = "Turno 2 (Vespertino)";
    } else if (item.coordinador_solicitado.includes("1210")) {
      defaultNomina = "1210";
      defaultNombre = "Luis Fernando Torres (Coordinador / QG)";
      defaultTurno = "Turno 3 (Nocturno)";
    } else if (item.coordinador_solicitado.includes("2088")) {
      defaultNomina = "2088";
      defaultNombre = "Ing. Carlos Mendoza (Supervisor / QG)";
      defaultTurno = "Mixto";
    }
  }

  if (selQg) {
    const knownNominas = ["1042", "1150", "1210", "2088"];
    selQg.value = knownNominas.includes(defaultNomina) ? defaultNomina : "otro";
  }
  if (inQgNombre) inQgNombre.value = defaultNombre;
  if (inQgNomina) inQgNomina.value = defaultNomina;
  if (selQgTurno) selQgTurno.value = defaultTurno;

  // Cargar fotos de evidencia de la cabina
  tempFotosCabinaQG = Array.isArray(item.fotos_evidencia_qg) ? [...item.fotos_evidencia_qg] : [];
  renderFotosEvidenciaCabinaQG();

  // Generar checklist interactivo
  const checkContainer = document.getElementById("insp-cabina-checklist-container");
  if (checkContainer) {
    checkContainer.innerHTML = (item.criterios || []).map((crit, idx) => `
      <label class="flex items-center gap-2 p-1.5 rounded hover:bg-slate-900 cursor-pointer">
        <input type="checkbox" id="chk-criterio-${idx}" checked class="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 w-4 h-4">
        <span class="text-slate-200">${crit}</span>
      </label>
    `).join("");
  }

  const notasArea = document.getElementById("insp-cabina-dictamen-notas");
  if (notasArea) {
    notasArea.value = item.dictamen_notas || (item.estatus === "Liberada" ? "Cabina conforme y liberada para siguiente etapa." : "");
  }

  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeInspeccionCabinaActionModal() {
  const modal = document.getElementById("modal-inspeccion-cabina-action");
  if (!modal) return;
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

function ejecutarDictamenCabina(resultado) {
  if (!activeInspeccionCabinaId) return;
  const item = appState.cabinasCoordinador.find(c => c.id === activeInspeccionCabinaId);
  if (!item) return;

  const inQgNombre = document.getElementById("insp-cabina-qg-nombre");
  const inQgNomina = document.getElementById("insp-cabina-qg-nomina");
  const selQgTurno = document.getElementById("insp-cabina-qg-turno");

  const qgNombre = (inQgNombre ? inQgNombre.value.trim() : "") || (appState.currentUser ? appState.currentUser.nombre : "Coordinador / QG");
  const qgNomina = (inQgNomina ? inQgNomina.value.trim() : "") || (appState.currentUser ? String(appState.currentUser.nomina) : "1042");
  const qgTurno = (selQgTurno ? selQgTurno.value : "") || "Turno 1 (Matutino)";

  if (!inQgNombre?.value.trim() || !inQgNomina?.value.trim()) {
    alert("⚠️ Por favor ingresa el Nombre y No. de Nómina del Coordinador / QG que realiza la inspección.");
    if (inQgNombre && !inQgNombre.value.trim()) inQgNombre.focus();
    else if (inQgNomina) inQgNomina.focus();
    return;
  }

  const notasArea = document.getElementById("insp-cabina-dictamen-notas");
  const dictamenNotas = notasArea ? notasArea.value.trim() : "";
  const coordNombreCompleto = `${qgNombre} (${qgNomina}) • ${qgTurno}`;

  item.qg_inspector_nombre = qgNombre;
  item.qg_inspector_nomina = qgNomina;
  item.qg_inspector_turno = qgTurno;
  item.coordinador_asignado = coordNombreCompleto;
  item.fotos_evidencia_qg = [...tempFotosCabinaQG];

  if (resultado === "Liberada") {
    item.estatus = "Liberada";
    item.fecha_liberacion = new Date().toLocaleTimeString().substring(0, 5) + " hrs (" + new Date().toISOString().substring(0, 10) + ")";
    item.dictamen_notas = dictamenNotas || "Cabina aprobada conforme a normas de calidad (holguras, sellos y pintura aprobados).";

    logAuditAction({
      id_inspeccion: item.serie_cabina,
      campo_modificado: "Liberaci&#243;n de Cabina por Coordinador / QG",
      status_final: "Liberada",
      valor_anterior: "Esperando Coordinador",
      motivo: `Inspeccionó y liberó: ${coordNombreCompleto} (Solicitado originalmente: ${item.coordinador_solicitado || 'En Turno'}). Fotos de evidencia: ${item.fotos_evidencia_qg.length}. ${item.dictamen_notas}`,
      usuario: parseInt(qgNomina, 10) || (appState.currentUser ? appState.currentUser.nomina : 1042)
    });

    saveToLocalStorage();
    updateCabinasBadge();
    renderCabinasCoordinadorList(currentCabinasFilter);
    if (typeof updateOperatorShiftBanner === "function") updateOperatorShiftBanner();
    closeInspeccionCabinaActionModal();

    alert(`✅ ¡CABINA LIBERADA EXITOSAMENTE POR QG!\n\nSerie: ${item.serie_cabina}\nL&#237;nea: ${item.linea}\nInspeccionó y Liberó: ${coordNombreCompleto}\nFotos de Evidencia: ${item.fotos_evidencia_qg.length}\n\nLa cabina ha recibido el sello de calidad inmutable y puede avanzar.`);
  } else {
    item.estatus = "Retrabajo";
    item.dictamen_notas = dictamenNotas || "Observaciones técnicas encontradas en ensamble o pintura. Requiere retrabajo.";

    logAuditAction({
      id_inspeccion: item.serie_cabina,
      campo_modificado: "Inspecci&#243;n Cabina QG - Rechazo / Retrabajo",
      status_final: "Retrabajo",
      valor_anterior: "Esperando Coordinador",
      motivo: `Inspeccionó: ${coordNombreCompleto}. Envió cabina a retrabajo en L&#237;nea ${item.linea}. Fotos adjuntas: ${item.fotos_evidencia_qg.length}. ${item.dictamen_notas}`,
      usuario: parseInt(qgNomina, 10) || (appState.currentUser ? appState.currentUser.nomina : 1042)
    });

    saveToLocalStorage();
    updateCabinasBadge();
    renderCabinasCoordinadorList(currentCabinasFilter);
    if (typeof updateOperatorShiftBanner === "function") updateOperatorShiftBanner();
    closeInspeccionCabinaActionModal();

    alert(`⚠️ CABINA ENVIADA A RETRABAJO\n\nSerie: ${item.serie_cabina}\nL&#237;nea: ${item.linea}\nInspeccionó: ${coordNombreCompleto}\nFotos de Evidencia: ${item.fotos_evidencia_qg.length}\nObservaciones: ${item.dictamen_notas}`);
  }
}

// ==================== MÓDULO: MAPA DE PLANTA Y SENSORES IoT (FABS & EDIFICIO K) ====================
let currentNaveMapa = 'fabs'; // 'fabs' o 'k'
let currentSensorFilter = 'all'; // 'all', 'espera', 'defectos', 'liberadas'
let activeSensorDetalleLinea = null;

const SENSOR_ICONS_POR_LINEA = {
  "PUERTAS": "fa-solid fa-door-open",
  "OHT": "fa-solid fa-truck-monster",
  "LTTT": "fa-solid fa-tower-observation",
  "MTTT": "fa-solid fa-monument",
  "MG": "fa-solid fa-bars-staggered",
  "WTS": "fa-solid fa-gas-pump",
  "LWL 988": "fa-solid fa-truck-front",
  "LWL 990": "fa-solid fa-truck-pickup",
  "MWL": "fa-solid fa-circle-dot",
  "LMT": "fa-solid fa-layer-group",
  "LOW VOLUME": "fa-solid fa-truck-pickup",
  "LMT K": "fa-solid fa-cubes",
  "COBOT": "fa-solid fa-robot"
};

function renderPlantMaps() {
  setNaveMapa(currentNaveMapa);
  updatePlantSensorsStatus();
}
window.renderPlantMaps = renderPlantMaps;

function setNaveMapa(nave) {
  currentNaveMapa = (nave === 'k') ? 'k' : 'fabs';
  const vFabs = document.getElementById("mapa-view-fabs");
  const vK = document.getElementById("mapa-view-k");
  const btnFabs = document.getElementById("btn-nave-fabs");
  const btnK = document.getElementById("btn-nave-k");
  const badgeNave = document.getElementById("mapa-badge-active-nave");

  if (currentNaveMapa === 'fabs') {
    if (vFabs) vFabs.classList.remove("hidden");
    if (vK) vK.classList.add("hidden");
    if (btnFabs) {
      btnFabs.className = "px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer bg-blue-600 text-white shadow-md shadow-blue-600/30";
    }
    if (btnK) {
      btnK.className = "px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white hover:bg-slate-800";
    }
    if (badgeNave) {
      badgeNave.innerText = "Área FABS (Planta 3)";
      badgeNave.className = "px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-cyan-300 border border-cyan-500/40 font-mono";
    }
  } else {
    if (vFabs) vFabs.classList.add("hidden");
    if (vK) vK.classList.remove("hidden");
    if (btnFabs) {
      btnFabs.className = "px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white hover:bg-slate-800";
    }
    if (btnK) {
      btnK.className = "px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer bg-indigo-600 text-white shadow-md shadow-indigo-600/30";
    }
    if (badgeNave) {
      badgeNave.innerText = "Edificio K (Robótica y Especiales)";
      badgeNave.className = "px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-mono";
    }
  }

  updatePlantSensorsStatus();
}
window.setNaveMapa = setNaveMapa;

let currentLineFilter = "all";

function setFabsDisplayMode(mode) {
  // Modo de visualización CAD siempre activo (captura de referencia eliminada)
  const cadStage = document.getElementById("fabs-cad-stage");
  if (cadStage) cadStage.classList.remove("hidden");
}
window.setFabsDisplayMode = setFabsDisplayMode;

function filtrarSensoresMapa(filtro) {
  currentSensorFilter = filtro;
  const btns = {
    all: document.getElementById("filtro-sensor-all"),
    espera: document.getElementById("filtro-sensor-espera"),
    defectos: document.getElementById("filtro-sensor-defectos"),
    liberadas: document.getElementById("filtro-sensor-liberadas")
  };

  Object.keys(btns).forEach(key => {
    const b = btns[key];
    if (!b) return;
    if (key === filtro) {
      if (key === "espera") {
        b.className = "px-3 py-1.5 rounded-lg text-xs font-black bg-amber-400 text-slate-950 border-2 border-amber-300 shadow-md shadow-amber-400/30 cursor-pointer transition flex items-center gap-1.5";
      } else if (key === "defectos") {
        b.className = "px-3 py-1.5 rounded-lg text-xs font-black bg-rose-600 text-white border-2 border-rose-400 shadow-md shadow-rose-600/30 cursor-pointer transition flex items-center gap-1.5";
      } else if (key === "liberadas") {
        b.className = "px-3 py-1.5 rounded-lg text-xs font-black bg-emerald-600 text-white border-2 border-emerald-400 shadow-md shadow-emerald-600/30 cursor-pointer transition flex items-center gap-1.5";
      } else {
        b.className = "px-3 py-1.5 rounded-lg text-xs font-black bg-blue-600 text-white border-2 border-blue-400 shadow-md shadow-blue-600/30 cursor-pointer transition flex items-center gap-1.5";
      }
    } else {
      b.className = "px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-slate-300 border border-slate-700 hover:bg-slate-800 cursor-pointer transition flex items-center gap-1.5";
    }
  });

  updatePlantSensorsStatus();
}
window.filtrarSensoresMapa = filtrarSensoresMapa;

function filtrarPorLineaMapa(linea) {
  currentLineFilter = linea;
  
  // Cambiar automáticamente a la nave correspondiente si es Edificio K
  const kLines = ["COBOT", "LOW VOLUME", "LMT K", "K_ROBOT_WELD", "K_HEAVY_FAB", "K_SUBASSY_SPECIAL"];
  if (kLines.includes(linea)) {
    if (window.setNaveMapa) window.setNaveMapa("k");
  } else if (linea !== "all") {
    if (window.setNaveMapa) window.setNaveMapa("fabs");
  }

  updatePlantSensorsStatus();
}
window.filtrarPorLineaMapa = filtrarPorLineaMapa;

function updatePlantSensorsStatus() {
  if (!appState.cabinasCoordinador) {
    appState.cabinasCoordinador = JSON.parse(JSON.stringify(DEFAULT_CABINAS_COORDINADOR));
  }
  const pendingCabinas = appState.cabinasCoordinador.filter(c => c.estatus === "Esperando Coordinador");
  const allLines = Object.keys(SUPERVISORES_POR_LINEA);

  let fabsPendingCount = 0;
  let kPendingCount = 0;
  let defectCount = 0;
  let liberadasCount = 0;

  // Mapa exhaustivo de línea a elementos CAD y tarjetas
  const cadBayMap = {
    "PUERTAS": ["cad-bay-rect-PUERTAS", "cad-bay-DOORS", "cad-bay-rect-OHT-COLUMN"],
    "OHT": ["cad-bay-rect-OHT", "cad-bay-OHT", "cad-bay-rect-OHT-COLUMN"],
    "LTTT": ["cad-bay-rect-LTTT", "cad-bay-rect-OHT-COLUMN"],
    "MTTT": ["cad-bay-rect-MTTT", "cad-bay-MTTT"],
    "MG": ["cad-bay-rect-MG-WTS", "cad-bay-MG-WTS"],
    "WTS": ["cad-bay-rect-MG-WTS", "cad-bay-MG-WTS"],
    "LWL 988": ["cad-bay-rect-LWL", "cad-bay-LWL"],
    "LWL 990": ["cad-bay-rect-LWL", "cad-bay-LWL"],
    "MWL": ["cad-bay-rect-MWL", "cad-bay-MWL"],
    "LMT": ["cad-bay-rect-LMT", "cad-bay-LMT"],
    "COBOT": ["k-card-COBOT", "cad-bay-rect-COBOT"],
    "LOW VOLUME": ["k-card-LOW-VOLUME", "cad-bay-rect-LOW-VOLUME"],
    "LMT K": ["k-card-LMT-K", "cad-bay-rect-LMT-D"]
  };

  allLines.forEach(linea => {
    const supInfo = SUPERVISORES_POR_LINEA[linea];
    const isK = supInfo && supInfo.area === "EDIFICIO K";
    
    // Buscar solicitud de cabina pendiente
    const cabinaReq = pendingCabinas.find(c => c.linea === linea);
    // Buscar inspecciones recientes para verificar defectos o estatus
    const recentInsp = (appState.inspecciones || []).find(i => i.modelo === linea);
    const hasDefects = recentInsp && (recentInsp.tiene_faltantes === "SI" || recentInsp.estatus === "Rechazado");
    const isLiberada = recentInsp && (recentInsp.estatus === "Liberado");

    let status = "normal"; // "esperando", "defecto", "normal"
    if (cabinaReq) {
      status = "esperando";
      if (isK) kPendingCount++;
      else fabsPendingCount++;
    } else if (hasDefects) {
      status = "defecto";
      defectCount++;
    } else {
      status = "normal";
      if (isLiberada) liberadasCount++;
    }

    // Determinar visibilidad según filtros
    let matchesStatusFilter = true;
    if (currentSensorFilter === "espera" && status !== "esperando") matchesStatusFilter = false;
    if (currentSensorFilter === "defectos" && status !== "defecto") matchesStatusFilter = false;
    if (currentSensorFilter === "liberadas" && status !== "normal") matchesStatusFilter = false;

    let matchesLineFilter = (currentLineFilter === "all" || linea === currentLineFilter);
    let visible = matchesStatusFilter && matchesLineFilter;

    // Actualizar nodo de sensor en plano
    const nodeEl = document.getElementById(`sensor-node-${linea}`);
    const pulseEl = document.getElementById(`sensor-pulse-${linea}`);
    const beaconEl = document.getElementById(`sensor-beacon-${linea}`);
    const tagEl = document.getElementById(`sensor-tag-${linea}`);
    const statusBadgeEl = document.getElementById(`sensor-status-badge-${linea}`);

    if (nodeEl) {
      if (visible) {
        nodeEl.style.display = "block";
        nodeEl.style.opacity = "1";
        nodeEl.style.pointerEvents = "auto";
        if (currentLineFilter === linea) {
          nodeEl.style.transform = "translate(-50%, -50%) scale(1.35)";
          nodeEl.style.zIndex = "60";
        } else {
          nodeEl.style.transform = "";
          nodeEl.style.zIndex = "30";
        }
      } else {
        if (currentLineFilter !== "all") {
          nodeEl.style.display = "none";
        } else {
          nodeEl.style.display = "block";
          nodeEl.style.opacity = "0.12";
          nodeEl.style.pointerEvents = "none";
        }
      }
    }

    // Actualizar cuadros / bahías CAD
    const bayElIds = cadBayMap[linea] || [];
    bayElIds.forEach(id => {
      const bayEl = document.getElementById(id);
      if (bayEl) {
        bayEl.classList.remove("cad-bay-alert-amber", "cad-bay-alert-red");
        if (visible) {
          bayEl.style.opacity = "1";
          bayEl.style.filter = "none";
          if (status === "esperando") {
            bayEl.classList.add("cad-bay-alert-amber");
          } else if (status === "defecto") {
            bayEl.classList.add("cad-bay-alert-red");
          }
        } else {
          bayEl.style.opacity = "0.18";
          bayEl.style.filter = "grayscale(90%)";
        }
      }
    });

    if (pulseEl && beaconEl) {
      if (status === "esperando") {
        const mins = cabinaReq ? (cabinaReq.minutos_espera || 15) : 15;
        const isCritica = mins >= 20;

        pulseEl.className = isCritica
          ? "sensor-pin-pulse-red absolute w-12 h-12 rounded-full border-2 border-rose-500"
          : "sensor-pin-pulse-amber absolute w-12 h-12 rounded-full border-2 border-amber-400";

        beaconEl.className = isCritica
          ? "relative w-9 h-9 rounded-full bg-gradient-to-br from-rose-500 via-red-600 to-rose-700 border-2 border-white text-white flex items-center justify-center font-black text-xs shadow-xl shadow-rose-500/80 sensor-beacon-blink animate-pulse"
          : "relative w-9 h-9 rounded-full bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-500 border-2 border-slate-950 text-slate-950 flex items-center justify-center font-black text-xs shadow-xl shadow-amber-500/80 sensor-beacon-blink";

        if (tagEl) {
          tagEl.innerText = `• ${mins}m`;
          tagEl.className = isCritica ? "text-[9px] text-rose-950 font-mono font-black" : "text-[9px] text-slate-950 font-mono font-black";
        }
        if (statusBadgeEl) {
          statusBadgeEl.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span> âš ï¸ Esperando QG (${mins}m)`;
          statusBadgeEl.className = "px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono";
        }
      } else if (status === "defecto") {
        pulseEl.className = "sensor-pin-pulse-red absolute w-12 h-12 rounded-full border-2 border-rose-500";
        beaconEl.className = "relative w-9 h-9 rounded-full bg-gradient-to-br from-rose-500 via-red-600 to-red-700 border-2 border-white text-white flex items-center justify-center font-black text-xs shadow-xl shadow-rose-600/80 sensor-beacon-blink animate-pulse";
        if (tagEl) {
          tagEl.innerText = "• Defecto";
          tagEl.className = "text-[9px] text-rose-950 font-mono font-black";
        }
        if (statusBadgeEl) {
          statusBadgeEl.innerHTML = `<span class="w-2 h-2 rounded-full bg-rose-400"></span> ðŸš¨ Defecto Reportado`;
          statusBadgeEl.className = "px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono";
        }
      } else {
        // Normal / Liberada
        if (isK) {
          pulseEl.className = "sensor-pin-pulse-blue absolute w-10 h-10 rounded-full border-2 border-cyan-400";
          beaconEl.className = "relative w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 border-2 border-white text-white flex items-center justify-center font-black text-xs shadow-xl shadow-cyan-500/80";
        } else {
          pulseEl.className = "sensor-pin-pulse-green absolute w-10 h-10 rounded-full border-2 border-emerald-400";
          beaconEl.className = "relative w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 via-green-500 to-emerald-600 border-2 border-white text-slate-950 flex items-center justify-center font-black text-xs shadow-xl shadow-emerald-500/80";
        }
        if (tagEl) {
          tagEl.innerText = "";
        }
        if (statusBadgeEl) {
          statusBadgeEl.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400"></span> âœ” Normal / Liberada`;
          statusBadgeEl.className = "px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30";
        }
      }
    }
  });

  // Actualizar contadores del mapa y HUDs
  const totalPending = pendingCabinas.length;
  const badgeAlert = document.getElementById("badge-mapa-alert-count");
  if (badgeAlert) {
    badgeAlert.innerText = totalPending;
    badgeAlert.className = totalPending > 0
      ? "px-1.5 py-0.2 text-xs rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono animate-pulse"
      : "px-1.5 py-0.2 text-xs rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono";
  }

  const fCountEspera = document.getElementById("mapa-filter-count-espera");
  if (fCountEspera) fCountEspera.innerText = totalPending;
  const fCountDef = document.getElementById("mapa-filter-count-defectos");
  if (fCountDef) fCountDef.innerText = defectCount;
  const fCountLib = document.getElementById("mapa-filter-count-liberadas");
  if (fCountLib) fCountLib.innerText = 13 - (totalPending + defectCount);

  const hudFabsEspera = document.getElementById("hud-fabs-espera");
  if (hudFabsEspera) hudFabsEspera.innerText = `${fabsPendingCount} L&#237;neas`;
  const hudFabsLib = document.getElementById("hud-fabs-liberadas");
  if (hudFabsLib) hudFabsLib.innerText = liberadasCount;
  const hudFabsDef = document.getElementById("hud-fabs-defectos");
  if (hudFabsDef) hudFabsDef.innerText = defectCount;

  const hudKEspera = document.getElementById("hud-k-espera");
  if (hudKEspera) hudKEspera.innerText = `${kPendingCount} L&#237;neas`;

  const fabsTopBadge = document.getElementById("fabs-badge-solicitudes-top");
  if (fabsTopBadge) fabsTopBadge.innerText = `${fabsPendingCount} Solicitud${fabsPendingCount === 1 ? '' : 'es'} QG`;
}
window.updatePlantSensorsStatus = updatePlantSensorsStatus;
window.handleLoginSubmit = handleLoginSubmit;
window.hideLoginModal = hideLoginModal;

function abrirDetalleSensorPlanta(linea) {
  activeSensorDetalleLinea = linea;
  const supInfo = SUPERVISORES_POR_LINEA[linea];
  const compInfo = (appState.componentes || DEFAULT_COMPONENTES).find(c => c.modelo === linea) || {};
  const pendingCabinas = appState.cabinasCoordinador || [];
  const cabinaReq = pendingCabinas.find(c => c.linea === linea && c.estatus === "Esperando Coordinador");

  const modal = document.getElementById("modal-sensor-detalle");
  if (!modal) return;

  const tTitulo = document.getElementById("modal-sensor-titulo");
  const tArea = document.getElementById("modal-sensor-area");
  const tUrg = document.getElementById("modal-sensor-urgencia-badge");
  const tPn = document.getElementById("modal-sensor-pn");
  const tSup = document.getElementById("modal-sensor-supervisor");
  const tQg = document.getElementById("modal-sensor-qg");
  const tTiempo = document.getElementById("modal-sensor-tiempo");
  const tCriterio = document.getElementById("modal-sensor-criterio");
  const tNotas = document.getElementById("modal-sensor-notas");
  const bNotasBox = document.getElementById("modal-sensor-notas-box");
  const iconEl = document.getElementById("modal-sensor-icon");
  const iconBox = document.getElementById("modal-sensor-icon-box");
  const btnAtender = document.getElementById("modal-sensor-btn-atender-qg");

  const areaStr = supInfo ? supInfo.area : (compInfo.area || "FABS");
  if (tTitulo) tTitulo.innerText = `LÍNEA ${linea}`;
  if (tArea) tArea.innerText = areaStr;

  if (iconEl) {
    iconEl.className = SENSOR_ICONS_POR_LINEA[linea] || "fa-solid fa-microchip";
  }

  if (tPn) {
    tPn.innerText = `${compInfo.numero_parte || 'PN-' + linea} (${compInfo.modelo || linea}) • ${compInfo.familia || 'Estructural'}`;
  }

  if (tSup) {
    tSup.innerText = supInfo ? `${supInfo.nombre} (${supInfo.nomina})` : `Supervisor de L&#237;nea ${linea}`;
  }

  if (tCriterio) {
    tCriterio.innerText = compInfo.criterio || "Inspecci&#243;n dimensional, AWS D1.1 y calidad de ensamble.";
  }

  if (cabinaReq) {
    if (tUrg) {
      const mins = cabinaReq.minutos_espera || 15;
      tUrg.innerText = mins >= 20 ? "URGENCIA CRÍTICA" : "ESPERANDO COORDINADOR";
      tUrg.className = mins >= 20
        ? "px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono animate-pulse"
        : "px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono";
    }
    if (iconBox) {
      iconBox.className = "w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-2xl shadow-md shrink-0 animate-pulse";
    }
    if (tQg) {
      tQg.innerText = cabinaReq.coordinador_solicitado || "Coordinador / QG en Turno";
    }
    if (tTiempo) {
      tTiempo.innerText = `${cabinaReq.minutos_espera || 15} minutos esperando en piso`;
      tTiempo.className = "font-mono font-black text-amber-400";
    }
    if (bNotasBox) bNotasBox.classList.remove("hidden");
    if (tNotas) {
      tNotas.innerText = cabinaReq.notas || "El Supervisor requiere al Coordinador / QG para inspección y liberación de cabina terminada.";
    }
    if (btnAtender) {
      btnAtender.classList.remove("hidden");
      btnAtender.innerText = `Atender L&#237;nea ${linea} Ahora`;
    }
  } else {
    if (tUrg) {
      tUrg.innerText = "LÍNEA OPERANDO CONFORME";
      tUrg.className = "px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono";
    }
    if (iconBox) {
      iconBox.className = "w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-2xl shadow-md shrink-0";
    }
    if (tQg) {
      tQg.innerText = "No se requiere coordinador en este momento";
    }
    if (tTiempo) {
      tTiempo.innerText = "Sin tiempo de espera (L&#237;nea al día)";
      tTiempo.className = "font-mono font-semibold text-emerald-400";
    }
    if (bNotasBox) bNotasBox.classList.add("hidden");
    if (btnAtender) {
      btnAtender.classList.add("hidden");
    }
  }

  modal.classList.remove("hidden");
  modal.classList.add("flex");
}
window.abrirDetalleSensorPlanta = abrirDetalleSensorPlanta;

function cerrarDetalleSensorModal() {
  const modal = document.getElementById("modal-sensor-detalle");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
}
window.cerrarDetalleSensorModal = cerrarDetalleSensorModal;

function atenderQGDesdeSensor() {
  if (!activeSensorDetalleLinea) return;
  const linea = activeSensorDetalleLinea;
  cerrarDetalleSensorModal();

  const cabinaReq = (appState.cabinasCoordinador || []).find(c => c.linea === linea && c.estatus === "Esperando Coordinador");
  if (cabinaReq) {
    if (typeof abrirInspeccionCabina === "function") {
      abrirInspeccionCabina(cabinaReq.id);
    }
  } else {
    // Si no hay cabina pendiente, filtrar en cabinas
    if (typeof filtrarPorLineaQG === "function") {
      switchTab("cabinas");
      filtrarPorLineaQG(linea);
    }
  }
}
window.atenderQGDesdeSensor = atenderQGDesdeSensor;

function iniciarNuevaInspeccionDesdeSensor() {
  if (!activeSensorDetalleLinea) return;
  const linea = activeSensorDetalleLinea;
  cerrarDetalleSensorModal();
  switchTab("nueva");

  const selModelo = document.getElementById("modelo");
  if (selModelo) {
    selModelo.value = linea;
    if (typeof handleModeloChange === "function") {
      handleModeloChange();
    }
  }
}
window.iniciarNuevaInspeccionDesdeSensor = iniciarNuevaInspeccionDesdeSensor;

function simularAlertaSensorRandom() {
  if (!appState.cabinasCoordinador) {
    appState.cabinasCoordinador = JSON.parse(JSON.stringify(DEFAULT_CABINAS_COORDINADOR));
  }
  const pendingLines = appState.cabinasCoordinador.filter(c => c.estatus === "Esperando Coordinador").map(c => c.linea);
  const allLines = Object.keys(SUPERVISORES_POR_LINEA);
  const idleLines = allLines.filter(l => !pendingLines.includes(l));

  // Preferir líneas de Edificio K si estamos en K, o FABS si estamos en FABS
  let pool = idleLines;
  if (currentNaveMapa === 'k') {
    const kIdle = idleLines.filter(l => SUPERVISORES_POR_LINEA[l].area === "EDIFICIO K");
    if (kIdle.length > 0) pool = kIdle;
  }

  const pickedLine = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : "COBOT";
  const supInfo = SUPERVISORES_POR_LINEA[pickedLine] || { nombre: `Sup. L&#237;nea ${pickedLine}`, nomina: 4013, area: "EDIFICIO K" };
  const compInfo = (appState.componentes || DEFAULT_COMPONENTES).find(c => c.modelo === pickedLine) || { numero_parte: "PN-" + pickedLine };

  const nuevaAlerta = {
    id: "CAB-REQ-" + Date.now().toString().slice(-4),
    linea: pickedLine,
    area: supInfo.area,
    estacion: supInfo.area === "EDIFICIO K" ? "Estación Robótica K" : "Estación 4 - Salida de Cabina",
    numero_parte: compInfo.numero_parte,
    serie_cabina: "CAB-2026-" + Math.floor(9000 + Math.random() * 999),
    tipo_cabina: `Cabina / Componente ${pickedLine}`,
    hora_finalizada: new Date().toLocaleTimeString().substring(0, 5),
    fecha: new Date().toISOString().substring(0, 10),
    solicitante: `${supInfo.nombre} (${supInfo.nomina})`,
    supervisor_linea: `${supInfo.nombre} (${supInfo.nomina})`,
    coordinador_solicitado: appState.currentUser ? `${appState.currentUser.nombre} (${appState.currentUser.nomina})` : "Juan Pérez Martínez (1042)",
    turno: "Turno 1 (Matutino)",
    minutos_espera: Math.floor(10 + Math.random() * 15),
    estatus: "Esperando Coordinador",
    coordinador_asignado: null,
    criterios: [compInfo.criterio || "Inspecci&#243;n dimensional y soldadura"],
    notas: `[SIMULACIÓN EN PISO] Supervisor de L&#237;nea ${pickedLine} reporta pieza terminada y solicita presencia del Coordinador / QG para validación dimensional.`
  };

  appState.cabinasCoordinador.unshift(nuevaAlerta);
  try { localStorage.setItem("auditum_cabinas_coordinador", JSON.stringify(appState.cabinasCoordinador)); } catch(e) {}

  updateCabinasBadge();
  updatePlantSensorsStatus();

  // Cambiar a la nave correspondiente si la línea alertada es de K
  if (supInfo.area === "EDIFICIO K" && currentNaveMapa !== 'k') {
    setNaveMapa('k');
  } else if (supInfo.area === "FABS" && currentNaveMapa !== 'fabs') {
    setNaveMapa('fabs');
  }

  // Notificar al usuario
  alert(`⚡ ¡NUEVA ALERTA DE SENSOR ACTIVADA!\n\nL&#237;nea: ${pickedLine} (${supInfo.area})\nSerie: ${nuevaAlerta.serie_cabina}\nSupervisor: ${nuevaAlerta.supervisor_linea}\n\nEl sensor de L&#237;nea ${pickedLine} ahora está PARPADEANDO en el plano interactivo.`);
}
window.simularAlertaSensorRandom = simularAlertaSensorRandom;






// ==================== 6. GR&#193;FICAS DE CAUSAS RAÍZ HUMANAS & FACTORES DE PERSONAL ====================
function renderChartDefectosMotivos(defectItems) {
  const ctx = document.getElementById("chart-defectos-motivos");
  if (!ctx) return;
  if (appState.chartInstances.defectosMotivos) {
    appState.chartInstances.defectosMotivos.destroy();
  }

  // Agrupar causas raíz humanas
  const motivosCounts = {
    "Nuevo ingreso": 0,
    "En entrenamiento / Sin certificar": 0,
    "Falta de compromiso / Desinterés": 0,
    "Falta de herramienta o utillaje": 0,
    "Fatiga / Distracción": 0,
    "Prisa / Presión de ciclo": 0,
    "Instrucción SOP no clara": 0,
    "Relevo de turno incompleto": 0,
    "Desgaste de consumibles / Insumo": 0
  };

  let totalConPersonal = 0;
  let totalPendientes = 0;
  let totalRealizadas = 0;

  defectItems.forEach(item => {
    let m = item.responsable_motivo;
    if (!m) {
      const desc = ((item.descripcion_faltantes || "") + " " + (item.turnos && item.turnos[0] ? item.turnos[0].notas : "")).toLowerCase();
      if (desc.includes("nuevo") || desc.includes("ingreso") || desc.includes("aprend")) m = "Nuevo ingreso";
      else if (desc.includes("entrenam") || desc.includes("certif")) m = "En entrenamiento / Sin certificar";
      else if (desc.includes("desinter") || desc.includes("norma") || desc.includes("estándar") || desc.includes("compromiso")) m = "Falta de compromiso / Desinterés";
      else if (desc.includes("herramient") || desc.includes("utillaj") || desc.includes("escantill")) m = "Falta de herramienta o utillaje";
      else if (desc.includes("fatiga") || desc.includes("distra") || desc.includes("nocturn")) m = "Fatiga / Distracción";
      else if (desc.includes("prisa") || desc.includes("ciclo") || desc.includes("tiempo")) m = "Prisa / Presión de ciclo";
      else if (desc.includes("sop") || desc.includes("instrucc") || desc.includes("hoja")) m = "Instrucción SOP no clara";
      else if (desc.includes("relevo") || desc.includes("traspaso")) m = "Relevo de turno incompleto";
      else m = "En entrenamiento / Sin certificar";
    }

    if (motivosCounts[m] !== undefined) {
      motivosCounts[m]++;
    } else {
      motivosCounts["En entrenamiento / Sin certificar"]++;
    }

    if (item.responsable_nombre || m) {
      totalConPersonal++;
      if (item.retroalimentacion_estatus === "Realizada") {
        totalRealizadas++;
      } else {
        totalPendientes++;
      }
    }
  });

  // Actualizar Tarjetas KPI de Diagnóstico de Personal
  const elTot = document.getElementById("kpi-personal-involucrado-total");
  const elPend = document.getElementById("kpi-personal-pendientes-total");
  const elReal = document.getElementById("kpi-personal-realizadas-total");
  const elTop = document.getElementById("kpi-personal-top-causa");

  if (elTot) elTot.innerText = totalConPersonal + " colaboradores";
  if (elPend) elPend.innerText = totalPendientes + " pendientes";
  if (elReal) elReal.innerText = totalRealizadas + " concluidas";

  let maxCausa = "Ninguna";
  let maxCausaCount = 0;
  Object.keys(motivosCounts).forEach(k => {
    if (motivosCounts[k] > maxCausaCount) {
      maxCausaCount = motivosCounts[k];
      maxCausa = k;
    }
  });

  if (elTop) {
    elTop.innerHTML = maxCausaCount > 0 
      ? ('<strong class="text-amber-400">' + maxCausa + '</strong> (' + maxCausaCount + ' incidencias)')
      : 'Sin incidencias de personal reportadas.';
  }

  const labels = [
    "Nuevo ingreso",
    "En entrenamiento",
    "Falta compromiso / Desinterés",
    "Herramienta / Utillaje",
    "Fatiga / Distracción",
    "Prisa / Presión de ciclo",
    "SOP no clara",
    "Relevo incompleto",
    "Consumibles / Insumo"
  ];

  const dataValues = [
    motivosCounts["Nuevo ingreso"],
    motivosCounts["En entrenamiento / Sin certificar"],
    motivosCounts["Falta de compromiso / Desinterés"],
    motivosCounts["Falta de herramienta o utillaje"],
    motivosCounts["Fatiga / Distracción"],
    motivosCounts["Prisa / Presión de ciclo"],
    motivosCounts["Instrucción SOP no clara"],
    motivosCounts["Relevo de turno incompleto"],
    motivosCounts["Desgaste de consumibles / Insumo"]
  ];

  const backgroundColors = [
    "#f59e0b",
    "#38bdf8",
    "#ef4444",
    "#06b6d4",
    "#a855f7",
    "#f43f5e",
    "#10b981",
    "#64748b",
    "#eab308"
  ];

  if (typeof Chart !== "undefined") {
    appState.chartInstances.defectosMotivos = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [{
          label: "Incidencias por Causa Raíz",
          data: dataValues,
          backgroundColor: backgroundColors,
          borderColor: "#ffffff",
          borderWidth: 1,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(c) { return (c.raw || 0) + " defecto(s) registrado(s)"; }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              color: "#94a3b8",
              font: { family: "monospace", weight: "bold" }
            },
            grid: { color: "rgba(51, 65, 85, 0.4)" }
          },
          x: {
            ticks: {
              color: "#e2e8f0",
              font: { size: 10, weight: "bold" },
              maxRotation: 35,
              minRotation: 25
            },
            grid: { display: false }
          }
        }
      }
    });
  }

  const summaryEl = document.getElementById("defectos-motivos-summary");
  if (summaryEl) {
    summaryEl.innerHTML = 
      '<span>Predominante: <strong class="text-amber-300 font-bold">' + maxCausa + '</strong> (' + maxCausaCount + ' incidencias)</span> ' +
      '<span class="text-emerald-400 font-bold"><i class="fa-solid fa-circle-check"></i> ' + totalRealizadas + ' retroalimentaciones impartidas en piso</span>';
  }
}

// ==================== 7. TABLA DE PERSONAL QUE REQUIERE RETROALIMENTACIÓN ====================
function renderPersonalRetroalimentacionTable(defectItems) {
  const tbody = document.getElementById("personal-retro-table-body");
  const countLabel = document.getElementById("personal-retro-table-count");
  if (!tbody) return;

  const filterEstatus = document.getElementById("filtro-personal-estatus") ? document.getElementById("filtro-personal-estatus").value : "Pendiente";
  const filterLinea = document.getElementById("filtro-personal-linea") ? document.getElementById("filtro-personal-linea").value : "";
  const filterAreaPersonal = document.getElementById("personal-filter-area")?.value || document.getElementById("gerente-filter-area")?.value || "all";

  let list = (defectItems || []).filter(item => {
    const hasPerson = item.responsable_nombre || item.responsable_motivo || item.tiene_faltantes === "SI" || item.estatus === "Rechazado";
    if (!hasPerson) return false;

    const est = item.retroalimentacion_estatus || "Pendiente";
    if (filterEstatus && filterEstatus !== "TODOS" && est !== filterEstatus) return false;

    if (filterLinea && item.modelo !== filterLinea && item.area_ubicacion !== filterLinea) return false;
    if (filterAreaPersonal && filterAreaPersonal !== "all" && !matchItemArea(item, filterAreaPersonal)) return false;

    return true;
  });

  if (countLabel) {
    countLabel.innerText = "Mostrando " + list.length + " colaborador(es)";
  }

  if (list.length === 0) {
    tbody.innerHTML = 
      '<tr>' +
        '<td colspan="9" class="px-4 py-8 text-center text-slate-400 italic">' +
          '<i class="fa-solid fa-circle-check text-emerald-400 text-lg mr-2"></i> No hay colaboradores pendientes de retroalimentación bajo los filtros seleccionados.' +
        '</td>' +
      '</tr>';
    return;
  }

  tbody.innerHTML = "";
  list.forEach(item => {
    const tr = document.createElement("tr");
    tr.className = "hover:bg-slate-700/40 transition text-xs";

    const defs = typeof getDefectosInfo === "function" ? getDefectosInfo(item) : [];
    const defLabel = defs.length > 0 ? defs.join(", ") : (item.descripcion_faltantes ? "Faltante de Componente" : "Defecto Operativo");

    const opNombre = item.responsable_nombre || (item.turnos && item.turnos[0] ? ((item.turnos[0].turno || "").startsWith("Turno") ? ("Colaborador " + item.turnos[0].turno) : ("Colaborador Turno " + item.turnos[0].turno)) : "Colaborador de Soldadura");
    const opNomina = item.responsable_nomina || "5012";
    const motivo = item.responsable_motivo || "En entrenamiento / Sin certificar";
    const notas = item.responsable_observaciones || item.descripcion_faltantes || "Requiere refuerzo t&#233;cnico de estación.";
    const estatus = item.retroalimentacion_estatus || "Pendiente";

    let motivoBadgeColor = "bg-amber-500/20 text-amber-300 border-amber-500/40";
    let motivoIcon = "fa-triangle-exclamation";
    if (motivo.includes("compromiso") || motivo.includes("interesa")) {
      motivoBadgeColor = "bg-rose-500/20 text-rose-300 border-rose-500/40";
      motivoIcon = "fa-user-xmark";
    } else if (motivo.includes("Nuevo ingreso")) {
      motivoBadgeColor = "bg-orange-500/20 text-orange-300 border-orange-500/40";
      motivoIcon = "fa-user-plus";
    } else if (motivo.includes("entrenamiento") || motivo.includes("certificar")) {
      motivoBadgeColor = "bg-sky-500/20 text-sky-300 border-sky-500/40";
      motivoIcon = "fa-graduation-cap";
    } else if (motivo.includes("herramienta") || motivo.includes("utillaje")) {
      motivoBadgeColor = "bg-cyan-500/20 text-cyan-300 border-cyan-500/40";
      motivoIcon = "fa-wrench";
    } else if (motivo.includes("Fatiga")) {
      motivoBadgeColor = "bg-purple-500/20 text-purple-300 border-purple-500/40";
      motivoIcon = "fa-battery-quarter";
    } else if (motivo.includes("Prisa")) {
      motivoBadgeColor = "bg-red-500/20 text-red-300 border-red-500/40";
      motivoIcon = "fa-gauge-high";
    }

    const estatusBadge = estatus === "Realizada"
      ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono"><i class="fa-solid fa-circle-check mr-1"></i>Concluida</span>'
      : '<span class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono animate-pulse"><i class="fa-solid fa-clock mr-1"></i>Pendiente</span>';

    const accionBtn = estatus === "Realizada"
      ? '<span class="text-[11px] text-emerald-400 font-bold whitespace-nowrap"><i class="fa-solid fa-check"></i> Realizada</span>'
      : ('<button onclick="darRetroalimentacion(\'' + (item.id_inspeccion || '') + '\')" class="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-yellow-300 text-slate-950 font-black text-xs transition cursor-pointer shadow-md flex items-center gap-1.5 whitespace-nowrap active:scale-95">' +
          '<i class="fa-solid fa-chalkboard-user"></i> Dar Retroalimentaci&#243;n' +
        '</button>');

    tr.innerHTML = 
      '<td class="px-4 py-3 font-mono font-bold text-amber-300">' + (item.id_inspeccion || '') + '</td>' +
      '<td class="px-4 py-3 font-bold text-white whitespace-nowrap">' +
        '<div class="flex items-center gap-2">' +
          '<div class="w-6 h-6 rounded-full bg-slate-700 text-amber-400 border border-amber-400/40 flex items-center justify-center text-[10px] font-bold">' +
            (opNombre ? opNombre.charAt(0) : 'C') +
          '</div>' +
          '<span>' + opNombre + '</span>' +
        '</div>' +
      '</td>' +
      '<td class="px-4 py-3 whitespace-nowrap">' +
        '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-700 text-white border border-slate-600">' +
          (item.modelo || '') + ' (' + (item.area_ubicacion || '') + ')' +
        '</span>' +
      '</td>' +
      '<td class="px-4 py-3 font-mono text-cyan-400 whitespace-nowrap">' + opNomina + '</td>' +
      '<td class="px-4 py-3 whitespace-nowrap">' +
        '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">' +
          defLabel +
        '</span>' +
      '</td>' +
      '<td class="px-4 py-3 whitespace-nowrap">' +
        '<span class="px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 w-fit ' + motivoBadgeColor + '">' +
          '<i class="fa-solid ' + motivoIcon + '"></i> ' + motivo +
        '</span>' +
      '</td>' +
      '<td class="px-4 py-3 text-slate-300 max-w-xs truncate" title="' + notas + '">' +
        notas +
      '</td>' +
      '<td class="px-4 py-3 text-center whitespace-nowrap">' + estatusBadge + '</td>' +
      '<td class="px-4 py-3 text-right whitespace-nowrap">' + accionBtn + '</td>';

    tbody.appendChild(tr);
  });
}

function applyPersonalRetroalimentacionFilters() {
  if (typeof renderDefectosTab === "function") {
    renderDefectosTab();
  }
}
window.applyPersonalRetroalimentacionFilters = applyPersonalRetroalimentacionFilters;

// Acción: Marcar retroalimentación impartida desde la tabla
function darRetroalimentacion(idInspeccion) {
  const item = (appState.inspecciones || []).find(i => i.id_inspeccion === idInspeccion);
  if (!item) return;

  const opNombre = item.responsable_nombre || "el colaborador";
  const motivo = item.responsable_motivo || "calidad de ensamble";

  const confirmacion = confirm("¿Deseas confirmar que se impartió la Retroalimentaci&#243;n / Coaching en piso a " + opNombre + "?\n\nMotivo del Defecto: " + motivo + "\nL&#237;nea: " + (item.modelo || ""));
  if (!confirmacion) return;

  item.retroalimentacion_estatus = "Realizada";
  item.retroalimentacion_fecha = new Date().toISOString().replace("T", " ").substring(0, 19);
  item.retroalimentacion_por = appState.currentUser ? appState.currentUser.nomina : 1042;

  if (typeof logAuditAction === "function") {
    logAuditAction({
      id_inspeccion: item.id_inspeccion,
      campo_modificado: "Retroalimentaci&#243;n Impartida",
      status_final: item.estatus,
      valor_anterior: "Pendiente",
      motivo: "Retroalimentaci&#243;n técnica y concientización completada en piso para " + opNombre + " (" + (item.responsable_nomina || "5012") + ") sobre causa raíz: " + motivo + ".",
      usuario: appState.currentUser ? appState.currentUser.nomina : 1042
    });
  }

  if (typeof saveToLocalStorage === "function") saveToLocalStorage();
  if (typeof renderDefectosTab === "function") renderDefectosTab();
  alert("✅ Retroalimentaci&#243;n registrada exitosamente.\n\nColaborador: " + opNombre + "\nL&#237;nea: " + (item.modelo || "") + "\nEstatus: Retroalimentaci&#243;n Impartida y Sincronizada.");
}
window.darRetroalimentacion = darRetroalimentacion;

// ==================== ACTUALIZAR DETALLE DE SENSOR EN PLANTA CON PERSONAL Y RETROALIMENTACIÓN ====================
const oldAbrirDetalleSensorPlanta = window.abrirDetalleSensorPlanta;
function abrirDetalleSensorPlantaConPersonal(linea) {
  if (typeof oldAbrirDetalleSensorPlanta === "function") {
    oldAbrirDetalleSensorPlanta(linea);
  }

  const lineDefects = (appState.inspecciones || []).filter(item => {
    const isLine = item.modelo === linea || item.area_ubicacion === linea;
    const defs = typeof getDefectosInfo === "function" ? getDefectosInfo(item) : [];
    const hasDef = defs.length > 0 || item.tiene_faltantes === "SI" || item.estatus === "Rechazado" || item.responsable_nombre;
    return isLine && hasDef;
  });

  const listaContainer = document.getElementById("modal-sensor-personal-lista");
  const badgeCount = document.getElementById("modal-sensor-personal-count-badge");
  if (!listaContainer) return;

  const pendientes = lineDefects.filter(i => (i.retroalimentacion_estatus || "Pendiente") !== "Realizada");

  if (badgeCount) {
    badgeCount.innerText = pendientes.length + " pendiente(s)";
    badgeCount.className = pendientes.length > 0
      ? "px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono animate-pulse"
      : "px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono";
  }

  if (lineDefects.length === 0) {
    listaContainer.innerHTML = 
      '<div class="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">' +
        '<i class="fa-solid fa-circle-check text-emerald-400 text-base shrink-0"></i>' +
        '<span>✓ <strong>Cero defectos registrados en L&#237;nea ' + linea + '.</strong> Todo el personal opera conforme a estándar.</span>' +
      '</div>';
    return;
  }

  listaContainer.innerHTML = "";
  lineDefects.forEach(item => {
    const opNombre = item.responsable_nombre || "Colaborador de Ensamble";
    const opNomina = item.responsable_nomina || "5012";
    const motivo = item.responsable_motivo || "En entrenamiento / Sin certificar";
    const estatus = item.retroalimentacion_estatus || "Pendiente";
    const defs = typeof getDefectosInfo === "function" ? getDefectosInfo(item) : [];
    const defLabel = defs.length > 0 ? defs.join(", ") : (item.descripcion_faltantes || "No conformidad");

    const card = document.createElement("div");
    card.className = "p-2.5 rounded-lg bg-slate-800/90 border border-slate-700/80 flex items-center justify-between gap-3 text-xs";

    const accionBtn = estatus === "Realizada"
      ? '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono"><i class="fa-solid fa-check"></i> Impartida</span>'
      : ('<button onclick="darRetroalimentacionDesdeSensor(\'' + (item.id_inspeccion || '') + '\', \'' + linea + '\')" class="px-2.5 py-1 rounded bg-amber-400 hover:bg-yellow-300 text-slate-950 font-black text-[11px] transition cursor-pointer shadow-sm active:scale-95 flex items-center gap-1">' +
          '<i class="fa-solid fa-chalkboard-user"></i> Retroalimentar' +
        '</button>');

    card.innerHTML = 
      '<div class="flex items-center gap-2.5 min-w-0">' +
        '<div class="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-bold text-xs shrink-0">' +
          '<i class="fa-solid fa-user"></i>' +
        '</div>' +
        '<div class="min-w-0">' +
          '<div class="font-bold text-white flex items-center gap-1.5 truncate">' +
            '<span>' + opNombre + '</span>' +
            '<span class="font-mono text-amber-400 text-[10px]">(' + opNomina + ')</span>' +
          '</div>' +
          '<div class="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 truncate">' +
            '<span class="text-rose-400 font-semibold">' + defLabel + '</span>' +
            '<span>•</span>' +
            '<span class="text-amber-300">' + motivo + '</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="shrink-0">' +
        accionBtn +
      '</div>';

    listaContainer.appendChild(card);
  });
}
window.abrirDetalleSensorPlanta = abrirDetalleSensorPlantaConPersonal;

function darRetroalimentacionDesdeSensor(idInspeccion, linea) {
  darRetroalimentacion(idInspeccion);
  abrirDetalleSensorPlantaConPersonal(linea);
}
window.darRetroalimentacionDesdeSensor = darRetroalimentacionDesdeSensor;





