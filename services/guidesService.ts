import onboardingTourData from '@/docs/guides/onboarding-tour.json';
import helpResourcesData from '@/docs/guides/help-resources.json';

export interface TourStep {
  id: string;
  title: string;
  content: string;
  target?: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: {
    label: string;
    route?: string;
    onClick?: () => void;
  };
}

export interface HelpResource {
  id: string;
  title: string;
  description: string;
  type: 'manual' | 'video' | 'guide';
  link: string;
  duration?: string;
}

export interface HelpCategory {
  id: string;
  name: string;
  icon: string;
  resources: HelpResource[];
}

class GuidesService {
  /**
   * Get onboarding tour steps
   */
  getOnboardingTour(): TourStep[] {
    return onboardingTourData.steps as TourStep[];
  }

  /**
   * Get all help resources
   */
  getHelpResources(): HelpCategory[] {
    return helpResourcesData.categories as HelpCategory[];
  }

  /**
   * Get help resources by category
   */
  getResourcesByCategory(categoryId: string): HelpResource[] {
    const category = helpResourcesData.categories.find(
      (cat) => cat.id === categoryId
    );
    return category?.resources as HelpResource[] || [];
  }

  /**
   * Get contextual help resources based on current page
   */
  getContextualHelp(contextId: string): HelpResource[] {
    const contextMap: Record<string, string[]> = {
      'dashboard': ['quick-start', 'interface-navigation'],
      'predictions': ['ai-predictions', 'planner-ai-chat'],
      'planner': ['planner-ai-chat', 'global-ai-chat'],
      'health': ['ndvi-satellite', 'drone-operations'],
      'certifications': ['certifications'],
      'irrigation': ['irrigation-system'],
      'nutrition': ['nutrition-treatments'],
      'plants': ['individual-plants'],
      'orchard': ['orchard-management'],
      'olives': ['olive-management'],
      'vineyard': ['vineyard-management'],
      'smart-hub': ['smart-hub', 'automated-diary']
    };

    const resourceIds = contextMap[contextId] || [];
    const allResources = this.getAllResources();
    
    return allResources.filter(resource => 
      resourceIds.includes(resource.id)
    );
  }

  /**
   * Get all resources flattened
   */
  private getAllResources(): HelpResource[] {
    return helpResourcesData.categories.flatMap(
      category => category.resources as HelpResource[]
    );
  }

  /**
   * Search resources
   */
  searchResources(query: string): HelpResource[] {
    const allResources = this.getAllResources();
    const lowerQuery = query.toLowerCase();

    return allResources.filter(resource =>
      resource.title.toLowerCase().includes(lowerQuery) ||
      resource.description.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Check if user has completed onboarding
   */
  hasCompletedOnboarding(): boolean {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('onboarding_completed') === 'true';
  }

  /**
   * Mark onboarding as completed
   */
  completeOnboarding(): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('onboarding_completed', 'true');
    localStorage.setItem('onboarding_completed_at', new Date().toISOString());
  }

  /**
   * Reset onboarding (for testing)
   */
  resetOnboarding(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('onboarding_completed');
    localStorage.removeItem('onboarding_completed_at');
  }

  /**
   * Track help resource view
   */
  trackResourceView(resourceId: string): void {
    if (typeof window === 'undefined') return;
    
    const views = this.getResourceViews();
    views[resourceId] = (views[resourceId] || 0) + 1;
    
    localStorage.setItem('help_resource_views', JSON.stringify(views));
  }

  /**
   * Get resource views
   */
  private getResourceViews(): Record<string, number> {
    if (typeof window === 'undefined') return {};
    
    const viewsStr = localStorage.getItem('help_resource_views');
    return viewsStr ? JSON.parse(viewsStr) : {};
  }

  /**
   * Get most viewed resources
   */
  getMostViewedResources(limit: number = 5): HelpResource[] {
    const views = this.getResourceViews();
    const allResources = this.getAllResources();

    return allResources
      .map(resource => ({
        ...resource,
        views: views[resource.id] || 0
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);
  }
}

export const guidesService = new GuidesService();
