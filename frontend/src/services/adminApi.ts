import api from './api';

export interface UserRow {
  id: string;
  email: string;
  display_name: string;
  department?: string | null;
  title?: string | null;
  azure_oid?: string | null;
  role_id?: string | null;
  is_active: boolean;
  last_login_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface RoleRow {
  id: string;
  label: string;
  description?: string | null;
  created_at: string;
}

export interface AppRow {
  id: string;
  name: string;
  description: string;
  long_description?: string | null;
  category_tag: string;
  icon_name: string;
  gradient_class?: string | null;
  icon_bg_class?: string | null;
  launch_url?: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserOverrideRow {
  id: string;
  user_id: string;
  app_id: string;
  override_type: 'grant' | 'revoke';
  granted_by?: string | null;
  created_at: string;
}

export interface CreateUserPayload {
  email: string;
  display_name: string;
  department?: string | null;
  title?: string | null;
  azure_oid?: string | null;
  role_id?: string | null;
  is_active?: boolean;
}

export interface UpdateUserPayload extends Partial<CreateUserPayload> {}

export interface CreateRolePayload {
  id: string;
  label: string;
  description?: string | null;
}

export interface UpdateRolePayload extends Partial<CreateRolePayload> {}

export interface CreateAppPayload {
  id: string;
  name: string;
  description: string;
  long_description?: string | null;
  category_tag: string;
  icon_name: string;
  gradient_class?: string | null;
  icon_bg_class?: string | null;
  launch_url?: string | null;
  sort_order?: number;
  is_active?: boolean;
}

export interface UpdateAppPayload extends Partial<CreateAppPayload> {}

export interface CreateUserOverridePayload {
  user_id: string;
  app_id: string;
  override_type: 'grant' | 'revoke';
  granted_by?: string | null;
}

export interface UpdateUserOverridePayload extends Partial<CreateUserOverridePayload> {}

export const getUsers = async () => api.get<UserRow[]>('/users').then((res) => res.data);
export const getRoles = async () => api.get<RoleRow[]>('/roles').then((res) => res.data);
export const getApps = async () => api.get<AppRow[]>('/apps').then((res) => res.data);
export const getUserOverrides = async () => api.get<UserOverrideRow[]>('/user_app_overrides').then((res) => res.data);

export const createUser = async (payload: CreateUserPayload) => api.post<UserRow>('/users', payload).then((res) => res.data);
export const updateUser = async (id: string, payload: UpdateUserPayload) => api.put<UserRow>(`/users/${id}`, payload).then((res) => res.data);
export const deleteUser = async (id: string) => api.delete<void>(`/users/${id}`).then((res) => res.data);

export const createRole = async (payload: CreateRolePayload) => api.post<RoleRow>('/roles', payload).then((res) => res.data);
export const updateRole = async (id: string, payload: UpdateRolePayload) => api.put<RoleRow>(`/roles/${id}`, payload).then((res) => res.data);
export const deleteRole = async (id: string) => api.delete<void>(`/roles/${id}`).then((res) => res.data);

export const createApp = async (payload: CreateAppPayload) => api.post<AppRow>('/apps', payload).then((res) => res.data);
export const updateApp = async (id: string, payload: UpdateAppPayload) => api.put<AppRow>(`/apps/${id}`, payload).then((res) => res.data);
export const deleteApp = async (id: string) => api.delete<void>(`/apps/${id}`).then((res) => res.data);

export const createUserOverride = async (payload: CreateUserOverridePayload) => api.post<UserOverrideRow>('/user_app_overrides', payload).then((res) => res.data);
export const updateUserOverride = async (id: string, payload: UpdateUserOverridePayload) => api.put<UserOverrideRow>(`/user_app_overrides/${id}`, payload).then((res) => res.data);
export const deleteUserOverride = async (id: string) => api.delete<void>(`/user_app_overrides/${id}`).then((res) => res.data);

// Playbench LLM Admin API definitions
export interface LlmModelRow {
  id: string;
  provider: string;
  display_name: string;
  description?: string | null;
  context_window_tokens?: number | null;
  is_active: boolean;
  sort_order: number;
  endpoint_url?: string | null;
  model_name?: string | null;
  monthly_limit?: number | null;
  created_at: string;
}

export interface EmployeeAssignmentRow {
  employee_id: string;
  llm_id: string;
  assigned_tokens: number;
  used_tokens: number;
  remaining_tokens: number;
  active: boolean;
  employee_name?: string;
  employee_email?: string;
  llm_name?: string;
  llm_provider?: string;
}

export const getLlmModels = async () => api.get<LlmModelRow[]>('/llm_models').then((res) => res.data);
export const createLlmModel = async (payload: Partial<LlmModelRow>) => api.post<LlmModelRow>('/llm_models', payload).then((res) => res.data);
export const updateLlmModel = async (id: string, payload: Partial<LlmModelRow>) => api.put<LlmModelRow>(`/llm_models/${id}`, payload).then((res) => res.data);
export const deleteLlmModel = async (id: string) => api.delete<void>(`/llm_models/${id}`).then((res) => res.data);

export const getEmployeeAssignments = async () => api.get<EmployeeAssignmentRow[]>('/employee_assignments').then((res) => res.data);
export const createEmployeeAssignment = async (payload: Partial<EmployeeAssignmentRow>) => api.post<EmployeeAssignmentRow>('/employee_assignments', payload).then((res) => res.data);
export const updateEmployeeAssignment = async (employeeId: string, llmId: string, payload: Partial<EmployeeAssignmentRow>) => api.put<EmployeeAssignmentRow>(`/employee_assignments/${employeeId}/${llmId}`, payload).then((res) => res.data);
export const deleteEmployeeAssignment = async (employeeId: string, llmId: string) => api.delete<void>(`/employee_assignments/${employeeId}/${llmId}`).then((res) => res.data);
export const resetEmployeeQuotas = async (employeeId?: string, llmId?: string) => api.post<{ message: string }>('/employee_assignments/reset', null, { params: { employee_id: employeeId, llm_id: llmId } }).then((res) => res.data);

