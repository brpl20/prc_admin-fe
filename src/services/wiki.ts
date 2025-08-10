import api from './api';

export interface WikiPage {
  id: number;
  title: string;
  slug: string;
  content: string;
  teamId: number;
  createdById: number;
  updatedById: number;
  parentId: number | null;
  position: number;
  isPublished: boolean;
  isLocked: boolean;
  metadata: Record<string, any>;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  fullPath: string;
  parent?: WikiPage;
  children?: WikiPage[];
  categories?: WikiCategory[];
  createdBy?: {
    id: number;
    email: string;
    profileAdmin?: {
      name: string;
    };
  };
  updatedBy?: {
    id: number;
    email: string;
    profileAdmin?: {
      name: string;
    };
  };
}

export interface WikiCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  teamId: number;
  parentId: number | null;
  position: number;
  color: string | null;
  icon: string | null;
  createdAt: string;
  updatedAt: string;
  fullPath: string;
  parent?: WikiCategory;
  children?: WikiCategory[];
}

export interface WikiPageRevision {
  id: number;
  wikiPageId: number;
  title: string;
  content: string;
  versionNumber: number;
  createdById: number;
  changeSummary: string | null;
  diffData: Record<string, any>;
  createdAt: string;
  createdBy?: {
    id: number;
    email: string;
    profileAdmin?: {
      name: string;
    };
  };
}

export interface WikiPageParams {
  title: string;
  content: string;
  slug?: string;
  parentId?: number | null;
  position?: number;
  isPublished?: boolean;
  categoryIds?: number[];
  changeSummary?: string;
}

export interface WikiCategoryParams {
  name: string;
  slug?: string;
  description?: string;
  parentId?: number | null;
  position?: number;
  color?: string;
  icon?: string;
}

class WikiService {
  // Wiki Pages
  async getPages(teamId: number, params?: {
    parentId?: number;
    rootOnly?: boolean;
    publishedOnly?: boolean;
    categoryId?: number;
    search?: string;
  }) {
    const response = await api.get(`/teams/${teamId}/wiki_pages`, { params });
    return response.data;
  }

  async getPage(teamId: number, slug: string) {
    const response = await api.get(`/teams/${teamId}/wiki_pages/${slug}`);
    return response.data;
  }

  async createPage(teamId: number, data: WikiPageParams) {
    // Convert camelCase to snake_case for backend
    const backendData = {
      title: data.title,
      content: data.content,
      slug: data.slug,
      parent_id: data.parentId || null,
      position: data.position,
      is_published: data.isPublished !== undefined ? data.isPublished : true,
      category_ids: data.categoryIds || [],
    };
    
    const response = await api.post(`/teams/${teamId}/wiki_pages`, { wiki_page: backendData });
    return response.data;
  }

  async updatePage(teamId: number, slug: string, data: WikiPageParams) {
    // Convert camelCase to snake_case for backend
    const backendData = {
      title: data.title,
      content: data.content,
      slug: data.slug,
      parent_id: data.parentId,
      position: data.position,
      is_published: data.isPublished,
      category_ids: data.categoryIds || [],
    };
    
    const response = await api.patch(`/teams/${teamId}/wiki_pages/${slug}`, { 
      wiki_page: backendData,
      change_summary: data.changeSummary 
    });
    return response.data;
  }

  async deletePage(teamId: number, slug: string) {
    await api.delete(`/teams/${teamId}/wiki_pages/${slug}`);
  }

  async publishPage(teamId: number, slug: string) {
    const response = await api.post(`/teams/${teamId}/wiki_pages/${slug}/publish`);
    return response.data;
  }

  async unpublishPage(teamId: number, slug: string) {
    const response = await api.post(`/teams/${teamId}/wiki_pages/${slug}/unpublish`);
    return response.data;
  }

  async lockPage(teamId: number, slug: string) {
    const response = await api.post(`/teams/${teamId}/wiki_pages/${slug}/lock`);
    return response.data;
  }

  async unlockPage(teamId: number, slug: string) {
    const response = await api.post(`/teams/${teamId}/wiki_pages/${slug}/unlock`);
    return response.data;
  }

  async getPageRevisions(teamId: number, slug: string) {
    const response = await api.get(`/teams/${teamId}/wiki_pages/${slug}/revisions`);
    return response.data;
  }

  async revertPage(teamId: number, slug: string, versionNumber: number) {
    const response = await api.post(`/teams/${teamId}/wiki_pages/${slug}/revert`, {
      version_number: versionNumber
    });
    return response.data;
  }

  // Wiki Categories
  async getCategories(teamId: number, params?: {
    parentId?: number;
    rootOnly?: boolean;
  }) {
    const response = await api.get(`/teams/${teamId}/wiki_categories`, { params });
    return response.data;
  }

  async getCategory(teamId: number, slug: string) {
    const response = await api.get(`/teams/${teamId}/wiki_categories/${slug}`);
    return response.data;
  }

  async createCategory(teamId: number, data: WikiCategoryParams) {
    // Convert camelCase to snake_case for backend
    const backendData = {
      name: data.name,
      slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      description: data.description || null,
      parent_id: data.parentId || null,
      position: data.position || 0,
      color: data.color || null,
      icon: data.icon || null,
    };
    
    try {
      const response = await api.post(`/teams/${teamId}/wiki_categories`, { wiki_category: backendData });
      return response.data;
    } catch (error: any) {
      // TODO: Backend has a bug in Team#member? method
      // It uses exists?(admin: admin) instead of exists?(admin_id: admin.id)
      // This causes a 500 error. Temporary workaround:
      console.error('Wiki category creation failed:', error);
      console.error('Backend bug: Team#member? method needs fixing');
      throw error;
    }
  }

  async updateCategory(teamId: number, slug: string, data: WikiCategoryParams) {
    // Convert camelCase to snake_case for backend
    const backendData = {
      name: data.name,
      slug: data.slug,
      description: data.description,
      parent_id: data.parentId,
      position: data.position,
      color: data.color,
      icon: data.icon,
    };
    
    const response = await api.patch(`/teams/${teamId}/wiki_categories/${slug}`, { wiki_category: backendData });
    return response.data;
  }

  async deleteCategory(teamId: number, slug: string) {
    await api.delete(`/teams/${teamId}/wiki_categories/${slug}`);
  }
}

export default new WikiService();