import { create } from 'zustand';
import floorPlanStore from '../floorPlanStore';

describe('floorPlanStore', () => {
    beforeEach(() => {
        // Reset store before each test
        floorPlanStore.getState().reset();
    });

    test('should add a room', () => {
        const { addRoom, rooms } = floorPlanStore.getState();
        addRoom({ id: 'room1', name: 'Living Room', dimensions: { width: 500, height: 400 } });
        expect(rooms.find(r => r.id === 'room1')).toBeDefined();
    });

    test('should update a room', () => {
        const { addRoom, updateRoom, rooms } = floorPlanStore.getState();
        addRoom({ id: 'room2', name: 'Bedroom', dimensions: { width: 300, height: 300 } });
        updateRoom('room2', { name: 'Master Bedroom' });
        expect(rooms.find(r => r.id === 'room2')?.name).toBe('Master Bedroom');
    });

    test('should delete a room', () => {
        const { addRoom, deleteRoom, rooms } = floorPlanStore.getState();
        addRoom({ id: 'room3', name: 'Kitchen', dimensions: { width: 200, height: 200 } });
        deleteRoom('room3');
        expect(rooms.find(r => r.id === 'room3')).toBeUndefined();
    });

    test('should support undo/redo actions', () => {
        const { addRoom, undo, redo, rooms } = floorPlanStore.getState();
        addRoom({ id: 'room4', name: 'Bathroom', dimensions: { width: 100, height: 100 } });
        undo();
        expect(rooms.find(r => r.id === 'room4')).toBeUndefined();
        redo();
        expect(rooms.find(r => r.id === 'room4')).toBeDefined();
    });

    test('should auto-save changes', () => {
        const { addRoom, getAutoSaveState } = floorPlanStore.getState();
        addRoom({ id: 'room5', name: 'Office', dimensions: { width: 250, height: 250 } });
        expect(getAutoSaveState()).toContain('room5');
    });

    test('should handle errors gracefully', () => {
        const { addRoom, setError, error } = floorPlanStore.getState();
        setError('Test error');
        expect(error).toBe('Test error');
    });

    test('should perform efficiently with large floor plans', () => {
        const { addRoom, rooms } = floorPlanStore.getState();
        for (let i = 0; i < 1000; i++) {
            addRoom({ id: `room${i}`, name: `Room ${i}`, dimensions: { width: 100, height: 100 } });
        }
        expect(rooms.length).toBe(1000);
    });
});
