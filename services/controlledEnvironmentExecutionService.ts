import type {
  ControlledEnvironmentExecution,
} from '../types/controlledEnvironment';

const STORAGE_KEY = 'ortoControlledEnvironmentExecutions';

type CreateControlledEnvironmentExecutionInput = Omit<
  ControlledEnvironmentExecution,
  'id' | 'createdAt'
>;

const fallbackExecutions: ControlledEnvironmentExecution[] = [];

const generateId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `ce-exec-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const readFallbackExecutions = (): ControlledEnvironmentExecution[] => {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return fallbackExecutions;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed as ControlledEnvironmentExecution[] : [];
  } catch (error) {
    console.error('Error reading controlled environment executions:', error);
    return [];
  }
};

const writeFallbackExecutions = (executions: ControlledEnvironmentExecution[]) => {
  fallbackExecutions.splice(0, fallbackExecutions.length, ...executions);

  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(executions));
  } catch (error) {
    console.error('Error saving controlled environment executions:', error);
  }
};

export class ControlledEnvironmentExecutionService {
  constructor(private readonly storageProvider: any) {}

  async createExecution(
    input: CreateControlledEnvironmentExecutionInput
  ): Promise<ControlledEnvironmentExecution> {
    const execution: ControlledEnvironmentExecution = {
      ...input,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };

    if (typeof this.storageProvider?.createControlledEnvironmentExecution === 'function') {
      const created = await this.storageProvider.createControlledEnvironmentExecution({
        ...execution,
      });

      return {
        ...execution,
        ...created,
      };
    }

    const existing = readFallbackExecutions();
    writeFallbackExecutions([execution, ...existing]);
    return execution;
  }

  async getExecutions(gardenId: string): Promise<ControlledEnvironmentExecution[]> {
    if (typeof this.storageProvider?.getControlledEnvironmentExecutions === 'function') {
      return await this.storageProvider.getControlledEnvironmentExecutions(gardenId);
    }

    return readFallbackExecutions().filter(execution => execution.gardenId === gardenId);
  }
}

export const createControlledEnvironmentExecutionService = (storageProvider: any) => {
  return new ControlledEnvironmentExecutionService(storageProvider);
};
