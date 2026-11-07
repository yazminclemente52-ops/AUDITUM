# 🛡️ Auditum – Sistema de Inspección de Calidad de Componentes de Acero

Aplicación multiplataforma (Web, Tablet y Móvil) diseñada para resolver de raíz los problemas de **manipulación indebida de registros, falta de trazabilidad y traspaso multiturno en plantas industriales**.

Vinculada a la base de datos de Google Sheets:
👉 **[Auditum - Hojas de cálculo de Google](https://docs.google.com/spreadsheets/d/1_2bdHpIZYeXUySb1FLOYHt15__Yqgb3uLsD0afsiBQw/edit)**

---

## 📁 Estructura del Proyecto

```
C:\Users\YAZMIN\.gemini\antigravity\scratch\auditum-app\
├── index.html                 # Interfaz visual responsive (PWA / Web / Tablet)
├── app.js                     # Motor de lógica, watermark, PDF y auditoría
├── google-apps-script.js      # Backend API para pegar en Google Sheets Apps Script
└── README.md                  # Manual de uso y despliegue
```

---

## ⚡ Cómo Usar la Aplicación Inmediatamente

1. **Abrir en tu computadora o tablet**:
   * Simplemente haz doble clic sobre el archivo [index.html](file:///C:/Users/YAZMIN/.gemini/antigravity/scratch/auditum-app/index.html) para abrirlo en Google Chrome, Microsoft Edge o Safari.
   * Funciona inmediatamente tanto en modo local (sin conexión) como sincronizado con la nube.

2. **Acceso Multiplataforma (Móvil / iPad / Laptop)**:
   * Puedes subir esta carpeta a **GitHub** y desplegarla con un clic en **Vercel** o **GitHub Pages**, obteniendo un enlace seguro HTTPS (`https://auditum.vercel.app`) accesible desde cualquier dispositivo en el piso de producción.

---

## 🔗 Cómo Conectar la App con tu Google Sheet en 3 Minutos

1. Abre tu hoja de Google Sheets: [Auditum](https://docs.google.com/spreadsheets/d/1_2bdHpIZYeXUySb1FLOYHt15__Yqgb3uLsD0afsiBQw/edit).
2. En la barra superior, haz clic en **Extensiones** > **Apps Script**.
3. Borra el código existente y copia el contenido completo del archivo [google-apps-script.js](file:///C:/Users/YAZMIN/.gemini/antigravity/scratch/auditum-app/google-apps-script.js).
4. Guarda el proyecto (icono de disco o `Ctrl + S`).
5. Haz clic en el botón azul superior: **Implementar** (Deploy) > **Nueva implementación**.
6. Selecciona el tipo de engrane: **Aplicación web**.
7. En los campos configura:
   * **Descripción**: `Auditum API`
   * **Ejecutar como**: `Yo (tu correo)`
   * **Quién tiene acceso**: `Cualquier usuario` (Anyone) *(vital para que la app móvil y web pueda escribir datos)*.
8. Haz clic en **Implementar**, autoriza los permisos de Google y copia la **URL de la aplicación web**.
9. En la aplicación Auditum, haz clic en el botón superior **"Google Sheets: Modo Local"** y pega tu URL.
10. ¡Listo! Cada inspección, foto, turno y modificación se registrará automáticamente en tu hoja de Google Sheets.

---

## 🛡️ Solución a las Problemáticas Críticas

| Problema Anterior | Solución Implementada en Auditum |
| :--- | :--- |
| **Manipulación indebida (cambios de autoría)** | La autoría queda sellada con el número de nómina. Si un supervisor modifica un dato, no puede sobreescribir el historial: el sistema exige justificación obligatoria y registra el antes y el después en `6.TBL_AUDITORIA`. |
| **Falta de trazabilidad horaria** | La pestaña `2.TBL_TURNOS_DETALLE` registra tramo por tramo cada intervención de los inspectores sin borrar las horas de los turnos previos. |
| **Fotos dudosas o recicladas** | Motor de marca de agua en Canvas: estampa indeleblemente en la foto la nómina del operador, fecha/hora y número de serie del acero. |
| **Información incompleta** | Formulario con validación estricta de número de parte, tolerancias técnicas, modelo automático, número de serie físico y switch de faltantes. |
| **Demoras en liberación y reportes** | Botón para generar y descargar instantáneamente el **Certificado Oficial de Inspección en PDF** con diseño formal industrial, firmas y sellos. |
