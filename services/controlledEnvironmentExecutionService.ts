import type { IStorageProvider } from '@/packages/core/storage/interface';
import type {
  ControlledEnvironmentExecution,
  ControlledEnvironmentObservation,
  ControlledEnvironmentOutcome,
} from '@/types/controlledEnvironment';

type ControlledEnvironmentStorageProvider = IStorageProvider & {
  getControlledEnvironmentExecutions?: (gardenId: string) => Promise<ControlledEnvironmentExecution[]>;
  createControlledEnvironmentExecution?: (
    execution: Omit<ControlledEnvironmentExecution, 'id' | 'createdAt'>
  ) => Promise<ControlledEnvironmentExecution>;
  getControlledEnvironmentObservations?: (gardenId: string) => Promise<ControlledEnvironmentObservation[]>;
  createControlledEnvironmentObservation?: (
    observation: Omit<ControlledEnvironmentObservation, 'id' | 'createdAt'>
  ) => Promise<ControlledEnvironmentObservation>;
  getControlledEnvironmentOutcomes?: (gardenId: string) => Promise<ControlledEnvironmentOutcome[]>;
  createControlledEnvironmentOutcome?: (
    outcome: Omit<ControlledEnvironmentOutcome, 'id' | 'createdAt'>
  ) => Promise<ControlledEnvironmentOutcome>;
};

type CollectionKind = 'executions' | 'observations' | 'outcomes';

const STORAGE_KEY_PREFIX = 'controlled-environment';

export class ControlledEnvironmentExecutionService {
  constructor(private readonly storageProvider?: ControlledEnvironmentStorageProvider) {}

  async getExecutions(gardenId: string): Promise<ControlledEnvironmentExecution[]> {
    if (this.storageProvider?.getControlledEnvironmentExecutions) {
      return this.storageProvider.getControlledEnvironmentExecutions(gardenId);
    }

    const entries = await this.readCollection<ControlledEnvironmentExecution>('executions', gardenId);
    return this.sortByNewest(entries, 'operationDate');
  }

  async createExecution(
    execution: Omit<ControlledEnvironmentExecution, 'id' | 'createdAt'>
  ): Promise<ControlledEnvironmentExecution> {
    if (this.storageProvider?.createControlledEnvironmentExecution) {
      return this.storageProvider.createControlledEnvironmentExecution(execution);
    }

    const created: ControlledEnvironmentExecution = {
      ...execution,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    const entries = await this.readCollection<ControlledEnvironmentExecution>('executions', execution.gardenId);
    entries.push(created);
    await this.writeCollection('executions', execution.gardenId, entries);
    return created;
  }

  async getObservations(gardenId: string): Promise<ControlledEnvironmentObservation[]> {
    if (this.storageProvider?.getControlledEnvironmentObservations) {
      return this.storageProvider.getControlledEnvironmentObservations(gardenId);
    }

    const entries = await this.readCollection<ControlledEnvironmentObservation>('observations', gardenId);
    return this.sortByNewest(entries, 'observedAt');
  }

  async getRecentObservations(
    gardenId: string,
    limit: number = 10
  ): Promise<ControlledEnvironmentObservation[]> {
    const observations = await this.getObservations(gardenId);
    return observations.slice(0, limit);
  }

  async createObservation(
    observation: Omit<ControlledEnvironmentObservation, 'id' | 'createdAt'>
  ): Promise<ControlledEnvironmentObservation> {
    if (this.storageProvider?.createControlledEnvironmentObservation) {
      return this.storageProvider.createControlledEnvironmentObservation(observation);
    }

    const created: ControlledEnvironmentObservation = {
      ...observation,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    const entries = await this.readCollection<ControlledEnvironmentObservation>('observations', observation.gardenId);
    entries.push(created);
    await this.writeCollection('observations', observation.gardenId, entries);
    return created;
  }

  async getOutcomes(gardenId: string): Promise<ControlledEnvironmentOutcome[]> {
    if (this.storageProvider?.getControlledEnvironmentOutcomes) {
      return this.storageProvider.getControlledEnvironmentOutcomes(gardenId);
    }

    const entries = await this.readCollection<ControlledEnvironmentOutcome>('outcomes', gardenId);
    return this.sortByNewest(entries, 'measuredAt');
  }

  async createOutcome(
    outcome: Omit<ControlledEnvironmentOutcome, 'id' | 'createdAt'>
  ): Promise<ControlledEnvironmentOutcome> {
    if (this.storageProvider?.createControlledEnvironmentOutcome) {
      return this.storageProvider.createControlledEnvironmentOutcome(outcome);
    }

    const created: ControlledEnvironmentOutcome = {
      ...outcome,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    const entries = await this.readCollection<ControlledEnvironmentOutcome>('outcomes', outcome.gardenId);
    entries.push(created);
    await this.writeCollection('outcomes', outcome.gardenId, entries);
    return created;
  }

  async getRecentExecutions(
    gardenId: string,
    limit: number = 10
  ): Promise<ControlledEnvironmentExecution[]> {
    const executions = await this.getExecutions(gardenId);
    return executions.slice(0, limit);
  }

  async getLatestSolutionSnapshot(gardenId: string): Promise<Record<string, unknown> | null> {
    const [executions, observations] = await Promise.all([
      this.getRecentExecutions(gardenId, 20),
      this.getRecentObservations(gardenId, 20),
    ]);

    const executionWithSnapshot = executions.find((entry) => {
      return entry.solutionSnapshot && Object.keys(entry.solutionSnapshot).length > 0;
    });
    if (executionWithSnapshot?.solutionSnapshot) {
      return { ...executionWithSnapshot.solutionSnapshot };
    }

    const observationWithPayload = observations.find((entry) => {
      const payload = entry.payload || {};
      return ['ph', 'ec', 'temperatureCelsius', 'dissolvedOxygen', 'ammonia', 'nitrite', 'nitrate'].some(
        (key) => payload[key] !== undefined
      );
    });

    return observationWithPayload?.payload || null;
  }

  private sortByNewest<T>(
    entries: T[],
    dateField: keyof T
  ): T[] {
    return [...entries].sort((a, b) => {
      const aValue = new Date(String((a as any)[dateField] || 0)).getTime();
      const bValue = new Date(String((b as any)[dateField] || 0)).getTime();
      return bValue - aValue;
    });
  }

  private async readCollection<T>(kind: CollectionKind, gardenId: string): Promise<T[]> {
    const key = this.getStorageKey(kind, gardenId);

    if (this.storageProvider?.getUserPreference) {
      const stored = await this.storageProvider.getUserPreference<T[]>(key);
      return Array.isArray(stored) ? stored : [];
    }

    if (typeof window === 'undefined') {
      return [];
    }

    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) {
        return [];
      }

      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch (error) {
      console.error(`Error reading ${kind} collection`, error);
      return [];
    }
  }

  private async writeCollection<T>(kind: CollectionKind, gardenId: string, entries: T[]): Promise<void> {
    const key = this.getStorageKey(kind, gardenId);

    if (this.storageProvider?.setUserPreference) {
      await this.storageProvider.setUserPreference(key, entries);
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(key, JSON.stringify(entries));
  }

  private getStorageKey(kind: CollectionKind, gardenId: string): string {
    return `${STORAGE_KEY_PREFIX}:${kind}:${gardenId}`;
  }
}

export const createControlledEnvironmentExecutionService = (
  storageProvider?: ControlledEnvironmentStorageProvider
) => {
  return new ControlledEnvironmentExecutionService(storageProvider);
};
