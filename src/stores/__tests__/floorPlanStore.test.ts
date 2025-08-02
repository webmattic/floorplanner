import floorPlanStore from '../floorPlanStore';

describe('floorPlanStore', () => {
    beforeEach(() => {
        // Clear store state before each test
        const state = floorPlanStore.getState();
        state.rooms.length = 0;
        state.walls.length = 0;
        state.furniture.length = 0;
    });

    test('should add a room', () => {
        const { addRoom, rooms } = floorPlanStore.getState();
        addRoom({ id: 'room1', x: 0, y: 0, width: 500, height: 400, color: '#ffffff', label: 'Living Room' });
        expect(rooms.find(r => r.id === 'room1')).toBeDefined();
    });

    test('should update a room', () => {
        const { addRoom, updateRoom, rooms } = floorPlanStore.getState();
        addRoom({ id: 'room2', x: 0, y: 0, width: 300, height: 300, color: '#ffffff', label: 'Bedroom' });
        updateRoom('room2', { label: 'Master Bedroom' });
        expect(rooms.find(r => r.id === 'room2')?.label).toBe('Master Bedroom');
    });

    test('should delete a room', () => {
        const { addRoom, removeRoom, rooms } = floorPlanStore.getState();
        addRoom({ id: 'room3', x: 0, y: 0, width: 200, height: 200, color: '#ffffff', label: 'Kitchen' });
        removeRoom('room3');
        expect(rooms.find(r => r.id === 'room3')).toBeUndefined();
    });

    test('should support undo/redo actions', () => {
        const { addRoom, undo, redo, rooms } = floorPlanStore.getState();
        addRoom({ id: 'room4', x: 0, y: 0, width: 100, height: 100, color: '#ffffff', label: 'Bathroom' });
        undo();
        expect(rooms.find(r => r.id === 'room4')).toBeUndefined();
        redo();
        expect(rooms.find(r => r.id === 'room4')).toBeDefined();
    });

    test('should auto-save changes', () => {
        const { addRoom, getAutoSaveState } = floorPlanStore.getState();
        addRoom({ id: 'room5', x: 0, y: 0, width: 250, height: 250, color: '#ffffff', label: 'Office' });
        expect(getAutoSaveState()).toContain('room5');
    });

    test('should handle errors gracefully', () => {
        const { setError, error } = floorPlanStore.getState();
        setError('Test error');
        expect(error).toBe('Test error');
    });

    test('should perform efficiently with large floor plans', () => {
        const { addRoom, rooms } = floorPlanStore.getState();
        for (let i = 0; i < 1000; i++) {
            addRoom({ id: `room${i}`, x: 0, y: 0, width: 100, height: 100, color: '#ffffff', label: `Room ${i}` });
        }
        expect(rooms.length).toBe(1000);
    });
});
