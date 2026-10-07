import { Component, Input } from '@angular/core';
import type { Project } from '../home/projects';
@Component({
  selector: 'app-project-card',
  templateUrl: './project-card.component.html',
  styleUrls: ['./project-card.component.css'],
  host: { '[class.wide]': 'project.featured' }
})
export class ProjectCardComponent {
  @Input({ required: true }) project!: Project;
  get coverLabel(): string {
    const labels: Record<string, string> = {
      horus: 'Contratos → CSV', pai: 'Vacunación · Bolívar', pym: 'Ruta de atención · PyM',
      cups: 'Consulta de servicios', actividades: 'Trabajo en equipo',
      regional: 'Indicadores regionales', validacion: 'Datos consistentes'
    };
    return labels[this.project.id] ?? this.project.title;
  }
}
