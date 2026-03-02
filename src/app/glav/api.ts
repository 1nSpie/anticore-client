import axios from "axios";
import { Brand, Car } from "./type";
import "dotenv/config";

const axiosAgent = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:4444/api",
});

export async function getAllBrand(): Promise<Brand[]> {
  const res = await axiosAgent.get("/cars/brands");
  if (!res.data) {
    throw new Error("Failed to fetch services");
  }

  return res.data;
}

export async function getAllCarWithBrand(
  id: number | undefined
): Promise<Car[]> {
  if (!id) {
    throw new Error("id is not a number");
  }
  const res = await axiosAgent.get(`/brands/${id}`);

  if (!res.data) {
    throw new Error("Failed to fetch services");
  }

  return res.data;
}

export interface SegmentPrice {
  id: number;
  segment: number;
  standartML: number | null;
  standartMLBody: number | null;
  complexML: number | null;
  complexMLBody: number | null;
}

export async function getSegments(): Promise<SegmentPrice[]> {
  const res = await axiosAgent.get<SegmentPrice[]>("/segment");
  return Array.isArray(res.data) ? res.data : [];
}

export interface ApiCar {
  id: number;
  model: string;
  segment: number;
  brandId?: number | null;
  brand?: { id: number; name: string } | null;
}

export async function getCarsBySegment(
  segment: number
): Promise<ApiCar[]> {
  const res = await axiosAgent.get<ApiCar[]>(`/cars/by-segment/${segment}`);
  return Array.isArray(res.data) ? res.data : [];
}
