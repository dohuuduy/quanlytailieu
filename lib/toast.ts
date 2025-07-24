// Simple toast utility without complex dependencies
export function showToast(message: string, type: 'success' | 'error' = 'success') {
  // Create toast element
  const toast = document.createElement('div')
  toast.className = `
    fixed top-4 right-4 z-50 min-w-[300px] rounded-lg border p-4 shadow-lg transition-all duration-300
    ${type === 'error' 
      ? 'border-red-200 bg-red-50 text-red-900' 
      : 'border-green-200 bg-green-50 text-green-900'
    }
  `
  
  toast.innerHTML = `
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <h4 class="font-semibold">${type === 'error' ? 'Lỗi' : 'Thành công'}</h4>
        <p class="mt-1 text-sm opacity-90">${message}</p>
      </div>
      <button class="ml-4 rounded-md p-1 hover:bg-gray-100 transition-colors" onclick="this.parentElement.parentElement.remove()">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  `
  
  // Add to DOM
  document.body.appendChild(toast)
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (toast.parentElement) {
      toast.remove()
    }
  }, 5000)
}

// Hook-like function for React components
export function useToast() {
  return {
    toast: ({ title, description, variant }: { 
      title: string
      description?: string
      variant?: 'default' | 'destructive' 
    }) => {
      const message = description || title
      const type = variant === 'destructive' ? 'error' : 'success'
      showToast(message, type)
    }
  }
}