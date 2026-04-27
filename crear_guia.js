const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType,
        BorderStyle, WidthType, ShadingType, HeadingLevel, PageBreak } = require('docx');
const fs = require('fs');

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };

const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: "Arial", size: 22 }
      }
    },
    paragraphStyles: [
      {
        id: "Heading1",
        name: "Heading 1",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 32, bold: true, font: "Arial", color: "0066CC" },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 0 }
      },
      {
        id: "Heading2",
        name: "Heading 2",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 28, bold: true, font: "Arial", color: "0099FF" },
        paragraph: { spacing: { before: 180, after: 100 }, outlineLevel: 1 }
      }
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    children: [
      // Título
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("🎫 SISTEMA DE TICKETS")]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Guía de Instalación Rápida", bold: true, size: 24 })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "¡Operativo en 10 minutos!", italics: true, size: 20, color: "666666" })]
      }),
      new Paragraph({ text: "" }),
      
      // Lo que necesitas
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("📋 Lo que necesitas")]
      }),
      new Paragraph({
        children: [new TextRun("✓ Solo necesitas instalar Node.js (gratuito)")]
      }),
      new Paragraph({
        children: [new TextRun("✓ Descargar de https://nodejs.org/")]
      }),
      new Paragraph({
        children: [new TextRun("✓ Elegir la versión LTS (la más estable)")]
      }),
      new Paragraph({ text: "" }),

      // PASO 1
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("🚀 PASO 1: Instalar Node.js")]
      }),
      new Paragraph({
        numbering: { reference: "numbers", level: 0 },
        children: [new TextRun("Ve a https://nodejs.org/")]
      }),
      new Paragraph({
        numbering: { reference: "numbers", level: 0 },
        children: [new TextRun("Haz clic en LTS (Recomendado)")]
      }),
      new Paragraph({
        numbering: { reference: "numbers", level: 0 },
        children: [new TextRun("Descarga e instala")]
      }),
      new Paragraph({
        numbering: { reference: "numbers", level: 0 },
        children: [new TextRun("Reinicia tu computadora")]
      }),
      new Paragraph({
        numbering: { reference: "numbers", level: 0 },
        children: [new TextRun("Verifica: Abre Símbolo del Sistema y escribe node --version")]
      }),
      new Paragraph({ text: "" }),

      // PASO 2
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("🚀 PASO 2: Descargar los archivos")]
      }),
      new Paragraph({
        children: [new TextRun("Todos los archivos ya están listos. Asegúrate de que estén organizados así:")]
      }),
      new Paragraph({ text: "" }),

      // Tabla de estructura
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [4680, 4680],
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 4680, type: WidthType.DXA },
                shading: { fill: "D5E8F0", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({
                  children: [new TextRun({ text: "Carpeta", bold: true })]
                })]
              }),
              new TableCell({
                borders,
                width: { size: 4680, type: WidthType.DXA },
                shading: { fill: "D5E8F0", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({
                  children: [new TextRun({ text: "Archivos", bold: true })]
                })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 4680, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({
                  children: [new TextRun("sistema-tickets/")]
                })]
              }),
              new TableCell({
                borders,
                width: { size: 4680, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({
                  children: [new TextRun("server.js, package.json")]
                })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 4680, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({
                  children: [new TextRun("  └─ public/")]
                })]
              }),
              new TableCell({
                borders,
                width: { size: 4680, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({
                  children: [new TextRun("index.html, admin.html, .css y .js")]
                })]
              })
            ]
          })
        ]
      }),
      new Paragraph({ text: "" }),

      // PASO 3
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("🚀 PASO 3: Instalar dependencias")]
      }),
      new Paragraph({
        children: [new TextRun("1. Abre Símbolo del Sistema (cmd o PowerShell)")]
      }),
      new Paragraph({
        children: [new TextRun("2. Ve a tu carpeta del proyecto:")]
      }),
      new Paragraph({
        children: [new TextRun({ text: "   cd C:\\Users\\TuUsuario\\Desktop\\sistema-tickets", italics: true, color: "666666" })]
      }),
      new Paragraph({
        children: [new TextRun("3. Ejecuta:")]
      }),
      new Paragraph({
        children: [new TextRun({ text: "   npm install", bold: true, color: "FF6600" })]
      }),
      new Paragraph({
        children: [new TextRun("   (Espera 1-2 minutos)")]
      }),
      new Paragraph({ text: "" }),

      // PASO 4
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("🚀 PASO 4: Ejecutar la aplicación")]
      }),
      new Paragraph({
        children: [new TextRun("En el mismo Símbolo del Sistema, escribe:")]
      }),
      new Paragraph({
        children: [new TextRun({ text: "npm start", bold: true, size: 24, color: "00CC00" })]
      }),
      new Paragraph({ text: "" }),
      new Paragraph({
        children: [new TextRun("Verás algo como:")]
      }),
      new Paragraph({
        children: [new TextRun({ text: "Servidor corriendo en puerto 3000", italics: true, color: "666666" })]
      }),
      new Paragraph({
        children: [new TextRun({ text: "Accede a http://localhost:3000", italics: true, color: "666666" })]
      }),
      new Paragraph({ text: "" }),
      
      new Paragraph({
        children: [new TextRun({ text: "¡LISTO! 🎉 La aplicación está en http://localhost:3000", bold: true, size: 24, color: "00AA00" })]
      }),
      new Paragraph({ text: "" }),

      // Cómo usar
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("📱 Cómo usar")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun({ text: "Para USUARIOS:", color: "0066CC" })]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Van a http://localhost:3000")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Llenan el formulario con su email y descripción")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Reciben un ID de ticket")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Pueden buscar su ticket con su email")]
      }),
      new Paragraph({ text: "" }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun({ text: "Para TI (Administrador):", color: "0066CC" })]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Ve a http://localhost:3000/admin")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Contraseña: admin123")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Ves todos los tickets")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Puedes cambiar estado (abierto → en proceso → cerrado)")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Ves estadísticas (tiempo promedio de resolución)")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Puedes enviar respuestas a los usuarios")]
      }),
      new Paragraph({ text: "" }),

      // Para Internet
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("☁️ Para que tus CLIENTES accedan desde INTERNET")]
      }),
      new Paragraph({
        children: [new TextRun("Para que otros usuarios accedan desde cualquier lugar, necesitas subir a un servidor gratuito (Render).")]
      }),
      new Paragraph({ text: "" }),
      new Paragraph({
        children: [new TextRun("Lee el archivo README.md (está incluido) para instrucciones detalladas sobre Render.")]
      }),
      new Paragraph({ text: "" }),
      new Paragraph({
        children: [new TextRun({ text: "Es muy sencillo: solo 5-10 clics en Render y tu aplicación estará en internet.", bold: true, size: 22 })]
      }),
      new Paragraph({ text: "" }),

      // Características
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("✨ Características de tu Sistema")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Usuarios:")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("✓ Crear tickets con email, nombre, asunto, descripción")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("✓ Ver estado de su ticket (abierto, en proceso, cerrado)")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("✓ Enviar mensajes y comentarios")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("✓ Buscar tickets por email")]
      }),
      new Paragraph({ text: "" }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Administrador:")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("✓ Ver todos los tickets")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("✓ Cambiar estado de tickets")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("✓ Responder mensajes a usuarios")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("✓ Ver estadísticas:")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 1 },
        children: [new TextRun("Total de tickets")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 1 },
        children: [new TextRun("Tickets por estado")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 1 },
        children: [new TextRun("Tiempo promedio de resolución")]
      }),
      new Paragraph({ text: "" }),

      // Soporte
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("🆘 Solución de problemas")]
      }),
      new Paragraph({
        numbering: { reference: "numbers", level: 0 },
        children: [new TextRun("Si no funciona, verifica que Node.js esté instalado:")]
      }),
      new Paragraph({
        children: [new TextRun({ text: "   node --version", italics: true, color: "666666" })]
      }),
      new Paragraph({
        numbering: { reference: "numbers", level: 0 },
        children: [new TextRun("Cierra el Símbolo del Sistema y abre uno nuevo")]
      }),
      new Paragraph({
        numbering: { reference: "numbers", level: 0 },
        children: [new TextRun("Verifica que estés en la carpeta correcta")]
      }),
      new Paragraph({
        numbering: { reference: "numbers", level: 0 },
        children: [new TextRun("Ejecuta nuevamente: npm start")]
      }),
      new Paragraph({ text: "" }),

      // Footer
      new Paragraph({
        alignment: AlignmentType.CENTER,
        border: {
          top: { style: BorderStyle.SINGLE, size: 6, color: "0066CC" }
        },
        children: [new TextRun({ text: "¡Sistema de Tickets - 100% Gratuito! ✓", bold: true, size: 20, color: "0066CC" })]
      })
    ],
    numbering: {
      config: [
        {
          reference: "bullets",
          levels: [
            {
              level: 0,
              format: "bullet",
              text: "•",
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: { left: 720, hanging: 360 }
                }
              }
            },
            {
              level: 1,
              format: "bullet",
              text: "◦",
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: { left: 1440, hanging: 360 }
                }
              }
            }
          ]
        },
        {
          reference: "numbers",
          levels: [
            {
              level: 0,
              format: "decimal",
              text: "%1.",
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: { left: 720, hanging: 360 }
                }
              }
            }
          ]
        }
      ]
    }
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("/sessions/inspiring-compassionate-gauss/mnt/outputs/GUIA_INSTALACION.docx", buffer);
  console.log("Documento creado: GUIA_INSTALACION.docx");
});
