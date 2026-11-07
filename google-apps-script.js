/**
 * =========================================================================================
 * AUDITUM - BACKEND EN GOOGLE APPS SCRIPT (Web App API)
 * Hoja vinculada: Auditum (ID: 1_2bdHpIZYeXUySb1FLOYHt15__Yqgb3uLsD0afsiBQw)
 * 
 * INSTRUCCIONES DE INSTALACIÓN:
 * 1. En tu hoja de cálculo "Auditum", entra en el menú superior: Extensiones > Apps Script.
 * 2. Borra el contenido existente y pega todo este código.
 * 3. Guarda el proyecto (icono de disco o Ctrl+S).
 * 4. Haz clic en el botón azul superior: "Implementar" (Deploy) > "Nueva implementación".
 * 5. Selecciona tipo: "Aplicación web" (Web App).
 * 6. Configura:
 *    - Descripción: "Auditum API v1"
 *    - Ejecutar como: "Yo" (tu cuenta)
 *    - Quién tiene acceso: "Cualquier usuario" (Anyone) -> Necesario para que la app web y móvil pueda enviar datos.
 * 7. Haz clic en "Implementar", autoriza los permisos y copia la URL proporcionada.
 * 8. Pega esa URL en la configuración de la aplicación Auditum.
 * =========================================================================================
 */

const SHEET_NAMES = {
  INSPECCIONES: "1-TBS_INSPECCIONES",
  TURNOS: "2.TBL_TURNOS_DETALLE",
  FOTOS: "3.TBL_EVIDENCIAS_FOTOS",
  USUARIOS: "4.TBL_USUARIOS",
  COMPONENTES: "5.TBL_COMPONENTES",
  AUDITORIA: "6.TBL_AUDITORIA",
  CATALOGOS: "7.CATALOGOS"
};

/**
 * Manejo de peticiones GET: Lectura de datos y verificación de estado
 */
function doGet(e) {
  try {
    const action = e.parameter.action || "get_all_data";
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === "ping") {
      return jsonResponse({ success: true, message: "Auditum API en línea", timestamp: new Date().toISOString() });
    }

    if (action === "get_all_data") {
      const data = {
        inspecciones: getSheetRecords(ss, SHEET_NAMES.INSPECCIONES),
        turnos: getSheetRecords(ss, SHEET_NAMES.TURNOS),
        fotos: getSheetRecords(ss, SHEET_NAMES.FOTOS),
        usuarios: getSheetRecords(ss, SHEET_NAMES.USUARIOS),
        componentes: getSheetRecords(ss, SHEET_NAMES.COMPONENTES),
        auditoria: getSheetRecords(ss, SHEET_NAMES.AUDITORIA),
        catalogos: getCatalogos(ss)
      };
      return jsonResponse({ success: true, data: data });
    }

    return jsonResponse({ success: false, error: "Acción no reconocida" }, 400);
  } catch (error) {
    return jsonResponse({ success: false, error: error.toString() }, 500);
  }
}

/**
 * Manejo de peticiones POST: Escritura, creación de inspecciones, traspaso de turnos y auditoría
 */
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    switch (action) {
      case "create_inspection":
        return handleCreateInspection(ss, payload.data);
      case "add_shift_record":
        return handleAddShiftRecord(ss, payload.data);
      case "save_photo":
        return handleSavePhoto(ss, payload.data);
      case "release_inspection":
        return handleReleaseInspection(ss, payload.data);
      case "update_inspection_with_audit":
        return handleUpdateInspectionWithAudit(ss, payload.data);
      default:
        return jsonResponse({ success: false, error: "Acción POST desconocida: " + action }, 400);
    }
  } catch (error) {
    return jsonResponse({ success: false, error: error.toString() }, 500);
  }
}

/**
 * 1. Crear nueva inspección con folio único y registro de turno inicial
 */
function handleCreateInspection(ss, data) {
  const sheet = ss.getSheetByName(SHEET_NAMES.INSPECCIONES);
  ensureHeaders(sheet, [
    "ID_Inspeccion", "Fecha_Creacion", "Nomina_Creador", "Numero_Parte",
    "Modelo", "Numero_Serie", "Area_Ubicacion", "Estatus", "Tiene_Faltantes",
    "Descripcion_Faltantes", "Fecha_Liberacion", "Nomina_Liberador", "URL_Reporte_PDF", "Version_Reporte"
  ]);

  const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
  
  // Agregar fila a 1-TBS_INSPECCIONES
  sheet.appendRow([
    data.id_inspeccion,
    timestamp,
    data.nomina_creador,
    data.numero_parte,
    data.modelo,
    data.numero_serie,
    data.area_ubicacion,
    data.estatus || "En Proceso",
    data.tiene_faltantes || "NO",
    data.descripcion_faltantes || "",
    "", // Fecha_Liberacion
    "", // Nomina_Liberador
    data.url_reporte_pdf || "",
    "1.0"
  ]);

  // Si incluye registro inicial de turno, guardarlo en TBL_TURNOS_DETALLE
  if (data.turno_inicial) {
    const sheetTurnos = ss.getSheetByName(SHEET_NAMES.TURNOS);
    sheetTurnos.appendRow([
      "TRN-" + Utilities.formatDate(new Date(), "GMT", "yyyyMMdd-HHmmss"),
      data.id_inspeccion,
      data.nomina_creador,
      data.turno_inicial.turno,
      timestamp,
      "", // Hora_Fin aún abierta
      0,  // Tiempo_Efectivo_Min
      "En Proceso",
      data.turno_inicial.notas || "Inicio de inspección de componente"
    ]);
  }

  // Guardar fotos asociadas si las hay
  if (data.fotos && data.fotos.length > 0) {
    data.fotos.forEach(foto => {
      savePhotoRow(ss, {
        id_inspeccion: data.id_inspeccion,
        nomina_capturista: data.nomina_creador,
        tipo_evidencia: foto.tipo,
        url_drive: foto.url_o_base64,
        descripcion: foto.descripcion
      });
    });
  }

  return jsonResponse({ success: true, message: "Inspección registrada con éxito", id: data.id_inspeccion });
}

/**
 * 2. Registrar continuación de turno o traspaso entre turnos
 */
function handleAddShiftRecord(ss, data) {
  const sheetTurnos = ss.getSheetByName(SHEET_NAMES.TURNOS);
  const now = new Date();
  const timestamp = Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");

  const idTurno = "TRN-" + Utilities.formatDate(now, "GMT", "yyyyMMdd-HHmmss");
  const minutos = data.tiempo_minutos || 0;

  sheetTurnos.appendRow([
    idTurno,
    data.id_inspeccion,
    data.nomina_colaborador,
    data.turno,
    data.hora_inicio || timestamp,
    data.hora_fin || timestamp,
    minutos,
    data.estatus_entrega || "Pausado por Fin de Turno",
    data.notas_traspaso || ""
  ]);

  // Actualizar estado general en la hoja principal si aplica
  if (data.nuevo_estatus_inspeccion) {
    updateInspectionCell(ss, data.id_inspeccion, "Estatus", data.nuevo_estatus_inspeccion);
  }

  return jsonResponse({ success: true, message: "Registro de turno agregado", id_turno: idTurno });
}

/**
 * 3. Guardar foto de evidencia (con subida a Google Drive opcional)
 */
function handleSavePhoto(ss, data) {
  const result = savePhotoRow(ss, data);
  return jsonResponse({ success: true, photo: result });
}

function savePhotoRow(ss, data) {
  const sheetFotos = ss.getSheetByName(SHEET_NAMES.FOTOS);
  const now = new Date();
  const idFoto = "FOT-" + Utilities.formatDate(now, "GMT", "yyyyMMdd-HHmmss") + "-" + Math.floor(Math.random() * 1000);
  const timestamp = Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");

  let photoUrl = data.url_drive || "";

  // Si viene en Base64, la guardamos directamente en una carpeta de Drive de Auditum
  if (data.base64_image) {
    try {
      const folderName = "Auditum_Evidencias_Calidad";
      const folders = DriveApp.getFoldersByName(folderName);
      let targetFolder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);
      
      const contentType = data.base64_image.substring(data.base64_image.indexOf(":") + 1, data.base64_image.indexOf(";"));
      const bytes = Utilities.base64Decode(data.base64_image.split(",")[1]);
      const blob = Utilities.newBlob(bytes, contentType, `${data.id_inspeccion}_${idFoto}.jpg`);
      const file = targetFolder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      photoUrl = file.getUrl();
    } catch (e) {
      photoUrl = "Error al guardar en Drive: " + e.message;
    }
  }

  sheetFotos.appendRow([
    idFoto,
    data.id_inspeccion,
    data.nomina_capturista,
    data.tipo_evidencia || "Evidencia General",
    photoUrl,
    timestamp,
    data.descripcion || ""
  ]);

  return { id_foto: idFoto, url: photoUrl };
}

/**
 * 4. Liberación o Rechazo formal de la inspección
 */
function handleReleaseInspection(ss, data) {
  const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
  const sheet = ss.getSheetByName(SHEET_NAMES.INSPECCIONES);
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];

  const colId = headers.indexOf("ID_Inspeccion");
  const colEstatus = headers.indexOf("Estatus");
  const colFechaLib = headers.indexOf("Fecha_Liberacion");
  const colNominaLib = headers.indexOf("Nomina_Liberador");
  const colUrlPdf = headers.indexOf("URL_Reporte_PDF");

  let rowIndex = -1;
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][colId]) === String(data.id_inspeccion)) {
      rowIndex = i + 1; // 1-based index
      break;
    }
  }

  if (rowIndex === -1) {
    return jsonResponse({ success: false, error: "Inspección no encontrada: " + data.id_inspeccion }, 404);
  }

  const nuevoEstatus = data.decision === "rechazado" ? "Rechazado" : "Liberado";
  sheet.getRange(rowIndex, colEstatus + 1).setValue(nuevoEstatus);
  sheet.getRange(rowIndex, colFechaLib + 1).setValue(timestamp);
  sheet.getRange(rowIndex, colNominaLib + 1).setValue(data.nomina_liberador);
  if (data.url_reporte_pdf) {
    sheet.getRange(rowIndex, colUrlPdf + 1).setValue(data.url_reporte_pdf);
  }

  // Registrar en TBL_AUDITORIA
  logAuditEntry(ss, {
    id_inspeccion: data.id_inspeccion,
    nomina_editor: data.nomina_liberador,
    campo: "Estatus",
    anterior: rows[rowIndex - 1][colEstatus],
    nuevo: nuevoEstatus,
    motivo: `Liberación formal de inspección por calidad. Dictamen: ${nuevoEstatus}. Observaciones: ${data.observaciones || "Sin observaciones adicionales"}`
  });

  return jsonResponse({ success: true, message: `Inspección marcada como ${nuevoEstatus}` });
}

/**
 * 5. Modificación controlada con justificación obligatoria (Anti-manipulación)
 */
function handleUpdateInspectionWithAudit(ss, data) {
  const sheet = ss.getSheetByName(SHEET_NAMES.INSPECCIONES);
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  const colId = headers.indexOf("ID_Inspeccion");
  const colVersion = headers.indexOf("Version_Reporte");

  let rowIndex = -1;
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][colId]) === String(data.id_inspeccion)) {
      rowIndex = i + 1;
      break;
    }
  }

  if (rowIndex === -1) {
    return jsonResponse({ success: false, error: "Inspección no encontrada" }, 404);
  }

  const colTarget = headers.indexOf(data.campo_modificado);
  if (colTarget === -1) {
    return jsonResponse({ success: false, error: "Campo no existe: " + data.campo_modificado }, 400);
  }

  const valorAnterior = rows[rowIndex - 1][colTarget];
  sheet.getRange(rowIndex, colTarget + 1).setValue(data.valor_nuevo);

  // Incrementar versión del reporte si existe
  if (colVersion !== -1) {
    const currentVer = parseFloat(rows[rowIndex - 1][colVersion]) || 1.0;
    sheet.getRange(rowIndex, colVersion + 1).setValue((currentVer + 0.1).toFixed(1));
  }

  // Bitácora obligatoria
  logAuditEntry(ss, {
    id_inspeccion: data.id_inspeccion,
    nomina_editor: data.nomina_editor,
    campo: data.campo_modificado,
    anterior: valorAnterior,
    nuevo: data.valor_nuevo,
    motivo: data.justificacion_motivo
  });

  return jsonResponse({ success: true, message: "Campo actualizado y auditado correctamente" });
}

/**
 * Función auxiliar para registrar en TBL_AUDITORIA
 */
function logAuditEntry(ss, auditData) {
  const sheetAudit = ss.getSheetByName(SHEET_NAMES.AUDITORIA);
  const now = new Date();
  const idAudit = "AUD-" + Utilities.formatDate(now, "GMT", "yyyyMMdd-HHmmss") + "-" + Math.floor(Math.random() * 100);
  const timestamp = Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");

  sheetAudit.appendRow([
    idAudit,
    auditData.id_inspeccion,
    auditData.nomina_editor,
    timestamp,
    auditData.campo,
    String(auditData.anterior || ""),
    String(auditData.nuevo || ""),
    auditData.motivo || "Ajuste sin justificación especificada"
  ]);
}

/**
 * Helpers para lectura y respuestas JSON
 */
function getSheetRecords(ss, sheetName) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];
  
  const headers = values[0];
  const records = [];
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    // Ignorar si está vacío el primer campo
    if (!row[0] && row[0] !== 0) continue;
    const item = {};
    headers.forEach((h, colIdx) => {
      item[h] = row[colIdx];
    });
    records.push(item);
  }
  return records;
}

function getCatalogos(ss) {
  const sheet = ss.getSheetByName(SHEET_NAMES.CATALOGOS);
  if (!sheet) return {};
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return {};

  const result = {};
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const catName = row[0];
    const rawOptions = row[1];
    if (catName && rawOptions) {
      result[catName] = String(rawOptions).split(",").map(s => s.trim());
    }
  }
  return result;
}

function updateInspectionCell(ss, idInspeccion, columnName, value) {
  const sheet = ss.getSheetByName(SHEET_NAMES.INSPECCIONES);
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  const colId = headers.indexOf("ID_Inspeccion");
  const colTarget = headers.indexOf(columnName);

  if (colId === -1 || colTarget === -1) return;

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][colId]) === String(idInspeccion)) {
      sheet.getRange(i + 1, colTarget + 1).setValue(value);
      break;
    }
  }
}

function ensureHeaders(sheet, defaultHeaders) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(defaultHeaders);
  }
}

function jsonResponse(data, status = 200) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
