# Sistema de Tickets - Guía de Instalación

¡Hola! Te muestro cómo instalar tu sistema de tickets **fácilmente en 10 minutos**. 

---

## 📋 Lo que necesitas

Solo necesitas descargar e instalar **Node.js** (es gratis):
👉 https://nodejs.org/

**Descarga la versión LTS** (la recomendada, no la última)

---

## 🚀 Paso 1: Instalar Node.js

1. Ve a https://nodejs.org/
2. Haz clic en **"LTS"** (Recomendado)
3. Ejecuta el instalador
4. Sigue los pasos (todos por defecto está bien)
5. Reinicia tu computadora

**Verificar que se instaló correctamente:**
- Abre el "Símbolo del Sistema" (o PowerShell)
- Escribe: `node --version`
- Debe mostrarte un número (ej: v18.17.0)

---

## 🚀 Paso 2: Descargar los archivos

Ya tienes todos los archivos listos. Solo asegúrate de que la carpeta tenga esta estructura:

```
sistema-tickets/
├── server.js
├── package.json
├── .gitignore
└── public/
    ├── index.html
    ├── admin.html
    ├── style.css
    ├── script.js
    └── script-admin.js
```

---

## 🚀 Paso 3: Instalar las dependencias

1. Abre **Símbolo del Sistema** o **PowerShell**
2. Navega a tu carpeta de proyecto. Por ejemplo:
   ```
   cd C:\Users\TuUsuario\Desktop\sistema-tickets
   ```
3. Ejecuta este comando:
   ```
   npm install
   ```
   (Esto descargará las librerías necesarias. Tarda 1-2 minutos)

---

## 🚀 Paso 4: Ejecutar la aplicación LOCALMENTE

1. En el mismo Símbolo del Sistema, escribe:
   ```
   npm start
   ```

2. Verás algo como:
   ```
   Servidor corriendo en puerto 3000
   Accede a http://localhost:3000
   ```

3. Abre tu navegador y ve a: **http://localhost:3000**

¡**Listo!** Ya funciona en tu computadora 🎉

---

## 📱 Cómo usar:

### Para USUARIOS (crear tickets):
- Van a http://localhost:3000
- Llenan el formulario
- Reciben un ID del ticket
- Pueden dar seguimiento con su email

### Para TI (administrador):
- Ve a http://localhost:3000/admin
- Contraseña por defecto: **admin123**
  (Puedes cambiarla en server.js)
- Ves todos los tickets
- Puedes cambiar estado (abierto → en proceso → cerrado)
- Ves estadísticas (tiempo promedio de resolución, etc.)

---

## ☁️ PASO 5: Desplegar en INTERNET (Render)

Para que tus clientes accedan desde internet, necesitas subir a un servidor gratuito.

### Opción A: Usar Render (RECOMENDADO - MÁS FÁCIL)

**Paso 1: Crear cuenta GitHub**
1. Ve a https://github.com
2. Haz clic en "Sign up"
3. Llena los datos
4. Confirma tu email

**Paso 2: Subir tu código a GitHub**
1. Abre Símbolo del Sistema en tu carpeta del proyecto
2. Ejecuta estos comandos (uno por uno):
   ```
   git init
   git add .
   git commit -m "Sistema de tickets inicial"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/sistema-tickets.git
   git push -u origin main
   ```
   (Reemplaza TU_USUARIO con tu nombre de GitHub)

**Paso 3: Desplegar en Render**
1. Ve a https://render.com
2. Haz clic en "Sign up" con tu cuenta de GitHub
3. Haz clic en "New" → "Web Service"
4. Selecciona tu repositorio "sistema-tickets"
5. Llena los datos:
   - **Name**: sistema-tickets
   - **Branch**: main
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
6. Haz clic en "Create Web Service"

¡**Listo!** En 2-3 minutos Render te dará una URL pública como:
```
https://sistema-tickets-xyz.onrender.com
```

Esa URL es la que compartes con tus clientes 🎉

---

## 🔐 IMPORTANTE: Cambiar contraseña de admin

1. Abre el archivo **server.js** con cualquier editor de texto
2. Busca la línea: `if (token !== 'admin123')`
3. Cambia 'admin123' por tu contraseña segura
4. Guarda el archivo
5. Reinicia la aplicación

---

## 📊 ¿Qué puedo hacer?

✅ **Usuarios:**
- Crear ticket con formulario
- Ver estado de su ticket
- Dejar mensajes/comentarios
- Dar seguimiento por email

✅ **Administrador (tú):**
- Ver todos los tickets
- Cambiar estado (abierto → en proceso → cerrado)
- Responder mensajes
- Ver estadísticas:
  - Total de tickets
  - Tickets abiertos/en proceso/cerrados
  - Tiempo promedio de resolución

---

## ❓ Preguntas frecuentes

### P: ¿Dónde se guardan los datos?
**R:** En una base de datos local (tickets.db). En Render se guarda en la nube.

### P: ¿Cuántos tickets puedo tener?
**R:** Ilimitados. Tanto localmente como en Render.

### P: ¿Es realmente gratuito?
**R:** Sí. Node.js, Render y toda esta solución es **100% gratuita**.

### P: ¿Qué pasa si reinicio mi computadora?
**R:** La aplicación se detiene. Solo tienes que ejecutar `npm start` nuevamente en la carpeta del proyecto.

### P: ¿Puedo cambiar los colores o el diseño?
**R:** Sí. Edita el archivo **public/style.css**

### P: ¿Puedo agregar más campos al formulario?
**R:** Sí. Edita **public/index.html** y **server.js**

---

## 🆘 Si algo no funciona

1. Verifica que Node.js esté instalado: `node --version`
2. Verifica que estés en la carpeta correcta
3. Cierra el Símbolo del Sistema y abre uno nuevo
4. Intenta nuevamente: `npm start`

---

## 📞 Soporte

Si tienes dudas:
- Verifica que instalaste Node.js correctamente
- Revisa que los archivos estén en la carpeta correcta
- Si Render no funciona, verifica que hayas subido a GitHub correctamente

---

¡**Ahora tienes tu sistema de tickets operativo!** 🎉

Puedes compartir la URL con tus clientes y empezar a recibir y gestionar tickets inmediatamente.
