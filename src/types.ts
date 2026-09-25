export type CropStage = 'preparo' | 'plantio' | 'pulverizacao' | 'colheita';

export interface CropField {
  id: string;
  farmId: string;
  name: string;
  crop: string;
  areaHectares: number;
  currentStage: CropStage;
  variety?: string;
  plantingDate?: string;
  expectedHarvestDate?: string;
  soilType?: string;
  updatedAt: string;
}

export type LivestockCategory = 'corte' | 'leite';

export interface LivestockGroup {
  id: string;
  farmId: string;
  name: string;
  category: LivestockCategory;
  headCount: number;
  currentDiet: string;
  breed?: string;
  pastureLocation?: string;
  averageWeightKg?: number;
  lastVaccinationDate: string | null;
  lastVaccineName?: string;
}

export type MachineType = 'trator' | 'colheitadeira' | 'pulverizador' | 'veiculo';
export type MachineStatus = 'operacional' | 'em_manutencao';

export interface Machine {
  id: string;
  farmId: string;
  model: string;
  type: MachineType;
  hourMeter: number;
  status: MachineStatus;
  manufacturingYear?: number;
  fuelType?: 'Diesel S10' | 'Diesel Comum' | 'Gasolina' | 'Etanol' | 'Elétrico';
  nextServiceHours?: number;
  licenseOrSerial?: string;
  lastMaintenanceDate: string;
}

export type ActivityModule = 'lavoura' | 'rebanho' | 'maquina';

export interface ActivityLog {
  id: string;
  farmId: string;
  module: ActivityModule;
  targetName: string;
  actionTitle: string;
  date: string;
  notes: string;
}

export interface FarmUser {
  id: string;
  name: string;
  farmName: string;
}
