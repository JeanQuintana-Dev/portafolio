export type ProjectCategory = 'Todos' | 'Desarrollo web' | 'Datos y BI' | 'Automatización';
export interface Project {
  id: string; title: string; category: ProjectCategory; type: string; description: string;
  outcome: string; tags: string[]; steps: string[]; url?: string; repo?: string;
  featured?: boolean; visual: 'web' | 'pipeline' | 'data' | 'workflow';
}
export const projects: Project[] = [
  { id: 'psicologia', title: 'Ángela Álvarez · Psicología clínica', category: 'Desarrollo web', type: 'Sitio profesional · 2026',
    description: 'Sitio adaptable para presentar servicios clínicos y facilitar el contacto y el agendamiento. Integra Doctoralia, WhatsApp, un enlace de pago Wompi y acceso a Instagram.',
    outcome: 'Una presencia digital que conecta servicios, agenda y canales de atención.',
    tags: ['Web responsive', 'Vercel', 'IA aplicada'], steps: ['Servicios', 'Agendamiento', 'Contacto'],
    url: 'https://angela-alvarez-psicologia.vercel.app/', repo: 'https://github.com/JeanQuintana-Dev/angela-alvarez-psicologia', featured: true, visual: 'web' },
  { id: 'horus', title: 'Extracción de contratos, tarifas y CUPS', category: 'Automatización', type: 'Integración de APIs · HORUS',
    description: 'Flujo Python para recorrer contratos paginados, seleccionar los de evento activos y relacionar prestadores, tarifas y procedimientos de Bolívar, Córdoba y Sucre.',
    outcome: 'Archivos CSV consolidados para revisar parametrización y valores frente a lo negociado.',
    tags: ['Python', 'APIs REST', 'Google Colab', 'CSV'], steps: ['Contratos', 'Prestadores', 'Tarifas', 'CUPS', 'CSV'], featured: true, visual: 'pipeline' },
  { id: 'pai', title: 'Seguimiento nominal de vacunación PAI', category: 'Datos y BI', type: 'Preparación de datos · 2026',
    description: 'Transformación de la matriz nominal de Bolívar a una fila por afiliado y vacuna. Distingue aplicadas y faltantes, conservando la fecha únicamente cuando existe una aplicación.',
    outcome: 'Modelo preparado para analizar vacunas pendientes, curso de vida y aplicaciones por mes.',
    tags: ['Power Query', 'Power BI', 'SharePoint'], steps: ['Matriz nominal', 'Normalización', 'Vacuna / estado / fecha'], visual: 'data' },
  { id: 'pym', title: 'Promoción y Mantenimiento de la salud', category: 'Datos y BI', type: 'Consolidación y calidad de datos',
    description: 'Consulta Power Query conectada a SharePoint para limpiar y consolidar valoraciones, tamizajes y actividades. Estructura edad, curso de vida y estado de seguimiento para su análisis.',
    outcome: 'Una base organizada para explorar atención registrada y brechas de seguimiento.',
    tags: ['Power Query', 'Excel', 'SharePoint', 'Power BI'], steps: ['SharePoint', 'Limpieza', 'Seguimiento PyM'], visual: 'data' },
  { id: 'cups', title: 'Buscador de servicios CUPS · Región 3', category: 'Desarrollo web', type: 'Portal de consulta',
    description: 'Consulta de prestadores y servicios por territorio, código CUPS o descripción, con filtros dinámicos y acceso al detalle del servicio.',
    outcome: 'Acceso más directo a la oferta de servicios regional.',
    tags: ['Buscador CUPS', 'Vercel', 'UX'], steps: ['Buscar', 'Filtrar', 'Consultar'], url: 'https://consulta-prestadores-r3.vercel.app/', visual: 'workflow' },
  { id: 'actividades', title: 'Seguimiento de actividades · Región 3', category: 'Desarrollo web', type: 'Aplicación colaborativa',
    description: 'Tablero compartido para crear, asignar y controlar actividades con persistencia centralizada, orientado a la coordinación del equipo regional.',
    outcome: 'Seguimiento común de tareas y responsabilidades.',
    tags: ['Next.js', 'Base de datos', 'Vercel'], steps: ['Crear', 'Asignar', 'Seguimiento'], url: 'https://seguimiento-actividades-r3.vercel.app/', visual: 'workflow' },
  { id: 'regional', title: 'Tableros de seguimiento regional', category: 'Datos y BI', type: 'Business Intelligence',
    description: 'Indicadores operativos, de salud, contratación y PQRS para Bolívar, Córdoba y Sucre. Combina modelado, medidas DAX, control de calidad y seguimiento mensual.',
    outcome: 'Información regional organizada para apoyar decisiones de gestión.',
    tags: ['Power BI', 'DAX', 'Power Query'], steps: ['Fuentes', 'Modelo', 'Indicadores'], visual: 'data' },
  { id: 'validacion', title: 'Procesamiento y validación de información', category: 'Automatización', type: 'Scripts y flujos de trabajo',
    description: 'Flujos para consolidar archivos, validar estructuras y automatizar consultas y certificados mediante Python, Excel y APIs.',
    outcome: 'Procesos repetibles para preparar y revisar información.',
    tags: ['Python', 'Excel', 'APIs'], steps: ['Consolidar', 'Validar', 'Exportar'], visual: 'pipeline' }
];
