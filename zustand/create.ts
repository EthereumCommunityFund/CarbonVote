import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { } from '@redux-devtools/extension' // required for devtools typing
import { Event } from '@/types'

interface State {
    selectedEvents: Event[]
}

interface FormState {
    addEvent: (event: Event) => void
    removeEvent: (id: number) => void
    resetEvents: () => void
    reset: () => void
}

// define the initial state
const initialState: State = {
    selectedEvents: [],
}

export const useFormStore = create<State & FormState>()(
    devtools(
        persist(
            (set) => ({
                ...initialState,
                addEvent: (event) => set((state) => ({ selectedEvents: [...state.selectedEvents, event] })),
                removeEvent: (id) => set((state) => ({ selectedEvents: state.selectedEvents.filter(event => event.id !== id) })),
                resetEvents: () => set({ selectedEvents: initialState.selectedEvents }),
                reset: () => {
                    set(initialState)
                },
            }),
            {
                name: 'carbon-form',
            },
        ),
    ),
)