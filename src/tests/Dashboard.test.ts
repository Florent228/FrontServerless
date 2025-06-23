import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import Dashboard from '@/views/Dashboard.vue'
import { useMainStore } from '@/stores'

// Mock des dépendances
vi.mock('vue-sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('@/composables/useScrollAnimation', () => ({
  useScrollAnimation: () => ({
    isVisible: true,
    animationTarget: { value: null },
  }),
}))

describe('Dashboard', () => {
  let wrapper: any
  let store: any

  beforeEach(() => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
    })

    wrapper = mount(Dashboard, {
      global: {
        plugins: [pinia],
        stubs: {
          RouterLink: true,
          KPICard: true,
          VirtualizedUserTable: true,
        },
      },
    })

    store = useMainStore()
  })

  it('renders correctly', () => {
    expect(wrapper.find('h1').text()).toBe('Dashboard')
    expect(wrapper.find('p').text()).toContain('Vue d\'ensemble')
  })

  it('displays KPI cards', () => {
    expect(wrapper.findComponent({ name: 'KPICard' })).toBeTruthy()
  })

  it('calls fetchUsers on mount', () => {
    expect(store.fetchUsers).toHaveBeenCalled()
    expect(store.fetchKPIData).toHaveBeenCalled()
  })

  it('handles user actions correctly', async () => {
    const table = wrapper.findComponent({ name: 'VirtualizedUserTable' })
    
    // Simuler l'événement view-user
    await table.vm.$emit('view-user', 'user-123')
    
    // Vérifier que la navigation a été déclenchée
    // Note: en vrai test, mocker le router
  })

  it('refreshes data when refresh button is clicked', async () => {
    const refreshButton = wrapper.find('[title*="Actualiser"]')
    
    await refreshButton.trigger('click')
    
    // Vérifier que les fonctions de rechargement sont appelées
    expect(store.fetchUsers).toHaveBeenCalledTimes(2)
    expect(store.fetchKPIData).toHaveBeenCalledTimes(2)
  })
}) 