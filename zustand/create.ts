import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { } from '@redux-devtools/extension' // required for devtools typing
import { Event } from '@/types'

interface FormState {
    selectedEvents: Event[]
    addEvent: (event: Event) => void
    removeEvent: (id: number) => void
    removeAll: () => void
}

export const useFormStore = create<FormState>()(
    devtools(
        persist(
            (set) => ({
                selectedEvents: [],
                addEvent: (event) => set((state) => ({ selectedEvents: [...state.selectedEvents, event] })),
                removeEvent: (id) => set((state) => ({ selectedEvents: state.selectedEvents.filter(event => event.id !== id) })),
                removeAll: () => set({ selectedEvents: [] })
            }),
            {
                name: 'carbon-form',
            },
        ),
    ),
)