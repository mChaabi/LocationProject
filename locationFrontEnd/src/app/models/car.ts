export interface Car {
  id?: number;
  marque: string;
  modele: string;
  typeBoite: 'automatique' | 'manuelle';
  couleur: string;
  annee: number;
  prixJournalier: number;
  disponible: boolean;
  imageUrL?: string;
}
