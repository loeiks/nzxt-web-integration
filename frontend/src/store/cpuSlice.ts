import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CPUState {
    pcData: { temp: number; usage: number };
    s1Data: { temp: number; usage: number };
    currentSource: 'PC' | 'S1';
}

const initialState: CPUState = {
    pcData: { temp: 0, usage: 0 },
    s1Data: { temp: 0, usage: 0 },
    currentSource: 'S1',
};

const cpuSlice = createSlice({
    name: 'cpu',
    initialState,
    reducers: {
        updatePCData(state, action: PayloadAction<{ temp: number; usage: number }>) {
            const { temp, usage } = action.payload;
            const { pcData } = state;

            if (pcData.temp != temp || pcData.usage != usage) {
                state.pcData = action.payload
            }
        },
        updateS1Data(state, action: PayloadAction<{ temp: number; usage: number }>) {
            const { temp, usage } = action.payload;
            const { s1Data } = state;

            if (s1Data.temp != temp || s1Data.usage != usage) {
                state.s1Data = action.payload
            }
        },
        toggleSource(state) {
            state.currentSource = state.currentSource === 'PC' ? 'S1' : 'PC'
        },
    },
});

export const { updatePCData, updateS1Data, toggleSource } = cpuSlice.actions;
export default cpuSlice.reducer;
