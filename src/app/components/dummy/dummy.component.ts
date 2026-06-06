import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-dummy',
  templateUrl: './dummy.component.html',
  styleUrls: ['./dummy.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class DummyComponent {}
