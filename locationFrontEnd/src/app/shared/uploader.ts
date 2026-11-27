import { Component, inject, input, output, signal } from '@angular/core';
import { HttpEventType } from '@angular/common/http';
import { MediaService } from '../services/media-service';
import { MediaItem, MediaKind } from '../models/media';

interface Job { id: number; name: string; progress: number; status: 'uploading' | 'done' | 'error'; error?: string; preview?: string; }

@Component({
  selector: 'app-uploader', standalone: true,
  template: `
    <label class="zone" [class.drag]="dragging()"
           (dragover)="$event.preventDefault(); dragging.set(true)" (dragleave)="dragging.set(false)"
           (drop)="$event.preventDefault(); dragging.set(false); pick($any($event).dataTransfer.files)">
      <input type="file" hidden [accept]="accept()" [multiple]="multiple()"
             [attr.capture]="camera() ? 'environment' : null"
             (change)="pick($any($event.target).files); $any($event.target).value = ''">
      <span class="ico">{{ icon() }}</span>
      <b>{{ label() }}</b>
      <small>{{ hint() }}</small>
    </label>

    @for (j of queue(); track j.id) {
      <div class="job" [class.err]="j.status === 'error'" [class.ok]="j.status === 'done'">
        @if (j.preview) { <img [src]="j.preview" alt=""> } @else { <span class="file">📄</span> }
        <div class="grow">
          <span class="n">{{ j.name }}</span>
          <div class="bar"><i [style.width.%]="j.progress"></i></div>
          @if (j.error) { <small>{{ j.error }}</small> }
        </div>
        <span class="state">{{ j.status === 'done' ? '✓' : j.status === 'error' ? '✕' : j.progress + '%' }}</span>
        @if (j.status === 'error') { <button type="button" (click)="remove(j.id)">Fermer</button> }
      </div>
    }`,
  styles: [`
    :host { display:block; }
    .zone { display:grid; justify-items:center; gap:4px; padding:26px 16px; text-align:center; cursor:pointer;
      border:2px dashed #c7d2fe; border-radius:18px; background:#f8f9ff; transition:all .35s var(--ease); }
    .zone:hover { border-color:var(--primary); background:#eef2ff; transform:translateY(-2px); }
    .zone.drag { border-style:solid; border-color:var(--primary); background:#e0e7ff; transform:scale(1.02); animation:pulse 1s infinite; }
    @keyframes pulse { 50% { box-shadow:0 0 0 8px rgba(79,70,229,.12); } }
    .ico { font-size:2rem; transition:transform .4s var(--ease); } .zone:hover .ico { transform:translateY(-4px) scale(1.1); }
    small { color:var(--muted); }
    .job { display:flex; align-items:center; gap:12px; margin-top:10px; padding:10px 12px; background:#fff; border:1px solid var(--line);
      border-radius:14px; animation:fadeUp .4s var(--ease) backwards; }
    .job img, .file { width:48px; height:48px; border-radius:10px; object-fit:cover; display:grid; place-items:center; background:#eef2ff; }
    .grow { flex:1; min-width:0; } .n { display:block; font-size:.85rem; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .bar { height:6px; margin-top:6px; background:var(--line); border-radius:99px; overflow:hidden; }
    .bar i { display:block; height:100%; border-radius:99px; background:linear-gradient(90deg,var(--primary),var(--primary-2)); transition:width .3s; }
    .ok .bar i { background:#10b981; } .err .bar i { background:var(--danger); } .err small { color:var(--danger); }
    .state { font:700 .8rem 'Inter'; } .ok .state { color:#10b981; } .err .state { color:var(--danger); }
  `]
})
export class UploaderComponent {
  private media = inject(MediaService);

  ownerType = input.required<string>();
  ownerId = input.required<string>();
  kind = input.required<MediaKind>();
  accept = input('image/*');
  multiple = input(true);
  camera = input(false);          // true on phones: opens the camera directly
  icon = input('📷');
  label = input('Glissez vos fichiers ici ou cliquez');
  hint = input('JPG, PNG, WEBP · 10 Mo max');
  uploaded = output<MediaItem>();

  dragging = signal(false);
  queue = signal<Job[]>([]);
  private seq = 0;

  pick(files: FileList | null) { Array.from(files ?? []).forEach(f => this.send(f)); }

  remove(id: number) {
    const j = this.queue().find(x => x.id === id);
    if (j?.preview) URL.revokeObjectURL(j.preview);
    this.queue.update(q => q.filter(x => x.id !== id));
  }

  private send(file: File) {
    const job: Job = { id: ++this.seq, name: file.name, progress: 0, status: 'uploading',
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined };
    this.queue.update(q => [...q, job]);
    const patch = (p: Partial<Job>) => this.queue.update(q => q.map(j => j.id === job.id ? { ...j, ...p } : j));

    const max = file.type.startsWith('video/') ? 100 : 10;
    if (file.size > max * 1024 * 1024) { patch({ status: 'error', error: `Fichier trop volumineux (max ${max} Mo)` }); return; }

    this.media.upload(file, this.ownerType(), this.ownerId(), this.kind()).subscribe({
      next: e => {
        if (e.type === HttpEventType.UploadProgress && e.total) patch({ progress: Math.round(100 * e.loaded / e.total) });
        if (e.type === HttpEventType.Response) {
          patch({ progress: 100, status: 'done' });
          this.uploaded.emit(e.body!);
          setTimeout(() => this.remove(job.id), 1600);
        }
      },
      error: err => patch({ status: 'error', error: typeof err.error === 'string' ? err.error : 'Échec de l’envoi' })
    });
  }
}