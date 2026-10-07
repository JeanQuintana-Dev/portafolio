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
}
