export interface Reservation {
  id: string;
  carId: string;      // Référence à la voiture
  userId: string;     // Référence à l'utilisateur
  dateDebut: Date;
  dateFin: Date;
  statut: 'en_attente' | 'confirmee' | 'annulee';
  prixTotal: number;
}
