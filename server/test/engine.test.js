import assert from "node:assert/strict";
import test from "node:test";
import {
    applyAction,
    createClock,
    createOhmsLawCircuit,
    createRandom,
    createWorld,
    readOhmsLawMeters,
    replay,
    undo,
} from "../../packages/engine/src/index.js";

function initialWorld() {
    return createWorld({
        entities: {
            switch: { closed: false },
            resistor: {},
            meter: {},
        },
    });
}

test("engine replay is deterministic for the same actions", () => {
    const actions = [
        { t: "connect", from: "meter", to: "resistor" },
        { t: "toggle", id: "switch" },
        { t: "set", id: "resistor", prop: "resistance", value: 10 },
        { t: "wait", ms: 500 },
        { t: "record", cell: "row-1", value: "0.2" },
        { t: "plot", x: 0.2, y: 2 },
    ];

    assert.deepEqual(replay(initialWorld(), actions), replay(initialWorld(), actions));
});

test("undo removes the last action by replaying the remaining history", () => {
    const initial = initialWorld();
    const actions = [
        { t: "toggle", id: "switch" },
        { t: "record", cell: "row-1", value: "0.2" },
    ];
    const result = undo(initial, actions);

    assert.deepEqual(result.actions, [actions[0]]);
    assert.equal(result.world.entities.switch.closed, true);
    assert.deepEqual(result.world.records, {});
});

test("named random streams are deterministic and independent", () => {
    const first = createRandom("task-seed");
    const second = createRandom("task-seed");
    const firstCircuit = first("circuit");
    const secondCircuit = second("circuit");
    const firstMechanics = first("mechanics");

    assert.equal(firstCircuit.next(), secondCircuit.next());
    assert.notEqual(firstCircuit.next(), firstMechanics.next());
});

test("clock advances only in fixed steps while running", () => {
    const steps = [];
    const clock = createClock({ stepMs: 100, onStep: (step) => steps.push(step) });

    clock.advance(500);
    assert.equal(clock.elapsedMs, 0);
    clock.start();
    assert.equal(clock.advance(250), 2);
    assert.equal(clock.elapsedMs, 200);
    assert.deepEqual(steps, [100, 100]);
    clock.pause();
    assert.equal(clock.advance(200), 0);
});

test("Ohm's law circuit task generation is deterministic", () => {
    const first = createOhmsLawCircuit("ohms-law-seed");
    const second = createOhmsLawCircuit("ohms-law-seed");

    assert.deepEqual(first.values.task, second.values.task);
    assert.deepEqual(first.entities, second.entities);
});

test("Ohm's law readings stay zero until the switch is closed", () => {
    const circuit = createOhmsLawCircuit("reading-seed");
    const reading = readOhmsLawMeters(circuit);

    assert.deepEqual(reading, {
        current: 0,
        voltage: 0,
        overload: false,
        valid: false,
    });
});

test("Ohm's law circuit reports a valid reading for a correctly wired circuit", () => {
    const circuit = createOhmsLawCircuit("valid-seed");
    const wired = {
        ...circuit,
        entities: {
            ...circuit.entities,
            switch: { ...circuit.entities.switch, closed: true },
        },
        connections: [
            { from: "cells", to: "ammeter" },
            { from: "ammeter", to: "resistor" },
            { from: "resistor", to: "switch" },
            { from: "switch", to: "cells" },
            { from: "voltmeter", to: "resistor" },
            { from: "voltmeter", to: "switch" },
        ],
    };
    const reading = readOhmsLawMeters(wired);
    const repeated = readOhmsLawMeters(wired, { sample: 1 });

    assert.equal(reading.valid, true);
    assert.equal(reading.overload, false);
    assert.ok(reading.current > 0);
    assert.ok(reading.voltage > 0);
    assert.ok(repeated.voltage > 0);
});

test("repeated meter readings are deterministic for a seed and sample index", () => {
    const circuit = createOhmsLawCircuit("measurement-seed");
    const wired = replay(circuit, [
        { t: "connect", from: "cells", to: "ammeter" },
        { t: "connect", from: "ammeter", to: "resistor" },
        { t: "connect", from: "resistor", to: "switch" },
        { t: "connect", from: "switch", to: "cells" },
        { t: "connect", from: "voltmeter", to: "resistor" },
        { t: "connect", from: "voltmeter", to: "switch" },
        { t: "toggle", id: "switch" },
    ]);
    const first = readOhmsLawMeters(wired, { sample: 2 });
    const second = readOhmsLawMeters(wired, { sample: 2 });

    assert.deepEqual(first, second);
});
