import axios from "axios";
import { Platform } from "react-native";

const defaultHost = Platform.OS === "web" ? "localhost" : "10.0.2.2";
const nodeApiBaseUrl =
  process.env.EXPO_PUBLIC_API_URL ?? `http://${defaultHost}:3001`;
const pythonApiBaseUrl =
  process.env.EXPO_PUBLIC_NLP_API_URL ?? `http://${defaultHost}:8000`;

export const nodeApi = axios.create({
  baseURL: nodeApiBaseUrl,
  validateStatus: () => true,
});

export const pythonApi = axios.create({
  baseURL: pythonApiBaseUrl,
  validateStatus: () => true,
});
