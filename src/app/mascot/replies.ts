export const quickTopics = ['¿Quién es Jean?', 'Habilidades', 'Proyectos', 'IA aplicada', 'Experiencia'];
export function replyTo(text: string): string {
  const q = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  if (/\b(horus|tarifas|contratos)\b/.test(q)) return 'Jean creó un flujo Python para recorrer contratos de HORUS, relacionar prestadores, tarifas y CUPS y exportar CSV de Región 3. Datos conectados, café bien invertido ☕';
  if (/\b(pai|vacunacion|vacunas)\b/.test(q)) return 'En PAI, Jean transforma la matriz nominal a una fila por afiliado y vacuna: estado, fecha y pendientes listos para analizar con Power Query y Power BI.';
  if (/\b(pym|promocion|mantenimiento)\b/.test(q)) return 'Jean consolida datos de Promoción y Mantenimiento desde SharePoint con Power Query: valoraciones, tamizajes, edad, curso de vida y seguimiento.';
  if (/\b(psicologia|angela|doctoralia)\b/.test(q)) return 'Desarrolló el sitio de psicología clínica de Ángela Álvarez: diseño adaptable y conexiones con Doctoralia, WhatsApp, Wompi e Instagram. Lo encuentras en Proyectos.';
  if (/\b(cups)\b/.test(q)) return 'Jean desarrolló un buscador de servicios CUPS para Región 3, con consulta por territorio, código y descripción. Busca su tarjeta en Proyectos para abrirlo.';
  if (/\b(ia|inteligencia|codex|chatgpt|claude|notebooklm)\b/.test(q)) return 'Jean usa ChatGPT y Codex para desarrollar y depurar, y Claude y NotebookLM para organizar información. Revisa los resultados con criterio técnico. También cursó IA Aplicada para FOMAG en agosto–septiembre de 2026.';
  if (/\b(habilidades|tecnologias|stack|python|sql|power|dax|excel|angular|programacion)\b/.test(q)) return 'Su caja de herramientas: Power BI, DAX, Power Query, Excel, Python, SQL, Angular y Power Platform. Su especialidad es conectar datos, automatización y desarrollo.';
  if (/\b(proyectos|proyecto|trabajos|creado|realizado|portafolio)\b/.test(q)) return 'Ocho proyectos te esperan: psicología clínica, HORUS/CUPS, PAI, PyM, buscador CUPS, seguimiento de actividades, tableros regionales y validación de información. Pregúntame por alguno 🕹️';
  if (/\b(experiencia|fomag|banco|trabaja|trabajo|trayectoria)\b/.test(q)) return 'Jean trabaja en analítica, automatización y soluciones digitales para FOMAG Región 3: Bolívar, Córdoba y Sucre. En el Banco de la República desarrolló soluciones internas con Power BI, Power Automate y Power Apps.';
  if (/\b(formacion|estudio|universidad|ingeniero|carrera)\b/.test(q)) return 'Jean es Ingeniero de Sistemas de la Universidad de Cartagena. Combina desarrollo de software, análisis de datos y formación reciente en IA aplicada.';
  if (/\b(contacto|contactar|linkedin|whatsapp|correo|contratar)\b/.test(q)) return 'Puedes hablar con Jean por LinkedIn o WhatsApp desde Contacto, al final de la página. También encuentras su GitHub. Yo hago la presentación; él construye la solución 🤝';
  if (/\b(chiste|divertido|broma)\b/.test(q)) return '¿Por qué el dato fue a terapia? Porque tenía demasiados problemas de relación. Jean lo ayudó con el modelo… yo solo traje café ☕';
  if (/\b(byte|mascota|robot|bot|tu|eres|nombre)\b/.test(q) && !/jean/.test(q)) return 'Soy Byte, el compañero de píxeles de Jean. Paseo, miro el cursor y cuento lo esencial de su trabajo. Mi especialidad secreta: convertir café en buen humor ☕';
  if (/\b(hola|buenas|saludos|hey)\b/.test(q)) return '¡Hola! Soy Byte 🕹️ Jean convierte datos y procesos en soluciones útiles. Pregúntame por sus habilidades, experiencia o proyectos.';
  if (/\b(gracias|genial|bien)\b/.test(q)) return '¡A tu servicio! Si necesitas otra pista sobre Jean, aquí sigo. Entre píxel y píxel ☕';
  if (/\b(jean|quien|perfil|presentacion|sobre)\b/.test(q)) return 'Jean Quintana es Ingeniero de Sistemas y Analista de Datos. Construye tableros, automatizaciones y aplicaciones web con experiencia en salud y gestión regional. Datos que orientan, código que resuelve.';
  return 'Esa se sale de mi pequeño mapa de píxeles 😅 Puedo contarte sobre Jean, sus habilidades, IA, experiencia y proyectos. Prueba con “HORUS”, “PAI” o “contacto”.';
}
