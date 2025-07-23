export type CarType = 'До 4-х метров' | 'От 4-х метров' | 'Кроссоверы/универсалы' | 'Внедорожники/минивэны'

export interface ServiceStep {
  name: string
  steps: string[]
  prices: { carType: CarType; price: number | string }[]
}

export interface ServicePackage {
  id: number
  title: string
  content: ServiceStep[]
}