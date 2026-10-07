import { Component } from '@angular/core';

@Component({
  selector: 'app-ai-showcase',
  templateUrl: './ai-showcase.component.html',
  styleUrl: './ai-showcase.component.css'
})
export class AiShowcaseComponent {
  active = 0;
  readonly cases = [
    { title: 'Experiencias web', tools: 'Angular · Codex · UX', detail: 'Del requisito al componente: uso IA para desarrollar, depurar y documentar este portafolio y el sitio de psicología de Ángela Álvarez. Reviso la interfaz, la accesibilidad y las integraciones antes de publicar.', result: 'Portafolio JCQM.DEV y sitio de psicología clínica', url: 'https://angela-alvarez-psicologia.vercel.app/', link: 'Explorar el sitio de psicología' },
    { title: 'Automatización con Python', tools: 'Python · APIs REST · HORUS', detail: 'Desarrollo iterativo de scripts para recorrer contratos paginados, relacionar prestadores, tarifas y CUPS y exportar CSV. La IA apoya la escritura y la depuración; compruebo la paginación, los errores y la consistencia de los archivos.', result: 'Extracción de contratos, tarifas y procedimientos de Región 3', url: '', link: '' },
    { title: 'Datos preparados para analizar', tools: 'Power Query · DAX · Excel', detail: 'Uso IA para apoyar fórmulas, transformaciones y documentación en la matriz nominal PAI y la consolidación de Promoción y Mantenimiento. Valido estados, fechas, estructuras y cálculos frente a las fuentes.', result: 'Seguimiento nominal PAI y consolidación PyM', url: '', link: '' },
    { title: 'Información con contexto', tools: 'ChatGPT · Claude · NotebookLM', detail: 'Organizo información, preparo explicaciones y documento procesos con apoyo de IA. Parto de las fuentes y del objetivo de trabajo, y reviso las conclusiones antes de usarlas.', result: 'Análisis y documentación de procesos regionales', url: '', link: '' }
  ];
  toggle(index: number) { this.active = this.active === index ? -1 : index; }
}
