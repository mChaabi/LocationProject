import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CarService } from '../../services/car-service';
import { MediaService } from '../../services/media-service';
import { OptionService } from '../../services/option';

@Component({
  selector: 'app-car-detail', standalone: true, imports: [RouterLink],
  templateUrl: './car-detail.html', styleUrl: './car-detail.css'
})
export class CarDetailComponent implements OnInit {
  private carService = inject(CarService);
  private optService = inject(OptionService);
  private media = inject(MediaService);
  private route = inject(ActivatedRoute);
  private id = this.route.snapshot.paramMap.get('id')!;

  dates = { debut: this.route.snapshot.queryParamMap.get('debut'), fin: this.route.snapshot.queryParamMap.get('fin') };
  options = this.optService.options;
  photos = signal<string[]>([]);
  active = signal(0);
  car = computed(() => this.carService.cars().find(c => c.id === Number(this.id)));

  ngOnInit() {
    if (!this.carService.cars().length) this.carService.getAllCars();
    this.optService.load();
    this.media.list('CAR', this.id).subscribe(l =>
      this.photos.set(l.filter(m => m.kind === 'PHOTO').map(m => this.media.url(m.id))));
  }
}