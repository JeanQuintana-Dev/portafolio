import { Component, Input } from '@angular/core';

export type ByteGesture = 'idle' | 'walk' | 'wave' | 'yawn' | 'smile' | 'think' | 'dance';

@Component({
  selector: 'app-byte-character',
  templateUrl: './byte-character.component.html',
  styleUrl: './byte-character.component.css',
  host: { '[attr.data-gesture]': 'gesture', 'aria-hidden': 'true' }
})
export class ByteCharacterComponent {
  @Input() gesture: ByteGesture = 'idle';
  @Input() sequence = 0;
}
