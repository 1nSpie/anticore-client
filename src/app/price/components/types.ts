export interface ServiceStep {
  name: string;
  steps: string[];
}

export interface ServicePackage {
  id: number
  title: string;
  available:boolean;
  icon:any;
  content?: ServiceStep[]
}