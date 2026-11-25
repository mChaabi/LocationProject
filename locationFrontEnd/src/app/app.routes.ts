import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home';
import { AboutComponent } from './components/about/about';
import { ContactComponent } from './components/contact-form/contact-form';
import { CarListComponent } from './components/car-list/car-list';
import { ReservationComponent } from './components/reservation-form/reservation-form';
import { RegisterComponent } from './components/register/register';
import { CarDetailComponent } from './components/car-detail/car-detail';
import { LoginComponent } from './components/login/login';
import { AdminComponent } from './components/admin/admin';
import { adminGuard } from './core/admin-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' }, // Redirection par défaut vers l'accueil
  { path: 'home', component: HomeComponent },
  { path: 'cars', component: CarListComponent },
  { path: 'about', component: AboutComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'admin', component: AdminComponent, canActivate: [adminGuard] },
  { path: 'reservations', component: ReservationComponent },
  { path: 'cars', component: CarListComponent },
  { path: 'cars/:id', component: CarDetailComponent },
];
