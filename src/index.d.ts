// Type definitions for jlclient-js

export interface InstanceOptions {
  gpu_type?: string;
  template?: string;
  num_gpus?: number;
  num_cpus?: number;
  storage?: number;
  name?: string;
  script_id?: string | null;
  image?: string | null;
  script_args?: string | null;
  is_reserved?: boolean;
  duration?: string;
  http_ports?: string;
  fs_id?: string | null;
}

export interface ResumeOptions {
  storage?: number | null;
  num_cpus?: number | null;
  num_gpus?: number | null;
  gpu_type?: string | null;
  name?: string | null;
  script_id?: string | null;
  script_args?: string | null;
  is_reserved?: boolean | null;
  duration?: string | null;
  fs_id?: string | null;
}

export interface InstanceConstructorParams {
  hdd: number;
  gpu_type: string;
  machine_id: number;
  num_gpus?: number | null;
  num_cpus?: number | null;
  name?: string;
  script_id?: string;
  is_reserved?: boolean;
  url?: string;
  status?: string;
  ssh_str?: string;
  endpoints?: string;
  duration?: string;
  script_args?: string;
  http_ports?: string;
  template?: string;
}

export interface ApiResponse {
  success?: boolean;
  error_message?: string;
  [key: string]: any;
}

export interface ScriptMeta {
  script_id: number;
  script_name: string;
}

export interface Template {
  id: string;
  [key: string]: any;
}

export class InstanceCreationException extends Error {
  constructor(message?: string);
}

export class Instance {
  gpu_type: string;
  num_gpus: number | null;
  num_cpus: number | null;
  hdd: number;
  storage: number;
  name: string;
  machine_id: number;
  script_id: string;
  is_reserved: boolean;
  duration: string;
  script_args: string;
  http_ports: string;
  template: string;
  url: string;
  endpoints: string;
  ssh_str: string;
  status: string;

  constructor(params: InstanceConstructorParams);
  
  pause(): Promise<ApiResponse>;
  destroy(): Promise<ApiResponse>;
  resume(options?: ResumeOptions): Promise<Instance | ApiResponse>;
  toString(): string;
  
  static create(instanceType: string, options?: InstanceOptions): Promise<Instance | ApiResponse>;
  static getInstanceDetails(machineId: number): Promise<any>;
}

export class User {
  static getInstances(): Promise<Instance[]>;
  static getInstance(instanceId: number): Promise<Instance | null>;
  static getTemplates(): Promise<{ templates: string[] }>;
  static getBalance(): Promise<any>;
  static getScripts(): Promise<ScriptMeta[]>;
}

export class FileSystem {
  list(): Promise<any>;
  create(fsName: string, storage: number): Promise<any>;
  delete(fsId: string): Promise<any>;
}

// Token management functions
export function setToken(token: string): void;
export function getToken(): string | null;

// Legacy compatibility
export let token: string | null;

// Default export
declare const _default: {
  setToken: typeof setToken;
  getToken: typeof getToken;
  Instance: typeof Instance;
  User: typeof User;
  FileSystem: typeof FileSystem;
  InstanceCreationException: typeof InstanceCreationException;
  token: string | null;
  default: any;
};

export default _default;