import { Component } from '@angular/core';
import { WorkstationComponent } from '../workstation/workstation.component';
import { AmbientComponent } from '../ambient/ambient.component';
import { ProjectCardComponent } from '../project-card/project-card.component';
import { ProjectCategory, projects } from './projects';

@Component({
  selector: 'app-home',
  imports: [WorkstationComponent, AmbientComponent, ProjectCardComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  readonly projects = projects;
  readonly categories: ProjectCategory[] = ['Todos', 'Desarrollo web', 'Datos y BI', 'Automatización'];
  category: ProjectCategory = 'Todos';
  get visibleProjects() { return this.projects.filter(p => this.category === 'Todos' || p.category === this.category); }
  selectCategory(category: ProjectCategory) { this.category = category; }
}
