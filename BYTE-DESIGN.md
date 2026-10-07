# Byte y sección IA aplicada

Byte es un sprite original generado con Imagegen: robot retro de píxeles, cabeza CRT, sonrisa, colores crema y vinotinto, fondo transparente. El PNG se recorta y reduce con nearest-neighbor a 96 × 138 px. Los ojos son capas DOM que interpolan suavemente hacia el cursor.

El paseo usa requestAnimationFrame fuera de Angular, velocidad limitada y llegada gradual; se detiene al interactuar, al ocultarse la pestaña, en pantallas táctiles y con movimiento reducido. El chat es una guía local con respuestas verificadas del portafolio: no envía preguntas ni datos a un servidor. Permite café, baile, pausa, ocultar y restaurar. Respeta Escape, foco, contraste de ambos temas y movimiento reducido.

IA aplicada reemplaza cuatro cards por una composición de dos columnas y cuatro áreas desplegables: experiencias web, Python/HORUS, preparación de datos y organización de información. La formación FOMAG queda como nota editorial.

Validación: build Angular de producción y prerender; respuestas de perfil, IA, experiencia, PAI, HORUS, contacto, humor y pregunta desconocida.

## Revisión de movimiento y composición

Byte usa ahora un personaje SVG articulado con la misma identidad de robot CRT y paleta vinotinto y crema. Cabeza, brazos, piernas, ojos y boca son piezas independientes. No hay traslación vertical ni rebote del cuerpo: el paseo mueve brazos y pies; el saludo mueve una mano; el bostezo estira los brazos y abre la boca; la sonrisa y la concentración cambian el rostro. Los gestos se alternan con pausas y se pueden activar desde el chat. El seguimiento del cursor, las respuestas locales, la ocultación y la preferencia de movimiento reducido se conservan.

Las portadas de proyectos sustituyen las etiquetas genéricas de flujo por iconos y títulos breves específicos. Se compactan portadas, contenido, márgenes entre secciones y pie de página. El buscador CUPS enlaza a https://consulta-prestadores-r3.vercel.app/.
