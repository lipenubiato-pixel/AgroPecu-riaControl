import { CropField, LivestockGroup, Machine, ActivityLog, FarmUser } from '../types';

export const INITIAL_USER: FarmUser = {
  id: 'user-default-1',
  name: 'Carlos Oliveira',
  farmName: 'Fazenda Terra Produtiva',
};

export const INITIAL_CROPS: CropField[] = [
  {
    id: 'crop-1',
    farmId: 'user-default-1',
    name: 'Talhão 01 - Sede',
    crop: 'Soja',
    variety: 'TMG 7062 IPRO',
    areaHectares: 65,
    currentStage: 'plantio',
    plantingDate: '2026-10-15',
    expectedHarvestDate: '2027-02-28',
    soilType: 'Argiloso (Latossolo Vermelho)',
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'crop-2',
    farmId: 'user-default-1',
    name: 'Talhão 02 - Riacho Fundo',
    crop: 'Milho Safrinha',
    variety: 'DKB 360 PRO3',
    areaHectares: 45,
    currentStage: 'pulverizacao',
    plantingDate: '2026-09-01',
    expectedHarvestDate: '2027-01-20',
    soilType: 'Misto / Franco-arenoso',
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];

export const INITIAL_LIVESTOCK: LivestockGroup[] = [
  {
    id: 'live-1',
    farmId: 'user-default-1',
    name: 'Lote 01 - Novilhas Nelore',
    category: 'corte',
    breed: 'Nelore Padrão (PO)',
    pastureLocation: 'Piquete 04 - Morro Alto',
    headCount: 85,
    averageWeightKg: 380,
    currentDiet: 'Pasto de Braquiária com Sal Mineral Proteinado',
    lastVaccinationDate: new Date(Date.now() - 86400000 * 18).toISOString(),
    lastVaccineName: 'Febre Aftosa (1ª dose)',
  },
  {
    id: 'live-2',
    farmId: 'user-default-1',
    name: 'Lote 02 - Vacas Holandesas',
    category: 'leite',
    breed: 'Holandesa P&B',
    pastureLocation: 'Pasto Rotacionado - Piquete 01',
    headCount: 32,
    averageWeightKg: 540,
    currentDiet: 'Silagem de Milho + Ração Concentrada 22% PB',
    lastVaccinationDate: new Date(Date.now() - 86400000 * 40).toISOString(),
    lastVaccineName: 'Clostridiose',
  },
];

export const INITIAL_MACHINES: Machine[] = [
  {
    id: 'mach-1',
    farmId: 'user-default-1',
    model: 'Trator John Deere 6110J',
    type: 'trator',
    hourMeter: 1420,
    manufacturingYear: 2021,
    fuelType: 'Diesel S10',
    licenseOrSerial: 'JD-6110-8834',
    nextServiceHours: 1500,
    status: 'operacional',
    lastMaintenanceDate: new Date(Date.now() - 86400000 * 12).toISOString(),
  },
  {
    id: 'mach-2',
    farmId: 'user-default-1',
    model: 'Pulverizador Jacto Uniport 2530',
    type: 'pulverizador',
    hourMeter: 890,
    manufacturingYear: 2022,
    fuelType: 'Diesel S10',
    licenseOrSerial: 'JAC-UNI-4421',
    nextServiceHours: 1000,
    status: 'operacional',
    lastMaintenanceDate: new Date(Date.now() - 86400000 * 25).toISOString(),
  },
];

export const INITIAL_ACTIVITIES: ActivityLog[] = [
  {
    id: 'act-1',
    farmId: 'user-default-1',
    module: 'lavoura',
    targetName: 'Talhão 01 - Sede',
    actionTitle: 'Início do Plantio de Soja',
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    notes: 'Semeadura concluída com densidade de 14 sementes/metro.',
  },
  {
    id: 'act-2',
    farmId: 'user-default-1',
    module: 'rebanho',
    targetName: 'Lote 01 - Novilhas Nelore',
    actionTitle: 'Manejo Sanitário - Febre Aftosa',
    date: new Date(Date.now() - 86400000 * 18).toISOString(),
    notes: 'Imunização de todas as 85 cabeças do lote sem intercorrências.',
  },
  {
    id: 'act-3',
    farmId: 'user-default-1',
    module: 'maquina',
    targetName: 'Trator John Deere 6110J',
    actionTitle: 'Abastecimento 180 Litros',
    date: new Date(Date.now() - 86400000 * 3).toISOString(),
    notes: 'Diesel S10 abastecido no tanque da fazenda. Horímetro marcado em 1420h.',
  },
];
